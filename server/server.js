const express = require('express');
const cors = require('cors'); // Import the CORS middleware
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 8888;

// CSV file configuration
const CSV_FILE = path.join(__dirname, 'log.csv');
const CSV_HEADERS = 'timestamp,type,title,url';

// --- Helper Functions ---

// Escape CSV values to handle commas, quotes, and newlines
function escapeCSVValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  value = String(value);
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

// Initialize CSV file with headers if it doesn't exist
function initializeCSVFile() {
  if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(CSV_FILE, CSV_HEADERS + '\n', 'utf8');
    // console.log(`📝 Created CSV file: ${CSV_FILE}`);
  } else {
    // console.log(`📋 CSV file already exists: ${CSV_FILE}`);
  }
}

// Append a log entry to the CSV file
function appendToCSV(logData) {
  // Ensure file exists with headers
  initializeCSVFile();

  // Convert type to 1 (page load) or 0 (tab activation)
  // let typeValue = 0; // default to tab activation
  // if (logData.type === 'pageLoadLog') {
  //   typeValue = 1;
  // }

  // Format the CSV row
  const csvRow = [
    escapeCSVValue(logData.date),
    escapeCSVValue(logData.time),
    escapeCSVValue(logData.type),
    escapeCSVValue(logData.title || ''),
    escapeCSVValue(logData.url || ''),
  ].join(',') + '\n';

  // Append to file
  fs.appendFileSync(CSV_FILE, csvRow, 'utf8');
  console.log(csvRow.trim());
}

// --- Middleware ---

// 1. Enable CORS for all origins
// This is essential so your server accepts requests from the extension
app.use(cors());

// 2. Enable the server to read JSON payloads
app.use(express.json());

// --- Routes ---

// Our main logging endpoint
app.post('/log', (req, res) => {
  // req.body contains the JSON data sent from the extension
  const logData = req.body;

  // console.log('✅ LOG RECEIVED:');
  // console.log(logData);

  try {
    // Append the log data to CSV file
    appendToCSV(logData);

    // Send a success response
    res.json({ status: 'success', received: logData, csv: 'appended' });
  } catch (error) {
    console.error('❌ Error writing to CSV:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🙈👂${PORT}`);
});
