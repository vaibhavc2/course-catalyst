// import env from '#/config';
// import ct from '#/common/constants';
// import { printErrorMessage } from '#/utils';
// import { contracts } from '@reg/contracts';
// import { OAuth2Client } from 'google-auth-library';

// class GoogleOAuthService {
//   private client: OAuth2Client;

//   constructor() {
//     // initialize the OAuth2Client with the Google OAuth client ID, client secret, and redirect URL
//     this.client = new OAuth2Client(
//       env.GOOGLE_OAUTH_CLIENT_ID,
//       env.GOOGLE_OAUTH_CLIENT_SECRET,
//       `${ct.base_url}${contracts.v1.users['google-oauth'].path}`,
//     );
//   }

//   // get the authorization URL
//   public getAuthorizationUrl() {
//     return this.client.generateAuthUrl({
//       // access_type: ct.oauth.google.accessType, //? no need for refresh token of google, create my own refresh token
//       prompt: ct.oauth.google.prompt,
//       scope: ct.oauth.google.scopes,
//     });
//   }

//   // get tokens from the code
//   public async getTokens(code: string) {
//     try {
//       const { tokens } = await this.client.getToken(code);
//       return tokens;
//     } catch (error) {
//       printErrorMessage(error, 'getAccessToken()');
//     }
//   }

//   // verify the ID token
//   public async verifyIdToken(idToken: string) {
//     try {
//       const ticket = await this.client.verifyIdToken({
//         idToken,
//         audience: env.GOOGLE_OAUTH_CLIENT_ID,
//       });
//       return ticket.getPayload();
//     } catch (error) {
//       printErrorMessage(error, 'verifyIdToken()');
//     }
//   }

//   // revoke the refresh token
//   public async revokeToken(token: string) {
//     try {
//       const response = await this.client.revokeToken(token);
//       return response.data;
//     } catch (error) {
//       printErrorMessage(error, 'revokeToken()');
//     }
//   }

//   // get user info from the access token
//   public async getUser(accessToken: string) {
//     try {
//       const response = await this.client.request<{
//         email: string;
//         name: string;
//         picture: string;
//       }>({
//         url: ct.oauth.google.url,
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });
//       return response.data;
//     } catch (error) {
//       printErrorMessage(error, 'getUserInfo()');
//     }
//   }
// }

// export const google = new GoogleOAuthService();
