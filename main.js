import {
  logout, buscarMaquinas, agregarMaquina, editarMaquina, eliminarMaquina,
  cargarMaquinas, mostrarMaquinaEnInspeccion, guardarTodo, buscarInspecciones,
  descontinuarMaquina, reactivarMaquina, cargarLocalesDatalist,
  cargarMaquinasPorLocalNombre, guardarFalla, cargarFallas, cargarInspeccionesExterno,
  cargarInspeccionesJefe,cargarSolicitudesMantencion,
  guardarSolicitudMantencion, cargarSolicitudesTecnico,cargarSolicitudesParaRegistrar, guardarMantencionRealizada,
  filtrarMantencionesRegistrar, cargarInspeccionesTecnico, filtrarInspeccionTecnico,
  cargarMantencionesRealizadasJefe, filtrarMantencionesRealizadasJefe, cargarEstadoMantencionesTecnico,
  filtrarEstadoMantencionTecnico, analizarFallasPorMaquina, analizarTiempoReparacion,
  analizarTiempoEntreFallas, analizarPrioridadMaquinas, verResumenMaquina,
  verResumenMaquina2,cargarLocalesResumen,cargarMaquinasPorLocalResumen, 
  cargarFallasJefe,obtenerInfoDia, cargarMaquinasInfoDia,obtenerInfoDiaExterno,
  cargarMaquinasInfoDiaExterno, editarFallaExterno ,guardarEdicionFalla,
  cancelarEdicionFalla,eliminarFalla, editarInspeccion, eliminarInspeccion,
  guardarEdicionInspeccion, cancelarEdicionInspeccion,   cargarMaquinasInfoDiaTecnico,
  obtenerInfoDiaTecnico, obtenerInfoDiaJefe, cargarMaquinasInfoDiaJefe, 
  filtrarFallasAnalisis, filtrarTiempoReparacion, filtrarTiempoFallas, filtrarPrioridadAnalisis


} from "./app.js";

