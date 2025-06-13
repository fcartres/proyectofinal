# Furgón Seguro API

API RESTful para la aplicación Furgón Seguro, desarrollada con Node.js, Express, Prisma y SQLite.

## Requisitos

- Node.js 14.x o superior
- npm 6.x o superior

## Instalación

1. Clonar el repositorio:

\`\`\`bash
git clone https://github.com/tu-usuario/furgon-seguro-api.git
cd furgon-seguro-api
\`\`\`

2. Instalar dependencias:

\`\`\`bash
npm install
\`\`\`

3. Configurar variables de entorno:

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

\`\`\`
# Entorno
NODE_ENV=development
PORT=3000

# Base de datos
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=tu_secreto_jwt_super_seguro
JWT_EXPIRES_IN=7d

# MercadoPago (opcional)
MERCADOPAGO_ACCESS_TOKEN=tu_token_de_mercadopago
\`\`\`

4. Generar cliente Prisma:

\`\`\`bash
npx prisma generate
\`\`\`

5. Crear y migrar la base de datos:

\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

6. Cargar datos de ejemplo (opcional):

\`\`\`bash
npm run seed
\`\`\`

## Ejecución

### Desarrollo

\`\`\`bash
npm run dev
\`\`\`

### Producción

\`\`\`bash
npm start
\`\`\`

## Herramientas de desarrollo

- **Prisma Studio**: Interfaz visual para explorar y modificar la base de datos:

\`\`\`bash
npm run prisma:studio
\`\`\`

## Estructura del proyecto

\`\`\`
furgon-seguro-api/
├── prisma/
│   ├── schema.prisma    # Esquema de la base de datos
│   └── seed.js          # Script para cargar datos de ejemplo
├── src/
│   ├── index.js         # Punto de entrada de la aplicación
│   ├── middlewares/     # Middlewares de Express
│   ├── routes/          # Rutas de la API
│   └── services/        # Servicios y lógica de negocio
├── .env                 # Variables de entorno
├── .gitignore
├── package.json
└── README.md
\`\`\`

## API Endpoints

### Autenticación

- `POST /api/auth/register`: Registrar un nuevo usuario
- `POST /api/auth/login`: Iniciar sesión

### Rutas de transporte

- `GET /api/rutas`: Obtener todas las rutas
- `GET /api/rutas/:id`: Obtener una ruta por ID
- `POST /api/rutas`: Crear una nueva ruta (solo conductores)
- `PUT /api/rutas/:id`: Actualizar una ruta (solo conductor propietario)
- `DELETE /api/rutas/:id`: Eliminar una ruta (solo conductor propietario)

### Solicitudes

- `GET /api/solicitudes`: Obtener solicitudes (filtradas por tipo de usuario)
- `POST /api/solicitudes`: Crear una nueva solicitud (solo padres)
- `PUT /api/solicitudes/:id`: Responder a una solicitud (solo conductores)

### Servicios

- `GET /api/servicios`: Obtener servicios (filtrados por tipo de usuario)
- `POST /api/servicios`: Crear un nuevo servicio

### Estudiantes

- `GET /api/estudiantes`: Obtener estudiantes (solo padres)
- `POST /api/estudiantes`: Registrar un nuevo estudiante (solo padres)
- `GET /api/estudiantes/:id`: Obtener un estudiante por ID (solo padre propietario)
- `PUT /api/estudiantes/:id`: Actualizar un estudiante (solo padre propietario)
- `DELETE /api/estudiantes/:id`: Eliminar un estudiante (solo padre propietario)

### Vehículos

- `GET /api/vehiculos`: Obtener vehículos (solo conductores)
- `POST /api/vehiculos`: Registrar un nuevo vehículo (solo conductores)

### Pagos

- `GET /api/pagos`: Obtener pagos (filtrados por tipo de usuario)
- `POST /api/pagos`: Registrar un nuevo pago (solo conductores)

### Evaluaciones

- `GET /api/evaluaciones`: Obtener evaluaciones (filtradas por tipo de usuario)
- `POST /api/evaluaciones`: Crear una nueva evaluación

### Dashboard

- `GET /api/dashboard/stats`: Obtener estadísticas del dashboard (según tipo de usuario)

### Conductor

- `GET /api/conductor/profile`: Obtener perfil del conductor
- `GET /api/conductor/rutas`: Obtener rutas del conductor
- `POST /api/conductor/verificar`: Verificar conductor
