const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'student', 'teacher'],
      required: true
    },
    linkedId: {
      type: mongoose.Schema.Types.ObjectId,
    }
  },
  { timestamps: true }
);

userSchema.pre('save',async function (){
    if(!this.isModified('password')) return;
    this.password=await bcrypt.hash(this.password,10);
    
});

// Method to compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);