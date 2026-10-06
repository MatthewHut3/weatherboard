"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rawJwtSecret = process.env.JWT_SECRET;
if (!rawJwtSecret) {
    throw new Error('JWT_SECRET is not defined');
}
const jwtSecret = rawJwtSecret;
exports.default = jwtSecret;
