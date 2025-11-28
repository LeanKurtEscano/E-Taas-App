export const validateCategoryName = (
  categoryName: string,
  existingCategories: string[] = []
) => {
  const trimmedName = categoryName.trim();

  if (!trimmedName) return "Category name is required.";

  // Only letters, numbers, spaces, -, &
  if (!/^[A-Za-z0-9\s\-&]+$/.test(trimmedName))
    return "Category name contains invalid characters. Only letters, numbers, spaces, -, & are allowed.";

  // Length limits
  if (trimmedName.length < 2) return "Category name must be at least 2 characters long.";
  if (trimmedName.length > 20) return "Category name must be at most 20 characters long.";

  // Check if name already exists
  if (existingCategories.includes(trimmedName)) return "Category name already exists.";

  // Too many consecutive letters (aaaa, bbbb)
  if (/(.)\1{3,}/i.test(trimmedName))
    return "Category name has too many repeated letters in a row.";

  // Single repeated letter name (aaaa, ssss)
  if (/^[a-zA-Z]{4,}$/i.test(trimmedName) && new Set(trimmedName.toLowerCase()).size === 1)
    return "Category name cannot be a single repeated letter.";

  // Repeated sequence detection (ababab, xyzxyz)
  if (/(\w{2,5})\1{1,}/i.test(trimmedName))
    return `Category name contains repeated sequences like "${trimmedName.match(/(\w{2,5})\1{1,}/i)?.[0]}".`;

  // No problems
  return;
};

export const validateCategoryValues = (categoryValues: string) => {
  const valuesArray = categoryValues
    .split(',')
    .map(v => v.trim())
    .filter(v => v); // remove empty values

  const count = valuesArray.length;

  // At least 1 value
  if (count === 0) return "Please enter at least one value (comma-separated)";

  // Max 20 values
  if (count > 20) return `Too many values. Maximum allowed is 20, but you entered ${count}.`;

  for (let value of valuesArray) {
    // Invalid characters
    if (!/^[A-Za-z0-9\s\-&]+$/.test(value)) 
      return `Value "${value}" contains invalid characters.`;

    // Max length 30
    if (value.length > 30) 
      return `Value "${value}" is too long. Max 30 characters.`;

    // Too many consecutive letters (aaaa, bbbb)
    if (/(.)\1{3,}/i.test(value)) 
      return `Value "${value}" has too many repeated letters in a row.`;

    // Single-letter repeated values (aaaa, ssss)
    if (/^[a-zA-Z]{4,}$/i.test(value) && new Set(value.toLowerCase()).size === 1)
      return `Value "${value}" cannot be a single repeated letter.`;

    // Repeated sequence detection (ababab, xyzxyz)
    // Matches any sequence of 2-5 characters repeated consecutively
    if (/(\w{2,5})\1{1,}/i.test(value))
      return `Value "${value}" contains repeated sequences like "${value.match(/(\w{2,5})\1{1,}/i)?.[0]}".`;
  }

  // Check for duplicates
  const duplicates = valuesArray.filter((v, i) => valuesArray.indexOf(v) !== i);
  if (duplicates.length > 0) return `Duplicate values found: ${duplicates.join(', ')}`;

  return; // no error
};
