export const validateFullName = (fullName: string) => {
    const regex = /^[A-Z][a-z]*([ ]([A-Z][a-z]*))*$/; // Capitalized properly
    const invalidCharsRegex = /[^A-Za-z\s]/; // Special characters or numbers
    const repeatedCharRegex = /(.)\1{2,}/; // Repeated characters
    const repeatedWordPattern = /^(\b\w+\b)(?:\s+\1){1}$/; // Exactly two repeated words allowed (e.g., "John John")
    const threeOrMoreRepeatsPattern = /(\b\w+\b)(?:\s+\1){2,}/; // Three or more repeated words
    const randomSequenceRegex = /([a-zA-Z])\1{3,}/; // Long repeated letters
    const maxTotalLength = 50; // Total full name length limit
    const maxWordLength = 20; // Max per word

    if (!fullName || !fullName.trim()) return "Full name is required.";

    const trimmedName = fullName.trim();

    // Invalid characters
    if (invalidCharsRegex.test(trimmedName))
        return "Full name must not contain numbers or special characters.";

    // Ensure capitalization (e.g., 'John Doe', not 'john doe' or 'JOHN DOE')
    if (!regex.test(trimmedName))
        return "Each word must start with a capital letter and only contain letters.";

    // Check overall length
    if (trimmedName.length < 5)
        return "Full name must be at least 5 characters long.";
    if (trimmedName.length > maxTotalLength)
        return `Full name must be at most ${maxTotalLength} characters long.`;

    // Split into words and validate each part
    const words = trimmedName.split(/\s+/);

    if (words.length < 2)
        return "Please enter at least a first and last name.";

    for (const word of words) {
        if (word.length > maxWordLength)
            return `Each name part must be at most ${maxWordLength} characters long.`;

        if (repeatedCharRegex.test(word.toLowerCase()))
            return "Name parts must not contain repeated characters.";

        if (randomSequenceRegex.test(word))
            return "Name parts must not contain long sequences of the same character.";
    }

    // Allow exactly two repeated words (like “John John”)
    if (repeatedWordPattern.test(trimmedName)) return "";

    // Disallow three or more repeated patterns
    if (threeOrMoreRepeatsPattern.test(trimmedName))
        return "Full name must not contain repeated words more than twice.";

   
};

export const validateUsername = (username: string) => {
  const minLen = 4;
  const maxLen = 50;

  // Allow spaces now
  const invalidCharsRegex = /[^a-zA-Z0-9._\s]/; // Allow letters, numbers, dots, underscores, spaces
  const consecutiveSymbolsRegex = /[._]{2,}/; // No consecutive dots or underscores
  const startsOrEndsWithSymbol = /^[._]|[._]$/; // Can't start or end with dot or underscore
  const onlyNumbersRegex = /^\d+$/; // Prevent all numbers
  const repeatedCharRegex = /(.)\1{3,}/; // Prevent 4+ same consecutive characters

  if (!username || !username.trim()) 
    return "Username is required.";

  const trimmed = username.trim();

  // Length check
  if (trimmed.length < minLen)
    return `Username must be at least ${minLen} characters long.`;

  if (trimmed.length > maxLen)
    return `Username must be at most ${maxLen} characters long.`;

  // Invalid characters (now allows spaces)
  if (invalidCharsRegex.test(trimmed))
    return "Username can only contain letters, numbers, dots, underscores, or spaces.";

  // Consecutive symbols
  if (consecutiveSymbolsRegex.test(trimmed))
    return "Username cannot contain consecutive dots or underscores.";

  // Start or end with symbol
  if (startsOrEndsWithSymbol.test(trimmed))
    return "Username cannot start or end with a dot or underscore.";

  // Repeated characters (e.g., aaaaa)
  if (repeatedCharRegex.test(trimmed))
    return "Username must not contain long sequences of the same character.";

  // Only numbers
  if (onlyNumbersRegex.test(trimmed))
    return "Username cannot contain only numbers.";

  // ✅ If all checks pass
  return null;
};




