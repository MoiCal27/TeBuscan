import supabase from "../db.js";

export const verificarCorreo = async (correo_usuario) => {
  const { data } = await supabase
    .schema("tebuscan")
    .from("usuario")
    .select("id_usuario")
    .eq("correo_usuario", correo_usuario)
    .single();
  return data;
};

export const crearUsuario = async (correo_usuario, password_usuario) => {
  const { data, error } = await supabase
    .schema("tebuscan")
    .from("usuario")
    .insert([{ correo_usuario, password_usuario, rol_usuario: "empresa" }])
    .select("id_usuario")
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const crearEmpresa = async (datosEmpresa) => {
  const { data, error } = await supabase
    .schema("tebuscan")
    .from("empresa")
    .insert([datosEmpresa])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const loginUsuario = async (correo_usuario, password_usuario) => {
  const { data, error } = await supabase
    .schema("tebuscan")
    .rpc("login_usuario", {
      p_correo: correo_usuario,
      p_password: password_usuario,
    });
  if (error) throw new Error(error.message);
  return data;
};

export const getEmpresaByUsuario = async (id_usuario) => {
  const { data, error } = await supabase
    .schema("tebuscan")
    .from("empresa")
    .select("*")
    .eq("id_usuario", id_usuario)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const actualizarEmpresa = async (id_empresa, datos) => {
  const { data, error } = await supabase
    .schema("tebuscan")
    .from("empresa")
    .update({
      nombre_empresa: datos.nombre_empresa,
      nombre_contacto_empresa: datos.nombre_contacto_empresa,
      telefono_empresa: datos.telefono_empresa,
      ubicacion_empresa: datos.ubicacion_empresa,
      site_web_empresa: datos.site_web_empresa,
      descripcion_empresa: datos.descripcion_empresa,
      tamano_empresa: datos.tamano_empresa,
      industria_empresa: datos.industria_empresa,
      logo_empresa: datos.logo_empresa,
    })
    .eq("id_empresa", id_empresa)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getEmpleosEmpresa = async (id_empresa) => {
  const { data, error } = await supabase
    .schema("tebuscan")
    .from("empleos")
    .select("*")
    .eq("id_empresa", id_empresa)
    .order("creacion_empleo", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

export const crearEmpleo = async (datos) => {
  const { data, error } = await supabase
    .schema("tebuscan")
    .from("empleos")
    .insert([datos])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const actualizarEmpleo = async (id_empleo, datos) => {
  const { data, error } = await supabase
    .schema("tebuscan")
    .from("empleos")
    .update(datos)
    .eq("id_empleo", id_empleo)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getCandidatosEmpresa = async (id_empresa) => {
  const { data, error } = await supabase
    .schema("tebuscan")
    .from("aplicacion")
    .select(
      `
            id_aplicacion,
            fecha_aplicacion,
            mensaje_aplicacion,
            empleos!inner (
                id_empleo,
                titulo_empleo,
                id_empresa
            ),
            candidato (
                id_candidato,
                nombre_candidato,
                apellido_candidato,
                telefono_candidato,
                ubicacion_candidato,
                descripcion_candidato,
                curriculum,
                estado_candidato,
                candidato_x_titulo (
                    titulo (
                        nombre_titulo
                    )
                )
            ),
            evaluacion_aplicacion (
                id_evaluacion_aplicacion,
                estado_aplicacion,
                notas_internas
            )
        `,
    )
    .eq("empleos.id_empresa", id_empresa)
    .order("fecha_aplicacion", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const actualizarEstadoAplicacion = async (
  id_aplicacion,
  estado_aplicacion,
  notas_internas,
) => {
  const { data: existing } = await supabase
    .schema("tebuscan")
    .from("evaluacion_aplicacion")
    .select("id_evaluacion_aplicacion")
    .eq("id_aplicacion", id_aplicacion)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .schema("tebuscan")
      .from("evaluacion_aplicacion")
      .update({ estado_aplicacion, notas_internas })
      .eq("id_aplicacion", id_aplicacion)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  } else {
    const { data, error } = await supabase
      .schema("tebuscan")
      .from("evaluacion_aplicacion")
      .insert([{ id_aplicacion, estado_aplicacion, notas_internas }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
};

export const getEstadisticasEmpresa = async (id_empresa) => {
  const { data: empleos, error: e1 } = await supabase
    .schema("tebuscan")
    .from("empleos")
    .select("id_empleo", { count: "exact" })
    .eq("id_empresa", id_empresa)
    .eq("estado_empleo", "activo");
  if (e1) throw new Error(e1.message);

  const { data: aplicaciones, error: e2 } = await supabase
    .schema("tebuscan")
    .from("aplicacion")
    .select("id_aplicacion, fecha_aplicacion, empleos!inner(id_empresa)")
    .eq("empleos.id_empresa", id_empresa);
  if (e2) throw new Error(e2.message);

  const { data: visitas, error: e3 } = await supabase
    .schema("tebuscan")
    .from("visitas_empresas")
    .select("id_visita", { count: "exact" })
    .eq("id_empresa", id_empresa);
  if (e3) throw new Error(e3.message);

  const { data: valoraciones, error: e4 } = await supabase
    .schema("tebuscan")
    .from("valoracion")
    .select(
      `
            calificacion,
            comentario,
            fecha_valoracion,
            puesto,
            candidato (
                nombre_candidato,
                apellido_candidato
            )
        `,
    )
    .eq("id_empresa", id_empresa)
    .order("fecha_valoracion", { ascending: false });
  if (e4) throw new Error(e4.message);

  const promedio =
    valoraciones && valoraciones.length > 0
      ? (
          valoraciones.reduce((acc, v) => acc + v.calificacion, 0) /
          valoraciones.length
        ).toFixed(1)
      : 0;

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
  const aplicacionesPorMes = [];
  const labelsMeses = [];

  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const mes = fecha.getMonth();
    const anio = fecha.getFullYear();
    labelsMeses.push(meses[mes]);

    const count = aplicaciones
      ? aplicaciones.filter((a) => {
          const f = new Date(a.fecha_aplicacion);
          return f.getMonth() === mes && f.getFullYear() === anio;
        }).length
      : 0;

    aplicacionesPorMes.push(count);
  }

  return {
    empleosActivos: empleos?.length || 0,
    totalAplicaciones: aplicaciones?.length || 0,
    visitasPerfil: visitas?.length || 0,
    valoracionPromedio: promedio,
    totalValoraciones: valoraciones?.length || 0,
    valoracionesRecientes: valoraciones?.slice(0, 3) || [],
    grafico: {
      labels: labelsMeses,
      data: aplicacionesPorMes,
    },
  };
};

export const getForosConRespuestas = async () => {
  const { data, error } = await supabase
    .schema("tebuscan")
    .from("foro")
    .select(
      `
            id_foro,
            titulo_foro,
            descripcion_foro,
            fecha_foro,
            visualizaciones_foro,
            estado_foro,
            categoria (
                id_categoria,
                nombre_categoria,
                tipo
            ),
            usuario (
                correo_usuario
            ),
            foro_respuesta (
                id_respuesta,
                contenido,
                fecha_respuesta,
                usuario (
                    correo_usuario
                )
            )
        `,
    )
    .eq("estado_foro", "activo")
    .order("fecha_foro", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const getEstadisticasForo = async () => {
  const { data: foros, error: e1 } = await supabase
    .schema("tebuscan")
    .from("foro")
    .select("id_foro", { count: "exact" });
  if (e1) throw new Error(e1.message);

  const { data: usuarios, error: e2 } = await supabase
    .schema("tebuscan")
    .from("usuario")
    .select("id_usuario", { count: "exact" })
    .eq("activo", true);
  if (e2) throw new Error(e2.message);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const { data: forosHoy, error: e3 } = await supabase
    .schema("tebuscan")
    .from("foro")
    .select("id_foro", { count: "exact" })
    .gte("fecha_foro", hoy.toISOString());
  if (e3) throw new Error(e3.message);

  return {
    totalPublicaciones: foros?.length || 0,
    miembrosActivos: usuarios?.length || 0,
    hoy: forosHoy?.length || 0,
  };
};

export const crearForo = async (datos) => {
  const { data, error } = await supabase
    .schema("tebuscan")
    .from("foro")
    .insert([datos])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const crearRespuestaForo = async (datos) => {
  const { data, error } = await supabase
    .schema("tebuscan")
    .from("foro_respuesta")
    .insert([datos])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getForosPorCategoria = async (id_categoria) => {
  const query = supabase
    .schema("tebuscan")
    .from("foro")
    .select(
      `
            id_foro,
            titulo_foro,
            descripcion_foro,
            fecha_foro,
            visualizaciones_foro,
            estado_foro,
            categoria (
                id_categoria,
                nombre_categoria
            ),
            usuario (
                correo_usuario
            ),
            foro_respuesta (
                id_respuesta,
                contenido,
                fecha_respuesta,
                usuario (
                    correo_usuario
                )
            )
        `,
    )
    .eq("estado_foro", "activo")
    .order("fecha_foro", { ascending: false });

  if (id_categoria) query.eq("id_categoria", id_categoria);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};
export const incrementarVistas = async (id_foro) => {
  const { data: foro } = await supabase
    .schema("tebuscan")
    .from("foro")
    .select("visualizaciones_foro")
    .eq("id_foro", id_foro)
    .single();

  const { error } = await supabase
    .schema("tebuscan")
    .from("foro")
    .update({ visualizaciones_foro: (foro?.visualizaciones_foro || 0) + 1 })
    .eq("id_foro", id_foro);

  if (error) throw new Error(error.message);
};

export const notificarCandidatosPorAlertas = async (empleo) => {
  const { data: alertas, error } = await supabase
    .schema("tebuscan")
    .from("alerta")
    .select("*");

  if (error || !alertas) return;

  const notificaciones = [];

  for (const alerta of alertas) {
    let coincide = false;

    if (alerta.palabra_clave) {
      const palabraLower = alerta.palabra_clave.toLowerCase();
      const tituloLower = (empleo.titulo_empleo || "").toLowerCase();
      const descLower = (empleo.descripcion_empleo || "").toLowerCase();
      if (
        tituloLower.includes(palabraLower) ||
        descLower.includes(palabraLower)
      ) {
        coincide = true;
      }
    }

    if (!coincide) continue;

    if (alerta.ubicacion) {
      const ubicAlerta = alerta.ubicacion.toLowerCase();
      const ubicEmpleo = (empleo.ubicacion_empleo || "").toLowerCase();
      if (!ubicEmpleo.includes(ubicAlerta) && !ubicAlerta.includes(ubicEmpleo))
        continue;
    }

    if (alerta.tipo_empleo) {
      if (alerta.tipo_empleo !== empleo.tipo_empleo) continue;
    }

    if (alerta.salario_minimo && empleo.salario_min_empleo) {
      if (
        parseFloat(empleo.salario_min_empleo) <
        parseFloat(alerta.salario_minimo)
      )
        continue;
    }

    notificaciones.push({
      id_candidato: alerta.id_candidato,
      titulo: "¡Nueva vacante que coincide con tu alerta!",
      descripcion: `Se publicó: ${empleo.titulo_empleo} en ${empleo.ubicacion_empleo || "Sin ubicación"} - ${empleo.tipo_empleo || ""} ${empleo.salario_empleo ? "- $" + empleo.salario_empleo : ""}`,
      tipo: "alerta",
      leida: false,
      fecha_notificacion: new Date(
        Date.now() - 6 * 60 * 60 * 1000,
      ).toISOString(),
      id_empleo: empleo.id_empleo,
    });
  }

  if (notificaciones.length > 0) {
    const { error: errNotif } = await supabase
      .schema("tebuscan")
      .from("notificacion")
      .insert(notificaciones);

    if (errNotif)
      console.error("Error insertando notificaciones:", errNotif.message);
    else console.log(`${notificaciones.length} notificación(es) generada(s)`);
  }
};