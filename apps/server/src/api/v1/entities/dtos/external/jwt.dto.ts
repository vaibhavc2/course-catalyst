export type VerificationPromise<T> = Promise<T | null>;

interface CommonPayload {
  type: string;
  iat: number;
  exp: number;
}

export type AccessTokenPayloadDTO = {
  userId: string;
  deviceId: string;
} & CommonPayload;

export type RefreshTokenPayloadDTO = {
  userId: string;
  deviceId: string;
} & CommonPayload;

export type ActivationTokenPayloadDTO = {
  email: string;
  otpCode: string;
} & CommonPayload;

export type AccessTokenParams = {
  userId: string;
  deviceId: string;
};

export type RefreshTokenParams = {
  userId: string;
  deviceId: string;
};

export type ActivationTokenParams = {
  email: string;
  otpCode: string | number;
};
