
import express, { type Express, type Request, type Response } from 'express';

const app: Express = express();
const pgp = require('pg-promise')(/* options */);
const db = pgp('postgresql://postgres:devpassword@localhost:5432/weatherboard');

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// database test

db.any('SELECT * FROM users')
  .then((data:any) => {
    console.log('DATA:', data);
  })
  .catch((error:any) => {
    console.log('ERROR:', error);
  });


// POST /api/auth/register { username, password } -> 201









// POST /api/auth/login { username, password } -> 200 { token }

app.listen(3000);