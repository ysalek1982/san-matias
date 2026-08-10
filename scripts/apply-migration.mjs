import { readFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const EXPECTED_PROJECT_REF = 'jrscldywzibbxnlemxtn'
const migrationName = process.argv[2]
if (!migrationName || basename(migrationName) !== migrationName || !/^\d+_[a-z0-9_]+\.sql$/u.test(migrationName)) {
  throw new Error('Indique un archivo de migración válido dentro de supabase/migrations')
}

const envText = await readFile(new URL('../.env.local', import.meta.url), 'utf8')
const env = Object.fromEntries(envText.split(/\r?\n/u).filter((line) => line && !line.startsWith('#')).map((line) => {
  const separator = line.indexOf('=')
  return [line.slice(0, separator), line.slice(separator + 1)]
}))
const databaseUrl = new URL(env.DATABASE_URL)
if (!databaseUrl.hostname.includes(EXPECTED_PROJECT_REF)) throw new Error('Proyecto Supabase inesperado')

const migrationPath = resolve(fileURLToPath(new URL('../supabase/migrations/', import.meta.url)), migrationName)
const sql = await readFile(migrationPath, 'utf8')
const client = new pg.Client({
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: `postgres.${EXPECTED_PROJECT_REF}`,
  password: decodeURIComponent(databaseUrl.password),
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10_000,
})

await client.connect()
try {
  await client.query(sql)
  console.log(JSON.stringify({ applied: true, migration: migrationName, projectRef: EXPECTED_PROJECT_REF }))
} finally {
  await client.end()
}
