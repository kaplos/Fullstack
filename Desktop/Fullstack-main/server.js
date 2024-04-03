// Required modules for the server
const express = require('express'); // Express framework for handling HTTP requests
const jwt = require('jsonwebtoken'); // For generating and validating JSON Web Tokens
const bcrypt = require('bcrypt'); // For hashing passwords before storing them
const sql = require('mssql'); // SQL Server client for Node.js
const cors = require('cors'); // Middleware to enable CORS (Cross-Origin Resource Sharing)
const paypal = require('@paypal/checkout-server-sdk'); // PayPal SDK for handling payments
const Environment = paypal.core.SandboxEnvironment; // Using PayPal's sandbox environment for testing

// Initialize the Express app and middleware
const app = express();
app.use(cors()) // Enable CORS for all routes
const port = 3001; // Port number for the server, avoiding conflict with React's default port (3000)
const secretKey = 'classProject'; // Secret key for JWT signing

// PayPal client configuration
let clientId = '...'; // PayPal client ID
let clientSecret = '...'; // PayPal client secret
let paypalClient = new paypal.core.PayPalHttpClient(new Environment(clientId, clientSecret));

// Database configuration for SQL Server
const dbConfig = {
    user: 'admin',
    password: 'yourfat123',
    server: 'database-2.c5g95bzztctu.us-east-1.rds.amazonaws.com', // Your SQL Server endpoint
    database: 'MemberLogin',
    options: {
        encrypt: true, // Encryption for Azure, may need adjustment for AWS
        trustServerCertificate: true // For SSL certificate trust, depends on setup
    }
};

app.use(express.json()); // Middleware to parse JSON bodies

// Route for user sign-up
app.post('/signUp', async (req, res) => {
    try {
        const hashedPassword = await hashPassword(req.body.password); // Hash the password
        const email = req.body.email;
        const memberId = await sendToDataBase(email, hashedPassword); // Store user data
        const token = jwt.sign({ memberId }, secretKey); // Sign a JWT with user ID
        res.send({ token }); // Respond with the token
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred'); // Handle errors
    }
});

// Route for handling PayPal checkout
app.post('/checkout', async (req, res) => {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=minimal');
    request.requestBody({
        intent: 'CAPTURE', // PayPal payment intent
        purchase_units: [
            {
                amount: {
                    currency_code: 'USD',
                    value: req.body.amount // Set payment amount
                }
            }
        ]
    });

    try {
        const order = await paypalClient.execute(request); // Execute payment request
        console.log(order);
    } catch (e) {
        res.status(500).json({error: e.message}); // Handle payment errors
    }
});

// Starting the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// Helper function to hash passwords
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt
    return hashedPassword;
}

// Helper function to insert user data into the database
async function sendToDataBase(email, password) {
    let pool = await sql.connect(dbConfig); // Connect to the database
    const result = await pool.request()
        .input('Email', sql.VarChar, email) // Set email parameter
        .input('Password', sql.VarChar, password) // Set password parameter
        .input('name', sql.VarChar, email) // Use email as username for simplicity
        .query('INSERT INTO dbo.Members (name, email, password) OUTPUT INSERTED.memberID VALUES (@name, @email, @password)'); // Insert query
    return result.recordset[0].memberID; // Return the new user's ID
}


