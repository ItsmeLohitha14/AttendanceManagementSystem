const Teacher=require('../models/Teacher');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.CreateTeacher=async (req,res)=>{
    const {fullName,salary,phone,username,password}=req.body;
    
    const session= await mongoose.startSession();
    session.startTransaction();


    try{

        const existingUser= await User.findOne({username}).session(session);
        if(existingUser)
        {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success:false,
                message:"username already exists"
            });
        }
        
    const teacher=await Teacher.create([{
        fullName,
        salary,
        phone
    }],
{session});

    const user=await User.create([{
        name:fullName,
        username,
        password,
        role:'teacher',
        linkedId:teacher[0]._id

    }],
    
    {session}
);
    
    teacher[0].user=user[0]._id;
    await teacher[0].save({session});


    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
        success:true,
        message:'Teacher created successfully',
        data:teacher[0]
    })


}    catch(err){

    await session.abortTransaction();
    session.endSession();

    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to create teacher'
    });

}

}

exports.updateTeacher=async (req,res)=>{
    const {fullName,salary,phone}=req.body;
    try{
        const teacher=await Teacher.findByIdAndUpdate(req.params.id,
            {fullName,salary,phone},
            {new:true}
        );
        if(!teacher){
            return res.status(404).json({message:"Teacher not found"});
        }
        res.json(teacher);
    }catch(err){
        console.error(err);
        res.status(500).json({message:"Server Error"});
    }

}

exports.deleteTeacher=async (req,res)=>{

    const session = await mongoose.startSession();
    session.startTransaction();
    
    try
    {
        const teacher=await Teacher.findById(req.params.id).session(session);
        if(!teacher){
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success:false,
                message:"Teacher not found"
            });

        }
        await User.findOneAndDelete({linkedId:req.params.id}).session(session);

        await Teacher.findByIdAndDelete(req.params.id).session(session);


        await session.commitTransaction();
        session.endSession();

        res.status(200).json({

            
            success:true,
            message:"Teacher and their credentials are deleted successfully"
        });
    }catch(err){
        await session.abortTransaction();
        session.endSession();
        console.error(err);
        res.status(500).json({
            success:false,
            message:'server error'
        });

    }

}

exports.getOneTeacher=async (req,res)=>{

    try{
        const teacher=await Teacher.findById(req.params.id);
        if(!teacher){
            res.status(404).json({
                success:false,
                message:"check the teacher id"
            });
        }
        res.json(teacher);


    }catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getTeachers= async(req,res)=>{
    try
    {
        const teachers=await Teacher.find().sort({createdAt: -1})
        res.json(teachers);
    }catch(err){
        console.error(err);
        res.status(500).json({message:'server error'});
    }
}




