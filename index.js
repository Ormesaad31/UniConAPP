import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
const app = express();

const PORT = 8080;
// Middleware to serve static files and parse JSON
app.use(express.static('public'));
app.use(bodyParser.json());

// Azure Function URL
const functionUrl = 'https://bestunicon.azurewebsites.net/api/AddFunction?code=UkjT-AC4hiNtIfH7GBDoWougR5oDGfOhnXgKu9y-gpPEAzFubt5ixQ==';

// Route to render the front-end HTML
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Connect to Azure Function</title>
        </head>
        <body>
            <h1>Test Azure Function</h1>
            <input type="text" id="inputMessage" placeholder="Enter a message">
            <button id="sendButton">Send to Azure Function</button>
            <div id="response"></div>

            <script>
                document.getElementById('sendButton').addEventListener('click', function () {
                    const inputMessage = document.getElementById('inputMessage').value;

                    // Sending a POST request to the server
                    fetch('/sendMessage', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ name: inputMessage })
                    })
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('response').innerText = \`Function Response: \${JSON.stringify(data)}\`;
                    })
                    .catch(error => {
                        document.getElementById('response').innerText = \`Error: \${error.message}\`;
                    });
                });
            </script>
        </body>
        </html>
    `);
});

// API endpoint to interact with the Azure Function
app.post('/sendMessage', async (req, res) => {
    try {
        const { name } = req.body;
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