document.addEventListener("DOMContentLoaded", () => {



  const btnSalir = document.getElementById("btnSalir");
  if (btnSalir) {
    btnSalir.addEventListener("click", logout);
  }


  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) btnLogout.addEventListener("click", logout);

  const btnBuscar = document.getElementById("btnBuscar");
  if (btnBuscar) btnBuscar.addEventListener("click", buscarMaquinas);

  const btnAgregar = document.getElementById("btnAgregar");
  if (btnAgregar) btnAgregar.addEventListener("click", agregarMaquina);

  const btnGuardarFalla = document.getElementById("btnGuardarFalla");
  if (btnGuardarFalla) {
    btnGuardarFalla.addEventListener("click", guardarFalla);
  }

  const btnFallas = document.getElementById("panelFallas");
  if (btnFallas) {
    btnFallas.addEventListener("click", cargarFallas);
  }




  
  const btnGuardarTodas = document.getElementById("btnGuardarMantenciones");

if (btnGuardarTodas) {
  btnGuardarTodas.addEventListener("click", guardarMantencionRealizada);
}

const btn = document.getElementById("btnFiltrarInspeccionTecnico");

if (btn) {
  btn.addEventListener("click", filtrarInspeccionTecnico);
}


  // ---------------- CARGAS INICIALES ----------------
  //cargarLocalesDatalist();


  const inputLocal = document.getElementById("inputLocal");
  if (inputLocal) {
    inputLocal.addEventListener("input", async () => {

      const local = inputLocal.value.trim();
      if (local.length < 3) return;

      await cargarMaquinasPorLocalNombre();
    });
  }



  const toggleAgregar = document.getElementById("btnToggleAgregar");
  if (toggleAgregar) {
    toggleAgregar.addEventListener("click", () => {
      const panel = document.getElementById("panelAgregar");
      const isHidden = panel.style.display === "none";

      panel.style.display = isHidden ? "block" : "none";

      toggleAgregar.textContent = isHidden
        ? "Ocultar agregar máquina"
        : "Agregar máquina";
    });
  }



const btnToggleMaquinas = document.getElementById("btnToggleMaquinas");

if (btnToggleMaquinas) {
  btnToggleMaquinas.addEventListener("click", async () => {

    const panelBuscar = document.getElementById("panelBuscar");
    const tabla = document.getElementById("tablaMaquinas");

    const oculto =
      panelBuscar.style.display === "none" || panelBuscar.style.display === "";

    if (oculto) {
      panelBuscar.style.display = "block";
      tabla.style.display = "table";

      await cargarMaquinas();
      btnToggleMaquinas.textContent = "Ocultar máquinas";

    } else {
      panelBuscar.style.display = "none";
      tabla.style.display = "none";

      btnToggleMaquinas.textContent = "Gestión de máquinas";
    }

  });
}


  const toggleFalla = document.getElementById("btnToggleFalla");
  if (toggleFalla) {
    toggleFalla.addEventListener("click", () => {
      const panel = document.getElementById("panelFalla");

      const isHidden =
        panel.style.display === "none" || panel.style.display === "";

      panel.style.display = isHidden ? "block" : "none";

      toggleFalla.textContent = isHidden
        ? "Ocultar registro de falla"
        : "Registrar Falla";
    });
  }



const panelFallas = document.getElementById("panelFallas");

if (panelFallas) {
  panelFallas.addEventListener("click", async () => {

    const panel = document.getElementById("panelListaFallas");

    const estaOculto =
      panel.style.display === "none" || panel.style.display === "";

    if (estaOculto) {
      panel.style.display = "block";


      cargarFallas();

      panelFallas.textContent = "Ocultar registro de Fallas";

    } else {
      panel.style.display = "none";

      panelFallas.textContent = "Mostrar registro de Fallas";
    }
  });
}


  const btnInspeccion = document.getElementById("btnInspeccion");
  if (btnInspeccion) {
    btnInspeccion.addEventListener("click", async () => {

      const tabla = document.getElementById("tablaInspeccion");

      const estaOculto =
        tabla.style.display === "none" || tabla.style.display === "";

      if (estaOculto) {
        tabla.style.display = "block";
        btnInspeccion.textContent = "Ocultar inspecciones";

        await mostrarMaquinaEnInspeccion(); 

      } else {
        tabla.style.display = "none";
        btnInspeccion.textContent = "Registrar inspecciones";
      }
    });
  }


  const btnGuardarInspeccion = document.getElementById("btnGuardarInspeccion");
  if (btnGuardarInspeccion) {
    btnGuardarInspeccion.addEventListener("click", guardarTodo);
  }


  const btnVisualizar = document.getElementById("btnVisualizar");
  if (btnVisualizar) {
    btnVisualizar.addEventListener("click", async () => {

      const panel = document.getElementById("panelVisualizar");

      const estaOculto =
        panel.style.display === "none" || panel.style.display === "";

      if (estaOculto) {
        panel.style.display = "block";
        btnVisualizar.textContent = "Ocultar inspecciones";
        await buscarInspecciones();

      } else {
        panel.style.display = "none";
        btnVisualizar.textContent = "Visualizar inspecciones";
      }
    });
  }


  const btnBuscarInspecciones = document.getElementById("btnBuscarInspecciones");
  if (btnBuscarInspecciones) {
    btnBuscarInspecciones.addEventListener("click", buscarInspecciones);
  }



  const btnBuscarInspeccionesExterno = document.getElementById("btnBuscarInspeccionesExternas");
  if (btnBuscarInspeccionesExterno && document.getElementById("panelInspecciones")) {
    btnBuscarInspeccionesExterno.addEventListener("click", async () => {

    const panel = document.getElementById("panelInspecciones");

    const estaOculto =
      panel.style.display === "none" || panel.style.display === "";

    if (estaOculto) {
      panel.style.display = "block";
      btnBuscarInspeccionesExterno.textContent = "Ocultar inspecciones";

       await cargarInspeccionesExterno();

    } else {
      panel.style.display = "none";
      btnBuscarInspeccionesExterno.textContent = "Visualizar inspecciones";
    }

  });
}


const btnFiltrarInspecciones = document.getElementById("btnFiltrarInspecciones");

if (btnFiltrarInspecciones) {
  btnFiltrarInspecciones.addEventListener("click", async () => {
    await cargarInspeccionesExterno();
  });
}


const btnJefeInspecciones = document.getElementById("btnVisualizarInspeccionesJefe");

if (btnJefeInspecciones) {
  btnJefeInspecciones.addEventListener("click", async() => {

    const tabla = document.getElementById("tablaJefe");
    const panelFiltro = document.getElementById("panelFiltroJefe");

    const estaOculto =
      panelFiltro.style.display === "none" || panelFiltro.style.display === "";

    if (estaOculto) {

      panelFiltro.style.display = "block";
      tabla.style.display = "none"; 

      btnJefeInspecciones.textContent = "Ocultar inspecciones";
      await cargarInspeccionesJefe();

    } else {

      panelFiltro.style.display = "none";
      tabla.style.display = "none";

      btnJefeInspecciones.textContent = "Visualizar inspecciones";
    }
  });
}


const btnFiltrarJefe = document.getElementById("btnFiltrarJefe");

if (btnFiltrarJefe) {
  btnFiltrarJefe.addEventListener("click", async () => {

    const tabla = document.getElementById("tablaJefe");


    tabla.style.display = "table";


    await cargarInspeccionesJefe();
  });
}


const btnSolicitarMantencion = document.getElementById("btnSolicitarMantencion");

if (btnSolicitarMantencion) {
  btnSolicitarMantencion.addEventListener("click", async () => {

    const panel = document.getElementById("panelMantencion");

    const oculto = panel.style.display === "none" || panel.style.display === "";

    if (oculto) {
      panel.style.display = "block";


      await cargarSolicitudesMantencion();


      btnSolicitarMantencion.textContent = "Ocultar solicitudes de mantención";

    } else {
      panel.style.display = "none";


      btnSolicitarMantencion.textContent = "Solicitar mantención";
    }

  });
}


const btnGuardarMantencion = document.getElementById("btnGuardarMantencion");

if (btnGuardarMantencion) {
  btnGuardarMantencion.addEventListener("click", guardarSolicitudMantencion);
}


//filtro
const btnFiltrarMantencion = document.getElementById("btnFiltrarMantencion");

if (btnFiltrarMantencion) {
  btnFiltrarMantencion.addEventListener("click", () => {

    const filtroLocal = document
      .getElementById("filtroLocalMantencion")
      .value.toLowerCase().trim();

    const filtroMaquina = document
      .getElementById("filtroMaquinaMantencion")
      .value.toLowerCase().trim();

    const filtroFecha = document
      .getElementById("filtroFechaMantencion")
      .value.trim();

    const filas = document.querySelectorAll("#tablaMantencionBody tr");

    const mensaje = document.getElementById("mensajeMantencion");
    const tabla = document.querySelector("#panelMantencion table");

    let hayResultados = false;

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

      if (mostrar) hayResultados = true;
    });


    if (!hayResultados) {
      tabla.style.display = "none";
      mensaje.style.display = "block";
      mensaje.textContent = "Sin Resultados";
    } else {
      tabla.style.display = "table";
      mensaje.style.display = "none";
    }

  });
}



