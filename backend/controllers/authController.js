const jwt=require('jsonwebtoken');
const User=require('../models/User');

exports.login= async (req,res)=>{
    const {username,password}=req.body;
    try{
        const user=await User.findOne({username}).select('+password');
        if(!user){
            return res.status(401).json({
                success:false,
                message:"username not correct"
            });
        }
        

        
        const isMatch =await user.comparePassword(password);
        if(!isMatch){

            return res.status(401).json({
                success:false,
                message:'password not correct'
            });
        }
    

        const token=jwt.sign(
            {id:user._id,username:user.username,role:user.role},
            process.env.JWT_SECRET,
            {expiresIn:'1d'}
        );

        res.json({
        success: true,
        token,
        user: {
            id: user._id,
            username: user.username,
            role: user.role
        }
        });

    }
    
    catch (err) {

    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }

}


exports.register=async (req,res)=>{
    const {name,username,password,role,linkedId}=req.body;

    try{

        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:'Username already exists'
            });

        }
    
        const user = await User.create({
            name,
            username,
            password,
            role,
            linkedId
        });
    
        res.status(201).json({
            success:true,
            message:'User registered successfully',
            user:{
                id:user._id,
                username:user.username,
                role:user.role
            }
        });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Server error'
    });
  }
  
};


exports.getUsers=async (req,res)=>{

    try
    {
    const users=await User.find().sort({createdAt:-1});
    res.json(users);
    }
    catch(err){
        console.error(err);
        res.status(500).json({message:'server error'});
    }
    

}




  




