const express = require('express');
const cors = require('cors'); // Import the CORS middleware
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 8888;

// CSV file configuration
const CSV_FILE = path.join(__dirname, 'log.csv');
const CSV_HEADERS = 'date,time,type,title,url';

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

// GET endpoint to view logs as HTML table
app.get('/', (req, res) => {
  try {
    // Check if CSV file exists
    if (!fs.existsSync(CSV_FILE)) {
      res.send('<h1>No logs yet</h1><p>The log file has not been created.</p>');
      return;
    }

    // Read the CSV file
    const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = csvContent.trim().split('\n');

    // Parse CSV data - handle both old and new header formats
    let headers;
    const firstLine = lines[0];
    if (firstLine.startsWith('timestamp,')) {
      // Old format: timestamp contains both date and time
      headers = ['date', 'time', 'type', 'title', 'url'];
    } else {
      headers = firstLine.split(',');
    }
    const rows = lines.slice(1);

    // Build HTML response
    let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Activity Logs</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 5px;
      background-color: #f5f5f5;
      font-size: 12px;
    }
    h1 {
      color: #333;
      margin: 5px 0;
      font-size: 18px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      background-color: white;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    th {
      background-color: #4CAF50;
      color: white;
      padding: 3px 5px;
      text-align: left;
      border: 1px solid #ddd;
      font-size: 11px;
    }
    td {
      padding: 2px 5px;
      border: 1px solid #ddd;
      font-size: 11px;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    tr:hover {
      background-color: #e8f5e9;
    }
    .refresh-note {
      margin-top: 5px;
      color: #666;
      font-style: italic;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <h1>Activity Logs</h1>
  <table>
    <thead>
      <tr>`;

    // Add table headers
    headers.forEach(header => {
      html += `<th>${header}</th>`;
    });

    html += `
      </tr>
    </thead>
    <tbody>`;

    // Add table rows
    rows.forEach(row => {
      if (row.trim()) {
        // Simple CSV parsing (handles basic cases)
        const values = row.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
        html += '<tr>';
        values.forEach(value => {
          // Remove surrounding quotes if present
          const cleanValue = value.replace(/^"|"$/g, '').replace(/""/g, '"');
          html += `<td>${cleanValue}</td>`;
        });
        html += '</tr>';
      }
    });

    html += `
    </tbody>
  </table>
  <p class="refresh-note">Refresh the page to see the latest data.</p>
</body>
</html>`;

    res.send(html);
  } catch (error) {
    console.error('❌ Error reading CSV:', error.message);
    res.status(500).send(`<h1>Error</h1><p>Failed to read log file: ${error.message}</p>`);
  }
});

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
