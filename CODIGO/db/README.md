# Referencias históricas de la base

`schema.sql` y `seed.sql` se conservan como antecedentes del repositorio antiguo. **No son la instalación vigente**: el esquema histórico contiene operaciones de reconstrucción que eliminan datos. Ningún componente de la aplicación los ejecuta.

La instalación vigente está en `Controladores/prisma/migrations` y `Controladores/prisma/seed.ts`. `setup.ps1` sólo invoca Prisma, detiene el proceso ante errores y requiere `.env` previamente configurado.

El acceso funcional a PostgreSQL está exclusivamente en los controladores modulares mediante Prisma. El SQL de migraciones es administración del esquema, no una capa alternativa de consultas.
