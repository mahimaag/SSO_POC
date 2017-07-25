/**
 * Created by sourabh on 24/7/17.
 */
const Mongoose=require("mongoose");
Mongoose.connect("mongodb://localhost:/sso_poc");
(function(){

  Mongoose.connection.on("open",(err,data)=>{
      console.log("successfully connected");
  });

  Mongoose.connection.on('error',(err,data)=>{
      console.log("connection not successful");
  });

}());