const btnMantencionTecnico = document.getElementById("btnToggleMantencionTecnico");

if (btnMantencionTecnico) {
  btnMantencionTecnico.addEventListener("click", async () => {

    const panel = document.getElementById("panelTecnicoMantencion");

    const oculto =
      panel.style.display === "none" || panel.style.display === "";

    if (oculto) {
      panel.style.display = "block";
      btnMantencionTecnico.textContent = "Ocultar peticiones";

      await cargarSolicitudesTecnico(); 

    } else {
      panel.style.display = "none";
      btnMantencionTecnico.textContent = "Ver peticiones de Mantencion";
    }

  });
}


//filtro 
const btnFiltrarTecnico = document.getElementById("btnFiltrarTecnico");

if (btnFiltrarTecnico) {
  btnFiltrarTecnico.addEventListener("click", () => {

    const fechaFiltro = document.getElementById("filtroFechaTecnico").value;

    const estadoFiltro = document
      .getElementById("filtroEstadoTecnico")
      .value
      .toLowerCase()
      .trim();

    const localFiltro = document
      .getElementById("filtroLocalTecnico")
      ?.value
      .toLowerCase()
      .trim();


    const filas = document.querySelectorAll("#tablaTecnicoBody tr");
    const mensaje = document.getElementById("mensajeBusquedaTecnico");
    const tabla = document.querySelector("#panelTecnicoMantencion table");

    let hayResultados = false;

    mensaje.style.display = "none";
    mensaje.textContent = "";

    filas.forEach(fila => {

      const fecha = fila.getAttribute("data-fecha");
      const estado = fila.getAttribute("data-estado");
      const local = fila.children[0].textContent.toLowerCase().trim();

      let mostrar = true;


      if (localFiltro && !local.includes(localFiltro)) {
        mostrar = false;
      }


      if (fechaFiltro && fecha !== fechaFiltro) {
        mostrar = false;
      }


      if (estadoFiltro && !estado.includes(estadoFiltro)) {
        mostrar = false;
      }

      fila.style.display = mostrar ? "" : "none";

      if (mostrar) hayResultados = true;
    });

    if (!hayResultados) {
      tabla.style.display = "none";
      mensaje.textContent = "No se encontraron solicitudes";
      mensaje.style.display = "block";
    } else {
      tabla.style.display = "table";
    }

  });
}



