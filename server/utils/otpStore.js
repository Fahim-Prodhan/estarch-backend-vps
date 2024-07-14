const otpStore = new Map();

export const saveOtp = (phoneNumber, otp) => {
  otpStore.set(phoneNumber, otp);
  setTimeout(() => otpStore.delete(phoneNumber), 300000); // OTP valid for 5 minutes
};

export const getSavedOtp = (phoneNumber) => {
  return otpStore.get(phoneNumber);
};

export const deleteOtp = (phoneNumber) => {
  otpStore.delete(phoneNumber);
};
