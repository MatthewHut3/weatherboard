
import express, { type Express, type Request, type Response } from 'express';
import * as http from 'http';
import {CommonRoutesConfig} from './common/common.routes.config';
import {UsersRoutes} from './users/users.routes.config';

const app: Express = express();
const pgp = require('pg-promise')();
const db = pgp('postgresql://postgres:devpassword@localhost:5432/weatherboard');

const usersRoutes = new UsersRoutes(app);
usersRoutes.configureRoutes();

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
app.route('/api/auth/register')
  .post(async (req: express.Request, res: express.Response) => {
    db.none('INSERT INTO users(username, password) VALUES($1, $2)', ['testuser', 'testpassword'])
      .then(() => {
        res.status(201).send({ message: 'User registered successfully' });
      })
      .catch((error: any) => {
        console.error('Error registering user:', error);
        res.status(500).send({ message: 'Error registering user' });
      });
});
// POST /api/auth/login { username, password } -> 200 { token }
app.route('/api/auth/login')
  .post(async (req: express.Request, res: express.Response) => {
    db.one('SELECT * FROM users WHERE username = $1 AND password = $2', ['testuser', 'testpassword'])
      .then((user: any) => {
        if (user) {
          res.status(200).send({ token: 'your-jwt-token' });
        } else {
          res.status(401).send({ message: 'Invalid credentials' });
        }
    })
    .catch((error: any) => {
      console.error('Error logging in user:', error);
      res.status(500).send({ message: 'Error logging in user' });
    });
});

app.listen(3000);