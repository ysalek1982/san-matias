import { createServerFn } from '@tanstack/react-start'

import { createAdminServerClient } from '@/lib/supabase/admin.server'
import { createAuthenticatedServerClient } from '@/lib/supabase/server'
import type { CmsRole, ComplaintStatus, Json } from '@/types/database'

export type AdminResource = 'works' | 'authorities' | 'news' | 'documents' | 'procedures' | 'hr_employees' | 'hr_contracts' | 'inventory_assets'
async function requireStaff(roles: CmsRole[] = ['superadmin', 'admin', 'editor', 'helpdesk']) {
  const supabase = createAuthenticatedServerClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) throw new Error('UNAUTHORIZED')
  const { data: profile, error: profileError } = await supabase.from('profiles').select('id,email,full_name,role').eq('id', authData.user.id).single()
  if (profileError || !profile || !roles.includes(profile.role)) throw new Error('FORBIDDEN')
  return { supabase, user: authData.user, profile }
}

async function writeAudit(actorId: string, action: string, entityType: string, entityId: string | null, summary: string, metadata: Json = {}) {
  const { error } = await createAdminServerClient().from('cms_audit_logs').insert({ actor_id: actorId, action, entity_type: entityType, entity_id: entityId, summary, metadata })
  if (error) console.error('No se pudo registrar auditoría:', error.message)
}

export const getCurrentAdmin = createServerFn({ method: 'GET' }).handler(async () => {
  try { const { profile } = await requireStaff(); return profile } catch { return null }
})

export const getAdminDashboard = createServerFn({ method: 'GET' }).handler(async () => {
  const { supabase } = await requireStaff()
  const [works, authorities, news, documents, complaints, openComplaints, reviewComplaints, employees, assets, procedures] = await Promise.all([
    supabase.from('works').select('*', { count: 'exact', head: true }),
    supabase.from('authorities').select('*', { count: 'exact', head: true }),
    supabase.from('news').select('*', { count: 'exact', head: true }),
    supabase.from('documents').select('*', { count: 'exact', head: true }),
    supabase.from('complaints').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'abierto'),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'en_revision'),
    supabase.from('hr_employees').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('inventory_assets').select('*', { count: 'exact', head: true }),
    supabase.from('procedures').select('*', { count: 'exact', head: true }).eq('status', 'published'),
  ])
  const { count: complaintsCount } = await supabase.from('complaints').select('*', { count: 'exact', head: true })
  return {
    counts: {
      works: works.count ?? 0,
      authorities: authorities.count ?? 0,
      news: news.count ?? 0,
      documents: documents.count ?? 0,
      complaints: complaintsCount ?? 0,
      openComplaints: openComplaints.count ?? 0,
      reviewComplaints: reviewComplaints.count ?? 0,
      employees: employees.count ?? 0,
      assets: assets.count ?? 0,
      procedures: procedures.count ?? 0,
    },
    recentComplaints: complaints.data ?? [],
  }
})

export const getAdminResource = createServerFn({ method: 'GET' })
  .validator((input: { resource: AdminResource }) => input)
  .handler(async ({ data: input }) => {
    const { supabase } = await requireStaff(['superadmin', 'admin', 'editor'])
    if (input.resource === 'works') { const result = await supabase.from('works').select('*').order('created_at', { ascending: false }); if (result.error) throw result.error; return result.data }
    if (input.resource === 'authorities') { const result = await supabase.from('authorities').select('*').order('sort_order'); if (result.error) throw result.error; return result.data }
    if (input.resource === 'news') { const result = await supabase.from('news').select('*').order('created_at', { ascending: false }); if (result.error) throw result.error; return result.data }
    if (input.resource === 'procedures') { const result = await supabase.from('procedures').select('*').order('created_at', { ascending: false }); if (result.error) throw result.error; return result.data }
    if (input.resource === 'hr_employees') { const result = await supabase.from('hr_employees').select('*').order('created_at', { ascending: false }); if (result.error) throw result.error; return result.data }
    if (input.resource === 'hr_contracts') { const result = await supabase.from('hr_contracts').select('*, hr_employees(first_name, last_name)').order('created_at', { ascending: false }); if (result.error) throw result.error; return result.data }
    if (input.resource === 'inventory_assets') { const result = await supabase.from('inventory_assets').select('*, hr_employees(first_name, last_name)').order('created_at', { ascending: false }); if (result.error) throw result.error; return result.data }
    const result = await supabase.from('documents').select('*').order('fiscal_year', { ascending: false }); if (result.error) throw result.error; return result.data
  })

