import supabase from "../db.js";

export { loginUsuario, verificarCorreo } from "./empresaServices.js";

export const getAdminByUsuario = async (id_usuario) => {
  const { data, error } = await supabase
    .schema("tebuscan")
    .from("administrador")
    .select("*")
    .eq("id_usuario", id_usuario)
    .single();

  if (error) throw new Error(error.message);

  return data;
};

export const getConteoPlataforma = async () => {
  const { data: usuarios } = await supabase
    .schema("tebuscan")
    .from("usuario")
    .select("id_usuario");
  const { data: empresas } = await supabase
    .schema("tebuscan")
    .from("empresa")
    .select("id_empresa");
  const { data: empleos } = await supabase
    .schema("tebuscan")
    .from("empleos")
    .select("id_empleo")
    .eq("estado_empleo", "activo");
  const { data: foros } = await supabase
    .schema("tebuscan")
    .from("foro")
    .select("id_foro");

  return {
    totalUsuarios: usuarios?.length || 0,
    totalEmpresas: empresas?.length || 0,
    totalEmpleos: empleos?.length || 0,
    totalForos: foros?.length || 0,
  };
};

export const getUsuarios = async () => {
  const { data: usuarios, error } = await supabase
    .schema("tebuscan")
    .from("usuario")
    .select(`id_usuario, correo_usuario, rol_usuario, activo, registro_usuario`)
    .eq("rol_usuario", "candidato")
    .order("registro_usuario", { ascending: false });

  if (error) throw new Error(error.message);

  const { data: candidatos } = await supabase
    .schema("tebuscan")
    .from("candidato")
    .select(
      "id_candidato, nombre_candidato, apellido_candidato, telefono_candidato, ubicacion_candidato, descripcion_candidato, estado_candidato, curriculum, id_usuario",
    );

  const { data: aplicaciones } = await supabase
    .schema("tebuscan")
    .from("aplicacion")
    .select("id_candidato");

  return usuarios.map((u) => {
    const candidato =
      candidatos?.find((c) => c.id_usuario === u.id_usuario) || null;
    const totalAplicaciones = candidato
      ? aplicaciones?.filter((a) => a.id_candidato === candidato.id_candidato)
          .length || 0
      : 0;
    return {
      ...u,
      candidato: candidato
        ? { ...candidato, _aplicaciones: totalAplicaciones }
        : null,
    };
  });
};

export const actualizarEstadoUsuario = async (id_usuario, estado) => {
  const { error: errorCandidato } = await supabase
    .schema("tebuscan")
    .from("candidato")
    .update({ estado_candidato: estado })
    .eq("id_usuario", id_usuario);

  if (errorCandidato) throw new Error(errorCandidato.message);

  const { error: errorUsuario } = await supabase
    .schema("tebuscan")
    .from("usuario")
    .update({ activo: estado === "activo" })
    .eq("id_usuario", id_usuario);

  if (errorUsuario) throw new Error(errorUsuario.message);

  return true;
};

