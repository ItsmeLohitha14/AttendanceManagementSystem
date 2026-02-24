const TeacherSubjectAssignment = require('../models/TeacherSubjectAssignment');
const Section = require('../models/Section');
const Branch = require('../models/Branch');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Subject = require('../models/Subject');

//create Assignment

exports.createAssignment = async (req, res) => {
  const { teacher, subject, branch, classRef, section } = req.body;

  try {
    if (!teacher || !subject || !branch || !classRef || !section) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
      
    const teacherExists = await Teacher.findById(teacher);
    if (!teacherExists) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) return res.status(404).json({ success: false, message: 'Subject not found' });

    const branchExists = await Branch.findById(branch);
    if (!branchExists) return res.status(404).json({ success: false, message: 'Branch not found' });

    const classExists = await Class.findById(classRef);
    if (!classExists) return res.status(404).json({ success: false, message: 'Class not found' });

    if (classExists.branch.toString() !== branch.toString()) {
      return res.status(400).json({ success: false, message: 'Class does not belong to this branch' });
    }

    const sectionExists = await Section.findById(section);
    if (!sectionExists) return res.status(404).json({ success: false, message: 'Section not found' });

    if (sectionExists.classRef.toString() !== classRef.toString()) {
      return res.status(400).json({ success: false, message: 'Section does not belong to this class' });
    }

    const existing = await TeacherSubjectAssignment.findOne({
      teacher,
      subject,
      branch,
      classRef,
      section,
      isActive: true
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Assignment already exists'
      });
    }

    const assignment = await TeacherSubjectAssignment.create({
      teacher,
      subject,
      branch,
      classRef,
      section
    });

    res.status(201).json({
      success: true,
      message: 'Teacher subject assigned successfully',
      data: assignment
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create assignment' });
  }
};



exports.getAssignments = async (req, res) => {
  try {
    const assignments = await TeacherSubjectAssignment.find({ isActive: true })
      .populate('teacher', 'fullName')
      .populate('subject', 'subjectName subjectCode')
      .populate('branch', 'branchName')
      .populate('classRef', 'className')
      .populate('section', 'sectionName');

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch assignments' });
  }
};


/* ================= GET ASSIGNMENTS BY TEACHER ================= */
exports.getAssignmentsByTeacher = async (req, res) => {
  try {
    const assignments = await TeacherSubjectAssignment.find({
      teacher: req.params.teacherId,
      isActive: true
    })
      .populate('subject', 'subjectName')
      .populate('classRef', 'className')
      .populate('section', 'sectionName');

    if (assignments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No assignments found for this teacher'
      });
    }

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch teacher assignments' });
  }
};


/* ================= GET LOGGED-IN TEACHER ASSIGNMENTS ================= */
exports.getMyAssignments = async (req, res) => {
  try {
    const assignments = await TeacherSubjectAssignment.find({
      teacher: req.user.linkedId,
      isActive: true
    })
      .populate('subject', 'subjectName')
      .populate('classRef', 'className')
      .populate('section', 'sectionName');

    res.status(200).json({
      success: true,
      data: assignments
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch assignments' });
  }
};


//Instead of deleting deactivating here to protect the attendance history

exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await TeacherSubjectAssignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    assignment.isActive = false;
    await assignment.save();

    res.status(200).json({
      success: true,
      message: 'Assignment deactivated successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete assignment' });
  }
};