const str = (values: Record<string, string>, key: string) => (values[key] ?? '').trim()
const optional = (values: Record<string, string>, key: string) => str(values, key) || null
const num = (values: Record<string, string>, key: string) => Number(values[key] ?? 0)

export const saveAdminResource = createServerFn({ method: 'POST' })
  .validator((input: { resource: AdminResource; id?: string; values: Record<string, string> }) => input)
  .handler(async ({ data: input }) => {
    const { supabase, user } = await requireStaff(['superadmin', 'admin', 'editor'])
    if (input.resource === 'works') {
      const payload = { slug: str(input.values, 'slug'), title: str(input.values, 'title'), summary: optional(input.values, 'summary'), description: optional(input.values, 'description'), location: str(input.values, 'location'), contractor: optional(input.values, 'contractor'), budget: num(input.values, 'budget'), physical_progress: num(input.values, 'physical_progress'), status: str(input.values, 'status') as 'adjudicado' | 'en_ejecucion' | 'ejecutado', content_status: str(input.values, 'content_status') as 'draft' | 'published' | 'archived', cover_image_url: optional(input.values, 'cover_image_url'), published_at: str(input.values, 'content_status') === 'published' ? new Date().toISOString() : null }
      const result = input.id ? await supabase.from('works').update({ ...payload, updated_by: user.id }).eq('id', input.id) : await supabase.from('works').insert({ ...payload, created_by: user.id, updated_by: user.id }); if (result.error) throw result.error
    } else if (input.resource === 'authorities') {
      const payload = { full_name: str(input.values, 'full_name'), position: str(input.values, 'position'), authority_type: str(input.values, 'authority_type') as 'alcalde' | 'concejal' | 'directivo' | 'unidad', organization_area: optional(input.values, 'organization_area'), biography: optional(input.values, 'biography'), photo_url: optional(input.values, 'photo_url'), sort_order: num(input.values, 'sort_order'), status: str(input.values, 'status') as 'draft' | 'published' | 'archived', published_at: str(input.values, 'status') === 'published' ? new Date().toISOString() : null }
      const result = input.id ? await supabase.from('authorities').update({ ...payload, updated_by: user.id }).eq('id', input.id) : await supabase.from('authorities').insert({ ...payload, created_by: user.id, updated_by: user.id }); if (result.error) throw result.error
    } else if (input.resource === 'news') {
      const payload = { slug: str(input.values, 'slug'), title: str(input.values, 'title'), excerpt: str(input.values, 'excerpt'), body: str(input.values, 'body'), category: str(input.values, 'category') as 'Salud' | 'Turismo' | 'Educación', cover_image_url: optional(input.values, 'cover_image_url'), status: str(input.values, 'status') as 'draft' | 'published' | 'archived', published_at: str(input.values, 'status') === 'published' ? new Date().toISOString() : null }
      const result = input.id ? await supabase.from('news').update({ ...payload, updated_by: user.id }).eq('id', input.id) : await supabase.from('news').insert({ ...payload, created_by: user.id, updated_by: user.id }); if (result.error) throw result.error
    } else if (input.resource === 'procedures') {
      const payload = { title: str(input.values, 'title'), description: optional(input.values, 'description'), requirements: input.values.requirements ? String(input.values.requirements).split('\\n') : null, cost: num(input.values, 'cost') || null, estimated_duration: optional(input.values, 'estimated_duration'), category: str(input.values, 'category'), status: str(input.values, 'status') as 'draft' | 'published' | 'archived', published_at: str(input.values, 'status') === 'published' ? new Date().toISOString() : null }
      const result = input.id ? await supabase.from('procedures').update({ ...payload, updated_by: user.id }).eq('id', input.id) : await supabase.from('procedures').insert({ ...payload, created_by: user.id, updated_by: user.id }); if (result.error) throw result.error
    } else if (input.resource === 'hr_employees') {
      const payload = { identity_document: str(input.values, 'identity_document'), first_name: str(input.values, 'first_name'), last_name: str(input.values, 'last_name'), email: optional(input.values, 'email'), phone: optional(input.values, 'phone'), date_of_birth: optional(input.values, 'date_of_birth'), address: optional(input.values, 'address'), status: str(input.values, 'status') as 'active' | 'inactive' | 'suspended' }
      const result = input.id ? await supabase.from('hr_employees').update({ ...payload }).eq('id', input.id) : await supabase.from('hr_employees').insert({ ...payload }); if (result.error) throw result.error
    } else if (input.resource === 'hr_contracts') {
      const payload = { employee_id: str(input.values, 'employee_id'), contract_type: str(input.values, 'contract_type') as 'indefinido' | 'plazo_fijo' | 'consultoria' | 'eventual', position: str(input.values, 'position'), department: str(input.values, 'department'), salary: num(input.values, 'salary'), start_date: str(input.values, 'start_date'), end_date: optional(input.values, 'end_date') }
      const result = input.id ? await supabase.from('hr_contracts').update({ ...payload }).eq('id', input.id) : await supabase.from('hr_contracts').insert({ ...payload }); if (result.error) throw result.error
    } else if (input.resource === 'inventory_assets') {
      const payload = { asset_code: str(input.values, 'asset_code'), name: str(input.values, 'name'), description: optional(input.values, 'description'), category: str(input.values, 'category') as 'vehículo' | 'equipo_computo' | 'mueble' | 'inmueble' | 'maquinaria' | 'otro', status: str(input.values, 'status') as 'operativo' | 'mantenimiento' | 'de_baja', acquisition_date: optional(input.values, 'acquisition_date'), acquisition_cost: num(input.values, 'acquisition_cost') || 0, location: optional(input.values, 'location'), assigned_to: optional(input.values, 'assigned_to') }
      const result = input.id ? await supabase.from('inventory_assets').update({ ...payload }).eq('id', input.id) : await supabase.from('inventory_assets').insert({ ...payload }); if (result.error) throw result.error
    } else {
      const payload = { title: str(input.values, 'title'), description: optional(input.values, 'description'), category: str(input.values, 'category') as 'POA' | 'Resolución', document_number: optional(input.values, 'document_number'), fiscal_year: num(input.values, 'fiscal_year'), file_path: str(input.values, 'file_path'), file_name: str(input.values, 'file_name'), mime_type: 'application/pdf', status: str(input.values, 'status') as 'draft' | 'published' | 'archived', published_at: str(input.values, 'status') === 'published' ? new Date().toISOString() : null }
      const result = input.id ? await supabase.from('documents').update({ ...payload, updated_by: user.id }).eq('id', input.id) : await supabase.from('documents').insert({ ...payload, created_by: user.id, updated_by: user.id }); if (result.error) throw result.error
    }
    return { ok: true }
  })

