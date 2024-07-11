import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import VerifyEmail from './emails/verify.email';

// export { VerifyEmail };

export const renderVerifyEmail = (
  verificationCode: string,
  appName: string,
) => {
  return renderToStaticMarkup(
    <VerifyEmail verificationCode={verificationCode} appName={appName} />,
  );
};
