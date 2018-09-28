var express = require('express');
var router = express.Router();
var User = require('../module/user');
// var Transaction = require('../module/transaction');
var middlewareObj = require('../middleware/index');
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
    var address = req.body.address;
    var phoneNumber = req.body.phoneNumber;
    var parentPhoneNumber = req.body.parentPhoneNumber;
    console.log(typeof req.body._id);
    if (req.body.password === req.body.password_confirm) {
        User.find({phoneNumber: parentPhoneNumber}, function (err, foundUser) {
            if (err) {
                console.log(err);
                req.flash("error", "推荐人不在系统中");
                res.redirect('back');
            } else {
                var newUser = new User({
                    username: username,
                    address: address,
                    phoneNumber: phoneNumber,
                    parentPhoneNumber: parentPhoneNumber,
                    income: 0,
                });
                User.register(newUser, req.body.password, function (err, user) {
                    if (err) {
                        req.flash("error", err.message);
                        return res.redirect('back');
                    }
                    passport.authenticate('local')(req, res, function () {
                        req.flash("success", "注册成功");
                        res.redirect('/products');
                    })
                    if (foundUser.length) {
                        //推荐人拿20%
                        // foundUser[0].childrenIdNumber.push(user.idNumber);
                        foundUser[0].nextLevel.push(user);
                        foundUser[0].waitingIncome += 3000 * 0.2;
                        var tmpIncome = {
                            childName: user.username,
                            childIdNumber: user.phoneNumber,
                            childId: user._id,
                            level: 1,
                            amount: 600
                        };
                        var transaction0 = {
                            amount: 600,
                            child: {
                                id: newUser._id,
                                username: newUser.username,
                                phoneNumber: newUser.phoneNumber
                            },
                            parent: {
                                id: foundUser[0]._id,
                                username: foundUser[0].username
                            }
                        };
                        Transaction.create(transaction0, function (err, newTransaction) {
                            if (err) {
                                console.log(err);
                            } else {

                                foundUser[0].incomeDetails.push(tmpIncome);
                                foundUser[0].transaction.push(newTransaction);
                                foundUser[0].save();
                            }
                        });
                        //推荐人的上级如果是高级会员或者钻石会员拿15%
                        var promise = User.find({phoneNumber: foundUser[0].parentPhoneNumber}).exec();
                        promise.then(function (err, userB) {
                            if (err || !userB.length) {
                                //do nothing
                            } else {
                                //update 更新上一级的nextlevel
                                var tmpLevelB = userB[0].nextLevel.findIndex(function (element) {
                                    return element.phoneNumber == foundUser[0].phoneNumber;
                                });
                                if (tmpLevelB > -1) {
                                    userB[0].nextLevel.splice(tmpLevelB, 1);
                                    userB[0].nextLevel.push(foundUser[0]);
                                }
                                return userB[0].save();
                            }
                        });
                        promise.then(function (userB) {
                            if (userB[0].nextLevel.length >= 8) {
                                userB[0].waitingIncome += 3000 * 0.15;
                                var tmpIncome = {
                                    childName: user.username,
                                    childIdNumber: user.phoneNumber,
                                    childId: user._id,
                                    level: 2,
                                    amount: 450
                                }
                                var transaction1 = {
                                    amount: 450,
                                    child: {
                                        id: newUser._id,
                                        username: newUser.username,
                                        phoneNumber: newUser.phoneNumber
                                    },
                                    parent: {
                                        id: userB[0]._id,
                                        username: userB[0].phoneNumber
                                    }
                                };
                                Transaction.create(transaction1, function (err, newTransaction1) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        userB[0].incomeDetails.push(tmpIncome);
                                        userB[0].transaction.push(newTransaction1);
                                        userB[0].save();
                                    }
                                });
                            }
                            return userB[0].save();
                        });
                        promise.then(function (userB) {
                            //推荐人的上级的上级如果是钻石会员还能拿10%
                            User.find({phoneNumber: userB[0].parentPhoneNumber}, function (err, userA) {
                                if (err || !userA.length) {
                                    //do nothing
                                } else {
                                    var tmpLevelA = userA[0].nextLevel.findIndex(function (element) {
                                        return element.phoneNumber == userB[0].phoneNumber;
                                    });
                                    if (tmpLevelA > -1) {
                                        userA[0].nextLevel.splice(tmpLevelA, 1);
                                        userA[0].nextLevel.push(userB[0]);
                                    }
                                    if (userA[0].nextLevel.length >= 16) {
                                        userA[0].waitingIncome += 3000 * 0.1;
                                        var transaction2 = {
                                            amount: 300,
                                            child: {
                                                id: newUser._id,
                                                username: newUser.username,
                                                phoneNumber: newUser.phoneNumber
                                            },
                                            parent: {
                                                id: userA[0]._id,
                                                username: userA[0].phoneNumber
                                            }
                                        };
                                        var tmpIncome = {
                                            childName: user.username,
                                            childIdNumber: user.phoneNumber,
                                            childId: user._id,
                                            level: 3,
                                            amount: 300
                                        }
                                        Transaction.create(transaction2, function (err, newTransaction2) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                userA[0].incomeDetails.push(tmpIncome);
                                                userA[0].transaction.push(newTransaction2);
                                                userA[0].save(function (err) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {

                                                    }
                                                });
                                            }
                                        });
                                    }
                                    userA[0].save();
                                }
                            });
                        });
                    }
                });
            }
        })
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
    successFlash: '登陆成功',
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

