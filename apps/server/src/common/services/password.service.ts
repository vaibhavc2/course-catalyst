import ApiError from '#/common/utils/api-error.util';
import { printErrorMessage } from '#/common/utils/error-extras.util';
import * as argon2 from 'argon2';

class passwordService {
  // private readonly secret: Buffer;

  constructor() {
    // this.secret = Buffer.from(env.SECRET_KEY);
    // secret key is not required for argon2, rather it decreases the security!
  }

  async hash(password: string) {
    return argon2
      .hash(password)
      .then((hash) => {
        return hash;
      })
      .catch((error) => {
        printErrorMessage(error, 'passwordService.hash');
        throw ApiError.internal('Error hashing password.');
      });
  }

  async verify(hash: string, password: string) {
    return argon2
      .verify(hash, password)
      .then((verified) => {
        return verified;
      })
      .catch((error) => {
        printErrorMessage(error, 'passwordService.verify');
        throw ApiError.internal('Error verifying password.');
      });
  }
}

const pwdService = new passwordService();
export default pwdService;
