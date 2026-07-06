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
    html: `
      <h1>Your Farmhouse Booking is Confirmed!</h1>
      <p>Thank you for choosing <strong>${bookingDetails.farmName}</strong>.</p>
      <p><strong>Check-in Date:</strong> ${bookingDetails.startDate}</p>
      <p><strong>Check-out Date:</strong> ${bookingDetails.endDate}</p>
      <p><strong>Total Amount Paid:</strong> ₹${bookingDetails.totalPrice}</p>
      <p>Enjoy your stay!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}