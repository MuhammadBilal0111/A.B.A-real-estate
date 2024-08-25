const express = require('express');
const path = require('path');
const ejs = require('ejs');
const model = require('./../Model/model');
const conn = require('./../Connection/connect');
const transporter = require('./../Email/send-email');
const convertToPakistaniCounting = require('./../Utils/currencyConversion');


// const createTemplate = (template, result, id)=>{
//     console.log(result);
//     let output = template.replace(/{{%price%}}/g,result.price);
//     output = output.replace(/{{%location%}}/g,result.location);
//     output = output.replace(/{{%bedroom%}}/g,result.bedrooms+' Bedroom ');
//     output = output.replace(/{{%bathroom%}}/g,result.baths+' Bathroom ');
//     output = output.replace(/{{%type%}}/g,result.property_type);
//     output = output.replace(/{{%size%}}/g,result.location);
//     output = output.replace(/{{%propertyID%}}/g,result.property_id);
//     output = output.replace(/{{%purpose%}}/g,result.purpose);

//     return output;
// }

// code for showing authentication page

const sendEmail = async (transporter, mailOptions) => {
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email has been sent successfully');
    }
    catch(error){
        console.error(error);
    }
};

exports.showAuthenticationPage = (req,res)=>{
    console.log(req.cookie);
    const filePath = path.join(__dirname,'../','public','views','authenticate.html');
    res.status(200).sendFile(filePath);
}
// code for sending home page files
exports.showHome = (req,res)=>{
    const filePath = path.join(__dirname,'../','public','views','home.html');
    res.status(200).sendFile(filePath);
}
// this function is used to get the city and location from the database
exports.getLocationDetails = async (req,res)=>{
    let data = [];
    const sql = "SELECT DISTINCT CONCAT(location,', ',city) AS location FROM location"
    const query = conn.query(sql);
    query.stream()
    .on('data',(row)=>{
        data.push(row.location);
    })
    .on('end',()=>{
        res.status(200).json({
                status : 'success',
                length : data.length,
                data,
            }
        );
    })
    .on('error',()=>{
        res.status(500).json({
            message: 'Error retrieving location details',
        });
    })
}
exports.details = (req,res)=>{
    const sql = 'SELECT * FROM housedataset1 natural join location;';
    conn.query(sql,(result)=>{
        if(err){
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
            return ;
        }
        const cont = JSON.stringify(result,null,2);
        res.status(200).json(JSON.parse(cont));
    })
}
exports.featuredCards = (req,res)=>{
    const sql = 'SELECT * FROM housedataset1 natural join location LIMIT 10';
    conn.query(sql,(err,result)=>{
        result = result.map(obj => ({ ...obj, price: convertToPakistaniCounting(obj.price)}));
        console.log(result);
        res.status(200).json({
            status:'success',
            result
        });
    })
}
exports.fetchForSaleCards = (req,res)=>{
    conn.query('SELECT * FROM housedataset1 H natural join location L WHERE H.purpose = "For Sale" LIMIT 10',(err,result)=>{
        result = result.map(obj => ({ ...obj, price: convertToPakistaniCounting(obj.price)}));
        res.status(200).json({
            status:'success',
            result
        });
    })
}
exports.fetchForRentCards = (req,res)=>{
    conn.query('SELECT * FROM housedataset1 H natural join location L WHERE H.purpose = "For Rent" LIMIT 10',(err,result)=>{
        result = result.map(obj => ({ ...obj, price: convertToPakistaniCounting(obj.price)}));
        res.status(200).json({
            status:'success',
            result
        });
    })
}
// code for showing cards dynamically
exports.searchProperties = async(req,res)=>{
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const skip = (page - 1)*limit;
    
    let  {city, propertyType, minPrice, maxPrice, min_area, max_area, beds, search} = req.body;

    minPrice = Number(minPrice);
    maxPrice = Number(maxPrice);
    min_area = Number(min_area);
    max_area = Number(max_area);
    beds = Number(beds);
    
    search = search.split(',')[0];
    const sql = `SELECT * FROM housedataset1 H natural join location L WHERE (L.location=? AND L.city=? AND H.property_type=?  AND (H.price>=? AND H.price<=?) AND (H.area>=? AND H.area<=?)) LIMIT ? OFFSET ? `;
    conn.query(sql,[search, city, propertyType, minPrice, maxPrice, min_area, max_area, limit, skip],async(err,result)=>{
        if(!err){
            result = result.map(obj => ({ ...obj, price: convertToPakistaniCounting(obj.price)}));
            const renderedCard = result.map((item)=>{ // returns array of promises
                return ejs.renderFile(path.join(__dirname,'../','public/views/cardTemplate.ejs'),{result:item});
            });
            const content = await Promise.all(renderedCard);
            const finalResult = await ejs.renderFile(path.join(__dirname,'../','public/views/HouseDetailsCardsTemplate.ejs'),{results:content});
            res.status(200).send(finalResult);
        }
        else{
            console.log(err);
            res.status(404).sendFile(path.join(__dirname,'../','public','views','404.html'));
        }
    })
}
// render contact page
exports.contact = (req,res)=>{
    const filePath = path.join(__dirname,'../public/views/contact.html');
    res.status(200).sendFile(filePath);
}
// send About email
exports.sendAboutEmail = async (req,res)=>{
    // Populate the email template
    let emailTemplate = await ejs.renderFile(path.join(__dirname,'../','public/views/complaintEmailTemplate.ejs'),{result:req.body});
    const mailOptions = {
        from: req.body.Email, // Sender address with name
        to: 'm.bilal0111@gmail.com', // Receiver's email address
        subject: "User Complaint", // Subject line
        html: emailTemplate
    };
    try{
        await sendEmail(transporter.transporter, mailOptions);
        return res.status(200).json({
            status: 'success',
            data:{
                send: true,
                message: "Email send succesfully"
            }
        })
    }
    catch(error){
        return res.status(500).json({
            status: 'failed',
            data:{
                send: false,
                message: "Email did not send "
            }
        })
    }

}

// code for sending email
exports.sendEmail = (req,res)=>{
    // console.log(req.body);
    const mailOptions = {
        from: 'Bilal Bilal <bilalmuhammad0324@gmail.com>', // Sender address with name
        to: req.body.Email, // Receiver's email address
        subject: "Interest in House Purchase Inquiry", // Subject line
        text: "hello",  // Plain text body
        html:  `<h4>Hello, I am <b>${req.body.Name}<b></h4>
                <p>${req.body.inquire}</p>
                <p>Contact: ${req.body.Phone}</p>`, // HTML body
    };
    const sendEmail = async (transporter, mailOptions) => {
        try {
            await transporter.sendMail(mailOptions);
            console.log('Email has been sent successfully');
        }
        catch(error){
            console.error(error);
        }
    };
    sendEmail(transporter.transporter, mailOptions);
}