const btnRegistrarMant = document.getElementById("btnrealizarMantencionTecnico");

if (btnRegistrarMant) {
  btnRegistrarMant.addEventListener("click", async () => {

    const panel = document.getElementById("panelRegistrarMantencion");

    const oculto =
      panel.style.display === "none" || panel.style.display === "";

    if (oculto) {
      panel.style.display = "block";
      btnRegistrarMant.textContent = "Ocultar mantención";

      await cargarSolicitudesParaRegistrar();

    } else {
      panel.style.display = "none";
      btnRegistrarMant.textContent = "Registrar mantención";
    }

  });
}


const btnFiltrarRegistrar = document.getElementById("btnFiltrarRegistrar");

if (btnFiltrarRegistrar) {
  btnFiltrarRegistrar.addEventListener("click", filtrarMantencionesRegistrar);
}


const btnInspeccionesTecnico = document.getElementById("btnInspeccionesTecnico");

if (btnInspeccionesTecnico) {
  btnInspeccionesTecnico.addEventListener("click", async () => {

    const panel = document.getElementById("panelInspeccionesTecnico");

    const oculto =
      panel.style.display === "none" || panel.style.display === "";

    if (oculto) {
      panel.style.display = "block";
      btnInspeccionesTecnico.textContent = "Ocultar inspecciones";

      await cargarInspeccionesTecnico();

    } else {
      panel.style.display = "none";
      btnInspeccionesTecnico.textContent = "Visualizar inspecciones";
    }

  });
}


const btnEstadoMantencion = document.getElementById("btnEstadoMantencion");

if (btnEstadoMantencion) {
  btnEstadoMantencion.addEventListener("click", async () => {

    const panel = document.getElementById("panelMantencionRealizada");

    const oculto = panel.style.display === "none" || panel.style.display === "";

    if (oculto) {
      panel.style.display = "block";

      await cargarMantencionesRealizadasJefe();

      btnEstadoMantencion.textContent = "Ocultar estado de mantención";

    } else {
      panel.style.display = "none";

      btnEstadoMantencion.textContent = "Estado mantención";
    }

  });
}


const btnFiltrarMantReal = document.getElementById("btnFiltrarMantReal");

if (btnFiltrarMantReal) {
  btnFiltrarMantReal.addEventListener("click", filtrarMantencionesRealizadasJefe);
}


const btnEstadoMantencionTecnico = document.getElementById("btnEstadoMantencionTecnico");

