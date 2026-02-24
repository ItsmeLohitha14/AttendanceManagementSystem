require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(async ()=>{
        console.log("Connected to MongoDB");

    })
    .catch(err=>console.error('MongoDB connection error:', err));

const authRoutes=require('./routes/authRoutes');
const teacherRoutes=require('./routes/TeacherRoutes');
const branchRoutes=require('./routes/branchRoutes');
const classRoutes=require('./routes/classRoutes');
const sectionRoutes=require('./routes/sectionRoutes');
const studentRoutes=require('./routes/studentRoutes');
const subjectRoutes=require('./routes/subjectRoutes');
const tsaRoutes=require('./routes/teachersubjectassignRoutes');

app.use('/api/auth',authRoutes);
app.use('/api/teachers',teacherRoutes);
app.use('/api/branches',branchRoutes);
app.use('/api/classes',classRoutes);
app.use('/api/sections',sectionRoutes);
app.use('/api/students',studentRoutes);
app.use('/api/subjects',subjectRoutes);
app.use('/api/assignsubject',tsaRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


