const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeacherSubjectAssignment',
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

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    timeSlot: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    students: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
          required: true
        },
        status: {
          type: String,
          enum: ['P', 'A'],
          required: true
        }
      }
    ]
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same session
attendanceSchema.index(
  { assignment: 1, date: 1, timeSlot: 1 },
  { unique: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);