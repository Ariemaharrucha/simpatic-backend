import argon2 from "argon2";

export const PasswordUtils = {
  // Hash password
  hashPassword: async (password: string): Promise<string> => {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  },

  // Compare password with hashed password
  comparePassword: async (
    password: string,
    hashedPassword: string,
  ): Promise<boolean> => {
    return await argon2.verify(hashedPassword, password);
  },
};
