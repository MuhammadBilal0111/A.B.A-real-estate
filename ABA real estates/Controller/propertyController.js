const path = require('path');
const convertToPakistaniCounting = require('./../Utils/currencyConversion');
const middleware = require('./../middleware/multer.middleware');
const uploadOnCLoudinary = require('./../Utils/cloudinary');
const conn = require('./../Connection/connect');

const uniqueID = function generateRandom7DigitNumber() {
    const min = 1000000; // Minimum 7-digit number
    const max = 9999999; // Maximum 7-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// middleware is used to validate that the give id of property is avalibale in the database or not
exports.validate = (req,res,next)=>{
    const id = req.params.id;
    conn.query('SELECT * FROM housedataset1 H natural join location L where H.property_id=(?)',[id],(err,result)=>{
        if(result.length === 0){
            res.status(404).sendFile(path.join(__dirname,'../','public','views','404.html'));
            return ;
        }
        next();
    })
}
// function for getting details of specific property id
exports.getIdHouseDetails = (req,res)=>{
    const id = req.params.id;
    conn.query('SELECT * FROM housedataset1 H natural join location L where H.property_id=(?)',[id],(err,result)=>{
        result = result.map(obj => ({ ...obj, price: convertToPakistaniCounting(obj.price)}));            
        res.status(200).render('template',{result:result[0]});
    })
}

// getting post property form
exports.postProperty = (req,res)=>{
    const filepath = path.join(__dirname,'../','public','views','postProperty.html');
    res.status(200).sendFile(filepath);
}
// post pictures 
exports.sendPostPropertyDetails = async(req,res)=>{
    const propertyID = uniqueID();
    const locationID = uniqueID();
    const propertyData = {
        property_id: propertyID,
        location_id: locationID,
        price: req.body.price,
        area: req.body.area,
        property_type: req.body.property_type,
        purpose: req.body.purpose,
        bedrooms: req.body.bedrooms,
        bathrooms: req.body.bathrooms,
        description: req.body.description
        // location: req.body.location,
        // city: req.body.city,
        // latitude: req.body.latitude,
        // longitude: req.body.longitude,
        // description: req.body.description
    };
    const locationData = {
        location_id: propertyData.location_id,
        location: req.body.location,
        city: req.body.city,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
    }
    const insertPropertyQuery = 'INSERT INTO housedataset1 SET ?';
    conn.query(insertPropertyQuery, propertyData, async(err) => {
        if (err) {
            console.error(err);
            conn.rollback(function() {
                console.error(err);
                return res.status(500).json({
                    status: "failed",
                    error: {
                        message: 'Error inserting into housesdataset'
                    }
                });
            });
        }
        const insertLocationQuery = 'INSERT INTO location SET ?';
        conn.query(insertLocationQuery,locationData,(err,result)=>{
            if(err){
                conn.rollback(function() {
                    console.error(err);
                    return res.status(500).json({
                        status: "failed",
                        error: {
                            message: 'Error inserting into another_table'
                        }
                    });
                });
            }
            conn.commit(function(err) {
                if (err) {
                    conn.rollback(function() {
                        console.error(err);
                        return res.status(500).json({
                            status: "failed",
                            error: {
                                message: 'Error committing transaction'
                            }
                        });
                    });
                }
            });
        })

            
        const files = req.files;
        const filePromises = [];
        Object.keys(files).forEach(key => {
            files[key].forEach(file => {
                // console.log(file.path);
                filePromises.push((async()=>{
                    try{
                        const response = await uploadOnCLoudinary(file.path);
                        // console.log(response);
                        const insertFileQuery = 'INSERT INTO property_images (property_id, file_name) VALUES (?, ?)';
                        return new Promise((resolve,reject)=>{
                            conn.query(insertFileQuery, [propertyID, response.secure_url], err => {
                                if (err) {
                                  return reject(err);
                                }
                                resolve();
                            });
                        });
                    }
                    catch(error){
                        console.error('Error uploading to Cloudinary:', error);
                        throw error;
                    }
                }
                )());
            });
        });
        try{
            await Promise.all(filePromises);
            res.status(201).json({
                status: 'success',
                data: {
                  success: true,
                  id: propertyID
                }
            });
        }
        catch(error){
            console.error('Error during file upload and database insert:', error);
            res.status(500).json({
                status: 'failed',
                error: {
                message: 'Error saving property images'
                }
            });
        }
    });
}