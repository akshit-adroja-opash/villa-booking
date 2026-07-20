import path from 'path';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendBookingEmail(to: string, bookingDetails: any) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: `Booking Confirmed: ${bookingDetails.farmName}`,
    attachments: [{
      filename: 'logo.png',
      path: path.join(process.cwd(), 'public', 'logo.png'),
      cid: 'logo'
    }],
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF9F6; padding: 40px 20px; color: #1B2A22;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
          <div style="background-color: #1B2A22; padding: 30px; text-align: center;">
            <img src="cid:logo" alt="Enjoy Farm Logo" style="height: 64px; margin-bottom: 12px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 500; letter-spacing: 1px;">Booking Confirmed</h1>
          </div>
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #4a5568;">
              Thank you for choosing <strong>${bookingDetails.farmName}</strong>! We are thrilled to host you and have successfully confirmed your booking.
            </p>
            
            <div style="background-color: #FAF9F6; border-radius: 12px; padding: 24px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
              <h3 style="margin-top: 0; color: #1B2A22; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px;">Booking Details</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #718096; font-size: 14px;">Check-in:</td>
                  <td style="padding: 8px 0; color: #1B2A22; font-size: 15px; font-weight: 600; text-align: right;">${bookingDetails.startDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #718096; font-size: 14px;">Check-out:</td>
                  <td style="padding: 8px 0; color: #1B2A22; font-size: 15px; font-weight: 600; text-align: right;">${bookingDetails.endDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #718096; font-size: 14px;">Total Price:</td>
                  <td style="padding: 8px 0; color: #00a877; font-size: 16px; font-weight: 700; text-align: right;">₹${bookingDetails.totalPrice}</td>
                </tr>
              </table>
            </div>
            
            <p style="font-size: 15px; line-height: 1.6; color: #4a5568; margin-top: 0;">
              If you have any questions or need to make changes to your booking, please don't hesitate to contact our support team. We wish you a wonderful and relaxing stay!
            </p>
          </div>
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 13px; color: #a0aec0;">
              © ${new Date().getFullYear()} Enjoy Farm. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Password Reset Request',
    attachments: [{
      filename: 'logo.png',
      path: path.join(process.cwd(), 'public', 'logo.png'),
      cid: 'logo'
    }],
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF9F6; padding: 40px 20px; color: #1B2A22;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
          <div style="background-color: #1B2A22; padding: 30px; text-align: center;">
            <img src="cid:logo" alt="Enjoy Farm Logo" style="height: 64px; margin-bottom: 12px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 500; letter-spacing: 1px;">Enjoy Farm</h1>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="margin-top: 0; color: #1B2A22; font-size: 20px; margin-bottom: 20px;">Password Reset Request</h2>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #4a5568;">
              We received a request to reset the password for your account. If you made this request, please click the button below to choose a new password. This link will expire in 1 hour.
            </p>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #00a877; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(0, 168, 119, 0.2);">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px; line-height: 1.6; color: #718096; margin-top: 0; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              If you did not request a password reset, you can safely ignore this email. Your account is secure and your password will not be changed.
            </p>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 12px; color: #a0aec0;">
              This is an automated message, please do not reply.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Welcome to Enjoy Farm!',
    attachments: [{
      filename: 'logo.png',
      path: path.join(process.cwd(), 'public', 'logo.png'),
      cid: 'logo'
    }],
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF9F6; padding: 40px 20px; color: #1B2A22;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
          <div style="background-color: #1B2A22; padding: 30px; text-align: center;">
            <img src="cid:logo" alt="Enjoy Farm Logo" style="height: 64px; margin-bottom: 12px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 500; letter-spacing: 1px;">Welcome to Enjoy Farm</h1>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="margin-top: 0; color: #1B2A22; font-size: 20px; margin-bottom: 20px;">Hi ${name},</h2>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #4a5568;">
              Thank you for registering an account with us. We are absolutely thrilled to welcome you to the Enjoy Farm community!
            </p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #4a5568;">
              With your new account, you can now explore our curated collection of premium farmhouses, save your favorites, and manage your bookings effortlessly.
            </p>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="http://localhost:3000/farms" style="display: inline-block; background-color: #00a877; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(0, 168, 119, 0.2);">
                Explore Farmhouses
              </a>
            </div>
            
            <p style="font-size: 15px; line-height: 1.6; color: #4a5568; margin-top: 0;">
              If you have any questions or need assistance, feel free to reach out to our support team at any time.
            </p>
          </div>
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 13px; color: #a0aec0;">
              © ${new Date().getFullYear()} Enjoy Farm. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}
