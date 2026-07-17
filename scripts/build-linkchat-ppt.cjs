const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'German Panduro - LinkChat';
pptx.company = 'Sistemas Distribuidos';
pptx.subject = 'LinkChat - sistema distribuido de chat en tiempo real';
pptx.title = 'LinkChat - Sistemas Distribuidos';
pptx.lang = 'es-PE';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'es-PE'
};
pptx.defineLayout({ name: 'CUSTOM_WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'CUSTOM_WIDE';
pptx.margin = 0;
pptx.defineSlideMaster({
  title: 'BLANK',
  background: { color: 'FFFFFF' },
  objects: []
});

const C = {
  navy: '101827',
  ink: '172033',
  slate: '2A3447',
  white: 'FFFFFF',
  soft: 'F5F7FB',
  muted: '6B7280',
  blue: '2F80ED',
  cyan: '22C1DC',
  green: '18B87A',
  purple: '7C3AED',
  yellow: 'F4B740',
  orange: 'F97316',
  red: 'EF4444',
  line: 'D9E1EC'
};

const deckPath = path.join('deliverables', 'LinkChat_Sistemas_Distribuidos.pptx');
const notesPath = path.join('deliverables', 'guion_exposicion_linkchat.md');

function slide(bg = C.white) {
  const s = pptx.addSlide('BLANK');
  s.background = { color: bg };
  return s;
}

function addTitle(s, text, color = C.ink, y = 0.42, size = 34) {
  s.addText(text, {
    x: 0.55, y, w: 8.6, h: 0.48,
    fontFace: 'Aptos Display', fontSize: size, bold: true,
    color, margin: 0, breakLine: false, fit: 'shrink'
  });
}

function addKicker(s, text, color = C.blue, y = 0.22) {
  s.addText(text.toUpperCase(), {
    x: 0.58, y, w: 5.8, h: 0.22,
    fontSize: 8.8, bold: true, color, charSpace: 1.1,
    margin: 0, breakLine: false
  });
}

function addFooter(s, n, dark = false) {
  s.addText('LinkChat | Sistemas Distribuidos', {
    x: 0.55, y: 7.12, w: 4, h: 0.18,
    fontSize: 8.5, color: dark ? 'B8C2D6' : C.muted, margin: 0
  });
  s.addText(String(n).padStart(2, '0'), {
    x: 12.15, y: 7.05, w: 0.45, h: 0.24,
    fontSize: 10, bold: true, color: dark ? C.white : C.ink, align: 'right', margin: 0
  });
}

function rect(s, x, y, w, h, fill, line = fill, radius = 0.08) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: radius,
    fill: { color: fill },
    line: { color: line, transparency: line === fill ? 100 : 0, width: 1 }
  });
}

function card(s, x, y, w, h, fill = C.white, line = C.line) {
  rect(s, x, y, w, h, fill, line, 0.08);
}

function circle(s, x, y, d, fill, line = fill) {
  s.addShape(pptx.ShapeType.ellipse, {
    x, y, w: d, h: d,
    fill: { color: fill },
    line: { color: line, transparency: line === fill ? 100 : 0 }
  });
}

function line(s, x, y, w, h, color = C.line, width = 2, arrow = false) {
  s.addShape(pptx.ShapeType.line, {
    x, y, w, h,
    line: { color, width, beginArrowType: 'none', endArrowType: arrow ? 'triangle' : 'none' }
  });
}

function label(s, text, x, y, w, h, opts = {}) {
  s.addText(text, {
    x, y, w, h,
    fontFace: opts.fontFace || 'Aptos',
    fontSize: opts.size || 15,
    bold: !!opts.bold,
    color: opts.color || C.ink,
    margin: opts.margin ?? 0.06,
    align: opts.align || 'left',
    valign: opts.valign || 'top',
    fit: 'shrink',
    breakLine: false
  });
}

function bullet(s, text, x, y, color = C.ink, accent = C.blue) {
  circle(s, x, y + 0.08, 0.12, accent);
  label(s, text, x + 0.22, y, 4.7, 0.36, { size: 14.5, color });
}

