import { createPool } from 'mysql2/promise'

const pool = createPool({
    host: 'localhost',
    multipleStatements: true,
    port: '3306',
    user: 'root',
    password: '123456',
    database: 'peruscale'
});

export default pool