import { CheckResult } from '#/common/dtos/health.dto';
import { logger } from '#/common/winston.logger';
import { ct } from '#/constants';
import { asyncFnWrapper } from '#/utils/async-error-handling.util';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

class CheckupService {
  httpCheck = asyncFnWrapper(async (url: string): Promise<CheckResult> => {
    // perform a http check using axios
    const response = await axios.get(url);

    if (response.status === 200) {
      return {
        success: true,
        message: 'HTTP check successful',
      };
    } else {
      return {
        success: false,
        message: 'HTTP check failed',
      };
    }
  });

  dbCheck = asyncFnWrapper(async (): Promise<CheckResult> => {
    try {
      // perform a db check using prisma with a timeout of 5 seconds
      const prisma = new PrismaClient();
      await prisma.$connect();
      await prisma.$disconnect();

      return {
        success: true,
        message: 'Database connection successful.',
      };
    } catch (error) {
      logger.error('Database check failed: ' + chalk.red(error));

      return {
        success: false,
        message: 'Database connection failed!',
      };
    }
  });

  diskCheck = asyncFnWrapper(async (): Promise<CheckResult> => {
    try {
      // Execute the 'df' command to check disk space usage
      // '-h' option is for human-readable format
      const { stdout } = await execAsync('df -h /'); // Check root partition, adjust as needed
      const lines = stdout.split('\n');
      const data = lines[1].split(/\s+/); // Assuming the second line contains the disk info
      const usedPercentage = parseInt(data[4], 10); // Assuming the fifth column is the used percentage
      const totalSpace = data[1]; // Assuming the second column is the total space
      const usedSpace = data[2]; // Assuming the third column is the used space
      const availableSpace = data[3]; // Assuming the fourth column is the available space;

      if (usedPercentage < ct.checkup.disk.warningThreshold) {
        return {
          success: true,
          message: `Disk check successful. Usage: ${usedPercentage}%.`,
          info: {
            total: totalSpace,
            used: usedSpace,
            available: availableSpace,
          },
        };
      } else if (usedPercentage < ct.checkup.disk.criticalThreshold) {
        return {
          success: true,
          message: `Disk check warning: Usage exceeds ${ct.checkup.disk.warningThreshold}%. Usage: ${usedPercentage}%.`,
          info: {
            total: totalSpace,
            used: usedSpace,
            available: availableSpace,
          },
        };
      } else {
        return {
          success: false,
          message: `Disk check warning: Usage exceeds ${ct.checkup.disk.criticalThreshold}%. Usage: ${usedPercentage}%.`,
          info: {
            total: totalSpace,
            used: usedSpace,
            available: availableSpace,
          },
        };
      }
    } catch (error) {
      logger.error('Disk check failed: ' + chalk.red(error));

      return {
        success: false,
        message: 'Disk check failed!',
      };
    }
  });

  memoryCheck = asyncFnWrapper(async (): Promise<CheckResult> => {
    try {
      // Execute the 'free' command to check memory usage
      // '-m' option is for megabytes
      const { stdout } = await execAsync('free -m');
      const lines = stdout.split('\n');
      const memoryLine = lines[1].split(/\s+/); // Assuming the second line contains the memory info
      const totalMemory = memoryLine[1]; // Total memory in MB
      const usedMemory = memoryLine[2]; // Used memory in MB
      const availableMemory = memoryLine[3]; // Available memory in MB
      const usedPercentage =
        (parseInt(usedMemory) / parseInt(totalMemory)) * 100;

      if (usedPercentage < ct.checkup.memory.warningThreshold) {
        return {
          success: true,
          message: `Memory check successful. Usage: ${usedPercentage.toFixed(2)}%.`,
          info: {
            total: `${totalMemory} MB`,
            used: `${usedMemory} MB`,
            available: `${availableMemory} MB`,
          },
        };
      } else if (usedPercentage < ct.checkup.memory.criticalThreshold) {
        return {
          success: true,
          message: `Memory check warning: Usage exceeds ${ct.checkup.memory.warningThreshold}%. Usage: ${usedPercentage.toFixed(2)}%.`,
          info: {
            total: `${totalMemory} MB`,
            used: `${usedMemory} MB`,
            available: `${availableMemory} MB`,
          },
        };
      } else {
        return {
          success: false,
          message: `Memory check warning: Usage exceeds ${ct.checkup.memory.criticalThreshold}%. Usage: ${usedPercentage.toFixed(2)}%.`,
          info: {
            total: `${totalMemory} MB`,
            used: `${usedMemory} MB`,
            available: `${availableMemory} MB`,
          },
        };
      }
    } catch (error) {
      logger.error('Memory check failed: ' + chalk.red(error));

      return {
        success: false,
        message: 'Memory check failed!',
      };
    }
  });
}

export const checkup = new CheckupService();
