// import env from '@/config';
// import ct from '@/constants';
// import { emailHTML, log, printErrorMessage } from '@/utils';
// import { contracts } from '@reg/contracts';
// import { Resend } from 'resend';

// class EmailService {
//   private readonly resend: Resend;

//   constructor() {
//     this.resend = new Resend(env.RESEND_API_KEY);
//   }

//   send = async (
//     email: string,
//     title: string,
//     subject: string,
//     message: string,
//     content?: string,
//   ) => {
//     try {
//       const response = await this.resend.emails.send({
//         from: `${title} <${env.EMAIL_FROM}>`,
//         to: email,
//         subject,
//         html: emailHTML(title, message, content),
//       });

//       log.info(response.data || response.error);

//       if (!response.error)
//         log.info(`✅  Email sent to '${email}' successfully!`);

//       return response.error && !response.data ? false : true;
//     } catch (error) {
//       printErrorMessage(error, 'sendEmail()');
//     }
//   };

//   sendVerificationEmail = async (
//     email: string,
//     token: string,
//     { login = false } = {}, // defaults to false, optional configuration object
//   ) => {
//     const title = 'Email Verification: Registry App';
//     const subject = 'Verify your email';
//     const message = `Click the button below to verify your email address.`;
//     const content = `
//     <h1>Confirm your email address</h1>
//     So we can send you important information and updates, we need to check this is the right email address for you. <br>
//     <button href="${ct.base_url}${contracts.v1.users['verify-email'].path}?token=${token}&${login ? 'login=true' : null}" style="text-decoration: none; color: white; background-color: #4CAF50; padding: 10px 20px; border-radius: 5px;">
//       Verify Email
//     </button>`;

//     return await this.send(email, title, subject, message, content);
//   };

//   sendSecurityEmail = async (
//     email: string,
//     token: string,
//     subject: string,
//     message: string,
//   ) => {
//     const title = 'Security Alert:: Verification from Registry App';
//     // const content = `
//     // <a href="${ct.base_url}${contracts.v1.users['verify-email'].path}?token=${token}" style="text-decoration: none; color: white; background-color: #4CAF50; padding: 10px 20px; border-radius: 5px;">
//     //   Verify Email
//     // </a>`;

//     return await this.send(email, title, subject, message, 'content');
//   };
// }

// export const emailService = new EmailService();
