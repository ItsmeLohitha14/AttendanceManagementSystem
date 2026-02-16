const mongoose=require('mongoose');

const branchSchema=new mongoose.Schema(
    {
    schoolName:{
            type:String,
            required:true
    },
    branchName:{
        type:String,
        required:true
    },

}
,{timestamps:true}
)

module.exports=mongoose.model('Branch',branchSchema);