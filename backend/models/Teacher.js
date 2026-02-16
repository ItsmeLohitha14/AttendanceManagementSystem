const mongoose=require('mongoose');

const teacherSchema=new mongoose.Schema(
{

    fullName:{
        type:String,
        required:true
    },
    salary:{
        type:Number
    },
    phone:{
        type:String,
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }

},
{timestamps:true}
);

module.exports=mongoose.model('Teacher',teacherSchema);