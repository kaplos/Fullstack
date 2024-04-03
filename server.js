const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sql = require('mssql');
const cors = require('cors');
const paypal = require('@paypal/checkout-server-sdk');
const Environment = paypal.core.SandboxEnvironment;

const app = express();
app.use(cors())
const port = 3001; //changed port to 3001 to avoid conflict with React's default port 3000
const secretKey = 'classProject';
let clientId = 'AcrESj9TwZADG9sQ4IxvQEUhkWuLcglxC-dVDhfTzVrRXetcByjXWUUSOBuZuUP7Hjcoa6p0OaHLc4ez';
let clientSecret ='EChVbUdgUoGnCh_f6_9VnxVP9dw7nFnEC0vj275s-sCsGLT3wp5HoN1Zzdj7lIDRki5Gysvmo6Q2Avwa'
let paypalClient = new paypal.core.PayPalHttpClient(new Environment(clientId,clientSecret));
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
    // app.post('/signUp',(req,res)=>{
    //     res.setHeader('Set-Cookie', 'token=i am a token;');
    //     res.json({ redirectUrl: '/Fullstack/index.html' });
    // })
    // app.get('/print',(req,res)=>{
    //     console.log(req.headers);
    // })
app.post('/signUp', async (req, res) => {
    if(await checkIfContained(req.body.email)){
        let token = await jwtSign(await login(req.body.email,req.body.password))
        res.status(200).json({ token: token, redirectUrl: '/index.html' });
    }else {
        try {
            const hashedPassword = await hashPassword(req.body.password);
            const email = req.body.email;
            const memberId = await sendToDataBase(email, hashedPassword);
            let token = await jwtSign(memberId)
            // console.log(token);
            res.send({ token });
            res.redirect('/index.html');
        } catch (error) {
            console.error(error);
            res.status(500).send('An error occurred');
        }
    }
});
app.post('/checkout',async (req,res)=>{
    const request = paypal.orders.OrdersCreateRequest()
    request.prefer('return=minimal');
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units:[
            {
                amount:{
                    currency_code:'USD',
                    value: req.body.amount
                }
            }
        ]
    })
})
try{
    (async ()=>{
        const order = await paypalClient.execute(request);
    console.log(order);
    });
}catch(e){
    req.send(500).json({error :e.message})

}
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
        // console.log(result.recordset[0].memberID);
    return result.recordset[0].memberID;
}
async function jwtSign(memberId){
    return jwt.sign({ memberId }, secretKey);
}
async function checkIfContained(email){
    let pool = await sql.connect(dbConfig);
    const result = await pool.request()
        .input('Email', sql.VarChar, email)
        .query('SELECT email FROM dbo.Members WHERE email = @Email');
    return result.recordset.length > 0;
} 
async function login(email, password){
    let pool = await sql.connect(dbConfig);
    const result = await pool.request()
        .input('Email', sql.VarChar, email)
        .input('Password', sql.VarChar, password)
        .query('SELECT email, password FROM dbo.Members WHERE email = @Email AND password = @Password');
        return result.recordset.length > 0 ? result.recordset[0].memberID : null;
    }
// Function `getJwtSigned` seems to be unused, you might want to remove or implement it based on your needs.

// async function getTopFiveRows() {
//     let pool = await sql.connect(dbConfig);
//     const result = await pool.request()
//         .query('SELECT TOP 5 * FROM dbo.Members');
//     console.log(result.recordset);
// }

// (async () =>{await getTopFiveRows()})