// frontend/src/components/LecturerDashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../api";

export default function LecturerDashboard() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [reportData, setReportData] = useState({
    faculty_name: "",
    class_name: "",
    venue: "",
    week: "",
    registered_students: "",
    present_students: "",
    scheduled_time: "",
    topic: "",
    learning_outcomes: "",
    date: "",
    pr_rating: "",
    pr_recommendation: ""
  });
  const [studentReports, setStudentReports] = useState([]);
  const [prRatings, setPrRatings] = useState([]);

  useEffect(() => {
    if (user && user.role === "lecturer") {
      loadCourses();
    }
  }, [user]);

  const loadCourses = async () => {
    try {
      const { data } = await API.get("/courses");
      setCourses(data);
    } catch (err) {
      console.error("Failed to load courses:", err);
    }
  };

  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);

    if (!courseId) {
      setStudentReports([]);
      setPrRatings([]);
      return;
    }

    try {
      // Load student reports for this course
      const { data: reports } = await API.get(`/reports?course_id=${courseId}`);
      setStudentReports(reports);

      // Load PR ratings for this course
      const { data: ratings } = await API.get(`/ratings?course_id=${courseId}`);
      setPrRatings(ratings);
    } catch (err) {
      console.error("Failed to load reports or ratings:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportData({ ...reportData, [name]: value });
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !reportData.class_name)
      return alert("Select a course and enter class name.");
    try {
      await API.post("/lecturer/submit-report", {
        course_id: selectedCourse,
        ...reportData
      });
      alert("Report submitted successfully!");
      setReportData({
        faculty_name: "",
        class_name: "",
        venue: "",
        week: "",
        registered_students: "",
        present_students: "",
        scheduled_time: "",
        topic: "",
        learning_outcomes: "",
        date: "",
        pr_rating: "",
        pr_recommendation: ""
      });
    } catch (err) {
      console.error(err);
      alert("Failed to submit report.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page" style={{ maxWidth: 1200, margin: "20px auto" }}>
      <h2>Lecturer Dashboard</h2>

      {/* Course Filter */}
      <section className="panel mb-4">
        <h3>Filter by Course</h3>
        <select
          className="form-select w-50"
          value={selectedCourse}
          onChange={handleCourseChange}
        >
          <option value="">-- Select a Course --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.course_name}
            </option>
          ))}
        </select>
      </section>

      {/* Submit Lecture Report */}
      <section className="panel mb-4">
        <h3>Submit Lecture Report</h3>
        <form onSubmit={handleSubmitReport}>
          <input
            className="form-control mb-2"
            placeholder="Faculty Name"
            name="faculty_name"
            value={reportData.faculty_name}
            onChange={handleInputChange}
          />
          <input
            className="form-control mb-2"
            placeholder="Class Name"
            name="class_name"
            value={reportData.class_name}
            onChange={handleInputChange}
          />
          <input
            className="form-control mb-2"
            placeholder="Venue"
            name="venue"
            value={reportData.venue}
            onChange={handleInputChange}
          />
          <input
            className="form-control mb-2"
            placeholder="Week of Reporting"
            name="week"
            value={reportData.week}
            onChange={handleInputChange}
          />
          <input
            className="form-control mb-2"
            type="number"
            placeholder="Number of Registered Students"
            name="registered_students"
            value={reportData.registered_students}
            onChange={handleInputChange}
          />
          <input
            className="form-control mb-2"
            type="number"
            placeholder="Number of Present Students"
            name="present_students"
            value={reportData.present_students}
            onChange={handleInputChange}
          />
          <input
            className="form-control mb-2"
            placeholder="Scheduled Time"
            name="scheduled_time"
            value={reportData.scheduled_time}
            onChange={handleInputChange}
          />
          <input
            className="form-control mb-2"
            placeholder="Topic"
            name="topic"
            value={reportData.topic}
            onChange={handleInputChange}
          />
          <textarea
            className="form-control mb-2"
            placeholder="Learning Outcomes"
            name="learning_outcomes"
            value={reportData.learning_outcomes}
            onChange={handleInputChange}
          />
          <input
            className="form-control mb-2"
            type="date"
            name="date"
            value={reportData.date}
            onChange={handleInputChange}
          />
          <input
            className="form-control mb-2"
            type="number"
            min="1"
            max="5"
            placeholder="Rate PR (1-5)"
            name="pr_rating"
            value={reportData.pr_rating}
            onChange={handleInputChange}
          />
          <textarea
            className="form-control mb-2"
            placeholder="PR Recommendation"
            name="pr_recommendation"
            value={reportData.pr_recommendation}
            onChange={handleInputChange}
          />
          <button className="btn btn-primary w-100 mb-3">Submit Report</button>
        </form>
      </section>

      {/* Student Reports Table */}
      <section className="panel mb-4">
        <h3>Student Reports for Selected Course</h3>
        {studentReports.length === 0 ? (
          <p>No reports available.</p>
        ) : (
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Course</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {studentReports.map((r) => (
                <tr key={r.id}>
                  <td>{r.student_name}</td>
                  <td>{r.class_name}</td>
                  <td>{r.course_name}</td>
                  <td>{r.comments || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* PR Ratings Table */}
      <section className="panel mb-4">
        <h3>PR Ratings</h3>
        {prRatings.length === 0 ? (
          <p>No PR ratings available.</p>
        ) : (
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>PR Name</th>
                <th>Class</th>
                <th>Course</th>
                <th>Rating</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {prRatings.map((r) => (
                <tr key={r.id}>
                  <td>{r.pr_name}</td>
                  <td>{r.class_name}</td>
                  <td>{r.course_name}</td>
                  <td>{r.rating}</td>
                  <td>{r.recommendation || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button className="btn btn-secondary mt-2" onClick={handlePrint}>
          Print Reports & Ratings
        </button>
      </section>

      {/* Logout */}
      <section className="panel mb-4">
        <button
          className="btn btn-danger"
          onClick={() => {
            localStorage.removeItem("user");
            window.location.reload();
          }}
        >
          Logout
        </button>
      </section>
    </div>
  ); 
}
