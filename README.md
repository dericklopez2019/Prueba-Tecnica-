# CRM básico — Prueba técnica

Aplicación web mínima para registrar clientes y sus oportunidades de venta. Está escrita en JavaScript sin frameworks ni dependencias externas. No usa base de datos ni escribe archivos: toda la información se guarda en el `localStorage` del navegador.

## Requisitos

- Node.js 18 o superior (solo se usa para servir los archivos estáticos).
- Un navegador moderno (Chrome, Edge o Firefox actualizados).

## Cómo ejecutar

```bash
node server.js
```

Luego abre `http://localhost:3000`. Para usar otro puerto: `PORT=8080 node server.js`.

La primera vez se cargan tres clientes de ejemplo. El botón **Restablecer datos de ejemplo** borra todo lo guardado en el navegador y vuelve a cargarlos.

## Estructura

```
server.js            Servidor HTTP estático (sin dependencias)
public/
  index.html         Página principal
  styles.css         Estilos
  js/
    app.js           Interfaz: renderizado, formularios y eventos
    modelos.js       Entidades (cliente, oportunidad), límites y validaciones
    almacen.js       Lectura y escritura en localStorage, datos de ejemplo
```

## Funcionalidad actual

- Registrar, editar y eliminar clientes (nombre y contacto).
- Registrar oportunidades por cliente con título, monto y etapa.
- Cambiar la etapa de una oportunidad y eliminarla.
- Resumen del monto abierto (oportunidades que no están ganadas ni perdidas).

## Entrega de la parte offline

1. Crea tu propio repositorio a partir de este código (conserva el historial).
2. Haz commits pequeños con mensajes descriptivos.
4. Actualiza este README con una sección **Notas de la entrega**: qué implementaste, decisiones que tomaste, qué dejaste fuera y por qué.
5. Si usaste herramientas de IA, indícalo en esa misma sección. No penaliza; nos interesa saber cómo trabajas.
6. Comparte el enlace al repositorio (público o con acceso al evaluador).

No agregues dependencias ni frameworks. El objetivo es evaluar tu criterio con JavaScript, HTML y CSS.

##  Notas de la entrega 

Implementaciones:
1. Editar las Oportunidades
2. Mensajes de confirmacion para eliminar datos
3. Historial de registros en las etapas de Oportunidades
4. Filtro de busquedas en los datos
5. Paginacion en los datos∫

Estas decisiones las tome conforme a mi experiencia al momento de obtener los datos y mostrarlos.
El tener mensajes de confirmación ayuda al usuario a no cometer errores en eliminar datos que no quiera eliminar.
Deje afuera trabajar por componentes y paginas ya que todo esta en una sola pagina.
Utilice IA para auto completar código en algunas partes para tener una mejor idea de como mostrar la información correctamente, También la utilice para poder comprender unas partes del código respecto a como estaba estructurado el html en los .js.
