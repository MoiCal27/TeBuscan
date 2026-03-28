import { switchTab, togglePass } from '../ui/uiHelpers.js';
import { loginEmpresa } from '../api/empresaApi.js';

// botones tabs
const btnCandidato = document.getElementById('tab-candidato');
const btnEmpresa = document.getElementById('tab-empresa');
const btnAdmin = document.getElementById('tab-admin');

btnCandidato.addEventListener('click', () => switchTab('candidato'));
btnEmpresa.addEventListener('click', () => switchTab('empresa'));
btnAdmin.addEventListener('click', () => switchTab('admin'));

// toggle contraseña
const btnPassLogin = document.getElementById('btn-pass-login');
btnPassLogin.addEventListener('click', () => togglePass('password_login', btnPassLogin));

// helpers validación
function mostrarError(id, mensaje) {
  const wrap = document.getElementById('wrap-' + id);
  const error = document.getElementById('error-' + id);
  if (wrap) { wrap.classList.add('error'); wrap.classList.remove('success'); }
  if (error) { error.textContent = mensaje; error.classList.add('visible'); }
}

function limpiarError(id) {
  const wrap = document.getElementById('wrap-' + id);
  const error = document.getElementById('error-' + id);
  if (wrap) { wrap.classList.remove('error'); wrap.classList.add('success'); }
  if (error) { error.classList.remove('visible'); }
}

function limpiarTodos() {
  ['correo_login', 'password_login'].forEach(id => limpiarError(id));
}

const btnLogin = document.getElementById('btnLoginEmpresa');
btnLogin.addEventListener('click', async () => {
  limpiarTodos();
  let valido = true;

  const correo_usuario = document.getElementById('correo_login').value.trim();
  const password_usuario = document.getElementById('password_login').value;

  if (!correo_usuario) {
    mostrarError('correo_login', 'El correo es obligatorio'); valido = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo_usuario)) {
    mostrarError('correo_login', 'El correo no es válido'); valido = false;
  }

  if (!password_usuario) {
    mostrarError('password_login', 'La contraseña es obligatoria'); valido = false;
  }

  if (!valido) return;

  try {
    const respuesta = await loginEmpresa({ correo_usuario, password_usuario });

    if (respuesta.error) {
      mostrarError('correo_login', respuesta.error);
      return;
    }

    window.location.href = '/perfil-empresa';

  } catch (error) {
    mostrarError('correo_login', error.message || 'Error al iniciar sesión');
  }
});