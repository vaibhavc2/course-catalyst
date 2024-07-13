import { ct } from '#/constants';
import { convertExpiry } from './expiry-converter.util';

export const getCookieOptions = (expiresIn: string) => {
  const expiry = convertExpiry(expiresIn, true);

  return {
    ...ct.cookieOptions,
    maxAge: expiry,
    expires: new Date(Date.now() + expiry),
  };
};
