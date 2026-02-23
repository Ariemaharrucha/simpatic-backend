import argon2 from "argon2";
import crypto from "crypto";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 3;
const OTP_MAX_ATTEMPTS = 3;

export const OTPConfig = {
  length: OTP_LENGTH,
  expiryMinutes: OTP_EXPIRY_MINUTES,
  maxAttempts: OTP_MAX_ATTEMPTS,
};

export const generateOTP = (): string => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < OTP_LENGTH; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }
  return otp;
};

export const hashOTP = async (otp: string): Promise<string> => {
  return await argon2.hash(otp, {
    type: argon2.argon2id,
    memoryCost: 16384,
    timeCost: 1,
    parallelism: 1,
  });
};

export const verifyOTP = async (
  hash: string,
  otp: string,
): Promise<boolean> => {
  try {
    return await argon2.verify(hash, otp);
  } catch {
    return false;
  }
};

export const generateExpiryTime = (): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + OTP_EXPIRY_MINUTES);
  return expiry;
};
