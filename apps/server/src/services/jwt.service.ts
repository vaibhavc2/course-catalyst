// import { envConfig } from '@/config/env.config';
// import { ApiError } from '@/utils/api-error.util';
// import jt from 'jsonwebtoken';

// const {
//   ACCESS_TOKEN_SECRET,
//   ACCESS_TOKEN_EXPIRY,
//   REFRESH_TOKEN_SECRET,
//   REFRESH_TOKEN_EXPIRY,
//   VERIFICATION_TOKEN_SECRET,
//   VERIFICATION_TOKEN_EXPIRY,
//   SECURITY_TOKEN_SECRET,
//   SECURITY_TOKEN_EXPIRY,
// } = envConfig;

// interface Token {
//   secret: string;
//   expiresIn: string;
// }

// type UserEmailParams =
//   | { userId?: number; email?: string }
//   | { userId: number; email?: never }
//   | { userId?: never; email: string }
//   | { userId: number; email: string };

// type PhoneEmailParams =
//   | { email?: string; phone?: string }
//   | { email: string; phone?: never }
//   | { email?: never; phone: string }
//   | { email: string; phone: string };

// type UserPhoneParams =
//   | { userId?: number; phone?: string }
//   | { userId: number; phone?: never }
//   | { userId?: never; phone: string }
//   | { userId: number; phone: string };

// type VerificationParams =
//   | {
//       userId?: number;
//       email?: string;
//       phone?: string;
//     }
//   | {
//       userId: number;
//       email?: string;
//       phone?: string;
//     }
//   | {
//       userId: number;
//       email: string;
//       phone?: never;
//     }
//   | {
//       userId: number;
//       email?: never;
//       phone: string;
//     }
//   | {
//       userId?: never;
//       email: string;
//       phone: string;
//     }
//   | {
//       userId?: never;
//       email: string;
//       phone?: never;
//     }
//   | ({
//       userId: number;
//       email: string;
//       phone: string;
//     } & PhoneEmailParams &
//       UserEmailParams &
//       UserPhoneParams);

// class JWTService {
//   private readonly accessToken: Token;
//   private readonly refreshToken: Token;
//   private readonly verificationToken: Token;
//   private readonly securityToken: Token;

//   constructor() {
//     this.accessToken = {
//       secret: ACCESS_TOKEN_SECRET,
//       expiresIn: ACCESS_TOKEN_EXPIRY,
//     };
//     this.refreshToken = {
//       secret: REFRESH_TOKEN_SECRET,
//       expiresIn: REFRESH_TOKEN_EXPIRY,
//     };
//     this.verificationToken = {
//       secret: VERIFICATION_TOKEN_SECRET,
//       expiresIn: VERIFICATION_TOKEN_EXPIRY,
//     };
//     this.securityToken = {
//       secret: SECURITY_TOKEN_SECRET,
//       expiresIn: SECURITY_TOKEN_EXPIRY,
//     };
//   }

//   private errorCallback = (err: unknown, payload: any) => {
//     if (err) {
//       throw new ApiError(401, 'Invalid Token or Token Expired!');
//     }
//     return payload;
//   };

//   generateAccessToken = (userId: number) => {
//     const accessToken = jt.sign(
//       {
//         id: userId,
//       },
//       this.accessToken.secret,
//       {
//         expiresIn: this.accessToken.expiresIn,
//       },
//     );
//     return accessToken;
//   };

//   generateRefreshToken = (
//     userId: number,
//     { email, phone }: { email?: string; phone?: string } = {},
//   ) => {
//     const refreshToken = jt.sign(
//       {
//         id: userId,
//         email,
//         phone,
//       },
//       this.refreshToken.secret,
//       {
//         expiresIn: this.refreshToken.expiresIn,
//       },
//     );
//     return refreshToken;
//   };

//   generateAuthTokens = (userId: number, { email, phone }: PhoneEmailParams) => {
//     const accessToken = this.generateAccessToken(userId);
//     const refreshToken = this.generateRefreshToken(userId, { email, phone });

//     return { accessToken, refreshToken };
//   };

//   generateVerificationToken = ({
//     userId,
//     email,
//     phone,
//   }: VerificationParams) => {
//     const verificationToken = jt.sign(
//       {
//         id: userId,
//         email,
//         phone,
//       },
//       this.verificationToken.secret,
//       {
//         expiresIn: this.verificationToken.expiresIn,
//       },
//     );
//     return verificationToken;
//   };

//   generateSecurityToken = (userId: number) => {
//     const securityToken = jt.sign(
//       {
//         id: userId,
//       },
//       this.securityToken.secret,
//       {
//         expiresIn: this.securityToken.expiresIn,
//       },
//     );
//     return securityToken;
//   };

//   verifyAccessToken: (token: string) => { id: number } | null = (
//     token: string,
//   ) => {
//     return jt.verify(
//       token,
//       this.accessToken.secret,
//       this.errorCallback,
//     ) as unknown as { id: number } | null;
//   };

//   verifyRefreshToken: (token: string) => { id: number; email: string } | null =
//     (token: string) => {
//       return jt.verify(
//         token,
//         this.refreshToken.secret,
//         this.errorCallback,
//       ) as unknown as { id: number; email: string } | null;
//     };

//   verifyVerificationToken = (token: string) => {
//     return jt.verify(
//       token,
//       this.verificationToken.secret,
//       this.errorCallback,
//     ) as unknown as { id?: number; email?: string; phone?: string } | null;
//   };

//   verifySecurityToken: (token: string) => { id: number } | null = (
//     token: string,
//   ) => {
//     return jt.verify(
//       token,
//       this.securityToken.secret,
//       this.errorCallback,
//     ) as unknown as {
//       id: number;
//     } | null;
//   };

//   disableToken = (token: string) => {
//     return jt.verify(token, this.accessToken.secret, (err, payload) => {
//       if (err) {
//         throw new ApiError(401, 'Invalid Token or Token Expired!');
//       }
//       return payload;
//     });
//   };
// }

// export const jwt = new JWTService();
