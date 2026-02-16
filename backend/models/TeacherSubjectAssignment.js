const mongoose = require('mongoose');

const teacherSubjectSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true
    },
    classRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate ACTIVE assignments
teacherSubjectSchema.index(
  { teacher: 1, subject: 1, branch: 1, classRef: 1, section: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  'TeacherSubjectAssignment',
  teacherSubjectSchema
);
