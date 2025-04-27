import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:3000/auth/google/callback',
    },
    jwt: {
      secret: process.env.JWT_SECRET || '123123123',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },
  };
});
