export interface ParsedTransaction {
  amount: number | null;
  notes: string;
  tags: string[];
  categoryHint: string | null;
}

export function parseQuickInput(input: string): ParsedTransaction {
  const result: ParsedTransaction = {
    amount: null,
    notes: '',
    tags: [],
    categoryHint: null,
  };

  if (!input) return result;

  // 1. Extract exact numbers (e.g. 50000, 15.000, 150k)
  const amountRegex = /(?:Rp\s*)?(\d{1,3}(?:[.,]\d{3})*|\d+)(k|m)?/i;
  const amountMatch = input.match(amountRegex);
  
  if (amountMatch) {
    let rawNumberStr = amountMatch[1].replace(/[.,]/g, '');
    let rawNumber = parseInt(rawNumberStr, 10);
    
    // Handle suffixes like 'k' (ribu) or 'm' (juta)
    if (amountMatch[2]) {
      const suffix = amountMatch[2].toLowerCase();
      if (suffix === 'k') rawNumber *= 1000;
      if (suffix === 'm') rawNumber *= 1000000;
    }
    
    result.amount = rawNumber;
    // Remove the amount from the input string for further processing
    input = input.replace(amountMatch[0], '').trim();
  }

  // 2. Extract tags (words starting with #)
  const tagsRegex = /#\w+/g;
  const tagsMatch = input.match(tagsRegex);
  if (tagsMatch) {
    result.tags = tagsMatch;
    // Remove tags from the string
    input = input.replace(tagsRegex, '').trim();
  }

  // 3. Category hints (very basic keyword matching)
  const categoryKeywords = {
    'makan': ['makan', 'jajan', 'minum', 'kopi', 'food', 'snack', 'resto'],
    'transportasi': ['gojek', 'grab', 'bensin', 'tol', 'parkir', 'transport'],
    'belanja': ['belanja', 'supermarket', 'indomaret', 'alfamart', 'kebutuhan'],
    'tagihan': ['listrik', 'air', 'internet', 'indihome', 'tagihan', 'kos', 'sewa'],
  };

  const lowerInput = input.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerInput.includes(keyword))) {
      result.categoryHint = category;
      break;
    }
  }

  // 4. The rest is notes
  result.notes = input.replace(/\s+/g, ' ').trim();

  return result;
}
