import React, { useEffect, useState } from "react";
import API from "../api";

export default function PRDashboard() {
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState("");
  const [allCourses, setAllCourses] = useState([]); // store all courses initially
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [ratings, setRatings] = useState([]);

  // Load streams, courses, and classes on mount
  useEffect(() => {
    loadStreams();
    loadCourses();
    loadClasses();
  }, []);

  // Load students, reports, ratings whenever selectedCourse changes
  useEffect(() => {
    if (selectedCourse) {
      loadStudents(selectedCourse);
      loadReports(selectedCourse);
      loadRatings(selectedCourse);
    } else {
      setStudents([]);
      setReports([]);
      setRatings([]);
    }
  }, [selectedCourse]);

  // Filter courses when selectedStream changes
  useEffect(() => {
    if (selectedStream) {
      const filtered = allCourses.filter(c => c.stream_id === Number(selectedStream));
      setCourses(filtered);
      setSelectedCourse(""); // reset selected course
    } else {
      setCourses(allCourses);
    }
  }, [selectedStream, allCourses]);

  // Load all streams
  const loadStreams = async () => {
    try {
      const { data } = await API.get("/streams");
      setStreams(data);
    } catch (err) {
      console.error("Failed to load streams:", err);
    }
  };

  // Load all courses
  const loadCourses = async () => {
    try {
      const { data } = await API.get("/courses");
      setAllCourses(data); // save all courses
      setCourses(data);    // initially show all courses
    } catch (err) {
      console.error("Failed to load courses:", err);
    }
  };

  // Load all classes
  const loadClasses = async () => {
    try {
      const { data } = await API.get("/classes/all");
      setClasses(data);
    } catch (err) {
      console.error("Failed to load classes:", err);
    }
  };

  // Load students registered in a course
  const loadStudents = async (courseId) => {
    try {
      const { data } = await API.get(`/students?course_id=${courseId}`);
      setStudents(data);
    } catch (err) {
      console.error("Failed to load students:", err);
    }
  };

  // Load lecture reports for a course
  const loadReports = async (courseId) => {
    try {
      const { data } = await API.get(`/reports?course_id=${courseId}`);
      setReports(data);
    } catch (err) {
      console.error("Failed to load reports:", err);
    }
  };

  // Load lecturer ratings for a course
  const loadRatings = async (courseId) => {
    try {
      const { data } = await API.get(`/ratings?course_id=${courseId}`);
      setRatings(data);
    } catch (err) {
      console.error("Failed to load ratings:", err);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 1200, margin: "20px auto" }}>
      <h2>PR Dashboard</h2>

      {/* Stream Filter */}
      <section className="panel mb-4">
        <h3>Filter by Stream</h3>
        <select
          className="form-select w-50"
          value={selectedStream}
          onChange={(e) => setSelectedStream(e.target.value)}
        >
          <option value="">-- Select a Stream --</option>
          {streams.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </section>

      {/* Courses Section */}
      <section className="panel mb-4">
        <h3>Courses under selected stream</h3>
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Course Name</th>
              <th>Lecturer</th>
              <th>Stream</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id}>
                <td>{c.course_name}</td>
                <td>{c.lecturer_name}</td>
                <td>{c.stream_name || c.stream_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Course Filter */}
      <section className="panel mb-4">
        <h3>Filter by Course</h3>
        <select
          className="form-select w-50"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">-- Select a Course --</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.course_name}</option>
          ))}
        </select>
      </section>

      {/* Monitoring Section */}
      <section className="panel mb-4">
        <h3>Monitoring - Registered Students</h3>
        {students.length === 0 ? (
          <p>No students registered for this course.</p>
        ) : (
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Student ID</th>
                <th>Class</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.student_id}</td>
                  <td>{s.class_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Reports Section */}
      <section className="panel mb-4">
        <h3>Reports - Lectures Feedback</h3>
        {reports.length === 0 ? (
          <p>No reports for this course.</p>
        ) : (
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Lecturer</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td>{r.student_name}</td>
                  <td>{r.class_name}</td>
                  <td>{r.lecturer_name}</td>
                  <td>{r.comments || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Ratings Section */}
      <section className="panel mb-4">
        <h3>Lecturer Ratings</h3>
        {ratings.length === 0 ? (
          <p>No ratings submitted yet.</p>
        ) : (
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Lecturer</th>
                <th>Class</th>
                <th>Student</th>
                <th>Rating</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map(r => (
                <tr key={r.id}>
                  <td>{r.lecturer_name}</td>
                  <td>{r.class_name}</td>
                  <td>{r.student_name}</td>
                  <td>{r.rating}</td>
                  <td>{r.comments || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Classes Section */}
      <section className="panel mb-4">
        <h3>All Classes</h3>
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Class Name</th>
              <th>Course</th>
              <th>Lecturer</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(cl => (
              <tr key={cl.id}>
                <td>{cl.name}</td>
                <td>{cl.course_name}</td>
                <td>{cl.lecturer_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