function note(s, text) {
  if (typeof s.addNotes === 'function') s.addNotes(text);
}

function chatMockup(s, x, y, w, h) {
  card(s, x, y, w, h, '151B2A', '2A3447');
  rect(s, x, y, w, 0.55, '20283A', '20283A');
  circle(s, x + 0.22, y + 0.2, 0.13, C.red);
  circle(s, x + 0.42, y + 0.2, 0.13, C.yellow);
  circle(s, x + 0.62, y + 0.2, 0.13, C.green);
  label(s, '# general', x + 0.9, y + 0.17, 2.3, 0.22, { size: 10, bold: true, color: C.white });
  const rows = [
    ['G', 'German', 'Listo, backend conectado a MongoDB Atlas', C.green],
    ['I', 'Ian', 'Recibi el mensaje en tiempo real', C.blue],
    ['S', 'Sistema', 'Ian se ha unido al canal', C.purple]
  ];
  rows.forEach((r, i) => {
    const yy = y + 0.88 + i * 0.72;
    circle(s, x + 0.28, yy, 0.34, r[3]);
    label(s, r[0], x + 0.38, yy + 0.08, 0.14, 0.16, { size: 8, bold: true, color: C.white, align: 'center' });
    label(s, r[1], x + 0.78, yy - 0.02, 1.2, 0.2, { size: 9.2, bold: true, color: C.white });
    label(s, r[2], x + 0.78, yy + 0.22, w - 1.2, 0.24, { size: 8.6, color: 'CED8EA' });
  });
  rect(s, x + 0.35, y + h - 0.65, w - 0.7, 0.34, '0F1420', '334155');
  label(s, 'Escribir mensaje...', x + 0.55, y + h - 0.57, 2.2, 0.18, { size: 8.3, color: '9CA3AF' });
}

function cloud(s, x, y, labelText) {
  circle(s, x + 0.18, y + 0.18, 0.48, C.cyan);
  circle(s, x + 0.55, y, 0.72, C.cyan);
  circle(s, x + 1.05, y + 0.2, 0.48, C.cyan);
  rect(s, x + 0.18, y + 0.42, 1.35, 0.38, C.cyan, C.cyan);
  label(s, labelText, x - 0.05, y + 0.95, 1.9, 0.22, { size: 10.5, bold: true, color: C.ink, align: 'center' });
}

// Slide 1
{
  const s = slide(C.navy);
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: C.navy }, line: { transparency: 100 } });
  circle(s, 10.8, -0.35, 3.0, '263B70');
  circle(s, 9.4, 5.7, 1.3, '1C7C67');
  line(s, 8.45, 1.35, 1.9, 1.05, C.cyan, 2.2, true);
  line(s, 9.1, 3.7, 1.4, -1.05, C.purple, 2.2, true);
  addKicker(s, 'Proyecto de Sistemas Distribuidos', C.cyan, 0.75);
  label(s, 'LinkChat', 0.75, 1.15, 5.6, 0.72, { size: 48, bold: true, color: C.white, fontFace: 'Aptos Display' });
  label(s, 'Sistema de chat web en tiempo real', 0.78, 2.02, 5.3, 0.36, { size: 19, color: 'DCE8FF' });
  label(s, 'Backend con Node.js, Express, Socket.IO y MongoDB Atlas', 0.78, 2.55, 5.7, 0.28, { size: 13, color: 'AFC0DE' });
  chatMockup(s, 7.15, 1.0, 4.95, 4.8);
  cloud(s, 6.25, 4.85, 'Cloud');
  label(s, 'Repositorio fuente: github.com/TheSam21byte/linkchat', 0.78, 6.67, 5.6, 0.2, { size: 9.3, color: '9FB1D1' });
  addFooter(s, 1, true);
  note(s, 'Presentar LinkChat como un mini Discord academico. Aclarar que el analisis viene del repositorio publico y que lo identificado claramente es el backend.');
}

