# Sistema de Ventas — Mofles y Aceites "ADRIEL"

Sistema de ventas e inventario desarrollado para un **centro de venta de aceites y lubricantes**. Permite registrar las ventas del día, descontar automáticamente el stock, consultar el inventario de aceites y filtros, y administrar el catálogo de productos.

La aplicación está hecha con **React Native (Expo)** y funciona tanto en **Android** como en **web**, así que se puede usar desde una computadora en el mostrador o desde cualquier celular conectado a la misma red.

---

## Características

- **Registro de ventas:** eliges el aceite vendido, escribes la cantidad y el stock se descuenta al instante. Cada venta guarda el precio unitario y el total.
- **Cancelación de ventas:** si te equivocas, cancelas la venta desde la lista de últimas ventas y esa cantidad regresa al stock.
- **Inventario de aceites y filtros:** tabla filtrable por marca y ordenable por cualquier columna, con resumen de unidades por presentación y litros totales.
- **Catálogo de aceites:** marca, presentación (garrafa de 5 L, bote de 1 L, etc.) y clasificación de viscosidad (5W-20, 10W-30, etc.). Todo se puede ampliar desde la app, sin tocar código.
- **Catálogo de filtros:** marca, tipo de filtro y modelo / número de parte, también ampliable desde la app.
- **Diseño adaptable:** en pantallas anchas (web) el formulario y la lista se muestran en dos columnas; en el celular se apilan.
- **Base de datos local:** todo se guarda en un archivo SQLite en la computadora que funciona como servidor.

---

## Tecnologías

| Parte | Tecnología |
| --- | --- |
| App (Android + web) | React Native, Expo, Expo Router, TypeScript / JavaScript |
| Servidor (API) | Node.js, Express |
| Base de datos | SQLite (`better-sqlite3`) |

---

## Cómo funciona

```
 Celular (Android)  ─┐
                     ├──►  API REST (Node + Express, puerto 4000)  ──►  aceites.db (SQLite)
 Navegador (PC)     ─┘
```

Una computadora corre el **backend** y guarda la base de datos. La app (web o Android) se conecta a ese servidor por la red local, por eso todos los dispositivos ven el mismo inventario en tiempo real.

---

## Estructura del proyecto

```
Sistema-ventas-Adriel/
├── backend/                  # Servidor y base de datos
│   ├── db.js                 # Tablas y datos iniciales
│   ├── server.js             # Endpoints de la API
│   └── package.json
└── mobile-app/               # Aplicación Expo
    ├── src/app/              # Rutas (Venta, Inventario, Agregar aceite, Agregar filtro)
    ├── src/screens/          # Pantallas
    ├── src/services/api.js   # Comunicación con el backend
    └── src/components/       # Barra de navegación y componentes
```

---

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior
- Git
- Para probar en Android: la app **Expo Go** (o un emulador) y estar en la **misma red Wi-Fi** que la computadora del servidor

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/ZecorTR/Sistema-ventas-Adriel.git
cd Sistema-ventas-Adriel
```

### 2. Iniciar el backend

```bash
cd backend
npm install
npm start
```

Al arrancar se crea automáticamente el archivo `aceites.db` con las tablas y algunos datos de ejemplo. El servidor queda escuchando en el puerto **4000**.

### 3. Configurar la IP del servidor

Abre `mobile-app/src/services/api.js` y cambia la IP por la de la computadora que corre el backend:

```js
const HOST = Platform.OS === 'web' ? 'localhost' : '192.168.1.69';
```

Para conocer tu IP en Windows, ejecuta `ipconfig` y busca "Dirección IPv4". En la versión web, `localhost` funciona solo si el navegador está en la misma computadora que el servidor.

### 4. Iniciar la aplicación

```bash
cd ../mobile-app
npm install
npx expo start
```

- Presiona `w` para abrir la versión **web**.
- Escanea el código QR con **Expo Go** para abrirla en tu **Android**.

> Si el celular no logra conectarse, revisa que el firewall de Windows permita conexiones al puerto 4000 y que ambos dispositivos estén en la misma red.

---

## Uso rápido

1. **Agregar aceite / Agregar filtro:** registra los productos con su marca, presentación o tipo, precio, costo y stock inicial.
2. **Venta:** selecciona el producto vendido, escribe la cantidad y registra la venta.
3. **Inventario:** consulta cuánto tienes de cada marca, filtra por marca y ordena las columnas como prefieras.
4. Si registras una venta por error, cancélala desde "Últimas ventas".

---

## Notas importantes

- El archivo `backend/aceites.db` **no se sube a GitHub** (está en el `.gitignore`) porque contiene los datos reales del negocio. En una computadora nueva, la base de datos empieza vacía.
- Para respaldar la información, copia periódicamente el archivo `aceites.db`.

---

## Próximos pasos

- Registrar también la venta de filtros
- Reportes de ventas por día, semana y mes
- Corte de caja y control de ganancias

---

Desarrollado para uso interno del negocio.
