
// Take the token from after Bearer , and verify it with jsonwebtoken's verify and your secret. verify throws if the signature is wrong or the token has expired, so catch that and respond 401.
// Check the decoded payload really is an object with a numeric userId. verify's return type allows a plain string too, so this is the same kind of narrowing you've done before.
// Make the userId available to later handlers, then call next().

import { type Request, type Response, type NextFunction } from 'express';
import jsonwebtoken from 'jsonwebtoken';
import jwtSecret from '../src/jwt';

function requireAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    // Read the Authorization header. If it's missing, or doesn't start with the Bearer scheme, respond 401 and stop.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ message: 'Authorization header is missing or invalid' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
        const decoded = jsonwebtoken.verify(token, jwtSecret)
        //check decoded is an object, check decoded isnt null,check for userID in decoded, and that it is a number
        if (
            typeof decoded !== 'object' ||
            decoded === null ||
            typeof decoded.userId !== 'number'
        ) {
            return res.status(401).send({ message: 'Invalid or expired token' });
        }


        res.locals.userId = (decoded).userId;
        return next()

    } catch (error) {
        return res.status(401).send({ message: 'Invalid or expired token' });
    }
}


export default requireAuth;