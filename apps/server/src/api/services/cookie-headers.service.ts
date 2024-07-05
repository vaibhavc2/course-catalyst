// import ct from '@/constants';

// type CookieOptions = {
//   maxAge?: number;
//   expires?: Date;
//   path?: string;
//   httpOnly?: boolean;
//   secure?: boolean;
//   sameSite?: 'Lax' | 'None' | 'Strict';
// };

// class CookieHeaders {
//   constructor() {}

//   generateCookieString = (
//     cookieName: string,
//     cookieValue: string,
//     cookieOptions: CookieOptions,
//   ) => {
//     const { path, httpOnly, secure, sameSite, expires, maxAge } = cookieOptions;

//     return `${cookieName}=${cookieValue}; ${maxAge ? `maxAge=${maxAge}` : ''} ${expires ? `expires=${expires.toUTCString()}` : ''}; path=${path ? path : '/'}; ${httpOnly ? 'HttpOnly' : ''}; ${secure ? 'Secure' : ''}; SameSite=${sameSite ? sameSite : 'Lax'}`;
//   };

//   setCookieHeaders = (
//     cookies: { name: string; value: string }[],
//     cookieOptions: CookieOptions,
//   ) => ({
//     'Set-Cookie': cookies.map((cookie) =>
//       this.generateCookieString(cookie.name, cookie.value, cookieOptions),
//     ),
//   });

//   setAuthCookieHeaders = (tokens: {
//     accessToken: string;
//     refreshToken: string;
//   }) =>
//     this.setCookieHeaders(
//       [
//         { name: 'accessToken', value: tokens.accessToken },
//         { name: 'refreshToken', value: tokens.refreshToken },
//       ],
//       ct.cookieOptions.auth,
//     );

//   removeCookieHeaders = (cookieNames: string[]) => {
//     const expires = new Date();
//     expires.setDate(expires.getDate() - 1); // Set date to yesterday to expire the cookie

//     return this.setCookieHeaders(
//       cookieNames.map((name) => ({ name, value: '' })),
//       {
//         ...ct.cookieOptions.auth,
//         expires,
//       },
//     );
//   };

//   removeAuthCookieHeaders = () =>
//     this.removeCookieHeaders(['accessToken', 'refreshToken']);
// }

// export const cookieHeaders = new CookieHeaders();
