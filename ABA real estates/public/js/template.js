const menu = document.getElementById("menu-icon");
const navbar = document.querySelector(".navbar");
const close = document.querySelector("#close-icon");
menu.addEventListener("click",(e)=>{
    navbar.style.top="100%";
    menu.style.display="none";
    close.style.display="block";
})
close.addEventListener("click",()=>{
    navbar.style.top="-1200px";
    menu.style.display="block";
    close.style.display="none";
});
const sr = ScrollReveal({
    origin:"left" ,
    distance:'100px',
    duration:2500,
    reset:true
})
sr.reveal ('.searchCard',{delay:300});