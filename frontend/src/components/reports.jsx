import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Reports() {
  const [lecturerReports, setLecturerReports] = useState([]);
  const [studentReports, setStudentReports] = useState([]);
  const [q, setQ] = useState('');

  const fetchReports = async () => {
    try {
      const { data } = await API.get('/reports');
      setLecturerReports(data.lecturerReports || []);
      setStudentReports(data.studentReports || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load reports');
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div>
      <h3>Reports</h3>

      <div className="mb-3">
        <SearchBar value={q} onSearch={val => setQ(val)} />
      </div>

      {/* Lecturer Reports */}
      <h4>Lecturer Reports</h4>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Course</th>
              <th>Lecturer</th>
              <th>Actual</th>
              <th>Total</th>
              <th>Topic</th>
            </tr>
          </thead>
          <tbody>
            {lecturerReports.length > 0 ? lecturerReports.map(r => (
              <tr key={r.id}>
                <td>{r.date_of_lecture}</td>
                <td>{r.course_name} ({r.course_code})</td>
                <td>{r.lecturer_name}</td>
                <td>{r.actual_students_present}</td>
                <td>{r.total_registered_students}</td>
                <td style={{ maxWidth: 300 }}>{r.topic_taught}</td>
              </tr>
            )) : <tr><td colSpan={6} className="text-center">No lecturer reports</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Student Reports */}
      <h4>Student Reports</h4>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-light">
            <tr>
              <th>Student Name</th>
              <th>Student #</th>
              <th>Course</th>
              <th>Lecturer</th>
              <th>Rating</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {studentReports.length > 0 ? studentReports.map(r => (
              <tr key={r.id}>
                <td>{r.student_name}</td>
                <td>{r.student_number}</td>
                <td>{r.course_name}</td>
                <td>{r.lecturer_name}</td>
                <td>{r.rating}</td>
                <td>{r.comments}</td>
              </tr>
            )) : <tr><td colSpan={6} className="text-center">No student reports</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
