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
app.get('/', async (req, res) => {
    try {
        const response = await fetch(azureFunctionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getEmployees' }),
        });

        const { employees } = await response.json();

        const employeOptions = employees.map(emp => `<option value="${emp.id}">${emp.nom} ${emp.prenom}</option>`).join('');

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Gestion des Congés</title>
            </head>
            <body>
                <h1>Gestion des Congés</h1>

                <h2>Sélectionner ou ajouter un employé</h2>
                <form id="addLeaveForm">
                    <label for="employe">Employé :</label>
                    <select id="employe" name="employe">
                        <option value="">-- Ajouter un nouvel employé --</option>
                        ${employeOptions}
                    </select>
                    <br><br>

                    <div id="newEmployeeFields" style="display:none;">
                        <label for="nom">Nom :</label>
                        <input type="text" id="nom" name="nom" required>
                        <br>
                        <label for="prenom">Prénom :</label>
                        <input type="text" id="prenom" name="prenom" required>
                        <br>
                        <label for="email">Email :</label>
                        <input type="email" id="email" name="email" required>
                        <br><br>
                    </div>

                    <label for="dateDebut">Date de Début :</label>
                    <input type="date" id="dateDebut" name="dateDebut" required>
                    <br>
                    <label for="dateFin">Date de Fin :</label>
                    <input type="date" id="dateFin" name="dateFin" required>
                    <br><br>
                    <button type="submit">Enregistrer</button>
                </form>

                <div id="response"></div>

                <script>
                    document.getElementById('employe').addEventListener('change', function () {
                        const newEmployeeFields = document.getElementById('newEmployeeFields');
                        if (this.value === '') {
                            newEmployeeFields.style.display = 'block';
                        } else {
                            newEmployeeFields.style.display = 'none';
                        }
                    });

                    document.getElementById('addLeaveForm').addEventListener('submit', function (event) {
                        event.preventDefault();

                        const employeId = document.getElementById('employe').value;
                        const nom = document.getElementById('nom').value;
                        const prenom = document.getElementById('prenom').value;
                        const email = document.getElementById('email').value;
                        const dateDebut = document.getElementById('dateDebut').value;
                        const dateFin = document.getElementById('dateFin').value;

                        fetch('/addLeave', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ employeId, nom, prenom, email, dateDebut, dateFin }),
                        })
                        .then(response => response.json())
                        .then(data => {
                            document.getElementById('response').innerText = JSON.stringify(data);
                        })
                        .catch(error => {
                            document.getElementById('response').innerText = 'Error: ' + error.message;
                        });
                    });
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send('Error fetching employees: ' + error.message);
    }
});

// Route for sending data to the Azure Function
app.post('/addLeave', async (req, res) => {
    try {
        const response = await fetch(azureFunctionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'addEmployeeAndLeave', ...req.body }),
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

        // Parsing the response from the Azure Function
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
