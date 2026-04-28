import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini AI with Gemini 2.5 Flash (primary) and 2.5 Flash Lite (fallback)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model25Flash = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const model25FlashLite = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

// Generate system prompt with context data
export function generateSystemPrompt(contextData, selectedRates) {
  return `SYSTEM ROLE:
You are a FORENSIC MEDICAL BILL AUDITOR for Indian hospitals.
You work for patients, not hospitals.
Your success is measured by how accurately you DETECT OVERCHARGING.

DEFAULT ASSUMPTION:
Hospitals frequently inflate prices.
If there is uncertainty, you must FLAG the item, not approve it.

CONTEXT:
Hospital Name: ${contextData.hospital_name || 'Not specified'}
City: ${contextData.city || 'Not specified'}
Pricing Tier: ${selectedRates.desc || 'Standard'}

MAXIMUM FAIR PRICE LIMITS (HARD CAPS):
- Private Room Rent (per day): ₹${selectedRates.room_private}
- ICU Charges (per day): ₹${selectedRates.icu}
- Doctor Consultation: ₹${selectedRates.consultation}
- MRI / CT Scan: ₹${selectedRates.mri}

STRICT AUDIT RULES (NO EXCEPTIONS):
1. If charged price > 120% of fair price → MARK AS OVERPRICED.
2. If medical equipment, monitor, oxygen, or consumables are charged separately → MARK AS SUSPICIOUS.
3. If an item is not listed above:
   - Estimate a conservative fair Indian market price (2024–2025).
   - Do NOT justify hospital pricing.
4. If unsure → MARK AS SUSPICIOUS.
5. It is NOT allowed to mark all items as "OK".
6. At least ONE item must be flagged unless prices are clearly BELOW benchmarks.

CRITICAL: Output ONLY valid JSON. No markdown, no explanations, no code blocks. Start directly with { and end with }.

STEP 1: Extract basic information:
- hospital_name: Name of the hospital/clinic (string, empty if not found)
- patient_name: Patient name if visible (string, empty if not found)
- bill_date: Date in YYYY-MM-DD format or original format from bill (string)
- city: City name if visible (string, empty if not found)

STEP 2: Extract and audit all line items:
For each service/item on the bill, create an entry with:
- name: Exact service/item name from bill (string)
- charged_price: Price charged by hospital (number, no currency symbols)
- fair_price: Conservative fair Indian market price estimate (number)
- is_overpriced: true if charged_price > 120% of fair_price OR suspicious, else false
- reason: Short audit explanation (string, e.g., "Charged ₹5000, fair price ₹2000", "Suspicious separate charge for consumables")

STEP 3: Calculate totals:
- total_savings: Sum of (charged_price - fair_price) for all overpriced items (number)
- audit_confidence: "HIGH" if clear evidence, "MEDIUM" if some uncertainty, "LOW" if limited data (string)

OUTPUT FORMAT (STRICT JSON ONLY — NO TEXT):
{
  "hospital_name": "",
  "patient_name": "",
  "bill_date": "",
  "city": "",
  "items": [
    {
      "name": "",
      "charged_price": 0,
      "fair_price": 0,
      "is_overpriced": false,
      "reason": ""
    }
  ],
  "total_savings": 0,
  "audit_confidence": "HIGH"
}`;
}

// Legacy system prompt for backward compatibility (if needed)
export const SYSTEM_PROMPT = `You are a medical bill analysis expert. Analyze the hospital bill image/PDF and extract structured data.

CRITICAL: Output ONLY valid JSON. No markdown, no explanations, no code blocks. Start directly with { and end with }.

STEP 1: Extract basic information:
- hospital_name: Name of the hospital/clinic (string, empty if not found)
- patient_name: Patient name if visible (string, empty if not found)
- bill_date: Date in YYYY-MM-DD format or original format from bill (string)
- city: City name if visible (string, empty if not found)

STEP 2: Extract all line items:
For each service/item on the bill, create an entry with:
- service: Exact service/item name from bill (string)
- quantity: Number of units (number, default 1 if not specified)
- price: Price per unit or total for that line (number, no currency symbols)
- flagged: true if price seems unusually high OR if duplicate service detected, else false

STEP 3: Calculate totals:
- total_amount: Sum of all line item prices (number)
- potential_savings: Estimated savings if flagged items are corrected (number, 0 if none flagged)

FLAGGING RULES:
- Flag if price is 2x or more than typical Indian market rate for that service
- Flag if same service appears multiple times with same date/time (duplicate)
- Flag if quantity seems incorrect (e.g., 10x normal usage)
- Be conservative - only flag clear overcharges

OUTPUT FORMAT (JSON only, no markdown):
{
  "hospital_name": "",
  "patient_name": "",
  "bill_date": "",
  "city": "",
  "line_items": [
    {
      "service": "",
      "quantity": 0,
      "price": 0,
      "flagged": false
    }
  ],
  "total_amount": 0,
  "potential_savings": 0
}`;

// Helper function to check if error is retryable (404, quota, model errors)
function isRetryableError(error) {
  const errorMessage = error.message?.toLowerCase() || '';
  const errorString = JSON.stringify(error).toLowerCase();
  
  return (
    errorMessage.includes('404') ||
    errorMessage.includes('429') ||
    errorMessage.includes('quota') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('resource exhausted') ||
    errorMessage.includes('model not found') ||
    errorString.includes('404') ||
    errorString.includes('429') ||
    errorString.includes('quota') ||
    errorString.includes('rate limit') ||
    errorString.includes('resource exhausted')
  );
}

// Generate content with automatic fallback from 2.5 Flash to 2.5 Flash Lite
export async function generateContent(prompt, imagePart) {
  try {
    // Try Gemini 2.5 Flash first
    const content = imagePart ? [prompt, imagePart] : [prompt];
    const result = await model25Flash.generateContent(content);
    const response = await result.response;
    return response.text();
  } catch (error) {
    // Check if error is retryable (404, quota, model errors)
    if (isRetryableError(error)) {
      console.log('⚠️  Gemini 2.5 Flash unavailable. Falling back to Gemini 2.5 Flash Lite...');
      
      try {
        // Fallback to Gemini 2.5 Flash Lite
        const content = imagePart ? [prompt, imagePart] : [prompt];
        const result = await model25FlashLite.generateContent(content);
        const response = await result.response;
        console.log('✅ Successfully used Gemini 2.5 Flash Lite fallback');
        return response.text();
      } catch (fallbackError) {
        console.error('❌ Both models failed. Fallback error:', fallbackError.message);
        throw new Error(`Both Gemini models failed. Primary: ${error.message}, Fallback: ${fallbackError.message}`);
      }
    } else {
      // Non-retryable error (e.g., invalid API key, malformed request)
      throw error;
    }
  }
}

// Helper function to convert buffer to base64
export function bufferToBase64(buffer, mimeType) {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

