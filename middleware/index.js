var User = require('../module/user');
var middlewareObj = {
    loginCheck: function (req, res, next) {
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error', "请先登录");
        res.redirect('/login');
    },
    isAdmin: function (req, res, next) {
        if(req.isAuthenticated()){
            if(req.user.isAdmin)
                return next();
            else{
               req.flash("error", "Not found");
               res.redirect('back');
            }
        }else {
            req.flash("error", "验证失败");
            res.redirect('back');
        }
    }
}

module.exports = middlewareObj;