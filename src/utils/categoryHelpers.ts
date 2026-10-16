import { Category } from '../types';

/**
 * Standard predefined acronym dictionary based on PLN Corporate University standards
 */
export const KNOWN_CATEGORY_ABBRS: Record<string, string> = {
  'jaringan dan internet': 'JAIT',
  'perangkat keras': 'PEKE',
  'perangkat lunak': 'PELU',
  'akun dan hak akses': 'ADHA',
  'aplikasi internal': 'APIN',
  'sistem pembelajaran (hsms)': 'SIPH',
  'sistem pembelajaran (lms)': 'SIPH',
  'sistem pembelajaran': 'SIPH',
  'kelas dan fasilitas pelatihan': 'KEFA',
  'sarana dan prasarana': 'SADA',
  'administrasi diklat': 'ADDI',
  'permintaan layanan lainnya': 'PLLY',
};

/**
 * Indonesian stop words often skipped or specifically handled in abbreviations
 */
const STOP_WORDS = new Set(['dan', 'atau', 'pada', 'di', 'ke', 'dari', 'untuk', 'yang', '&']);

/**
 * Generates a 4-capital-letter abbreviation (XXXX) from category name automatically.
 * Rule:
 * 1. Checks known dictionary first.
 * 2. If name has parentheses acronym e.g. "Sistem Pembelajaran (HSMS)" -> handles smart combination.
 * 3. 4 words (e.g. "Akun dan Hak Akses"): takes first letter of each word -> A-D-H-A = ADHA.
 * 4. 2 words (e.g. "Perangkat Keras", "Aplikasi Internal"): 2 letters of word 1 + 2 letters of word 2 -> PE+KE = PEKE, AP+IN = APIN.
 * 5. 3 words:
 *    - With stop word in middle (e.g. "Jaringan dan Internet"): ignores stop word -> JA + IT = JAIT.
 *    - "Sarana dan Prasarana" -> SA + D + A = SADA.
 *    - 3 content words (e.g. "Permintaan Layanan Lainnya"): 1st letter + 1st letter + 2 letters of 3rd word -> P + L + LY = PLLY.
 * 6. Multi-word with stop words (e.g. "Kelas dan Fasilitas Pelatihan"): 2 letters of 1st + 2 letters of 3rd -> KE + FA = KEFA.
 * 7. Single word: takes first 4 letters (padded with 'X' if < 4).
 */
export function generateCategoryAbbreviation(categoryName: string): string {
  if (!categoryName || !categoryName.trim()) {
    return 'KATG';
  }

  const rawClean = categoryName.trim().toLowerCase();

  // 1. Check known mappings
  if (KNOWN_CATEGORY_ABBRS[rawClean]) {
    return KNOWN_CATEGORY_ABBRS[rawClean];
  }

  // Remove content in parentheses if it has standard acronym or check if it's special
  const parenMatch = categoryName.match(/\(([^)]+)\)/);
  const acronymInParen = parenMatch ? parenMatch[1].trim() : '';

  // Clean string: remove punctuation except spaces
  const textWithoutParen = categoryName.replace(/\([^)]*\)/g, ' ').trim();
  const cleanedText = textWithoutParen.replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleanedText.split(' ').filter(Boolean);

  if (words.length === 0) {
    return 'KATG';
  }

  // If acronym in parentheses is 4 letters and uppercase, e.g. (HSMS)
  if (acronymInParen && acronymInParen.length === 4 && /^[a-zA-Z]+$/.test(acronymInParen)) {
    // If it's pure acronym
    if (words.length <= 1) {
      return acronymInParen.toUpperCase();
    }
  }

  // If there's an acronym in paren like HSMS and words like "Sistem Pembelajaran" -> SI + P + H = SIPH
  if (acronymInParen && words.length >= 2) {
    const w1 = words[0];
    const w2 = words[1];
    const parenLetter = acronymInParen.charAt(0);
    const candidate = `${w1.substring(0, 2)}${w2.charAt(0)}${parenLetter}`.toUpperCase();
    if (candidate.length === 4) return candidate;
  }

  // Case: exactly 4 words (e.g., "Akun dan Hak Akses") -> A, D, H, A
  if (words.length === 4) {
    const abbr = words.map((w) => w.charAt(0)).join('').toUpperCase();
    if (abbr.length === 4) return abbr;
  }

  // Filter stop words to find significant words
  const significantWords = words.filter((w) => !STOP_WORDS.has(w.toLowerCase()));

  // If 2 significant words (e.g. "Perangkat Keras", "Jaringan dan Internet" where 'dan' was removed)
  if (significantWords.length === 2) {
    const w1 = significantWords[0];
    const w2 = significantWords[1];
    const part1 = (w1.length >= 2 ? w1.substring(0, 2) : w1.padEnd(2, 'X')).toUpperCase();
    const part2 = (w2.length >= 2 ? w2.substring(0, 2) : w2.padEnd(2, 'X')).toUpperCase();
    return `${part1}${part2}`;
  }

  // If 3 significant words (e.g. "Permintaan Layanan Lainnya")
  if (significantWords.length === 3) {
    const w1 = significantWords[0].charAt(0);
    const w2 = significantWords[1].charAt(0);
    const w3 = significantWords[2].length >= 2 ? significantWords[2].substring(0, 2) : significantWords[2].padEnd(2, 'X');
    return `${w1}${w2}${w3}`.toUpperCase();
  }

  // If more than 3 significant words (e.g. "Kelas Fasilitas Pelatihan Bersama")
  if (significantWords.length >= 4) {
    return significantWords.slice(0, 4).map((w) => w.charAt(0)).join('').toUpperCase();
  }

  // Single significant word (e.g. "Infrastruktur")
  if (significantWords.length === 1) {
    const word = significantWords[0];
    if (word.length >= 4) {
      return word.substring(0, 4).toUpperCase();
    }
    return word.padEnd(4, 'X').toUpperCase();
  }

  // Fallback to taking letters from raw words
  let fallback = '';
  for (const w of words) {
    fallback += w.charAt(0);
  }
  if (fallback.length < 4) {
    fallback = (fallback + (words[0] || 'KATG')).substring(0, 4);
  }
  return fallback.substring(0, 4).padEnd(4, 'X').toUpperCase();
}

