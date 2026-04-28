import { generateContent, generateSystemPrompt, bufferToBase64 } from '../utils/geminiClient.js';
import { generateComplaintPDF } from '../utils/pdfGenerator.js';
import { addBillToHistory, updateRateCard, getRateCard } from '../utils/historyManager.js';

// Rate tiers for different city types
const RATE_TIERS = {
  TIER_1: { // Mumbai, Delhi, Bangalore, Chennai
    room_private: 4000,
    consultation: 1500,
    icu: 8000,
    mri: 7000,
    desc: "Metro City Rates (High)"
  },
  TIER_2: { // Jaipur, Lucknow, Indore, etc.
    room_private: 2500,
    consultation: 800,
    icu: 5000,
    mri: 4500,
    desc: "Tier-2 City Rates (Moderate)"
  },
  GOVT_SCHEME: { // CGHS / Ayushman
    room_private: 1000,
    consultation: 350,
    icu: 2000,
    mri: 2500,
    desc: "Govt Scheme Rates"
  }
};

// Tier 1 cities
const TIER_1_CITIES = ['mumbai', 'delhi', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'hyderabad', 'pune'];

// Determine city tier based on city name
function getCityTier(cityName) {
  if (!cityName) return RATE_TIERS.TIER_2;
  
  const cityLower = cityName.toLowerCase();
  if (TIER_1_CITIES.some(tier1City => cityLower.includes(tier1City))) {
    return RATE_TIERS.TIER_1;
  }
  return RATE_TIERS.TIER_2;
}

// Get standard price for a service based on city tier and history
async function getStandardPrice(serviceName, cityName, rateCard) {
  const serviceLower = serviceName.toLowerCase();
  
  // Check history first
  if (rateCard[serviceLower]?.averagePrice) {
    return rateCard[serviceLower].averagePrice;
  }
  
  // Fallback to tier-based rates
  const tier = getCityTier(cityName);
  
  // Match service name to rate tier
  if (serviceLower.includes('room') || serviceLower.includes('ward')) {
    return tier.room_private;
  }
  if (serviceLower.includes('consultation') || serviceLower.includes('opd')) {
    return tier.consultation;
  }
  if (serviceLower.includes('icu')) {
    return tier.icu;
  }
  if (serviceLower.includes('mri') || serviceLower.includes('scan')) {
    return tier.mri;
  }
  
  // Default: use consultation rate
  return tier.consultation;
}

