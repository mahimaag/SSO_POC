const request = require("request");
const jwt_token = require("jsonwebtoken");
const EmployeeSchema = require("./user.schema");
module.exports = (app) => {
    /*
     Middleware to check existing token in cookie for SSO
     */
    const verifyTsmsToken = (req, res, next) => {
        //to verify token
        const token = req.headers.authorization;
        if (token) {
            jwt_token.verify(token, process.env.SECRET_KEY, (err, decode) => {
                if (err) {
                    const verificationerror = {type: 'Token can not be verified'};
                    next(verificationerror);
                }
                else {
                    const decodeData = jwt_token.decode(token);
                    req.ememployeeId = decodeData.employeeId;
                    next();
                }
            })
        } else {
            next();
        }
    };

    //Keep this middleware if in case needed in future .

    // const checkHrmsToken = (req, res, next) => {
    //     const employeeId = req.ememployeeId;
    //     EmployeeSchema.find({employeeId}, (err, employeeData) => {
    //         if (employeeData.hrmsToken) {
    //             request("http://newers-world-oauth.qa2.tothenew.net/oauth/user?access_token=" + employeeData.hrmsToken, (err, employeeData) => {
    //                 console.log('data--------', employeeData.body);
    //                 next();
    //             });
    //         } else {
    //             const hrmstokenerror = {type: 'Hrms token not present'};
    //             next(hrmstokenerror);
    //         }
    //     })
    // };

    const authChecker = (req, res, next) => {
        const url = req.originalUrl;
        //exclude Callback url to check cookie existing condition
        if (url.indexOf('/api/oauthServerCallback') != -1) {
            return next();
        }
        //if cookie exists call user detail API with token in cookie
        if (req.cookies['nw_dev_oauthToken']) {
            // const token = req.cookies.nw_dev_oauthToken;
            // request("http://newers-world-oauth.qa2.tothenew.net/oauth/user?access_token=" + token, (err, employeeData) => {
            //     console.log('data--------', employeeData.body);
            //     next();
            // });
            next();
        }//if user sign in first time call authorize api for google sign in
        else{
            res.redirect("http://newers-world-oauth.qa2.tothenew.net/oauth/authorize?client_id=e6d6a83e-6c7a-11e7-9394-406186be844b")
        }
    };

    const Error = (err, req, res, next) => {
        switch (err && err.type) {
            case 'Token can not be verified':
                handleVerificationError(res);
                break;
        }
    };

    app.use(verifyTsmsToken);
    app.use(authChecker);
    app.use(Error);

    //Route for index page
    app.get("/",(req, res) => {
        res.sendFile(__dirname + "/index.html")
    });

    //route for profile page
    app.get("/profile", (req, res) => {
        console.log('profileeeeeeeee');
        res.sendFile(__dirname + "/profile.html")
    });

    //route for logout
    app.get("/logout", (req, res) => {
        res.clearCookie('Tsms').send("logout successfull");

    });

    //Route to call redirect url from oAuth when sign in first time
    app.get("/api/oauthServerCallback", (req, res) => {
        const hrmsToken = req.query.access_token;
        request("http://newers-world-oauth.qa2.tothenew.net/oauth/user?access_token=" + hrmsToken, (err, employeeData) => {
            if (err) {
                res.send("unable to fetch user details")
            } else if (employeeData.statusCode === 200) {

                const employee = JSON.parse(employeeData.body);

                const employeeDetails = {
                    employeeEmail: employee.email,
                    employeeId: employee.employeeCode,
                };
                const tsmsToken = jwt_token.sign(employeeDetails, process.env.SECRET_KEY, {
                    expiresIn: 900000,
                });

                res.cookie('nw_dev_oauthToken', hrmsToken, {
                    maxAge: 900000,
                });
                res.cookie('Tsms', tsmsToken, {
                    maxAge: 900000,
                });

                EmployeeSchema.update({
                    employeeId: employee.employeeCode,
                    employeeEmail: employee.email
                }, {
                    $set: {
                        tsmsToken,
                        hrmsToken,
                    }
                }, {upsert: true}, (err, user) => {
                    if (err) {
                        console.log(err);
                    }
                });

                // res.json({
                //     success:true,
                //     token:tsmstoken,
                // })
            }
            res.sendFile(__dirname + "/index.html")
        })

    });

    //functions displaying errors

    const handleVerificationError = (res) => {
        res.status(500).send("invalid token")
    };
};

