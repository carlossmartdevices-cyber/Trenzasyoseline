# Trenzas y Oseline - Telegram Bot

Bot de Telegram para servicios de trenzas africanas.

## Estructura del Proyecto

```
trenzasyoseline/
├── src/
│   └── models/
│       ├── index.js       # Configuración de Sequelize y relaciones
│       ├── User.js        # Modelo de usuarios
│       ├── Cotization.js  # Modelo de cotizaciones
│       ├── Booking.js     # Modelo de reservas
│       └── Admin.js       # Modelo de configuración admin
├── generator.js           # Script para generar datos de prueba
└── package.json
```

## Instalación

1. Instalar dependencias:
```bash
npm install
```

## Base de Datos

### Modelos

- **User**: Almacena información de usuarios del bot
- **Cotization**: Almacena cotizaciones de servicios
- **Booking**: Almacena reservas de citas
- **Admin**: Configuración administrativa (enlaces de pago, etc.)

### Generar Datos de Prueba

Para inicializar la base de datos con datos de prueba:

```bash
npm run seed
```

O directamente:

```bash
node generator.js
```

Este script:
- Sincroniza la base de datos (crea las tablas)
- Crea 2 usuarios de prueba
- Crea 2 cotizaciones de prueba
- Crea 2 reservas de prueba
- Crea configuración admin de prueba

**Nota**: El comando `npm run seed` eliminará todos los datos existentes y creará datos de prueba nuevos.

## Uso

Para iniciar el bot:

```bash
npm start
```

## Tecnologías

- Node.js
- Sequelize (ORM)
- SQLite (Base de datos)
- node-telegram-bot-api
