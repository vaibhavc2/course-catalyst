export namespace HealthDTO {
  export interface CheckResult {
    success: boolean;
    message: string;
    warn?: boolean;
    info?: any;
  }
}
