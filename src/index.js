import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
import session from 'express-session';
import supabase from './db.js';
import empresaRoutes from './routes/empresaRoutes.js';
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
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 24 horas
}));

// public/ está dentro de src/, mismo nivel que index.js
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landingPage.html'));
});

app.get('/recursos', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'general', 'recursos.html'));
});

app.get('/buscar-empleos', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'general', 'buscarEmpleos.html'));
});

app.get('/trabajos-disponibles', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'general', 'trabajosDisponibles.html'));
});

app.get('/registro-empresa', (req, res) => {
    res.sendFile(path.join(__dirname, './views/empresa/pages/registroEmpresa.html'));
});

app.get('/login-empresa', (req, res) => {
    res.sendFile(path.join(__dirname, './views/empresa/pages/loginEmpresa.html'));
});

app.get('/perfil-empresa', (req, res) => {
    res.sendFile(path.join(__dirname, './views/empresa/pages/perfilEmpresa.html'));
});

app.get('/modal-publicar-empleo', (req, res) => {
  res.sendFile(path.join(__dirname, './views/empresa/modals/publicarEmpleoModal.html'));
});
app.get('/modal-editar-empleo', (req, res) => {
  res.sendFile(path.join(__dirname, './views/empresa/modals/editarEmpleoModal.html'));
});

app.get('/modal-ver-candidato', (req, res) => {
    res.sendFile(path.join(__dirname, './views/empresa/modals/verPerfilCandidatoModal.html'));
});
app.use('/api/empresa', empresaRoutes);
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
app.get('/cerrar-sesion', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});
app.use(errorHandler);

app.get('/foros', (req, res) => {
    res.sendFile(path.join(__dirname, './views/empresa/pages/foros.html'));
});
 

app.listen(process.env.PORT || 3000, () => {
    console.log(`Servidor corriendo en http://localhost:${process.env.PORT || 3000}`);
});

app.get('/sobre-nosotros', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'general', 'sobreNosotros.html'));
});

app.get('/contacto', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'general', 'contacto.html'));
});