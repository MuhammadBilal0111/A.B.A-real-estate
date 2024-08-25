const express = require('express');
const controller = require('../Controller/routeController');
const router = express.Router();



router.route('/').get(controller.showAuthenticationPage);
router.route('/home').get(controller.showHome);
router.route('/contact').get(controller.contact);
router.route('/contact').post(controller.sendAboutEmail);

router.route('/details/send-email').post(controller.sendEmail);
router.route('/details').get(controller.details);
router.route('/search-properties').post(controller.searchProperties);
router.route('/location').get(controller.getLocationDetails);

router.route('/featuredCards').get(controller.featuredCards);
router.route('/forSaleCards').get(controller.fetchForSaleCards);
router.route('/forRentCards').get(controller.fetchForRentCards);


module.exports = router;