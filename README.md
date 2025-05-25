# Enhanced Video Downloader

A web application to scrape video URLs from websites and facilitate their download. It uses a Node.js backend for scraping and a browser-based frontend for user interaction.

## Prerequisites

*   **Node.js**: You'll need Node.js installed on your system. npm (Node Package Manager) is included with Node.js.
    *   Download Node.js from [https://nodejs.org/](https://nodejs.org/)

## Setup

1.  **Get the code:**
    *   Clone the repository: `git clone <repository_url>` (if you have Git)
    *   Alternatively, download the project files as a ZIP and extract them.
2.  **Navigate to the project directory:**
    ```bash
    cd path/to/your/project-directory
    ```
3.  **Install dependencies:**
    Run the following command in the project directory to install the necessary Node.js packages:
    ```bash
    npm install
    ```

## Running the Application

1.  **Start the backend server:**
    *   Open your terminal or command prompt.
    *   Navigate to the project directory.
    *   Run the following command:
        ```bash
        node server.js
        ```
    *   The server will typically start and listen on `http://localhost:3000`. You should see a message like "Server running on port 3000" in your terminal.

2.  **Open the frontend:**
    *   In your file explorer, navigate to the project directory.
    *   Open the `index.html` file in your preferred web browser (e.g., Chrome, Firefox, Edge).
    *   The frontend application will load, and it will communicate with the backend server (running on `http://localhost:3000`) for scraping video URLs.

## How it Works

1.  The user enters a website URL into the input field on the `index.html` page in their browser.
2.  When the "Scrape Website" button is clicked, the frontend JavaScript sends this URL to the local backend server (`server.js`) via an HTTP POST request to the `/scrape` endpoint.
3.  The Node.js backend server receives the URL, fetches the content of the specified website using `axios`, and then uses `cheerio` to parse the HTML and identify potential video links.
4.  The backend server sends a list of found video URLs back to the frontend.
5.  The frontend JavaScript displays these video URLs in a list. The user can then click download buttons for individual videos, which are handled by the browser.

## Troubleshooting

*   **Scraping doesn't work / No videos appear:**
    *   Ensure the backend server (`node server.js`) is running in your terminal. Look for a confirmation message like "Server running on port 3000".
    *   If the server is not running or crashed, restart it using `node server.js`.
    *   Check the terminal window where `server.js` is running for any error messages. These can provide clues about what went wrong (e.g., issues fetching the target URL, problems with the URL itself).

*   **General errors or unexpected behavior:**
    *   Open your browser's developer console (usually by pressing F12, then look for the "Console" tab). Check for any error messages logged by the frontend JavaScript.
    *   Review the terminal output from `server.js` for any backend errors.
    *   Ensure the URL you are trying to scrape is publicly accessible and correctly typed. Some websites may have measures to block scraping.

*   **"Failed to fetch" or network errors in the console:**
    * This usually means the frontend (in `index.html`) cannot reach the backend server.
    * Confirm `server.js` is running and accessible at `http://localhost:3000`.
    * Check for any firewall or network configurations that might be blocking local connections.
    * Ensure your browser isn't blocking mixed content if `index.html` is opened via `file:///` and trying to access `http://localhost`. However, this setup with `localhost` is generally fine.

Remember to replace `<repository_url>` in the "Setup" section if this project is hosted in a Git repository. If it's just a collection of files, the "Download the files" instruction is sufficient.
