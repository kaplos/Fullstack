const bcrypt = require('bcrypt');
function SignUpForm(event){
    event.preventDefault();
    let signUpForm = new FormData(document.getElementById('member-signup'));
    let data = Object.fromEntries(signUpForm.entries())

    fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('member-token',data.token);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    

    sendToDataBase(signUpForm.get('email'),signUpForm.get('password'))

}
function sendToDataBase(email,password){
    // the email and password is the thing that would be sent 
}
