import nodemailer from 'nodemailer';

// Gmail SMTP Configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS/STARTTLS
  auth: {
    user: 'records.nationalcrime@gmail.com',
    pass: 'luyg wbny amdb bijx', // App password
  },
});

interface CredentialsEmailParams {
  to: string;
  officerName: string;
  username: string;
  password: string;
  role: string;
  stationName?: string;
}

interface PasswordResetEmailParams {
  to: string;
  officerName: string;
  username: string;
  newPassword: string;
}

/**
 * Send account credentials to officer's email
 */
export async function sendCredentialsEmail({
  to,
  officerName,
  username,
  password,
  role,
  stationName,
}: CredentialsEmailParams): Promise<boolean> {
  try {
    const mailOptions = {
      from: '"National Crime Records" <records.nationalcrime@gmail.com>',
      to: to,
      subject: 'Your Account Credentials - National Crime Records System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0c2340, #1e3a5f); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .credentials { background: white; padding: 20px; border-radius: 8px; border: 1px solid #d1d5db; margin: 20px 0; }
            .credential-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .credential-label { font-weight: bold; color: #0c2340; width: 120px; }
            .credential-value { font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>National Crime Records System</h1>
              <p>Account Created Successfully</p>
            </div>
            <div class="content">
              <p>Dear <strong>${officerName}</strong>,</p>
              <p>Your account has been created in the National Crime Records System. Below are your login credentials:</p>
              
              <div class="credentials">
                <div class="credential-row">
                  <span class="credential-label">Username:</span>
                  <span class="credential-value">${username}</span>
                </div>
                <div class="credential-row">
                  <span class="credential-label">Password:</span>
                  <span class="credential-value">${password}</span>
                </div>
                <div class="credential-row">
                  <span class="credential-label">Role:</span>
                  <span class="credential-value">${role}</span>
                </div>
                ${stationName ? `
                <div class="credential-row">
                  <span class="credential-label">Station:</span>
                  <span class="credential-value">${stationName}</span>
                </div>
                ` : ''}
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <ul>
                  <li>Please change your password after first login.</li>
                  <li>Do not share your credentials with anyone.</li>
                  <li>If you did not request this account, please contact the administrator immediately.</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} National Crime Records System</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Dear ${officerName},

Your account has been created in the National Crime Records System.

Login Credentials:
- Username: ${username}
- Password: ${password}
- Role: ${role}
${stationName ? `- Station: ${stationName}` : ''}

IMPORTANT:
- Please change your password after first login.
- Do not share your credentials with anyone.
- If you did not request this account, please contact the administrator immediately.

This is an automated message. Please do not reply to this email.
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Credentials email sent successfully to: ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send credentials email:', error);
    return false;
  }
}

/**
 * Send password reset email to officer
 */
export async function sendPasswordResetEmail({
  to,
  officerName,
  username,
  newPassword,
}: PasswordResetEmailParams): Promise<boolean> {
  try {
    const mailOptions = {
      from: '"National Crime Records" <records.nationalcrime@gmail.com>',
      to: to,
      subject: 'Password Reset - National Crime Records System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0c2340, #1e3a5f); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .credentials { background: white; padding: 20px; border-radius: 8px; border: 1px solid #d1d5db; margin: 20px 0; }
            .credential-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .credential-label { font-weight: bold; color: #0c2340; width: 120px; }
            .credential-value { font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>National Crime Records System</h1>
              <p>Password Reset Notification</p>
            </div>
            <div class="content">
              <p>Dear <strong>${officerName}</strong>,</p>
              <p>Your password has been reset by an administrator. Below are your new login credentials:</p>
              
              <div class="credentials">
                <div class="credential-row">
                  <span class="credential-label">Username:</span>
                  <span class="credential-value">${username}</span>
                </div>
                <div class="credential-row">
                  <span class="credential-label">New Password:</span>
                  <span class="credential-value">${newPassword}</span>
                </div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <ul>
                  <li>Please change your password immediately after logging in.</li>
                  <li>Do not share your credentials with anyone.</li>
                  <li>If you did not request this password reset, please contact the administrator immediately.</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} National Crime Records System</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Dear ${officerName},

Your password has been reset by an administrator.

New Login Credentials:
- Username: ${username}
- New Password: ${newPassword}

IMPORTANT:
- Please change your password immediately after logging in.
- Do not share your credentials with anyone.
- If you did not request this password reset, please contact the administrator immediately.

This is an automated message. Please do not reply to this email.
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent successfully to: ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

/**
 * Generate username based on officer details
 * Format: first_name.last_name.badge_number (lowercase, no spaces)
 */
export function generateUsername(firstName: string, lastName: string, badgeNumber: string): string {
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanBadge = badgeNumber.replace(/[^a-z0-9]/gi, '').toLowerCase();

  return `${cleanFirst}.${cleanLast}.${cleanBadge}`;
}

/**
 * Generate a secure random password
 * Format: 3 uppercase + 3 lowercase + 3 digits + 1 special char
 */
export function generatePassword(): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I, O for clarity
  const lowercase = 'abcdefghjkmnpqrstuvwxyz'; // Removed i, l, o for clarity
  const digits = '23456789'; // Removed 0, 1 for clarity
  const special = '@#$%&*!';

  let password = '';

  // 3 uppercase
  for (let i = 0; i < 3; i++) {
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  }
  // 3 lowercase
  for (let i = 0; i < 3; i++) {
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  }
  // 3 digits
  for (let i = 0; i < 3; i++) {
    password += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  // 1 special
  password += special.charAt(Math.floor(Math.random() * special.length));

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Verify SMTP connection
 */
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection verification failed:', error);
    return false;
  }
}
