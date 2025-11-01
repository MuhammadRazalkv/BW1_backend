import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.APP_GMAIL,
    pass: process.env.APP_PASSWORD_GMAIL,
  },
});

// export default async function sendEmail(to: string, subject: string, html: string) {
//   try {
//     await transporter.sendMail({
//       from: 'NexaRead' + process.env.APP_GMAIL,
//       to: to,
//       subject: subject,
//       text: 'This is a plain text message',
//       html: html,
//     });

//     console.log('Email sent to:', to);
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// }

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_SECRET);

export default async function sendEmail(to: string, subject: string, html: string) {
  const { data, error } = await resend.emails.send({
    from: 'NexaRead <noreply@mail.rasal.sbs>',
    to,
    subject,
    html,
  });

  if (error) throw new Error(error.message);
  return data;
}