if (btnEstadoMantencionTecnico) {
  btnEstadoMantencionTecnico.addEventListener("click", async () => {

    const panel = document.getElementById("panelEstadoMantencionTecnico");

    const oculto = panel.style.display === "none" || panel.style.display === "";

    if (oculto) {
      panel.style.display = "block";

      await cargarEstadoMantencionesTecnico();

      btnEstadoMantencionTecnico.textContent = "Ocultar estado de mantención";

    } else {
      panel.style.display = "none";

      btnEstadoMantencionTecnico.textContent = "Ver estado mantención";
    }

  });
}


const btnFiltrarEstadoMantTecnico = document.getElementById("btnFiltrarEstadoMantTecnico");

if (btnFiltrarEstadoMantTecnico) {
  btnFiltrarEstadoMantTecnico.addEventListener("click", filtrarEstadoMantencionTecnico);
}


const btnInspeccionAnalisis = document.getElementById("btnInspeccionAnalisis");

if (btnInspeccionAnalisis) {
  btnInspeccionAnalisis.addEventListener("click", async () => {

    const panel = document.getElementById("panelFallasAnalisis");

    const oculto =
      panel.style.display === "none" || panel.style.display === "";

    if (oculto) {
      panel.style.display = "block";
      await analizarFallasPorMaquina();
      btnInspeccionAnalisis.textContent = "Ocultar falla de maquinas";
    } else {
      panel.style.display = "none";
      btnInspeccionAnalisis.textContent = "Mostrar falla de maquinas";
    }

  });
}


const btnVisualizarAnalisis = document.getElementById("btnVisualizarAnalisis");

if (btnVisualizarAnalisis) {
  btnVisualizarAnalisis.addEventListener("click", async () => {

    const panel = document.getElementById("panelTiempoReparacion");

    const oculto =
      panel.style.display === "none" || panel.style.display === "";

    if (oculto) {
      panel.style.display = "block";

      await analizarTiempoReparacion();

      btnVisualizarAnalisis.textContent = "Ocultar Tiempo entre reparaciones";
    } else {
      panel.style.display = "none";

      btnVisualizarAnalisis.textContent = "Tiempo entre reparaciones";
    }

  });
}




const btnAnalisisFallas = document.getElementById("btnAnalisisFallas");


if (btnAnalisisFallas) {
  btnAnalisisFallas.addEventListener("click", async () => {

    const panel = document.getElementById("panelTiempoFallas");

    const oculto =
      panel.style.display === "none" || panel.style.display === "";

    if (oculto) {
      panel.style.display = "block";

      await analizarTiempoEntreFallas();

      btnAnalisisFallas.textContent = "Ocultar Tiempo entre fallas";
    } else {
      panel.style.display = "none";

      btnAnalisisFallas.textContent = "Tiempo entre fallas";
    }

  });
}


const btnPrioridad = document.getElementById("btnPrioridadAnalisis");

if (btnPrioridad) {
  btnPrioridad.addEventListener("click", async () => {

    const panel = document.getElementById("panelPrioridad");

    const oculto =
      panel.style.display === "none" || panel.style.display === "";

    if (oculto) {
      panel.style.display = "block";

      await analizarPrioridadMaquinas();

      btnPrioridad.textContent = "Ocultar Prioridad de maquinas";
    } else {
      panel.style.display = "none";

      btnPrioridad.textContent = "Prioridad de maquinas";
    }

  });
}



const btnResumen = document.getElementById("btnResumenAnalisis");

if (btnResumen) {
  btnResumen.addEventListener("click", async () => {

    const panel = document.getElementById("panelResumen");

    const oculto =
      panel.style.display === "none" || panel.style.display === "";

    if (oculto) {
      panel.style.display = "block";
      await cargarLocalesResumen();
      btnResumen.textContent = "Ocultar analisis de maquinas";
    } else {
      panel.style.display = "none";
      btnResumen.textContent = "Ver analisis de maquinas";
    }

  });
}


const selectLocal = document.getElementById("selectLocal");

if (selectLocal) {
  selectLocal.addEventListener("change", cargarMaquinasPorLocalResumen);
}


const btnVer = document.getElementById("btnVerResumenMaquina");

if (btnVer) {
  btnVer.addEventListener("click", verResumenMaquina);
}


