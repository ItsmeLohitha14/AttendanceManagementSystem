const Branch=require('../models/Branch');
const Teacher=require('../models/Teacher');
const Class=require('../models/Class');

exports.createClass=async(req,res)=>{
    const {className,branchId,teacherId}=req.body;
    try
    {
        const existingBranch=await Branch.findById(branchId);
        if(!existingBranch){
            return res.status(404).json({
                success:false,
                message:"Branch not found"
            });
        }
        
        const existingTeacher=await Teacher.findById(teacherId);
        if(!existingTeacher){
            return res.status(404).json({
                success:false,
                message:"Teacher not found"
            });
        }

        const existingClass = await Class.findOne({
                branch: branchId,
                className
            });

        if (existingClass) {
        return res.status(400).json({
            success: false,
            message: 'Class already exists in this branch'
        });
        }

        const newClass= await Class.create({
            branch:branchId,
            className,
            classIncharge:teacherId
        });

        

        res.status(201).json({
            success:true,
            message:"Class Created Successfully",
            data:newClass
        });

    }
    catch(err){
        console.error(err);
        res.status(500).json({
            success:false,
            message:"Error in creating Class"
        });
    }
}

exports.getClasses= async(req,res)=>{
    try
    {
        const classes = await Class.find()
        .populate('branch','branchName')
        .populate('classIncharge','fullName');
        res.status(200).json({
            success: true,
            count: classes.length,
            data:classes
            }); 


    }
    catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes'
    });
}

}

exports.getClassesByBranch = async (req, res) => {
  try {
    const classes = await Class.find({ branch: req.params.branchId })
      .populate('classIncharge', 'fullName');

    res.status(200).json({
      success: true,
      count: classes.length,
      data:classes
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes'
    });
  }
};


exports.getClassById = async(req,res)=>{

    try{
        const cls=await Class.findById(req.params.id)
        .populate('branch','branchName')
        .populate('classIncharge','fullName');

        if(!cls){
            return res.status(404).json({
                success:false,
                message:"class not found"
            });
        }
        res.status(200).json({
            success:true,
            data:cls
        });

    }
    catch(err){
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch class'
        })
    }

}


exports.updateClass = async (req, res) => {
  const { className, teacherId } = req.body;
  
  try {

    const currentcls=await Class.findById(req.params.id);
    
    if (!currentcls) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }


    if (className) {
      const duplicateClass = await Class.findOne({
        branch: currentcls.branch,
        className,
        _id: { $ne: currentcls._id } // exclude self
      });
    

      if(duplicateClass){
        
        return res.status(400).json({
          success:false,
          message:"Class name already exists in the branch"
        });

      }
    

    
    // validate incharge if provided
    if (teacherId) {
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }
    }
    
    currentcls.className=className || currentcls.className;
    currentcls.classIncharge = teacherId || currentcls.classIncharge;

    await currentcls.save();


    

    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data:currentcls
    });

  } 
}
catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to update class'
    });
  }
};


exports.deleteClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);

    if (!cls) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    await cls.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete class'
    });
  }
};
