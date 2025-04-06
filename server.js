const express = require('express');
const path = require('path');
const plantRoutes = require('./back/routes/plantRoutes');
const client = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'front')));

// Маршруты API
app.use('/api/plants', plantRoutes);

// Маршруты для страниц
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'front', 'index.html'));
});

app.get('/add-plant', (req, res) => {
    res.sendFile(path.join(__dirname, 'front', 'add-plant.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
