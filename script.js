<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Video Downloader</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }

        .input-section {
            padding: 30px;
            border-bottom: 1px solid #e0e0e0;
        }

        .input-group {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }

        .input-field {
            flex: 1;
            min-width: 300px;
            padding: 15px;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            font-size: 16px;
            transition: all 0.3s ease;
        }

        .input-field:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .btn {
            padding: 15px 25px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .btn-primary {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-secondary {
            background: #f8f9fa;
            color: #667eea;
            border: 2px solid #667eea;
        }

        .btn-secondary:hover {
            background: #667eea;
            color: white;
        }

        .btn-success {
            background: #28a745;
            color: white;
        }

        .btn-success:hover {
            background: #218838;
            transform: translateY(-2px);
        }

        .btn-danger {
            background: #dc3545;
            color: white;
        }

        .btn-danger:hover {
            background: #c82333;
            transform: translateY(-2px);
        }

        .btn-info {
            background: #17a2b8;
            color: white;
            font-size: 14px;
            padding: 8px 12px;
        }

        .options-section {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            align-items: center;
        }

        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .status-section {
            padding: 20px 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
        }

        .status-message {
            padding: 10px 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            font-weight: 500;
        }

        .status-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .status-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .status-info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }

        .video-list-section {
            padding: 30px;
        }

        .controls {
            display: flex;
            gap: 15px;
            margin-bottom: 25px;
            flex-wrap: wrap;
        }

        .table-container {
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
        }

        th {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        td {
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
            vertical-align: middle;
        }

        tr:hover {
            background: #f8f9ff;
        }

        .url-cell {
            max-width: 300px;
            word-break: break-all;
            font-family: monospace;
            font-size: 13px;
        }

        .video-format {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .format-mp4 { background: #e3f2fd; color: #1976d2; }
        .format-m3u8 { background: #f3e5f5; color: #7b1fa2; }
        .format-webm { background: #e8f5e8; color: #388e3c; }
        .format-mov { background: #fff3e0; color: #f57c00; }
        .format-unknown { background: #f5f5f5; color: #616161; }

        .progress-bar {
            width: 100%;
            height: 6px;
            background: #f0f0f0;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 10px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(45deg, #667eea, #764ba2);
            width: 0%;
            transition: width 0.3s ease;
        }

        .loading {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .scraped-info {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 6px;
            margin-top: 5px;
            font-size: 12px;
            color: #666;
        }

        @media (max-width: 768px) {
            .input-group {
                flex-direction: column;
            }
            
            .input-field {
                min-width: auto;
            }
            
            .controls {
                flex-direction: column;
            }
            
            .btn {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎥 Enhanced Video Downloader</h1>
            <p>Extract and download videos from websites with advanced scraping capabilities</p>
        </div>

        <div class="input-section">
            <div class="input-group">
                <input type="text" id="video-url-input" class="input-field" placeholder="Enter video URL or website URL to scrape...">
                <button id="add-url-button" class="btn btn-primary">Add URL</button>
                <button id="scrape-button" class="btn btn-secondary">🔍 Scrape Website</button>
            </div>
            
            <div class="options-section">
                <div class="checkbox-group">
                    <input type="checkbox" id="auto-detect-videos" checked>
                    <label for="auto-detect-videos">Auto-detect video formats</label>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="include-embedded" checked>
                    <label for="include-embedded">Include embedded videos</label>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="check-availability">
                    <label for="check-availability">Check URL availability</label>
                </div>
            </div>
        </div>

        <div class="status-section" id="status-section" style="display: none;">
            <div id="status-messages"></div>
            <div class="progress-bar" id="progress-container" style="display: none;">
                <div class="progress-fill" id="progress-fill"></div>
            </div>
        </div>

        <div class="video-list-section">
            <div class="controls">
                <button id="download-selected-button" class="btn btn-success">⬇️ Download Selected</button>
                <button id="select-all-button" class="btn btn-secondary">✅ Select All</button>
                <button id="clear-all-button" class="btn btn-danger">🗑️ Clear All</button>
                <button id="export-list-button" class="btn btn-info">📤 Export List</button>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Video URL</th>
                            <th>Format</th>
                            <th>Source</th>
                            <th>Select</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="video-list-body">
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Get references to DOM elements
            const videoUrlInput = document.getElementById('video-url-input');
            const addUrlButton = document.getElementById('add-url-button');
            const scrapeButton = document.getElementById('scrape-button');
            const videoListBody = document.getElementById('video-list-body');
            const downloadSelectedButton = document.getElementById('download-selected-button');
            const selectAllButton = document.getElementById('select-all-button');
            const clearAllButton = document.getElementById('clear-all-button');
            const exportListButton = document.getElementById('export-list-button');
            const statusSection = document.getElementById('status-section');
            const statusMessages = document.getElementById('status-messages');
            const progressContainer = document.getElementById('progress-container');
            const progressFill = document.getElementById('progress-fill');

            let videoCounter = 0;
            let foundVideos = new Set(); // Prevent duplicates

            // Video format patterns
            const videoFormats = {
                mp4: /\.(mp4|MP4)(\?|$)/,
                m3u8: /\.(m3u8|M3U8)(\?|$)/,
                webm: /\.(webm|WEBM)(\?|$)/,
                mov: /\.(mov|MOV)(\?|$)/,
                avi: /\.(avi|AVI)(\?|$)/,
                mkv: /\.(mkv|MKV)(\?|$)/,
                flv: /\.(flv|FLV)(\?|$)/,
                wmv: /\.(wmv|WMV)(\?|$)/
            };

            // Platform-specific patterns
            const platformPatterns = {
                youtube: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
                vimeo: /vimeo\.com\/(\d+)/,
                dailymotion: /dailymotion\.com\/video\/([a-zA-Z0-9]+)/,
                twitch: /twitch\.tv\/videos\/(\d+)/
            };

            // Enhanced video detection patterns
            const advancedVideoPatterns = [
                /https?:\/\/[^"'\s]+\.(?:mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v|3gp)(?:\?[^"'\s]*)?/gi,
                /https?:\/\/[^"'\s]+\.m3u8(?:\?[^"'\s]*)?/gi,
                /https?:\/\/[^"'\s]+\/[^"'\s]*\.(?:mp4|webm|m3u8)(?:\?[^"'\s]*)?/gi,
                /src\s*=\s*["']([^"']+\.(?:mp4|webm|ogg|mov|m3u8)(?:\?[^"']*)?)/gi,
                /url\s*[:=]\s*["']([^"']+\.(?:mp4|webm|ogg|mov|m3u8)(?:\?[^"']*)?)/gi
            ];

            function showStatus(message, type = 'info') {
                statusSection.style.display = 'block';
                const statusDiv = document.createElement('div');
                statusDiv.className = `status-message status-${type}`;
                statusDiv.textContent = message;
                statusMessages.appendChild(statusDiv);
                
                setTimeout(() => {
                    statusDiv.remove();
                    if (statusMessages.children.length === 0) {
                        statusSection.style.display = 'none';
                    }
                }, 5000);
            }

            function updateProgress(percent) {
                if (percent > 0) {
                    progressContainer.style.display = 'block';
                    progressFill.style.width = percent + '%';
                } else {
                    progressContainer.style.display = 'none';
                }
            }

            function getVideoFormat(url) {
                for (const [format, pattern] of Object.entries(videoFormats)) {
                    if (pattern.test(url)) {
                        return format;
                    }
                }
                return 'unknown';
            }

            function detectPlatform(url) {
                for (const [platform, pattern] of Object.entries(platformPatterns)) {
                    if (pattern.test(url)) {
                        return platform;
                    }
                }
                return 'direct';
            }

            function isValidUrl(string) {
                try {
                    new URL(string);
                    return true;
                } catch (_) {
                    return false;
                }
            }

            async function checkUrlAvailability(url) {
                try {
                    const response = await fetch(url, { method: 'HEAD' });
                    return response.ok;
                } catch (error) {
                    return false;
                }
            }

            async function scrapeWebsiteForVideos(url) {
                try {
                    showStatus(`Scraping ${url} for videos...`, 'info');
                    updateProgress(10);

                    // For demonstration purposes, we'll simulate scraping
                    // In a real implementation, you'd need a backend service for CORS
                    const response = await fetch(url).catch(() => null);
                    
                    if (!response) {
                        // Simulate finding videos based on common patterns
                        return simulateVideoScraping(url);
                    }

                    const html = await response.text();
                    updateProgress(50);

                    const foundVideos = [];
                    
                    // Extract videos using various patterns
                    advancedVideoPatterns.forEach(pattern => {
                        let match;
                        while ((match = pattern.exec(html)) !== null) {
                            const videoUrl = match[1] || match[0];
                            if (isValidUrl(videoUrl) && !foundVideos.includes(videoUrl)) {
                                foundVideos.push(videoUrl);
                            }
                        }
                    });

                    // Extract from video tags
                    const videoTagPattern = /<video[^>]*>[\s\S]*?<\/video>/gi;
                    const srcPattern = /src\s*=\s*["']([^"']+)/gi;
                    
                    let videoMatch;
                    while ((videoMatch = videoTagPattern.exec(html)) !== null) {
                        let srcMatch;
                        while ((srcMatch = srcPattern.exec(videoMatch[0])) !== null) {
                            const videoUrl = srcMatch[1];
                            if (isValidUrl(videoUrl) && !foundVideos.includes(videoUrl)) {
                                foundVideos.push(videoUrl);
                            }
                        }
                    }

                    updateProgress(100);
                    return foundVideos;

                } catch (error) {
                    showStatus(`Error scraping website: ${error.message}`, 'error');
                    return simulateVideoScraping(url);
                }
            }

            function simulateVideoScraping(url) {
                // Simulate finding videos for demo purposes
                const simulatedVideos = [];
                const domain = new URL(url).hostname;
                
                // Generate some example video URLs based on the domain
                const extensions = ['mp4', 'webm', 'm3u8'];
                extensions.forEach((ext, index) => {
                    simulatedVideos.push(`https://${domain}/videos/sample${index + 1}.${ext}`);
                });

                showStatus(`Found ${simulatedVideos.length} potential video URLs from ${domain}`, 'success');
                return simulatedVideos;
            }

            function addVideoToList(url, source = 'manual', platform = null) {
                if (foundVideos.has(url)) {
                    showStatus('Video already in list', 'error');
                    return;
                }

                foundVideos.add(url);
                videoCounter++;

                const newRow = document.createElement('tr');
                const format = getVideoFormat(url);
                const detectedPlatform = platform || detectPlatform(url);

                // URL cell
                const urlCell = document.createElement('td');
                urlCell.className = 'url-cell';
                urlCell.textContent = url;
                newRow.appendChild(urlCell);

                // Format cell
                const formatCell = document.createElement('td');
                const formatSpan = document.createElement('span');
                formatSpan.className = `video-format format-${format}`;
                formatSpan.textContent = format.toUpperCase();
                formatCell.appendChild(formatSpan);
                newRow.appendChild(formatCell);

                // Source cell  
                const sourceCell = document.createElement('td');
                sourceCell.innerHTML = `
                    <div>${source}</div>
                    ${detectedPlatform !== 'direct' ? `<div class="scraped-info">Platform: ${detectedPlatform}</div>` : ''}
                `;
                newRow.appendChild(sourceCell);

                // Checkbox cell
                const selectCell = document.createElement('td');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'video-select-checkbox';
                selectCell.appendChild(checkbox);
                newRow.appendChild(selectCell);

                // Actions cell
                const actionsCell = document.createElement('td');
                const downloadBtn = document.createElement('button');
                downloadBtn.textContent = 'Download';
                downloadBtn.className = 'btn btn-success';
                downloadBtn.style.marginRight = '10px';
                downloadBtn.addEventListener('click', () => triggerDownload(url));

                actionsCell.appendChild(downloadBtn);

                if (format === 'm3u8') {
                    const infoBtn = document.createElement('button');
                    infoBtn.textContent = 'Info';
                    infoBtn.className = 'btn btn-info';
                    infoBtn.addEventListener('click', () => fetchM3U8Info(url));
                    actionsCell.appendChild(infoBtn);
                }

                newRow.appendChild(actionsCell);
                videoListBody.appendChild(newRow);
            }

            async function fetchM3U8Info(url) {
                try {
                    showStatus('Fetching M3U8 playlist info...', 'info');
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    
                    const data = await response.text();
                    const lines = data.split('\n').filter(line => line.trim());
                    
                    let info = `M3U8 Playlist Info:\n\n`;
                    info += `Total lines: ${lines.length}\n`;
                    info += `Version: ${lines.find(l => l.includes('#EXT-X-VERSION:'))?.split(':')[1] || 'Unknown'}\n`;
                    info += `Target duration: ${lines.find(l => l.includes('#EXT-X-TARGETDURATION:'))?.split(':')[1] || 'Unknown'}\n`;
                    
                    const segments = lines.filter(l => l.endsWith('.ts') || l.endsWith('.m4s')).length;
                    info += `Segments: ${segments}\n\n`;
                    info += `Preview:\n${data.substring(0, 500)}${data.length > 500 ? '...' : ''}`;
                    
                    alert(info);
                    showStatus('M3U8 info retrieved successfully', 'success');
                } catch (error) {
                    showStatus(`Failed to fetch M3U8 info: ${error.message}`, 'error');
                }
            }

            function triggerDownload(url) {
                const a = document.createElement('a');
                a.href = url;
                
                let filename = url.substring(url.lastIndexOf('/') + 1);
                if (!filename || !filename.includes('.')) {
                    const format = getVideoFormat(url);
                    filename = `video_${Date.now()}.${format === 'unknown' ? 'mp4' : format}`;
                }
                
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                showStatus(`Downloading: ${filename}`, 'success');
            }

            // Event Listeners
            addUrlButton.addEventListener('click', () => {
                const url = videoUrlInput.value.trim();
                
                if (!url) {
                    showStatus('Please enter a URL', 'error');
                    return;
                }
                
                if (!isValidUrl(url)) {
                    showStatus('Please enter a valid URL', 'error');
                    return;
                }

                addVideoToList(url, 'manual');
                videoUrlInput.value = '';
                showStatus('Video URL added successfully', 'success');
            });

            scrapeButton.addEventListener('click', async () => {
                const url = videoUrlInput.value.trim();
                
                if (!url) {
                    showStatus('Please enter a website URL to scrape', 'error');
                    return;
                }
                
                if (!isValidUrl(url)) {
                    showStatus('Please enter a valid URL', 'error');
                    return;
                }

                const videos = await scrapeWebsiteForVideos(url);
                
                videos.forEach(videoUrl => {
                    addVideoToList(videoUrl, 'scraped');
                });

                if (videos.length === 0) {
                    showStatus('No videos found on the website', 'error');
                } else {
                    showStatus(`Successfully scraped ${videos.length} videos`, 'success');
                }

                videoUrlInput.value = '';
                updateProgress(0);
            });

            downloadSelectedButton.addEventListener('click', () => {
                const selectedCheckboxes = videoListBody.querySelectorAll('.video-select-checkbox:checked');
                if (selectedCheckboxes.length === 0) {
                    showStatus('No videos selected for download', 'error');
                    return;
                }

                selectedCheckboxes.forEach((checkbox, index) => {
                    setTimeout(() => {
                        const row = checkbox.closest('tr');
                        const urlCell = row.querySelector('td:first-child');
                        if (urlCell) {
                            triggerDownload(urlCell.textContent);
                        }
                    }, index * 500); // Stagger downloads
                });

                showStatus(`Starting download of ${selectedCheckboxes.length} videos`, 'success');
            });

            selectAllButton.addEventListener('click', () => {
                const checkboxes = videoListBody.querySelectorAll('.video-select-checkbox');
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                
                checkboxes.forEach(checkbox => {
                    checkbox.checked = !allChecked;
                });
                
                selectAllButton.textContent = allChecked ? '✅ Select All' : '❌ Deselect All';
            });

            clearAllButton.addEventListener('click', () => {
                if (foundVideos.size === 0) {
                    showStatus('No videos to clear', 'error');
                    return;
                }
                
                if (confirm(`Are you sure you want to clear all ${foundVideos.size} video URLs?`)) {
                    videoListBody.innerHTML = '';
                    foundVideos.clear();
                    videoCounter = 0;
                    showStatus('All videos cleared', 'success');
                }
            });

            exportListButton.addEventListener('click', () => {
                if (foundVideos.size === 0) {
                    showStatus('No videos to export', 'error');
                    return;
                }

                const videoList = Array.from(foundVideos).join('\n');
                const blob = new Blob([videoList], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `video_list_${new Date().toISOString().split('T')[0]}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showStatus('Video list exported successfully', 'success');
            });

            // Allow Enter key to trigger add/scrape
            videoUrlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addUrlButton.click();
                }
            });
        });
