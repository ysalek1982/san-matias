# Arquitectura del sistema

```text
SAN MATIAS/
├── .env.example                       # Contrato de variables; sin secretos
├── .env.local                         # Credenciales locales; ignorado por Git
├── components.json                    # shadcn/ui + Tailwind CSS v4
├── eslint.config.js
├── package.json
├── tsconfig.json                      # TypeScript estricto
├── vite.config.ts                     # TanStack Start + React + Tailwind
├── public/
│   └── images/                        # Activos turísticos locales
├── supabase/
│   └── schema.sql                     # Esquema, funciones, RLS y Storage
└── src/
    ├── components/
    │   ├── ui/                        # Componentes shadcn/ui
    │   ├── layout/                    # Navbar, Footer y layouts
    │   ├── brand/                     # Identidad municipal
    │   ├── content/                   # Componentes del portal
    │   └── admin/                     # Shell y gestores CMS
    ├── lib/
    │   ├── env.ts                     # Validación central de entorno
    │   ├── utils.ts
    │   └── supabase/
    │       ├── client.ts              # Navegador, sesión y RLS
    │       ├── server.ts              # Loaders públicos + sesión SSR/RLS
    │       └── admin.server.ts        # Service role, solo servidor
    ├── routes/
    │   ├── __root.tsx                 # Documento raíz SSR
    │   ├── index.tsx                  # Portada
    │   ├── autoridades.tsx
    │   ├── obras.tsx
    │   ├── documentos.tsx
    │   ├── noticias/
    │   │   ├── index.tsx
    │   │   └── $slug.tsx
    │   ├── denuncias/
    │   │   ├── index.tsx              # Alta con server function
    │   │   └── seguimiento.tsx
    │   └── admin/
    │       ├── route.tsx              # Layout y guard
    │       ├── index.tsx
    │       ├── obras.tsx
    │       ├── autoridades.tsx
    │       ├── noticias.tsx
    │       ├── documentos.tsx
    │       └── denuncias.tsx
    ├── router.tsx
    ├── routeTree.gen.ts               # Generado automáticamente; no versionado
    ├── styles/app.css                 # Tokens Pantanal/Laguna/Tierra
    ├── types/database.ts              # Tipos del esquema
    └── vite-env.d.ts
```

`CHAT-MUNICIPAL/` se mantuvo aislado como referencia. Su flujo se simplificó en
el módulo `admin/denuncias`: bandeja, detalle, cambio de estado y respuesta pública.
