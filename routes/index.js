var express = require('express');
var router = express.Router();
var multer = require('multer');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
/**
 * Config Kaiross API
 */
var Kairos = require('kairos-api');
var client = new Kairos('app_id', 'app_key');
/**
 * Config Cloudinary API
 */
var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'cloud_name',
    api_key: 'api_key',
    api_secret: 'api_secret'
});
/**
 * Display route / 
 */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});
/**
 * POST request to upload image or links images.
 */
router.post('/detect', multipartMiddleware, function(req, res, next) {
    var url = req.body.url;
    var uploadFile = req.files.image;
    if (url) {
        var params = {
            image: url
        };
        detectAge(params);
    } else {
        var tmp_path = req.files.image.path;
        cloudinary.uploader.upload(tmp_path, function(result) {
            var url = result.secure_url;
            var params = {
                image: url
            };
            detectAge(params);
        });
    }
	/**
	 * Function detect age based on Kairos API
	 * @param  {[array]} params [Array of config Kairos. In here is Image url]
	 */
    function detectAge(params) {
        client.detect(params).then(function(result) {
            var data = result.body.images[0];
            console.log(data.faces[0]['attributes']['gender']['femaleConfidence']);
            if (result.body.images[0].status == 'Complete') {
                res.render('detect', {
                    image: params.image,
                    data: data,
                });
            } else {
                res.send("Cannot detect faces !")
            }
        }).catch(function(err) {
            console.log(err);
        });
    }
});
module.exports = router;
