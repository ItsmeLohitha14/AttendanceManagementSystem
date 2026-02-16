const Branch=require('../models/Branch');

exports.createBranch=async(req,res)=>{
    const {schoolName,branchName}=req.body;
    try
    {
        const existingBranch=await Branch.findOne({branchName:branchName})
        if(existingBranch){
            return res.status(500).json({
                success:false,
                message:"Branch already exists"
            })
        }
        const branch=await Branch.create({
            schoolName,
            branchName
        })

        await branch.save();
        res.status(201).json({
            success:true,
            data:branch,
            message:"Branch created successfully",
        });


}
catch(err){
    console.error(err);
    res.status(500).json({
        success:false,
        message:"error creating branch"
    });

}

}


exports.getBranches = async (req,res)=>{
    try
    {
        const branches=await Branch.find().sort({createdAt:-1});
        
        res.status(200).json({
            success:true,
            count:branches.length,
            data:branches
        });

    }
    catch(err){
        console.error(err);
        res.status(500).json({
            success:false,
            message:"Failed to fetch branches"
        });

    }
}



exports.getBranchById= async(req,res)=>{
    try
    {
        const branch= await Branch.findById(req.params.id);
        if(!branch){

            return res.status(404).json({
            success: false,
            message: 'Branch not found'

        });

        }

        res.status(200).json({
            success:false,
            data:branch
        })
    }
    catch(err){
        console.error(err);
        res.status(500).json({
        success: false,
        message: 'Failed to fetch branch'
        });
    }
}
exports.updateBranch=async (req,res)=>{
    const { schoolName, branchName } = req.body;
    try
    {
        const existingBranch=await Branch.findOne({branchName:branchName})
        if(existingBranch){
            return res.status(500).json({
                success:false,
                message:"Branch already exists"
            })
        }

        const branch=await Branch.findByIdAndUpdate(req.params.id,
            {schoolName,branchName},
            {new:true}
        );
        if(!branch){
            return res.status(404).json({
                success:false,
                message:'Branch not found'
            });
        }
        res.status(200).json({
            success:true,
            message:'Branch updated successfully',
            data:branch
        });
    }
    catch(err){
        console.error(err);
        res.status(500).json({
            success:false,
            message:"Failed to update branch"
        });
    }


}

exports.deleteBranch=async (req,res)=>{

    try
    {
    const branch= await Branch.findById(req.params.id);

    if(!branch){
        return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }
    await branch.deleteOne();

    res.status(200).json({
        success:true,
        message:"Branch deleted Successfully"
    });

}
catch(err){
    console.error(err);
    res.status(500).json({
        success:false,
        message:"Failed to delete branch"
    });
}
}

