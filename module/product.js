var mongoose = require('mongoose');
var productSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    image_public_id: String,
    description: String,
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        }
    ]
});
var Product = mongoose.model("Product", productSchema);
module.exports = Product;