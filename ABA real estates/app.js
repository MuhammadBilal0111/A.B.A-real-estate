const express = require('express');
const router = require('./Router/Routes');
const userRoutes = require('./Router/authRoute');
const properyRoutes = require('./Router/propertyRoutes');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views','./public/views');
app.use(express.static(path.join(__dirname,'public')))
app.use(bodyParser.json()); // used to get the login details
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.json());

app.use('/',router);
app.use('/properties',properyRoutes); // properties routes
app.use('/users',userRoutes); // users routes


// The app.use() function is used to define middleware. We pass a function that is executed for every request.
//  If none of the defined routes match the request, this middleware function will handle the request and respond 
// with the 404 HTML page.
app.all('*',(req,res)=>{ // '*' represent all routes
    res.status(404).sendFile(path.join(__dirname,'public','views','404.html'));
});
module.exports = app;