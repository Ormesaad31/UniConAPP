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
                    event.preventDefault(); // Empêche le rechargement de la page
                    const startDate = document.getElementById('startDate').value;
                    const endDate = document.getElementById('endDate').value;

                    // Envoi de la requête POST au serveur
                    fetch('/sendDates', {
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
                        document.getElementById('response').innerText = \`Error: \${error.message}\`;
                    });
                });
            </script>
        </body>
        </html>
    `);
});

// API pour recevoir les dates et les traiter
app.post('/sendDates', (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        if (!startDate || !endDate) {
            throw new Error('Both dates are required.');
        }
        // Exemple de traitement des données
        res.json({ message: 'Dates received successfully!', startDate, endDate });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Start the server

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
