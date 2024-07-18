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

  async getInfo({ userId }: AvatarDTO.Get) {
    // Get avatar from the database
    const avatar = await prisma.avatar.findUnique({
      where: {
        userId,
      },
    });

    if (!avatar) throw ApiError.notFound('Avatar not found!');

    return {
      message: 'Avatar fetched successfully',
      data: { avatar },
    };
  }

  async delete({ userId }: AvatarDTO.Delete) {
    // delete avatar from the database in transaction, then delete from cloudinary: retrieve public_id for that
    const { public_id, user } =
      (await prisma.$transaction(async (prisma) => {
        // Check if the User already has an Avatar
        const existingAvatar = await prisma.avatar.findUnique({
          where: { userId },
        });

        if (!existingAvatar) return null;

        // Delete avatar from the database
        await prisma.avatar.delete({
          where: {
            userId,
          },
        });

        // Then, update the user to set avatarId to null
        const user = await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            avatarId: null,
          },
        });

        const { password, ...userWithoutPassword } = user;

        return {
          public_id: existingAvatar.public_id,
          user: userWithoutPassword,
        };
      })) ?? {};

    if (!public_id) throw ApiError.notFound('Avatar not found!');

    // delete existing avatar from cloudinary
    await cloudinaryService.delete(public_id);

    return {
      message: 'Avatar deleted successfully!',
      data: { user },
    };
  }
}

const avatarService = new AvatarService();
export default avatarService;
