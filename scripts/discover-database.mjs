import { readFile } from 'node:fs/promises'
import pg from 'pg'

const { Client } = pg
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

const directUrl = new URL(env.DATABASE_URL)
const projectRef = 'jrscldywzibbxnlemxtn'
const regions = [
  'sa-east-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'ap-southeast-1',
  'ap-southeast-2',
]

const attempts = regions.map(async (region) => {
  const client = new Client({
    host: `aws-0-${region}.pooler.supabase.com`,
    port: 5432,
    database: directUrl.pathname.slice(1),
    user: `postgres.${projectRef}`,
    password: decodeURIComponent(directUrl.password),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5_000,
  })

  try {
    await client.connect()
    const result = await client.query(
      "select current_database() as database, current_user as username, current_setting('server_version') as version",
    )
    const inventory = await client.query(`
      select
        n.nspname as schema_name,
        c.relname as object_name,
        case c.relkind when 'r' then 'table' when 'v' then 'view' else c.relkind::text end as object_type,
        case when c.relkind = 'r' then pg_total_relation_size(c.oid) else 0 end as bytes
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname in ('public', 'auth', 'storage')
        and c.relkind in ('r', 'v')
      order by n.nspname, c.relname
    `)
    const publicCounts = await client.query(`
      select jsonb_build_object(
        'authorities', (select count(*) from public.authorities),
        'documents', (select count(*) from public.documents),
        'news', (select count(*) from public.news),
        'works', (select count(*) from public.works),
        'complaints', (select count(*) from public.complaints),
        'complaint_updates', (select count(*) from public.complaint_updates),
        'profiles', (select count(*) from public.profiles),
        'auth_users', (select count(*) from auth.users),
        'storage_objects', (select count(*) from storage.objects)
      ) as counts
    `)
    const extensions = await client.query(`
      select e.extname, n.nspname as schema_name
      from pg_extension e
      join pg_namespace n on n.oid = e.extnamespace
      order by e.extname
    `)
    return {
      region,
      ok: true,
      details: result.rows[0],
      counts: publicCounts.rows[0].counts,
      inventory: inventory.rows.filter((row) => row.schema_name === 'public'),
      extensions: extensions.rows,
    }
  } catch (error) {
    return {
      region,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }
  } finally {
    await client.end().catch(() => undefined)
  }
})

const results = await Promise.all(attempts)
for (const result of results) {
  if (result.ok || !result.error?.includes('Tenant or user not found')) {
    console.log(JSON.stringify(result))
  }
}

if (!results.some((result) => result.ok)) {
  process.exitCode = 1
}
