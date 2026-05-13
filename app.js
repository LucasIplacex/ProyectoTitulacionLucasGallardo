import { client } from "./supabase.js";

export async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const estado = document.getElementById("estado");

  if (!email || !password) {
    estado.textContent = "Completa los campos";
    return;
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error(error);
    estado.textContent = "Error al iniciar sesión ❌";
    return;
  }

  const userId = data.user.id;

  let rol = null;


  const { data: operador } = await client
    .from("Operador")
    .select("*")
    .eq("auth_id", userId)
    .single();

  if (operador) rol = "operador";

  const { data: jefe } = await client
    .from("Jefe_Mantención")
    .select("*")
    .eq("auth_id", userId)
    .single();

  if (jefe) rol = "jefe";

  const { data: tecnico } = await client
    .from("Tecnico")
    .select("*")
    .eq("auth_id", userId)
    .single();

  if (tecnico) rol = "tecnico";

  const { data: externo } = await client
    .from("Personal_Externo")
    .select("*")
    .eq("auth_id", userId)
    .single();

  if (externo) rol = "externo";

  localStorage.setItem("rol", rol);
  

  if (rol === "operador") {
    window.location.href = "operador.html";
  }
  else if (rol === "jefe") {
    window.location.href = "jefe.html";
  }
  else if (rol === "tecnico") {
    window.location.href = "tecnico.html";
  }
  else if (rol === "externo") {
    window.location.href = "externo.html";
  }
  else {
    estado.textContent = "No se encontró el rol ❌";
  }
}

//--------------------------------------------------------------------
export async function registrarse() {
  const rol = document.getElementById("rol").value;
  const nombre = document.getElementById("nombre").value;
  const rut = document.getElementById("rut").value;
  const local = document.getElementById("local").value;

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const estado = document.getElementById("estado");

  if (!rol || !nombre || !rut || !email || !password) {
    estado.textContent = "Completa todos los campos";
    return;
  }

  const { data, error } = await client.auth.signUp({
    email,
    password
  });

  if (error) {
    console.error(error);
    estado.textContent = "Error al registrar usuario ❌";
    return;
  }

  const userId = data.user.id;

  let insertError = null;

  if (rol === "operador") {
    ({ error: insertError } = await client.from("Operador").insert([
      { nombre, rut, local, email, auth_id: userId }
    ]));
  }

  else if (rol === "jefe") {
    ({ error: insertError } = await client.from("Jefe_Mantención").insert([
      { nombre, rut, local, email, auth_id: userId }
    ]));
  }

  else if (rol === "tecnico") {
    ({ error: insertError } = await client.from("Tecnico").insert([
      { nombre, rut, local, email, auth_id: userId }
    ]));
  }

  else if (rol === "externo") {
    ({ error: insertError } = await client.from("Personal_Externo").insert([
      { nombre, rut, email, auth_id: userId }
    ]));
  }

  if (insertError) {
    console.error(insertError);
    estado.textContent = "Usuario creado, pero error en datos ❌";
  } else {
    estado.textContent = "";

    setTimeout(() => {
      location.href = "index.html";
    }, 1200);
  }
}

//--------------------------------------------------------------------

export async function logout() {
  alert("Sesión cerrada");
  await client.auth.signOut();


  location.href = "index.html";
}


//-----------Loggin y Registro --------------------------------------
//-----------Loggin y Registro --------------------------------------














//-----------Jefe de mantencion--------------------------------------
//-----------Jefe de mantencion--------------------------------------
async function renderMaquinas(data) {
  const tbody = document.getElementById("resultadoMaquinas");
  tbody.innerHTML = "";

  data.forEach(m => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${m.ID_MAQUINA}</td>

      <td>
        <input id="nombre-${m.ID_MAQUINA}" value="${m.nombre}" disabled>
      </td>

      <td>
        <input id="local-${m.ID_MAQUINA}" value="${m.local}" disabled>
      </td>

      <td>
        ${m.descontinuada ? "Descontinuada" : "Activa"}
      </td>

      <td class="acciones">

        <button id="btnEditar-${m.ID_MAQUINA}"
          onclick="habilitarMaquina(${m.ID_MAQUINA})">
          Editar
        </button>

        <button id="btnGuardar-${m.ID_MAQUINA}"
          onclick="guardarMaquina(${m.ID_MAQUINA})"
          style="display:none;">
          Guardar
        </button>

        <button id="btnEliminar-${m.ID_MAQUINA}"
          onclick="eliminarMaquina(${m.ID_MAQUINA})">
          Eliminar
        </button>

        <button id="btnEstado-${m.ID_MAQUINA}"
          onclick="${m.descontinuada 
            ? `reactivarMaquina(${m.ID_MAQUINA})` 
            : `descontinuarMaquina(${m.ID_MAQUINA})`}">
          ${m.descontinuada ? "Reactivar" : "Descontinuar"}
        </button>

      </td>
    `;

    tbody.appendChild(row);
  });
}

//--------------------------------------------------------------------
export async function buscarMaquinas() {

  const filtroLocal = document.getElementById("filtroLocalMaquina").value.trim();
  const filtroNombre = document.getElementById("filtroNombreMaquina").value.trim();
  const filtroEstado = document.getElementById("filtroEstado").value;

  const tbody = document.getElementById("resultadoMaquinas");
  const mensaje = document.getElementById("mensajeMaquinas");
  const tabla = document.getElementById("tablaMaquinas");

  let query = client
    .from("Maquina")
    .select("*");

  if (filtroLocal) {
    query = query.ilike("local", `%${filtroLocal}%`);
  }

  if (filtroNombre) {
    query = query.ilike("nombre", `%${filtroNombre}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    alert("Error al buscar máquinas");
    return;
  }

  let resultados = data;

  if (filtroEstado === "activas") {
    resultados = resultados.filter(m => m.descontinuada === false);
  }

  if (filtroEstado === "descontinuadas") {
    resultados = resultados.filter(m => m.descontinuada === true);
  }

  if (!resultados || resultados.length === 0) {
    tbody.innerHTML = "";
    tabla.style.display = "none";

    mensaje.style.display = "block";
    mensaje.textContent = "Sin Resultados";

    return;
  }

  mensaje.style.display = "none";
  tabla.style.display = "table";

  renderMaquinas(resultados);
}


//--------------------------------------------------------------------
export async function agregarMaquina() {
  const nombreInput = document.getElementById("nombreMaquina");
  const localInput = document.getElementById("localMaquina");

  const nombre = nombreInput.value;
  const local = localInput.value;

  if (!nombre || !local) {
    alert("Completa los campos");
    return;
  }

  const { error } = await client
    .from("Maquina")
    .insert([{ nombre, local }]);

  if (error) {
    console.error(error);
    alert("Error al agregar");
    return;
  }

  nombreInput.value = "";
  localInput.value = "";

  cargarMaquinas();
}

//--------------------------------------------------------------------
export async function eliminarMaquina(id) {
  const { error } = await client
    .from("Maquina")
    .delete()
    .eq("ID_MAQUINA", id);

  if (error) {
    console.error(error);
    alert("Error al eliminar");
    return;
  }

  cargarMaquinas();
}
//--------------------------------------------------------------------
export async function cargarMaquinas() {
  const { data, error } = await client
    .from("Maquina")
    .select("*");

  if (error) {
    console.error(error);
    return;
  }

  renderMaquinas(data);
}


window.habilitarMaquina = (id) => {

  const inputNombre = document.getElementById(`nombre-${id}`);
  const inputLocal = document.getElementById(`local-${id}`);

  inputNombre.disabled = false;
  inputLocal.disabled = false;

  document.getElementById(`btnEditar-${id}`).style.display = "none";
  document.getElementById(`btnGuardar-${id}`).style.display = "inline";

  const btnEliminar = document.getElementById(`btnEliminar-${id}`);
  btnEliminar.textContent = "Cancelar";
  btnEliminar.onclick = () => cancelarEdicion(id);
};

//--------------------------------------------------------------------
window.cancelarEdicion = (id) => {

  const inputNombre = document.getElementById(`nombre-${id}`);
  const inputLocal = document.getElementById(`local-${id}`);

  inputNombre.disabled = true;
  inputLocal.disabled = true;

  cargarMaquinas();

};


//--------------------------------------------------------------------
window.guardarMaquina = async (id) => {
  const nombre = document.getElementById(`nombre-${id}`).value;
  const local = document.getElementById(`local-${id}`).value;

  const { error } = await client
    .from("Maquina")
    .update({ nombre, local })
    .eq("ID_MAQUINA", id);

  if (error) {
    console.error(error);
    alert("Error al editar");
    return;
  }

  cargarMaquinas();
};

//--------------------------------------------------------------------
export async function editarMaquina(id) {
  const nombre = document.getElementById(`nombre-${id}`).value;
  const local = document.getElementById(`local-${id}`).value;

  const { error } = await client
    .from("Maquina")
    .update({ nombre, local })
    .eq("ID_MAQUINA", id);

  if (error) {
    console.error(error);
    alert("Error al editar");
    return;
  }

  cargarMaquinas();
}

//--------------------------------------------------------------------
export async function descontinuarMaquina(id) {
  const confirmar = confirm("¿Seguro que quieres descontinuar esta máquina?");
  if (!confirmar) return;

  const { error } = await client
    .from("Maquina")
    .update({ descontinuada: true })
    .eq("ID_MAQUINA", id);

  if (error) {
    console.error(error);
    alert("Error al descontinuar");
    return;
  }

  cargarMaquinas();
}

//--------------------------------------------------------------------
export async function reactivarMaquina(id) {
  const confirmar = confirm("¿Seguro que quieres reactivar esta máquina?");
  if (!confirmar) return;

  const { error } = await client
    .from("Maquina")
    .update({ descontinuada: false })
    .eq("ID_MAQUINA", id);

  if (error) {
    console.error(error);
    alert("Error al reactivar");
    return;
  }

  cargarMaquinas();
}
//--------------------------------------------------------------------

