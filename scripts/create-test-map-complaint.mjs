import { readFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

const envText = await readFile(new URL('../.env.local', import.meta.url), 'utf8')
const env = Object.fromEntries(envText.split(/\r?\n/u).filter((line) => line && !line.startsWith('#')).map((line) => {
  const separator = line.indexOf('=')
  return [line.slice(0, separator), line.slice(separator + 1)]
}))
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } })
const { data, error } = await supabase.rpc('create_complaint', {
  p_full_name: 'Prueba Técnica CMS',
  p_identity_document: '',
  p_email: '',
  p_phone: '70000000',
  p_category: 'Vías y drenaje',
  p_location: 'Registro temporal de validación',
  p_description: 'Validación temporal de coordenadas y visualización geográfica del sistema municipal.',
  p_latitude: -16.3564,
  p_longitude: -58.4021,
})
if (error) throw error
console.log(JSON.stringify({ created: true, ticket: data }))
