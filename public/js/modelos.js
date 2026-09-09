// Modelo de datos del CRM.
// Aquí se definen las entidades y las reglas para construirlas.

export const LIMITES = {
  NOMBRE: 15,
  CONTACTO: 100,
  TITULO: 80,
};

export const ETAPAS = ['Prospecto', 'Propuesta', 'Negociación', 'Ganada', 'Perdida'];

export function generarId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function recortar(texto, maximo) {
  return String(texto ?? '').trim().slice(0, maximo);
}

export function normalizarCliente(cliente) {
  return {
    ...cliente,
    nombre: recortar(cliente.nombre, LIMITES.NOMBRE),
    contacto: recortar(cliente.contacto, LIMITES.CONTACTO),
  };
}

export function crearCliente({ nombre, contacto }) {
  return normalizarCliente({
    id: generarId(),
    nombre,
    contacto,
    creadoEn: new Date().toISOString(),
  });
}

export function validarCliente(cliente) {
  const errores = [];
  if (!cliente.nombre) errores.push('El nombre es obligatorio.');
  if (!cliente.contacto) errores.push('El contacto es obligatorio.');
  return errores;
}

export function normalizarOportunidad(oportunidad) {
  const monto = Number(oportunidad.monto);

  const historial = Array.isArray(oportunidad.historial) 
    ? oportunidad.historial 
    : [{ etapa: oportunidad.etapa || ETAPAS[0], fecha: oportunidad.creadoEn || new Date().toISOString() }];

  return {
    ...oportunidad,
    titulo: recortar(oportunidad.titulo, LIMITES.TITULO),
    monto: Number.isFinite(monto) && monto >= 0 ? monto : 0,
    etapa: ETAPAS.includes(oportunidad.etapa) ? oportunidad.etapa : ETAPAS[0],
    historial
  };
}

export function crearOportunidad({ clienteId, titulo, monto, etapa }) {
  return normalizarOportunidad({
    id: generarId(),
    clienteId,
    titulo,
    monto,
    etapa,
    creadoEn: new Date().toISOString(),
  });
}

export function validarOportunidad(oportunidad) {
  const errores = [];
  if (!oportunidad.clienteId) errores.push('La oportunidad debe pertenecer a un cliente.');
  if (!oportunidad.titulo) errores.push('El título es obligatorio.');
  return errores;
}
