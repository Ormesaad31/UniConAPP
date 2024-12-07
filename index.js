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
            <title>Date Selection</title>
        </head>
        <body>
            <h1>Select Two Dates</h1>
            <form id="dateForm">
                <label for="startDate">Start Date:</label>
                <input type="date" id="startDate" name="startDate" required>
                <br><br>
                <label for="endDate">End Date:</label>
                <input type="date" id="endDate" name="endDate" required>
                <br><br>
                <button type="submit">Confirm Selection</button>
            </form>
            <div id="response"></div>

            <script>
                document.getElementById('dateForm').addEventListener('submit', function (event) {
                    event.preventDefault(); // Prevent page reload
                    const startDate = document.getElementById('startDate').value;
                    const endDate = document.getElementById('endDate').value;

                    // Send a POST request to the Azure Function
                    fetch('${functionUrl}', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ startDate, endDate })
                    })
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('response').innerText = \`Server Response: \${JSON.stringify(data)}\`;
                    })
                    .catch(error => {
                        document.getElementById('response').innerText = \`Error: \${error}\`;
                    });
                });
            </script>
        </body>
        </html>
    `);
});

// API endpoint to interact with the Azure Function
app.post('/sendDates', async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Both startDate and endDate are required.' });
        }

        // Sending the POST request to the Azure Function
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ startDate, endDate }),
        });

        // Parsing the response from the Azure Function
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});
// Start the server

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
