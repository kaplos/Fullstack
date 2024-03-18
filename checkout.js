async function collectPayment(event){
    event.preventDefault();
    let form = new FormData(event.target);
    fetch('http//:localhost:3001/checkout',{
        method: 'POST',
        headers: {
            'Content-type':'application/json',
            'Bearer' : localStorage.getItem('member-token'),
        },
        body: JSON.stringify({
            amount: form.get('membership_price'),

        })
    })
    .then(request => request.json())
    .then(req => console.log(req))
}
paypal.Buttons({
       createOrder: function () {
        let form = new FormData(document.getElementById("membership_signup"));
        return fetch('http//:localhost:3001/checkout',{
            method: 'POST',
            headers: {
                'Content-type':'application/json',
                'Bearer' : localStorage.getItem('member-token'),
            },
            body: JSON.stringify({
                amount: form.get('membership_price'),
                userInfo: Object.fromEntries(form.entries())
            })
        })
        .then(res => {

          if  (res.ok) return res.json()
          return res.json().then(json => Promise.reject(json))
        })
        .then(({id})=>{
            return id
        }).catch(error=>{
            console.log(error)
        })
    },onApprove: function(data,actions){
        actions.order.capture().then(function(details){

        })

    }
}).render('#paypal');