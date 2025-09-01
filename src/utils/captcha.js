export const formatCaptchaImage = (base64String) => {
  // Check if the string already has the data URL prefix
  if (!base64String.startsWith("data:image/")) {
    // Add the proper data URL prefix for JPEG images
    return `data:image/jpeg;base64,${base64String}`;
  }
  return base64String;
};
