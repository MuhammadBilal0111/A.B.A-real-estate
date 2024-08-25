const sign_in_btn = document.querySelector('#sign-in-btn');
const sign_up_btn = document.querySelector('#sign-up-btn');
const container = document.querySelector('.container');
const email_box = document.querySelector('.email-box');
const forgetPasswordCont = document.querySelector('.forgetpassword');
const resetPassword = document.querySelector('.main');
const txt = document.querySelector('.txt');
const cancel = document.querySelector('.forget_container i');
const forgetpasswordForm = document.querySelector('#forgetpasswordForm');
const emailSuccess = document.querySelector('.email-notice');

sign_up_btn.addEventListener('click',()=>{
    container.classList.add('sign-up-mode');
})
sign_in_btn.addEventListener('click',()=>{
    container.classList.remove('sign-up-mode');
})
// show the reset password page
forgetPasswordCont.addEventListener('click',(e)=>{
    e.preventDefault();
    resetPassword.style.zIndex = 4;
    container.style.zIndex = -3;
    container.style.filter = 'blur(2px)';
    resetPassword.style.display = 'block';
})
// close the reset page
cancel.addEventListener('click',()=>{
    resetPassword.style.zIndex = -3;
    container.style.zIndex = 4;
    container.style.filter = 'none';
    resetPassword.style.display = 'none';
    email_box.value = "";
})
// manipulate the text outside the email field
email_box.addEventListener('input',(e)=>{
    const email = e.currentTarget.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(email);
    if(email === ''){
        txt.textContent = 'This field is required.';
        email_box.style.borderColor = 'rgb(238, 41, 41)';
    }
    else if(!isValidEmail){
        txt.textContent = 'Please enter a valid email address.';
        email_box.style.borderColor = 'rgb(238, 41, 41)';
    }
    else{
        txt.textContent = '';
        email_box.style.borderColor = 'green';
    }
})
document.getElementById('forgetpasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Capture form data
    const formData = new FormData(this);
    const formObject = {};
    formData.forEach((value, key) => formObject[key] = value);
    
    // Send form data to the server
    fetch('/users/forgetpassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formObject)
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data);
        if(data.data.success){
            emailSuccess.textContent = "Email has been sent successfully";
        }
        else{
            emailSuccess.textContent = `${data.data.message}`;
            emailSuccess.style.color = 'red';
        }
        
    })
    .catch(error => {
        emailSuccess.textContent = 'Network Error';
        emailSuccess.style.color = "red";
    });
});
    
