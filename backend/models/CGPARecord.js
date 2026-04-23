const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  grade: { type: String, required: true },
  gradePoints: { type: Number, required: true },
});

const semesterSchema = new mongoose.Schema({
  semester: { type: Number, required: true },
  subjects: [subjectSchema],
  sgpa: { type: Number, default: 0 },
});

const cgpaRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    semesters: [semesterSchema],
    cgpa: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CGPARecord', cgpaRecordSchema);
