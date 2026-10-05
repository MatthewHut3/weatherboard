
import express, { type Express, type Request, type Response } from 'express';
import {UsersRoutes} from './users/users.routes.config';
import bcrypt from 'bcrypt';
import pool from './db';

const app: Express = express();
app.use(express.json());

const usersRoutes = new UsersRoutes(app);
usersRoutes.configureRoutes();

// POST /api/auth/register { username, password } -> 201
app.route('/api/auth/register')
  .post(async (req: express.Request, res: express.Response) => {
    const { username, password } = req.body ?? {};

    if (typeof username !== 'string' || typeof password !== 'string' || username.trim() === '' || password.trim() === '') {
      return res.status(400).send({ message: 'Username and password are required' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('INSERT INTO users(username, password_hash) VALUES($1, $2)', [username, hashedPassword]);
      return res.status(201).send({ message: 'User registered successfully' });
    } catch (error: unknown) {
      const dbError = error as { code?: string };

      if (dbError.code === '23505') {
        return res.status(409).send({ message: 'Username already exists' });
      }

      console.error('Error registering user:', error);
      return res.status(500).send({ message: 'Error registering user' });
    }
  });

// POST /api/auth/login { username, password } -> 200 { token }
app.route('/api/auth/login')
  .post(async (req: express.Request, res: express.Response) => {
    const { username, password } = req.body ?? {};

    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).send({ message: 'Username and password are required' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password_hash = $2', [username, hashedPassword]);

      if (result.rows.length === 0) {
        return res.status(401).send({ message: 'Invalid credentials' });
      }
      else if (result.rows.length === 1) {
        return res.status(200).send({ token: 'your-jwt-token' });
      }
    } catch (error: unknown) {
      console.error('Error logging in user:', error);
      return res.status(500).send({ message: 'Error logging in user' });
    }
  });


app.listen(3000);