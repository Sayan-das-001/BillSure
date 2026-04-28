import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Helper function to wrap text
function wrapText(text, maxWidth, fontSize, font) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// Generate complaint PDF
export async function generateComplaintPDF(data) {
  const { complaint_text, items, total_charged, total_savings, currency } = data;

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  let yPosition = page.getHeight() - margin;
  const lineHeight = 20;
  const fontSize = 12;

  // Title
  page.drawText('FORMAL COMPLAINT - MEDICAL BILL OVERCHARGING', {
    x: margin,
    y: yPosition,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= lineHeight * 2;

  // Date
  const today = new Date().toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  page.drawText(`Date: ${today}`, {
    x: margin,
    y: yPosition,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
  yPosition -= lineHeight * 2;

  // Complaint text (wrap text)
  const complaintLines = wrapText(complaint_text, 495, fontSize, font);
  for (const line of complaintLines) {
    if (yPosition < margin + 50) {
      // Add new page if needed
      const newPage = pdfDoc.addPage([595, 842]);
      yPosition = newPage.getHeight() - margin;
    }
    page.drawText(line, {
      x: margin,
      y: yPosition,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight;
  }

  yPosition -= lineHeight;

  // Summary section
  if (items && total_charged !== undefined && total_savings !== undefined) {
    yPosition -= lineHeight;
    page.drawText('Bill Summary:', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight * 1.5;

    page.drawText(`Total Charged: ${currency || 'INR'} ${total_charged.toFixed(2)}`, {
      x: margin,
      y: yPosition,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight;

    page.drawText(`Total Potential Savings: ${currency || 'INR'} ${total_savings.toFixed(2)}`, {
      x: margin,
      y: yPosition,
      size: fontSize,
      font: boldFont,
      color: rgb(0.8, 0, 0),
    });
    yPosition -= lineHeight * 2;

    // Overpriced items list
    const overpricedItems = items.filter(item => item.is_overpriced);
    if (overpricedItems.length > 0) {
      page.drawText('Overpriced Items:', {
        x: margin,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= lineHeight * 1.5;

      for (const item of overpricedItems.slice(0, 10)) { // Limit to 10 items
        if (yPosition < margin + 50) {
          const newPage = pdfDoc.addPage([595, 842]);
          yPosition = newPage.getHeight() - margin;
        }
        const itemText = `• ${item.name}: Charged ${currency || 'INR'} ${item.charged_price.toFixed(2)} (Standard: ${currency || 'INR'} ${item.standard_price.toFixed(2)})`;
        const itemLines = wrapText(itemText, 495, fontSize - 1, font);
        for (const line of itemLines) {
          page.drawText(line, {
            x: margin + 10,
            y: yPosition,
            size: fontSize - 1,
            font: font,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight * 0.9;
        }
      }
    }
  }

  // Serialize PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

