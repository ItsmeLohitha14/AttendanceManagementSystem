const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
    {
        schoolName: {
            type: String,
            required: true
        },
        branchName: {
            type: String,
            required: true
        },
        location: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Branch', branchSchema);