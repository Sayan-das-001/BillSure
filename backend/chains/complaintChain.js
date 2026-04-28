import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama-3.1-8b-instant',
  temperature: 0, // 🔒 
});

const complaintTemplate = `You are a legal medical complaint writer for Indian patients.

TASK:
- Generate a FORMAL LEGAL MEDICAL COMPLAINT in plain text ONLY. No markdown, no emojis, no JSON, no code blocks.

CONDITIONS:
1. If ALL billed items are correctly priced (no overpriced items), respond with exactly:
   "All charges are verified. No complaint is necessary."
2. If ANY item is overpriced or flagged, generate a complaint.

PATIENT NAME:
{patient_name}

PATIENT VOICE INPUT (optional):
{spoken_text}

AUDIT RESULTS:
Hospital: {hospital_name}
City: {city}
Bill Date: {bill_date}
Total Amount: ₹{total_amount}
Potential Savings: ₹{total_savings}

Overpriced Items:
{overpriced_items}

REQUIREMENTS IF COMPLAINT IS NEEDED:
- Use a polite but firm legal tone.
- Address: Hospital Administration / District Consumer Forum.
- Start with: "From: {patient_name}"
- Mention OVERCHARGING explicitly.
- Include PATIENT GRIEVANCE.
- Request REFUND / INVESTIGATION.
- List specific overpriced items.
- Include PATIENT VOICE input if provided.
- End with: "Yours faithfully,\n{patient_name}"

OUTPUT RULE:
- Only plain text.
- If no complaint is needed, return only:
  "All charges are verified. No complaint is necessary."
- NEVER use placeholders like [Patient's Name] or Patient Name. Always use the exact patient_name provided.`;

const prompt = PromptTemplate.fromTemplate(complaintTemplate);
const complaintChain = RunnableSequence.from([prompt, model]);

export async function generateComplaintWithLangChain(
  hospital_name,
  city,
  bill_date,
  total_amount,
  total_savings,
  overpriced_items,
  patient_name,
  spoken_text = ''
) {
  try {
    const validatedPatientName = (patient_name && typeof patient_name === 'string' && patient_name.trim()) 
      ? patient_name.trim() 
      : 'Patient Name Not Available';

    const overpricedItemsArray = Array.isArray(overpriced_items) ? overpriced_items : [];
    const overpricedItemsText = overpricedItemsArray.length > 0
      ? overpricedItemsArray.map(item => {
          const service = item.service || item.name || 'Unknown service';
          const price = item.price || item.charged || 0;
          const standardPrice = item.standard_price || item.fair_price || Math.round(price * 0.7);
          return `- ${service}: Charged ₹${price}, Fair Price ₹${standardPrice}`;
        }).join('\n')
      : 'No overpriced items found. All charges are correctly priced.';

    const result = await complaintChain.invoke({
      hospital_name: hospital_name || 'Not specified',
      city: city || 'Not specified',
      bill_date: bill_date || 'Not specified',
      total_amount: total_amount || 0,
      total_savings: total_savings || 0,
      overpriced_items: overpricedItemsText,
      patient_name: validatedPatientName,
      spoken_text: spoken_text || 'No voice input provided',
    });

    let complaintText = result?.content?.trim() || result?.text?.trim() || '';
    
    if (complaintText && !complaintText.includes('All charges are verified')) {
      complaintText = complaintText.replace(/\{patient_name\}/g, validatedPatientName);
      complaintText = complaintText.replace(/\[Patient'?s? Name\]/gi, validatedPatientName);
      
      const fromPattern = /^From:\s*[^\n]+\n/i;
      if (!fromPattern.test(complaintText)) {
        complaintText = `From: ${validatedPatientName}\n\n${complaintText}`;
      } else {
        complaintText = complaintText.replace(/^From:\s*[^\n]+/i, `From: ${validatedPatientName}`);
      }
      
      const faithfullyPattern = /Yours\s+faithfully,?\s*\n\s*[^\n]+/i;
      if (!faithfullyPattern.test(complaintText)) {
        complaintText = `${complaintText}\n\nYours faithfully,\n${validatedPatientName}`;
      } else {
        complaintText = complaintText.replace(/Yours\s+faithfully,?\s*\n\s*[^\n]+/i, `Yours faithfully,\n${validatedPatientName}`);
      }
    }

    return complaintText;
  } catch (error) {
    console.error('LangChain complaint generation error:', error);
    throw new Error('Failed to generate complaint with LangChain');
  }
}