export async function cargarInspeccionesJefe() {

  const tbody = document.getElementById("tablaJefeBody");
  const tabla = document.getElementById("tablaJefe");

  const filtroLocal = document.getElementById("filtroLocalJefe").value.trim();
  const filtroFecha = document.getElementById("filtroFechaJefe").value;

  if (!tbody || !tabla) return;


  let query = client
    .from("Inspeccion")
    .select(`
      temperatura,
      hora,
      fecha,
      estado,
      observaciones,
      falla,
      Maquina(nombre, local)
    `);


  if (filtroFecha) {
    query = query.eq("fecha", filtroFecha);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    alert("Error al cargar inspecciones");
    return;
  }


  let resultados = data;

  if (filtroLocal) {
    resultados = resultados.filter(i =>
      i.Maquina?.local?.toLowerCase().includes(filtroLocal.toLowerCase())
    );
  }

  const mensaje = document.getElementById("mensajeInspeccionesJefe");

  if (!resultados || resultados.length === 0) {
    tbody.innerHTML = "";
    tabla.style.display = "none";

    mensaje.style.display = "block";
    mensaje.textContent = "SIN RESULTADOS";

    return;
  }


  mensaje.style.display = "none";
  tabla.style.display = "table";


  resultados.forEach(i => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${i.Maquina?.nombre || "-"}</td>
      <td>${i.Maquina?.local || "-"}</td>
      <td>${i.temperatura}</td>
      <td>${i.hora}</td>
      <td>${i.fecha}</td>
      <td>${i.observaciones}</td>
      
      <td>${i.estado || "-"}</td>
      <td>${i.falla ? "Sí" : "No"}</td>
    `;

    tbody.appendChild(row);
  });

  tabla.style.display = "table";
}

//----------------------------------------------------------------------
export async function cargarSolicitudesMantencion() {

  const tbody = document.getElementById("tablaMantencionBody");
  if (!tbody) return;

  const { data, error } = await client
    .from("Inspeccion")
    .select(`
      ID_INSPECCION,
      hora,
      fecha,
      observaciones,
      Maquina (ID_MAQUINA, nombre, local)
    `);

  if (error) {
    console.error(error);
    return;
  }
  console.log("DATA COMPLETA:", data);
  tbody.innerHTML = "";

  data.forEach(i => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${i.Maquina?.local || ""}</td>
      <td>${i.Maquina?.nombre || ""}</td>
      <td>${i.fecha || ""}</td>
      
      <td>
        <input 
          type="text"
          class="obs-input"
          data-id="${i.ID_INSPECCION}"
          value="${i.observaciones || ""}">
      </td>

      <td>
        <input type="checkbox"
          name="seleccionMantencion"
          value="${i.ID_INSPECCION}"
          data-maquina="${i.Maquina?.ID_MAQUINA}">
      </td>
    `;

    tbody.appendChild(tr);
  });
}
//----------------------------------------------------------------------
export async function guardarSolicitudMantencion() {

  const seleccionados = document.querySelectorAll(
    'input[name="seleccionMantencion"]:checked'
  );

  if (seleccionados.length === 0) {
    alert("Selecciona al menos una inspección");
    return;
  }

  const fecha = new Date().toISOString().split("T")[0];
  const hora = new Date().toTimeString().split(" ")[0];

  const { data: userData } = await client.auth.getUser();
  const userId = userData.user.id;

  const { data: jefe } = await client
    .from("Jefe_Mantención")
    .select("ID_JEFE")
    .eq("auth_id", userId)
    .single();

  if (!jefe?.ID_JEFE) {
    alert("No se encontró jefe");
    return;
  }

  const id_jefe = Number(jefe.ID_JEFE);

  const solicitudes = [];

  seleccionados.forEach(chk => {

    const id_inspeccion = Number(chk.value);
    const id_maquina = Number(chk.dataset.maquina);

    const obsInput = document.querySelector(
      `.obs-input[data-id="${id_inspeccion}"]`
    );

    const observaciones = obsInput ? obsInput.value : null;

    solicitudes.push({
      fecha_solicitud: fecha,
      hora_solicitud: hora,
      id_inspeccion,
      id_maquina,
      id_jefe,
      observaciones
    });
  });

  const { error } = await client
    .from("Mantencion_Solicitada")
    .insert(solicitudes);

  if (error) {
    console.error(error);
    alert("Error al guardar solicitud");
    return;
  }

  alert("Solicitudes guardadas correctamente");

document.querySelectorAll("#tablaMantencionBody input[type='checkbox']")
  .forEach(cb => cb.checked = false);
}
//--------------------------------------------------------------------
export async function cargarMantencionesRealizadasJefe() {

  const tbody = document.getElementById("tablaMantencionRealizadaBody");
  const tabla = document.getElementById("tablaMantencionRealizada");

  if (!tbody || !tabla) return;

  const { data, error } = await client
    .from("Mantencion_Realizada")
    .select(`
      id_solicitud,
      fecha,
      hora,
      detalle_trabajo,
      Maquina(nombre, local),
      Mantencion_Solicitada(
        fecha_solicitud,
        observaciones,
        estado
      )
    `);

  if (error) {
    console.error(error);
    alert("Error al cargar mantenciones realizadas");
    return;
  }

  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center;">
          No hay mantenciones registradas
        </td>
      </tr>
    `;
    tabla.style.display = "table";
    return;
  }

  data.forEach(m => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${m.id_solicitud || "-"}</td>
      <td>${m.Maquina?.nombre || "-"}</td>
      <td>${m.Maquina?.local || "-"}</td>
      <td>${m.Mantencion_Solicitada?.fecha_solicitud || "-"}</td>
      <td>${m.fecha || "-"}</td>
      <td>${m.hora || "-"}</td>
      <td>${m.Mantencion_Solicitada?.observaciones || "-"}</td>
      <td>${m.detalle_trabajo || "-"}</td>
      <td>${m.Mantencion_Solicitada?.estado || "-"}</td>
    `;

    tbody.appendChild(tr);
  });

  tabla.style.display = "table";
}

export function filtrarMantencionesRealizadasJefe() {

  const filtroLocal = document
    .getElementById("filtroLocalMantReal")
    .value.toLowerCase().trim();

  const filtroMaquina = document
    .getElementById("filtroMaquinaMantReal")
    .value.toLowerCase().trim();

  const filtroFecha = document
    .getElementById("filtroFechaMantReal")
    .value.trim();

  const filas = document.querySelectorAll("#tablaMantencionRealizadaBody tr");

  const mensaje = document.getElementById("mensajeMantReal");
  const tabla = document.getElementById("tablaMantencionRealizada");

  let hayResultados = false;

  filas.forEach(fila => {

    const local = fila.children[2].textContent.toLowerCase().trim();
    const maquina = fila.children[1].textContent.toLowerCase().trim();
    const fecha = fila.children[4].textContent.trim();

    let mostrar = true;

    if (filtroLocal && !local.includes(filtroLocal)) {
      mostrar = false;
    }

    if (filtroMaquina && !maquina.includes(filtroMaquina)) {
      mostrar = false;
    }

    if (filtroFecha && fecha !== filtroFecha) {
      mostrar = false;
    }

    fila.style.display = mostrar ? "" : "none";

    if (mostrar) hayResultados = true;
  });


  if (!hayResultados) {
    tabla.style.display = "none";
    mensaje.style.display = "block";
    mensaje.textContent = "SIN RESULTADOS";
  } else {
    tabla.style.display = "table";
    mensaje.style.display = "none";
  }
}

//--------------------------------------------------------------------
export async function cargarFallasJefe() {

  const tbody = document.getElementById("tablaFallasJefeBody");
  tbody.innerHTML = "";

  const { data, error } = await client
    .from("Falla_Registrada") 
    .select(`
      descripcion,
      observacion,
      fecha,
      hora,
      Maquina (nombre, local),
      Operador (nombre)
    `);

  if (error) return console.error(error);

  data.forEach(f => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${f.Maquina?.local || ""}</td>
      <td>${f.Operador?.nombre || ""}</td>
      <td>${f.Maquina?.nombre || ""}</td>
      <td>${f.fecha}</td>
      <td>${f.hora}</td>
      <td>${f.descripcion}</td>
      <td>${f.observacion}</td>
      <td>Si</td>
    `;

    tbody.appendChild(tr);
  });

}

//--------------------------------------------------------------------
const btnFiltrarFallasJefe = document.getElementById("btnFiltrarFallasJefe");

if (btnFiltrarFallasJefe) {
  btnFiltrarFallasJefe.addEventListener("click", () => {

    const filtroLocal = document
      .getElementById("filtroLocalFallasJefe")
      .value
      .toLowerCase()
      .trim();

    const filtroFecha = document
      .getElementById("filtroFechaFallasJefe")
      .value
      .trim();

    const filas = document.querySelectorAll("#tablaFallasJefeBody tr");

    const mensaje = document.getElementById("mensajeFallasJefe");
    const tabla = document.getElementById("tablaFallasJefe");

    let hayResultados = false;

    mensaje.style.display = "none";

    filas.forEach(fila => {

      const local = fila.children[0].textContent.toLowerCase().trim();
      const fecha = fila.children[3].textContent.trim();

      let mostrar = true;

      if (filtroLocal && !local.includes(filtroLocal)) {
        mostrar = false;
      }

      if (filtroFecha && fecha !== filtroFecha) {
        mostrar = false;
      }

      fila.style.display = mostrar ? "" : "none";

      if (mostrar) hayResultados = true;
    });

    if (!hayResultados) {
      tabla.style.display = "none";
      mensaje.textContent = "SIN RESULTADOS";
      mensaje.style.display = "block";
    } else {
      tabla.style.display = "table";
    }

  });
}
//--------------------------------------------------------------------
export async function cargarMaquinasInfoDiaJefe() {

  const local = document.getElementById("infoLocalJefe").value.trim();

  if (!local) return;

  const { data, error } = await client
    .from("Maquina")
    .select("nombre")
    .ilike("local", `%${local}%`);

  if (error) return console.error(error);

  const select = document.getElementById("infoMaquinaJefe");

  select.innerHTML = `<option value="">Seleccione</option>`;

  data?.forEach(m => {
    select.innerHTML += `<option value="${m.nombre}">${m.nombre}</option>`;
  });
}
//--------------------------------------------------------------------
export async function obtenerInfoDiaJefe() {

  const local = document.getElementById("infoLocalJefe").value.trim();
  const maquina = document.getElementById("infoMaquinaJefe").value.trim();

  if (!local || !maquina) {
    return alert("Ingrese local y máquina");
  }

  const { data, error } = await client
    .from("Inspeccion")
    .select(`
      fecha,
      falla,
      Maquina!inner(
        ID_MAQUINA,
        nombre,
        local
      )
    `)
    .ilike("Maquina.local", `%${local}%`)
    .ilike("Maquina.nombre", `%${maquina}%`)
    .order("fecha", { ascending: true });

  if (error) return console.error(error);

  if (!data || data.length === 0) {
    document.getElementById("resultadoInfoDiaJefe").innerHTML = "Sin datos";
    return;
  }


  const total = data.length;
  const fallas = data.filter(i => i.falla).length;
  const correctas = total - fallas;

  const porcentajeFalla = ((fallas / total) * 100).toFixed(1);
  const porcentajeCorrecto = ((correctas / total) * 100).toFixed(1);

  const fallasFechas = data.filter(i => i.falla).map(i => i.fecha);

  let ultimaFalla = fallasFechas.length > 0
    ? fallasFechas[fallasFechas.length - 1]
    : null;

  let diasPromedio = 0;

  if (fallasFechas.length >= 2) {
    let suma = 0;

    for (let i = 1; i < fallasFechas.length; i++) {
      const f1 = new Date(fallasFechas[i - 1]);
      const f2 = new Date(fallasFechas[i]);

      suma += (f2 - f1) / (1000 * 60 * 60 * 24);
    }

    diasPromedio = Math.round(suma / (fallasFechas.length - 1));
  }

  let mensajePrediccion = "Solo fallo 1 vez o ningun dia";

  if (ultimaFalla && diasPromedio > 0) {
    const ultima = new Date(ultimaFalla);
    const hoy = new Date();

    const diasDesdeUltima = (hoy - ultima) / (1000 * 60 * 60 * 24);

    if (diasDesdeUltima >= diasPromedio) {
      mensajePrediccion = "🔴 Hoy coincide con su patron de falla, podria fallar hoy";
    } else if (diasDesdeUltima >= diasPromedio * 0.7) {
      mensajePrediccion = "🟡 Podría fallar pronto, monitorear con atencion";
    } else {
      mensajePrediccion = "🟢 Lejos de su ciclo de falla, Riesgo bajo";
    }
  }

  let prioridad = "🟢 Baja, maquina confiable con bajo historial de fallas";
  if (porcentajeFalla >= 40) prioridad = "🔴 Alta, maquina con alto historial negativo";
  else if (porcentajeFalla >= 15) prioridad = "🟡 Media, fallas ocasionales, condicion intermedia";


  const idMaquina = data[0].Maquina.ID_MAQUINA;

  let fechaMant = "Sin datos registrados";
  let detalle = "Sin datos registrados";

  const { data: mantData, error: mantError } = await client
    .from("Mantencion_Realizada")
    .select(`
      fecha,
      detalle_trabajo,
      id_maquina
    `)
    .eq("id_maquina", idMaquina)
    .order("fecha", { ascending: false })
    .limit(1);

  if (mantError) console.error(mantError);

  if (mantData && mantData.length > 0) {
    fechaMant = mantData[0].fecha;
    detalle = mantData[0].detalle_trabajo;
  }


document.getElementById("resultadoInfoDiaJefe").innerHTML = `
  <table class="tabla-info">
    <tr>
      <td>Último día de falla:</td>
      <td>${ultimaFalla || "Sin fallas registradas"}</td>
    </tr>
    <tr>
      <td>Falla normalmente cada:</td>
      <td>${diasPromedio ? diasPromedio + " días" : "Solo falló 1 vez o ningún día"}</td>
    </tr>
    <tr>
      <td>Probabilidad de que falle:</td>
      <td>${mensajePrediccion}</td>
    </tr>
    <tr>
      <td>Total de fallas:</td>
      <td>${fallas} de ${total} inspecciones</td>
    </tr>
    <tr>
      <td>Funcionamiento:</td>
      <td>${porcentajeCorrecto}% sin fallas / ${porcentajeFalla}% con fallas</td>
    </tr>
    <tr>
      <td>Prioridad:</td>
      <td>${prioridad}</td>
    </tr>
    <tr>
      <td>Fecha última mantención:</td>
      <td>${fechaMant}</td>
    </tr>
    <tr>
      <td>Mantención Realizada:</td>
      <td>${detalle}</td>
    </tr>
  </table>
`;
}

//-----------Jefe de mantencion--------------------------------------
//-----------Jefe de mantencion--------------------------------------





































//------------Operador----------------------------------
//------------Operador----------------------------------
export async function mostrarMaquinaEnInspeccion() {
  const tbody = document.getElementById("tablaInspeccionBody");

  if (!tbody) return;

  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError || !userData.user) {
    console.error("No hay usuario logueado");
    return;
  }

  const userId = userData.user.id;

  const { data: operador, error: opError } = await client
    .from("Operador")
    .select("local")
    .eq("auth_id", userId)
    .single();

  if (opError || !operador) {
    console.error("No se encontró operador");
    return;
  }

  const localOperador = operador.local;

  const { data: maquinas, error } = await client
    .from("Maquina")
    .select("*")
    .eq("local", localOperador) 
    .eq("descontinuada", false);
    

  tbody.innerHTML = "";

  if (error) {
    console.error(error);
    tbody.innerHTML = "<tr><td colspan='4'>Error al cargar</td></tr>";
    return;
  }

  if (!maquinas || maquinas.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4'>No hay máquinas en tu local</td></tr>";
    return;
  }

  maquinas.forEach(m => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td data-id="${m.ID_MAQUINA}">${m.nombre}</td>
      <td><input type="number"></td>
      <td><input type="time"></td>
      <td><input type="date"></td>
      <td>
        <input type="text" placeholder="Estado">
      </td>
      <td>
        <input type="text" placeholder="Observaciones">
      </td>
      <td>
        <input type="checkbox">
      </td>
    `;

    tbody.appendChild(row);
  });
}

