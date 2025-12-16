

export const validateContactNumber = (contactNumber: string): string => {
    if (!contactNumber) return "Contact number is required.";

    const trimmedNumber = contactNumber.trim();

    // Already in '9123456789' format (without leading 0)
    if (/[^0-9]/.test(trimmedNumber)) {
        return "Contact number must not contain letters or special characters.";
    }

    // Must be exactly 10 digits after +63
    if (trimmedNumber.length !== 10) {
        return "Contact number must be a valid Philippine mobile number.";
    }

    // Check for 4 or more repeating digits
    if (/(\d)\1{3,}/.test(trimmedNumber)) {
        return "Contact number must not contain 4 or more repeating digits.";
    }

    return "";
};



export const validateProvince = (province: string) => {
  const invalidCharsRegex = /[^A-Za-z\s\-']/; 
  const repeatedCharRegex = /(.)\1{2,}/;
  const maxLength = 50;

  if (!province || !province.trim()) return "Province is required.";

  const value = province.trim();

  if (invalidCharsRegex.test(value))
    return "Province must only contain letters, spaces, hyphens, or apostrophes.";

  if (value.length < 3)
    return "Province must be at least 3 characters long.";

  if (value.length > maxLength)
    return `Province must be at most ${maxLength} characters long.`;

  if (repeatedCharRegex.test(value.toLowerCase()))
    return "Province must not contain repeated characters.";

  return "";
};



export const validateCity = (city: string) => {
  const invalidCharsRegex = /[^A-Za-z\s\-']/; 
  const repeatedCharRegex = /(.)\1{2,}/;
  const maxLength = 60;

  if (!city || !city.trim()) return "City or Municipality is required.";

  const value = city.trim();

  if (invalidCharsRegex.test(value))
    return "City/Municipality must only contain letters, spaces, hyphens, or apostrophes.";

  if (value.length < 3)
    return "City/Municipality must be at least 3 characters long.";

  if (value.length > maxLength)
    return `City/Municipality must be at most ${maxLength} characters long.`;

  if (repeatedCharRegex.test(value.toLowerCase()))
    return "City/Municipality must not contain repeated characters.";

  return "";
};



export const validateBarangay = (barangay: string) => {

  const maxLength = 100;

  if (!barangay || !barangay.trim()) return "Barangay is required.";

  const value = barangay.trim();

  if (value.length < 3)
    return "Barangay must be at least 3 characters long.";

  if (value.length > maxLength)
    return `Barangay must be at most ${maxLength} characters long.`;


  return "";
};




export const validateStreetBuildingHouse = (value: string) => {
  if (!value || !value.trim()) {
    return "Street / Building / House No. is required.";
  }

  const trimmed = value.trim();




  if (trimmed.length < 3) {
    return "Address must be at least 3 characters long.";
  }

  if (trimmed.length > 80) {
    return "Address must be at most 80 characters long.";
  }

  return "";
};
