import dotenv from 'dotenv';
dotenv.config();

import express, { type Express, type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import pool from './db';
import jsonwebtoken from 'jsonwebtoken';
import cors from 'cors';
import jwtSecret from './jwt';
import requireAuth from '../middleware/requireAuth';

const app: Express = express();
app.use(express.json());
//app.use(cors());

var corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));

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
  }
  );

// POST /api/auth/login { username, password } -> 200 { token }
app.route('/api/auth/login')
  .post(async (req: express.Request, res: express.Response) => {
    const { username, password } = req.body ?? {};

    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).send({ message: 'Username and password are required' });
    }

    try {
      const result = await pool.query('SELECT password_hash,id FROM users WHERE username = $1', [username]);
      if (result.rows.length === 0) {
        return res.status(401).send({ message: 'Invalid username or password' });
      }

      const isMatch = await bcrypt.compare(password, result.rows[0].password_hash);
      if (isMatch) {
        if (typeof jwtSecret !== 'string' || jwtSecret.length === 0) {
          console.error('JWT secret is not configured');
          return res.status(500).send({ message: 'Authentication is not configured' });
        }

        const token = jsonwebtoken.sign({ userId: result.rows[0].id }, jwtSecret, { expiresIn: '1h' });
        return res.status(200).send({ token });
      } else {
        return res.status(401).send({ message: 'Invalid username or password' });
      }


    } catch (error: unknown) {
      console.error('Error logging in user:', error);
      return res.status(500).send({ message: 'Error logging in user' });
    }
  }
  );


app.route('/api/add-favorite')
  .post(requireAuth, async (req: Request, res: Response) => {
    const userId = res.locals.userId;
    const { city_name, location, latitude, longitude } = req.body ?? {};
    const cityName = typeof city_name === 'string' ? city_name : location;

    if (typeof cityName !== 'string' || cityName.trim() === '' ||
        typeof latitude !== 'number' || !Number.isFinite(latitude) ||
        typeof longitude !== 'number' || !Number.isFinite(longitude)) {
      return res.status(400).send({ message: 'City name, latitude, and longitude are required' });
    }

    try {
      await pool.query(
        'INSERT INTO favorite_cities(user_id, city_name, latitude, longitude) VALUES($1, $2, $3, $4)',
        [userId, cityName.trim(), latitude, longitude]
      );
      return res.status(201).send({ message: 'Favorite city added successfully' });
    } catch (error: unknown) {
      console.error('Error adding favorite city:', error);
      return res.status(500).send({ message: 'Error adding favorite location' });
    }
  });



app.listen(3000);