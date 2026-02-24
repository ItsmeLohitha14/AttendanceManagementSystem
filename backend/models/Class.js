const mongoose=require('mongoose');

const classSchema=new mongoose.Schema(

{
    branch:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Branch',
        required:true
    },
    className:{
        type:String,
        required:true
    },
    classIncharge:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Teacher'
    },

},
{timestamps:true}
);

module.exports=mongoose.model('Class',classSchema);