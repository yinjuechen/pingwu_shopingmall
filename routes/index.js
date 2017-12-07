var express = require('express');
var router = express.Router();
var User = require('../module/user');
var passport = require('passport');
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

//Sign up routes
router.get('/register', function (req, res) {
    res.render('register/register');
});
router.post('/register', function (req, res) {
    var username = req.body.username;
    var email = req.body.email;
    var newUser = new User({
        username: username,
        email: email
    });
    console.log(typeof req.body.password);
    if (req.body.password === req.body.password_confirm) {
        User.register(newUser, req.body.password, function (err, user) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect('back');
            }
            passport.authenticate('local')(req, res, function () {
                req.flash("success", "注册成功");
                res.redirect('/products');
            });
        });
    } else {
        req.flash("error", "请输入相同的密码");
        res.redirect('back');
    }
});

//Login routes
router.get('/login', function (req, res) {
    res.render('register/login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/products',
    failureRedirect: '/login',
    successFlash:'登陆成功' ,
    failureFlash: true
}), function (req, res) {
    // req.flash('success', 'Welcome back, ' + req.user.username);
});

//Logout routes
router.get('/logout', function (req, res) {
    req.logout();
    req.flash("success", "退出成功");
    res.redirect('/');
});
module.exports = router;
