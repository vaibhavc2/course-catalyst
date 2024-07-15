import { StandardResponseDTO } from '#/types';

export interface CheckResult {
  success: boolean;
  message: string;
  warn?: boolean;
  info?: any;
}

interface results {
  google?: CheckResult;
  db?: CheckResult;
  disk?: CheckResult;
  memory?: CheckResult;
}

export interface HealthServiceDTO {
  index: () => Promise<StandardResponseDTO<{ results: results }>>;
}
