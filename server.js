const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sql = require('mssql');

const app = express();
const port = 3001; //changed port to 3001 to avoid conflict with React's default port 3000
const secretKey = 'classProject';

// Database configuration for SQL Server (Adjust with your AWS RDS credentials)
const dbConfig = {
    user: 'admin',
    password: 'yourfat123',
    server: 'database-2.c5g95bzztctu.us-east-1.rds.amazonaws.com'
    , // Your AWS RDS endpoint
    database: 'MemberLogin',
    options: {
        encrypt: true,
        trustServerCertificate: true // Set to true for Azure. For AWS, adjust as necessary based on your SSL setup
    }
};

app.use(express.json()); // for parsing application/json

app.post('/signUp', async (req, res) => {
    try {
        const hashedPassword = await hashPassword(req.body.password);
        const email = req.body.email;
        const memberId = await sendToDataBase(email, hashedPassword);
        const token = jwt.sign({ memberId }, secretKey);
        res.send({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});


    
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

async function sendToDataBase(email, password) {
    let pool = await sql.connect(dbConfig);
    const result = await pool.request()
        .input('Email', sql.VarChar, email)
        .input('Password', sql.VarChar, password)
        .input('name', sql.VarChar, email) // Assuming Username can be the same as Email for simplicity
        .query('INSERT INTO dbo.Members (name, email, password) OUTPUT INSERTED.memberID VALUES (@name, @email, @password)');
    return result.recordset[0].memberID;
}

// Function `getJwtSigned` seems to be unused, you might want to remove or implement it based on your needs.
