var express = require('express');
var router = express.Router();
var Product = require("../module/product");
var imagePrestring = "https://res.cloudinary.com/juechen/image/upload/c_pad,h_400,w_300/v";
//Upload image configuration
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({
    storage: storage,
    fileFilter: imageFilter
});
var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
//=====================
//Product Routes
//=====================

//Get all products
router.get('/', function (req, res) {
    Product.find({}, function (err, products) {
        if (err) {
            console.log(err);
            req.flash("error", err.message);
            res.redirect('back');
        } else {
            res.render('products/products', {products: products});
        }
    });
});

//Post a new product
router.post('/', upload.single('local_image'), function (req, res) {
    var name = req.body.name;
    var price = req.body.price;
    var description = req.body.description;
    var image;
    var image_public_id;
    cloudinary.uploader.upload(req.file.path, function (result) {
        image_public_id = result.public_id;
        image = imagePrestring + result.version + "/" + result.public_id + "." + result.format;
        console.log(result.public_id);
        console.log(result);
    }).then(function () {
        var newProduct = {
            name: name,
            price: price,
            description: description,
            image: image,
            image_public_id: image_public_id
        };
        Product.create(newProduct, function (err, product) {
            if (err) {
                req.flash("error", err.message);
                res.redirect('back');
            } else {
                console.log('add a new product');
                console.log(product);
                res.redirect('/products');
            }
        });
    });
});

//Add a new product
router.get('/new', function (req, res) {
    res.render('products/new');
});

//Show a product route
router.get('/:id', function (req, res) {
    Product.findById(req.params.id).populate('comment').exec(function (err, foundProduct) {
        if(err){
            req.flash("error", err.message);
            res.redirect('back');
        }else {
            res.render('products/show', {product: foundProduct});
        }
    });
});
//Update a product routes
router.get('/:id/edit', function (req, res) {
    Product.findById(req.params.id, function (err, foundProduct) {
        if (err) {
            req.flash("error", err.message);
            res.redirect('/products');
        } else {
            res.render('products/edit', {product: foundProduct});
        }
    });
});
//export module
module.exports = router;