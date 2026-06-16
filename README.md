# Sistema Financiero - Puertas Blindadas (Grupo 18)

Repositorio oficial del Módulo de Finanzas del ERP para Puertas Blindadas.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales dentro de la carpeta `/CODIGO`:

- **/CODIGO/Controladores**: API REST construida con Node.js, Express, TypeScript y Prisma ORM. Gestiona la lógica de negocio, integración con base de datos PostgreSQL (Raspberry Pi) y el módulo de transacciones financieras.
- **/CODIGO/Vistas**: Aplicación web interactiva construida con React, TypeScript, Vite y Tailwind CSS. Incluye el sistema de diseño y las interfaces para gestión de cotizaciones, notas de venta, clientes y dashboard principal.

## Tecnologías Utilizadas

- **Capa de Vistas**: React 19, Vite, Tailwind CSS, React Router DOM, Lucide React.
- **Capa de Controladores**: Node.js, Express, TypeScript, Prisma (ORM), PostgreSQL.
- **Capa de Persistencia**: PostgreSQL (Desplegada en entorno local/Raspberry Pi).

## Guía de Instalación y Ejecución

Para levantar el entorno de desarrollo local, es necesario instalar las dependencias y correr ambos servicios (API y Vistas) en paralelo.

### 1. Clonar el repositorio
```bash
git clone https://github.com/Midas2704/Grupo18-SistemaFinanciero-PuertasBlindadas.git
cd Grupo18-SistemaFinanciero-PuertasBlindadas
```

### 2. Configurar y Ejecutar la capa de controladores
```bash
cd CODIGO/Controladores
npm install

# Configurar variables de entorno requeridas en el archivo .env
# Ejemplo: DATABASE_URL="postgresql://user:pass@host:5432/db"

# Levantar el servidor en modo desarrollo
npm run dev
```
El backend estará disponible por defecto en `http://localhost:3000`.

### 3. Configurar y Ejecutar el la capa de vistas
Abre una nueva pestaña en tu terminal y ejecuta:
```bash
cd CODIGO/Vistas
npm install

# Levantar el servidor de desarrollo de Vite
npm run dev
```
La aplicación web estará disponible por defecto en `http://localhost:5173`.

## Capa de Persistencia y Scripts (Prisma)

El proyecto utiliza Prisma ORM. Algunos de los comandos y scripts útiles disponibles en `/CODIGO/Controladores`:
- `npx prisma db pull`: Sincroniza el esquema de Prisma desde la base de datos externa.
- `npx prisma generate`: Genera el cliente de Prisma actualizado.
- `npx prisma studio`: Abre la interfaz visual de la base de datos en el navegador.

Adicionalmente, los scripts para la carga inicial de datos (seeding) masivos o de limpieza se encuentran ubicados en `CODIGO/Controladores/scripts` (ej. `massive_seed_v2.js`) y `CODIGO/Controladores/prisma/seed.ts`.

## Documentación Adicional

- Documento 0
- Incremento 1

---
*Desarrollado bajo los estándares y lineamientos de la Facultad de Ingeniería.*
