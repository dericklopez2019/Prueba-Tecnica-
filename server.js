import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PUERTO = Number(process.env.PORT) || 3000;
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function responder(res, codigo, cuerpo, tipo = 'text/plain; charset=utf-8') {
  res.writeHead(codigo, { 'Content-Type': tipo, 'Cache-Control': 'no-store' });
  res.end(cuerpo);
}

const servidor = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const ruta = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
  const archivo = path.normalize(path.join(RAIZ, ruta));

  if (!archivo.startsWith(RAIZ)) {
    return responder(res, 403, 'Acceso denegado');
  }

  fs.readFile(archivo, (err, datos) => {
    if (err) {
      return responder(res, 404, `No encontrado: ${ruta}`);
    }
    const tipo = MIME[path.extname(archivo)] || 'application/octet-stream';
    responder(res, 200, datos, tipo);
  });
});

servidor.listen(PUERTO, () => {
  console.log(`CRM de prueba corriendo en http://localhost:${PUERTO}`);
});
