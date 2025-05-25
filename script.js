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
                if (!document.getElementById('check-availability').checked) {
                    return true; // Skip check if option is disabled
                }
                
                try {
                    // Use no-cors mode to avoid CORS issues, but this limits what we can check
                    const response = await fetch(url, { 
                        method: 'HEAD',
                        mode: 'no-cors'
                    });
                    // With no-cors, we can't check response.ok, so assume it worked if no error
                    return true;
                } catch (error) {
                    // If HEAD fails, try GET with no-cors
                    try {
                        await fetch(url, { 
                            method: 'GET',
                            mode: 'no-cors'
                        });
                        return true;
                    } catch (getError) {
                        console.warn(`URL availability check failed for ${url}:`, getError);
                        return false;
                    }
                }
            }

            async function scrapeWebsiteForVideos(url) {
                try {
                    showStatus(`Attempting to scrape ${url} for videos...`, 'info');
                    updateProgress(10);

                    // Try to fetch with no-cors mode for some cases
                    let response = null;
                    let html = '';
                    
                    try {
                        // First try normal fetch
                        response = await fetch(url, {
                            method: 'GET',
                            mode: 'cors'
                        });
                        
                        if (response.ok) {
                            html = await response.text();
                            updateProgress(50);
                        }
                    } catch (corsError) {
                        // If CORS fails, try no-cors (limited functionality)
                        try {
                            response = await fetch(url, {
                                method: 'GET',
                                mode: 'no-cors'
                            });
                            showStatus('Limited scraping due to CORS restrictions - trying alternative methods', 'info');
                        } catch (noCorsError) {
                            throw new Error('Cannot access website due to CORS policy');
                        }
                    }

                    if (!html) {
                        // If we can't get HTML content, provide helpful alternatives
                        showStatus('Cannot directly scrape due to CORS policy. Try these alternatives:', 'error');
                        return provideScrapingAlternatives(url);
                    }

                    const foundVideos = [];
                    
                    // Extract videos using various patterns
                    advancedVideoPatterns.forEach(pattern => {
                        let match;
                        pattern.lastIndex = 0; // Reset regex state
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
                        srcPattern.lastIndex = 0; // Reset regex state
                        while ((srcMatch = srcPattern.exec(videoMatch[0])) !== null) {
                            const videoUrl = srcMatch[1];
                            if (isValidUrl(videoUrl) && !foundVideos.includes(videoUrl)) {
                                foundVideos.push(videoUrl);
                            }
                        }
                    }

                    updateProgress(100);
                    
                    if (foundVideos.length > 0) {
                        showStatus(`Successfully found ${foundVideos.length} videos!`, 'success');
                    } else {
                        showStatus('No videos found in the scraped content', 'error');
                        return provideScrapingAlternatives(url);
                    }
                    
                    return foundVideos;

                } catch (error) {
                    showStatus(`Scraping failed: ${error.message}`, 'error');
                    updateProgress(0);
                    return provideScrapingAlternatives(url);
                }
            }

            function provideScrapingAlternatives(url) {
                const domain = new URL(url).hostname.toLowerCase();
                const alternatives = [];
                
                // Provide helpful suggestions based on the domain
                if (domain.includes('youtube')) {
                    alternatives.push({
                        message: "For YouTube videos, use browser extensions like 'Video DownloadHelper' or online tools",
                        urls: []
                    });
                } else if (domain.includes('vimeo')) {
                    alternatives.push({
                        message: "For Vimeo videos, check if download is enabled by the creator",
                        urls: []
                    });
                } else if (domain.includes('twitter') || domain.includes('x.com')) {
                    alternatives.push({
                        message: "For Twitter/X videos, try online Twitter video downloaders",
                        urls: []
                    });
                } else {
                    // For other sites, suggest manual inspection
                    showStatus(`CORS blocked direct scraping. Try these manual methods:
                    
1. Right-click on the page → Inspect Element
2. Go to Network tab and reload the page
3. Filter by Media/XHR to find video URLs
4. Look for .mp4, .m3u8, .webm files
5. Copy those URLs and paste them here manually`, 'info');
                    
                    // Try to guess common video URL patterns for the domain
                    const extensions = ['mp4', 'webm', 'm3u8', 'mov'];
                    const commonPaths = ['video', 'media', 'stream', 'content'];
                    
                    extensions.forEach(ext => {
                        commonPaths.forEach(path => {
                            alternatives.push(`https://${domain}/${path}/video.${ext}`);
                            alternatives.push(`https://${domain}/uploads/video.${ext}`);
                        });
                    });
                }
                
                return alternatives.urls || [];
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
                    
                    let response;
                    try {
                        // Try CORS first
                        response = await fetch(url, { mode: 'cors' });
                    } catch (corsError) {
                        // If CORS fails, inform user about limitations
                        showStatus('Cannot fetch M3U8 info due to CORS restrictions. The playlist might still be downloadable.', 'error');
                        return;
                    }
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const data = await response.text();
                    const lines = data.split('\n').filter(line => line.trim());
                    
                    let info = `M3U8 Playlist Info:\n\n`;
                    info += `Total lines: ${lines.length}\n`;
                    
                    const version = lines.find(l => l.includes('#EXT-X-VERSION:'));
                    info += `Version: ${version ? version.split(':')[1] : 'Unknown'}\n`;
                    
                    const targetDuration = lines.find(l => l.includes('#EXT-X-TARGETDURATION:'));
                    info += `Target duration: ${targetDuration ? targetDuration.split(':')[1] + ' seconds' : 'Unknown'}\n`;
                    
                    const segments = lines.filter(l => l.endsWith('.ts') || l.endsWith('.m4s') || (l.includes('.') && !l.startsWith('#'))).length;
                    info += `Video segments: ${segments}\n`;
                    
                    const playlistType = lines.find(l => l.includes('#EXT-X-PLAYLIST-TYPE:'));
                    if (playlistType) {
                        info += `Playlist type: ${playlistType.split(':')[1]}\n`;
                    }
                    
                    const endList = lines.find(l => l.includes('#EXT-X-ENDLIST'));
                    info += `Status: ${endList ? 'Complete' : 'Live/Ongoing'}\n`;
                    
                    info += `\nPreview (first 500 characters):\n`;
                    info += data.substring(0, 500);
                    if (data.length > 500) info += '\n...';
                    
                    // Create a modal-like alert with better formatting
                    const userConfirm = confirm(info + '\n\nWould you like to copy the full playlist content to clipboard?');
                    
                    if (userConfirm) {
                        try {
                            await navigator.clipboard.writeText(data);
                            showStatus('M3U8 content copied to clipboard!', 'success');
                        } catch (clipboardError) {
                            // Fallback for older browsers
                            const textArea = document.createElement('textarea');
                            textArea.value = data;
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                            showStatus('M3U8 content copied to clipboard (fallback method)', 'success');
                        }
                    } else {
                        showStatus('M3U8 info retrieved successfully', 'success');
                    }
                } catch (error) {
                    const errorMessage = `Failed to fetch M3U8 info: ${error.message}`;
                    showStatus(errorMessage, 'error');
                    
                    // Provide helpful information even when fetch fails
                    const helpText = `
M3U8 Info Unavailable Due to Network/CORS Restrictions

However, you can still try to download this M3U8 playlist:
• Right-click the download button and "Save link as..."
• Use external tools like ffmpeg: ffmpeg -i "${url}" output.mp4
• Use browser extensions designed for M3U8 downloads

URL: ${url}`;
                    
                    alert(helpText);
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
            addUrlButton.addEventListener('click', async () => {
                const url = videoUrlInput.value.trim();
                
                if (!url) {
                    showStatus('Please enter a URL', 'error');
                    return;
                }
                
                if (!isValidUrl(url)) {
                    showStatus('Please enter a valid URL', 'error');
                    return;
                }

                // Check availability if option is enabled
                if (document.getElementById('check-availability').checked) {
                    showStatus('Checking URL availability...', 'info');
                    const isAvailable = await checkUrlAvailability(url);
                    if (!isAvailable) {
                        showStatus('Warning: URL may not be accessible', 'error');
                        const proceed = confirm('The URL may not be accessible. Do you want to add it anyway?');
                        if (!proceed) return;
                    }
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

                // Disable button during scraping
                scrapeButton.disabled = true;
                scrapeButton.textContent = '🔄 Scraping...';

                try {
                    const videos = await scrapeWebsiteForVideos(url);
                    
                    if (videos && videos.length > 0) {
                        let addedCount = 0;
                        videos.forEach(videoUrl => {
                            if (videoUrl && isValidUrl(videoUrl)) {
                                addVideoToList(videoUrl, 'scraped');
                                addedCount++;
                            }
                        });

                        if (addedCount === 0) {
                            showStatus('No valid video URLs were found', 'error');
                        } else {
                            showStatus(`Successfully added ${addedCount} videos from scraping`, 'success');
                        }
                    } else {
                        showStatus('No videos found. Try manual inspection or direct video URLs.', 'error');
                    }
                } catch (error) {
                    showStatus(`Scraping error: ${error.message}`, 'error');
                } finally {
                    // Re-enable button
                    scrapeButton.disabled = false;
                    scrapeButton.textContent = '🔍 Scrape Website';
                    videoUrlInput.value = '';
                    updateProgress(0);
                }
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
