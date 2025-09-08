const express = require('express');
const cors = require('cors'); // Import the CORS middleware
const app = express();
const PORT = 8888;

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

  console.log('✅ LOG RECEIVED:');
  console.log(logData);

  // Send a simple "thank you" response
  res.json({ status: 'success', received: logData });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Node.js log server listening on http://localhost:${PORT}`);
});