//--------------------------------------------------------------------
export async function guardarTodo() {

  const { data: userData } = await client.auth.getUser();
  if (!userData.user) return;

  const userId = userData.user.id;

  const { data: operador } = await client
    .from("Operador")
    .select("ID_OPERADOR")
    .eq("auth_id", userId)
    .single();

  if (!operador) return;

  const filas = document.querySelectorAll("#tablaInspeccionBody tr");

  const datos = [];

  filas.forEach(fila => {

    const inputs = fila.querySelectorAll("input, select");

    const temperatura = inputs[0].value;
    const hora = inputs[1].value;
    const fecha = inputs[2].value;
    const estado = inputs[3].value;
    const observaciones = inputs[4].value;
    const falla = inputs[5].checked;

    const idMaquina = fila.children[0].dataset.id; 

    if (temperatura && hora && fecha) {
      datos.push({
        temperatura: parseInt(temperatura),
        hora,
        fecha,
        estado,
        observaciones,
        falla,
        id_maquina: idMaquina,
        id_operador: operador.ID_OPERADOR
      });
    }

  });

  if (datos.length === 0) {
    alert("No hay datos para guardar");
    return;
  }

  const { error } = await client
    .from("Inspeccion")
    .insert(datos);

  if (error) {
    console.error(error);
    alert("Error al guardar");
  } else {
  alert("Inspecciones guardadas correctamente");


  filas.forEach(fila => {
    const inputs = fila.querySelectorAll("input");

    inputs.forEach(input => {
      if (input.type === "checkbox") {
        input.checked = false; 
      } else {
        input.value = ""; 
      }
    });
  });
}
  
}
//--------------------------------------------------------------------
export async function buscarInspecciones() {

  const local = document.getElementById("filtroLocal").value;
  const fecha = document.getElementById("filtroFecha").value;

  const tbody = document.getElementById("tablaVisualizarBody");
  const tabla = document.getElementById("tablaVisualizar");
    const mensaje = document.getElementById("mensajeBusqueda");

  tbody.innerHTML = "";

  mensaje.style.display = "none";
  mensaje.textContent = "";

  tbody.innerHTML = "";


  let query = client
    .from("Inspeccion") 
    .select(`
      ID_INSPECCION,  
      temperatura,
      hora,
      fecha,
      estado,
      observaciones,
      falla,
      Maquina (nombre, local)
    `);


  if (fecha) {
    query = query.eq("fecha", fecha);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    alert("Error al buscar inspecciones");
    return;
  }


  let resultados = data;

  if (local) {
    resultados = data.filter(i =>
      i.Maquina?.local?.toLowerCase().includes(local.toLowerCase())
    );
  }

  if (resultados.length > 0) {
    tabla.style.display = "table";
  } else {
    tabla.style.display = "none";
    mensaje.textContent = "No se encontraron inspecciones con esos filtros";
    mensaje.style.display = "block";
    return;
  }


resultados.forEach(i => {

  const row = document.createElement("tr");


  let fecha = i.fecha || "";
  if (fecha.includes("T")) fecha = fecha.split("T")[0];

  let hora = i.hora || "";
  if (hora.length > 5) hora = hora.substring(0, 5);

  row.innerHTML = `
    <td>${i.Maquina?.nombre || "-"}</td>

    <td class="temp">${i.temperatura || "-"}</td>
    <td class="hora">${hora || "-"}</td>
    <td class="fecha">${fecha || "-"}</td>
    <td class="estado">${i.estado || "-"}</td>
    <td class="obs">${i.observaciones || "-"}</td>
    <td class="falla">${i.falla ? "Sí" : "No"}</td>

    <td>
      <button class="btn-editar" onclick="editarInspeccion(this, ${i.ID_INSPECCION})">Editar</button>
      <button class="btn-borrar" onclick="eliminarInspeccion(${i.ID_INSPECCION})">Borrar</button>
    </td>
  `;

  tbody.appendChild(row);
});

}
//--------------------------------------------------------------------
export function editarInspeccion(btn, id) {

  const fila = btn.closest("tr");

  const temp = fila.querySelector(".temp").textContent;
  const hora = fila.querySelector(".hora").textContent;
  const fecha = fila.querySelector(".fecha").textContent;
  const estado = fila.querySelector(".estado").textContent;
  const obs = fila.querySelector(".obs").textContent;
  const falla = fila.querySelector(".falla").textContent === "Sí";

  fila.querySelector(".temp").innerHTML =
    `<input type="number" value="${temp}">`;

  fila.querySelector(".hora").innerHTML =
    `<input type="time" value="${hora}">`;

  fila.querySelector(".fecha").innerHTML =
    `<input type="date" value="${fecha}">`;

  fila.querySelector(".estado").innerHTML =
    `<input type="text" value="${estado}">`;

  fila.querySelector(".obs").innerHTML =
    `<input type="text" value="${obs}">`;

  fila.querySelector(".falla").innerHTML = `
    <select>
      <option value="true" ${falla ? "selected" : ""}>Sí</option>
      <option value="false" ${!falla ? "selected" : ""}>No</option>
    </select>
  `;

  const acciones = btn.parentElement;

  acciones.innerHTML = `
    <button class="btn-guardar" onclick="guardarEdicionInspeccion(this, ${id})">Guardar</button>
    <button class="btn-cancelar" onclick="cancelarEdicionInspeccion()">Cancelar</button>
  `;
}
//--------------------------------------------------------------------
export async function guardarEdicionInspeccion(btn, id) {

  const fila = btn.closest("tr");

  const temperatura = fila.querySelector(".temp input").value;
  const hora = fila.querySelector(".hora input").value;
  const fecha = fila.querySelector(".fecha input").value;
  const estado = fila.querySelector(".estado input").value;
  const observaciones = fila.querySelector(".obs input").value;
  const falla = fila.querySelector(".falla select").value === "true";

  const { error } = await client
    .from("Inspeccion")
    .update({
      temperatura,
      hora,
      fecha,
      estado,
      observaciones,
      falla
    })
    .eq("ID_INSPECCION", id);

  if (error) {
    console.error(error);
    alert("Error al actualizar");
    return;
  }

  alert("Actualizado correctamente");
  await buscarInspecciones();
}
//--------------------------------------------------------------------
export function cancelarEdicionInspeccion() {
  buscarInspecciones();
}

//--------------------------------------------------------------------
export async function eliminarInspeccion(id) {

  const ok = confirm("¿Eliminar inspección?");
  if (!ok) return;

  const { error } = await client
    .from("Inspeccion")
    .delete()
    .eq("ID_INSPECCION", id);

  if (error) {
    console.error(error);
    alert("Error al eliminar");
    return;
  }

  alert("Eliminado correctamente");
  await buscarInspecciones();
}

//--------------------------------------------------------------------
export async function obtenerInfoDia() {

  const local = document.getElementById("infoLocal").value.trim();
  const maquina = document.getElementById("infoMaquina").value.trim();

  console.log("🔹 INPUT LOCAL:", local);
  console.log("🔹 INPUT MAQUINA:", maquina);

  if (!local || !maquina) {
    return alert("Ingrese local y máquina");
  }
    console.log("🚀 Ejecutando query...");

  const { data, error } = await client
    .from("Inspeccion")
    .select(`
      fecha,
      falla,
    Maquina!inner(
      ID_MAQUINA,
      nombre,
      local
    )
  `)
  .ilike("Maquina.local", local)
  .ilike("Maquina.nombre", maquina)
  .order("fecha", { ascending: true });

  if (error) return console.error(error);

  if (data.length === 0) {
    document.getElementById("resultadoInfoDia").innerHTML = "Sin datos";
    return;
  }

  const total = data.length;
  const fallas = data.filter(i => i.falla).length;
  const correctas = total - fallas;

  const porcentajeFalla = ((fallas / total) * 100).toFixed(1);
  const porcentajeCorrecto = ((correctas / total) * 100).toFixed(1);


  const fallasFechas = data.filter(i => i.falla).map(i => i.fecha);

  let ultimaFalla = null;
  if (fallasFechas.length > 0) {
    ultimaFalla = fallasFechas[fallasFechas.length - 1];
  }


  let diasPromedio = 0;

  if (fallasFechas.length >= 2) {

    let suma = 0;

    for (let i = 1; i < fallasFechas.length; i++) {
      const f1 = new Date(fallasFechas[i - 1]);
      const f2 = new Date(fallasFechas[i]);

      const diff = (f2 - f1) / (1000 * 60 * 60 * 24);
      suma += diff;
    }

    diasPromedio = (suma / (fallasFechas.length - 1)).toFixed(0);
  }

  let mensajePrediccion = "Solo fallo 1 vez o ningun día";

  if (ultimaFalla && diasPromedio > 0) {

    const ultima = new Date(ultimaFalla);
    const hoy = new Date();

    const diasDesdeUltima = (hoy - ultima) / (1000 * 60 * 60 * 24);

    if (diasDesdeUltima >= diasPromedio) {
      mensajePrediccion = "🔴 Hoy coincide con su patrón de falla, podría fallar hoy";
    } else if (diasDesdeUltima >= diasPromedio * 0.7) {
      mensajePrediccion = "🟡 Podría fallar pronto, monitorear con atención ";
    } else {
      mensajePrediccion = "🟢 Lejos de su ciclo de falla, riesgo bajo";
    }
  }

  let prioridad = "";
  let consejo = "";

  if (porcentajeFalla >= 40) {
    prioridad = "🔴 Alta, Máquina con alto historial negativo";
    consejo = "Ser más dedicado con la inspección";
  } else if (porcentajeFalla >= 15) {
    prioridad = "🟡 Media, Fallas ocasionales, condición intermedia";
    consejo = "Inspeccionar con cuidado";
  } else {
    prioridad = "🟢 Baja, Máquina confiable con bajo historial de fallas";
    consejo = "Inspección normal";
  }


  document.getElementById("resultadoInfoDia").innerHTML = `
  <table class="tabla-info">
    <tr>
      <td>Último día de falla:</td>
      <td>${ultimaFalla || "Sin fallas registradas"}</td>
    </tr>
    <tr>
      <td>Falla normalmente cada:</td>
      <td>${diasPromedio ? diasPromedio + " días" : "Solo falló 1 vez o ningún día"}</td>
    </tr>
    <tr>
      <td>Probabilidad de que falle:</td>
      <td>${mensajePrediccion}</td>
    </tr>
    <tr>
      <td>Total de fallas:</td>
      <td>${fallas} de ${total} inspecciones</td>
    </tr>
    <tr>
      <td>Funcionamiento:</td>
      <td>${porcentajeCorrecto}% sin fallas / ${porcentajeFalla}% con fallas</td>
    </tr>
    <tr>
      <td>Prioridad:</td>
      <td>${prioridad}</td>
    </tr>
    <tr>
      <td>Consejo del día:</td>
      <td>${consejo}</td>
    </tr>
  </table>
`;
}
//--------------------------------------------------------------------
export async function cargarMaquinasInfoDia() {

  const local = document.getElementById("infoLocal").value.trim();

  if (!local) return;

  const { data, error } = await client
    .from("Maquina")
    .select("nombre")
    .ilike("local", `%${local}%`);

  if (error) return console.error(error);

  const select = document.getElementById("infoMaquina");

  select.innerHTML = `<option value="">Seleccione</option>`;

  data.forEach(m => {
    select.innerHTML += `<option value="${m.nombre}">${m.nombre}</option>`;
  });

}

