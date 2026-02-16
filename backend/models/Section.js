const mongoose=require('mongoose');

const sectionSchema=new mongoose.Schema(
{
    branch:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Branch',
        required:true
    },
    classRef:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Class',
        required:true
    },
    sectionIncharge:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Teacher'
    },
    sectionName:{
        type:String,
        required:true

    }
    


},
{timestamps:true}
);

module.exports=mongoose.model('Section',sectionSchema);