//User Profiles
router.get('/users/:id', middlewareObj.loginCheck, function (req, res) {
    User.findById(req.params.id).populate("transaction").exec(function (err, foundUser) {
        if (err) {
            req.flash('err', err.message);
            res.redirect('back');
        } else {
            res.render("users/show", {user: foundUser});
        }
    });
});
//Edit User Profiles
router.get('/users/:id/edit', middlewareObj.checkUserPermission, function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            res.render('users/edit', {user: foundUser});
        }
    });
});

//Update User Profiles
router.put('/users/:id', middlewareObj.checkUserPermission, function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            if (req.user.isAdmin) {
                foundUser.userLevel = req.body.userLevel
                if (req.body.withdrawalDetail > 0) {
                    if (!foundUser.withdrawal) {
                        foundUser.withdrawal = 0;
                    }
                    if (foundUser.income - foundUser.withdrawal - req.body.withdrawalDetail >= 0) {
                        console.log('balance: ' + (foundUser.income - foundUser.withdrawal - req.body.withdrawalDetail));
                        var tmpWithdrawal = parseInt(foundUser.withdrawal) + parseInt(req.body.withdrawalDetail);
                        var tmpWithdrawalDetail = {
                            amount: req.body.withdrawalDetail
                        };
                        foundUser.withdrawal = tmpWithdrawal;
                        foundUser.withdrawalDetails.push(tmpWithdrawalDetail);
                    } else {
                        req.flash("error", "余额不足");
                    }
                }
            }
            foundUser.idNumber = req.body.idNumber;
            foundUser.save();
            res.redirect('/users/' + req.params.id);
        }
    });
});

