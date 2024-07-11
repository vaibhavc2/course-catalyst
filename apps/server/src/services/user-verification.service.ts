import prisma from '@/common/prisma.client';
import { pwd } from './password.service';

class UserVerification {
  async emailPassword(email: string, inputPassword: string): Promise<boolean> {
    // Fetch the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // User not found
      return false;
    }

    // Verify the password against the stored hash
    const isValid = await pwd.verify(user.password, inputPassword);

    return isValid;
  }
}

export const verifyUser = new UserVerification();
