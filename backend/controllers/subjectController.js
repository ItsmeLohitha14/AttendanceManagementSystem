const Subject=require('../models/Subject');

//creating a new subject

exports.createSubject= async(req,res)=>{
    const {subjectName,subjectCode}=req.body;
    try{
        if (!subjectName) {
        return res.status(400).json({
            success: false,
            message: 'Subject name is required'
        });
        }

        const existingSubject=await Subject.findOne({subjectName:subjectName.trim()});
        if(existingSubject){
            return res.status(400).json({
                success:false,
                message:"Subject already exists"
            });
        }

        const subject= await Subject.create({
            subjectName: subjectName.trim(),
            subjectCode
        });

        res.status(201).json({
            success:false,
            message:"Successfully created subject",
            data:subject

        });


    }catch(err){

        console.error(err);
        return res.status(500).json({
            success:false,
            message:"Failed to create Subject"
        });
    }

}

//Get All Subjects

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ subjectName: 1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects'
    });
  }
};


exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      data: subject
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject'
    });
  }
};


exports.updateSubject = async (req, res) => {
  const { subjectName, subjectCode } = req.body;

  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    if (subjectName) {
      const duplicate = await Subject.findOne({
        subjectName: subjectName.trim(),
        _id: { $ne: subject._id }
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Subject name already exists'
        });
      }

      subject.subjectName = subjectName.trim();
    }

    if (subjectCode !== undefined) {
      subject.subjectCode = subjectCode;
    }

    await subject.save();

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subject
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to update subject'
    });
  }
};



exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    await subject.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subject'
    });
  }
};