export const getEmpresas = async () => {
  const { data: empresas, error } = await supabase
    .schema("tebuscan")
    .from("empresa")
    .select(
      `
            id_empresa,
            nombre_empresa,
            industria_empresa,
            tamano_empresa,
            ubicacion_empresa,
            descripcion_empresa,
            site_web_empresa,
            id_usuario,
            empleos (
                id_empleo,
                estado_empleo,
                creacion_empleo,
                aplicacion (
                    id_aplicacion,
                    id_candidato,
                    fecha_aplicacion
                )
            ),
            valoracion (
                id_valoracion,
                calificacion
            )
        `,
    )
    .order("nombre_empresa", { ascending: true });

  if (error) throw new Error(error.message);

  const { data: usuarios } = await supabase
    .schema("tebuscan")
    .from("usuario")
    .select("id_usuario, correo_usuario, activo, registro_usuario");

  const { data: aceptados } = await supabase
    .schema("tebuscan")
    .from("evaluacion_aplicacion")
    .select(
      `
            estado_aplicacion,
            aplicacion (
                id_aplicacion,
                fecha_aplicacion,
                id_empleo,
                candidato (
                    nombre_candidato,
                    apellido_candidato
                ),
                empleos (
                    id_empresa
                )
            )
        `,
    )
    .eq("estado_aplicacion", "Aceptado");

  return empresas.map((e) => {
    const empleosActivos =
      e.empleos?.filter((emp) => emp.estado_empleo === "activo") || [];

    const ultimaOferta =
      e.empleos?.length > 0
        ? e.empleos
            .slice()
            .sort(
              (a, b) =>
                new Date(b.creacion_empleo) - new Date(a.creacion_empleo),
            )[0]?.creacion_empleo
        : null;

    const valoraciones = e.valoracion || [];
    const promedio =
      valoraciones.length > 0
        ? (
            valoraciones.reduce((acc, v) => acc + Number(v.calificacion), 0) /
            valoraciones.length
          ).toFixed(1)
        : null;

    const candidatosSet = new Set();
    e.empleos?.forEach((emp) => {
      emp.aplicacion?.forEach((a) => {
        if (a.id_candidato) candidatosSet.add(a.id_candidato);
      });
    });

    const usuario = usuarios?.find((u) => u.id_usuario === e.id_usuario);
    const estado = usuario?.activo ? "activo" : "inactivo";

    const creacion = usuario?.registro_usuario
      ? new Date(usuario.registro_usuario).toLocaleDateString("es-ES")
      : "-";

    const idsEmpleos = new Set(e.empleos?.map((emp) => emp.id_empleo) || []);

    const aceptadosEmpresa =
      aceptados?.filter(
        (ev) =>
          ev.aplicacion?.empleos?.id_empresa === e.id_empresa ||
          idsEmpleos.has(ev.aplicacion?.id_empleo),
      ) || [];

    let ultimoContratado = "-";
    if (aceptadosEmpresa.length > 0) {
      const ultimo = aceptadosEmpresa
        .slice()
        .sort(
          (a, b) =>
            new Date(b.aplicacion?.fecha_aplicacion) -
            new Date(a.aplicacion?.fecha_aplicacion),
        )[0];
      const c = ultimo.aplicacion?.candidato;
      ultimoContratado = c
        ? `${c.nombre_candidato} ${c.apellido_candidato}`
        : "-";
    }

    return {
      ...e,
      _empleosActivos: empleosActivos.length,
      _totalValoraciones: valoraciones.length,
      _promedio: promedio,
      _totalCandidatos: candidatosSet.size,
      _ultimaOferta: ultimaOferta
        ? new Date(ultimaOferta).toLocaleDateString("es-ES")
        : "-",
      _ultimoContratado: ultimoContratado,
      _creacion: creacion,
      _correo: usuario?.correo_usuario || "",
      _estado: estado,
    };
  });
};

export const actualizarEstadoEmpresa = async (id_empresa, estado) => {
  const { data: empresa, error: e1 } = await supabase
    .schema("tebuscan")
    .from("empresa")
    .select("id_usuario")
    .eq("id_empresa", id_empresa)
    .single();

  if (e1) throw new Error(e1.message);

  const { error: e2 } = await supabase
    .schema("tebuscan")
    .from("usuario")
    .update({ activo: estado === "activo" })
    .eq("id_usuario", empresa.id_usuario);

  if (e2) throw new Error(e2.message);
  return true;
};

