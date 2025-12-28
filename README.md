# Trenzas y Oseline - Telegram Bot 💁‍♀️

Bot de Telegram profesional para servicios de trenzas africanas con sistema completo de cotizaciones, reservas y gestión administrativa.

## ✨ Características Principales

### Para Clientes
- 🌍 **Soporte Multiidioma**: Español e Inglés
- 👤 **Registro Personalizado**: Selección de género y aceptación de términos
- 💰 **Sistema de Cotizaciones**: Solicita presupuestos personalizados
- 📅 **Reservas en Línea**: Agenda citas de forma fácil y rápida
- 📸 **Catálogo de Servicios**: Visualiza servicios disponibles y precios
- 🔔 **Notificaciones Automáticas**: Recibe actualizaciones sobre tus cotizaciones y citas
- 💳 **Enlaces de Pago**: Acceso directo a métodos de pago

### Para Administradores
- 📋 **Panel de Administración**: Gestión completa desde Telegram
- ✅ **Aprobación de Cotizaciones**: Revisa y aprueba solicitudes con precios
- 📆 **Gestión de Citas**: Confirma o cancela reservas
- 💳 **Configuración de Pagos**: Establece enlaces de pago personalizados
- 🔔 **Notificaciones a Clientes**: Sistema automático de notificaciones

## 📋 Estructura del Proyecto

```
trenzasyoseline/
├── src/
│   └── models/
│       ├── index.js       # Configuración de Sequelize y relaciones
│       ├── User.js        # Modelo de usuarios
│       ├── Cotization.js  # Modelo de cotizaciones
│       ├── Booking.js     # Modelo de reservas
│       └── Admin.js       # Modelo de configuración admin
├── index.js               # Aplicación principal del bot
├── generator.js           # Script para generar datos de prueba
├── .env.example           # Plantilla de variables de entorno
├── package.json
└── README.md
```

## 🚀 Instalación

### Requisitos Previos
- Node.js 16 o superior
- npm o yarn
- Cuenta de Telegram y Bot Token

### Pasos de Instalación