// Slide 2
{
  const s = slide('F7FAFF');
  addKicker(s, 'Contexto', C.orange);
  addTitle(s, 'El problema: comunicacion inmediata y coordinada');
  card(s, 0.7, 1.35, 3.1, 4.75, C.white, 'E1E8F5');
  card(s, 4.1, 1.35, 3.1, 4.75, '101827', '101827');
  card(s, 7.5, 1.35, 4.8, 4.75, C.white, 'E1E8F5');
  label(s, 'Antes', 1.0, 1.68, 1.0, 0.28, { size: 20, bold: true, color: C.orange });
  bullet(s, 'Mensajes dispersos', 1.02, 2.25, C.ink, C.orange);
  bullet(s, 'Sin canales ni historial', 1.02, 2.82, C.ink, C.orange);
  bullet(s, 'Dificil saber quien esta conectado', 1.02, 3.39, C.ink, C.orange);
  label(s, 'Sistema distribuido', 4.45, 1.68, 2.2, 0.3, { size: 18, bold: true, color: C.white, align: 'center' });
  circle(s, 5.15, 2.45, 0.58, C.blue);
  circle(s, 5.8, 3.38, 0.58, C.green);
  circle(s, 4.58, 3.78, 0.58, C.purple);
  line(s, 5.44, 2.76, 0.42, 0.58, 'A7B4CC', 1.8, true);
  line(s, 5.51, 3.72, -0.58, 0.15, 'A7B4CC', 1.8, true);
  line(s, 4.92, 3.68, 0.25, -0.73, 'A7B4CC', 1.8, true);
  label(s, 'Clientes coordinados por un servidor central y eventos en tiempo real.', 4.55, 4.75, 2.2, 0.75, { size: 13.2, color: 'DCE8FF', align: 'center' });
  label(s, 'Necesidad', 7.9, 1.68, 1.4, 0.28, { size: 20, bold: true, color: C.blue });
  bullet(s, 'Canales para ordenar conversaciones', 7.95, 2.25, C.ink, C.blue);
  bullet(s, 'Broadcast de mensajes al grupo', 7.95, 2.82, C.ink, C.green);
  bullet(s, 'Usuarios conectados y privados', 7.95, 3.39, C.ink, C.purple);
  bullet(s, 'Acceso mediante invitaciones', 7.95, 3.96, C.ink, C.yellow);
  addFooter(s, 2);
  note(s, 'Explicar que el curso pide demostrar coordinacion entre procesos/usuarios conectados. LinkChat resuelve comunicacion en tiempo real usando cliente-servidor, API HTTP y eventos Socket.IO.');
}

// Slide 3
{
  const s = slide(C.white);
  addKicker(s, 'Producto', C.green);
  addTitle(s, 'Que es LinkChat');
  label(s, 'Un backend para chat en tiempo real con organizacion por servidores, canales, usuarios e invitaciones.', 0.62, 1.05, 8.0, 0.38, { size: 17, color: C.muted });
  const features = [
    ['Usuarios', 'Registro por username unico y estado online/offline.', C.blue],
    ['Servidores', 'Espacios de conversacion administrados por owner.', C.purple],
    ['Canales', 'Salas donde se agrupan los mensajes.', C.green],
    ['Invitaciones', 'Codigos para permitir acceso a usuarios.', C.orange],
    ['Mensajes', 'Persistencia por canal y tipo de mensaje.', C.cyan],
    ['Privados', 'Comunicacion dirigida por socketId.', C.yellow]
  ];
  features.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.75 + col * 4.05;
    const y = 1.85 + row * 1.82;
    card(s, x, y, 3.55, 1.32, 'F8FAFC', 'E2E8F0');
    circle(s, x + 0.24, y + 0.26, 0.42, f[2]);
    label(s, f[0], x + 0.82, y + 0.26, 1.8, 0.22, { size: 15.5, bold: true, color: C.ink });
    label(s, f[1], x + 0.82, y + 0.62, 2.35, 0.42, { size: 10.8, color: C.muted });
  });
  rect(s, 0.75, 5.8, 11.7, 0.55, '101827', '101827');
  label(s, 'Frontend no identificado claramente en el repositorio publico: se considera externo / por integrar / por confirmar.', 1.0, 5.96, 11.2, 0.22, { size: 12.2, bold: true, color: C.white, align: 'center' });
  addFooter(s, 3);
  note(s, 'Describir LinkChat como un sistema centrado en backend: modelos, rutas REST y eventos Socket.IO. Aclarar que no se detecto frontend en el repositorio revisado.');
}

