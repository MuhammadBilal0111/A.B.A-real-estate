const menu = document.getElementById("menu-icon");
const navbar = document.querySelector(".navbar");
const close = document.querySelector("#close-icon");

const loader = document.querySelector('.preloader');
const logo = document.querySelector('.preloader>h2');
const header = document.querySelector('.header');
const main = document.getElementById('main');
const footer = document.querySelector('.foooter');

const resultBox = document.querySelector(".result_box");
const inputBox = document.querySelector(".search-input");

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


setTimeout(()=>{
    loader.style.display = "none";
},2000)

setTimeout(()=>{
    main.style.display = "block";
    header.style.display = "flex";
    footer.style.display = "block";
},2000);

// home image changing effects
const Images = document.getElementById('images'); 
const images_array = ['./../Home-Images/home-image-1.jpg',
                        './../Home-Images/home-image-2.jpg',
                        './../Home-Images/home-image-3.jpg',
                        './../Home-Images/home-image-4.jpg',
                        './../Home-Images/home-image-5.jpg'];
Images.src = images_array[0];

let x = 1;
setInterval(()=>{
        Images.src = images_array[x];   
        x++;
        if(x===5){
            x=1;
        }
},2000);
// -----------------------------

// let json= {
//     "Price": "PKR7.9 Crore",
//     "ID": 34881234,
//     "Address": "DHA Phase 6, DHA Defence, Karachi, Sindh",
//     "Bathrooms": 4,
//     "Bedrooms": 5,
//     "Size/Area": "300 Sq. Yd.",
//     "Purpose": "For Sale",
//     "Type": "House",
//     "Real State Agency": "Bukhari Properties",
//     "Real State Agent Name": "Bukhari Properties  Builders"
//   }


  function addCard(feFrFs, json){
    document.querySelector(`.${feFrFs} .swiper-wrapper`).innerHTML+=`<div class="swiper-slide">
    
    <a href="/properties/${json.property_id}">
    <div class="featuredCard">
            <div class="img">
                <img src="https://media.zameen.com/thumbnails/225048243-800x600.webp" alt="">
            </div>

            <div class="text">
                <div class="price">${json.price}</div>
                <div class="location">${json.location}</div>
                <div class="saleRent">House ${json.purpose}</div>
                <div class="bedBathArea">
                    <div class="bedrooms">
                        <img src="./../icons/bedroomicon.svg" alt="">
                    </div>
                    <p>${json.bedrooms}</p>
                    <div class="bathrooms">
                        <img src="./../icons/bathroomicon.svg" alt="">
                    </div>
                    <p>${json.bathrooms}</p>
                    <div class="area">
                        <img src="./../icons/areaicon.svg" alt="">
                    </div>
                    <p>${json.area}</p>
                </div>
            </div>
            </div>
            </a>
            `
}

function removeCards(feFrFs){
    document.querySelector(`.${feFrFs} .CardsContainer`).innerHTML=""
};

// Featured cards added from database ////////
async function fetchFeaturedCardData() {
    try {
        const res = await fetch('/featuredCards');
        const data = await res.json();
        data.result.map(obj=>{
            addCard("featured",obj);
        })

    } 
    catch(err){
        console.log(err);
    }
}
fetchFeaturedCardData();
//////////////////////////////////////////////////////////////////////

// For Sale Cards added from database ////////
async function fetchForSaleCardData() {
    try {
        const res = await fetch('/forSaleCards');
        const data = await res.json();
        data.result.map(obj=>{
            addCard("forSale",obj);
        })
    }
    catch(err){
        console.log(err);
    }
}
fetchForSaleCardData();

// For Rent Cards added from database
async function fetchForRentCardData() {
    try {
        const res = await fetch('/forRentCards');
        const data = await res.json();
        data.result.map(obj=>{
            addCard("forRent",obj);
        })
    }
    catch(err){
        console.log(err);
    }
}
fetchForRentCardData();
////////////////////////////////////////////////////////////////////////////////

// code for the searching in search box respective to the given text

let availableKeywords = [];
fetch('/location') // when the webpage open it will create availableKeywords
.then((result)=>{
    return result.json();
}).then((res)=>{
    availableKeywords = [...res.data];
})
.catch(err=>{
    console.log(err);
});

// when the key of keyboard press this function will get executed
inputBox.onkeyup = function(){
    let result = [];
    let input  = inputBox.value;
    if(input.length){
        result = availableKeywords.filter((keyword)=>{
            return keyword.toLocaleLowerCase().includes(input.toLocaleLowerCase());
        });
    }
    display(result);
    if(!result.length){
        resultBox.innerHTML = '';
    }
}
function display(result){
    const content = result.map((list)=>{
        return "<li onclick = selectInput(this)>" + list + "</li>";
    })
    resultBox.innerHTML = "<ul>" + content.join('') + "</ul>";
}
function selectInput(list){
    inputBox.value = list.innerText;
    resultBox.innerHTML = '';
}

document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.nav-list li a');
    const currentPath = window.location.pathname;

    links.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});




////////////////////////////////////////////////////////////////////////////////////

// const city = document.getElementById('city');
// const property = document.getElementById('property');
// const min_range = document.getElementById('min_ran');
// const max_range = document.getElementById('max_ran');
// const min_area = document.getElementById('min_area');
// const max_area = document.getElementById('max_area');
// const beds = document.getElementById('beds');

// const search_btn = document.querySelector('.rentBuyButtons>.searchButton');

// const query_arr = [];
// const obj = {};
// search_btn.addEventListener('click',async()=>{
//     obj["location"] = inputBox.value;
//     obj["city"] = city.options[city.selectedIndex].text;
//     obj["property"] = property.options[property.selectedIndex].text;
//     obj["min_range"] = min_range.options[min_range.selectedIndex].text;
//     obj["max_range"] = max_range.options[max_range.selectedIndex].text;
//     obj["min_area"] = min_area.options[min_area.selectedIndex].text;
//     obj["max_area"] = max_area.options[max_area.selectedIndex].text;
//     obj["beds"] = beds.options[beds.selectedIndex].text;
//     obj["city"] = city.options[city.selectedIndex].text;
//     const result = await fetch('/search',{
//         method: "POST",
//         body : JSON.stringify(obj),
//         headers : {
//             "Content-type": "application/json; charset=UTF-8"
//         }
//     });
//     console.log(result);
//     // const html = await result.text(); //returns a promise that resolves with the result of parsing the response body text as a string.
//     // document.querySelector('body').innerHTML = html;
// });

// city.onchange = function(){
//     city.options[city.selectedIndex].text;
// }
// property.onchange = function(){
//     property.options[property.selectedIndex].text;
// }
// min_range.onchange = function(){
//     min_range.options[min_range.selectedIndex].text;
// }
// max_range.onchange = function(){
//     max_range.options[max_range.selectedIndex].text;
// }
// max_area.onchange = function(){
//     max_area.options[max_area.selectedIndex].text;
// }
// min_area.onchange = function(){
//     min_area.options[min_area.selectedIndex].text;
// }
// beds.onchange = function(){
//     beds.options[beds.selectedIndex].text;
// }
