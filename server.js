const express = require('express');
const jwt = require('jsonwebtoken');
const secretKey = 'classProject';
const app = express();
const port = 3000;

app.use(express.json()); // for parsing application/json

app.post('/signUp', async (req, res) => {
  
  let hashedPassword = await hashPassword(req.body.password)
  let email = req.body.email
  res.send({token: jwt.sign(await sendToDataBase(email,hashedPassword),secretKey)});


//   console.log(req.body);
//   res.status(200).send('Received your request!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

async function hashPassword(password){
   let hashedPassword 
    await bcrypt.genSalt(10,async function (err,salt){
       await  bcrypt.hash(password,salt,function(err,hash){
            hashedPassword = hash
        })
    })
    return password
}
async function sendToDataBase(email,password){
        let memberId;   
    // the email and password is the thing that would be sent 
        // memberId= uncomment this when ready 

        // ^ sql code here , once sent return a memberid 
        return memberId;
}
function getJwtSigned(id){

}