export const deleteAdminResource = createServerFn({ method: 'POST' })
  .validator((input: { resource: AdminResource; id: string }) => input)
  .handler(async ({ data: input }) => {
    const { supabase } = await requireStaff(['superadmin', 'admin', 'editor'])
    if (input.resource === 'works') { const { error } = await supabase.from('works').delete().eq('id', input.id); if (error) throw error }
    else if (input.resource === 'authorities') { const { error } = await supabase.from('authorities').delete().eq('id', input.id); if (error) throw error }
    else if (input.resource === 'news') { const { error } = await supabase.from('news').delete().eq('id', input.id); if (error) throw error }
    else if (input.resource === 'procedures') { const { error } = await supabase.from('procedures').delete().eq('id', input.id); if (error) throw error }
    else if (input.resource === 'hr_employees') { const { error } = await supabase.from('hr_employees').delete().eq('id', input.id); if (error) throw error }
    else if (input.resource === 'hr_contracts') { const { error } = await supabase.from('hr_contracts').delete().eq('id', input.id); if (error) throw error }
    else if (input.resource === 'inventory_assets') { const { error } = await supabase.from('inventory_assets').delete().eq('id', input.id); if (error) throw error }
    else { const { error } = await supabase.from('documents').delete().eq('id', input.id); if (error) throw error }
    return { ok: true }
  })