/**
 * Parses an existing category code into its components.
 * Returns null if format does not match #XXXX-YYYY-NNN
 */
export function parseCategoryCode(code: string): {
  prefix: string;
  abbr: string;
  year: number;
  seq: number;
  raw: string;
} | null {
  if (!code) return null;
  const match = code.trim().match(/^#([A-Z0-9]{4})-(\d{4})-(\d{3})$/);
  if (!match) return null;

  return {
    prefix: '#',
    abbr: match[1],
    year: parseInt(match[2], 10),
    seq: parseInt(match[3], 10),
    raw: code.trim(),
  };
}

/**
 * Formats components into the standard category code: #XXXX-YYYY-NNN
 */
export function formatCategoryCode(abbr: string, year: number, seq: number): string {
  const cleanAbbr = (abbr || 'KATG')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 4)
    .padEnd(4, 'X');

  const paddedSeq = Math.max(1, Math.min(999, seq)).toString().padStart(3, '0');
  const validYear = year && year > 2000 ? year : new Date().getFullYear();

  return `#${cleanAbbr}-${validYear}-${paddedSeq}`;
}

/**
 * Calculates the next available 3-digit sequence number for a given year.
 * Ensures no duplicates exist in that year.
 */
export function getNextCategorySequence(existingCategories: Category[], year: number): number {
  let maxSeq = 0;

  for (const cat of existingCategories) {
    if (!cat.code) continue;
    const parsed = parseCategoryCode(cat.code);
    if (parsed && parsed.year === year) {
      if (parsed.seq > maxSeq) {
        maxSeq = parsed.seq;
      }
    }
  }

  // If no category found for this year, check if there are any codes with 3-digit numbers globally
  if (maxSeq === 0) {
    for (const cat of existingCategories) {
      if (!cat.code) continue;
      const parsed = parseCategoryCode(cat.code);
      if (parsed && parsed.seq > maxSeq) {
        maxSeq = parsed.seq;
      }
    }
  }

  return maxSeq + 1;
}

/**
 * Automatically creates a full category code for a new category.
 */
export function generateNextCategoryCode(
  categoryName: string,
  existingCategories: Category[],
  customAbbr?: string,
  year?: number
): string {
  const currentYear = year || new Date().getFullYear();
  const abbr = customAbbr && customAbbr.trim()
    ? customAbbr.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4).padEnd(4, 'X')
    : generateCategoryAbbreviation(categoryName);

  const nextSeq = getNextCategorySequence(existingCategories, currentYear);
  return formatCategoryCode(abbr, currentYear, nextSeq);
}

/**
 * Predefined static mapping of initial categories to maintain identical codes requested by user.
 */
export const INITIAL_PREDEFINED_CODES: Record<string, string> = {
  'cat-net': '#JAIT-2026-001',
  'cat-hw': '#PEKE-2026-002',
  'cat-sw': '#PELU-2026-003',
  'cat-acc': '#ADHA-2026-004',
  'cat-app': '#APIN-2026-005',
  'cat-lms': '#SIPH-2026-006',
  'cat-cls': '#KEFA-2026-007',
  'cat-srp': '#SADA-2026-008',
  'cat-adm': '#ADDI-2026-009',
  'cat-oth': '#PLLY-2026-010',
};
