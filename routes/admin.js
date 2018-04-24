var express = require('express');
var router = express.Router();
var User = require('../module/user');
var passport = require('passport');
var middlewareObj = require('../middleware/index');

//admin home page and log in
router.get('/', function (req, res) {
    res.render('admin/login');
});
router.post('/', passport.authenticate('local', {
    // successRedirect: '/admin/:id',
    failureRedirect: '/admin',
    // successFlash:'登陆成功' ,
    failureFlash: true
}), function (req, res) {
    res.redirect('admin/' + req.user.id);
    req.flash('success', 'Welcome back, ' + req.user.username);
});

//admin management page
router.get('/:id', middlewareObj.loginCheck, function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err){
            req.flash('err', err.message);
            res.redirect('back');
        }else {
            if (foundUser.isAdmin) {
                User.find({}, function (err, foundUsers) {
                    console.log(foundUsers);
                    console.log('foundUsers length: ' + foundUsers.length);
                    res.render("admin/show", {users: foundUsers});
                });
            } else {
                res.redirect('/');
            }
        }
    });
});
module.exports = router;