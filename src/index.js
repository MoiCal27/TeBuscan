import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';

dotenv.config();

import supabase from './db.js';
import empresaRoutes from './routes/empresaRoutes.js';
import candidatoRoutes from './routes/candidatoRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
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

//Autenticacion
app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'autenticacion',  'registro.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'autenticacion',  'login.html'));
});
// ── Rutas de páginas empresa ──────────────────────────────────

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
//Rutas de candidatos
app.get('/inicio-candidato', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'candidato', 'pages', 'inicioCandidato.html'));
});
app.get('/perfil-candidato', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'candidato', 'pages', 'perfilCandidato.html'));
});

app.get('/sobre-nosotros-empresa', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'empresa', 'pages', 'sobreNosotrosEmpresa.html'));
});

app.get('/contacto-empresa', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'empresa', 'pages', 'contactoEmpresa.html'));
});

app.get('/modal-crear-alerta', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'candidato', 'modals', 'crearAlertaModal.html'));
});
app.get('/modal-editar-alerta', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'candidato', 'modals', 'editarAlertaModal.html'));
});

app.get('/modal-notificaciones', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'candidato', 'modals', 'modalNotificaciones.html'));
});

app.get('/modal-crear-valoracion', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'candidato', 'modals', 'crearValoracionModal.html'));
});
app.get('/modal-editar-valoracion', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'candidato', 'modals', 'editarValoracionModal.html'));
});

app.get('/recursos-candidato', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'candidato', 'pages', 'recursosCandidato.html'));
});

app.get('/detalle-recurso', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'candidato', 'pages', 'detalleRecurso.html'));
});

app.get('/buscar-empleos-candidato', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'candidato', 'pages', 'buscarEmpleosCandidato.html'));
});

app.get('/detalle-empleo-candidato', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'candidato', 'pages', 'detalleEmpleoCandidato.html'));
});

app.get('/panel-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'administrador', 'pages', 'panelAdmin.html'));
});

app.get('/modal-ver-usuario', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'administrador', 'modals', 'verUsuarioModal.html'));
});
app.get('/modal-editar-usuario', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'administrador', 'modals', 'editarUsuarioModal.html'));
});

app.get('/modal-ver-empresa', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'administrador', 'modals', 'verEmpresaModal.html'));
});
app.get('/modal-editar-empresa', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'administrador', 'modals', 'editarEmpresaModal.html'));
});

app.get('/modal-detalle-vacante', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'administrador', 'modals', 'detalleVacanteModal.html'));
});

app.get('/detalle-empresa-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'administrador', 'pages', 'detalleEmpresaAdministrador.html'));
});

app.get('/detalle-empleo-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'administrador', 'pages', 'detalleEmpleoAdministrador.html'));
});

// Cerrar sesión
app.get('/cerrar-sesion', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.use('/api/candidato', candidatoRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/config', (req, res) => {
    res.json({
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_KEY
    });
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