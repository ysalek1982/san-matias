# GAM San Matías · Portal Ciudadano + CMS

Sistema full-stack municipal construido con TanStack Start, React 19, TypeScript
estricto, Supabase, Tailwind CSS v4 y shadcn/ui.

## Funcionalidad

- Portal público SSR: portada, autoridades, organigrama, obras, noticias y transparencia.
- Obras con estados y avance físico.
- Denuncias ciudadanas con tickets correlativos `SM-AAAA-NNN`.
- Seguimiento público sin exposición de datos personales.
- Panel `/admin` protegido con Supabase Auth.
- CRUD de obras, autoridades, noticias y documentos.
- Carga local de imágenes en `public/uploads` con validación y acceso administrativo.
- Carga de PDF a Supabase Storage.
- Mesa de ayuda con estados, respuestas e historial público.
- RLS por roles `superadmin`, `admin`, `editor` y `helpdesk`.

## Desarrollo

```powershell
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Verificación

```powershell
npm run typecheck
npm run lint
npm run build
```

El smoke test integral está en `scripts/e2e-smoke.py`. Requiere Playwright para
Python y valida navegación, ticket, respuesta, seguimiento, login y CRUD.

## Operación de base de datos

El esquema completo vive en `supabase/schema.sql`.

```powershell
npm run db:inspect
npm run db:reset   # destructivo; proyecto fijado en el script
npm run db:seed
```

`db:reset` verifica explícitamente el project ref antes de eliminar el esquema
de aplicación. No elimina ni recrea los esquemas internos de Supabase.

## Acceso inicial

El usuario administrador se crea con `npm run db:seed`. Su correo y contraseña
temporal están en las variables `ADMIN_BOOTSTRAP_EMAIL` y
`ADMIN_BOOTSTRAP_PASSWORD` de `.env.local`. Cambie la contraseña al entregar el
sistema a producción.

## Seguridad

- `.env.local` está ignorado por Git.
- La clave publicable está protegida por RLS.
- `SUPABASE_SERVICE_ROLE_KEY` y `DATABASE_URL` solo se usan en servidor/scripts.
- Las operaciones del CMS verifican sesión y rol antes de ejecutar cambios.
- El cliente privilegiado está marcado como server-only.
- Los datos personales de denuncias no tienen políticas de lectura pública.

La clave `service_role` proporcionada originalmente fue compartida en texto y
debe rotarse antes de publicar el sistema.

## Despliegue en Vercel

Configure en Vercel las variables documentadas en `.env.example`, usando una
clave `service_role` nueva. No copie `.env.local` al repositorio.

La carga de imágenes utiliza `public/uploads` durante el desarrollo local. En
Vercel, el sistema detecta automáticamente el entorno y utiliza el bucket
`public-media` de Supabase Storage para conservar los archivos entre despliegues.

## Activos visuales

- `la-curicha.jpg`: fotografía de referencia publicada por Bolivia.com.
- `pantanal.png`, `paraba-azul.png` y `laguna-mandiore.png`: activos editoriales
  generados específicamente para este portal mediante la herramienta integrada
  de generación de imágenes.
