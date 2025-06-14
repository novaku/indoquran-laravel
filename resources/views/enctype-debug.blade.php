<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form Enctype Debug Tool</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #22c55e;
            border-bottom: 2px solid #22c55e;
            padding-bottom: 10px;
        }
        h2 {
            color: #333;
            margin-top: 20px;
        }
        form {
            margin-top: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input, textarea, button {
            margin-bottom: 15px;
            padding: 8px;
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background-color: #22c55e;
            color: white;
            border: none;
            cursor: pointer;
            font-weight: bold;
            padding: 10px;
        }
        button:hover {
            background-color: #1da54d;
        }
        .result {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
            white-space: pre-wrap;
            overflow-x: auto;
        }
        .error {
            color: #e53e3e;
            margin-top: 5px;
        }
        .info {
            background-color: #ebf8ff;
            border-left: 4px solid #3182ce;
            padding: 10px 15px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <h1>Form Enctype Debug Tool</h1>
    <p>This tool helps test different form submission methods and detect issues with encoding types.</p>
    
    <div class="info">
        <p><strong>Why this matters:</strong> The service worker warning "Enctype should be set to either application/x-www-form-urlencoded or multipart/form-data" appears when forms don't have proper encoding type specified, especially for file uploads.</p>
    </div>

    <div class="card">
        <h2>Test 1: Standard Form (application/x-www-form-urlencoded)</h2>
        <form id="form1" method="POST" action="/api/enctype-test" enctype="application/x-www-form-urlencoded">
            <label for="name1">Name:</label>
            <input type="text" id="name1" name="name" value="Test User">
            
            <label for="message1">Message:</label>
            <textarea id="message1" name="message">This is a test message using standard form encoding.</textarea>
            
            <button type="submit">Submit Standard Form</button>
        </form>
        <div id="result1" class="result">Results will appear here...</div>
    </div>

    <div class="card">
        <h2>Test 2: Form with File Upload (multipart/form-data)</h2>
        <form id="form2" method="POST" action="/api/enctype-test" enctype="multipart/form-data">
            <label for="name2">Name:</label>
            <input type="text" id="name2" name="name" value="Test User">
            
            <label for="file2">File:</label>
            <input type="file" id="file2" name="file">
            
            <label for="message2">Message:</label>
            <textarea id="message2" name="message">This is a test message with file upload.</textarea>
            
            <button type="submit">Submit Form with File</button>
        </form>
        <div id="result2" class="result">Results will appear here...</div>
    </div>

    <div class="card">
        <h2>Test 3: Form with No Enctype Specified</h2>
        <form id="form3" method="POST" action="/api/enctype-test">
            <label for="name3">Name:</label>
            <input type="text" id="name3" name="name" value="Test User">
            
            <label for="message3">Message:</label>
            <textarea id="message3" name="message">This is a test message with no enctype specified.</textarea>
            
            <button type="submit">Submit Form without Enctype</button>
        </form>
        <div id="result3" class="result">Results will appear here...</div>
        <div class="info">
            <p><strong>Note:</strong> This form doesn't explicitly set enctype, so browsers will default to application/x-www-form-urlencoded.</p>
        </div>
    </div>

    <div class="card">
        <h2>Test 4: Form with File but Wrong Enctype</h2>
        <form id="form4" method="POST" action="/api/enctype-test" enctype="application/x-www-form-urlencoded">
            <label for="name4">Name:</label>
            <input type="text" id="name4" name="name" value="Test User">
            
            <label for="file4">File:</label>
            <input type="file" id="file4" name="file">
            
            <label for="message4">Message:</label>
            <textarea id="message4" name="message">This form has a file input but wrong enctype.</textarea>
            
            <button type="submit">Submit Form with Wrong Enctype</button>
        </form>
        <div id="result4" class="result">Results will appear here...</div>
        <div class="info">
            <p><strong>Warning:</strong> This form has a file input but uses application/x-www-form-urlencoded, which will cause the service worker warning and files won't be properly uploaded.</p>
        </div>
    </div>

    <script>
        // Prevent actual form submissions and log results
        function handleForm(formId, resultId) {
            const form = document.getElementById(formId);
            const resultDiv = document.getElementById(resultId);
            
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(form);
                let output = 'Form Data:\n';
                
                // Display form data
                for (let [key, value] of formData.entries()) {
                    if (value instanceof File) {
                        output += `${key}: ${value.name} (${value.type}, ${value.size} bytes)\n`;
                    } else {
                        output += `${key}: ${value}\n`;
                    }
                }
                
                // Display form properties
                output += '\nForm Properties:\n';
                output += `Method: ${form.method.toUpperCase()}\n`;
                output += `Enctype: ${form.enctype}\n`;
                output += `Action: ${form.action}\n`;
                
                // Check for potential issues
                if (form.enctype !== 'multipart/form-data' && form.querySelector('input[type="file"]')) {
                    output += '\nWARNING: Form has file input but enctype is not multipart/form-data!\n';
                    output += 'This is what triggers the service worker warning.';
                }
                
                resultDiv.textContent = output;
            });
        }
        
        // Initialize all forms
        handleForm('form1', 'result1');
        handleForm('form2', 'result2');
        handleForm('form3', 'result3');
        handleForm('form4', 'result4');
    </script>
</body>
</html>
