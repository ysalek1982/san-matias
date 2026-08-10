import { readFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

const ticket = process.env.TEST_TICKET?.trim().toUpperCase()
if (!ticket || !/^SM-\d{4}-\d{3,}$/u.test(ticket)) throw new Error('TEST_TICKET inválido')

const envText = await readFile(new URL('../.env.local', import.meta.url), 'utf8')
const env = Object.fromEntries(
  envText.split(/\r?\n/u).filter((line) => line && !line.startsWith('#')).map((line) => {
    const separator = line.indexOf('=')
    return [line.slice(0, separator), line.slice(separator + 1)]
  }),
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { data: complaint, error: lookupError } = await supabase
  .from('complaints')
  .select('id,full_name,location')
  .eq('ticket_number', ticket)
  .maybeSingle()
if (lookupError) throw lookupError
if (!complaint) {
  console.log(JSON.stringify({ deleted: false, reason: 'not_found', ticket }))
  process.exit(0)
}
if (complaint.full_name !== 'Prueba Técnica CMS' || complaint.location !== 'Registro temporal de validación') {
  throw new Error('El ticket no corresponde al registro técnico esperado; limpieza cancelada')
}

const { error: deleteError } = await supabase.from('complaints').delete().eq('id', complaint.id)
if (deleteError) throw deleteError

const year = Number(ticket.split('-')[1])
const { count, error: countError } = await supabase
  .from('complaints')
  .select('*', { count: 'exact', head: true })
  .like('ticket_number', `SM-${year}-%`)
if (countError) throw countError
if ((count ?? 0) === 0) {
  const { error: counterError } = await supabase.from('complaint_ticket_counters').delete().eq('ticket_year', year)
  if (counterError) throw counterError
}

console.log(JSON.stringify({ deleted: true, ticket, counterReset: (count ?? 0) === 0 }))
