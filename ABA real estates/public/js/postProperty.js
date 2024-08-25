const redirect = document.querySelector("ul>#post");
redirect.addEventListener('click',()=>{
    fetch('/postProperty')
        .then((result)=>{
            console.log(result);
        })
}) 