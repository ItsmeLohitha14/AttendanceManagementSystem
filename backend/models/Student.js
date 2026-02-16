const mongoose=require('mongoose');

const studentSchema=new mongoose.Schema(
    {
        fullName:{
            type:String,
            required:true
        },
        rollNo:{
            type:String,
            requied:true,
            unique:true
        },
        parentName:{
            type:String,
            required:true
        },
        motherName:{
            type:String
        },
        parentMobile:{
            type:String,
            required:true
        },
        branch:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Branch'
        },
        classRef:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Class'
        },
        section:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Section'
        },
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }

    },

    {timestamps:true }

);

module.exports = mongoose.model('Student',studentSchema);
