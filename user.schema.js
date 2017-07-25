/**
 * Created by sourabh on 24/7/17.
 */

const Mongoose =require("mongoose");

const EmployeeSchema = new Mongoose.Schema({
   employeeId:{
       type:String,
   },
    employeeEmail:{
       type:String,
    },
    tsmsToken:{
       type:String,
    },
    hrmsToken:{
       type:String,
    }

},{versionKey:false});

module.exports=Mongoose.model("Employee",EmployeeSchema);