export const getAdminComplaints = createServerFn({ method: 'GET' }).handler(async () => {
  const { supabase, profile } = await requireStaff(['superadmin', 'admin', 'helpdesk'])
  const [complaints, updates, staff] = await Promise.all([
    supabase.from('complaints').select('*').order('updated_at', { ascending: false }),
    supabase.from('complaint_updates').select('*').order('created_at', { ascending: true }),
    supabase.from('profiles').select('*').eq('is_active', true).order('full_name'),
  ])
  if (complaints.error) throw complaints.error
  if (updates.error) throw updates.error
  if (staff.error) throw staff.error
  return { complaints: complaints.data, updates: updates.data, staff: staff.data, currentUserRole: profile.role, generatedAt: new Date().toISOString() }
})

export const deleteComplaint = createServerFn({ method: 'POST' })
  .validator((input: { complaintId: string }) => input)
  .handler(async ({ data: input }) => {
    const { user } = await requireStaff(['superadmin'])
    const admin = createAdminServerClient()

    const { data: complaint, error: lookupError } = await admin.from('complaints').select('ticket_number').eq('id', input.complaintId).single()
    if (lookupError) throw lookupError

    // Eliminar primero los registros asociados en complaint_updates para evitar restricción de clave foránea
    await admin.from('complaint_updates').delete().eq('complaint_id', input.complaintId)

    // Eliminar la denuncia principal
    const { error: deleteError } = await admin.from('complaints').delete().eq('id', input.complaintId)
    if (deleteError) throw deleteError

    await writeAudit(user.id, 'complaint_deleted', 'complaint', input.complaintId, `Denuncia ${complaint.ticket_number} eliminada por Superadmin`)
    return { ok: true }
  })

export const assignComplaint = createServerFn({ method: 'POST' })
  .validator((input: { complaintId: string; assignedTo: string | null }) => input)
  .handler(async ({ data: input }) => {
    const { supabase, user } = await requireStaff(['superadmin', 'admin', 'helpdesk'])
    const { data: complaint, error: complaintError } = await supabase.from('complaints').select('status').eq('id', input.complaintId).single()
    if (complaintError) throw complaintError
    const { error: updateError } = await supabase.from('complaints').update({ assigned_to: input.assignedTo }).eq('id', input.complaintId)
    if (updateError) throw updateError
    let assigneeName = 'Sin responsable asignado'
    if (input.assignedTo) {
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', input.assignedTo).single()
      assigneeName = profile?.full_name ?? 'Servidor municipal'
    }
    const { error: historyError } = await supabase.from('complaint_updates').insert({
      complaint_id: input.complaintId,
      author_id: user.id,
      from_status: complaint.status,
      to_status: complaint.status,
      message: `Asignación interna: ${assigneeName}`,
      is_public: false,
    })
    if (historyError) throw historyError
    await writeAudit(user.id, 'complaint_assigned', 'complaint', input.complaintId, assigneeName)
    return { ok: true }
  })

