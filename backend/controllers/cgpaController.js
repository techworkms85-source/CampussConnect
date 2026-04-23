const CGPARecord = require('../models/CGPARecord');

const GRADE_POINTS = { O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, F: 0 };

const calcSGPA = (subjects) => {
  const totalCredits = subjects.reduce((s, sub) => s + sub.credits, 0);
  const totalPoints = subjects.reduce((s, sub) => s + sub.credits * sub.gradePoints, 0);
  return totalCredits ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
};

const calcCGPA = (semesters) => {
  const totalCredits = semesters.reduce((s, sem) => s + sem.subjects.reduce((a, b) => a + b.credits, 0), 0);
  const totalPoints = semesters.reduce(
    (s, sem) => s + sem.subjects.reduce((a, b) => a + b.credits * b.gradePoints, 0),
    0
  );
  return totalCredits ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
};

// @GET /api/cgpa
exports.getRecord = async (req, res) => {
  try {
    let record = await CGPARecord.findOne({ user: req.user._id });
    if (!record) record = await CGPARecord.create({ user: req.user._id, semesters: [] });
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/cgpa/semester
exports.addSemester = async (req, res) => {
  try {
    const { semester, subjects } = req.body;
    const enriched = subjects.map((s) => ({ ...s, gradePoints: GRADE_POINTS[s.grade] ?? 0 }));
    const sgpa = calcSGPA(enriched);

    let record = await CGPARecord.findOne({ user: req.user._id });
    if (!record) record = new CGPARecord({ user: req.user._id, semesters: [] });

    const idx = record.semesters.findIndex((s) => s.semester === semester);
    if (idx >= 0) record.semesters[idx] = { semester, subjects: enriched, sgpa };
    else record.semesters.push({ semester, subjects: enriched, sgpa });

    record.cgpa = calcCGPA(record.semesters);
    await record.save();
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/cgpa/semester/:sem
exports.deleteSemester = async (req, res) => {
  try {
    const record = await CGPARecord.findOne({ user: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    record.semesters = record.semesters.filter((s) => s.semester !== parseInt(req.params.sem));
    record.cgpa = calcCGPA(record.semesters);
    await record.save();
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
