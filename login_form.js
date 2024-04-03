function SignUpForm(event){
    event.preventDefault();
    let signUpForm = new FormData(document.getElementById('member-signup'));
    let data = Object.fromEntries(signUpForm.entries())

    fetch('http://localhost:3001/signUp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        
        // document.cookie = `member-toeken=${token}; path=/; secure; samesite=strict`;
        window.location.href = `${data.redirectUrl}`;
        // sessionStorage.setItem('member-token',data.token);
    })
    .catch((error) => {
        console.error('Error:', error);
    });


}

