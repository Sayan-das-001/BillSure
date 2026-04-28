import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HISTORY_FILE = path.join(__dirname, '../data/history.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(HISTORY_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read history from file
export async function readHistory() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(HISTORY_FILE, 'utf-8');
    // Handle empty or whitespace-only files
    const trimmedData = data.trim();
    if (!trimmedData) {
      return { bills: [], rateCard: {} };
    }
    return JSON.parse(trimmedData);
  } catch (error) {
    // If file doesn't exist or JSON is invalid, return empty structure
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      // If JSON is invalid, try to fix it by writing a fresh file
      if (error instanceof SyntaxError) {
        console.warn('History file corrupted, resetting to empty structure');
        const emptyHistory = { bills: [], rateCard: {} };
        await writeHistory(emptyHistory);
        return emptyHistory;
      }
      return { bills: [], rateCard: {} };
    }
    throw error;
  }
}

// Write history to file
export async function writeHistory(history) {
  try {
    await ensureDataDir();
    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing history:', error);
    throw error;
  }
}

// Add a new bill to history
export async function addBillToHistory(billData) {
  try {
    const history = await readHistory();
    const billEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      hospital_name: billData.hospital_name || '',
      patient_name: billData.patient_name || '',
      bill_date: billData.bill_date || '',
      city: billData.city || '',
      total_amount: billData.total_amount || 0,
      potential_savings: billData.potential_savings || 0,
      line_items: billData.line_items || []
    };
    
    history.bills.unshift(billEntry); // Add to beginning
    
    // Keep only last 100 bills
    if (history.bills.length > 100) {
      history.bills = history.bills.slice(0, 100);
    }
    
    await writeHistory(history);
    return billEntry;
  } catch (error) {
    console.error('Error adding bill to history:', error);
    throw error;
  }
}

// Update rate card based on bill data
export async function updateRateCard(billData) {
  try {
    const history = await readHistory();
    
    if (!history.rateCard) {
      history.rateCard = {};
    }
    
    // Extract service prices from line items
    billData.line_items?.forEach(item => {
      const serviceName = item.service?.toLowerCase().trim();
      if (serviceName && item.price) {
        if (!history.rateCard[serviceName]) {
          history.rateCard[serviceName] = {
            prices: [],
            lastUpdated: new Date().toISOString()
          };
        }
        
        // Add price to history
        history.rateCard[serviceName].prices.push({
          price: item.price,
          city: billData.city || 'unknown',
          timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 prices per service
        if (history.rateCard[serviceName].prices.length > 50) {
          history.rateCard[serviceName].prices = history.rateCard[serviceName].prices.slice(-50);
        }
        
        // Calculate average price
        const prices = history.rateCard[serviceName].prices.map(p => p.price);
        history.rateCard[serviceName].averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        history.rateCard[serviceName].lastUpdated = new Date().toISOString();
      }
    });
    
    await writeHistory(history);
    return history.rateCard;
  } catch (error) {
    console.error('Error updating rate card:', error);
    throw error;
  }
}

// Get rate card
export async function getRateCard() {
  try {
    const history = await readHistory();
    return history.rateCard || {};
  } catch (error) {
    console.error('Error reading rate card:', error);
    return {};
  }
}

// Get bill history
export async function getBillHistory(limit = 10) {
  try {
    const history = await readHistory();
    return history.bills.slice(0, limit);
  } catch (error) {
    console.error('Error reading bill history:', error);
    return [];
  }
}