//-------------------OPERADOR-----------------------------------------
//-------------------OPERADOR-----------------------------------------


































//---------------------EXTERNO-----------------------------------------
//---------------------EXTERNO-----------------------------------------
export async function cargarLocalesDatalist() {

  const datalist = document.getElementById("listaLocales");
  if (!datalist) return;

  const { data } = await client
    .from("Local")
    .select("nombre");

  datalist.innerHTML = "";

  data.forEach(l => {
    const option = document.createElement("option");
    option.value = l.nombre;
    datalist.appendChild(option);
  });
}


//----------------------------------------------------------------------
export async function cargarMaquinasPorLocalNombre() {

  const inputLocal = document.getElementById("inputLocal");
  const selectMaquina = document.getElementById("selectMaquina");
  const selectOperador = document.getElementById("selectOperador");

  if (!inputLocal) return;

  const textoLocal = inputLocal.value.trim();
  if (!textoLocal) return;


  const { data: maquinas, error: errM } = await client
    .from("Maquina")
    .select("ID_MAQUINA, nombre, local")
    .ilike("local", `%${textoLocal}%`);

  if (errM) {
    console.error("Error máquinas:", errM.message);
    return;
  }

  if (selectMaquina) {
    selectMaquina.innerHTML = `<option value="">Selecciona máquina</option>`;

    maquinas?.forEach(m => {
      const option = document.createElement("option");
      option.value = m.ID_MAQUINA;
      option.textContent = `${m.nombre}`;
      selectMaquina.appendChild(option);
    });
  }


  const { data: operadores, error: errO } = await client
    .from("Operador")
    .select("ID_OPERADOR, nombre, local")
    .ilike("local", `%${textoLocal}%`);

  if (errO) {
    console.error("Error operadores:", errO.message);
    return;
  }

  if (selectOperador) {
    selectOperador.innerHTML = `<option value="">Selecciona operador</option>`;

    operadores?.forEach(o => {
      const option = document.createElement("option");
      option.value = o.ID_OPERADOR;
      option.textContent = `${o.nombre}`;
      selectOperador.appendChild(option);
    });
  }
}
//----------------------------------------------------------------------
export async function guardarFalla() {

  const operador = Number(document.getElementById("selectOperador").value);
  const maquina = Number(document.getElementById("selectMaquina").value);

  if (!operador || !maquina) {
    alert("Debes seleccionar operador y máquina");
    return;
  }


  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError || !userData?.user) {
    console.error(userError);
    alert("No hay sesión activa");
    return;
  }

  const userId = userData.user.id;

  const { data: externo, error: externoError } = await client
    .from("Personal_Externo")
    .select("ID_EXTERNO")
    .eq("auth_id", userId)
    .single();

  if (externoError || !externo) {
    console.error(externoError);
    alert("No se encontró el usuario externo");
    return;
  }

  const id_externo = externo.ID_EXTERNO;


  const local = document.getElementById("inputLocal").value;
  const fecha = document.getElementById("fechaFalla").value;
  const hora = document.getElementById("horaFalla").value;
  const descripcion = document.getElementById("descripcionFalla").value;
  const observacion = document.getElementById("Observacion").value;
  const falla = document.getElementById("Falla").checked;


  const { error } = await client
    .from("Falla_Registrada")
    .insert([{
      local,
      id_operador: operador,
      id_maquina: maquina,
      id_externo: id_externo,
      fecha,
      hora,
      descripcion,
      observacion,
      falla
    }]);

  if (error) {
    console.error("Error al guardar falla:", error.message);
    return;
  }

  alert("Falla guardada correctamente");
}
//----------------------------------------------------------------------
export async function cargarFallas() {

  const tbody = document.getElementById("tablaFallasBody");
  const panel = document.getElementById("panelFallas");

  if (!tbody || !panel) return;

  const { data, error } = await client
    .from("Falla_Registrada")
    .select(`
      ID_FALLA_REGISTRADA,
      local,
      fecha,
      hora,
      descripcion,
      observacion,
      falla,
      Operador(nombre),
      Maquina(nombre)
    `);

  if (error) {
    console.error(error);
    alert("Error al cargar fallas");
    return;
  }

  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;">
          No hay fallas registradas
        </td>
      </tr>
    `;
    return;
  }

data.forEach(f => {

  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${f.local || "-"}</td>
    <td>${f.Operador?.nombre || "-"}</td>
    <td>${f.Maquina?.nombre || "-"}</td>

    <td class="fecha">${f.fecha || "-"}</td>
    <td class="hora">${f.hora || "-"}</td>
    <td class="desc">${f.descripcion || "-"}</td>
    <td class="obs">${f.observacion || "-"}</td>
    <td class="falla">${f.falla ? "Sí" : "No"}</td>

    <td>
      <div class="acciones">
        <button class="btn-editar" onclick="editarFallaExterno(this, ${f.ID_FALLA_REGISTRADA})">Editar</button>
        <button class="btn-borrar" onclick="eliminarFalla(${f.ID_FALLA_REGISTRADA})">Borrar</button>
      </div>
    </td>
  `;

  tbody.appendChild(row);
});

}
//---------------------------------------------------------------------
export function editarFallaExterno(btn, id) {

  const fila = btn.closest("tr");

  let fecha = fila.querySelector(".fecha").textContent.trim();
  let hora = fila.querySelector(".hora").textContent.trim();


  if (fecha.includes("/")) {
    const [d, m, a] = fecha.split("/");
    fecha = `${a}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  if (hora.length > 5) {
    hora = hora.substring(0, 5); 
  }

  const desc = fila.querySelector(".desc").textContent;
  const obs = fila.querySelector(".obs").textContent;
  const falla = fila.querySelector(".falla").textContent === "Sí";

  fila.querySelector(".fecha").innerHTML =
    `<input type="date" value="${fecha}">`;

  fila.querySelector(".hora").innerHTML =
    `<input type="time" value="${hora}">`;

  fila.querySelector(".desc").innerHTML =
    `<input type="text" value="${desc}">`;

  fila.querySelector(".obs").innerHTML =
    `<input type="text" value="${obs}">`;

  fila.querySelector(".falla").innerHTML = `
    <select>
      <option value="true" ${falla ? "selected" : ""}>Sí</option>
      <option value="false" ${!falla ? "selected" : ""}>No</option>
    </select>
  `;

  const acciones = btn.parentElement;

  acciones.innerHTML = `
    <div class="acciones">
      <button class="btn-guardar" onclick="guardarEdicionFalla(this, ${id})">Guardar</button>
      <button class="btn-cancelar" onclick="cancelarEdicionFalla()">Cancelar</button>
    </div>
  `;
}
//---------------------------------------------------------------------
export async function guardarEdicionFalla(btn, id) {

  const fila = btn.closest("tr");

  const nuevaFecha = fila.querySelector(".fecha input").value;
  const nuevaHora = fila.querySelector(".hora input").value;
  const nuevaDesc = fila.querySelector(".desc input").value;
  const nuevaObs = fila.querySelector(".obs input").value;
  const nuevaFalla = fila.querySelector(".falla select").value === "true";

  const { error } = await client
    .from("Falla_Registrada")
    .update({
      fecha: nuevaFecha,
      hora: nuevaHora,
      descripcion: nuevaDesc,
      observacion: nuevaObs,
      falla: nuevaFalla
    })
    .eq("ID_FALLA_REGISTRADA", id); 

  if (error) {
    console.error(error);
    alert("Error al actualizar");
    return;
  }

  alert("Actualizado correctamente");
  await cargarFallas();
}
//---------------------------------------------------------------------
export function cancelarEdicionFalla() {
  cargarFallas();
}

//----------------------------------------------------------------------
export function editarFallaInline(btn, id) {

  const fila = btn.closest("tr");

  const tdDesc = fila.querySelector(".desc");
  const tdObs = fila.querySelector(".obs");

  const descActual = tdDesc.textContent;
  const obsActual = tdObs.textContent;


  tdDesc.innerHTML = `<input type="text" value="${descActual}" id="editDesc">`;
  tdObs.innerHTML = `<input type="text" value="${obsActual}" id="editObs">`;


  const tdAcciones = btn.parentElement;

  tdAcciones.innerHTML = `
    <button onclick="guardarEdicionFalla(this, ${id})">💾</button>
    <button onclick="cancelarEdicionFalla()">❌</button>
  `;
}
//---------------------------------------------------------------------
export async function eliminarFalla(id) {

  const ok = confirm("¿Eliminar esta falla?");
  if (!ok) return;

  const { error } = await client
    .from("Falla_Registrada")
    .delete()
    .eq("ID_FALLA_REGISTRADA", id); 

  if (error) {
    console.error(error);
    alert("Error al eliminar");
    return;
  }

  alert("Eliminado correctamente");
  await cargarFallas();
}
//----------------------------------------------------------------------
export async function cargarInspeccionesExterno() {

  const tbody = document.getElementById("tablaVisualizarBody");
  const tabla = document.getElementById("tablaVisualizar");
  const mensaje = document.getElementById("mensajeBusquedaExterno");

  const filtroLocal = document.getElementById("filtroLocal").value.trim();
  const filtroFecha = document.getElementById("filtroFecha").value;

  if (!tbody || !tabla) return;

  let query = client
    .from("Inspeccion")
    .select(`
      temperatura,
      hora,
      fecha,
      estado,
      observaciones,
      falla,
      Maquina(nombre, local)
    `);

  if (filtroFecha) {
    query = query.eq("fecha", filtroFecha);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return;
  }

  let resultados = data;

  if (filtroLocal) {
    resultados = resultados.filter(i =>
      i.Maquina?.local?.toLowerCase().includes(filtroLocal.toLowerCase())
    );
  }

tbody.innerHTML = "";

mensaje.style.display = "none";
mensaje.textContent = "";

if (!resultados || resultados.length === 0) {
  tabla.style.display = "none"; 
  mensaje.textContent = "No se encontraron inspecciones con esos filtros";
  mensaje.style.display = "block";
  return;
}

tabla.style.display = "table";


  resultados.forEach(i => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${i.Maquina?.nombre ?? ""}</td>
      <td>${i.temperatura ?? ""}</td>
      <td>${i.hora ?? ""}</td>
      <td>${i.fecha ?? ""}</td>
      <td>${i.estado ?? ""}</td>
      <td>${i.observaciones ?? ""}</td>
      <td>${i.falla ? "Sí" : "No"}</td>
    `;

    tbody.appendChild(tr);
  });

  tabla.style.display = "table";
}
//---------------------------------------------------------------------
const btnFiltrarFallasExt = document.getElementById("btnFiltrarFallasExt");

