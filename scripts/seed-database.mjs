import { readFile } from 'node:fs/promises'
import pg from 'pg'
import { createClient } from '@supabase/supabase-js'

const PROJECT_REF = 'jrscldywzibbxnlemxtn'
const envText = await readFile(new URL('../.env.local', import.meta.url), 'utf8')
const env = Object.fromEntries(
  envText.split(/\r?\n/u).filter((line) => line && !line.startsWith('#')).map((line) => {
    const separator = line.indexOf('=')
    return [line.slice(0, separator), line.slice(separator + 1)]
  }),
)

const databaseUrl = new URL(env.DATABASE_URL)
const client = new pg.Client({
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: `postgres.${PROJECT_REF}`,
  password: decodeURIComponent(databaseUrl.password),
  ssl: { rejectUnauthorized: false },
})

await client.connect()
try {
  await client.query('begin')
  await client.query(`
    insert into public.authorities
      (full_name, position, authority_type, organization_area, biography, sort_order, status, published_at)
    values
      ('Jhonny López', 'Alcalde Municipal', 'alcalde', 'Órgano Ejecutivo', 'Máxima autoridad ejecutiva del Gobierno Autónomo Municipal de San Matías para la gestión 2026–2031.', 1, 'published', now()),
      ('Directiva del Concejo Municipal', 'Presidencia del Concejo', 'concejal', 'Órgano Legislativo', 'Instancia de deliberación, legislación y fiscalización municipal.', 2, 'published', now()),
      ('Secretaría Municipal Administrativa', 'Dirección administrativa', 'directivo', 'Órgano Ejecutivo', 'Coordina la gestión institucional, financiera y administrativa del municipio.', 3, 'published', now()),
      ('Dirección de Desarrollo Humano', 'Dirección municipal', 'unidad', 'Desarrollo Humano', 'Articula programas municipales de salud, educación, cultura y atención social.', 4, 'published', now())
  `)
  await client.query(`
    insert into public.works
      (slug, title, summary, description, location, contractor, budget, physical_progress, status, content_status, cover_image_url, started_at, expected_end_at, published_at)
    values
      ('mejoramiento-vial-barrios-2026', 'Mejoramiento vial en barrios urbanos', 'Nivelación, drenaje y consolidación de vías para mejorar la movilidad vecinal.', 'Intervención progresiva en calles priorizadas del área urbana, con control de calidad y seguimiento físico.', 'Área urbana de San Matías', 'Unidad Municipal de Obras Públicas', 1850000, 68, 'en_ejecucion', 'published', '/images/pantanal.png', '2026-05-12', '2026-10-30', now()),
      ('revitalizacion-balneario-la-curicha', 'Revitalización del balneario La Curicha', 'Mejoras de acceso, señalética y áreas de descanso con enfoque ambiental.', 'Proyecto de fortalecimiento turístico que prioriza seguridad, accesibilidad y conservación del entorno natural.', 'Comunidad San Juan de Corralito', 'GAM San Matías', 780000, 42, 'en_ejecucion', 'published', '/images/la-curicha.jpg', '2026-06-03', '2026-12-15', now()),
      ('equipamiento-centro-salud', 'Equipamiento para atención primaria', 'Renovación de mobiliario y equipamiento esencial para servicios municipales de salud.', 'Adquisición y puesta en funcionamiento de equipamiento para fortalecer la atención primaria.', 'San Matías', 'Proveedor adjudicado', 425000, 100, 'ejecutado', 'published', '/images/laguna-mandiore.png', '2026-02-10', '2026-04-30', now())
  `)
  await client.query(`
    insert into public.news
      (slug, title, excerpt, body, category, cover_image_url, status, published_at)
    values
      ('san-matias-fortalece-atencion-primaria', 'San Matías fortalece la atención primaria', 'El municipio coordina acciones para ampliar la capacidad de respuesta y prevención en los barrios.', 'El Gobierno Autónomo Municipal impulsa jornadas de coordinación, prevención y atención primaria junto a los equipos locales. Las actividades priorizan información clara para las familias, seguimiento territorial y una respuesta oportuna a las necesidades de cada comunidad.', 'Salud', '/images/la-curicha.jpg', 'published', now() - interval '2 days'),
      ('temporada-ideal-para-descubrir-el-pantanal', 'Temporada ideal para descubrir el Pantanal', 'Naturaleza, cultura fronteriza y biodiversidad se encuentran en el territorio de San Matías.', 'San Matías abre una puerta privilegiada al Pantanal boliviano. La visita responsable permite conocer humedales, bosques y fauna emblemática, siempre con guías locales y respeto por las áreas protegidas.', 'Turismo', '/images/pantanal.png', 'published', now() - interval '5 days'),
      ('agenda-educativa-municipal-2026', 'Agenda educativa municipal 2026', 'Un calendario de apoyo escolar, cultura y participación para niñas, niños y jóvenes.', 'La agenda educativa reúne acciones de mantenimiento, acompañamiento y promoción cultural. El municipio publicará avances y convocatorias a través de este portal ciudadano.', 'Educación', '/images/paraba-azul.png', 'published', now() - interval '8 days')
  `)
  await client.query('commit')
} catch (error) {
  await client.query('rollback')
  throw error
} finally {
  await client.end()
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
)
const { data: users, error: listError } = await supabase.auth.admin.listUsers()
if (listError) throw listError
let admin = users.users.find((user) => user.email === env.ADMIN_BOOTSTRAP_EMAIL)
if (!admin) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: env.ADMIN_BOOTSTRAP_EMAIL,
    password: env.ADMIN_BOOTSTRAP_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Administrador GAM San Matías' },
  })
  if (error) throw error
  admin = data.user
}
if (!admin) throw new Error('No se pudo crear el usuario administrador')

const { error: profileError } = await supabase.from('profiles').upsert({
  id: admin.id,
  email: env.ADMIN_BOOTSTRAP_EMAIL,
  full_name: 'Administrador GAM San Matías',
  role: 'superadmin',
  is_active: true,
})
if (profileError) throw profileError

console.log(JSON.stringify({ seeded: true, adminEmail: env.ADMIN_BOOTSTRAP_EMAIL }))
