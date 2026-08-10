import { Badge } from '@/components/ui/badge'
import type { ComplaintStatus, WorkStatus } from '@/types/database'

const workLabels: Record<WorkStatus, string> = {
  adjudicado: 'Adjudicado',
  en_ejecucion: 'En ejecución',
  ejecutado: 'Ejecutado',
}

const complaintLabels: Record<ComplaintStatus, string> = {
  abierto: 'Abierto',
  en_revision: 'En revisión',
  resuelto: 'Resuelto',
}

export function WorkStatusBadge({ status }: { status: WorkStatus }) {
  return <Badge className="rounded-full border-0 bg-white/90 px-3 py-1 text-forest-900 shadow-sm">{workLabels[status]}</Badge>
}

export function ComplaintStatusBadge({ status }: { status: ComplaintStatus }) {
  const styles: Record<ComplaintStatus, string> = {
    abierto: 'bg-earth-100 text-earth-800',
    en_revision: 'bg-sky-100 text-sky-900',
    resuelto: 'bg-forest-100 text-forest-900',
  }
  return <Badge className={`rounded-full border-0 px-3 py-1 ${styles[status]}`}>{complaintLabels[status]}</Badge>
}

