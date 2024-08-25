const express = require('express');
const conn = require('./Connection/connect');
const app = require('./app');

const port = process.env.PORT || 3000;



// connecting database
conn.connect((err)=>{
    if(err){
        console.error(err);
    }
    console.log("Database connected successfully");
})


// creating server
app.listen(port,()=>{
    console.log('Server has been started');
})