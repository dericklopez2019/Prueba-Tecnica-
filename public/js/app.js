import { almacen, sembrarDatosIniciales } from './almacen.js';
import {
  ETAPAS,
  crearCliente,
  crearOportunidad,
  normalizarCliente,
  normalizarOportunidad,
  validarCliente,
  validarOportunidad,
} from './modelos.js';

const estado = {
  clienteSeleccionadoId: null,
  clienteEnEdicionId: null,
  oportunidadEnEdicionId: null,
  busquedaCliente: '',
  paginaCliente: 1,
};

const CLIENTES_POR_PAGINA = 5;

const $ = (selector) => document.querySelector(selector);

const formatoMoneda = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' });
const formatoFecha = new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium' });

function escapar(texto) {
  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// ---------- Clientes ----------

function renderizarClientes() {
  const todosLosClientes = almacen.listarClientes();
  const oportunidades = almacen.listarOportunidades();
  const lista = $('#lista-clientes');
  const paginacion = $('#paginacion-clientes');

  const termino = estado.busquedaCliente.toLowerCase();
  const clientesFiltrados = termino
    ? todosLosClientes.filter(c => 
        c.nombre.toLowerCase().includes(termino) || 
        c.contacto.toLowerCase().includes(termino)
      )
    : todosLosClientes;

  $('#contador-clientes').textContent = `${clientesFiltrados.length} cliente${clientesFiltrados.length === 1 ? '' : 's'}`;

  if (clientesFiltrados.length === 0) {
    lista.innerHTML = `<li class="vacio">${termino ? 'No hay resultados para tu búsqueda.' : 'Aún no hay clientes. Registra el primero.'}</li>`;
    paginacion.innerHTML = '';
    return;
  }

  const totalPaginas = Math.ceil(clientesFiltrados.length / CLIENTES_POR_PAGINA);
  if (estado.paginaCliente > totalPaginas) estado.paginaCliente = totalPaginas;
  if (estado.paginaCliente < 1) estado.paginaCliente = 1;

  const inicio = (estado.paginaCliente - 1) * CLIENTES_POR_PAGINA;
  const clientesPagina = clientesFiltrados.slice(inicio, inicio + CLIENTES_POR_PAGINA);

  lista.innerHTML = clientesPagina
    .map((cliente) => {
      const total = oportunidades.filter((o) => o.clienteId === cliente.id).length;
      const activo = cliente.id === estado.clienteSeleccionadoId ? 'activo' : '';
      return `
        <li>
          <button type="button" class="cliente ${activo}" data-id="${cliente.id}">
            <span class="cliente-nombre">${escapar(cliente.nombre)}</span>
            <span class="cliente-contacto">${escapar(cliente.contacto)}</span>
            <span class="cliente-meta">${total} oportunidad${total === 1 ? '' : 'es'}</span>
          </button>
        </li>`;
    })
    .join('');

  if (totalPaginas > 1) {
    paginacion.innerHTML = `
      <button type="button" id="btn-prev-pagina" class="enlace" ${estado.paginaCliente === 1 ? 'disabled style="color: var(--texto-suave); text-decoration: none; cursor: default;"' : ''}>Anterior</button>
      <span>Pág. ${estado.paginaCliente} de ${totalPaginas}</span>
      <button type="button" id="btn-next-pagina" class="enlace" ${estado.paginaCliente === totalPaginas ? 'disabled style="color: var(--texto-suave); text-decoration: none; cursor: default;"' : ''}>Siguiente</button>
    `;
  } else {
    paginacion.innerHTML = '';
  }
}

function manejarFormularioCliente(evento) {
  evento.preventDefault();
  const formulario = evento.currentTarget;
  const datos = Object.fromEntries(new FormData(formulario));
  const cliente = estado.clienteEnEdicionId
    ? normalizarCliente({ ...almacen.listarClientes().find((c) => c.id === estado.clienteEnEdicionId), ...datos })
    : crearCliente(datos);

  const errores = validarCliente(cliente);
  if (errores.length > 0) {
    mostrarErrores(formulario, errores);
    return;
  }

  almacen.guardarCliente(cliente);
  estado.clienteSeleccionadoId = cliente.id;
  estado.clienteEnEdicionId = null;
  formulario.reset();
  mostrarErrores(formulario, []);
  $('#titulo-form-cliente').textContent = 'Nuevo cliente';
  $('#cancelar-edicion').hidden = true;
  renderizar();
}

function iniciarEdicionCliente(cliente) {
  estado.clienteEnEdicionId = cliente.id;
  const formulario = $('#form-cliente');
  formulario.elements.nombre.value = cliente.nombre;
  formulario.elements.contacto.value = cliente.contacto;
  $('#titulo-form-cliente').textContent = 'Editar cliente';
  $('#cancelar-edicion').hidden = false;
  formulario.elements.nombre.focus();
}

function cancelarEdicionCliente() {
  estado.clienteEnEdicionId = null;
  const formulario = $('#form-cliente');
  formulario.reset();
  mostrarErrores(formulario, []);
  $('#titulo-form-cliente').textContent = 'Nuevo cliente';
  $('#cancelar-edicion').hidden = true;
}

// ---------- Detalle y oportunidades ----------

function renderizarDetalle() {
  const panel = $('#detalle');
  const cliente = almacen.listarClientes().find((c) => c.id === estado.clienteSeleccionadoId);

  if (!cliente) {
    estado.clienteSeleccionadoId = null;
    panel.innerHTML = '<p class="vacio">Selecciona un cliente para ver sus oportunidades.</p>';
    return;
  }

  const oportunidades = almacen
    .listarOportunidades()
    .filter((o) => o.clienteId === cliente.id)
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));

  const totalAbierto = oportunidades
    .filter((o) => !['Ganada', 'Perdida'].includes(o.etapa))
    .reduce((suma, o) => suma + o.monto, 0);

  const opcionesEtapa = (seleccionada) =>
    ETAPAS.map((e) => `<option value="${e}" ${e === seleccionada ? 'selected' : ''}>${e}</option>`).join('');

  const filas = oportunidades.length
    ? oportunidades
        .map(
          (o) => `
          <tr data-id="${o.id}">
            <td>${escapar(o.titulo)}</td>
            <td class="numero">${formatoMoneda.format(o.monto)}</td>
            <td><select class="cambiar-etapa" aria-label="Etapa">${opcionesEtapa(o.etapa)}</select></td>
            <td>
              ${formatoFecha.format(new Date(o.creadoEn))}
              <br>
              <button type="button" class="ver-historial enlace" style="font-size: 0.8rem; margin-top: 4px;">Historial</button>
            </td>
            <td>
              <button type="button" class="editar-oportunidad enlace">Editar</button>
              <button type="button" class="eliminar-oportunidad enlace">Eliminar</button>
            </td>
          </tr>`,
        )
        .join('')
    : '<tr><td colspan="5" class="vacio">Este cliente aún no tiene oportunidades.</td></tr>';

  panel.innerHTML = `
    <header class="detalle-encabezado">
      <div>
        <h2>${escapar(cliente.nombre)}</h2>
        <p class="detalle-contacto">${escapar(cliente.contacto)} · Cliente desde ${formatoFecha.format(new Date(cliente.creadoEn))}</p>
      </div>
      <div class="acciones">
        <button type="button" id="editar-cliente" class="secundario">Editar</button>
        <button type="button" id="eliminar-cliente" class="peligro">Eliminar cliente</button>
      </div>
    </header>

    <p class="resumen">Pipeline abierto: <strong>${formatoMoneda.format(totalAbierto)}</strong></p>

    <table class="oportunidades">
      <thead>
        <tr><th>Oportunidad</th><th class="numero">Monto</th><th>Etapa</th><th>Creada</th><th>Acciones</th></tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>

    <form id="form-oportunidad" class="formulario en-linea" novalidate>
      <h3 id="titulo-form-oportunidad">Nueva oportunidad</h3>
      <label>Título <input name="titulo" maxlength="80" required></label>
      <label>Monto (GTQ) <input name="monto" type="number" min="0" step="0.01" value="0"></label>
      <label>Etapa <select name="etapa">${opcionesEtapa(ETAPAS[0])}</select></label>
      <div style="display: flex; gap: 0.5rem;">
        <button type="submit" id="btn-guardar-oportunidad">Agregar</button>
        <button type="button" id="btn-cancelar-oportunidad" class="secundario" hidden>Cancelar</button>
      </div>
      <ul class="errores" hidden></ul>
    </form>

    <div id="contenedor-historial" style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--borde);" hidden>
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1rem;">
        <h3 id="titulo-historial" style="margin: 0;">Historial de etapas</h3>
        <button type="button" id="cerrar-historial" class="enlace">Ocultar</button>
      </div>
      <ul id="lista-historial" class="historial-timeline"></ul>
    </div>`;

  $('#editar-cliente').addEventListener('click', () => iniciarEdicionCliente(cliente));
  $('#eliminar-cliente').addEventListener('click', () => {
    if (confirm(`¿Eliminar a "${cliente.nombre}" y todas sus oportunidades?`)) {
      almacen.eliminarCliente(cliente.id);
      estado.clienteSeleccionadoId = null;
      renderizar();
    }
  });
  $('#form-oportunidad').addEventListener('submit', manejarFormularioOportunidad);
}

