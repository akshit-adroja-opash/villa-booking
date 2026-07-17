import re

mailer_path = 'lib/mailer.ts'
with open(mailer_path, 'r', encoding='utf-8') as f:
    mailer_content = f.read()

welcome_email_code = """
export async function sendWelcomeEmail(to: string, name: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Welcome to Enjoy Farm!',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF9F6; padding: 40px 20px; color: #1B2A22;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
          <div style="background-color: #1B2A22; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 500; letter-spacing: 1px;">Welcome to Enjoy Farm</h1>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="margin-top: 0; color: #1B2A22; font-size: 20px; margin-bottom: 20px;">Hi ${name},</h2>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #4a5568;">
              Thank you for registering an account with us. We are absolutely thrilled to welcome you to the Enjoy Farm community!
            </p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #4a5568;">
              With your new account, you can now explore our curated collection of premium farmhouses, save your favorites, and manage your reservations effortlessly.
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
"""

if 'sendWelcomeEmail' not in mailer_content:
    with open(mailer_path, 'a', encoding='utf-8') as f:
        f.write(welcome_email_code)

api_path = 'app/api/auth/register/route.ts'
with open(api_path, 'r', encoding='utf-8') as f:
    api_content = f.read()

if 'sendWelcomeEmail' not in api_content:
    # Add import
    api_content = api_content.replace(
        "import bcrypt from 'bcryptjs';",
        "import bcrypt from 'bcryptjs';\nimport { sendWelcomeEmail } from '@/lib/mailer';"
    )
    
    # Add email call
    api_content = api_content.replace(
        "const newUser = await User.create({ name, email: email.toLowerCase(), password: hashedPassword, role });",
        "const newUser = await User.create({ name, email: email.toLowerCase(), password: hashedPassword, role });\n\n    // Send welcome email asynchronously\n    sendWelcomeEmail(email.toLowerCase(), name);"
    )
    
    with open(api_path, 'w', encoding='utf-8') as f:
        f.write(api_content)

print("Done setting up welcome email!")
