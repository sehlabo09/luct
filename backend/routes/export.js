const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const db = require('../db');

router.get('/reports', async (req, res) => {
  const [reports] = await db.query('SELECT * FROM reports');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Reports');

  if (reports.length > 0) {
    sheet.columns = Object.keys(reports[0]).map(k => ({ header: k, key: k }));
    sheet.addRows(reports);
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="reports.xlsx"');
  await workbook.xlsx.write(res);
  res.end();
});

module.exports = router;
