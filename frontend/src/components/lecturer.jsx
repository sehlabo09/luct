import React, { useState, useEffect } from "react";
import axios from "axios";

function LectureReportForm() {
  const [faculty, setFaculty] = useState("");
  const [className, setClassName] = useState("");
  const [week, setWeek] = useState("");
  const [date, setDate] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [lecturerName, setLecturerName] = useState("");
  const [studentsPresent, setStudentsPresent] = useState("");
  const [totalStudents, setTotalStudents] = useState("");
  const [venue, setVenue] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [topic, setTopic] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [message, setMessage] = useState("");

  // Example: Fetch total students automatically based on class/course
  useEffect(() => {
    if (className && courseCode) {
      axios
        .get(`http://localhost:5000/api/classes/${className}/${courseCode}`)
        .then((res) => setTotalStudents(res.data.totalStudents))
        .catch(() => setTotalStudents(""));
    }
  }, [className, courseCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/lectures", {
        faculty,
        className,
        week,
        date,
        courseName,
        courseCode,
        lecturerName,
        studentsPresent,
        totalStudents,
        venue,
        scheduledTime,
        topic,
        learningOutcomes,
        recommendations,
      });

      setMessage("Lecture report submitted successfully!");
      // Clear form
      setFaculty("");
      setClassName("");
      setWeek("");
      setDate("");
      setCourseName("");
      setCourseCode("");
      setLecturerName("");
      setStudentsPresent("");
      setTotalStudents("");
      setVenue("");
      setScheduledTime("");
      setTopic("");
      setLearningOutcomes("");
      setRecommendations("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to submit lecture report.");
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "20px auto" }}>
      <h2>Insert Lecture Report</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Faculty Name"
          value={faculty}
          onChange={(e) => setFaculty(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Class Name"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Week of Reporting"
          value={week}
          onChange={(e) => setWeek(e.target.value)}
          required
        />
        <input
          type="date"
          placeholder="Date of Lecture"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Course Name"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Course Code"
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Lecturer’s Name"
          value={lecturerName}
          onChange={(e) => setLecturerName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Actual Number of Students Present"
          value={studentsPresent}
          onChange={(e) => setStudentsPresent(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Total Number of Registered Students"
          value={totalStudents}
          onChange={(e) => setTotalStudents(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Venue of the Class"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Scheduled Lecture Time"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Topic Taught"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />
        <textarea
          placeholder="Learning Outcomes of the Topic"
          value={learningOutcomes}
          onChange={(e) => setLearningOutcomes(e.target.value)}
          required
        />
        <textarea
          placeholder="Lecturer’s Recommendations"
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
        />

        <button type="submit">Submit Report</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default LectureReportForm;
