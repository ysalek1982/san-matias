import { readFile } from 'node:fs/promises'
import pg from 'pg'

const EXPECTED_PROJECT_REF = 'jrscldywzibbxnlemxtn'
const REQUIRED_FLAG = `--confirm-reset=${EXPECTED_PROJECT_REF}`

if (!process.argv.includes(REQUIRED_FLAG)) {
  console.error(`Operación cancelada. Use ${REQUIRED_FLAG} para confirmar el proyecto.`)
  process.exit(1)
}

const envText = await readFile(new URL('../.env.local', import.meta.url), 'utf8')
const env = Object.fromEntries(
  envText
    .split(/\r?\n/u)
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const separator = line.indexOf('=')
      return [line.slice(0, separator), line.slice(separator + 1)]
    }),
)

const databaseUrl = new URL(env.DATABASE_URL)
if (!databaseUrl.hostname.includes(EXPECTED_PROJECT_REF)) {
  throw new Error('DATABASE_URL no pertenece al proyecto Supabase esperado')
}

const schemaFile = await readFile(
  new URL('../supabase/schema.sql', import.meta.url),
  'utf8',
)
const schemaBody = schemaFile
  .replace(/^\s*begin;\s*/imu, '')
  .replace(/\s*commit;\s*(?=-- Después)/imu, '\n')

const client = new pg.Client({
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 5432,
  database: databaseUrl.pathname.slice(1),
  user: `postgres.${EXPECTED_PROJECT_REF}`,
  password: decodeURIComponent(databaseUrl.password),
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10_000,
})

await client.connect()

try {
  const identity = await client.query(
    'select current_database() as database, current_user as username',
  )
  if (
    identity.rows[0]?.database !== 'postgres' ||
    identity.rows[0]?.username !== 'postgres'
  ) {
    throw new Error('La identidad de la conexión no coincide con el proyecto esperado')
  }

  await client.query('begin')
  await client.query("select pg_advisory_xact_lock(hashtext('gam-san-matias-reset'))")
  const storageCount = await client.query('select count(*)::int as count from storage.objects')
  if ((storageCount.rows[0]?.count ?? 0) > 0) {
    throw new Error('Storage contiene archivos; elimínelos mediante la API antes del reset')
  }
  await client.query('delete from auth.users')
  await client.query('drop schema if exists public cascade')
  await client.query('create schema public authorization postgres')
  await client.query(
    'grant usage on schema public to postgres, anon, authenticated, service_role',
  )
  await client.query('grant create on schema public to postgres, service_role')
  await client.query(schemaBody)
  await client.query('commit')

  const tables = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `)
  const policies = await client.query(`
    select count(*)::int as count
    from pg_policies
    where schemaname in ('public', 'storage')
      and policyname like any(array['profiles_%', 'authorities_%', 'works_%', 'news_%', 'documents_%', 'complaints_%', 'complaint_updates_%', 'storage_%'])
  `)

  console.log(
    JSON.stringify({
      reset: true,
      projectRef: EXPECTED_PROJECT_REF,
      tables: tables.rows.map((row) => row.table_name),
      policies: policies.rows[0]?.count ?? 0,
    }),
  )
} catch (error) {
  await client.query('rollback').catch(() => undefined)
  throw error
} finally {
  await client.end()
}
