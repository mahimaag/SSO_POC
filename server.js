/**
 * Created by sourabh on 19/7/17.
 */
const express = require("express");
const routes=require("./route");
const cookieParser = require("cookie-parser");
//const jwt_token=require("jsonwebtoken");
require("./datasource");
process.env.SECRET_KEY='NothingIsImpossible';

const app=express();
app.use(cookieParser());
const PORT=3000;

routes(app);
app.listen(PORT,()=>{
    console.log("server listening on",PORT);
});