// Slide 4
{
  const s = slide('0B1020');
  addKicker(s, 'Arquitectura', C.cyan, 0.28);
  addTitle(s, 'Cliente-servidor + tiempo real + persistencia', C.white, 0.55, 31);
  const nodes = [
    ['Usuario / navegador', 0.7, 2.35, 2.1, 0.8, C.blue],
    ['Frontend\nexterno / por integrar', 3.1, 2.2, 2.1, 1.1, C.purple],
    ['Backend\nNode.js + Express', 5.6, 2.05, 2.25, 1.38, C.green],
    ['Socket.IO\neventos realtime', 8.05, 1.48, 2.1, 1.0, C.cyan],
    ['MongoDB Atlas\nMongoose', 8.05, 3.05, 2.1, 1.0, C.yellow],
    ['Cloud deploy\nRender/Railway', 10.55, 2.2, 2.0, 1.1, C.orange]
  ];
  line(s, 2.8, 2.75, 0.35, 0, '8FA9C8', 2, true);
  line(s, 5.2, 2.75, 0.4, 0, '8FA9C8', 2, true);
  line(s, 7.86, 2.55, 0.25, -0.45, '8FA9C8', 2, true);
  line(s, 7.86, 2.82, 0.25, 0.55, '8FA9C8', 2, true);
  line(s, 10.16, 2.0, 0.42, 0.55, '8FA9C8', 2, true);
  line(s, 10.16, 3.5, 0.42, -0.55, '8FA9C8', 2, true);
  nodes.forEach(([t, x, y, w, h, c]) => {
    rect(s, x, y, w, h, c, c);
    label(s, t, x + 0.1, y + 0.18, w - 0.2, h - 0.18, { size: 13.5, bold: true, color: C.white, align: 'center', valign: 'mid' });
  });
  label(s, 'HTTP REST', 4.0, 1.88, 1.1, 0.2, { size: 10.5, bold: true, color: 'C7D2FE', align: 'center' });
  label(s, 'WebSocket', 7.45, 1.16, 1.1, 0.2, { size: 10.5, bold: true, color: 'A5F3FC', align: 'center' });
  label(s, 'persistencia', 7.42, 4.25, 1.2, 0.2, { size: 10.5, bold: true, color: 'FEF3C7', align: 'center' });
  addFooter(s, 4, true);
  note(s, 'Explicar la arquitectura: cliente consume API REST para recursos y Socket.IO para tiempo real. MongoDB Atlas persiste usuarios, canales y mensajes. El despliegue cloud permite acceso desde internet.');
}

