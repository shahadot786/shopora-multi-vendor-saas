//validation functions for authentication fields
export const validateName = (name: string): string | true => {
  if (!name || name.trim() === "") {
    return "Full name is required";
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return "Name must be at least 2 characters";
  }

  if (trimmedName.length > 50) {
    return "Name is too long (max 50 characters)";
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmedName)) {
    return "Name can only contain letters, spaces, hyphens, and apostrophes";
  }

  // Check for at least one letter
  if (!/[a-zA-Z]/.test(trimmedName)) {
    return "Name must contain at least one letter";
  }

  return true;
};

export const validateEmail = (email: string): string | true => {
  if (!email || email.trim() === "") {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  if (email.length > 254) {
    return "Email is too long";
  }

  const domain = email.split("@")[1]?.toLowerCase();
  const typos: Record<string, string> = {
    "gmial.com": "gmail.com",
    "gmai.com": "gmail.com",
    "yahooo.com": "yahoo.com",
    "hotmial.com": "hotmail.com",
  };

  if (domain && typos[domain]) {
    return `Did you mean ${email.split("@")[0]}@${typos[domain]}?`;
  }

  return true;
};

export const validatePassword = (password: string): string | true => {
  if (!password || password.trim() === "") {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  if (password.length > 128) {
    return "Password is too long (max 128 characters)";
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return "Password must contain at least one number";
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return "Password must contain at least one special character";
  }

  // Check for common weak passwords
  const weakPasswords = [
    "password123",
    "12345678",
    "qwerty123",
    "abc12345",
    "password1",
  ];
  if (weakPasswords.includes(password.toLowerCase())) {
    return "This password is too common. Please choose a stronger password";
  }

  return true;
};

export const validateConfirmPassword = (
  confirmPassword: string,
  getValues: any
): string | true => {
  if (!confirmPassword || confirmPassword.trim() === "") {
    return "Please confirm your password";
  }

  const passwordValue = getValues("password");
  if (confirmPassword !== passwordValue) {
    return "Passwords do not match";
  }

  return true;
};

// Password strength indicator
export const getPasswordStrength = (password: string): number => {
  if (!password) return 0;

  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

  return Math.min(strength, 4);
};

export const validatePhone = (phone: string) => {
  if (!phone) return "Phone number is required";
  if (!/^[0-9+\-\s()]+$/.test(phone)) return "Invalid phone number format";
  if (phone.replace(/[^0-9]/g, "").length < 7) return "Phone number too short";
  return true;
};
