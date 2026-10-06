"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("./db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const jwt_1 = __importDefault(require("./jwt"));
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
//app.use(cors());
var corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
};
app.use((0, cors_1.default)(corsOptions));
// POST /api/auth/register { username, password } -> 201
app.route('/api/auth/register')
    .post(async (req, res) => {
    const { username, password } = req.body ?? {};
    if (typeof username !== 'string' || typeof password !== 'string' || username.trim() === '' || password.trim() === '') {
        return res.status(400).send({ message: 'Username and password are required' });
    }
    try {
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        await db_1.default.query('INSERT INTO users(username, password_hash) VALUES($1, $2)', [username, hashedPassword]);
        return res.status(201).send({ message: 'User registered successfully' });
    }
    catch (error) {
        const dbError = error;
        if (dbError.code === '23505') {
            return res.status(409).send({ message: 'Username already exists' });
        }
        console.error('Error registering user:', error);
        return res.status(500).send({ message: 'Error registering user' });
    }
});
// POST /api/auth/login { username, password } -> 200 { token }
app.route('/api/auth/login')
    .post(async (req, res) => {
    const { username, password } = req.body ?? {};
    if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).send({ message: 'Username and password are required' });
    }
    try {
        const result = await db_1.default.query('SELECT password_hash,id FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).send({ message: 'Invalid username or password' });
        }
        const isMatch = await bcrypt_1.default.compare(password, result.rows[0].password_hash);
        if (isMatch) {
            if (typeof jwt_1.default !== 'string' || jwt_1.default.length === 0) {
                console.error('JWT secret is not configured');
                return res.status(500).send({ message: 'Authentication is not configured' });
            }
            const token = jsonwebtoken_1.default.sign({ userId: result.rows[0].id }, jwt_1.default, { expiresIn: '1h' });
            return res.status(200).send({ token });
        }
        else {
            return res.status(401).send({ message: 'Invalid username or password' });
        }
    }
    catch (error) {
        console.error('Error logging in user:', error);
        return res.status(500).send({ message: 'Error logging in user' });
    }
});
app.route('/api/add-favorite')
    .post(requireAuth_1.default, async (req, res) => {
    const userId = res.locals.userId;
    const { city_name, location, latitude, longitude } = req.body ?? {};
    const cityName = typeof city_name === 'string' ? city_name : location;
    if (typeof cityName !== 'string' || cityName.trim() === '' ||
        typeof latitude !== 'number' || !Number.isFinite(latitude) ||
        typeof longitude !== 'number' || !Number.isFinite(longitude)) {
        return res.status(400).send({ message: 'City name, latitude, and longitude are required' });
    }
    try {
        await db_1.default.query('INSERT INTO favorite_cities(user_id, city_name, latitude, longitude) VALUES($1, $2, $3, $4)', [userId, cityName.trim(), latitude, longitude]);
        return res.status(201).send({ message: 'Favorite city added successfully' });
    }
    catch (error) {
        console.error('Error adding favorite city:', error);
        return res.status(500).send({ message: 'Error adding favorite location' });
    }
});
app.listen(3000);