// Analyze bill
export async function analyzeBill(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    // Prepare image part for Gemini
    let imagePart;
    if (mimeType.startsWith('image/')) {
      imagePart = {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType: mimeType
        }
      };
    } else if (mimeType === 'application/pdf') {
      imagePart = {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType: mimeType
        }
      };
    }

    // Get rate card from history (for initial context)
    const rateCard = await getRateCard();
    
    // Determine city tier for context (will be updated after analysis)
    const initialCity = req.body.city || ''; // Try to get from request if available
    const tier = getCityTier(initialCity);
    
    // Prepare initial context data (will be refined after first analysis)
    const contextData = {
      hospital_name: '',
      city: initialCity
    };
    
    // Generate forensic audit prompt with context
    const prompt = generateSystemPrompt(contextData, tier);
    
    // Call Gemini 2.5 Flash API (with fallback to 2.5 Flash Lite)
    const text = await generateContent(prompt, imagePart);

    // Clean and parse JSON response
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').trim();
    }
    
    // Extract JSON object if wrapped in text
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const rawAnalysis = JSON.parse(jsonText);
    
    // Transform new format to old format for frontend compatibility
    const analysis = {
      hospital_name: rawAnalysis.hospital_name || '',
      patient_name: rawAnalysis.patient_name || '',
      bill_date: rawAnalysis.bill_date || '',
      city: rawAnalysis.city || '',
      audit_confidence: rawAnalysis.audit_confidence || 'MEDIUM',
      line_items: [],
      total_amount: 0,
      potential_savings: rawAnalysis.total_savings || 0
    };
    
    // Transform items array to line_items format
    if (rawAnalysis.items && Array.isArray(rawAnalysis.items)) {
      analysis.line_items = rawAnalysis.items.map(item => ({
        service: item.name || '',
        quantity: 1, // Default quantity
        price: item.charged_price || 0,
        flagged: item.is_overpriced || false,
        standard_price: item.fair_price || 0,
        savings: item.is_overpriced ? (item.charged_price - item.fair_price) : 0,
        reason: item.reason || ''
      }));
      
      // Calculate total amount
      analysis.total_amount = analysis.line_items.reduce((sum, item) => sum + (item.price || 0), 0);
    } else if (rawAnalysis.line_items && Array.isArray(rawAnalysis.line_items)) {
      // Fallback: if old format is returned, use it directly
      analysis.line_items = rawAnalysis.line_items;
      analysis.total_amount = rawAnalysis.total_amount || analysis.line_items.reduce((sum, item) => sum + (item.price || 0), 0);
      analysis.potential_savings = rawAnalysis.potential_savings || 0;
    } else {
      throw new Error('Invalid response: items or line_items must be an array');
    }
    
    // Ensure all required fields exist
    if (typeof analysis.hospital_name === 'undefined') analysis.hospital_name = '';
    if (typeof analysis.patient_name === 'undefined') analysis.patient_name = '';
    if (typeof analysis.bill_date === 'undefined') analysis.bill_date = '';
    if (typeof analysis.city === 'undefined') analysis.city = '';
    
    // Update tier based on actual city from analysis
    const cityName = analysis.city || '';
    const finalTier = getCityTier(cityName);
    
    // Enhance line items with additional data if missing
    for (const item of analysis.line_items) {
      if (!item.standard_price) {
        const standardPrice = await getStandardPrice(item.service, cityName, rateCard);
        item.standard_price = standardPrice;
      }
      if (item.flagged && !item.savings) {
        item.savings = Math.max(0, (item.price || 0) - (item.standard_price || 0));
      }
      if (!item.quantity) item.quantity = 1;
    }
    
    // Recalculate potential savings if needed
    if (!analysis.potential_savings || analysis.potential_savings === 0) {
      analysis.potential_savings = analysis.line_items
        .filter(item => item.flagged)
        .reduce((sum, item) => sum + (item.savings || 0), 0);
    }
    
    // Add tier information
    analysis.city_tier = finalTier.desc;
    analysis.rate_tier = finalTier;

    // Save to history
    try {
      await addBillToHistory(analysis);
      await updateRateCard(analysis);
    } catch (historyError) {
      console.error('Error saving to history:', historyError);
      // Don't fail the request if history save fails
    }

    // Generate complaint text using LangChain (optional, non-blocking)
    let complaintText = null;
    try {
      const { generateFormalComplaint } = await import('./complaintController.js');
      complaintText = await generateFormalComplaint('', analysis);
    } catch (complaintError) {
      console.error('Error generating complaint during analysis:', complaintError);
      // Don't fail the request if complaint generation fails
    }

    res.json({
      audit: analysis,
      complaintText: complaintText
    });
  } catch (error) {
    console.error('Error analyzing bill:', error);
    
    // Handle specific errors
    if (error.message && (error.message.includes('API key') || error.message.includes('401'))) {
      return res.status(500).json({ 
        error: 'Invalid or missing Gemini API key',
        details: 'Please check your GEMINI_API_KEY in .env file'
      });
    }
    
    if (error.message && error.message.includes('JSON')) {
      return res.status(500).json({ 
        error: 'Failed to parse AI response as JSON',
        details: 'The AI response was not in valid JSON format. Please try again.'
      });
    }

    res.status(500).json({ 
      error: 'Failed to analyze bill', 
      details: error.message 
    });
  }
}

// Generate PDF
export async function generatePdf(req, res) {
  try {
    const { complaint_text, items, total_charged, total_savings, currency } = req.body;

    if (!complaint_text) {
      return res.status(400).json({ error: 'Complaint text is required' });
    }

    const pdfBytes = await generateComplaintPDF({
      complaint_text,
      items,
      total_charged,
      total_savings,
      currency
    });

    // Send PDF as response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="complaint-letter.pdf"');
    res.send(pdfBytes);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF', 
      details: error.message 
    });
  }
}

// Health check
export function healthCheck(req, res) {
  res.json({ status: 'ok', message: 'BillBiopsy API is running' });
}

