// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

const secret = 'your-secret-key';
const token = jwt.sign({ userId: 123 }, secret, { expiresIn: '1m' });

console.log('Generated Token:', token);

setTimeout(() => {
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.log('Token verification failed as expected:', err.message);
    } else {
      console.log('Token should not have been verified:', decoded);
    }
  });
}, 61000); // Wait for 61 seconds to ensure the token is expired