const btnComparar = document.getElementById("btnComparar");

if (btnComparar) {
  btnComparar.addEventListener("click", async () => {

    await verResumenMaquina();
    await verResumenMaquina2();

  });
}






const btnVolver = document.getElementById("btnVolverInicioAnalisis");

if (btnVolver) {
  btnVolver.addEventListener("click", () => {

    const rol = localStorage.getItem("rol");

    if (rol === "operador") {
      window.location.href = "operador.html";
    } 
    else if (rol === "tecnico") {
      window.location.href = "tecnico.html";
    } 
    else if (rol === "jefe") {
      window.location.href = "jefe.html";
    } 
    else if (rol === "externo") {
      window.location.href = "externo.html";
    } 
    else {
      window.location.href = "index.html";
    }

  });
}

const btnIrAnalisisOperador = document.getElementById("btnAnalisisOperador");

if (btnIrAnalisisOperador) {
  btnIrAnalisisOperador.addEventListener("click", () => {
    window.open("analisis.html", "_blank");
  });
}


const btnIrAnalisisTecnico = document.getElementById("btnIrAnalisisTecnico");

if (btnIrAnalisisTecnico) {
  btnIrAnalisisTecnico.addEventListener("click", () => {
    window.open("analisis.html", "_blank");
  });
}



const btnIrAnalisisJefe = document.getElementById("btnIrAnalisisJefe");

if (btnIrAnalisisJefe) {
  btnIrAnalisisJefe.addEventListener("click", () => {
    window.open("analisis.html", "_blank");
  });
}



const btnIrAnalisisExterno = document.getElementById("btnIrAnalisisExterno");

if (btnIrAnalisisExterno) {
  btnIrAnalisisExterno.addEventListener("click", () => {
    window.open("analisis.html", "_blank");
    //window.location.href = "analisis.html";
  });
}


const btnVisualizarFallasJefe = document.getElementById("btnVisualizarFallasJefe");

if (btnVisualizarFallasJefe) {
  btnVisualizarFallasJefe.addEventListener("click", async () => {

    const panel = document.getElementById("panelFallasJefe");

    const oculto =
      panel.style.display === "none" || panel.style.display === "";

    if (oculto) {
      panel.style.display = "block";
      btnVisualizarFallasJefe.textContent = "Ocultar registro de Fallas";

      await cargarFallasJefe(); 

    } else {
      panel.style.display = "none";
      btnVisualizarFallasJefe.textContent = "Mostrar registro de Fallas";
    }

  });
}
const btnInfoDia = document.getElementById("btnInfoDia");

if (btnInfoDia) {
  btnInfoDia.addEventListener("click", () => {

    const panel = document.getElementById("panelInfoDia");

    const oculto =
      panel.style.display === "none" || panel.style.display === "";

    if (oculto) {
      panel.style.display = "block";
      btnInfoDia.textContent = "Ocultar información del día";
    } else {
      panel.style.display = "none";
      btnInfoDia.textContent = "Ver información del día";
    }

  });
}

const btnBuscarInfoDia = document.getElementById("btnBuscarInfoDia");

if (btnBuscarInfoDia) {
  btnBuscarInfoDia.addEventListener("click", obtenerInfoDia);
}


const inputLocalInfo = document.getElementById("infoLocal");

if (inputLocalInfo) {
  inputLocalInfo.addEventListener("input", cargarMaquinasInfoDia);
}



const btnInfoDiaExterno = document.getElementById("btnInfoDiaExterno");

if (btnInfoDiaExterno) {
  btnInfoDiaExterno.addEventListener("click", () => {

    const panel = document.getElementById("panelInfoDiaExterno");

    const oculto =
      panel.style.display === "none" || panel.style.display === "";

    if (oculto) {
      panel.style.display = "block";
      btnInfoDiaExterno.textContent = "Ocultar información del día";
    } else {
      panel.style.display = "none";
      btnInfoDiaExterno.textContent = "Ver información del día";
    }
  });
}



const btnBuscarInfoDiaExterno = document.getElementById("btnBuscarInfoDiaExterno");

