# Trenzas y Oseline - Telegram Bot 💇‍♀️

Bot de Telegram profesional para servicios de trenzas africanas con gestión completa de cotizaciones, reservas y administración.

## ✨ Características

### Para Clientes
- 🌐 **Soporte Multiidioma**: Español e Inglés
- 💇 **Catálogo de Servicios**: Visualiza servicios disponibles con precios y descripciones
- 💰 **Cotizaciones Personalizadas**: Solicita cotizaciones para servicios específicos
- 📅 **Sistema de Reservas**: Calendario interactivo para agendar citas
- 🔔 **Notificaciones**: Recibe confirmaciones y recordatorios
- ⚙️ **Configuración Personal**: Cambia idioma y preferencias

### Para Administradores
- 👑 **Panel de Administración**: Gestión centralizada
- 📊 **Estadísticas**: Vista general del negocio
- 💰 **Gestión de Cotizaciones**: Responde y establece precios
- 📅 **Gestión de Reservas**: Confirma o cancela citas
- 💇 **Gestión de Servicios**: Administra el catálogo
- 🔔 **Notificaciones Automáticas**: Alertas de nuevas solicitudes

## 🏗️ Estructura del Proyecto

```
trenzasyoseline/
├── src/
│   ├── handlers/
│   │   ├── start.js          # Registro y onboarding
│   │   ├── menu.js           # Menú principal y navegación
│   │   ├── services.js       # Catálogo de servicios
│   │   ├── quotes.js         # Sistema de cotizaciones
│   │   ├── bookings.js       # Sistema de reservas
│   │   └── admin.js          # Panel administrativo
│   ├── locales/
│   │   ├── es.js            # Traducciones en español
│   │   ├── en.js            # Traducciones en inglés
│   │   └── index.js         # Sistema de i18n
│   ├── models/
│   │   ├── index.js         # Configuración de Sequelize
│   │   ├── User.js          # Modelo de usuarios
│   │   ├── Service.js       # Modelo de servicios
│   │   ├── Cotization.js    # Modelo de cotizaciones
│   │   ├── Booking.js       # Modelo de reservas
│   │   └── Admin.js         # Modelo de configuración admin
│   └── utils/
│       ├── logger.js        # Sistema de logging con Winston
│       └── helpers.js       # Funciones auxiliares
├── index.js                 # Punto de entrada del bot
├── generator.js             # Script para datos de prueba
├── .env.example             # Plantilla de variables de entorno
├── package.json
└── README.md

```

## 📦 Instalación