if (btnFiltrarFallasExt) {
  btnFiltrarFallasExt.addEventListener("click", () => {

    const filtroLocal = document
      .getElementById("filtroLocalFallasExt")
      .value
      .toLowerCase()
      .trim();

    const filtroFecha = document
      .getElementById("filtroFechaFallasExt")
      .value
      .trim();

    const filas = document.querySelectorAll("#tablaFallasBody tr");
    const mensaje = document.getElementById("mensajeBusquedaFallasExt");
    const tabla = document.getElementById("tablaFallas"); 

    let hayResultados = false; 
    

    mensaje.style.display = "none";
    mensaje.textContent = "";


    filas.forEach(fila => {

      const local = fila.children[0].textContent.toLowerCase().trim();
      const fecha = fila.children[3].textContent.trim(); 

      let mostrar = true;


      if (filtroLocal && !local.includes(filtroLocal)) {
        mostrar = false;
      }


      if (filtroFecha && fecha !== filtroFecha) {
        mostrar = false;
      }


      fila.style.display = mostrar ? "" : "none";

      if (mostrar) hayResultados = true;
    });

    if (!hayResultados) {
      tabla.style.display = "none"; 
      mensaje.textContent = "No se encontraron fallas con esos filtros";
      mensaje.style.display = "block";
    } else {
      tabla.style.display = "table"; 
    }

  });
}
//------------------------------------------------------------------

export async function cargarMaquinasInfoDiaExterno() {

  const local = document.getElementById("infoLocalExterno").value.trim();

  if (!local) return;

  const { data, error } = await client
    .from("Maquina")
    .select("nombre")
    .ilike("local", `%${local}%`);

  if (error) return console.error(error);

  const select = document.getElementById("infoMaquinaExterno");

  select.innerHTML = `<option value="">Seleccione</option>`;

  data.forEach(m => {
    select.innerHTML += `<option value="${m.nombre}">${m.nombre}</option>`;
  });
}
//----------------------------------------------------------------------
export async function obtenerInfoDiaExterno() {

  const local = document.getElementById("infoLocalExterno").value.trim();
  const maquina = document.getElementById("infoMaquinaExterno").value.trim();

  if (!local || !maquina) {
    return alert("Ingrese local y máquina");
  }

  const { data, error } = await client
    .from("Inspeccion")
    .select(`
      fecha,
      falla,
      Maquina!inner(
        ID_MAQUINA,
        nombre,
        local
      )
    `)
    .ilike("Maquina.local", `%${local}%`)
    .ilike("Maquina.nombre", `%${maquina}%`)
    .order("fecha", { ascending: true });

  if (error) return console.error(error);

  if (data.length === 0) {
    document.getElementById("resultadoInfoDiaExterno").innerHTML = "Sin datos";
    return;
  }

  const total = data.length;
  const fallas = data.filter(i => i.falla).length;
  const correctas = total - fallas;

  const porcentajeFalla = ((fallas / total) * 100).toFixed(1);
  const porcentajeCorrecto = ((correctas / total) * 100).toFixed(1);

  const fallasFechas = data.filter(i => i.falla).map(i => i.fecha);

  let ultimaFalla = null;
  if (fallasFechas.length > 0) {
    ultimaFalla = fallasFechas[fallasFechas.length - 1];
  }

  let diasPromedio = 0;

  if (fallasFechas.length >= 2) {
    let suma = 0;

    for (let i = 1; i < fallasFechas.length; i++) {
      const f1 = new Date(fallasFechas[i - 1]);
      const f2 = new Date(fallasFechas[i]);

      const diff = (f2 - f1) / (1000 * 60 * 60 * 24);
      suma += diff;
    }

    diasPromedio = (suma / (fallasFechas.length - 1)).toFixed(0);
  }

  let mensajePrediccion = "Solo fallo 1 vez o ningún día";

  if (ultimaFalla && diasPromedio > 0) {

    const ultima = new Date(ultimaFalla);
    const hoy = new Date();

    const diasDesdeUltima = (hoy - ultima) / (1000 * 60 * 60 * 24);

    if (diasDesdeUltima >= diasPromedio) {
      mensajePrediccion = "🔴 Hoy coincide con su patrón de falla, podría fallar hoy";
    } else if (diasDesdeUltima >= diasPromedio * 0.7) {
      mensajePrediccion = "🟡 Podría fallar pronto, monitorear con atención";
    } else {
      mensajePrediccion = "🟢 Lejos de su ciclo de falla, riesgo bajo";
    }
  }

  let prioridad = "";


  if (porcentajeFalla >= 40) {
    prioridad = "🔴 Alta, Máquina con alto historial negativo";
  } else if (porcentajeFalla >= 15) {
    prioridad = "🟡 Media, Fallas ocasionales, condición intermedia";
  } else {
    prioridad = "🟢 Baja, Máquina confiable con bajo historial de fallas";
  }

  document.getElementById("resultadoInfoDiaExterno").innerHTML = `
  <table class="tabla-info">
    <tr>
      <td>Último día de falla:</td>
      <td>${ultimaFalla || "Sin fallas registradas"}</td>
    </tr>
    <tr>
      <td>Falla normalmente cada:</td>
      <td>${diasPromedio ? diasPromedio + " días" : "Solo falló 1 vez o ningún día"}</td>
    </tr>
    <tr>
      <td>Probabilidad de que falle:</td>
      <td>${mensajePrediccion}</td>
    </tr>
    <tr>
      <td>Total de fallas:</td>
      <td>${fallas} de ${total} inspecciones</td>
    </tr>
    <tr>
      <td>Funcionamiento:</td>
      <td>${porcentajeCorrecto}% sin fallas / ${porcentajeFalla}% con fallas</td>
    </tr>
    <tr>
      <td>Prioridad:</td>
      <td>${prioridad}</td>
    </tr>
  </table>
`;
}

//---------------------EXTERNO-----------------------------------------
//---------------------EXTERNO-----------------------------------------
































//---------------------Tecnico-----------------------------------------
//---------------------Tecnico-----------------------------------------
export async function cargarSolicitudesTecnico() {

  const tbody = document.getElementById("tablaTecnicoBody");

  if (!tbody) return;

const { data, error } = await client
  .from("Mantencion_Solicitada")
  .select(`
    ID_SOLICITUD,
    fecha_solicitud,
    hora_solicitud,
    observaciones,
    estado,
    Maquina (nombre, local)
  `);

  if (error) {
    console.error(error);
    alert("Error al cargar solicitudes");
    return;
  }

  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">No hay solicitudes</td>
      </tr>
    `;
    return;
  }

  data.forEach(s => {
    const tr = document.createElement("tr");

    tr.setAttribute("data-fecha", s.fecha_solicitud || "");
    tr.setAttribute("data-estado", (s.estado || "").toLowerCase());

tr.innerHTML = `
  <td>${s.Maquina?.local || "-"}</td>
  <td>${s.Maquina?.nombre || "-"}</td>
  <td>${s.fecha_solicitud}</td>
  <td>${s.hora_solicitud || "-"}</td>
  <td>${s.observaciones || "-"}</td>

  <td>
    <input 
      type="text"
      value="${s.estado || ""}"
      class="estado-input"
      data-id="${s.ID_SOLICITUD}"
    >
  </td>

  <td>
    <button class="btnGuardarEstado" data-id="${s.ID_SOLICITUD}">
      Guardar
    </button>
  </td>
`;

    tbody.appendChild(tr);
  });

  document.querySelectorAll(".btnGuardarEstado").forEach(btn => {

    btn.addEventListener("click", async () => {

      const id = btn.dataset.id;

      const select = document.querySelector(
        `.estado-input[data-id="${id}"]`
      );

      const nuevoEstado = select.value;

      const { error } = await client
        .from("Mantencion_Solicitada")
        .update({ estado: nuevoEstado })
        .eq("ID_SOLICITUD", id);

      if (error) {
        console.error(error);
        alert("Error al actualizar estado");
      } else {
        alert("Estado actualizado ✅");
      }

    });

  });
}

//-----------------------------------------------------------------------
export async function cargarSolicitudesParaRegistrar() {

  const tbody = document.getElementById("tablaRegistrarMantencionBody");
  if (!tbody) return;

  const { data, error } = await client
    .from("Mantencion_Solicitada")
    .select(`
      ID_SOLICITUD,
      observaciones,
      estado,
      fecha_solicitud,
      Maquina (ID_MAQUINA, nombre, local)
    `);

  if (error) {
    console.error(error);
    return;
  }

  tbody.innerHTML = "";

  data.forEach(s => {

    const tr = document.createElement("tr");

    tr.setAttribute("data-solicitud", s.ID_SOLICITUD);
    tr.setAttribute("data-maquina", s.Maquina?.ID_MAQUINA);
    tr.setAttribute("data-estado", (s.estado || "").toLowerCase());
    tr.setAttribute("data-fecha", s.fecha_solicitud || "");
    

    const deshabilitado = s.estado === "Realizada" ? "disabled" : "";

    tr.innerHTML = `
      <td>${s.ID_SOLICITUD}</td>
      <td>${s.Maquina?.nombre || "-"}</td>
      <td>${s.Maquina?.local || "-"}</td>
       <td>${s.fecha_solicitud || "-"}</td>


      <td><input type="date" class="fecha" ${deshabilitado}></td>
      <td><input type="time" class="hora" ${deshabilitado}></td>
      <td>${s.observaciones || "-"}</td>
      <td><input type="text" class="detalle" ${deshabilitado}></td>
      
      <td><input 
        type="text" 
        class="estado-input" 
        value="${s.estado || "Pendiente"}">
      </td>
    `;

    tbody.appendChild(tr);
  });

}
//-----------------------------------------------------------------------
export async function guardarMantencionRealizada() {

  const filas = document.querySelectorAll("#tablaRegistrarMantencionBody tr");

  const { data: userData } = await client.auth.getUser();

  const { data: tecnico } = await client
    .from("Tecnico")
    .select("ID_TECNICO")
    .eq("auth_id", userData.user.id)
    .single();

  if (!tecnico) {
    alert("No se encontró técnico");
    return;
  }

  const registros = [];

  filas.forEach(fila => {


    const fecha = fila.querySelector(".fecha").value;
    const hora = fila.querySelector(".hora").value;
    const detalle = fila.querySelector(".detalle").value;
    const estadoInput = fila.querySelector(".estado-input").value;


  if (!fecha || !hora || !detalle || !estadoInput) return;

    const id_solicitud = fila.dataset.solicitud;
    const id_maquina = fila.dataset.maquina;

    if (fecha && hora && detalle) {
      registros.push({
        fecha,
        hora,
        detalle_trabajo: detalle,
        id_tecnico: tecnico.ID_TECNICO,
        id_maquina: Number(id_maquina),
        id_solicitud: Number(id_solicitud)
      });
    }

  });

  if (registros.length === 0) {
    alert("No hay datos para guardar");
    return;
  }


  const { error } = await client
    .from("Mantencion_Realizada")
    .insert(registros);

  if (error) {
    console.error(error);
    alert("Error al guardar");
    return;
  }

  const ids = registros.map(r => r.id_solicitud);

  await client
    .from("Mantencion_Solicitada")
    .update({ estado: "Realizada" })
    .in("ID_SOLICITUD", ids);

  alert("Mantenciones guardadas correctamente");

}
//-----------------------------------------------------------------------
export function filtrarMantencionesRegistrar() {

  const filtroLocal = document
    .getElementById("filtroLocalTecnicoRegistrar")
    .value
    .toLowerCase()
    .trim();

  const filtroFecha = document
    .getElementById("filtroFechaTecnicoRegistrar")
    .value;

  const filtroEstado = document
    .getElementById("filtroEstadoTecnicoRegistrar")
    .value
    .toLowerCase()
    .trim();

  const filas = document.querySelectorAll("#tablaRegistrarMantencionBody tr");

  const mensaje = document.getElementById("mensajeBusquedaRegistrar");
  const tabla = document.querySelector("#panelRegistrarMantencion table");

  let hayResultados = false;

  mensaje.style.display = "none";
  mensaje.textContent = "";

  filas.forEach(fila => {

    let mostrar = true;

    const textoFila = fila.textContent.toLowerCase();

    if (filtroLocal && !textoFila.includes(filtroLocal)) {
      mostrar = false;
    }

    if (filtroFecha) {

      const fechaSolicitud = fila.dataset.fecha;
      const fechaInput = fila.querySelector(".fecha")?.value;

      if (
        fechaSolicitud !== filtroFecha &&
        fechaInput !== filtroFecha
      ) {
        mostrar = false;
      }
    }

    const estado = fila.querySelector(".estado-input")?.value.toLowerCase().trim();

    if (filtroEstado && !estado.includes(filtroEstado)) {
      mostrar = false;
    }

    fila.style.display = mostrar ? "" : "none";

    if (mostrar) hayResultados = true;
  });

  if (!hayResultados) {
    tabla.style.display = "none";
    mensaje.textContent = "No se encontraron registros de mantención";
    mensaje.style.display = "block";
  } else {
    tabla.style.display = "table";
  }
}

//-----------------------------------------------------------------------
export async function cargarInspeccionesTecnico() {

  const tbody = document.getElementById("tablaInspeccionesTecnicoBody");
  const tabla = document.getElementById("tablaInspeccionesTecnico");

  if (!tbody || !tabla) return;

  const { data, error } = await client
    .from("Inspeccion")
    .select(`
      temperatura,
      hora,
      fecha,
      estado,
      observaciones,
      falla,
      Maquina(nombre, local)
    `);

  if (error) {
    console.error(error);
    return;
  }

  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">No hay inspecciones</td>
      </tr>
    `;
    tabla.style.display = "table";
    return;
  }

  data.forEach(i => {

    const tr = document.createElement("tr");

    tr.setAttribute("data-fecha", i.fecha || "");

    tr.innerHTML = `
      <td>${i.Maquina?.nombre || "-"}</td>
      <td>${i.Maquina?.local || "-"}</td>
      <td>${i.temperatura || "-"}</td>
      <td>${i.hora || "-"}</td>
      <td>${i.fecha || "-"}</td>
      <td>${i.observaciones || "-"}</td>
      <td>${i.estado || "-"}</td>
      <td>${i.falla ? "Sí" : "No"}</td>
    `;

    tbody.appendChild(tr);
  });

  tabla.style.display = "table";
}