function manejarFormularioOportunidad(evento) {
  evento.preventDefault();
  const formulario = evento.currentTarget;
  const datos = Object.fromEntries(new FormData(formulario));
  
  let oportunidad;
  if (estado.oportunidadEnEdicionId) {
    const existente = almacen.listarOportunidades().find((o) => o.id === estado.oportunidadEnEdicionId);
    oportunidad = normalizarOportunidad({ ...existente, ...datos });
  } else {
    oportunidad = crearOportunidad({ ...datos, clienteId: estado.clienteSeleccionadoId });
  }

  const errores = validarOportunidad(oportunidad);
  if (errores.length > 0) {
    mostrarErrores(formulario, errores);
    return;
  }

  almacen.guardarOportunidad(oportunidad);
  estado.oportunidadEnEdicionId = null;
  renderizar();
}

function manejarCambioEtapa(evento) {
  const select = evento.target.closest('.cambiar-etapa');
  if (!select) return;
  const id = select.closest('tr').dataset.id;
  const oportunidad = almacen.listarOportunidades().find((o) => o.id === id);
  if (!oportunidad) return;

  const nuevaEtapa = select.value;
  if (oportunidad.etapa !== nuevaEtapa) {
    oportunidad.etapa = nuevaEtapa;
    
    if (!oportunidad.historial) oportunidad.historial = [];
    oportunidad.historial.push({ etapa: nuevaEtapa, fecha: new Date().toISOString() });
    
    almacen.guardarOportunidad(normalizarOportunidad(oportunidad));
    renderizarDetalle();
  }
}

