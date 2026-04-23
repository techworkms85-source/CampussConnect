import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const GRADES = ['O', 'A+', 'A', 'B+', 'B', 'C', 'F'];
const GRADE_POINTS = { O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, F: 0 };

const emptySubject = () => ({ name: '', credits: 3, grade: 'A' });

export default function CGPACalculator() {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSem, setActiveSem] = useState(null);
  const [subjects, setSubjects] = useState([emptySubject()]);
  const [semNum, setSemNum] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/cgpa').then(({ data }) => {
      setRecord(data.data);
      if (data.data.semesters.length > 0) setActiveSem(data.data.semesters[0].semester);
    }).catch(() => toast.error('Failed to load CGPA data')).finally(() => setLoading(false));
  }, []);

  const calcPreview = () => {
    const valid = subjects.filter(s => s.name && s.credits);
    if (!valid.length) return 0;
    const total = valid.reduce((s, sub) => s + sub.credits * (GRADE_POINTS[sub.grade] || 0), 0);
    const credits = valid.reduce((s, sub) => s + sub.credits, 0);
    return credits ? (total / credits).toFixed(2) : 0;
  };

  const handleSave = async () => {
    const valid = subjects.filter(s => s.name.trim() && s.credits);
    if (!valid.length) return toast.error('Add at least one subject');
    setSaving(true);
    try {
      const { data } = await api.post('/cgpa/semester', { semester: semNum, subjects: valid });
      setRecord(data.data);
      toast.success('Semester saved!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (sem) => {
    try {
      const { data } = await api.delete(`/cgpa/semester/${sem}`);
      setRecord(data.data);
      if (activeSem === sem) setActiveSem(null);
      toast.success('Semester deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CGPA Calculator</h1>
        {record && (
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Overall CGPA</p>
            <p className="text-3xl font-bold text-blue-600">{record.cgpa || '—'}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add semester */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Add / Update Semester</h2>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Semester:</label>
            <select className="input-field w-32" value={semNum} onChange={e => setSemNum(Number(e.target.value))}>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            {subjects.map((sub, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  className="input-field flex-1"
                  placeholder="Subject name"
                  value={sub.name}
                  onChange={e => setSubjects(subjects.map((s, j) => j === i ? { ...s, name: e.target.value } : s))}
                />
                <input
                  type="number"
                  className="input-field w-16"
                  placeholder="Cr"
                  min={1} max={6}
                  value={sub.credits}
                  onChange={e => setSubjects(subjects.map((s, j) => j === i ? { ...s, credits: Number(e.target.value) } : s))}
                />
                <select
                  className="input-field w-20"
                  value={sub.grade}
                  onChange={e => setSubjects(subjects.map((s, j) => j === i ? { ...s, grade: e.target.value } : s))}
                >
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <button onClick={() => setSubjects(subjects.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 p-1">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setSubjects([...subjects, emptySubject()])} className="btn-secondary flex items-center gap-1 text-sm">
              <PlusIcon className="w-4 h-4" /> Add Subject
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving...' : 'Save Semester'}
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">Preview SGPA: <span className="font-bold text-blue-600 text-lg">{calcPreview()}</span></p>
          </div>
        </div>

        {/* Saved semesters */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">Saved Semesters</h2>
          {!record?.semesters?.length ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No semesters added yet.</p>
          ) : (
            record.semesters.sort((a, b) => a.semester - b.semester).map(sem => (
              <div key={sem.semester} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setActiveSem(activeSem === sem.semester ? null : sem.semester)}
                >
                  <span className="font-medium text-gray-900 dark:text-white">Semester {sem.semester}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600 font-bold">SGPA: {sem.sgpa}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(sem.semester); }} className="text-red-500 hover:text-red-700">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {activeSem === sem.semester && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-3">
                    <table className="w-full text-sm">
                      <thead><tr className="text-gray-500 dark:text-gray-400"><th className="text-left pb-1">Subject</th><th className="text-center pb-1">Credits</th><th className="text-center pb-1">Grade</th><th className="text-center pb-1">Points</th></tr></thead>
                      <tbody>
                        {sem.subjects.map((s, i) => (
                          <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                            <td className="py-1 text-gray-900 dark:text-white">{s.name}</td>
                            <td className="text-center text-gray-600 dark:text-gray-400">{s.credits}</td>
                            <td className="text-center text-gray-600 dark:text-gray-400">{s.grade}</td>
                            <td className="text-center text-gray-600 dark:text-gray-400">{s.gradePoints}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
