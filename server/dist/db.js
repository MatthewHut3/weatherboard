"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Should create one Pool from pg and export it for use in other files
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
}
const pool = new pg_1.Pool({
    connectionString
});
exports.default = pool;
