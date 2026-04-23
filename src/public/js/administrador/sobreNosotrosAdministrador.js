import { getEstadisticas } from "../api/generalApi.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const { estadisticas } = await getEstadisticas();

    const totalUsuarios =
      estadisticas.candidatosActivos + estadisticas.empresasRegistradas;

    document.getElementById("stat-usuarios").textContent =
      "+" + totalUsuarios.toLocaleString() + " usuarios";

    document.getElementById("stat-empresas").textContent =
      "+" + estadisticas.empresasRegistradas.toLocaleString() + " empresas";
  } catch (err) {
    console.error("Error al cargar las estadísticas:", err);
  }
});
