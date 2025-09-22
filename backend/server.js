const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./db');
const User = require('./models/User');
const fs = require('fs');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'your-secret-key';

// Connect to the database
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Static user data
const userData = [
  { numero_compteur: "0265896523", name: "Josias Makosso", adress: "Quartier 5, Libreville" },
  { numero_compteur: "02589632155", name: "Boutsinga Glenn", adress: "Quartier 12, Libreville" },
  { numero_compteur: "0234567890", name: "Richard mebodos", adress: "Quartier 8, Libreville" }
];

// Routes
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Replace with actual authentication logic
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/user/:numero_compteur', async (req, res) => {
  const { numero_compteur } = req.params;
  console.log('Requête reçue pour numéro de compteur:', numero_compteur);

  const user = userData.find(u => u.numero_compteur === numero_compteur);

  if (user) {
    res.status(200).json({ name: user.name, adress: user.adress });
  } else {
    res.status(404).json({ message: "Utilisateur non trouvé" });
  }
});

// Ajout d'une route pour récupérer les informations du compteur
app.get('/api/compteur/:numero', (req, res) => {
    const numero = req.params.numero;
    const compteur = userData.find(c => c.numero_compteur === numero);

    if (compteur) {
        res.json(compteur);
    } else {
        res.status(404).json({ message: 'Compteur non trouvé' });
    }
});

// Route pour enregistrer une transaction
app.post('/api/transaction', (req, res) => {
  const { numero_compteur, montant, date } = req.body;
  const transaction = { numero_compteur, montant, date };

  console.log('Requête reçue pour enregistrer une transaction:', transaction);

  // Vérifier et créer le fichier historique.json s'il n'existe pas
  if (!fs.existsSync('historique.json')) {
    try {
      fs.writeFileSync('historique.json', JSON.stringify([], null, 2));
      console.log('Fichier historique.json créé avec succès.');
    } catch (err) {
      console.error('Erreur lors de la création du fichier historique.json:', err);
      return res.status(500).json({ message: 'Erreur lors de la création du fichier historique.' });
    }
  }

  // Lire le fichier historique
  fs.readFile('historique.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier historique.json:', err);
      return res.status(500).json({ message: 'Erreur lors de la lecture du fichier historique.' });
    }

    let historique = [];
    try {
      historique = JSON.parse(data);
    } catch (parseErr) {
      console.error('Erreur lors du parsing du fichier historique.json:', parseErr);
      return res.status(500).json({ message: 'Erreur lors du parsing du fichier historique.' });
    }

    // Ajouter la nouvelle transaction
    historique.push(transaction);

    // Écrire dans le fichier
    fs.writeFile('historique.json', JSON.stringify(historique, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Erreur lors de l’écriture dans le fichier historique.json:', writeErr);
        return res.status(500).json({ message: 'Erreur lors de l’écriture dans le fichier historique.' });
      }
      console.log('Transaction enregistrée avec succès:', transaction);
      res.status(200).json({ message: 'Transaction enregistrée avec succès.' });
    });
  });
});

// Route pour récupérer l’historique des transactions
app.get('/api/historique', (req, res) => {
  fs.readFile('historique.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération de l’historique.' });
    }
    const historique = JSON.parse(data || '[]');
    res.status(200).json(historique);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});