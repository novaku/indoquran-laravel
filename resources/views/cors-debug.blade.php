<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CORS Debug Tool - IndoQuran</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        h1 {
            color: #22c55e;
            border-bottom: 2px solid #22c55e;
            padding-bottom: 10px;
        }
        .card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
        }
        input[type="text"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        button {
            background: #22c55e;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s;
        }
        button:hover {
            background: #16a34a;
        }
        .results {
            margin-top: 30px;
        }
        .results pre {
            background: #f0f0f0;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            white-space: pre-wrap;
        }
        .success {
            color: #16a34a;
            font-weight: bold;
        }
        .error {
            color: #dc2626;
            font-weight: bold;
        }
        .proxy-url {
            background: #fef9c3;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
        }
        .proxy-test {
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <h1>CORS Debug Tool - IndoQuran</h1>
    
    <div class="card">
        <p>This tool helps diagnose CORS issues by testing requests to various resources. Enter a URL below to test if it can be accessed directly or needs to be proxied.</p>
        
        <div class="form-group">
            <label for="url">URL to test:</label>
            <input type="text" id="url" placeholder="https://my.indoquran.web.id/assets/example.js" value="https://my.indoquran.web.id/assets/HomePage-BJrHYw8s.js">
        </div>
        
        <button id="test-btn">Test URL</button>
    </div>
    
    <div class="results" id="results" style="display: none;">
        <h2>Test Results</h2>
        <div class="card" id="result-card">
            <div id="result-content"></div>
            
            <div class="proxy-url" id="proxy-section" style="display: none;">
                <strong>Proxy URL:</strong> <span id="proxy-url"></span>
                <div class="proxy-test">
                    <button id="test-proxy-btn">Test Proxy URL</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const testBtn = document.getElementById('test-btn');
            const testProxyBtn = document.getElementById('test-proxy-btn');
            const urlInput = document.getElementById('url');
            const resultsDiv = document.getElementById('results');
            const resultContent = document.getElementById('result-content');
            const proxySection = document.getElementById('proxy-section');
            const proxyUrl = document.getElementById('proxy-url');
            
            testBtn.addEventListener('click', function() {
                const url = urlInput.value.trim();
                if (!url) {
                    alert('Please enter a URL to test');
                    return;
                }
                
                testBtn.disabled = true;
                testBtn.textContent = 'Testing...';
                resultContent.innerHTML = '<p>Testing URL, please wait...</p>';
                resultsDiv.style.display = 'block';
                proxySection.style.display = 'none';
                
                fetch('/cors-debug/test', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    body: JSON.stringify({ url })
                })
                .then(response => response.json())
                .then(data => {
                    let html = '';
                    
                    if (data.error) {
                        html += `<p class="error">Error: ${data.error}</p>`;
                    } else {
                        html += data.success 
                            ? `<p class="success">Success! The URL is accessible directly.</p>` 
                            : `<p class="error">Failed. Status code: ${data.status}</p>`;
                            
                        html += `<p><strong>Status:</strong> ${data.status}</p>`;
                        
                        // Headers
                        html += '<p><strong>Response Headers:</strong></p>';
                        html += '<pre>';
                        for (const [key, value] of Object.entries(data.headers)) {
                            html += `${key}: ${value}\n`;
                        }
                        html += '</pre>';
                        
                        // Response preview
                        html += '<p><strong>Response Preview:</strong></p>';
                        html += `<pre>${data.response}</pre>`;
                        
                        // Show proxy URL if available
                        if (data.proxy_url) {
                            proxyUrl.textContent = data.proxy_url;
                            proxySection.style.display = 'block';
                        }
                    }
                    
                    resultContent.innerHTML = html;
                })
                .catch(error => {
                    resultContent.innerHTML = `<p class="error">Error testing URL: ${error.message}</p>`;
                })
                .finally(() => {
                    testBtn.disabled = false;
                    testBtn.textContent = 'Test URL';
                });
            });
            
            testProxyBtn.addEventListener('click', function() {
                const url = proxyUrl.textContent;
                window.open(url, '_blank');
            });
        });
    </script>
</body>
</html>
