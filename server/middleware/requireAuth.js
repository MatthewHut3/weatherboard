"use strict";
// Take the token from after Bearer , and verify it with jsonwebtoken's verify and your secret. verify throws if the signature is wrong or the token has expired, so catch that and respond 401.
// Check the decoded payload really is an object with a numeric userId. verify's return type allows a plain string too, so this is the same kind of narrowing you've done before.
// Make the userId available to later handlers, then call next().
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = __importDefault(require("../src/jwt"));
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    // Read the Authorization header. If it's missing, or doesn't start with the Bearer scheme, respond 401 and stop.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ message: 'Authorization header is missing or invalid' });
    }
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    try {
        jsonwebtoken_1.default.verify(token, jwt_1.default, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: 'Invalid or expired token' });
            }
            if (typeof decoded !== 'object' || typeof decoded.userId !== 'number') {
                return res.status(401).send({ message: 'Invalid token' });
            }
            res.locals.userId = decoded.userId;
            next();
        });
    }
    catch (error) {
        return res.status(401).send({ message: 'Invalid or expired token' });
    }
}
exports.default = requireAuth;
