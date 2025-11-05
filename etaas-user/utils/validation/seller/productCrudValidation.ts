export const validateProductName = (name: string) => {
  const invalidCharsRegex = /[^A-Za-z0-9\s\-&]/; // Only letters, numbers, spaces, -, &
  const repeatedCharRegex = /(.)\1{3,}/; // Repeated 4 or more same chars
  const maxLength = 100;
  const minLength = 3;

  if (!name || !name.trim()) return "Product name is required.";

  const trimmedName = name.trim();

  if (invalidCharsRegex.test(trimmedName))
    return "Product name contains invalid characters.";

  if (trimmedName.length < minLength)
    return `Product name must be at least ${minLength} characters long.`;

  if (trimmedName.length > maxLength)
    return `Product name must be at most ${maxLength} characters long.`;

  if (repeatedCharRegex.test(trimmedName))
    return "Product name must not contain long repeated characters.";


};

export const validateDescription = (description: string) => {
  if (!description || !description.trim())
    return "Description is required.";

  const trimmedDesc = description.trim();
  const minLength = 10;
  const maxLength = 1000;

  // Disallow potentially dangerous or unreadable input
  const invalidCharsRegex = /[<>={}[\]^$#@*]/;
  const repeatedCharRegex = /(.)\1{4,}/; // Same char repeated 5+ times

  if (trimmedDesc.length < minLength)
    return `Description must be at least ${minLength} characters long.`;

  if (trimmedDesc.length > maxLength)
    return `Description must be at most ${maxLength} characters long.`;

  if (invalidCharsRegex.test(trimmedDesc))
    return "Description contains invalid or unsafe characters.";

  if (repeatedCharRegex.test(trimmedDesc))
    return "Description must not contain long repeated characters.";

  // Optional: basic readability check
  const wordCount = trimmedDesc.split(/\s+/).length;
  if (wordCount < 3)
    return "Please provide a more detailed description.";

  return "";
};



export const validatePrice = (price: number | string) => {
  if (price === undefined || price === null || price === "")
    return "Price is required.";

  const priceStr = String(price).trim();

  // Reject malformed numbers like "0.0.23" or "10..5"
  const validFormatRegex = /^\d+(\.\d{1,2})?$/;

  if (!validFormatRegex.test(priceStr))
    return "Enter a valid price format (e.g., 99 or 99.99).";

  const num = Number(priceStr);

  if (isNaN(num)) return "Price must be a valid number.";
  if (num <= 0) return "Price must be greater than 0.";
  if (num > 1_000_000) return "Price is too high.";

};


export const validateStock = (stock: number | string) => {
  if (stock === undefined || stock === null || stock === "")
    return "Stock quantity is required.";

  const stockStr = String(stock).trim();

  // Strict integer pattern (no decimals, no weird chars)
  const validIntegerRegex = /^\d+$/;

  if (!validIntegerRegex.test(stockStr))
    return "Stock must be a whole number.";

  const num = Number(stockStr);

  if (isNaN(num)) return "Stock must be a valid number.";
  if (num < 0) return "Stock cannot be negative.";
  if (num > 1_000_000) return "Stock value is unrealistically high.";

};
