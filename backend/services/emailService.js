const { BrevoClient } = require('@getbrevo/brevo');

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

async function sendOTPEmail(toEmail, otp) {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: 'Smart Timetable Pro',
        email: process.env.BREVO_SENDER_EMAIL,
      },

      to: [
        {
          email: toEmail,
        },
      ],

      subject: 'Smart Timetable Pro - Email Verification OTP',

      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Smart Timetable Pro</h2>

          <p>Your verification OTP is:</p>

          <h1 style="letter-spacing: 8px;">
            ${otp}
          </h1>

          <p>This OTP is valid for <b>5 minutes</b>.</p>

          <p>If you did not request this code, you can ignore this email.</p>
        </div>
      `,

      textContent: `Your Smart Timetable Pro verification OTP is ${otp}. It is valid for 5 minutes.`,
    });

    console.log('OTP email sent:', result.messageId);

    return result;
  } catch (error) {
    console.error('Brevo email error:', error);
    throw error;
  }
}

module.exports = {
  sendOTPEmail,
};