import axios from 'axios';

export const sendSms = async (phoneNumber, message) => {
  // Replace with actual API call to SMS provider
  await axios.post('https://sms-provider.com/send', {
    phoneNumber,
    message
  });
};
