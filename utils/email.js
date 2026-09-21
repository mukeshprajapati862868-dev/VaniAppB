// IMPORT: Nodemailer for sending emails
const nodemailer = require('nodemailer');

// CONFIG: Create a transporter (Example: using Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // .env file mein rakhein
    pass: process.env.EMAIL_PASS  // App Password use karein
  }
});

// CALLED BY: authService.js
async function sendResetEmail(email, token) {
  const resetLink = `http://localhost:3000/reset-password?token=${token}`;
  
  await transporter.sendMail({
    from: '"VaniSystem Support" <noreply@vanisystem.com>',
    to: email,
    subject: 'Password Reset Request',
    html: `<p>Aapne password reset karne ka request kiya hai.</p>
           <p>Is link par click karein: <a href="${resetLink}">Reset Password</a></p>
           <p>Yeh link 1 ghante mein expire ho jayega.</p>`
  });
}

module.exports = { sendResetEmail };