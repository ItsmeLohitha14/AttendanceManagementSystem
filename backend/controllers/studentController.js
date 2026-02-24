const Student = require('../models/Student');
const Section = require('../models/Section');
const Branch = require('../models/Branch');
const Class = require('../models/Class');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create Student
exports.createStudent = async (req, res) => {
  const {
    fullName,
    rollNo,
    parentName,
    motherName,
    parentMobile,
    branch,
    classRef,
    section,
    username,
    password
  } = req.body;

  // Validate required fields
  if (!fullName || !rollNo || !parentName || !parentMobile || !branch || !classRef || !section || !username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Check roll number uniqueness in this section
    const existingRoll = await Student.findOne({ 
      rollNo, 
      section: section 
    }).session(session);
    
    if (existingRoll) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Student with this roll number already exists in this section'
      });
    }

    // Validate branch
    const branchValidate = await Branch.findById(branch).session(session);
    if (!branchValidate) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    // Validate class
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

    // Validate section
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

    // Create User first
    const user = await User.create(
      [{
        name: fullName,
        username: username,
        password: password,
        role: 'student',
        linkedId: null
      }],
      { session }
    );

    // Create Student with reference to User
    const student = await Student.create(
      [{
        fullName,
        rollNo,
        parentName,
        motherName,
        parentMobile,
        branch,
        classRef,
        section,
        username: username,
        user: user[0]._id
      }],
      { session }
    );

    // Update User with student reference
    user[0].linkedId = student[0]._id;
    await user[0].save({ session });

    await session.commitTransaction();
    session.endSession();

    // Populate references for response
    await student[0].populate([
      { path: 'branch', select: 'branchName' },
      { path: 'classRef', select: 'className' },
      { path: 'section', select: 'sectionName' },
      { path: 'user', select: 'username role' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student[0]
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error creating student:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create student'
    });
  }
};

// Get All Students
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('branch', 'branchName')
      .populate('classRef', 'className')
      .populate('section', 'sectionName')
      .populate('user', 'username role');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
};

// Get Student by Id
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('branch', 'branchName')
      .populate('classRef', 'className')
      .populate('section', 'sectionName')
      .populate('user', 'username role');

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

// Get Students by Class
exports.getStudentsByClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.classId);
    
    if (!cls) {
      return res.status(404).json({
        success: false,
        message: "Class not found"
      });
    }

    const students = await Student.find({
      classRef: req.params.classId
    })
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

// Get Students by Section
exports.getStudentsBySection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.sectionId);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found"
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

// Update Student
exports.updateStudent = async (req, res) => {
  const { fullName, parentName, motherName, parentMobile } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const student = await Student.findById(req.params.id).session(session);
    
    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const user = await User.findOne({ linkedId: req.params.id }).session(session);
    
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update student fields
    student.fullName = fullName || student.fullName;
    student.parentName = parentName || student.parentName;
    student.motherName = motherName || student.motherName;
    student.parentMobile = parentMobile || student.parentMobile;

    await student.save({ session });

    // Update user name
    user.name = fullName || user.name;
    
    // Only update password if parentMobile changed
    if (parentMobile && parentMobile !== student.parentMobile) {
      user.password = parentMobile;
    }
    
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to update student'
    });
  }
};

// Delete Student
exports.deleteStudent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const student = await Student.findById(req.params.id).session(session);
    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Delete associated user
    await User.findByIdAndDelete(student.user).session(session);
    
    // Delete student
    await student.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Student and credentials deleted successfully'
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student'
    });
  }
};