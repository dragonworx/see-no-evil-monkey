# See No Evil Monkey 🙈

A Chrome extension with a Node.js server that tracks and logs browser activity to a CSV file.

## Overview

This project consists of two components:
- **Chrome Extension**: Monitors browser activity (page loads and tab switches)
- **Node.js Server**: Receives logs from the extension and saves them to a CSV file

## Features

- Tracks page loads on all websites
- Monitors tab switching events
- Logs activity with timestamps, page titles, and URLs
- Stores data in CSV format for easy analysis
- Runs locally for privacy (no external data transmission)

## Project Structure

```
chrome-extension/
├── manifest.json        # Chrome extension configuration
├── background.js        # Service worker handling tab events and server communication
├── content.js          # Content script that runs on every page
└── server/
    ├── server.js       # Express server that receives and logs data
    ├── package.json    # Node.js dependencies
    └── log.csv         # Generated CSV file with activity logs
```

## Installation

### Server Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:8888`

### Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` directory
5. The extension will now be active

## How It Works

1. **Content Script**: Runs on every webpage and sends page load events to the background script
2. **Background Script**:
   - Receives messages from content scripts
   - Monitors tab switching events
   - Sends all activity data to the local server
3. **Server**:
   - Receives POST requests at `/log` endpoint
   - Formats and appends data to `log.csv`
   - Handles CSV escaping for proper data formatting

## CSV Log Format

The server creates a `log.csv` file with the following columns:
- `date`: Date of the activity
- `time`: Time of the activity
- `type`: Event type (1 = page load, 0 = tab switch)
- `title`: Page title
- `url`: Page URL

### PM2 Setup for Auto-start (Windows & macOS)

#### Installation
```bash
npm install -g pm2
npm install -g pm2-windows-startup  # Windows only
```

#### Setup Commands

##### 1. Start your server with PM2
```bash
cd server
pm2 start server.js --name "chrome-log-server"
pm2 save
```

##### 2. Configure auto-start on Windows
```bash
pm2-startup install
pm2 save
```

##### 3. Configure auto-start on macOS
```bash
pm2 startup
# Follow the command it outputs
pm2 save
```

##### Useful PM2 Commands
```bash
pm2 list              # Show all processes
pm2 logs              # View logs
pm2 restart chrome-log-server
pm2 stop chrome-log-server
pm2 delete chrome-log-server
```

## Requirements

- Node.js (v14 or higher)
- Chrome browser
- npm (comes with Node.js)

## Privacy Note

All data is stored locally on your machine. The extension only communicates with your local server at `localhost:8888` and does not send any data to external services.

## Troubleshooting

- **Server not receiving logs**: Ensure the server is running on port 8888
- **Extension not working**: Check Chrome extension page for any errors
- **CSV file not created**: Verify write permissions in the server directory

## License

ISC
