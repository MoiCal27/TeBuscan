import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';

dotenv.config();

import supabase from './db.js';
import empresaRoutes from './routes/empresaRoutes.js';
import generalRoutes from './routes/generalRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'tebuscan_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/empresa', empresaRoutes);
app.use('/api/general', generalRoutes);

// Rutas de páginas generales
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landingPage.html'));
});

app.get('/buscar-empleos', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'general', 'buscarEmpleos.html'));
});

app.get('/buscar-empresas', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'general', 'buscarEmpresas.html'));
});

app.get('/detalle-empresa', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'general', 'detalleEmpresa.html'));
});

app.get('/detalle-empleo', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'general', 'detalleEmpleo.html'));
});

app.get('/recursos', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'general', 'recursos.html'));
});

app.get('/trabajos-disponibles', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'general', 'trabajosDisponibles.html'));
});

app.get('/sobre-nosotros', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'general', 'sobreNosotros.html'));
});

app.get('/contacto', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'general', 'contacto.html'));
});

app.get('/foros-general', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'general', 'forosGeneral.html'));
});

// Rutas de páginas empresa
app.get('/registro-empresa', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'empresa', 'pages', 'registroEmpresa.html'));
});

app.get('/login-empresa', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'empresa', 'pages', 'loginEmpresa.html'));
});

app.get('/perfil-empresa', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'empresa', 'pages', 'perfilEmpresa.html'));
});

app.get('/foros', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'empresa', 'pages', 'foros.html'));
});

// Rutas de modales empresa
app.get('/modal-publicar-empleo', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'empresa', 'modals', 'publicarEmpleoModal.html'));
});

app.get('/modal-editar-empleo', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'empresa', 'modals', 'editarEmpleoModal.html'));
});

app.get('/modal-ver-candidato', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'empresa', 'modals', 'verPerfilCandidatoModal.html'));
});

// Cerrar sesión
app.get('/cerrar-sesion', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.use(errorHandler);

const { data, error } = await supabase
    .schema('tebuscan')
    .from('usuario')
    .select('*')
    .limit(1);

if (error) {
    console.error('Error conectando a Supabase:', error.message);
} else {
    console.log('Conexión exitosa a Supabase!', data);
}

app.listen(process.env.PORT || 3000, () => {
    console.log(`Servidor corriendo en http://localhost:${process.env.PORT || 3000}`);
});