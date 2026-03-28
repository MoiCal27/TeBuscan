import { switchTab, togglePass } from '../ui/uiHelpers.js';
import { registrarEmpresa } from '../api/empresaApi.js';
import { mostrarError, limpiarError, limpiarTodos } from '../ui/validaciones.js';

// botones
const btnCandidato = document.getElementById('tab-candidato');
const btnEmpresa = document.getElementById('tab-empresa');
const btnRegistro = document.getElementById('btnRegistroEmpresa');
// eventos
btnCandidato.addEventListener('click', () => switchTab('candidato'));
btnEmpresa.addEventListener('click', () => switchTab('empresa'));

const btnPassE = document.getElementById('btn-pass-e');
const btnCpassE = document.getElementById('btn-cpass-e');

btnPassE.addEventListener('click', () => togglePass('password_usuario', btnPassE));
btnCpassE.addEventListener('click', () => togglePass('confirm_password', btnCpassE));
 document.getElementById('telefono_empresa').addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) {
        val = val.slice(0, 4) + '-' + val.slice(4, 8);
    }
    e.target.value = val;
});
btnRegistro.addEventListener('click', async () => {

limpiarTodos(['nombre_empresa','nombre_contacto_empresa','correo_usuario',
   'telefono_empresa','ubicacion_empresa','password_usuario','confirm_password']);
  let valido = true;

  const nombre_empresa = document.getElementById('nombre_empresa').value.trim();
  const nombre_contacto_empresa = document.getElementById('nombre_contacto_empresa').value.trim();
  const correo_usuario = document.getElementById('correo_usuario').value.trim();
  const telefono_empresa = document.getElementById('telefono_empresa').value.trim();
  const ubicacion_empresa = document.getElementById('ubicacion_empresa').value.trim();
  const password_usuario = document.getElementById('password_usuario').value;
  const confirm_password = document.getElementById('confirm_password').value;
 

  if (!nombre_empresa) {
    mostrarError('nombre_empresa', 'El nombre de la empresa es obligatorio'); valido = false;
  }
  if (!nombre_contacto_empresa) {
    mostrarError('nombre_contacto_empresa', 'El nombre de contacto es obligatorio'); valido = false;
} else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre_contacto_empresa)) {
    mostrarError('nombre_contacto_empresa', 'El nombre solo puede contener letras'); valido = false;
}
  if (!correo_usuario) {
    mostrarError('correo_usuario', 'El correo es obligatorio'); valido = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo_usuario)) {
    mostrarError('correo_usuario', 'El correo no es válido'); valido = false;
  }
  if (!telefono_empresa) {
    mostrarError('telefono_empresa', 'El teléfono es obligatorio'); valido = false;
  } else if (!/^[0-9]{4}-[0-9]{4}$/.test(telefono_empresa)) {
    mostrarError('telefono_empresa', 'Solo se permiten números'); valido = false;
}
  if (!ubicacion_empresa) {
    mostrarError('ubicacion_empresa', 'La ubicación es obligatoria'); valido = false;
  }
  if (!password_usuario) {
    mostrarError('password_usuario', 'La contraseña es obligatoria'); valido = false;
  } else if (password_usuario.length < 6) {
    mostrarError('password_usuario', 'Mínimo 6 caracteres'); valido = false;
  }
  if (!confirm_password) {
    mostrarError('confirm_password', 'Confirma tu contraseña'); valido = false;
  } else if (password_usuario !== confirm_password) {
    mostrarError('confirm_password', 'Las contraseñas no coinciden'); valido = false;
  }
  
  if (!valido) return;

  try {
    const respuesta = await registrarEmpresa({
      nombre_empresa, nombre_contacto_empresa,
      correo_usuario, telefono_empresa,
      ubicacion_empresa, password_usuario
    });

    window.location.href = '/perfil-empresa';

  } catch (error) {
    mostrarError('correo_usuario', error.message || 'Error al registrar empresa');
  }
});
