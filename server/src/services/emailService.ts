import nodemailer from 'nodemailer';

// Create a test account for development
let transporter: nodemailer.Transporter;

async function initializeTransporter() {
  // Always use Ethereal (fake SMTP service) for testing
  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  username: string
): Promise<void> {
  if (!transporter) {
    await initializeTransporter();
  }

  // Use the deployed URL in production, localhost in development
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://nationforge.onrender.com'
    : 'http://localhost:5173';

  const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

  const mailOptions = {
    from: '"NationForge" <noreply@nationforge.com>',
    to,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">NationForge Password Reset</h2>
        <p>Hello ${username},</p>
        <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
        <p>To reset your password, click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #4F46E5;">${resetUrl}</p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          If you didn't request a password reset, please ignore this email or contact support if you have concerns.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    
    // Always log the test email URL since we're using Ethereal
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

// Initialize the transporter when the service is imported
initializeTransporter().catch(console.error); 