export const respondToComplaint = createServerFn({ method: 'POST' })
  .validator((input: { complaintId: string; fromStatus: ComplaintStatus; status: ComplaintStatus; message: string; isPublic: boolean }) => input)
  .handler(async ({ data: input }) => {
    const { supabase, user } = await requireStaff(['superadmin', 'admin', 'helpdesk'])
    const message = input.message.trim().slice(0, 5_000)
    if (!message) throw new Error('La respuesta no puede estar vacía')
    const { error: updateError } = await supabase.from('complaints').update({ status: input.status, resolved_at: input.status === 'resuelto' ? new Date().toISOString() : null }).eq('id', input.complaintId)
    if (updateError) throw updateError
    const { error: replyError } = await supabase.from('complaint_updates').insert({ complaint_id: input.complaintId, author_id: user.id, from_status: input.fromStatus, to_status: input.status, message, is_public: input.isPublic })
    if (replyError) throw replyError
    await writeAudit(user.id, input.isPublic ? 'complaint_replied' : 'complaint_note_added', 'complaint', input.complaintId, input.isPublic ? 'Respuesta pública registrada' : 'Nota interna registrada', { status: input.status })
    return { ok: true }
  })

export const getAdminComplaintCategories = createServerFn({ method: 'GET' }).handler(async () => {
  const { supabase } = await requireStaff(['superadmin', 'admin'])
  const { data, error } = await supabase.from('complaint_categories').select('*').order('sort_order')
  if (error) throw error
  return data
})

export const saveComplaintCategory = createServerFn({ method: 'POST' })
  .validator((input: { id?: string; name: string; description: string; color: string; sortOrder: number; isActive: boolean }) => input)
  .handler(async ({ data: input }) => {
    const { supabase, user } = await requireStaff(['superadmin', 'admin'])
    const name = input.name.trim().slice(0, 100)
    const description = input.description.trim().slice(0, 500) || null
    const color = /^#[0-9a-f]{6}$/iu.test(input.color) ? input.color : '#2d6045'
    if (name.length < 2) throw new Error('El nombre de la categoría es obligatorio')
    const payload = { name, description, color, sort_order: Math.max(0, Math.round(input.sortOrder)), is_active: input.isActive }
    const result = input.id
      ? await supabase.from('complaint_categories').update(payload).eq('id', input.id)
      : await supabase.from('complaint_categories').insert(payload)
    if (result.error) throw result.error
    await writeAudit(user.id, input.id ? 'category_updated' : 'category_created', 'complaint_category', input.id ?? null, name)
    return { ok: true }
  })

export const deleteComplaintCategory = createServerFn({ method: 'POST' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data: input }) => {
    const { supabase, user } = await requireStaff(['superadmin', 'admin'])
    const { data: category, error: lookupError } = await supabase.from('complaint_categories').select('name').eq('id', input.id).single()
    if (lookupError) throw lookupError
    const { count, error: countError } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('category', category.name)
    if (countError) throw countError
    if ((count ?? 0) > 0) throw new Error('Esta categoría tiene denuncias asociadas. Desactívela en lugar de eliminarla.')
    const { error } = await supabase.from('complaint_categories').delete().eq('id', input.id)
    if (error) throw error
    await writeAudit(user.id, 'category_deleted', 'complaint_category', input.id, category.name)
    return { ok: true }
  })

export const getAdminUsers = createServerFn({ method: 'GET' }).handler(async () => {
  const { user } = await requireStaff(['superadmin'])
  const admin = createAdminServerClient()
  const [profiles, authUsers] = await Promise.all([
    admin.from('profiles').select('*').order('full_name'),
    admin.auth.admin.listUsers({ perPage: 1_000 }),
  ])
  if (profiles.error) throw profiles.error
  if (authUsers.error) throw authUsers.error
  const authById = new Map(authUsers.data.users.map((authUser) => [authUser.id, authUser]))
  return {
    currentUserId: user.id,
    users: profiles.data.map((profile) => {
      const authUser = authById.get(profile.id)
      return {
        ...profile,
        lastSignInAt: authUser?.last_sign_in_at ?? null,
        emailConfirmedAt: authUser?.email_confirmed_at ?? null,
      }
    }),
  }
})

