const Student = require('../models/Student');
const Section = require('../models/Section');
const Branch = require('../models/Branch');
const Class = require('../models/Class');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.createStudent = async (req, res) => {
  const {
    fullName,
    rollNo,
    parentName,
    motherName,
    parentMobile,
    branch,
    classRef,
    section
  } = req.body;

  if (!fullName || !rollNo || !parentName || !parentMobile || !branch || !classRef || !section) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Roll number uniqueness
    const existingRoll = await User.findOne({ username: rollNo }).session(session);
    if (existingRoll) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Student with this roll number already exists'
      });
    }

    // 2️⃣ Branch validation
    const branchValidate = await Branch.findById(branch).session(session);
    if (!branchValidate) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    // 3️⃣ Class validation
    const clsValidate = await Class.findById(classRef).session(session);
    if (!clsValidate) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (clsValidate.branch.toString() !== branch.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Class does not belong to this branch'
      });
    }

    // 4️⃣ Section validation
    const sectionValidate = await Section.findById(section).session(session);
    if (!sectionValidate) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    if (sectionValidate.classRef.toString() !== classRef.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Section does not belong to this class'
      });
    }

    // 5️⃣ Create student
    const student = await Student.create(
      [{
        fullName,
        rollNo,
        parentName,
        motherName,
        parentMobile,
        branch,
        classRef,
        section
      }],
      { session }
    );

    // 6️⃣ Create user
    const user = await User.create(
      [{
        name: fullName,
        username: rollNo,
        password: parentMobile,
        role: 'student',
        linkedId: student[0]._id
      }],
      { session }
    );

    student[0].user = user[0]._id;
    await student[0].save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student[0]
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to create student'
    });
  }
};

//Get All Students

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('branch', 'branchName')
      .populate('classRef', 'className')
      .populate('section', 'sectionName')
      .populate('user', 'username');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
};

//Get Student by Id

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('branch', 'branchName')
      .populate('classRef', 'className')
      .populate('section', 'sectionName')
      .populate('user', 'username');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student'
    });
  }
};

//Get Student by classId

exports.getStudentsByClass = async (req, res) => {
  try {
    const cls=await Class.findById(req.params.classId);
    
    if(!cls){
      return res.status(404).json({
        success:false,
        message:"class not found"
      });
    }

    const students = await Student.find({
      classRef: req.params.classId
    }).populate('section', 'sectionName');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
};


//Get Student By sectionId

exports.getStudentsBySection = async (req, res) => {
  try {

    const section=await Section.findById(req.params.sectionId);
    
    if(!section){
      return res.status(404).json({
        success:false,
        message:"Section not found"
      });

    }

    const students = await Student.find({
      section: req.params.sectionId
    }).populate('user', 'username');
    
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
};





exports.updateStudent = async (req, res) => {
  const { fullName, parentName, motherName, parentMobile } = req.body;

  try {
    const user=await User.findOne({linkedId:req.params.id});
    
    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found"
      });
    }

    const student = await Student.findById(req.params.id);
    

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    

    student.fullName = fullName || student.fullName;
    student.parentName = parentName || student.parentName;
    student.motherName = motherName || student.motherName;
    student.parentMobile = parentMobile || student.parentMobile;


    await student.save();


    user.password=parentMobile ||student.parentMobile;
    
    await user.save();
    

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to update student'
    });
  }
};


exports.deleteStudent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const student = await Student.findById(req.params.id).session(session);
    if (!student) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await User.findByIdAndDelete(student.user).session(session);
    await student.deleteOne({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Student and credentials deleted successfully'
    });

  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student'
    });
  } finally {
    session.endSession();
  }
};