### Prerrequisitos
- Node.js >= 14.x
- npm o yarn
- Token de Bot de Telegram ([obtener aquí](https://t.me/BotFather))

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd trenzasyoseline
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:
```env
TELEGRAM_BOT_TOKEN=tu_token_aqui
ADMIN_CHAT_IDS=123456789,987654321
BUSINESS_NAME=Trenzas y Oseline
BUSINESS_PHONE=+57 300 123 4567
BUSINESS_ADDRESS=Cali, Colombia
```

4. **Inicializar la base de datos**
```bash
npm run seed
```

5. **Iniciar el bot**
```bash
npm start
```

## 🗄️ Base de Datos

### Modelos

#### User (Usuarios)
- `id`: ID único
- `chatId`: ID de chat de Telegram
- `language`: Idioma preferido (Español/English)
- `gender`: Género del usuario
- `acceptedTerms`: Términos y condiciones aceptados
- `createdAt`, `updatedAt`: Timestamps

#### Service (Servicios)
- `id`: ID único
- `name`: Nombre del servicio
- `description`: Descripción detallada
- `price`: Precio en COP
- `duration`: Duración en minutos
- `category`: Categoría del servicio
- `imageUrl`: URL de imagen (opcional)
- `isActive`: Estado del servicio
- `createdAt`, `updatedAt`: Timestamps

#### Cotization (Cotizaciones)
- `id`: ID único
- `userId`: Referencia al usuario
- `serviceId`: Referencia al servicio (opcional)
- `details`: Detalles de la cotización
- `price`: Precio cotizado
- `expiryDate`: Fecha de expiración
- `status`: Estado (pending, accepted, rejected, expired)
- `createdAt`, `updatedAt`: Timestamps

#### Booking (Reservas)
- `id`: ID único
- `userId`: Referencia al usuario
- `cotizationId`: Referencia a la cotización
- `serviceId`: Referencia al servicio
- `date`: Fecha de la cita
- `time`: Hora de la cita
- `status`: Estado (pending, confirmed, cancelled, completed)
- `createdAt`, `updatedAt`: Timestamps

#### Admin (Configuración)
- `id`: ID único
- `userId`: ID de usuario administrador
- `paymentLink`: Link de pago (Nequi, etc.)
- `createdAt`, `updatedAt`: Timestamps

### Comandos de Base de Datos

```bash
# Generar datos de prueba
npm run seed

# Resetear base de datos completamente
npm run reset-db
```

## 🚀 Uso

### Comandos del Bot

#### Para Usuarios
- `/start` - Iniciar el bot y registro
- `/menu` - Mostrar menú principal
- `/help` - Obtener ayuda

#### Para Administradores
- `/admin` - Acceder al panel de administración

### Flujo de Usuario

1. **Registro**: El usuario inicia con `/start` y completa:
   - Selección de idioma
   - Selección de género
   - Aceptación de términos

2. **Exploración**: Puede ver el catálogo de servicios

3. **Cotización**: Solicita una cotización personalizada

4. **Reserva**: Una vez aceptada la cotización, agenda una cita usando el calendario interactivo

5. **Confirmación**: Recibe confirmación y recordatorios

### Flujo de Administrador

1. **Notificación**: Recibe alertas de nuevas solicitudes

2. **Cotizaciones**:
   - Ve solicitudes pendientes
   - Establece precios
   - El cliente recibe la cotización automáticamente

3. **Reservas**:
   - Ve reservas pendientes
   - Confirma o cancela citas
   - El cliente recibe notificación

4. **Gestión**:
   - Ve estadísticas del negocio
   - Administra servicios

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram | - |
| `ADMIN_CHAT_IDS` | IDs de administradores (separados por coma) | - |
| `DB_STORAGE` | Ubicación de la base de datos SQLite | `./database.sqlite` |
| `BUSINESS_NAME` | Nombre del negocio | `Trenzas y Oseline` |
| `BUSINESS_PHONE` | Teléfono de contacto | - |
| `BUSINESS_ADDRESS` | Dirección del negocio | - |
| `BUSINESS_HOURS` | Horario de atención | - |
| `PAYMENT_ENABLED` | Habilitar pagos | `true` |
| `NEQUI_PHONE` | Número de Nequi | - |
| `NEQUI_LINK` | Link de pago Nequi | - |
| `BOOKING_ADVANCE_DAYS` | Días de anticipación mínima | `1` |
| `BOOKING_MAX_DAYS` | Días máximos para reservar | `30` |
| `BOOKING_SLOT_DURATION` | Duración de slots (minutos) | `120` |
| `BOOKING_START_HOUR` | Hora de inicio | `9` |
| `BOOKING_END_HOUR` | Hora de fin | `18` |
| `QUOTE_EXPIRY_DAYS` | Días de validez de cotización | `7` |
| `LOG_LEVEL` | Nivel de logging | `info` |

## 🛠️ Tecnologías

- **Node.js** - Runtime de JavaScript
- **node-telegram-bot-api** - API de Telegram
- **Sequelize** - ORM para base de datos
- **SQLite** - Base de datos
- **Winston** - Sistema de logging
- **Moment-timezone** - Manejo de fechas y zonas horarias
- **dotenv** - Gestión de variables de entorno

## 📝 Scripts NPM

```bash
npm start           # Inicia el bot
npm run dev         # Inicia en modo desarrollo
npm run seed        # Genera datos de prueba
npm run reset-db    # Resetea la base de datos
```

## 🔒 Seguridad

- Los tokens y credenciales se gestionan mediante variables de entorno
- Validación de administradores en todas las operaciones sensibles
- Logging de todas las acciones importantes
- Manejo de errores robusto

## 📊 Logging

Los logs se guardan en:
- `error.log` - Solo errores
- `combined.log` - Todos los logs

En desarrollo, los logs también se muestran en consola con colores.

## 🌐 Internacionalización

El bot soporta múltiples idiomas mediante el sistema de locales en `src/locales/`:
- Español (`es.js`)
- Inglés (`en.js`)

Para agregar un nuevo idioma:
1. Crea un archivo en `src/locales/` (ej. `fr.js`)
2. Copia la estructura de `es.js` o `en.js`
3. Traduce todos los textos
4. Agrega el locale en `src/locales/index.js`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

ISC

## 👥 Soporte

Para soporte, contacta a través de:
- Telegram: [Información en el bot]
- Email: [Tu email]
- Issues: [GitHub Issues]

## 🎯 Roadmap

- [ ] Integración de pagos en línea
- [ ] Sistema de valoraciones y reseñas
- [ ] Galería de trabajos realizados
- [ ] Notificaciones programadas de recordatorios
- [ ] Exportación de estadísticas
- [ ] Sistema de descuentos y promociones
- [ ] Integración con Google Calendar
- [ ] API REST para integraciones externas

---

Hecho con ❤️ para Trenzas y Oseline
