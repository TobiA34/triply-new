// Mock OCR service: attempt to extract an amount-like number from an image URI
// In the future, integrate with a real OCR provider (e.g., Google Vision, Tesseract)

export async function extractAmountFromImage(imageUri: string): Promise<number | null> {
  try {
    // Mock: parse number that might be in the filename like ..._23.45.jpg
    const match = imageUri.match(/([0-9]+(?:\.[0-9]{1,2})?)/);
    if (match) {
      const num = parseFloat(match[1]);
      if (Number.isFinite(num)) return Math.round(num * 100) / 100;
    }
    return null;
  } catch {
    return null;
  }
}


