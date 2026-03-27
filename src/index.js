import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// public/ está dentro de src/, mismo nivel que index.js
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landingPage.html'));
});

app.get('/buscar-empleos', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'general', 'buscarEmpleos.html'));
});

app.get('/trabajos-disponibles', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'general', 'trabajosDisponibles.html'));
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Servidor corriendo en http://localhost:${process.env.PORT || 3000}`);
});

