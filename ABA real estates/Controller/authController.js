const dotenv = require('dotenv');
dotenv.config({path:'./Config/config.env'});
const jwt = require('jsonwebtoken');
const conn = require('../Connection/connect');
const bycrypt = require('bcryptjs');
const transporter = require('./../Email/send-email');
const ejs = require('ejs');
const util = require('util');
const crypto = require('crypto');
const path = require('path');


// create a token
const signToken = (id)=>{
    return jwt.sign({id},process.env.SECRET_STRING,{
        expiresIn : process.env.LOGIN_EXPIRES,
    })
}
// create a cookie with jwt
const createResponse = (user,statusCode,res)=>{
    const token = signToken(user.email);
    const options = {
        maxAge : process.env.LOGIN_EXPIRES,
        httpOnly : true
    }
    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }
    res.cookie('jwt',token,options); // create cookie of jwt in header
    // res.status(statusCode).json({
    //     status :"success",
    //     token,
    //     data : {
        //         user
        //     }
        // })
    console.log('data added successfully');
    res.status(201).redirect('/home');
}
// comparing passwords 
const comparePasswordInDb = async (password,hashPassword)=>{
    return await bycrypt.compare(password,hashPassword);
}
// code for sign up or creating new account
exports.signUp = async (req,res)=>{
    const {firstname,lastname,email,password} = req.body;
    const sql = `INSERT INTO authentication VALUES (?, ?, ?, ?, ? )`;
    const hashedPassword = await bycrypt.hash(password,12);
    
    conn.query(sql,[null, firstname,lastname,email,hashedPassword],(err,result)=>{
        if(err){
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        }
        else{
            createResponse(req.body,201,res);
        }
    });
}

// code for login
exports.login = async (req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        res.status(400).json({error : "Please provide email ID and password for login in !" });
    }
    const sql = `SELECT email,password FROM authentication WHERE email=(?)`;
    conn.query(sql,[req.body.email],async(err,result)=>{ // result is an array like object
        if(result.length===0 || !(await comparePasswordInDb(password,result[0].password))){
            // console.log('Incorrect Email or password!');
            return res.status(404).json({
                status : 'failed',
                data:{
                    success : false,
                    message : 'Incorrect Email or Password'
                }
            })
        }
        else{
            console.log(result[0].password);
            createResponse(req.body,200,res);
        }
    });
}
exports.protect = async(req,res,next)=>{
    let token;
    // 1. check token exist
    const testToken = req.headers.authorization;
    if(testToken && testToken.startsWith('Bearer')){
        token = testToken.split(' ')[1];
    }
    if(!token){
        return res.status(400).json({
            error : "You are not logged in !"
        })
    }
    // 2. if token is valid
    const decodedToken = await util.promisify(jwt.verify)(token,process.env.SECRET_STRING);
    console.log(decodedToken);
    
    // 3. check user exist in db
    const sql = 'SELECT * FROM signupdetails WHERE email = (?)';
    conn.query(sql,[decodedToken.id],(err,result)=>{
        if(err){
            console.error(err);
        }
        else{
            if(result.length===0){
                res.status(400).json({
                    error :'user not found'
                })
            }
            else{
                res.status(200).json({
                    status : 'success',
                    result
                })
            }
        }
    })
    next();
}

// Method to create reset password token and update the user record in the database
const createResetPasswordToken = async () => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expireTime = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
    return resetToken;
};
exports.forgetPassword = async(req,res,next)=>{
    const email = req.body.email;
    const sql = 'SELECT * FROM authentication WHERE email=(?)';
    conn.query(sql,[email],async(err,result)=>{
        if(!err){
            if(result.length===0){
                return res.status(404).json({
                    status : 'failed',
                    data:{
                        success : false,
                        message : 'we could not find the user with given email'
                    }
                })
            }
            const resetToken = await createResetPasswordToken();
            const resetUrl = `${req.protocol}://${req.get("host")}/users/resetPassword/${resetToken}`;
            
            result = JSON.parse(JSON.stringify(result[0]));
            result.resetUrl = resetUrl;
            result.password = undefined;

            // conn.query('UPDATE users SET long_token = ?, token_exp = ? WHERE user_id = ?',[resetToken, new Date(), result.user_id],(err)=>{
            //     if(err){
            //         console.log(err);
            //         console.log('Internal Server error');
            //     }
            // });

            try{
                let emailTemplate = await ejs.renderFile(path.join(__dirname,'../','public/views/forgetPasswordEmailTEmplate.ejs'),{result});
                const mailOptions = {
                    from: 'm.bilal0111@gmail.com', // Sender address with name
                    to:  req.body.email, // Receiver's email address
                    subject: "Password change request received", // Subject line
                    html: emailTemplate
                };
                await transporter.transporter.sendMail(mailOptions);
                res.status(200).json({
                    status : 'success',
                    data:{
                        success :true,
                        message : 'Email has been sent Successfully!'
                    }
                })
            }
            catch(err){
                // console.log(err);
                res.status(500).json({
                    status : 'failed',
                    data:{
                        success : false,
                        message : 'Network Error'
                    }
                })
            }
        }
    })
}

exports.resetPassword = async(req,res)=>{
    res.status(201).sendFile(path.join(__dirname,'../public/views/resetPassword.html'));
    // conn.query('SELECT * FROM users WHERE long_token=?',[req.params.token],async(err,result)=>{
    //     const hashedPassword = await bycrypt.hash(req.body.password,12);
    //     const userID = result[0].user_id;
    //     conn.query('UPDATE users SET long_token = ?, password=? WHERE user_id = ?',[null,hashedPassword, userID],(err)=>{
    //         if(err){
    //             console.log(err);
    //             console.log('Internal Server error');
    //         }
    //         else{
    //             console.log('sahi ja rah h');
    //         }
    //     });
    // })
}