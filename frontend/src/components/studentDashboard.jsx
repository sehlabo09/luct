// frontend/src/components/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../api";

export default function StudentDashboard() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // --- States ---
  const [studentInfo, setStudentInfo] = useState({
    name: user?.name || "",
    student_id: "",
    class_id: ""
  });

  const [registrations, setRegistrations] = useState([]);   // registered classes
  const [allClasses, setAllClasses] = useState([]);         // all classes from DB
  const [selectedRegisterClassId, setSelectedRegisterClassId] = useState("");
  
  const [report, setReport] = useState({ comments: "" });   // class report
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [lecturerRating, setLecturerRating] = useState({ rating: 1, comments: "" });
  const [lecturerRatings, setLecturerRatings] = useState([]); // past ratings

  // --- Load data on mount ---
  useEffect(() => {
    if (user && user.role === "student") {
      loadRegistrations();
      loadAllClasses();
      loadLecturerRatings();
    }
  }, [user]);

  // --- API Calls ---
  const loadRegistrations = async () => {
    try {
      const { data } = await API.get("/class-registrations/student");
      setRegistrations(data);
    } catch (err) {
      console.error("Failed to load registrations:", err);
    }
  };

  const loadAllClasses = async () => {
    try {
      const { data } = await API.get("/classes/all");
      setAllClasses(data);
    } catch (err) {
      console.error("Failed to load all classes:", err);
    }
  };

  const loadLecturerRatings = async () => {
    try {
      const { data } = await API.get("/lecturer-ratings/me");
      setLecturerRatings(data);
    } catch (err) {
      console.error("Failed to load lecturer ratings:", err);
    }
  };

  // --- Handlers ---
  const handleClassChange = (e) => {
    const classId = e.target.value;
    setStudentInfo({ ...studentInfo, class_id: classId });
    const cls = registrations.find(r => String(r.id) === String(classId));
    if (cls) setSelectedLecturer({ id: cls.lecturer_id, name: cls.lecturer_name });
    else setSelectedLecturer(null);
  };

  const handleRegisterClass = async () => {
    if (!selectedRegisterClassId) return alert("Select a class to register.");
    try {
      await API.post(`/class-registrations/${selectedRegisterClassId}/register`);
      alert("Registered successfully.");
      setSelectedRegisterClassId("");
      loadRegistrations();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Registration failed");
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!studentInfo.class_id) return alert("Select a registered class.");

    try {
      // Submit class report
      await API.post("/student/rate-class", {
        class_id: studentInfo.class_id,
        student_id: studentInfo.student_id,
        comments: report.comments
      });

      // Submit lecturer rating if selected
      if (selectedLecturer) {
        await API.post("/lecturer-ratings", {
          class_id: studentInfo.class_id,
          lecturer_id: selectedLecturer.id,
          rating: lecturerRating.rating,
          comments: lecturerRating.comments
        });
      }

      alert("Report and rating submitted successfully!");
      setReport({ comments: "" });
      setLecturerRating({ rating: 1, comments: "" });
      loadLecturerRatings();
    } catch (err) {
      console.error(err);
      alert("Failed to submit report and rating.");
    }
  };

  const handlePrint = () => window.print();

  // --- JSX ---
  return (
    <div className="page" style={{ maxWidth: 900, margin: "20px auto" }}>
      <h2>Student Dashboard</h2>

      {/* Student Info */}
      <section className="panel">
        <h3>Your Information</h3>
        <input
          className="form-control mb-2"
          placeholder="Full Name"
          value={studentInfo.name}
          onChange={e => setStudentInfo({ ...studentInfo, name: e.target.value })}
        />
        <input
          className="form-control mb-2"
          placeholder="Student ID"
          value={studentInfo.student_id}
          onChange={e => setStudentInfo({ ...studentInfo, student_id: e.target.value })}
        />
      </section>

      {/* Register New Class */}
      <section className="panel mt-4">
        <h3>Register New Class</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <select
            className="form-select"
            value={selectedRegisterClassId}
            onChange={e => setSelectedRegisterClassId(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">Select a class to register</option>
            {allClasses.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.class_name} ({cls.course_name}) - Lecturer: {cls.lecturer_name || "No lecturer"}
              </option>
            ))}
          </select>
          <button className="btn btn-success" onClick={handleRegisterClass}>
            Register
          </button>
        </div>
      </section>

      {/* Submit Report & Rate Lecturer */}
      <section className="panel mt-4">
        <h3>Submit Class Report & Rate Lecturer</h3>
        <form onSubmit={handleReportSubmit}>
          <select
            className="form-select mb-2"
            value={studentInfo.class_id}
            onChange={handleClassChange}
            required
          >
            <option value="">Select Registered Class</option>
            {registrations.map(r => (
              <option key={r.id} value={r.id}>
                {r.class_name} ({r.course_name}) - Lecturer: {r.lecturer_name || "No lecturer"}
              </option>
            ))}
          </select>

          <textarea
            className="form-control mb-2"
            placeholder="Report / Comments"
            value={report.comments}
            onChange={e => setReport({ ...report, comments: e.target.value })}
          />

          {selectedLecturer && (
            <>
              <p>Lecturer: <strong>{selectedLecturer.name}</strong></p>
              <input
                type="number"
                min="1"
                max="5"
                className="form-control mb-2"
                value={lecturerRating.rating}
                onChange={e => setLecturerRating({ ...lecturerRating, rating: e.target.value })}
                placeholder="Rating 1-5"
                required
              />
              <textarea
                className="form-control mb-2"
                placeholder="Comments (optional)"
                value={lecturerRating.comments}
                onChange={e => setLecturerRating({ ...lecturerRating, comments: e.target.value })}
              />
            </>
          )}

          <button className="btn btn-primary w-100 mb-3">Submit Report & Rating</button>
        </form>
      </section>

      {/* Lecturer Ratings */}
      <section className="panel mt-4">
        <h3>Your Lecturer Ratings</h3>
        {lecturerRatings.length === 0 ? (
          <p>You have not rated any lecturers yet.</p>
        ) : (
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Class</th>
                <th>Course</th>
                <th>Lecturer</th>
                <th>Rating</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {lecturerRatings.map(r => (
                <tr key={r.id}>
                  <td>{r.class_name}</td>
                  <td>{r.course_name}</td>
                  <td>{r.lecturer_name}</td>
                  <td>{r.rating}</td>
                  <td>{r.comments || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button className="btn btn-secondary mt-2" onClick={handlePrint}>Print Report</button>
      </section>
    </div>
  );
}
