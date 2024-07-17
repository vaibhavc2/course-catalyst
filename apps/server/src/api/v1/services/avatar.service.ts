import prisma from '#/common/prisma.client';
import cloudinaryService from '#/common/services/cloudinary.service';
import ApiError from '#/common/utils/api-error.util';
import { StandardResponseDTO } from '#/types';
import { Avatar } from '@prisma/client';
import { AvatarDTO } from '../entities/dtos/avatar.dto';

interface AvatarServiceInterface {
  upload({
    avatar,
  }: AvatarDTO.Upload): Promise<StandardResponseDTO<{ avatar: Avatar }>>;
}

class AvatarService implements AvatarServiceInterface {
  async upload({ avatar, userId }: AvatarDTO.Upload) {
    const { url, public_id } = avatar;

    // Check if the User already has an Avatar
    const existingAvatar = await prisma.avatar.findUnique({
      where: {
        userId: userId,
      },
    });

    if (existingAvatar) {
      // delete existing avatar from cloudinary
      await cloudinaryService.delete(existingAvatar.public_id);

      // Update existing Avatar
      const updatedAvatar = await prisma.avatar.update({
        where: {
          userId,
        },
        data: {
          url,
          public_id,
        },
      });

      // Check if avatar is saved
      if (!updatedAvatar) throw ApiError.internal('Failed to save avatar');

      return {
        message: 'Avatar uploaded successfully',
        data: { avatar: updatedAvatar },
      };
    } else {
      // Save avatar to the database
      const newAvatar = await prisma.$transaction(async (prisma) => {
        // Create new avatar and connect it to the user
        const avatar = await prisma.avatar.create({
          data: {
            url,
            public_id,
            user: {
              connect: {
                id: userId,
              },
            },
          },
        });

        // Update user with new avatar's ID
        await prisma.user.update({
          where: { id: userId },
          data: { avatarId: avatar.id },
        });

        return avatar;
      });

      // Check if avatar is saved
      if (!newAvatar) throw ApiError.internal('Failed to save avatar');

      return {
        message: 'Avatar uploaded successfully',
        data: { avatar: newAvatar },
      };
    }
  }
}

const avatarService = new AvatarService();
export default avatarService;
