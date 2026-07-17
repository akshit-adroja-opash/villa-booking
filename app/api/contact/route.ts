import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, phone, subject, comment } = await req.json();

    if (!name || !email || !subject || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    
    // Save to DB
    const newContact = await Contact.create({
      name,
      email,
      phone,
      subject,
      comment
    });

    // Try to send email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_FROM || 'info@enjoyfarm.in', // Send to admin
        replyTo: email, // Allows admin to click "Reply" and email the user directly
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF9F6; padding: 40px 20px; color: #1B2A22;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
              
              <!-- Header -->
              <div style="background-color: #1B2A22; padding: 30px; text-align: center; border-bottom: 4px solid #00a877;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px;">New Inquiry Received</h1>
                <p style="color: #829e92; margin: 8px 0 0 0; font-size: 14px;">Via Enjoy Farm Contact Form</p>
              </div>

              <!-- Body -->
              <div style="padding: 40px 30px;">
                <p style="font-size: 15px; line-height: 1.6; margin-bottom: 24px; color: #4a5568;">
                  You have received a new message from <strong>${name}</strong>. Here are the details of their inquiry:
                </p>
                
                <div style="background-color: #FAF9F6; border-radius: 12px; padding: 24px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                  <h3 style="margin-top: 0; color: #1B2A22; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px;">Contact Details</h3>
                  
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #718096; font-size: 14px; width: 35%;">Name:</td>
                      <td style="padding: 8px 0; color: #1B2A22; font-size: 15px; font-weight: 600;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #718096; font-size: 14px;">Email:</td>
                      <td style="padding: 8px 0; color: #00a877; font-size: 15px; font-weight: 600;">
                        <a href="mailto:${email}" style="color: #00a877; text-decoration: none;">${email}</a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #718096; font-size: 14px;">Phone:</td>
                      <td style="padding: 8px 0; color: #1B2A22; font-size: 15px; font-weight: 600;">
                        ${phone ? `<a href="tel:${phone}" style="color: #1B2A22; text-decoration: none;">${phone}</a>` : '<span style="color: #a0aec0; font-weight: 400;">Not provided</span>'}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #718096; font-size: 14px;">Subject:</td>
                      <td style="padding: 8px 0; color: #1B2A22; font-size: 15px; font-weight: 600;">${subject}</td>
                    </tr>
                  </table>
                </div>

                <h3 style="color: #1B2A22; font-size: 16px; margin-bottom: 12px;">Message:</h3>
                <div style="background-color: #ffffff; border-left: 4px solid #00a877; padding: 16px 20px; font-size: 15px; line-height: 1.6; color: #2d3748; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 0 8px 8px 0; white-space: pre-wrap;">${comment}</div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #a0aec0; font-size: 13px;">This is an automated message from your Enjoy Farm platform.</p>
              </div>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Failed to send contact email:', emailError);
      // We don't fail the request if the email fails, since it's saved in DB
    }

    return NextResponse.json({ message: 'Message sent successfully', contact: newContact }, { status: 201 });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
