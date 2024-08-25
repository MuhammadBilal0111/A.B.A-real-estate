const convertToPakistaniCounting = (number)=>{
    const lakh = 100000;
    const crore = 10000000;
    if(number>=crore){
        return number / crore + " " + 'crores';
    }
    else if(number>=lakh){
        return number / lakh + " " + 'lakh';
    }
    else{
        return number.toString();
    }
}
module.exports = convertToPakistaniCounting;