if (btnBuscarInfoDiaExterno) {
  btnBuscarInfoDiaExterno.addEventListener("click", obtenerInfoDiaExterno);
}



const inputLocalExterno = document.getElementById("infoLocalExterno");

if (inputLocalExterno) {
  inputLocalExterno.addEventListener("input", cargarMaquinasInfoDiaExterno);
}



const inputLocalTecnico = document.getElementById("infoLocalTecnico");

if (inputLocalTecnico) {
  inputLocalTecnico.addEventListener("input", () => {
    cargarMaquinasInfoDiaTecnico();
  });
}


const btnVerInfoTecnico = document.getElementById("btnVerInformacionTecnico");

if (btnVerInfoTecnico) {
  btnVerInfoTecnico.addEventListener("click", obtenerInfoDiaTecnico);
}




const btnInfoDiaTecnico = document.getElementById("btnInfoDiaTecnico");

if (btnInfoDiaTecnico) {
  btnInfoDiaTecnico.addEventListener("click", () => {

    const panel = document.getElementById("panelInfoDiaTecnico");

    const oculto =
      panel.style.display === "none" || panel.style.display === "";

    if (oculto) {
      panel.style.display = "block";
      btnInfoDiaTecnico.textContent = "Ocultar información del día";
    } else {
      panel.style.display = "none";
      btnInfoDiaTecnico.textContent = "Información del día";
    }

  });
}



const btnInfoDiaJefe = document.getElementById("btnInfoDiaJefe");

if (btnInfoDiaJefe) {
  btnInfoDiaJefe.addEventListener("click", () => {

    const panel = document.getElementById("panelInfoDiaJefe");

    const oculto =
      panel.style.display === "none" || panel.style.display === "";

    if (oculto) {
      panel.style.display = "block";
      btnInfoDiaJefe.textContent = "Ocultar información del día";
    } else {
      panel.style.display = "none";
      btnInfoDiaJefe.textContent = "Información del día";
    }

  });
}


const inputLocalJefe = document.getElementById("infoLocalJefe");

if (inputLocalJefe) {
  inputLocalJefe.addEventListener("input", cargarMaquinasInfoDiaJefe);
}

const btnVerInfoJefe = document.getElementById("btnVerInformacionJefe");

if (btnVerInfoJefe) {
  btnVerInfoJefe.addEventListener("click", obtenerInfoDiaJefe);
}

const btnFiltrar = document.getElementById("btnFiltrarFallasAnalisis");

if (btnFiltrar) {
  btnFiltrar.addEventListener("click", filtrarFallasAnalisis);
}


const btnFiltrarTiempo = document.getElementById("btnFiltrarTiempo");

if (btnFiltrarTiempo) {
  btnFiltrarTiempo.addEventListener("click", filtrarTiempoReparacion);
}


const btnFiltrarTiempoFallas = document.getElementById("btnFiltrarTiempoFallas");

if (btnFiltrarTiempoFallas) {
  btnFiltrarTiempoFallas.addEventListener("click", filtrarTiempoFallas);
}


const btnFiltrarPrioridad = document.getElementById("btnFiltrarPrioridad");

if (btnFiltrarPrioridad) {
  btnFiltrarPrioridad.addEventListener("click", filtrarPrioridadAnalisis);
}



  window.editarMaquina = editarMaquina;
  window.eliminarMaquina = eliminarMaquina;
  window.guardarTodo = guardarTodo;
  window.descontinuarMaquina = descontinuarMaquina;
  window.reactivarMaquina = reactivarMaquina;


  window.editarFallaExterno = editarFallaExterno;
  window.guardarEdicionFalla = guardarEdicionFalla;
  window.cancelarEdicionFalla = cancelarEdicionFalla;
  window.eliminarFalla = eliminarFalla;


  window.editarInspeccion = editarInspeccion;
  window.eliminarInspeccion = eliminarInspeccion;
  window.guardarEdicionInspeccion = guardarEdicionInspeccion;
  window.cancelarEdicionInspeccion = cancelarEdicionInspeccion;
});