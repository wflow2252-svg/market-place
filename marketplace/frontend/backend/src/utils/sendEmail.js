const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
  // Use a real SMTP in production or EmailJS on the frontend
  // For now, this uses a Mailtrap test account style or a basic SMTP configuration
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Change this in production
      auth: {
        user: process.env.EMAIL_USER || 'test@gmail.com', // Your email
        pass: process.env.EMAIL_PASS || 'password_here',    // App password
      },
    });

    const mailOptions = {
      from: '"Marketplace" <no-reply@marketplace.com>',
      to: email,
      subject: subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email] OTP sent to ${email}`);
  } catch (error) {
    console.error(`[Email Error]: ${error.message}`);
  }
};

module.exports = sendEmail;