// Slide 5
{
  const s = slide('FFF7ED');
  addKicker(s, 'Backend', C.orange);
  addTitle(s, 'Componentes implementados');
  const centerX = 6.4, centerY = 3.55;
  circle(s, centerX - 0.72, centerY - 0.72, 1.45, C.ink);
  label(s, 'Express\nAPI', centerX - 0.5, centerY - 0.28, 1.0, 0.46, { size: 16, bold: true, color: C.white, align: 'center' });
  const mods = [
    ['Users', 'username, status, lastSeen', 1.0, 1.55, C.blue],
    ['Servers', 'espacios de chat', 4.05, 1.15, C.purple],
    ['Channels', 'salas por servidor', 8.15, 1.15, C.green],
    ['Invitations', 'codigos de acceso', 10.45, 3.05, C.orange],
    ['Members', 'relacion usuario-servidor', 7.95, 5.25, C.cyan],
    ['Messages', 'contenido por canal', 2.45, 5.25, C.yellow]
  ];
  mods.forEach(([name, desc, x, y, col]) => {
    line(s, centerX, centerY, x + 0.85 - centerX, y + 0.35 - centerY, 'B8A38D', 1.2, false);
  });
  mods.forEach(([name, desc, x, y, col]) => {
    rect(s, x, y, 2.2, 0.92, C.white, 'F2D2A5');
    circle(s, x + 0.18, y + 0.25, 0.33, col);
    label(s, name, x + 0.62, y + 0.18, 1.2, 0.22, { size: 14, bold: true, color: C.ink });
    label(s, desc, x + 0.62, y + 0.48, 1.35, 0.2, { size: 8.7, color: C.muted });
  });
  addFooter(s, 5);
  note(s, 'Mostrar que el backend esta modularizado por dominio: usuarios, servidores, canales, invitaciones, miembros y mensajes. Cada modulo tiene ruta, controlador y modelo Mongoose.');
}

// Slide 6
{
  const s = slide(C.white);
  addKicker(s, 'Socket.IO', C.purple);
  addTitle(s, 'Comunicacion en tiempo real');
  rect(s, 0, 6.05, 13.33, 1.45, 'F1F5F9', 'F1F5F9');
  const x = [0.8, 3.35, 5.9, 8.45, 10.95];
  const names = ['Usuario A', 'join_channel', 'Socket.IO', 'Canal', 'Usuario B'];
  const cols = [C.blue, C.green, C.purple, C.cyan, C.orange];
  for (let i = 0; i < x.length - 1; i++) line(s, x[i] + 1.35, 3.05, 1.1, 0, '94A3B8', 2, true);
  names.forEach((n, i) => {
    rect(s, x[i], 2.45, 1.45, 1.12, cols[i], cols[i]);
    label(s, n, x[i] + 0.08, 2.78, 1.28, 0.22, { size: 12.5, bold: true, color: C.white, align: 'center' });
  });
  const events = [
    ['join_channel', 'entra al canal'],
    ['send_message', 'guarda y difunde'],
    ['get_users', 'lista conectados'],
    ['private_message', 'envio dirigido'],
    ['disconnect', 'notifica salida']
  ];
  events.forEach((e, i) => {
    const xx = 0.85 + i * 2.48;
    card(s, xx, 4.72, 2.05, 0.68, i % 2 ? '101827' : 'F8FAFC', i % 2 ? '101827' : 'E2E8F0');
    label(s, e[0], xx + 0.12, 4.85, 1.7, 0.18, { size: 9.5, bold: true, color: i % 2 ? C.white : C.ink });
    label(s, e[1], xx + 0.12, 5.1, 1.7, 0.14, { size: 7.8, color: i % 2 ? 'CBD5E1' : C.muted });
  });
  label(s, 'El servidor mantiene usuarios conectados en memoria con socketId y channelId.', 0.95, 6.55, 6.6, 0.3, { size: 14, bold: true, color: C.ink });
  label(s, 'Los mensajes publicos se persisten en MongoDB antes de emitirse al canal.', 7.45, 6.55, 5.1, 0.3, { size: 14, bold: true, color: C.purple });
  addFooter(s, 6);
  note(s, 'Explicar el flujo de evento: un usuario entra al canal, envia mensaje, el servidor guarda en MongoDB y emite receive_message a todos en ese canal. get_users y private_message demuestran interaccion en tiempo real.');
}

