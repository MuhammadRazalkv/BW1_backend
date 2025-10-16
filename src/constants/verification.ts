export const html = (link: string) => {
  return `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fafafa; padding: 30px; max-width: 600px; margin: 0 auto; border-radius: 8px; border: 1px solid #e0e0e0;">
    <div style="background-color: #2c3e50; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
      <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Verify Your Email</h2>
    </div>

    <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="font-size: 16px; color: #333333; margin-bottom: 15px;">Hello,</p>
      <p style="font-size: 16px; color: #333333; margin-bottom: 30px;">
        Thank you for signing up for <strong>NexaRead</strong>. Please verify your email address by clicking the button below.
      </p>

      <a href="${link}" target="_blank" 
        style="display: inline-block; background-color: #2c3e50; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 500;">
        Verify Email
      </a>

      <p style="font-size: 14px; color: #999999; margin-top: 30px;">
        This link will expire in <strong>10 minutes</strong>. If you didn’t create an account, you can safely ignore this email.
      </p>
    </div>

    <div style="background-color: #f8f8f8; text-align: center; padding: 10px; border-radius: 0 0 8px 8px;">
      <p style="font-size: 12px; color: #888888;">© ${new Date().getFullYear()} NexaRead. All Rights Reserved.</p>
    </div>
  </div>`;
};