//User Transaction Record
router.get('/users/:id/transactions', middlewareObj.checkUserPermission, function (req, res) {
    console.log(req.params.id);
    User.findById(req.params.id).populate("transaction").exec(function (err, foundUser) {
        if (err) {
            req.flash('err', err.message);
            res.redirect('back');
        } else {
            res.render("users/transactions", {user: foundUser});
        }
    });
});
// Update User's Transaction Record
router.put('/users/:id/transactions', middlewareObj.checkUserPermission, function (req, res) {
    if (req.body.withdrawalDetail) {
        //post from user
        console.log("申请返现：" + req.body.withdrawalDetail);
        var promise = User.findById(req.params.id).exec();
        promise.then(function (foundUser) {
            if (foundUser.income - req.body.withdrawalDetail - foundUser.waitingWithdrawal - foundUser.withdrawal >= 0) {
                //有余额才能提现
                var amount = req.body.withdrawalDetail;
                var transaction = {
                    amount: amount,
                    action: 2,
                    parent: {
                        id: req.params.id,
                        username: foundUser.username,
                    },
                    child:{
                        id:req.params.id,
                        username: foundUser.username,
                        phoneNumber: foundUser.phoneNumber
                    }
                };
                Transaction.create(transaction, function (err, newTransaction) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('新纪录' + newTransaction);
                        foundUser.transaction.push(newTransaction);
                        foundUser.waitingWithdrawal = parseInt(foundUser.waitingWithdrawal) + newTransaction.amount;
                        return foundUser.save();
                    }
                });
            } else {
                req.flash('error', "余额不足");
            }
        });
        // User.findById(req.params.id, function (err, foundUser) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         if (foundUser.income - req.body.withdrawalDetail >= 0) {
        //             //有余额才能提现
        //             var amount = req.body.withdrawalDetail;
        //             var transaction = {
        //                 amount: amount,
        //                 action: 2,
        //                 parent: {
        //                     id: req.params.id,
        //                     username: foundUser.username,
        //                 }
        //             };
        //             Transaction.create(transaction, function (err, newTransaction) {
        //                 if (err) {
        //                     console.log(err);
        //                 } else {
        //                     console.log('新纪录' + newTransaction);
        //                 }
        //             });
        //         } else {
        //             req.flash('error', "余额不足");
        //         }
        //     }
        // });
        res.redirect('back');
    } else {
        //post from admin
        if (req.body.transactionId_0 || req.body.transactionId_1 || req.body.transactionId_2 || req.body.transactionId_3) {
            var transactionId;
            var actionType;
            if (req.body.transactionId_0) {
                transactionId = req.body.transactionId_0;
                actionType = 0;
            } else if (req.body.transactionId_1) {
                transactionId = req.body.transactionId_1;
                actionType = 1;
            } else if (req.body.transactionId_2) {
                transactionId = req.body.transactionId_2;
                actionType = 2;
            } else {
                transactionId = req.body.transactionId_3;
                actionType = 3;
            }
            console.log('transactionId：' + transactionId);
            var promise = Transaction.findById(transactionId).exec();
            promise.then(function (foundTransaction) {
                if (actionType == 0) {
                    foundTransaction.action = 1;
                } else if (actionType == 1) {
                    foundTransaction.action = 0;
                } else if (actionType == 2) {
                    foundTransaction.action = 3
                } else {
                    foundTransaction.action = 2;
                }
                return foundTransaction.save();
            });
            promise.then(function (foundTransaction) {
                User.findById(foundTransaction.parent.id, function (err, foundUser) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (actionType == 0) {
                            foundUser.waitingIncome = parseInt(foundUser.waitingIncome) - parseInt(foundTransaction.amount);
                            foundUser.income = parseInt(foundUser.income) + parseInt(foundTransaction.amount);
                        } else if (actionType == 1) {
                            foundUser.waitingIncome = parseInt(foundUser.waitingIncome) + parseInt(foundTransaction.amount);
                            foundUser.income = parseInt(foundUser.income) - parseInt(foundTransaction.amount);
                        } else if (actionType == 2) {
                            foundUser.waitingWithdrawal = parseInt(foundUser.waitingWithdrawal) - parseInt(foundTransaction.amount);
                            foundUser.withdrawal = parseInt(foundUser.withdrawal) + parseInt(foundTransaction.amount);
                        } else {
                            foundUser.waitingWithdrawal = parseInt(foundUser.waitingWithdrawal) + parseInt(foundTransaction.amount);
                            foundUser.withdrawal = parseInt(foundUser.withdrawal) - parseInt(foundTransaction.amount);
                        }
                        return foundUser.save();
                    }
                });
            });
            // Transaction.findById(transactionId, function (err, foundTransaction) {
            //     if(err){
            //         console.log(err);
            //         res.redirect('back');
            //     }else {
            //         if(actionType == 0){
            //             foundTransaction.action = 1;
            //         }else if(actionType == 1){
            //             foundTransaction.action = 0;
            //         }else if(actionType == 2){
            //             foundTransaction == 3
            //         }else {
            //             foundTransaction == 2;
            //         }
            //         userid = foundTransaction.child.id;
            //         amount = foundTransaction.amount;
            //         foundTransaction.save();
            //     }
            // });

            // User.findById(userid, function (err, foundUser) {
            //     if(err){
            //         console.log(err);
            //     }else {
            //         if(actionType == 0){
            //             foundUser.waitingIncome -= amount;
            //             foundUser.income += amount;
            //         }else if(actionType == 1){
            //             foundUser.waitingIncome += amount;
            //             foundUser.income -= amount;
            //         }else if(actionType == 2){
            //             foundUser.income -= amount;
            //             foundUser.withdrawal += amount;
            //         }else {
            //             foundUser.income += amount;
            //             foundUser.withdrawal -= amount;
            //         }
            //         foundUser.save();
            //     }
            // });
        }
        res.redirect('back');
    }
});

//Edit User's Password
router.get('/users/:id/password', middlewareObj.checkUserPermission, function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            res.render('users/password', {user: foundUser});
        }
    });
});

//Update User's Password
router.put('/users/:id/password', middlewareObj.checkUserPermission, function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            if (req.user.isAdmin) {
                foundUser.setPassword('666666', function () {
                    foundUser.save();
                    res.redirect('/admin/' + req.user._id);
                });
            } else {
                var oldPassword = req.body.oldPassword;
                var oldPasswordConfirm = req.body.oldPasswordConfirm;
                var newPassword = req.body.newPassword;
                if (oldPassword === oldPasswordConfirm) {
                    foundUser.changePassword(oldPassword, newPassword, function (err) {
                        if (err) {
                            console.log('changePassword', err.message);
                            req.flash('error', 旧密码输入错误);
                            res.redirect('/users/' + req.user._id + '/password');
                        } else {
                            req.flash('success', "修改密码成功");
                            res.redirect('/login');
                        }
                    });
                } else {
                    console.log("两次密码不一样");
                    req.flash('error', "两次旧密码不一致");
                    res.redirect('/users/' + req.user._id + '/password');
                }
            }
        }
    });
});


module.exports = router;
