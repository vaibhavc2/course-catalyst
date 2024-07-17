import { randomBytes } from 'crypto';

interface OTP {
  string: string;
  number: number;
}

class OTPService {
  generateOTP(length: number = 6): OTP {
    const lower_limit = Math.pow(10, length - 1); // say, 100000
    const upper_limit = Math.pow(10, length) - 1; // say, 999999

    const otp =
      Math.floor(Math.random() * (upper_limit - lower_limit + 1)) + lower_limit;

    return {
      string: otp.toString(),
      number: otp,
    };
  }

  // generate secure OTP using 'crypto' module
  // This approach ensures each byte contributes a digit (0-9) to the OTP, enhancing its randomness and security. The generated OTP is then converted to a string and number for ease of use.
  generateSecureOTP(length: number = 6): OTP {
    const bytes = randomBytes(length);
    let otp = '';

    bytes.forEach((byte) => {
      otp += ((byte % 9) + 1).toString(); // Ensuring each digit is between 1-9
    });

    // otp = otp.replace(/^0+/, ''); // Remove leading zeros

    otp = otp.slice(0, length); // Ensure the length is exactly 'length'

    return {
      string: otp,
      number: Number(otp),
    };
  }
}

const otpService = new OTPService();
export default otpService;
