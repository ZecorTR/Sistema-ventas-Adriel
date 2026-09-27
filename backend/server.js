const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Marcas ----------
app.get('/api/marcas', (req, res) => {
  res.json(db.prepare('SELECT * FROM marcas ORDER BY nombre').all());
});

app.post('/api/marcas', (req, res) => {
  const { nombre } = req.body;
  if (!nombre || !nombre.trim()) return res.status(400).json({ error: 'nombre requerido' });
  try {
    const info = db.prepare('INSERT INTO marcas (nombre) VALUES (?)').run(nombre.trim());
    res.status(201).json({ id: info.lastInsertRowid, nombre: nombre.trim() });
  } catch (e) {
    res.status(409).json({ error: 'esa marca ya existe' });
  }
});

// ---------- Presentaciones ----------
app.get('/api/presentaciones', (req, res) => {
  res.json(db.prepare('SELECT * FROM presentaciones ORDER BY litros').all());
});

app.post('/api/presentaciones', (req, res) => {
  const { etiqueta, litros } = req.body;
  if (!etiqueta || !litros) return res.status(400).json({ error: 'etiqueta y litros requeridos' });
  try {
    const info = db
      .prepare('INSERT INTO presentaciones (etiqueta, litros) VALUES (?, ?)')
      .run(etiqueta.trim(), Number(litros));
    res.status(201).json({ id: info.lastInsertRowid, etiqueta, litros });
  } catch (e) {
    res.status(409).json({ error: 'esa presentación ya existe' });
  }
});

// ---------- Viscosidades ----------
app.get('/api/viscosidades', (req, res) => {
  res.json(db.prepare('SELECT * FROM viscosidades ORDER BY etiqueta').all());
});

app.post('/api/viscosidades', (req, res) => {
  const { etiqueta } = req.body;
  if (!etiqueta || !etiqueta.trim()) return res.status(400).json({ error: 'etiqueta requerida' });
  try {
    const info = db.prepare('INSERT INTO viscosidades (etiqueta) VALUES (?)').run(etiqueta.trim());
    res.status(201).json({ id: info.lastInsertRowid, etiqueta: etiqueta.trim() });
  } catch (e) {
    res.status(409).json({ error: 'esa clasificación ya existe' });
  }
});

// ---------- Aceites (catálogo final) ----------
const oilsQuery = `
  SELECT
    a.id, a.sku, a.precio, a.costo, a.stock, a.creado_en,
    m.id AS marca_id, m.nombre AS marca,
    p.id AS presentacion_id, p.etiqueta AS presentacion, p.litros,
    v.id AS viscosidad_id, v.etiqueta AS viscosidad
  FROM aceites a
  JOIN marcas m ON m.id = a.marca_id
  JOIN presentaciones p ON p.id = a.presentacion_id
  JOIN viscosidades v ON v.id = a.viscosidad_id
  ORDER BY m.nombre, v.etiqueta, p.litros
`;

app.get('/api/aceites', (req, res) => {
  res.json(db.prepare(oilsQuery).all());
});

