import { ApiError } from '#/utils/api-error.util';
import { printErrorMessage } from '#/utils/error-message.util';
import * as argon2 from 'argon2';

class passwordService {
  // private readonly secret: Buffer;

  constructor() {
    // this.secret = Buffer.from(env.SECRET_KEY);
    // secret key is not required for argon2, rather it decreases the security!
  }

  public hash = async (password: string) => {
    return argon2
      .hash(password)
      .then((hash) => {
        return hash;
      })
      .catch((error) => {
        printErrorMessage(error, 'passwordService.hash');
        throw ApiError.custom(500, 'Error hashing password.');
      });
  };

  public verify = async (hash: string, password: string) => {
    return argon2
      .verify(hash, password)
      .then((verified) => {
        return verified;
      })
      .catch((error) => {
        printErrorMessage(error, 'passwordService.verify');
        throw ApiError.custom(500, 'Error verifying password.');
      });
  };
}

export const pwd = new passwordService();
