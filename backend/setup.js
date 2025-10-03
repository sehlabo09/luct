const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",       // change if your MySQL username is different
  password: "alarasi@12=...",       // put your MySQL password if you set one
});

connection.connect(err => {
  if (err) throw err;
  console.log("Connected to MySQL ✅");

  // Create database
  connection.query("CREATE DATABASE IF NOT EXISTS luct_system", (err) => {
    if (err) throw err;
    console.log("Database created ✅");

    // Switch to database
    connection.changeUser({ database: "luct_system" }, (err) => {
      if (err) throw err;

      // Create tables
      const createUsers = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role ENUM('admin','lecturer','student') DEFAULT 'lecturer',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

      const createCourses = `
        CREATE TABLE IF NOT EXISTS courses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          course_code VARCHAR(20) NOT NULL,
          course_name VARCHAR(100) NOT NULL,
          lecturer_id INT,
          FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE SET NULL
        )`;

      const createClasses = `
        CREATE TABLE IF NOT EXISTS classes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          course_id INT,
          date_of_lecture DATE,
          topic_taught VARCHAR(255),
          total_registered_students INT,
          actual_students_present INT,
          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
        )`;

      const createReports = `
        CREATE TABLE IF NOT EXISTS reports (
          id INT AUTO_INCREMENT PRIMARY KEY,
          class_id INT,
          lecturer_name VARCHAR(100),
          date_of_lecture DATE,
          course_name VARCHAR(100),
          course_code VARCHAR(20),
          total_registered_students INT,
          actual_students_present INT,
          topic_taught VARCHAR(255),
          FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
        )`;

      connection.query(createUsers, (err) => { if (err) throw err; console.log("Users table ✅"); });
      connection.query(createCourses, (err) => { if (err) throw err; console.log("Courses table ✅"); });
      connection.query(createClasses, (err) => { if (err) throw err; console.log("Classes table ✅"); });
      connection.query(createReports, (err) => { if (err) throw err; console.log("Reports table ✅"); });

      console.log("All tables created successfully 🚀");
      connection.end();
    });
  });
});
