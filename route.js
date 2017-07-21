const request = require("request");
module.exports = (app) => {

    /*
        Middleware to check existing token in cookie for SSO
    */

    authChecker = (req, res, next) => {

        var url= req.originalUrl;
        console.log("helloooo", req.originalUrl, url.indexOf('/api/oauthServerCallback'))
        //exclude Callback url to check cookie existing condition
        if (url.indexOf('/api/oauthServerCallback') != -1) {
            return next();
        }
        //if cookie exists call user detail API with token in cookie
        if (req.cookies['nw_dev_oauthToken']) {
            console.log("cookies----",req.cookies);
            const token = req.cookies.nw_dev_oauthToken;
            request("http://newers-world-oauth.qa2.tothenew.net/oauth/user?access_token=" + token, (err, userData) => {
                //console.log('data--------', userData);

                next();
        });

        }//if user sign in first time call authorize api for google sign in
        else{
            res.cookie('requestedUrl', req.originalUrl, {
                maxAge: 900000,
            });
            res.redirect("http://newers-world-oauth.qa2.tothenew.net/oauth/authorize?client_id=e6d6a83e-6c7a-11e7-9394-406186be844b")
        }
    }

    app.use(authChecker);

    //Route for index page
    app.get("/",(req, res) => {
        res.sendFile(__dirname + "/index.html")
    });

    //route for profile page
    app.get("/profile",(req, res) => {
        console.log('profileeeeeeeee')
        res.sendFile(__dirname + "/profile.html")
    });

    //Route to call redirect url from oAuth when sign in first time
    app.get("/api/oauthServerCallback", (req, res) => {
            const token = req.query.access_token;
            res.cookie('nw_dev_oauthToken', token, {
                maxAge: 900000,
            });
            request("http://newers-world-oauth.qa2.tothenew.net/oauth/user?access_token=" + token, (err, userData) => {
                res.sendFile(__dirname + (req.cookies['requestedUrl'] == '/profile' ? '/profile.html' : '/index.html'))
            })
        });
    };

