const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
  // ✅ التحقق من وجود credentials قبل الإرسال
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[Email Warning]: EMAIL_USER or EMAIL_PASS not set in environment variables');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"LuxeBrands" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: `<div style="font-family: Arial, sans-serif; direction: rtl;">
        <h2 style="color: #333;">LuxeBrands</h2>
        <p>${message}</p>
        <hr/>
        <small style="color: #999;">هذا البريد أُرسل تلقائياً، لا ترد عليه.</small>
      </div>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email] Sent to ${email}`);
  } catch (error) {
    console.error(`[Email Error]: ${error.message}`);
    // ✅ مش بيوقف التطبيق لو الإيميل فشل
  }
};

module.exports = sendEmail;
