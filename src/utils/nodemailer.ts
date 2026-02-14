import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER as string,
    pass: process.env.GMAIL_PASS as string,
  },
});

export const sendOtpEmail = async (
  email: string,
  otp: string,
): Promise<void> => {
  const mailOptions = {
    from: process.env.GMAIL_USER as string,
    to: email,
    subject: "NIM dan Password untuk login akun",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">

      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default transporter;
