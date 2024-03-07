import { createPool } from 'mysql2/promise'
import 'dotenv/config'

const pool = createPool({
    host: process.env.DB_HOST,
    multipleStatements: true,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

export default pool