//-------------------------------------------------------
export function filtrarInspeccionTecnico() {

  const filtroLocal = document
    .getElementById("filtroLocalTecnicoInspeccion")
    .value
    .toLowerCase()
    .trim();

  const filtroFecha = document
    .getElementById("filtroFechaTecnicoInspeccion")
    .value;

  const filas = document.querySelectorAll("#tablaInspeccionesTecnicoBody tr");

  const mensaje = document.getElementById("mensajeBusquedaInspeccionesTecnico");
  const tabla = document.getElementById("tablaInspeccionesTecnico");

  let hayResultados = false;

  mensaje.style.display = "none";
  mensaje.textContent = "";

  filas.forEach(fila => {

    const columnas = fila.children;

    const local = columnas[1].textContent.toLowerCase().trim();
    const fecha = columnas[4].textContent.trim();

    let coincideLocal = true;
    let coincideFecha = true;


    if (filtroLocal) {
      coincideLocal = local.includes(filtroLocal);
    }


    if (filtroFecha) {
      coincideFecha = fecha.includes(filtroFecha);
    }


    if (filtroLocal && filtroFecha) {
      fila.style.display = (coincideLocal && coincideFecha) ? "" : "none";
    } 
    else if (filtroLocal) {
      fila.style.display = coincideLocal ? "" : "none";
    } 
    else if (filtroFecha) {
      fila.style.display = coincideFecha ? "" : "none";
    } 
    else {
      fila.style.display = "";
    }

    if (fila.style.display !== "none") {
      hayResultados = true;
    }

  });

  if (!hayResultados) {
    tabla.style.display = "none";
    mensaje.textContent = "No se encontraron inspecciones";
    mensaje.style.display = "block";
  } else {
    tabla.style.display = "table";
  }
}

//----------------------------------------------------------------------
export async function cargarEstadoMantencionesTecnico() {

  const tbody = document.getElementById("tablaEstadoMantencionTecnicoBody");
  const tabla = document.getElementById("tablaEstadoMantencionTecnico");

  if (!tbody || !tabla) return;

  const { data, error } = await client
    .from("Mantencion_Realizada")
    .select(`
      id_solicitud,
      fecha,
      hora,
      detalle_trabajo,
      Maquina(nombre, local),
      Mantencion_Solicitada(
        fecha_solicitud,
        observaciones,
        estado
      )
    `);

  if (error) {
    console.error(error);
    alert("Error al cargar estado de mantenciones");
    return;
  }

  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">No hay mantenciones registradas</td>
      </tr>
    `;
    tabla.style.display = "table";
    return;
  }

  data.forEach(m => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${m.id_solicitud || "-"}</td>
      <td>${m.Maquina?.nombre || "-"}</td>
      <td>${m.Maquina?.local || "-"}</td>
      <td>${m.Mantencion_Solicitada?.fecha_solicitud || "-"}</td>
      <td>${m.fecha || "-"}</td>
      <td>${m.hora || "-"}</td>
      <td>${m.Mantencion_Solicitada?.observaciones || "-"}</td>
      <td>${m.detalle_trabajo || "-"}</td>
      <td>${m.Mantencion_Solicitada?.estado || "-"}</td>
    `;

    tbody.appendChild(tr);
  });

  tabla.style.display = "table";
}

//----------------------------------------------------------------------
export function filtrarEstadoMantencionTecnico() {

  const filtroLocal = document
    .getElementById("filtroLocalEstadoMantTecnico")
    .value
    .toLowerCase()
    .trim();

  const filtroFecha = document
    .getElementById("filtroFechaEstadoMantTecnico")
    .value
    .trim();

  const filas = document.querySelectorAll("#tablaEstadoMantencionTecnicoBody tr");


  const mensaje = document.getElementById("mensajeBusquedaEstadoMantTecnico");
  const tabla = document.getElementById("tablaEstadoMantencionTecnico");

  let hayResultados = false;


  mensaje.style.display = "none";
  mensaje.textContent = "";

  filas.forEach(fila => {

    const local = fila.children[2].textContent.toLowerCase().trim();
    const fecha = fila.children[4].textContent.trim();

    let mostrar = true;


    if (filtroLocal && !local.includes(filtroLocal)) {
      mostrar = false;
    }


    if (filtroFecha && fecha !== filtroFecha) {
      mostrar = false;
    }

    fila.style.display = mostrar ? "" : "none";

    if (mostrar) hayResultados = true;
  });


  if (!hayResultados) {
    tabla.style.display = "none";
    mensaje.textContent = "No se encontraron mantenciones";
    mensaje.style.display = "block";
  } else {
    tabla.style.display = "table";
  }
}
//---------------------------------------------------------------------
export async function cargarMaquinasInfoDiaTecnico() {

  const local = document.getElementById("infoLocalTecnico").value.trim();

  if (!local) return;

  const { data, error } = await client
    .from("Maquina")
    .select("nombre")
    .ilike("local", `%${local}%`);

  if (error) return console.error(error);

  const select = document.getElementById("infoMaquinaTecnico");

  select.innerHTML = `<option value="">Seleccione</option>`;

  data.forEach(m => {
    select.innerHTML += `<option value="${m.nombre}">${m.nombre}</option>`;
  });
}

//--------------------------------------------------------------------
export async function obtenerInfoDiaTecnico() {

  const local = document.getElementById("infoLocalTecnico").value.trim();
  const maquina = document.getElementById("infoMaquinaTecnico").value.trim();

  if (!local || !maquina) {
    return alert("Ingrese local y máquina");
  }


  const { data, error } = await client
    .from("Inspeccion")
    .select(`
      fecha,
      falla,
      Maquina!inner(
        ID_MAQUINA,
        nombre,
        local
      )
    `)
    .ilike("Maquina.local", `%${local}%`)
    .ilike("Maquina.nombre", `%${maquina}%`)
    .order("fecha", { ascending: true });

  if (error) return console.error(error);

  if (!data || data.length === 0) {
    document.getElementById("resultadoInfoDiaTecnico").innerHTML = "Sin datos";
    return;
  }


  const total = data.length;
  const fallas = data.filter(i => i.falla).length;
  const correctas = total - fallas;

  const porcentajeFalla = ((fallas / total) * 100).toFixed(1);
  const porcentajeCorrecto = ((correctas / total) * 100).toFixed(1);

  const fallasFechas = data.filter(i => i.falla).map(i => i.fecha);

  let ultimaFalla = fallasFechas.length > 0
    ? fallasFechas[fallasFechas.length - 1]
    : null;

  let diasPromedio = 0;

  if (fallasFechas.length >= 2) {
    let suma = 0;

    for (let i = 1; i < fallasFechas.length; i++) {
      const f1 = new Date(fallasFechas[i - 1]);
      const f2 = new Date(fallasFechas[i]);

      suma += (f2 - f1) / (1000 * 60 * 60 * 24);
    }

    diasPromedio = Math.round(suma / (fallasFechas.length - 1));
  }

  let mensajePrediccion = "Solo fallo 1 vez o ningun dia";

  if (ultimaFalla && diasPromedio > 0) {

    const ultima = new Date(ultimaFalla);
    const hoy = new Date();

    const diasDesdeUltima = (hoy - ultima) / (1000 * 60 * 60 * 24);

    if (diasDesdeUltima >= diasPromedio) {
      mensajePrediccion = "🔴 hoy coincide con su patron de falla, podria fallar hoy";
    } else if (diasDesdeUltima >= diasPromedio * 0.7) {
      mensajePrediccion = "🟡 Podría fallar pronto, monitorear con atencion";
    } else {
      mensajePrediccion = "🟢 Lejos de su ciclo de falla, Riesgo bajo";
    }
  }

  let prioridad = "🟢 Baja, maquina confiable con bajo historial de fallas";
  if (porcentajeFalla >= 40) prioridad = "🔴 Alta, maquina con alto historial negativo";
  else if (porcentajeFalla >= 15) prioridad = "🟡 Media, fallas ocasionales, condicion intermedia";


  const idMaquina = data[0].Maquina.ID_MAQUINA;

  const { data: mantData, error: mantError } = await client
    .from("Mantencion_Realizada")
    .select(`
      fecha,
      detalle_trabajo,
      id_maquina
    `)
    .eq("id_maquina", idMaquina)
    .order("fecha", { ascending: false })
    .limit(1);

  if (mantError) console.error(mantError);

  let fechaMant = "Sin datos registrados";
  let detalle = "Sin datos registrados";

  if (mantData && mantData.length > 0) {
    fechaMant = mantData[0].fecha;
    detalle = mantData[0].detalle_trabajo;
  }


  document.getElementById("resultadoInfoDiaTecnico").innerHTML = `
  <table class="tabla-info">

    <tr>
      <td>Último día de falla:</td>
      <td>${ultimaFalla || "Sin fallas registradas"}</td>
    </tr>

    <tr>
      <td>Falla normalmente cada:</td>
      <td>${diasPromedio ? diasPromedio + " días" : "Solo falló 1 vez o ningún día"}</td>
    </tr>

    <tr>
      <td>Probabilidad de que falle:</td>
      <td>${mensajePrediccion}</td>
    </tr>

    <tr>
      <td>Total de fallas:</td>
      <td>${fallas} de ${total} inspecciones</td>
    </tr>

    <tr>
      <td>Funcionamiento:</td>
      <td>${porcentajeCorrecto}% sin fallas / ${porcentajeFalla}% con fallas</td>
    </tr>

    <tr>
      <td>Prioridad:</td>
      <td>${prioridad}</td>
    </tr>

    <tr>
      <td>Fecha de ultima mantención:</td>
      <td>${fechaMant}</td>
    </tr>

    <tr>
      <td>Mantención Realizada:</td>
      <td>${detalle}</td>
    </tr>

  </table>
`;
}

