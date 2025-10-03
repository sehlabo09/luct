import React, { useEffect, useState } from 'react';
import API from '../api';

export default function StudentReports() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({
    course_id: '',
    lecturer_id: '',
    rating: '',
    comments: ''
  });

  useEffect(() => {
    loadCourses();
    loadLecturers();
    loadReports();
  }, []);

  const loadCourses = async () => {
    try {
      const { data } = await API.get('/courses');
      setCourses(data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  };

  const loadLecturers = async () => {
    try {
      const { data } = await API.get('/users?role=lecturer');
      setLecturers(data);
    } catch (err) {
      console.error('Failed to load lecturers:', err);
    }
  };

  const loadReports = async () => {
    try {
      const { data } = await API.get(`/studentReports/student/${user.id}`);
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/studentReports', form);
      alert('Submitted!');
      setForm({ course_id: '', lecturer_id: '', rating: 1, comments: '' });
      loadReports();
    } catch (err) {
      console.error('Failed to submit report:', err);
      alert('Error submitting report');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '20px auto' }}>
      <h3>Student Feedback Form</h3>
      <form onSubmit={submit} style={{ marginBottom: 30 }}>
        <select
          className="form-select mb-2"
          value={form.course_id}
          onChange={e => setForm({ ...form, course_id: e.target.value })}
          required
        >
          <option value="">Select Course</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
        </select>
        <select
          className="form-select mb-2"
          value={form.lecturer_id}
          onChange={e => setForm({ ...form, lecturer_id: e.target.value })}
          required
        >
          <option value="">Select Lecturer</option>
          {lecturers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <input
          type="number"
          min={1}
          max={5}
          className="form-control mb-2"
          placeholder="Rating 1-5"
          value={form.rating}
          onChange={e => setForm({ ...form, rating: e.target.value })}
          required
        />
        <textarea
          className="form-control mb-2"
          placeholder="Comments"
          value={form.comments}
          onChange={e => setForm({ ...form, comments: e.target.value })}
        ></textarea>
        <button className="btn btn-primary">Submit</button>
      </form>

      <h3>Submitted Student Reports</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Course</th>
            <th>Lecturer</th>
            <th>Rating</th>
            <th>Comments</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.id}>
              <td>{r.course_name}</td>
              <td>{r.lecturer_name}</td>
              <td>{r.rating}</td>
              <td>{r.comments}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