function manejarClicsDetalle(evento) {
  if (evento.target.closest('.editar-oportunidad')) {
    manejarEditarOportunidad(evento);
  } else if (evento.target.closest('.eliminar-oportunidad')) {
    manejarConfirmarEliminarOportunidad(evento);
  } else if (evento.target.closest('#btn-cancelar-oportunidad')) {
    cancelarEdicionOportunidad();
  } else if (evento.target.closest('.ver-historial')) {
    manejarVerHistorial(evento);
  } else if (evento.target.closest('#cerrar-historial')) {
    $('#contenedor-historial').hidden = true;
  }
}

function manejarVerHistorial(evento) {
  const boton = evento.target.closest('.ver-historial');
  if (!boton) return;
  
  const id = boton.closest('tr').dataset.id;
  const oportunidad = almacen.listarOportunidades().find((o) => o.id === id);
  if (!oportunidad) return;

  const contenedor = $('#contenedor-historial');
  const lista = $('#lista-historial');
  const titulo = $('#titulo-historial');
  const formatoFechaHora = new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium', timeStyle: 'short' });

  const historial = oportunidad.historial && oportunidad.historial.length > 0 
    ? [...oportunidad.historial] 
    : [{ etapa: oportunidad.etapa, fecha: oportunidad.creadoEn }];

  const historialOrdenado = historial.reverse();

  titulo.textContent = `Historial: ${escapar(oportunidad.titulo)}`;

  lista.innerHTML = historialOrdenado.map(h => `
    <li>
      <strong>${escapar(h.etapa)}</strong>
      <span class="fecha">${formatoFechaHora.format(new Date(h.fecha))}</span>
    </li>
  `).join('');

  contenedor.hidden = false;
  contenedor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function manejarEditarOportunidad(evento) {
  const boton = evento.target.closest('.editar-oportunidad');
  if (!boton) return;
  
  const idOportunidad = boton.closest('tr').dataset.id;
  iniciarEdicionOportunidad(idOportunidad);
}

function iniciarEdicionOportunidad(id) {
  estado.oportunidadEnEdicionId = id;
  const oportunidad = almacen.listarOportunidades().find((o) => o.id === id);
  if (!oportunidad) return;

  const formulario = $('#form-oportunidad');
  formulario.elements.titulo.value = oportunidad.titulo;
  formulario.elements.monto.value = oportunidad.monto;
  formulario.elements.etapa.value = oportunidad.etapa;
  
  $('#titulo-form-oportunidad').textContent = 'Editar oportunidad';
  $('#btn-guardar-oportunidad').textContent = 'Guardar';
  $('#btn-cancelar-oportunidad').hidden = false;
  
  formulario.elements.titulo.focus();
}

function cancelarEdicionOportunidad() {
  estado.oportunidadEnEdicionId = null;
  renderizarDetalle();
}

function manejarConfirmarEliminarOportunidad(evento) {
  const boton = evento.target.closest('.eliminar-oportunidad');
  if (!boton) return;
  
  const fila = boton.closest('tr');
  const idOportunidad = fila.dataset.id;
  const tituloOportunidad = fila.querySelector('td').textContent;
  
  if (confirm(`¿Estás seguro de eliminar la oportunidad "${tituloOportunidad}"?`)) {
    almacen.eliminarOportunidad(idOportunidad);
    renderizar(); 
  }
}

// ---------- Utilidades ----------

function mostrarErrores(formulario, errores) {
  const lista = formulario.querySelector('.errores');
  lista.hidden = errores.length === 0;
  lista.innerHTML = errores.map((e) => `<li>${escapar(e)}</li>`).join('');
}

function renderizar() {
  renderizarClientes();
  renderizarDetalle();
}

function iniciar() {
  sembrarDatosIniciales();

  $('#form-cliente').addEventListener('submit', manejarFormularioCliente);
  $('#cancelar-edicion').addEventListener('click', cancelarEdicionCliente);

  $('#lista-clientes').addEventListener('click', (evento) => {
    const boton = evento.target.closest('.cliente');
    if (!boton) return;
    estado.clienteSeleccionadoId = boton.dataset.id;
    renderizar();
  });

  $('#detalle').addEventListener('change', manejarCambioEtapa);
  
  $('#detalle').addEventListener('click', manejarClicsDetalle);

  $('#reiniciar-datos').addEventListener('click', () => {
    if (confirm('Esto borra todos los datos guardados en este navegador y vuelve a cargar los de ejemplo. ¿Continuar?')) {
      almacen.reiniciar();
      estado.clienteSeleccionadoId = null;
      cancelarEdicionCliente();
      sembrarDatosIniciales();
      renderizar();
    }
  });

  $('#buscar-cliente').addEventListener('input', (evento) => {
    estado.busquedaCliente = evento.target.value;
    estado.paginaCliente = 1;
    renderizar();
  });
  $('#paginacion-clientes').addEventListener('click', (evento) => {
    if (evento.target.closest('#btn-prev-pagina')) {
      estado.paginaCliente--;
      renderizar();
    } else if (evento.target.closest('#btn-next-pagina')) {
      estado.paginaCliente++;
      renderizar();
    }
  });

  renderizar();
}

iniciar();
