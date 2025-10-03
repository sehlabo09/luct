import React, { useEffect, useState } from 'react';
import API from '../api';

export default function CoursesAdmin() {
  const [lecturers, setLecturers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    course_name: '',
    course_code: '',
    lecturer_id: ''
  });

  useEffect(() => {
    loadLecturers();
    loadCourses();
  }, []);

  const loadLecturers = async () => {
    try {
      const { data } = await API.get('/users?role=lecturer');
      setLecturers(data);
    } catch (err) {
      console.error('❌ Failed to load lecturers:', err);
    }
  };

  const loadCourses = async () => {
    try {
      const { data } = await API.get('/courses');
      setCourses(data);
    } catch (err) {
      console.error('❌ Failed to load courses:', err);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/courses', form);
      alert('✅ Course added');
      setForm({ course_name: '', course_code: '', lecturer_id: '' });
      loadCourses();
    } catch (err) {
      console.error('❌ Error adding course:', err);
      alert('Error adding course');
    }
  };

  return (
    <div>
      <h3>Courses Management</h3>
      <form onSubmit={submit} className="row g-2 mb-3">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Course name"
            value={form.course_name}
            required
            onChange={e => setForm({ ...form, course_name: e.target.value })}
          />
        </div>
        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Course code"
            value={form.course_code}
            required
            onChange={e => setForm({ ...form, course_code: e.target.value })}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={form.lecturer_id}
            onChange={e => setForm({ ...form, lecturer_id: e.target.value })}
          >
            <option value="">Assign Lecturer</option>
            {lecturers.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary">Add Course</button>
        </div>
      </form>

      <table className="table table-sm">
        <thead>
          <tr>
            <th>Course</th>
            <th>Code</th>
            <th>Lecturer</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(c => (
            <tr key={c.id}>
              <td>{c.course_name}</td>
              <td>{c.course_code}</td>
              <td>{c.lecturer_name || 'Unassigned'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