// Slide 7
{
  const s = slide('ECFDF5');
  addKicker(s, 'Persistencia', C.green);
  addTitle(s, 'MongoDB Atlas + Mongoose');
  rect(s, 0.75, 1.4, 3.25, 4.8, '064E3B', '064E3B');
  label(s, 'Colecciones', 1.08, 1.78, 1.7, 0.3, { size: 20, bold: true, color: C.white });
  ['users', 'servers', 'channels', 'invitations', 'members', 'messages'].forEach((c, i) => {
    rect(s, 1.05, 2.35 + i * 0.48, 2.1, 0.32, i === 5 ? C.yellow : '0F766E', i === 5 ? C.yellow : '0F766E');
    label(s, c, 1.18, 2.42 + i * 0.48, 1.5, 0.12, { size: 9.2, bold: true, color: i === 5 ? C.ink : C.white });
  });
  card(s, 4.65, 1.42, 7.6, 4.75, C.white, 'BBF7D0');
  label(s, 'Documento Message', 5.0, 1.82, 2.5, 0.3, { size: 20, bold: true, color: C.ink });
  const code = `{
  username: "German",
  channelId: ObjectId,
  content: "Hola a todos",
  type: "public",
  createdAt: Date
}`;
  rect(s, 5.0, 2.35, 3.2, 2.55, '111827', '111827');
  label(s, code, 5.22, 2.58, 2.75, 1.75, { fontFace: 'Consolas', size: 11, color: 'D1FAE5' });
  bullet(s, 'Mongoose define esquemas y validaciones', 8.7, 2.45, C.ink, C.green);
  bullet(s, 'Indice por canal y fecha para historial', 8.7, 3.1, C.ink, C.blue);
  bullet(s, 'Persistencia para consultar mensajes', 8.7, 3.75, C.ink, C.purple);
  bullet(s, 'Atlas permite base de datos en la nube', 8.7, 4.4, C.ink, C.orange);
  addFooter(s, 7);
  note(s, 'Hablar de persistencia: sin base de datos el chat solo existe en memoria. Con MongoDB se conservan usuarios, canales, invitaciones y mensajes. El modelo Message guarda username, channelId, content, type y timestamps.');
}

// Slide 8
{
  const s = slide('111827');
  addKicker(s, 'Despliegue y pruebas', C.yellow);
  addTitle(s, 'Preparacion para demostrar en internet', C.white, 0.52, 31);
  const checks = [
    ['Backend cloud', 'Render/Railway con npm start'],
    ['Variables', 'PORT, MONGO_URI, CLIENT_URL'],
    ['API', 'Health check y endpoints REST'],
    ['Tiempo real', 'dos clientes Socket.IO'],
    ['Evidencias', 'capturas de laptop y celular']
  ];
  checks.forEach((c, i) => {
    const y = 1.55 + i * 0.88;
    circle(s, 0.95, y + 0.1, 0.26, i < 3 ? C.green : C.yellow);
    label(s, '✓', 1.02, y + 0.12, 0.12, 0.12, { size: 9, bold: true, color: C.ink, align: 'center' });
    label(s, c[0], 1.35, y, 1.9, 0.25, { size: 16, bold: true, color: C.white });
    label(s, c[1], 3.15, y + 0.04, 3.0, 0.2, { size: 11.5, color: 'BFD0EA' });
  });
  card(s, 7.25, 1.35, 4.75, 4.65, 'F8FAFC', 'F8FAFC');
  label(s, 'Pruebas funcionales minimas', 7.62, 1.72, 3.3, 0.3, { size: 18, bold: true, color: C.ink });
  ['Varios usuarios conectados', 'Mensaje publico recibido por todos', '/usuarios lista conectados', '/privado solo al destinatario', 'Desconexion notificada', 'Invitacion valida'].forEach((t, i) => {
    bullet(s, t, 7.75, 2.25 + i * 0.47, C.ink, [C.blue, C.green, C.purple, C.orange, C.cyan, C.yellow][i]);
  });
  addFooter(s, 8, true);
  note(s, 'Esta diapositiva es para la parte del estudiante 6: despliegue, variables y pruebas. Decir que el backend se prueba con health check, Postman y dos clientes Socket.IO. Para frontend, si no aparece en repo, se documenta como pendiente/externo.');
}

