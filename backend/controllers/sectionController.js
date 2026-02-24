const Section=require('../models/Section');
const Branch=require('../models/Branch');
const Teacher=require('../models/Teacher');
const Class=require('../models/Class');

exports.createSection=async (req,res)=>{

    const {branch,sectionIncharge,sectionName,classRef}=req.body;
    
    try
    {
        const existingBranch=await Branch.findById(branch);
                if(!existingBranch){
                    return res.status(404).json({
                        success:false,
                        message:"Branch not found"
                    });
                }
                
        const existingTeacher=await Teacher.findById(sectionIncharge);
                if(!existingTeacher){
                    return res.status(404).json({
                        success:false,
                        message:"Teacher not found"
                    });
                }
                 

        const existingClass=await Class.findById(classRef);
                if(!existingClass){
                    return res.status(404).json({
                        success:false,
                        message:"Class not found"
                    });
                }
        
        if(existingClass.branch.toString()!==branch){
            return res.status(400).json({
                success:false,
                message:"Class does not belong to this branch"
            });



        }
        const existingSection =await Section.findOne({
            classRef,
            sectionName
        });

        if(existingSection){
            return res.status(400).json({
            success: false,
            message: 'Section already exists in this class'
      });
    }

    
        
        const section= await Section.create({
            branch,
            sectionIncharge,
            sectionName,
            classRef
        });

        res.status(201).json({
            success: true,
            message: 'Section created successfully',
            data: section
        });




    }
    catch(err){
        console.error(err);
        res.status(500).json({
            success:false,
            message:"Failed to create Section"
        })
    }


}


exports.getSections=async(req,res)=>{
    try
    {
        const sections= await Section.find()
        .populate('branch','branchName')
        .populate('classRef','className')
        .populate('sectionIncharge','fullName');

        if(!sections){
            return res.status(404).json({
                success:false,
                message:"NO sections are found"
            });

        }

        res.status(200).json({
            success:true,
            count:sections.length,
            data:sections
        });
    }
    catch(err){

        console.error(err);
        res.status(500).json({
            success:false,
            message:"Failed to fetch Sections"
        });

    }
}


exports.getSectionsByClass= async(req,res)=>{
    try
    {
        const sections=await Section.find({
            classRef:req.params.classId
        }).populate('sectionIncharge','fullName');

        res.status(200).json({
        success: true,
        count: sections.length,
        data: sections
        });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sections'
    });
  }

 
}


exports.getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate('branch', 'branchName')
      .populate('classRef', 'className')
      .populate('sectionIncharge', 'fullName');

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    res.status(200).json({
      success: true,
      data: section
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch section'
    });
  }
};

exports.updateSection = async (req,res)=>{
    const {sectionName,sectionIncharge}=req.body;
    try
    {
        const section=await Section.findById(req.params.id);

        if(!section){
            return res.status(404).json({
                success:false,
                message:"Section not found"
            });
        }

        if(sectionName){
            const duplicateSection= await Section.findOne({
                classRef:section.classRef,
                sectionName,
                _id:{$ne:section._id}
            });

            if(duplicateSection){
                return res.status(400).json({
                    success:false,
                    message:"section name already exisits in the class"
                });
            }
            section.sectionName=sectionName||section.sectionName;

        }

        if(sectionIncharge){
            const teacher = await Teacher.findById(sectionIncharge);
            if(!teacher){
                return res.status(404).json({
                    success:false,
                    message:"Teacher not found"
                });
            }
            section.sectionIncharge = sectionIncharge || section.sectionIncharge;
        }

        await section.save();

        res.status(200).json({
        success: true,
        message: 'Section updated successfully',
        data: section
        });

    }

    catch(err){
        console.error(err);
        res.status(500).json({
        success: false,
        message: 'Failed to update section'
        });

    }
}

exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    await section.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Section deleted successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete section'
    });
  }
};