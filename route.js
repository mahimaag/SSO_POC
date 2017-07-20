const request = require("request");
module.exports = (app) => {
    authenticate = (req, res, next) => {
        console.log("helloooo")
        if (req.cookies['nw_dev_oauthToken']) {
            console.log("cookies----",req.cookies);
            const token = req.cookies.nw_dev_oauthToken;
            request("http://newers-world-oauth.qa2.tothenew.net/oauth/user?access_token=" + token, (err, userData) => {
                //console.log('data--------', userData);
            res.sendFile(__dirname + "/index.html")
            });

        }
        else{
            next();
        }
    };

    app.get("/",authenticate,(req,res)=>{
        console.log('11111111111111111111')
        res.redirect("http://newers-world-oauth.qa2.tothenew.net/oauth/authorize?client_id=e6d6a83e-6c7a-11e7-9394-406186be844b")
     });

    app.get("/api/oauthServerCallback", (req, res) => {
            const token = req.query.access_token;
            res.cookie('nw_dev_oauthToken', token, {
                maxAge: 900000,
            });
            request("http://newers-world-oauth.qa2.tothenew.net/oauth/user?access_token=" + token, (err, userData) => {
                console.log(userData.body);
                res.sendFile(__dirname + "/index.html")
            })
        });
    };