//---------------------Tecnico-----------------------------------------
//---------------------Tecnico-----------------------------------------









































//---------------------Analisis-----------------------------------------
//---------------------Analisis-----------------------------------------
export async function analizarFallasPorMaquina() {

  const { data, error } = await client
    .from("Inspeccion")
    .select(`
      falla,
      id_maquina,
      Maquina (nombre, local)
    `);

  if (error) {
    console.error(error);
    alert("Error al analizar fallas");
    return;
  }

  const conteo = {};

  data.forEach(i => {

    if (!i.falla) return; 

    const id = i.id_maquina;

    if (!conteo[id]) {
      conteo[id] = {
        nombre: i.Maquina?.nombre || "-",
        local: i.Maquina?.local || "-",
        total: 0
      };
    }

    conteo[id].total++;
  });

  const resultado = Object.values(conteo);

  resultado.sort((a, b) => b.total - a.total);

  const tbody = document.getElementById("bodyFallasAnalisis");
  const tabla = document.getElementById("tablaFallasAnalisis");

  tbody.innerHTML = "";

  if (resultado.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3">Sin datos</td></tr>`;
  } else {
    resultado.forEach(r => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${r.local}</td>
        <td>${r.nombre}</td>
        <td>${r.total}</td>
      `;

      tbody.appendChild(tr);
    });
  }

  tabla.style.display = "table";
}
//----------------------------------------------------------------
export function filtrarFallasAnalisis() {

  const filtroLocal = document
    .getElementById("filtroLocalAnalisis")
    .value
    .toLowerCase()
    .trim();

  const filtroMaquina = document
    .getElementById("filtroMaquinaAnalisis")
    .value
    .toLowerCase()
    .trim();

  const filas = document.querySelectorAll("#bodyFallasAnalisis tr");

  let totalFallas = 0;
  let hayResultados = false;

  const mensaje = document.getElementById("resultadoFallasAnalisis");
  const tabla = document.getElementById("tablaFallasAnalisis");

  mensaje.style.display = "none";
  mensaje.textContent = "";

  filas.forEach(fila => {

    const local = fila.children[0].textContent.toLowerCase().trim();
    const maquina = fila.children[1].textContent.toLowerCase().trim();
    const fallas = parseInt(fila.children[2].textContent.trim()) || 0;

    let mostrar = true;

    if (filtroLocal && !local.includes(filtroLocal)) {
      mostrar = false;
    }

    if (filtroMaquina && !maquina.includes(filtroMaquina)) {
      mostrar = false;
    }

    fila.style.display = mostrar ? "" : "none";

    if (mostrar) {
      totalFallas += fallas;
      hayResultados = true;
    }
  });

  document.getElementById("totalFallasAnalisis").innerHTML =
    `<strong>Total fallas:</strong> ${totalFallas}`;

  if (!hayResultados) {
    tabla.style.display = "none";
    mensaje.textContent = "No se encontraron fallas";
    mensaje.style.display = "block";
  } else {
    tabla.style.display = "table";
  }
}
//--------------------------------------------------------

export async function analizarTiempoReparacion() {

  const { data, error } = await client
    .from("Mantencion_Realizada")
    .select(`
      fecha,
      id_solicitud,
      Maquina(nombre, local),
      Mantencion_Solicitada(fecha_solicitud)
    `);

  if (error) {
    console.error(error);
    alert("Error al analizar tiempo de reparación");
    return;
  }

  const tbody = document.getElementById("bodyTiempoReparacion");
  const tabla = document.getElementById("tablaTiempoReparacion");

  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">Sin datos</td></tr>`;
    tabla.style.display = "table";
    return;
  }

  let totalDias = 0;
  let contador = 0;

  data.forEach(m => {

    const fechaSolicitud = m.Mantencion_Solicitada?.fecha_solicitud;
    const fechaReparacion = m.fecha;

    if (!fechaSolicitud || !fechaReparacion) return;

    const f1 = new Date(fechaSolicitud);
    const f2 = new Date(fechaReparacion);

    const diferenciaMs = f2 - f1;
    const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));

    totalDias += dias;
    contador++;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${m.Maquina?.local || "-"}</td>
      <td>${m.Maquina?.nombre || "-"}</td>
      <td>${fechaSolicitud}</td>
      <td>${fechaReparacion}</td>
      <td>${dias}</td>
    `;

    tbody.appendChild(tr);
  });


  tabla.style.display = "table";
}
//--------------------------------------------------------
export function filtrarTiempoReparacion() {

  const filtroLocal = document
    .getElementById("filtroLocalTiempo")
    .value
    .toLowerCase()
    .trim();

  const filtroMaquina = document
    .getElementById("filtroMaquinaTiempo")
    .value
    .toLowerCase()
    .trim();

  const filtroFecha = document
    .getElementById("filtroFechaTiempo")
    .value
    .trim();

  const filas = document.querySelectorAll("#bodyTiempoReparacion tr");

  const mensaje = document.getElementById("resultadoTiempoReparacion");
  const tabla = document.getElementById("tablaTiempoReparacion");

  let hayResultados = false;

  mensaje.style.display = "none";
  mensaje.textContent = "";

  filas.forEach(fila => {

    const local = fila.children[0].textContent.toLowerCase().trim();
    const maquina = fila.children[1].textContent.toLowerCase().trim();
    const fechaSolicitud = fila.children[2].textContent.trim();

    let mostrar = true;

    if (filtroLocal && !local.includes(filtroLocal)) {
      mostrar = false;
    }

    if (filtroMaquina && !maquina.includes(filtroMaquina)) {
      mostrar = false;
    }

    if (filtroFecha && fechaSolicitud !== filtroFecha) {
      mostrar = false;
    }

    fila.style.display = mostrar ? "" : "none";

    if (mostrar) {
      hayResultados = true;
    }
  });

  if (!hayResultados) {
    tabla.style.display = "none";
    mensaje.textContent = "No se encontraron registros de reparación";
    mensaje.style.display = "block";
  } else {
    tabla.style.display = "table";
  }
}



//----------------------------------------------------------------
export async function analizarTiempoEntreFallas() {

  const { data, error } = await client
    .from("Inspeccion")
    .select(`
      id_maquina,
      fecha,
      falla,
      Maquina (nombre, local)
    `)
    .eq("falla", true)
    .order("fecha", { ascending: true });

  if (error) {
    console.error(error);
    alert("Error al analizar tiempo entre fallas");
    return;
  }

  const porMaquina = {};

  data.forEach(i => {
    const id = i.id_maquina;

    if (!porMaquina[id]) {
      porMaquina[id] = {
        nombre: i.Maquina?.nombre || "-",
        local: i.Maquina?.local || "-",
        fechas: []
      };
    }

    porMaquina[id].fechas.push(i.fecha);
  });


  const resultado = [];

  Object.values(porMaquina).forEach(m => {
    const fechas = m.fechas;

    for (let i = 0; i < fechas.length - 1; i++) {
      const f1 = new Date(fechas[i]);
      const f2 = new Date(fechas[i + 1]);

      const diff = (f2 - f1) / (1000 * 60 * 60 * 24);

      resultado.push({
        local: m.local,
        nombre: m.nombre,
        fecha1: fechas[i],
        fecha2: fechas[i + 1],
        dias: diff
      });
    }
  });


  const tbody = document.getElementById("bodyTiempoFallas");
  const tabla = document.getElementById("tablaTiempoFallas");

  tbody.innerHTML = "";

  if (resultado.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">Sin datos</td></tr>`;
  } else {
    resultado.forEach(r => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${r.local}</td>
        <td>${r.nombre}</td>
        <td>${r.fecha1}</td>
        <td>${r.fecha2}</td>
        <td>${r.dias} días</td>
      `;

      tbody.appendChild(tr);
    });
  }

  tabla.style.display = "table";
}
//--------------------------------------------------------
export function filtrarTiempoFallas() {

  const filtroLocal = document
    .getElementById("filtroLocalFallas")
    .value
    .toLowerCase()
    .trim();

  const filtroMaquina = document
    .getElementById("filtroMaquinaFallas")
    .value
    .toLowerCase()
    .trim();

  const filtroFecha = document
    .getElementById("filtroFechaFallas")
    .value
    .trim();

  const filas = document.querySelectorAll("#bodyTiempoFallas tr");

  const mensaje = document.getElementById("resultadoTiempoFallas");
  const tabla = document.getElementById("tablaTiempoFallas");

  let hayResultados = false;

  mensaje.style.display = "none";
  mensaje.textContent = "";

  filas.forEach(fila => {

    const local = fila.children[0].textContent.toLowerCase().trim();
    const maquina = fila.children[1].textContent.toLowerCase().trim();
    const fecha = fila.children[2].textContent.trim();

    let mostrar = true;

    if (filtroLocal && !local.includes(filtroLocal)) {
      mostrar = false;
    }

    if (filtroMaquina && !maquina.includes(filtroMaquina)) {
      mostrar = false;
    }

    if (filtroFecha && fecha !== filtroFecha) {
      mostrar = false;
    }

    fila.style.display = mostrar ? "" : "none";

    if (mostrar) {
      hayResultados = true;
    }
  });

  if (!hayResultados) {
    tabla.style.display = "none";
    mensaje.textContent = "No se encontraron registros de fallas";
    mensaje.style.display = "block";
  } else {
    tabla.style.display = "table";
  }
}

//----------------------------------------------------------------
export async function analizarPrioridadMaquinas() {

  const tabla = document.getElementById("tablaPrioridad");
  const tbody = document.getElementById("bodyPrioridad");

  tabla.style.display = "table";
  tbody.innerHTML = "";


  const { data, error } = await client
    .from("Inspeccion")
    .select(`
      falla,
      Maquina (local, nombre)
    `)
    .eq("falla", true); 

  if (error) return console.error(error);


  const conteo = {};
  const totalPorLocal = {};


  data.forEach(f => {

    const local = f.Maquina?.local || "Sin local";
    const maquina = f.Maquina?.nombre || "Sin nombre";


    if (!totalPorLocal[local]) {
      totalPorLocal[local] = 0;
    }
    totalPorLocal[local]++;


    const key = `${local}||${maquina}`;

    if (!conteo[key]) {
      conteo[key] = {
        local,
        maquina,
        fallas: 0
      };
    }

    conteo[key].fallas++;
  });


  Object.values(conteo).forEach(m => {

    const totalLocal = totalPorLocal[m.local];

    const porcentaje = totalLocal
      ? ((m.fallas / totalLocal) * 100).toFixed(1)
      : 0;


    let prioridad = "";
    if (porcentaje >= 40) {
      prioridad = "🔴 Alta";
    } else if (porcentaje >= 15) {
      prioridad = "🟡 Media";
    } else {
      prioridad = "🟢 Baja";
    }

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${m.local}</td>
      <td>${m.maquina}</td>
      <td>${m.fallas}</td>
      <td>${prioridad}</td>
      <td>${porcentaje}% de las fallas del local</td>
    `;

    tbody.appendChild(tr);
  });

}