1. **Clonar el repositorio**:
```bash
git clone <repository-url>
cd trenzasyoseline
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
```bash
cp .env.example .env
```

Edita el archivo `.env` y añade tu token de bot:
```env
TELEGRAM_BOT_TOKEN=tu_token_aqui
```

### 🤖 Obtener Token de Bot de Telegram

1. Abre Telegram y busca [@BotFather](https://t.me/botfather)
2. Envía el comando `/newbot`
3. Sigue las instrucciones para crear tu bot
4. Copia el token que te proporciona
5. Pégalo en el archivo `.env`

## 💾 Base de Datos

### Modelos

#### User
Almacena información de usuarios del bot:
- `chatId`: ID único de Telegram
- `language`: Idioma preferido (Español/English)
- `gender`: Género del usuario
- `acceptedTerms`: Términos aceptados

#### Cotization
Almacena cotizaciones de servicios:
- `userId`: Referencia al usuario
- `details`: Descripción del servicio
- `price`: Precio cotizado
- `expiryDate`: Fecha de expiración
- `status`: Estado (pending, accepted, rejected, expired)

#### Booking
Almacena reservas de citas:
- `userId`: Referencia al usuario
- `cotizationId`: Referencia a la cotización
- `date`: Fecha de la cita
- `time`: Hora de la cita
- `status`: Estado (pending, confirmed, cancelled, completed)

#### Admin
Configuración administrativa:
- `userId`: ID del usuario administrador
- `paymentLink`: Enlace de pago (Nequi, Bancolombia, etc.)

### Inicializar Base de Datos

Para crear las tablas de la base de datos con datos de prueba:

```bash
npm run seed
```

O directamente:

```bash
node generator.js
```

Este script:
- ✅ Sincroniza la base de datos (crea las tablas)
- ✅ Crea 2 usuarios de prueba
- ✅ Crea 2 cotizaciones de prueba
- ✅ Crea 2 reservas de prueba
- ✅ Crea configuración admin de prueba

**⚠️ Nota**: El comando `npm run seed` eliminará todos los datos existentes.

## 🎯 Uso

### Iniciar el Bot

```bash
npm start
```

El bot iniciará y mostrará:
```
✅ Database synchronized
🤖 Bot started successfully!
💡 Use /start to begin
```

### Comandos Disponibles

#### Para Usuarios
- `/start` - Inicia el bot y muestra el menú principal
- Interacción mediante botones y mensajes de texto

#### Para Administradores
- `/admin` - Accede al panel de administración

### 🎨 Flujo de Usuario

1. **Registro**:
   - Usuario inicia con `/start`
   - Selecciona idioma (Español/English)
   - Selecciona género
   - Acepta términos y condiciones

2. **Solicitar Cotización**:
   - Desde el menú principal, selecciona "Solicitar Cotización"
   - Describe el servicio deseado
   - Espera respuesta del administrador

3. **Ver Cotizaciones**:
   - Visualiza todas las cotizaciones con estado y precios
   - Cotizaciones aceptadas disponibles para agendar

4. **Agendar Cita**:
   - Selecciona una cotización aceptada
   - Ingresa fecha en formato DD/MM/YYYY
   - Ingresa hora en formato HH:MM
   - Recibe confirmación

5. **Ver Citas**:
   - Visualiza todas las citas agendadas
   - Estado de cada cita (pendiente, confirmada, cancelada)

### 👑 Flujo de Administrador

1. **Configurar Administrador**:
   - Obtener el ID de usuario (chatId)
   - Añadir registro en la tabla Admin

2. **Gestión de Cotizaciones**:
   - Acceder con `/admin`
   - Ver cotizaciones pendientes
   - Aprobar (establecer precio) o rechazar
   - Usuario recibe notificación automática

3. **Gestión de Citas**:
   - Ver citas pendientes
   - Confirmar o cancelar citas
   - Usuario recibe confirmación con enlace de pago

4. **Configurar Enlace de Pago**:
   - Desde panel admin
   - Configurar link de Nequi, Bancolombia, etc.
   - Se incluye en confirmaciones de citas

## 🛠️ Tecnologías

- **Node.js** - Runtime de JavaScript
- **node-telegram-bot-api** - API del bot de Telegram
- **Sequelize** - ORM para base de datos
- **SQLite** - Base de datos (puede cambiarse a PostgreSQL/MySQL)
- **dotenv** - Gestión de variables de entorno

## 📱 Catálogo de Servicios

El bot incluye un catálogo de servicios predefinido:

1. **Box Braids** - Desde $120.000
2. **Trenzas Africanas** - Desde $150.000
3. **Cornrows** - Desde $80.000
4. **Senegalese Twists** - Desde $180.000
5. **Knotless Braids** - Desde $200.000

💡 Los precios son referenciales y se ajustan según longitud y complejidad.

## 🔧 Configuración Avanzada

### Cambiar Base de Datos

Para usar PostgreSQL o MySQL en lugar de SQLite:

1. Instala el driver correspondiente:
```bash
npm install pg pg-hstore  # PostgreSQL
# o
npm install mysql2        # MySQL
```

2. Actualiza `src/models/index.js`:
```javascript
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'postgres' // o 'mysql'
});
```

### Añadir Administradores

Para añadir un administrador manualmente:

```javascript
// Ejecuta esto una vez para cada admin
const { Admin } = require('./src/models');

await Admin.create({
  userId: 1, // ID del usuario en la tabla User
  paymentLink: 'https://tu-enlace-de-pago.com'
});
```

O mediante SQL directo en la base de datos.

## 🚨 Solución de Problemas

### Bot no responde
- ✅ Verifica que el token en `.env` sea correcto
- ✅ Asegúrate de que el bot esté iniciado (`npm start`)
- ✅ Revisa los logs de consola para errores

### Error de base de datos
- ✅ Ejecuta `npm run seed` para reinicializar
- ✅ Verifica permisos del archivo `database.sqlite`

### Usuario no puede ser admin
- ✅ Verifica que el userId en la tabla Admin sea correcto
- ✅ Usa el chatId del usuario (visible en logs o base de datos)

## 📝 Desarrollo

### Ejecutar en Modo Desarrollo

Para desarrollo con auto-reload:

```bash
npm install -D nodemon
npx nodemon index.js
```

### Estructura de Código

El bot está organizado en:
- **Comandos**: Funciones que responden a comandos `/start`, `/admin`
- **Callbacks**: Manejo de botones inline
- **Sesiones**: Estado temporal de conversaciones
- **Traducciones**: Sistema multiidioma

## 🤝 Contribuir

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

## 📄 Licencia

ISC

## 📞 Soporte

Para soporte y preguntas:
- Telegram: @OselineAdmin
- Issues: [GitHub Issues](../../issues)

---

Hecho con ❤️ para Trenzas y Oseline
