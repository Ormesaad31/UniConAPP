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
            <title>Gestion des Congés</title>
        </head>
        <body>
            <h1>Gestion des Congés</h1>

            <!-- Formulaire pour ajouter un employé -->
            <h2>Ajouter un Employé</h2>
            <form id="addEmployeeForm">
                <label>Nom:</label>
                <input type="text" id="nom" required>
                <label>Prénom:</label>
                <input type="text" id="prenom" required>
                <label>Email:</label>
                <input type="email" id="email" required>
                <label>Photo:</label>
                <input type="file" id="image" accept="image/*" required>
                <button type="submit">Ajouter</button>
            </form>
            <div id="employeeAddResponse"></div>

            <!-- Sélectionner un employé existant -->
            <h2>Sélectionner un Employé</h2>
            <select id="employeeSelect">
                <option value="">-- Sélectionnez un employé --</option>
            </select>
            <h2>Image de l'Employé</h2>
            <img id="employeeImage" src="" alt="Image de l'employé" style="max-width: 200px; display: none;">

            <!-- Formulaire pour sélectionner des dates -->
            <h2>Sélectionner Deux Dates</h2>
            <form id="dateForm">
                <label>Date de Début:</label>
                <input type="date" id="startDate" required>
                <label>Date de Fin:</label>
                <input type="date" id="endDate" required>
                <button type="submit">Confirmer</button>
            </form>
            <div id="response"></div>

            <script>
                const functionUrl = '${functionUrl}';

                // Charger les employés
                async function loadEmployees() {
                    const response = await fetch(functionUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'getEmployees' })
                    });
                    const employees = await response.json();
                    const select = document.getElementById('employeeSelect');
                    select.innerHTML = '<option value="">-- Sélectionnez un employé --</option>';
                    employees.forEach(emp => {
                        const option = document.createElement('option');
                        option.value = emp.id;
                        option.textContent = \`\${emp.nom} \${emp.prenom} (\${emp.email})\`;
                        option.dataset.employee = JSON.stringify(emp); // Attache les données de l'employé
                        select.appendChild(option);
                    });
                }

                // Afficher l'image de l'employé
                document.getElementById('employeeSelect').addEventListener('change', () => {
                    const select = document.getElementById('employeeSelect');
                    const selectedOption = select.options[select.selectedIndex];
                    const employeeImage = document.getElementById('employeeImage');

                    if (selectedOption && selectedOption.value) {
                        const employeeData = JSON.parse(selectedOption.dataset.employee);

                        if (employeeData.imageUrl) {
                            employeeImage.src = employeeData.imageUrl;
                            employeeImage.style.display = 'block';
                        } else {
                            employeeImage.src = '';
                            employeeImage.style.display = 'none';
                        }
                    } else {
                        employeeImage.src = '';
                        employeeImage.style.display = 'none';
                    }
                });

                // Ajouter un employé
                document.getElementById('addEmployeeForm').addEventListener('submit', async (e) => {
                    e.preventDefault();

                    const nom = document.getElementById('nom').value;
                    const prenom = document.getElementById('prenom').value;
                    const email = document.getElementById('email').value;
                    const imageFile = document.getElementById('image').files[0];

                    if (!imageFile) {
                        alert('Veuillez sélectionner une image.');
                        return;
                    }

                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const imageBase64 = reader.result.split(',')[1];
                        const fileExtension = imageFile.name.split('.').pop().toLowerCase();

                        const response = await fetch(functionUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'addEmployee', nom, prenom, email, image: imageBase64, fileExtension })
                        });
                        const result = await response.json();
                        document.getElementById('employeeAddResponse').innerText = JSON.stringify(result);
                        loadEmployees(); // Recharger les employés
                    };
                    reader.readAsDataURL(imageFile);
                });

                // Ajouter un congé
                document.getElementById('dateForm').addEventListener('submit', async (e) => {
                    e.preventDefault();

                    const employeeId = document.getElementById('employeeSelect').value;
                    const startDate = document.getElementById('startDate').value;
                    const endDate = document.getElementById('endDate').value;

                    if (!employeeId) {
                        alert('Veuillez sélectionner un employé.');
                        return;
                    }

                    const response = await fetch(functionUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'addLeave', employeeId, startDate, endDate })
                    });
                    const result = await response.json();
                    document.getElementById('response').innerText = JSON.stringify(result);
                });

                // Charger les employés au chargement de la page
                window.onload = loadEmployees;
            </script>
        </body>
        </html>
    `);
});

// API endpoint to interact with the Azure Function
app.post('/sendRequest', async (req, res) => {
    try {
        const { action, ...rest } = req.body;

        if (!action) {
            return res.status(400).json({ error: 'Action is required.' });
        }

        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...rest }),
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
