const rawJwtSecret = process.env.JWT_SECRET;

if (!rawJwtSecret) {
  throw new Error('JWT_SECRET is not defined');
}

const jwtSecret: string = rawJwtSecret;

export default jwtSecret;