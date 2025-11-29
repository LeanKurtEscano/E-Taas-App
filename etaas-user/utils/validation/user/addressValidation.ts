

export const validateContactNumber = (contactNumber: string): string => {
    
    const regex = /^09\d{9}$/; 

    if (!contactNumber) return "Contact number is required.";

    const trimmedContactNumber = contactNumber.trim();
    

    if (/[^0-9]/.test(trimmedContactNumber)) {
        return "Contact number must not contain letters or special characters.";
    }
  
    if (!regex.test(trimmedContactNumber)) {
        return "Contact number must be a valid Philippine mobile number.";
    }

   
    if (/(\d)\1{3,}/.test(trimmedContactNumber)) {
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
  const invalidCharsRegex = /[^A-Za-z0-9\s\-']/; 
  const repeatedCharRegex = /(.)\1{2,}/;
  const maxLength = 60;

  if (!barangay || !barangay.trim()) return "Barangay is required.";

  const value = barangay.trim();

  if (invalidCharsRegex.test(value))
    return "Barangay must only contain letters, numbers, spaces, hyphens, or apostrophes.";

  if (value.length < 3)
    return "Barangay must be at least 3 characters long.";

  if (value.length > maxLength)
    return `Barangay must be at most ${maxLength} characters long.`;

  if (repeatedCharRegex.test(value.toLowerCase()))
    return "Barangay must not contain repeated characters.";

  return "";
};




export const validateStreetBuildingHouse = (value: string) => {
  if (!value || !value.trim()) {
    return "Street / Building / House No. is required.";
  }

  const trimmed = value.trim();

  // Allow: letters, numbers, spaces, hyphens, slashes, dots, apostrophes, #
  const validCharsRegex = /^[A-Za-z0-9\s\-\/\.'#]+$/;

  // No invalid symbols
  if (!validCharsRegex.test(trimmed)) {
    return "Address must only contain letters, numbers, spaces, hyphens, slashes, apostrophes, periods, or # symbol.";
  }

  // Length constraints
  if (trimmed.length < 3) {
    return "Address must be at least 3 characters long.";
  }

  if (trimmed.length > 80) {
    return "Address must be at most 80 characters long.";
  }

  // Prevent spam like "aaaa", "1111", "----"
  const repeatedCharRegex = /(.)\1{3,}/;
  if (repeatedCharRegex.test(trimmed.toLowerCase())) {
    return "Address must not contain long repeated characters.";
  }

  return "";
};
