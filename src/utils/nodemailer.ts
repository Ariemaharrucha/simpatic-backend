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

interface AccountCredentialsEmail {
  to: string;
  name: string;
  identifier: string;
  password: string;
  role: string;
}

export const sendAccountCredentialsEmail = async ({
  to,
  name,
  identifier,
  password,
  role,
}: AccountCredentialsEmail): Promise<void> => {
  const mailOptions = {
    from: `"SIMPATIC System" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Akun SIMPATIC Anda Telah Dibuat",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Selamat Datang di SIMPATIC</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2d3748;
          }
          .info-box {
            background-color: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          .credential-row {
            display: flex;
            margin-bottom: 10px;
            align-items: center;
            flex-wrap: wrap;
            gap: 5px;
          }
          .credential-label {
            font-weight: 600;
            color: #4a5568;
            min-width: 120px;
          }
          .credential-value {
            color: #2d3748;
            font-family: monospace;
            background-color: #edf2f7;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 14px;
            word-break: break-all;
            overflow-wrap: anywhere;
            max-width: 100%;
            box-sizing: border-box;
          }
          .warning-box {
            background-color: #fffaf0;
            border: 1px solid #fbd38d;
            border-radius: 5px;
            padding: 15px;
            margin-top: 25px;
          }
          .warning-title {
            color: #c05621;
            font-weight: 600;
            margin-bottom: 10px;
          }
          .warning-text {
            color: #744210;
            font-size: 14px;
          }
          .footer {
            background-color: #f7fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #718096;
            border-top: 1px solid #e2e8f0;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Selamat Datang di SIMPATIC</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistem Informasi Manajemen Penilaian dan Evaluasi Klinik</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Halo <strong>${name}</strong>,
            </div>
            
            <p>Akun Anda sebagai <strong>${role}</strong> telah berhasil dibuat di sistem SIMPATIC. Berikut adalah informasi login Anda:</p>
            
            <div class="info-box">
              <div class="credential-row">
                <span class="credential-label">Role:</span>
                <span class="credential-value">${role}</span>
              </div>
              <div class="credential-row">
                <span class="credential-label">${role === "Mahasiswa" ? "NIM" : role === "Dosen" ? "Kode Dosen" : "Email"}:</span>
                <span class="credential-value">${identifier}</span>
              </div>
              <div class="credential-row">
                <span class="credential-label">Password:</span>
                <span class="credential-value">${password}</span>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/login" class="button">
                Login ke SIMPATIC
              </a>
            </div>
            
            <div class="warning-box">
              <div class="warning-title">⚠️ Penting!</div>
              <div class="warning-text">
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Simpan informasi login ini dengan aman</li>
                  <li>Jangan bagikan password kepada siapapun</li>
                  <li>Silakan ganti password setelah login pertama kali</li>
                </ul>
              </div>
            </div>
            
            <p style="margin-top: 25px; font-size: 14px; color: #4a5568;">
              Jika Anda memiliki pertanyaan atau mengalami kendala, silakan hubungi administrator.
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">Email ini dikirim secara otomatis oleh SIMPATIC System</p>
            <p style="margin: 5px 0 0 0;">© 2026 SIMPATIC. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default transporter;
