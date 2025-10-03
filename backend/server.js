require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Helper to safely require route modules
function safeRequire(path) {
  try {
    const mod = require(path);
    console.log(`✅ Loaded ${path}`);
    return mod;
  } catch (err) {
    console.error(`❌ Failed to require ${path}: ${err.message}`);
    return null;
  }
}

// Routes
const authRoutes = safeRequire('./routes/auth');
const coursesRoutes = safeRequire('./routes/courses');
const classesRoutes = safeRequire('./routes/classes');
const lecturesRoutes = safeRequire('./routes/lectures');
const reportsRoutes = safeRequire('./routes/reports');
const exportRoutes = safeRequire('./routes/export');
const studentRoutes = safeRequire('./routes/student');
const streamsRoutes = safeRequire('./routes/streams');

if (authRoutes) app.use('/api/auth', authRoutes);
if (coursesRoutes) app.use('/api/courses', coursesRoutes);
if (classesRoutes) app.use('/api/classes', classesRoutes);
if (lecturesRoutes) app.use('/api/lectures', lecturesRoutes);
if (reportsRoutes) app.use('/api/reports', reportsRoutes);
if (exportRoutes) app.use('/api/export', exportRoutes);
if (studentRoutes) app.use('/api/student', studentRoutes);
if (streamsRoutes) app.use('/api/streams', streamsRoutes);

// Root & health
app.get('/', (req, res) => res.send('Server reachable'));
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
