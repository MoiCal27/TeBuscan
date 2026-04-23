import { switchTab, togglePass } from "../ui/uiHelpers.js";
import { loginEmpresa } from "../api/empresaApi.js";
import { loginCandidato } from "../api/candidatoApi.js";
import { loginAdmin } from "../api/adminApi.js";
import {
  mostrarError,
  limpiarError,
  limpiarTodos,
} from "../ui/validaciones.js";

// botones tabs
const btnCandidato = document.getElementById("tab-candidato");
const btnEmpresa = document.getElementById("tab-empresa");
const btnAdmin = document.getElementById("tab-admin");

btnCandidato.addEventListener("click", () => switchTab("candidato"));
btnEmpresa.addEventListener("click", () => switchTab("empresa"));
btnAdmin.addEventListener("click", () => switchTab("admin"));

const btnPassLogin = document.getElementById("btn-pass-login");
btnPassLogin.addEventListener("click", () =>
  togglePass("password_login", btnPassLogin),
);

const btnLogin = document.getElementById("btnLoginEmpresa");
btnLogin.addEventListener("click", async () => {
  limpiarTodos(["correo_login", "password_login"]);
  let valido = true;

  const correo_usuario = document.getElementById("correo_login").value.trim();
  const password_usuario = document.getElementById("password_login").value;

  if (!correo_usuario) {
    mostrarError("correo_login", "El correo es obligatorio");
    valido = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo_usuario)) {
    mostrarError("correo_login", "El correo no es válido");
    valido = false;
  }

  if (!password_usuario) {
    mostrarError("password_login", "La contraseña es obligatoria");
    valido = false;
  }

  if (!valido) return;

  try {
    const respuesta = await loginEmpresa({ correo_usuario, password_usuario });

    if (respuesta.error) {
      mostrarError("correo_login", respuesta.error);
      return;
    }

    window.location.href = "/perfil-empresa";
  } catch (error) {
    mostrarError("correo_login", error.message || "Error al iniciar sesión");
  }
});

//login candidadto

const btnPassLoginC = document.getElementById("btn-pass-login-c");
btnPassLoginC.addEventListener("click", () =>
  togglePass("password_login_c", btnPassLoginC),
);

const btnLoginCandidato = document.getElementById("btnLoginCandidato");

btnLoginCandidato.addEventListener("click", async () => {
  limpiarTodos(["correo_login_c", "password_login_c"]);
  let valido = true;

  const correo_usuario = document.getElementById("correo_login_c").value.trim();
  const password_usuario = document.getElementById("password_login_c").value;

  if (!correo_usuario) {
    mostrarError("correo_login_c", "El correo es obligatorio");
    valido = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo_usuario)) {
    mostrarError("correo_login_c", "Correo no válido");
    valido = false;
  }

  if (!password_usuario) {
    mostrarError("password_login_c", "La contraseña es obligatoria");
    valido = false;
  }

  if (!valido) return;

  try {
    const respuesta = await loginCandidato({
      correo_usuario,
      password_usuario,
    });

    if (respuesta.error) {
      mostrarError("correo_login_c", respuesta.error);
      return;
    }

    window.location.href = "/inicio-candidato";
  } catch (error) {
    mostrarError("correo_login_c", error.message || "Error al iniciar sesión");
  }
});

// login admin
const btnPassLoginA = document.getElementById("btn-pass-login-a");
btnPassLoginA.addEventListener("click", () =>
  togglePass("password_login_a", btnPassLoginA),
);

const btnLoginAdmin = document.getElementById("btnLoginAdmin");

btnLoginAdmin.addEventListener("click", async () => {
  limpiarTodos(["correo_login_a", "password_login_a"]);
  let valido = true;

  const correo_usuario = document.getElementById("correo_login_a").value.trim();
  const password_usuario = document.getElementById("password_login_a").value;

  if (!correo_usuario) {
    mostrarError("correo_login_a", "El correo es obligatorio");
    valido = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo_usuario)) {
    mostrarError("correo_login_a", "Correo no válido");
    valido = false;
  }

  if (!password_usuario) {
    mostrarError("password_login_a", "La contraseña es obligatoria");
    valido = false;
  }

  if (!valido) return;

  try {
    const respuesta = await loginAdmin({
      correo_usuario,
      password_usuario,
    });

    if (respuesta.error) {
      mostrarError("correo_login_a", respuesta.error);
      return;
    }

    window.location.href = "/panel-admin";
  } catch (error) {
    mostrarError("correo_login_a", error.message || "Error al iniciar sesión");
  }
});