export const getVacantes = async () => {
  const { data, error } = await supabase
    .schema("tebuscan")
    .from("empleos")
    .select(
      `
            id_empleo,
            titulo_empleo,
            ubicacion_empleo,
            categoria_empleo,
            tipo_empleo,
            tipo_contrato_empleo,
            salario_min_empleo,
            salario_max_empleo,
            descripcion_empleo,
            estado_empleo,
            creacion_empleo,
            empresa (
                id_empresa,
                nombre_empresa
            )
        `,
    )
    .order("creacion_empleo", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const actualizarEstadoEmpleo = async (id_empleo, estado) => {
  const { error } = await supabase
    .schema("tebuscan")
    .from("empleos")
    .update({ estado_empleo: estado })
    .eq("id_empleo", id_empleo);

  if (error) throw new Error(error.message);
  return true;
};

export const getForos = async () => {
  const { data, error } = await supabase
    .schema("tebuscan")
    .from("foro")
    .select(
      `
            id_foro,
            titulo_foro,
            descripcion_foro,
            fecha_foro,
            estado_foro,
            visualizaciones_foro,
            usuario (
                correo_usuario
            ),
            categoria (
                nombre_categoria
            ),
            foro_respuesta (
                id_respuesta,
                contenido,
                estado_respuesta,
                fecha_respuesta,
                usuario (
                    correo_usuario
                )
            )
        `,
    )
    .order("fecha_foro", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const actualizarEstadoRespuesta = async (id_respuesta, estado) => {
  const { error } = await supabase
    .schema("tebuscan")
    .from("foro_respuesta")
    .update({ estado_respuesta: estado })
    .eq("id_respuesta", id_respuesta);

  if (error) throw new Error(error.message);
  return true;
};

export const eliminarRespuesta = async (id_respuesta) => {
  const { error } = await supabase
    .schema("tebuscan")
    .from("foro_respuesta")
    .delete()
    .eq("id_respuesta", id_respuesta);

  if (error) throw new Error(error.message);
  return true;
};

export const actualizarEstadoForo = async (id_foro, estado) => {
  const { error } = await supabase
    .schema("tebuscan")
    .from("foro")
    .update({ estado_foro: estado })
    .eq("id_foro", id_foro);

  if (error) throw new Error(error.message);
  return true;
};

export const eliminarForo = async (id_foro) => {
  const { error } = await supabase
    .schema("tebuscan")
    .from("foro")
    .delete()
    .eq("id_foro", id_foro);

  if (error) throw new Error(error.message);
  return true;
};

export const getEstadisticasAdmin = async () => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const hoyISO = hoy.toISOString();

  const { data: nuevosHoy } = await supabase
    .schema("tebuscan")
    .from("usuario")
    .select("id_usuario", { count: "exact" })
    .gte("registro_usuario", hoyISO);

  const { data: empleosHoy } = await supabase
    .schema("tebuscan")
    .from("empleos")
    .select("id_empleo", { count: "exact" })
    .gte("creacion_empleo", hoyISO);

  const { data: aplicacionesHoy } = await supabase
    .schema("tebuscan")
    .from("aplicacion")
    .select("id_aplicacion", { count: "exact" })
    .gte("fecha_aplicacion", hoyISO);

  const { data: forosHoy } = await supabase
    .schema("tebuscan")
    .from("foro")
    .select("id_foro", { count: "exact" })
    .gte("fecha_foro", hoyISO);

  const { data: usuariosMes } = await supabase
    .schema("tebuscan")
    .from("usuario")
    .select("registro_usuario")
    .order("registro_usuario", { ascending: true });

  const { data: empleosMes } = await supabase
    .schema("tebuscan")
    .from("empleos")
    .select("creacion_empleo")
    .order("creacion_empleo", { ascending: true });

  const { data: aplicaciones } = await supabase
    .schema("tebuscan")
    .from("aplicacion")
    .select("id_aplicacion, id_empleo, empleos(categoria_empleo)");

  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const ahora = new Date();
  const labels = [];
  const dataUsuarios = [];
  const dataEmpleos = [];

  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const mes = fecha.getMonth();
    const anio = fecha.getFullYear();
    labels.push(meses[mes]);

    dataUsuarios.push(
      (usuariosMes || []).filter((u) => {
        const f = new Date(u.registro_usuario);
        return f.getMonth() === mes && f.getFullYear() === anio;
      }).length,
    );

    dataEmpleos.push(
      (empleosMes || []).filter((e) => {
        const f = new Date(e.creacion_empleo);
        return f.getMonth() === mes && f.getFullYear() === anio;
      }).length,
    );
  }

  const conteo = {};
  (aplicaciones || []).forEach((a) => {
    const cat = a.empleos?.categoria_empleo;
    if (cat) conteo[cat] = (conteo[cat] || 0) + 1;
  });
  const categorias = Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nombre, total]) => ({ nombre, total }));

  const maxCat = categorias[0]?.total || 1;

  return {
    actividad: {
      nuevosHoy: nuevosHoy?.length || 0,
      empleosHoy: empleosHoy?.length || 0,
      aplicacionesHoy: aplicacionesHoy?.length || 0,
      forosHoy: forosHoy?.length || 0,
    },
    graficoUsuarios: { labels, data: dataUsuarios },
    graficoEmpleos: { labels, data: dataEmpleos },
    categorias,
    maxCat,
  };
};