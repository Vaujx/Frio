// script.js

// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {

    // Get references to DOM elements
    const videoUrlInput = document.getElementById('video-url-input');
    const addUrlButton = document.getElementById('add-url-button');
    const videoListBody = document.getElementById('video-list-body');
    const downloadSelectedButton = document.getElementById('download-selected-button');
    const clearAllButton = document.getElementById('clear-all-button');

    // Check if all required elements are found
    if (!videoUrlInput || !addUrlButton || !videoListBody || !downloadSelectedButton || !clearAllButton) {
        console.error("Error: One or more DOM elements not found. Check your HTML IDs.");
        // Optionally, display a user-friendly message on the page
        const body = document.querySelector('body');
        if (body) {
            const errorMsg = document.createElement('p');
            errorMsg.textContent = "Initialization error: Could not find necessary page elements. Please contact support.";
            errorMsg.style.color = "red";
            body.insertBefore(errorMsg, body.firstChild);
        }
        return; // Stop script execution if elements are missing
    }

    // Event Listener for "Add URL" button
    addUrlButton.addEventListener('click', () => {
        const url = videoUrlInput.value.trim();

        // Basic validation: if the URL is empty
        if (url === "") {
            alert("Please enter a video URL.");
            return;
        }

        // Optional simple validation: check if the string contains "http://" or "https://"
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            alert("Please enter a valid URL (starting with http:// or https://).");
            return;
        }

        // Create a new row element to display the URL
        const newRow = document.createElement('tr');

        // Create cell for the URL
        const urlCell = document.createElement('td');
        urlCell.textContent = url;
        newRow.appendChild(urlCell);

        // Create cell for the checkbox
        const selectCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'video-select-checkbox'; // For easier selection later
        selectCell.appendChild(checkbox);
        newRow.appendChild(selectCell);

        // Create cell for the individual download button
        const downloadCell = document.createElement('td');
        const individualDownloadButton = document.createElement('button');
        individualDownloadButton.textContent = 'Download';
        individualDownloadButton.className = 'individual-download-button';
        individualDownloadButton.addEventListener('click', () => {
            triggerDownload(url);
        });
        downloadCell.appendChild(individualDownloadButton);
        newRow.appendChild(downloadCell);

        // Cell for M3U8 Info
        const infoCell = document.createElement('td');
        if (url.endsWith('.m3u8')) {
            const infoButton = document.createElement('button');
            infoButton.textContent = 'Info';
            infoButton.className = 'm3u8-info-button';
            infoButton.addEventListener('click', () => {
                fetchM3U8Info(url, newRow); // Pass the row to potentially add info later
            });
            infoCell.appendChild(infoButton);
        }
        newRow.appendChild(infoCell); // Add empty cell if not m3u8, or cell with button

        // Append the new row to the video list display area
        videoListBody.appendChild(newRow);

        // Clear the URL input field
        videoUrlInput.value = "";
    });

    // Function to fetch and display M3U8 info
    function fetchM3U8Info(url, rowElement) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText} (status: ${response.status})`);
                }
                return response.text();
            })
            .then(data => {
                console.log("M3U8 content for " + url + ":\n", data.substring(0, 1000) + (data.length > 1000 ? "..." : ""));
                // For now, using alert. Later, this could populate a details section within the row or a modal.
                alert("M3U8 Info (first 1000 chars):\n\n" + data.substring(0, 1000) + (data.length > 1000 ? "..." : ""));
                // Example of how you might add it directly to the row (simplistic):
                // const detailsDiv = rowElement.querySelector('.m3u8-details');
                // if (detailsDiv) detailsDiv.textContent = data.substring(0, 500);
            })
            .catch(error => {
                console.warn("Could not fetch M3U8 content for:", url, "\nError:", error.message);
                alert("Could not fetch M3U8 content.\nThis might be due to the server's CORS policy or a network issue.\nURL: " + url + "\nError: " + error.message);
            });
    }

    // Function to trigger a download
    function triggerDownload(url) {
        const a = document.createElement('a');
        a.href = url;
        // Extract filename from URL or use a generic one
        let filename = url.substring(url.lastIndexOf('/') + 1);
        if (!filename || !filename.includes('.')) { // Basic check if a filename is present
            filename = url.endsWith('.m3u8') ? 'playlist.m3u8' : 'video.mp4';
        }
        a.download = filename;
        document.body.appendChild(a); // Append to body to make it clickable
        a.click();
        document.body.removeChild(a); // Clean up
    }

    // Event Listener for "Download Selected" button
    downloadSelectedButton.addEventListener('click', () => {
        const selectedCheckboxes = videoListBody.querySelectorAll('.video-select-checkbox:checked');
        if (selectedCheckboxes.length === 0) {
            alert("No videos selected for download.");
            return;
        }
        selectedCheckboxes.forEach(checkbox => {
            // The URL is in the first td of the row (tr)
            const row = checkbox.closest('tr');
            const urlCell = row.querySelector('td:first-child');
            if (urlCell) {
                triggerDownload(urlCell.textContent);
            }
        });
    });

    // Event Listener for "Clear All" button
    clearAllButton.addEventListener('click', () => {
        // Optional: Add a confirmation dialog
        if (confirm("Are you sure you want to clear all video URLs?")) {
            videoListBody.innerHTML = ''; // Remove all child elements (rows)
        }
    });

});
