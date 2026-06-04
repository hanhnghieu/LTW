require("dotenv").config();

const config = {
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
server: process.env.DB_SERVER,
port: parseInt(process.env.DB_PORT) || 1433,
database: process.env.DB_NAME,
options: {
    encrypt: true,
    trustServerCertificate: true
}

};

module.exports = config;