//----------------------------------------------------------------
export function filtrarPrioridadAnalisis() {

  const filtroLocal = document
    .getElementById("filtroLocalPrioridad")
    .value
    .toLowerCase()
    .trim();

  const filtroMaquina = document
    .getElementById("filtroMaquinaPrioridad")
    .value
    .toLowerCase()
    .trim();

  const filtroPrioridad = document
    .getElementById("filtroPrioridad")
    .value
    .toLowerCase()
    .trim();

  const filas = document.querySelectorAll("#bodyPrioridad tr");

  const mensaje = document.getElementById("resultadoPrioridadAnalisis");
  const tabla = document.getElementById("tablaPrioridad");

  let hayResultados = false;

  mensaje.style.display = "none";
  mensaje.textContent = "";

  filas.forEach(fila => {

    const local = fila.children[0].textContent.toLowerCase().trim();
    const maquina = fila.children[1].textContent.toLowerCase().trim();
    const prioridad = fila.children[3].textContent.toLowerCase().trim(); 

    let mostrar = true;

    if (filtroLocal && !local.includes(filtroLocal)) {
      mostrar = false;
    }

    if (filtroMaquina && !maquina.includes(filtroMaquina)) {
      mostrar = false;
    }

    if (filtroPrioridad && !prioridad.includes(filtroPrioridad)) {
      mostrar = false;
    }

    fila.style.display = mostrar ? "" : "none";

    if (mostrar) {
      hayResultados = true;
    }
  });

  if (!hayResultados) {
    tabla.style.display = "none";
    mensaje.textContent = "Sin Resultados";
    mensaje.style.display = "block";
  } else {
    tabla.style.display = "table";
  }
}

//----------------------------------------------------------------
export async function cargarLocalesResumen() {

  const { data, error } = await client
    .from("Maquina")
    .select("local");

  if (error) return console.error(error);

  const select = document.getElementById("selectLocal");

  const locales = [...new Set(data.map(m => m.local))];

  select.innerHTML = `<option value="">Seleccione</option>`;

  locales.forEach(l => {
    select.innerHTML += `<option value="${l}">${l}</option>`;
  });
}

//----------------------------------------------------------------
export async function cargarMaquinasPorLocalResumen() {

  const local = document.getElementById("selectLocal").value;

  const { data, error } = await client
    .from("Maquina")
    .select('"ID_MAQUINA", nombre')
    .eq("local", local);

  if (error) return console.error(error);

  const select1 = document.getElementById("selectMaquina");
  const select2 = document.getElementById("selectMaquina2");


  select1.innerHTML = `<option value="">Seleccione</option>`;
  select2.innerHTML = `<option value="">Seleccione</option>`;

  data.forEach(m => {

    const option = `<option value="${m.ID_MAQUINA}">${m.nombre}</option>`;

    select1.innerHTML += option;
    select2.innerHTML += option;

  });
}
//----------------------------------------------------------------



export async function verResumenMaquina() {

  const id = document.getElementById("selectMaquina").value;
  const select = document.getElementById("selectMaquina");
  const nombreMaquina = select.options[select.selectedIndex].text;

  const { data, error } = await client
    .from("Inspeccion")
    .select("fecha, falla")
    .eq("id_maquina", id);

  if (error) return console.error(error);

  const total = data.length;
  const fallas = data.filter(i => i.falla).length;
  const correctas = total - fallas;

  const porcentajeCorrecto = total ? ((correctas / total) * 100).toFixed(1) : 0;
  const porcentajeFalla = total ? ((fallas / total) * 100).toFixed(1) : 0;

document.getElementById("infoMaquina").innerHTML = `
<table class="tabla-info-dia">
  <caption class="titulo-maquina">${nombreMaquina}</caption>
  <tr>
    <td>Total inspecciones</td>
    <td>${total}</td>
  </tr>
  <tr>
    <td>Fallas</td>
    <td>${fallas} (${porcentajeFalla}%)</td>
  </tr>
  <tr>
    <td>Funcionamiento correcto</td>
    <td>${correctas} (${porcentajeCorrecto}%)</td>
  </tr>
</table>
`;

  dibujarGrafico(
    ["Correcto", "Fallas"],
    [correctas, fallas]
  );
}
//----------------------------------------------------------------
export async function verResumenMaquina2() {

  const id = document.getElementById("selectMaquina2").value;
  const select2 = document.getElementById("selectMaquina2");
  const nombreMaquina2 = select2.options[select2.selectedIndex].text;

  if (!id) return;

  const { data, error } = await client
    .from("Inspeccion")
    .select("fecha, falla")
    .eq("id_maquina", id);

  if (error) return console.error(error);

  const total = data.length;
  const fallas = data.filter(i => i.falla).length;
  const correctas = total - fallas;

  const porcentajeCorrecto = total ? ((correctas / total) * 100).toFixed(1) : 0;
  const porcentajeFalla = total ? ((fallas / total) * 100).toFixed(1) : 0;

  document.getElementById("infoMaquina2").innerHTML = `
  <table class="tabla-info-dia">
  <caption class="titulo-maquina">${nombreMaquina2}</caption>
    <tr>
      <td>Total inspecciones</td>
      <td>${total}</td>
    </tr>
    <tr>
      <td>Fallas</td>
      <td>${fallas} (${porcentajeFalla}%)</td>
    </tr>
    <tr>
      <td>Funcionamiento correcto</td>
      <td>${correctas} (${porcentajeCorrecto}%)</td>
  </tr>
</table>
`;

  dibujarGrafico2(
    ["Correcto", "Fallas"],
    [correctas, fallas]
  );
}

//----------------------------------------------------------------
let chart;
let chart2;




//----------------------------------------------------------------
function dibujarGrafico(labels, data) {

  const ctx = document.getElementById("graficoFallas").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ["#2ecc71", "#ff3f2a"] 
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          labels: {
            color: "white" 
          }
        }
      }
    }
  });
}


//----------------------------------------------------------------
function dibujarGrafico2(labels, data) {

  const ctx = document.getElementById("graficoFallas2").getContext("2d");

  if (chart2) chart2.destroy();

  chart2 = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ["#2ecc71", "#ff3f2a"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          labels: {
            color: "white"
          }
        }
      }
    }
  });
}

//----------------------------------------------------------------
const btnFiltrarFallasAnalisis = document.getElementById("btnFiltrarFallasAnalisis");

if (btnFiltrarFallasAnalisis) {
  btnFiltrarFallasAnalisis.addEventListener("click", () => {

    const filtroLocal = document
      .getElementById("filtroLocalAnalisis")
      .value
      .toLowerCase()
      .trim();

    const filtroMaquina = document
      .getElementById("filtroMaquinaAnalisis")
      .value
      .toLowerCase()
      .trim();

    const filas = document.querySelectorAll("#bodyFallasAnalisis tr");

    let totalFallas = 0; 

    filas.forEach(fila => {

      const local = fila.children[0].textContent.toLowerCase().trim();
      const maquina = fila.children[1].textContent.toLowerCase().trim();
      const fallas = parseInt(fila.children[2].textContent.trim()) || 0;

      let mostrar = true;


      if (filtroLocal && !local.includes(filtroLocal)) {
        mostrar = false;
      }


      if (filtroMaquina && !maquina.includes(filtroMaquina)) {
        mostrar = false;
      }


      fila.style.display = mostrar ? "" : "none";


      if (mostrar) {
        totalFallas += fallas;
      }

    });


    document.getElementById("totalFallasAnalisis").innerHTML = `
      <strong>Total fallas:</strong> ${totalFallas}
    `;
  });
}

//----------------------------------------------------------------
const btnFiltrarTiempo = document.getElementById("btnFiltrarTiempo");

if (btnFiltrarTiempo) {
  btnFiltrarTiempo.addEventListener("click", () => {

    const filtroLocal = document
      .getElementById("filtroLocalTiempo")
      .value
      .toLowerCase()
      .trim();

    const filtroMaquina = document
      .getElementById("filtroMaquinaTiempo")
      .value
      .toLowerCase()
      .trim();

    const filtroFecha = document
      .getElementById("filtroFechaTiempo")
      .value
      .trim();

    const filas = document.querySelectorAll("#bodyTiempoReparacion tr");

    filas.forEach(fila => {

      const local = fila.children[0].textContent.toLowerCase().trim();
      const maquina = fila.children[1].textContent.toLowerCase().trim();
      const fechaSolicitud = fila.children[2].textContent.trim();

      let mostrar = true;


      if (filtroLocal && !local.includes(filtroLocal)) {
        mostrar = false;
      }


      if (filtroMaquina && !maquina.includes(filtroMaquina)) {
        mostrar = false;
      }

      if (filtroFecha && fechaSolicitud !== filtroFecha) {
        mostrar = false;
      }

      fila.style.display = mostrar ? "" : "none";
    });

  });
}

//----------------------------------------------------------------
const btnFiltrarTiempoFallas = document.getElementById("btnFiltrarTiempoFallas");

if (btnFiltrarTiempoFallas) {
  btnFiltrarTiempoFallas.addEventListener("click", () => {

    const filtroLocal = document
      .getElementById("filtroLocalFallas")
      .value
      .toLowerCase()
      .trim();

    const filtroMaquina = document
      .getElementById("filtroMaquinaFallas")
      .value
      .toLowerCase()
      .trim();

    const filtroFecha = document
      .getElementById("filtroFechaFallas")
      .value
      .trim();

    const filas = document.querySelectorAll("#bodyTiempoFallas tr");

    filas.forEach(fila => {

      const local = fila.children[0].textContent.toLowerCase().trim();
      const maquina = fila.children[1].textContent.toLowerCase().trim();
      const fecha = fila.children[2].textContent.trim(); 

      let mostrar = true;


      if (filtroLocal && !local.includes(filtroLocal)) {
        mostrar = false;
      }


      if (filtroMaquina && !maquina.includes(filtroMaquina)) {
        mostrar = false;
      }

   
      if (filtroFecha && fecha !== filtroFecha) {
        mostrar = false;
      }

      fila.style.display = mostrar ? "" : "none";
    });

  });
}
//----------------------------------------------------------------
const btnFiltrarPrioridad = document.getElementById("btnFiltrarPrioridad");

if (btnFiltrarPrioridad) {
  btnFiltrarPrioridad.addEventListener("click", () => {

    const filtroLocal = document
      .getElementById("filtroLocalPrioridad")
      .value
      .toLowerCase()
      .trim();

    const filtroMaquina = document
      .getElementById("filtroMaquinaPrioridad")
      .value
      .toLowerCase()
      .trim();

    const filas = document.querySelectorAll("#bodyPrioridad tr");

    filas.forEach(fila => {

      const local = fila.children[0].textContent.toLowerCase().trim();
      const maquina = fila.children[1].textContent.toLowerCase().trim();

      let mostrar = true;


      if (filtroLocal && !local.includes(filtroLocal)) {
        mostrar = false;
      }


      if (filtroMaquina && !maquina.includes(filtroMaquina)) {
        mostrar = false;
      }

      fila.style.display = mostrar ? "" : "none";
    });

  });
}

//---------------------Analisis-----------------------------------------
//---------------------Analisis-----------------------------------------
