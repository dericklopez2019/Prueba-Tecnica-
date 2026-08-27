// Persistencia en localStorage. No hay base de datos ni archivos:
// todo vive en el navegador del usuario.

const CLAVES = {
  clientes: 'crm.clientes',
  oportunidades: 'crm.oportunidades',
};

function leer(clave) {
  try {
    const crudo = localStorage.getItem(clave);
    return crudo ? JSON.parse(crudo) : [];
  } catch {
    console.warn(`No se pudo leer "${clave}", se reinicia la colección.`);
    return [];
  }
}

function escribir(clave, coleccion) {
  localStorage.setItem(clave, JSON.stringify(coleccion));
}

export const almacen = {
  listarClientes: () => leer(CLAVES.clientes),
  listarOportunidades: () => leer(CLAVES.oportunidades),

  guardarCliente(cliente) {
    const clientes = leer(CLAVES.clientes);
    const indice = clientes.findIndex((c) => c.id === cliente.id);
    if (indice === -1) clientes.push(cliente);
    else clientes[indice] = cliente;
    escribir(CLAVES.clientes, clientes);
  },

  eliminarCliente(id) {
    escribir(CLAVES.clientes, leer(CLAVES.clientes).filter((c) => c.id !== id));
    escribir(CLAVES.oportunidades, leer(CLAVES.oportunidades).filter((o) => o.clienteId !== id));
  },

  guardarOportunidad(oportunidad) {
    const oportunidades = leer(CLAVES.oportunidades);
    const indice = oportunidades.findIndex((o) => o.id === oportunidad.id);
    if (indice === -1) oportunidades.push(oportunidad);
    else oportunidades[indice] = oportunidad;
    escribir(CLAVES.oportunidades, oportunidades);
  },

  eliminarOportunidad(id) {
    escribir(CLAVES.oportunidades, leer(CLAVES.oportunidades).filter((o) => o.id !== id));
  },

  reiniciar() {
    localStorage.removeItem(CLAVES.clientes);
    localStorage.removeItem(CLAVES.oportunidades);
  },
};

// Datos de ejemplo para que la aplicación no arranque vacía.
export function sembrarDatosIniciales() {
  if (leer(CLAVES.clientes).length > 0) return;

  const clientes = [
    { id: 'c-001', nombre: 'María Fernanda Hernández López', contacto: 'mfhernandez@correo.gt', creadoEn: '2026-06-02T14:10:00.000Z' },
    { id: 'c-002', nombre: 'Distribuidora El Quetzal Dorado, S.A.', contacto: '+502 2334 5566', creadoEn: '2026-06-15T09:30:00.000Z' },
    { id: 'c-003', nombre: 'Jorge Luis Mérida Castañeda', contacto: 'jlmerida@empresa.com', creadoEn: '2026-07-01T16:45:00.000Z' },
  ];

  const oportunidades = [
    { id: 'o-001', clienteId: 'c-001', titulo: 'Sitio web institucional', monto: 12000, etapa: 'Propuesta', creadoEn: '2026-06-03T10:00:00.000Z' },
    { id: 'o-002', clienteId: 'c-002', titulo: 'Sistema de inventario', monto: 45000, etapa: 'Negociación', creadoEn: '2026-06-20T11:20:00.000Z' },
    { id: 'o-003', clienteId: 'c-002', titulo: 'Soporte mensual', monto: 3500, etapa: 'Ganada', creadoEn: '2026-07-05T08:00:00.000Z' },
    { id: 'o-004', clienteId: 'c-003', titulo: 'Aplicación móvil de pedidos', monto: 30000, etapa: 'Prospecto', creadoEn: '2026-07-10T15:30:00.000Z' },
  ];

  escribir(CLAVES.clientes, clientes);
  escribir(CLAVES.oportunidades, oportunidades);
}
