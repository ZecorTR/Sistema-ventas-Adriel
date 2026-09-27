const Database = require('better-sqlite3');
const path = require('path');

// Un solo archivo .db en la carpeta del backend = tu base de datos local.
const db = new Database(path.join(__dirname, 'aceites.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS marcas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS presentaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    etiqueta TEXT NOT NULL UNIQUE,   -- ej. "Garrafa 5L"
    litros REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS viscosidades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    etiqueta TEXT NOT NULL UNIQUE    -- ej. "5W-30"
  );

  CREATE TABLE IF NOT EXISTS aceites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    marca_id INTEGER NOT NULL REFERENCES marcas(id),
    presentacion_id INTEGER NOT NULL REFERENCES presentaciones(id),
    viscosidad_id INTEGER NOT NULL REFERENCES viscosidades(id),
    sku TEXT,
    precio REAL NOT NULL DEFAULT 0,
    costo REAL NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    creado_en TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(marca_id, presentacion_id, viscosidad_id)
  );

  CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aceite_id INTEGER NOT NULL REFERENCES aceites(id),
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    total REAL NOT NULL,
    fecha TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS marcas_filtro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS tipos_filtro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    etiqueta TEXT NOT NULL UNIQUE   -- ej. "Filtro de aceite", "Filtro de aire"
  );

  CREATE TABLE IF NOT EXISTS filtros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    marca_id INTEGER NOT NULL REFERENCES marcas_filtro(id),
    tipo_id INTEGER NOT NULL REFERENCES tipos_filtro(id),
    modelo TEXT NOT NULL,            -- número de parte / modelo, ej. "PH8A"
    precio REAL NOT NULL DEFAULT 0,
    costo REAL NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    creado_en TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(marca_id, tipo_id, modelo)
  );
`);

// Semilla inicial (solo si las tablas están vacías) — puedes agregar más desde la app.
const seedIfEmpty = (table, rows, insertSql) => {
  const count = db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c;
  if (count === 0) {
    const stmt = db.prepare(insertSql);
    rows.forEach((r) => stmt.run(...r));
  }
};

seedIfEmpty('marcas', [['Gohner'], ['Mobil'], ['Quaker']], 'INSERT INTO marcas (nombre) VALUES (?)');
seedIfEmpty(
  'presentaciones',
  [['Garrafa 5L', 5], ['Bote 1L', 1]],
  'INSERT INTO presentaciones (etiqueta, litros) VALUES (?, ?)'
);
seedIfEmpty(
  'viscosidades',
  [['5W-20'], ['5W-30'], ['10W-30']],
  'INSERT INTO viscosidades (etiqueta) VALUES (?)'
);
seedIfEmpty('marcas_filtro', [['Gohner'], ['Fram']], 'INSERT INTO marcas_filtro (nombre) VALUES (?)');
seedIfEmpty(
  'tipos_filtro',
  [['Filtro de aceite']],
  'INSERT INTO tipos_filtro (etiqueta) VALUES (?)'
);

module.exports = db;