app.post('/api/aceites', (req, res) => {
  const { marca_id, presentacion_id, viscosidad_id, sku, precio, costo, stock } = req.body;
  if (!marca_id || !presentacion_id || !viscosidad_id) {
    return res.status(400).json({ error: 'marca_id, presentacion_id y viscosidad_id son requeridos' });
  }
  try {
    const info = db
      .prepare(
        `INSERT INTO aceites (marca_id, presentacion_id, viscosidad_id, sku, precio, costo, stock)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(marca_id, presentacion_id, viscosidad_id, sku || null, precio || 0, costo || 0, stock || 0);
    const row = db
      .prepare(oilsQuery.replace('ORDER BY', 'WHERE a.id = ? ORDER BY'))
      .get(info.lastInsertRowid);
    res.status(201).json(row);
  } catch (e) {
    res.status(409).json({ error: 'ese aceite (marca + presentación + viscosidad) ya está registrado' });
  }
});

app.delete('/api/aceites/:id', (req, res) => {
  db.prepare('DELETE FROM aceites WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// ---------- Ventas (descuentan stock) ----------
const registrarVenta = db.transaction((aceite_id, cantidad) => {
  const aceite = db.prepare('SELECT * FROM aceites WHERE id = ?').get(aceite_id);
  if (!aceite) throw new Error('ese aceite no existe');
  if (aceite.stock < cantidad) throw new Error(`no hay stock suficiente (disponible: ${aceite.stock})`);

  db.prepare('UPDATE aceites SET stock = stock - ? WHERE id = ?').run(cantidad, aceite_id);

  const total = aceite.precio * cantidad;
  const info = db
    .prepare('INSERT INTO ventas (aceite_id, cantidad, precio_unitario, total) VALUES (?, ?, ?, ?)')
    .run(aceite_id, cantidad, aceite.precio, total);

  return { id: info.lastInsertRowid, aceite_id, cantidad, precio_unitario: aceite.precio, total };
});

app.post('/api/ventas', (req, res) => {
  const { aceite_id, cantidad } = req.body;
  if (!aceite_id || !cantidad || cantidad <= 0) {
    return res.status(400).json({ error: 'aceite_id y cantidad (mayor a 0) son requeridos' });
  }
  try {
    const venta = registrarVenta(aceite_id, Number(cantidad));
    res.status(201).json(venta);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/ventas', (req, res) => {
  res.json(
    db
      .prepare(
        `SELECT v.*, m.nombre AS marca, p.etiqueta AS presentacion, vi.etiqueta AS viscosidad
         FROM ventas v
         JOIN aceites a ON a.id = v.aceite_id
         JOIN marcas m ON m.id = a.marca_id
         JOIN presentaciones p ON p.id = a.presentacion_id
         JOIN viscosidades vi ON vi.id = a.viscosidad_id
         ORDER BY v.fecha DESC`
      )
      .all()
  );
});

// Cancela una venta: borra el registro y le regresa la cantidad al stock del aceite.
const cancelarVenta = db.transaction((venta_id) => {
  const venta = db.prepare('SELECT * FROM ventas WHERE id = ?').get(venta_id);
  if (!venta) throw new Error('esa venta no existe');

  db.prepare('UPDATE aceites SET stock = stock + ? WHERE id = ?').run(venta.cantidad, venta.aceite_id);
  db.prepare('DELETE FROM ventas WHERE id = ?').run(venta_id);
});

app.delete('/api/ventas/:id', (req, res) => {
  try {
    cancelarVenta(req.params.id);
    res.status(204).end();
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ---------- Marcas de filtro ----------
app.get('/api/marcas-filtro', (req, res) => {
  res.json(db.prepare('SELECT * FROM marcas_filtro ORDER BY nombre').all());
});

app.post('/api/marcas-filtro', (req, res) => {
  const { nombre } = req.body;
  if (!nombre || !nombre.trim()) return res.status(400).json({ error: 'nombre requerido' });
  try {
    const info = db.prepare('INSERT INTO marcas_filtro (nombre) VALUES (?)').run(nombre.trim());
    res.status(201).json({ id: info.lastInsertRowid, nombre: nombre.trim() });
  } catch (e) {
    res.status(409).json({ error: 'esa marca ya existe' });
  }
});

// ---------- Tipos de filtro ----------
app.get('/api/tipos-filtro', (req, res) => {
  res.json(db.prepare('SELECT * FROM tipos_filtro ORDER BY etiqueta').all());
});

app.post('/api/tipos-filtro', (req, res) => {
  const { etiqueta } = req.body;
  if (!etiqueta || !etiqueta.trim()) return res.status(400).json({ error: 'etiqueta requerida' });
  try {
    const info = db.prepare('INSERT INTO tipos_filtro (etiqueta) VALUES (?)').run(etiqueta.trim());
    res.status(201).json({ id: info.lastInsertRowid, etiqueta: etiqueta.trim() });
  } catch (e) {
    res.status(409).json({ error: 'ese tipo ya existe' });
  }
});

// ---------- Filtros (catálogo final) ----------
const filtersQuery = `
  SELECT
    f.id, f.modelo, f.precio, f.costo, f.stock, f.creado_en,
    m.id AS marca_id, m.nombre AS marca,
    t.id AS tipo_id, t.etiqueta AS tipo
  FROM filtros f
  JOIN marcas_filtro m ON m.id = f.marca_id
  JOIN tipos_filtro t ON t.id = f.tipo_id
  ORDER BY m.nombre, t.etiqueta, f.modelo
`;

app.get('/api/filtros', (req, res) => {
  res.json(db.prepare(filtersQuery).all());
});

app.post('/api/filtros', (req, res) => {
  const { marca_id, tipo_id, modelo, precio, costo, stock } = req.body;
  if (!marca_id || !tipo_id || !modelo || !modelo.trim()) {
    return res.status(400).json({ error: 'marca_id, tipo_id y modelo son requeridos' });
  }
  try {
    const info = db
      .prepare(
        `INSERT INTO filtros (marca_id, tipo_id, modelo, precio, costo, stock)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(marca_id, tipo_id, modelo.trim(), precio || 0, costo || 0, stock || 0);
    const row = db
      .prepare(filtersQuery.replace('ORDER BY', 'WHERE f.id = ? ORDER BY'))
      .get(info.lastInsertRowid);
    res.status(201).json(row);
  } catch (e) {
    res.status(409).json({ error: 'ese filtro (marca + tipo + modelo) ya está registrado' });
  }
});

app.delete('/api/filtros/:id', (req, res) => {
  db.prepare('DELETE FROM filtros WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API de aceites y filtros escuchando en http://0.0.0.0:${PORT}`);
});
