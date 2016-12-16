'use strict'

var router = express.Router();
var crypto = require('crypto');

var User = require(config.base_dir + '/models/user');

router.post('/login', function (req, res, next) {
    var obj = { error: null, data: null };

    req.assert('email', 'required').notEmpty();
    req.assert('email', 'valid email required').isEmail();
    req.assert('password', 'password must be 4 to 20 characters required').len(4, 20);

    obj.data = {email: req.body.email.trim()};
    
    var errValidate = req.validationErrors();

    if (errValidate) {
        console.error(errValidate);
        
        var errorMsg = '';
        errValidate.forEach(function(item){
            errorMsg += item.msg + '\n';
        });

        obj.error = errorMsg;

        return res.json(obj);
    }

    var query = {email: obj.data.email};

    User.findOne(query, function (err, doc) {
        if (err) {
            obj.error = 'An error occured while login or register. Please try again!';
            return res.json(obj);
        }

        req.body.password = crypto.createHash('sha1').update(req.body.password).digest("hex");

        if (!doc) {
            User.create(req.body, function (err, docCreate) {
                if (err) {
                    console.error('error in line 43');
                    console.error(err);
                    obj.error = 'An error occured while register. Please try again!';
                    return res.json(obj);
                }

                var userData = {
                    id: docCreate._id,
                    email: docCreate.email
                }

                authSession(req, userData);

                obj.data = userData;
                return res.json(obj);
            });
        } else {
            query.password = req.body.password;

            User.findOne(query, function (err, docLogin) {
                if (err) {
                    obj.error = 'An error occured while login. Please try again!';
                    return res.json(obj);
                }

                if (!docLogin) {
                    obj.error = 'Username and password is totally wrong. Please try again!';
                    return res.json(obj);
                }
                
                var userData = {
                    id: docLogin._id,
                    email: docLogin.email
                }
                
                authSession(req, userData);
                obj.data = docLogin;
                return res.json(obj);
            });
        }
    })
});

router.get('/logout', function (req, res, next) {
    if (req.session.hasOwnProperty('user')) {
        req.session.user = null;
        req.session.save();
        res.clearCookie('user');
    }
    res.redirect('/');
});

function authSession(req, user) {
    req.session.login_type = 'frontend';
    req.session.user = user;
    req.session.save();
    
    return;
}

module.exports = router;