// Slide 9
{
  const s = slide(C.white);
  addKicker(s, 'Cierre', C.purple);
  addTitle(s, 'Conclusiones');
  const left = [
    ['Distribucion', 'cliente, backend y base de datos separados'],
    ['Tiempo real', 'eventos Socket.IO para broadcast y privados'],
    ['Persistencia', 'MongoDB conserva mensajes y entidades'],
    ['Cloud ready', 'backend ejecutable con npm start y variables']
  ];
  left.forEach((item, i) => {
    const y = 1.45 + i * 1.0;
    circle(s, 0.9, y + 0.05, 0.42, [C.blue, C.purple, C.green, C.orange][i]);
    label(s, item[0], 1.55, y, 2.1, 0.25, { size: 17, bold: true, color: C.ink });
    label(s, item[1], 1.55, y + 0.34, 4.2, 0.2, { size: 11.5, color: C.muted });
  });
  rect(s, 7.2, 1.15, 4.55, 4.55, '101827', '101827');
  label(s, 'Proxima mejora', 7.65, 1.65, 2.4, 0.34, { size: 23, bold: true, color: C.white });
  label(s, 'Integrar y documentar claramente el frontend para completar la experiencia web tipo Discord.', 7.65, 2.35, 3.7, 0.86, { size: 16, color: 'DCE8FF' });
  label(s, 'Advertencia tecnica', 7.65, 4.0, 2.1, 0.26, { size: 15, bold: true, color: C.yellow });
  label(s, 'Frontend no identificado claramente en el repositorio publico revisado.', 7.65, 4.38, 3.55, 0.42, { size: 12.5, color: 'CBD5E1' });
  addFooter(s, 9);
  note(s, 'Cerrar conectando con Sistemas Distribuidos: componentes separados, comunicacion HTTP y WebSocket, persistencia cloud y despliegue. Recalcar que la siguiente mejora es integrar el frontend identificado por el equipo.');
}

const script = `# Guion breve de exposicion - LinkChat (5 a 7 minutos)

## 1. Portada
Presento LinkChat, un sistema de chat en tiempo real desarrollado para Sistemas Distribuidos. La idea es acercarse a un mini Discord, donde varios usuarios puedan comunicarse mediante canales.

## 2. Problema
El problema es coordinar comunicacion inmediata entre multiples usuarios. En un sistema distribuido necesitamos manejar concurrencia, estados de conexion, mensajes en tiempo real y persistencia.

## 3. Que es LinkChat
LinkChat organiza la comunicacion con usuarios, servidores, canales, invitaciones, miembros y mensajes. El repositorio revisado muestra principalmente el backend; el frontend no aparece claramente, por eso se indica como externo o pendiente de integrar.

## 4. Arquitectura
La arquitectura es cliente-servidor. El cliente consume endpoints HTTP del backend Express y usa Socket.IO para tiempo real. El backend persiste informacion con Mongoose en MongoDB Atlas y puede desplegarse en nube.

## 5. Backend
El backend esta separado por modulos: users, servers, channels, invitations, members y messages. Cada parte tiene rutas, controladores y modelos, lo que facilita mantener el sistema.

## 6. Tiempo real
Socket.IO maneja eventos como join_channel, send_message, get_users, private_message y disconnect. Un usuario entra a un canal, envia un mensaje, el servidor lo guarda y lo emite a los demas clientes conectados.

## 7. Base de datos
MongoDB almacena usuarios, servidores, canales, invitaciones, miembros y mensajes. El modelo Message guarda usuario, canal, contenido, tipo y fecha, permitiendo historial de mensajes.

## 8. Despliegue y pruebas
Para demostrar el sistema se prueba el backend desplegado, las variables de entorno, la conexion a MongoDB, endpoints con Postman y eventos Socket.IO con dos clientes. Las evidencias deben incluir capturas del backend funcionando, usuarios conectados, mensajes publicos y privados.

## 9. Conclusiones
LinkChat aplica conceptos de Sistemas Distribuidos: separacion de componentes, comunicacion bidireccional, persistencia en la nube y despliegue. La mejora pendiente es integrar claramente el frontend para completar la experiencia web.
`;
fs.writeFileSync(notesPath, script, 'utf8');

pptx.writeFile({ fileName: deckPath });
console.log(deckPath);
console.log(notesPath);