export const createCmsUser = createServerFn({ method: 'POST' })
  .validator((input: { email: string; password: string; fullName: string; role: CmsRole }) => input)
  .handler(async ({ data: input }) => {
    const { user: actor } = await requireStaff(['superadmin'])
    const email = input.email.trim().toLowerCase().slice(0, 200)
    const fullName = input.fullName.trim().slice(0, 160)
    if (!/^\S+@\S+\.\S+$/u.test(email) || fullName.length < 2 || input.password.length < 8) throw new Error('Complete nombre, correo y una contraseña de al menos 8 caracteres')
    const admin = createAdminServerClient()
    const { data, error } = await admin.auth.admin.createUser({ email, password: input.password, email_confirm: true, user_metadata: { full_name: fullName } })
    if (error) throw error
    const { error: profileError } = await admin.from('profiles').upsert({ id: data.user.id, email, full_name: fullName, role: input.role, is_active: true })
    if (profileError) {
      await admin.auth.admin.deleteUser(data.user.id).catch(() => undefined)
      throw profileError
    }
    await writeAudit(actor.id, 'user_created', 'profile', data.user.id, `Cuenta creada para ${fullName}`, { role: input.role })
    return { ok: true }
  })

export const updateCmsUser = createServerFn({ method: 'POST' })
  .validator((input: { id: string; fullName: string; role: CmsRole; isActive: boolean }) => input)
  .handler(async ({ data: input }) => {
    const { user } = await requireStaff(['superadmin'])
    const fullName = input.fullName.trim().slice(0, 160)
    if (fullName.length < 2) throw new Error('El nombre es obligatorio')
    if (input.id === user.id && (!input.isActive || input.role !== 'superadmin')) throw new Error('No puede desactivar ni reducir el rol de su propia cuenta')
    const admin = createAdminServerClient()
    const { error } = await admin.from('profiles').update({ full_name: fullName, role: input.role, is_active: input.isActive }).eq('id', input.id)
    if (error) throw error
    const { error: metadataError } = await admin.auth.admin.updateUserById(input.id, { user_metadata: { full_name: fullName } })
    if (metadataError) throw metadataError
    await writeAudit(user.id, 'user_updated', 'profile', input.id, `Acceso actualizado para ${fullName}`, { role: input.role, isActive: input.isActive })
    return { ok: true }
  })

export const resetCmsUserPassword = createServerFn({ method: 'POST' })
  .validator((input: { id: string; password: string }) => input)
  .handler(async ({ data: input }) => {
    const { user } = await requireStaff(['superadmin'])
    if (input.password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres')
    const { error } = await createAdminServerClient().auth.admin.updateUserById(input.id, { password: input.password })
    if (error) throw error
    await writeAudit(user.id, 'user_password_reset', 'profile', input.id, 'Contraseña institucional renovada')
    return { ok: true }
  })

export const getCmsAuditLogs = createServerFn({ method: 'GET' }).handler(async () => {
  await requireStaff(['superadmin', 'admin'])
  const admin = createAdminServerClient()
  const [logs, profiles] = await Promise.all([
    admin.from('cms_audit_logs').select('*').order('created_at', { ascending: false }).limit(250),
    admin.from('profiles').select('id,full_name,email'),
  ])
  if (logs.error) throw logs.error
  if (profiles.error) throw profiles.error
  const actors = new Map(profiles.data.map((profile) => [profile.id, profile]))
  return logs.data.map((log) => ({ ...log, actor: log.actor_id ? actors.get(log.actor_id) ?? null : null }))
})
