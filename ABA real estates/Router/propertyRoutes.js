const express = require('express');
const controller = require('./../Controller/propertyController');
const upload = require('./../middleware/multer.middleware');
const router = express.Router();

const uploadFields = upload.fields([
    {name:'img1', maxCount: 1},
    {name:'img2', maxCount: 1},
    {name:'img3', maxCount: 1}
]);
router.route('/post').get(controller.postProperty);
router.route('/:id').get(controller.validate,controller.getIdHouseDetails);
router.route('/propertyPosted').post(uploadFields,controller.sendPostPropertyDetails);

module.exports = router;