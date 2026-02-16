require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('Admin already exists');
      process.exit();
    }

    await User.create({
      name: 'Super Admin',
      username: 'admin',
      password: 'Sandy@1234',
      role: 'admin'
    });

    console.log('Admin user created successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