export const validateEmail = (email: string) => {
    const validProviders = [
     'gmail.com', 'yahoo.com', 'yahoo.com.ph', 'outlook.com', 'hotmail.com', 'aol.com', 
     'icloud.com', 'gov.ph', 'dfa.gov.ph', 'dip.gov.ph', 'deped.gov.ph', 'neda.gov.ph', 
     'doh.gov.ph', 'dti.gov.ph', 'dswd.gov.ph', 'dbm.gov.ph', 'pcso.gov.ph', 'pnp.gov.ph', 
     'bsp.gov.ph', 'prc.gov.ph', 'psa.gov.ph', 'dpwh.gov.ph', 'lto.gov.ph', 'boi.gov.ph',
     'hotmail.co.uk', 'hotmail.fr', 'msn.com', 'yahoo.fr', 'wanadoo.fr', 'orange.fr', 
     'comcast.net', 'yahoo.co.uk', 'yahoo.com.br', 'yahoo.com.in', 'live.com', 
     'rediffmail.com', 'free.fr', 'gmx.de', 'web.de', 'yandex.ru', 'ymail.com', 
     'libero.it', 'uol.com.br', 'bol.com.br', 'mail.ru', 'cox.net', 'hotmail.it', 
     'sbcglobal.net', 'sfr.fr', 'live.fr', 'verizon.net', 'live.co.uk', 'googlemail.com', 
     'yahoo.es', 'ig.com.br', 'live.nl', 'bigpond.com', 'terra.com.br', 'yahoo.it', 
     'neuf.fr', 'yahoo.de', 'alice.it', 'rocketmail.com', 'att.net', 'laposte.net', 
     'facebook.com', 'bellsouth.net', 'yahoo.in', 'hotmail.es', 'charter.net', 
     'yahoo.ca', 'yahoo.com.au', 'rambler.ru', 'hotmail.de', 'tiscali.it', 'shaw.ca', 
     'yahoo.co.jp', 'sky.com', 'earthlink.net', 'optonline.net', 'freenet.de', 
     't-online.de', 'aliceadsl.fr', 'virgilio.it', 'home.nl', 'qq.com', 'telenet.be', 
     'me.com', 'yahoo.com.ar', 'tiscali.co.uk', 'yahoo.com.mx', 'voila.fr', 'gmx.net', 
     'mail.com', 'planet.nl', 'tin.it', 'live.it', 'ntlworld.com', 'arcor.de', 
     'yahoo.co.id', 'frontiernet.net', 'hetnet.nl', 'live.com.au', 'yahoo.com.sg', 
     'zonnet.nl', 'club-internet.fr', 'juno.com', 'optusnet.com.au', 'blueyonder.co.uk', 
     'bluewin.ch', 'skynet.be', 'sympatico.ca', 'windstream.net', 'mac.com', 
     'centurytel.net', 'chello.nl', 'live.ca', 'aim.com', 'bigpond.net.au',
     'up.edu.ph', 'addu.edu.ph', 'ateneo.edu.ph', 'dlsu.edu.ph', 'ust.edu.ph', 'lu.edu.ph'
 ]
 
     email = email.trim();
 
     if (!email) return "Email is required.";
 
     const localPart = email.split('@')[0];
     if (localPart.length > 64) {
         return "The local part (before the '@') of the email address cannot exceed 64 characters.";
     }
 
     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}(\.[a-z]{2,})?$/;
 
     if (!emailRegex.test(email)) {
         return "Invalid email format. Please enter a valid email address.";
     }
 
     const domain = email.split('@')[1];
 
     // Strict validation to ensure no invalid trailing patterns after valid government email domains
     const isStrictGovPh = validProviders.some(provider => new RegExp(`^${provider}$`).test(domain));
 
     if (!isStrictGovPh) {
         return `Invalid email domain. ${domain} is not a recognized email provider.`;
     }
 
}