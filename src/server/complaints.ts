import { createServerFn } from '@tanstack/react-start'

import { createPublicServerClient } from '@/lib/supabase/server'

type ComplaintInput = {
  fullName: string
  identityDocument: string
  email: string
  phone: string
  category: string
  location: string
  latitude: number | null
  longitude: number | null
  description: string
}

function clean(value: string, max: number): string {
  return value.trim().slice(0, max)
}

export const createComplaintTicket = createServerFn({ method: 'POST' })
  .validator((input: ComplaintInput) => input)
  .handler(async ({ data: input }) => {
    const hasCoordinates = Number.isFinite(input.latitude) && Number.isFinite(input.longitude)
    const latitude = hasCoordinates ? Number(input.latitude) : null
    const longitude = hasCoordinates ? Number(input.longitude) : null
    if ((latitude !== null && (latitude < -90 || latitude > 90)) || (longitude !== null && (longitude < -180 || longitude > 180))) {
      throw new Error('La ubicación geográfica no es válida.')
    }
    const payload = {
      p_full_name: clean(input.fullName, 160),
      p_identity_document: clean(input.identityDocument, 40),
      p_email: clean(input.email, 160),
      p_phone: clean(input.phone, 40),
      p_category: clean(input.category, 100),
      p_location: clean(input.location, 240),
      p_description: clean(input.description, 5_000),
      p_latitude: latitude,
      p_longitude: longitude,
    }
    if (payload.p_full_name.length < 2 || payload.p_phone.length < 5 || payload.p_description.length < 10) {
      throw new Error('Complete los campos obligatorios con información válida.')
    }
    const { data, error } = await createPublicServerClient().rpc('create_complaint', payload)
    if (error) throw new Error(error.message)
    return { ticketNumber: data }
  })

export const trackComplaint = createServerFn({ method: 'GET' })
  .validator((input: { ticketNumber: string }) => input)
  .handler(async ({ data: input }) => {
    const ticketNumber = input.ticketNumber.trim().toUpperCase().slice(0, 30)
    if (!/^SM-\d{4}-\d{3,}$/u.test(ticketNumber)) return null
    const { data, error } = await createPublicServerClient().rpc('track_complaint', { p_ticket_number: ticketNumber })
    if (error) throw new Error(error.message)
    return data[0] ?? null
  })
