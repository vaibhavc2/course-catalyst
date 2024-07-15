import { logger } from '#/common/utils/logger.util';
import { envConfig } from '#/common/config/env.config';
import { ct } from '#/common/constants';
import { printErrorMessage } from '#/common/utils/error-message.util';
import { renderVerifyEmail } from '@lms/transactional';
import { Resend } from 'resend';

const { RESEND_API_KEY, EMAIL_FROM } = envConfig;

class EmailService {
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(RESEND_API_KEY);
  }

  private send = async (params: {
    email: string;
    title: string;
    subject: string;
    html: any;
    // react?: any;
  }) => {
    const { email, title, subject, html } = params;
    try {
      const response = await this.resend.emails.send({
        from: `${title} <${EMAIL_FROM}>`,
        to: email,
        subject,
        html,
        // react: params.react,
      });

      if (!response.error)
        logger.info(`✅  Email sent to '${email}' successfully!`);
      else
        throw new Error(`❌  Email sending failed: ${response.error.message}`);

      return response.error && !response.data ? false : true;
    } catch (error) {
      printErrorMessage(error, 'sendEmail()');
    }
  };

  async sendVerificationEmail({
    email,
    verificationCode,
  }: {
    email: string;
    verificationCode: string;
  }) {
    const title = ct.appName;
    const subject = `${title}: Verify your email address`;
    const html = renderVerifyEmail(verificationCode, title);
    // const react = renderVerifyEmail(verificationCode, title);

    return this.send({
      email,
      title,
      subject,
      html,
      // react,
    });
  }
}

export const emailService = new EmailService();
