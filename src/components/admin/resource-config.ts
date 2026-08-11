import type { ResourceField } from './resource-manager'

export const publicationOptions = [
  { value: 'draft', label: 'Borrador' }, { value: 'published', label: 'Publicado' }, { value: 'archived', label: 'Archivado' },
]

export const workFields: ResourceField[] = [
  { key: 'title', label: 'Título', required: true }, { key: 'slug', label: 'Slug URL', required: true },
  { key: 'summary', label: 'Resumen', type: 'textarea' }, { key: 'description', label: 'Descripción', type: 'textarea' },
  { key: 'location', label: 'Ubicación', required: true }, { key: 'contractor', label: 'Contratista' },
  { key: 'budget', label: 'Presupuesto (Bs)', type: 'number', defaultValue: '0' }, { key: 'physical_progress', label: 'Avance físico (%)', type: 'number', defaultValue: '0' },
  { key: 'status', label: 'Estado de obra', type: 'select', defaultValue: 'adjudicado', options: [{ value: 'adjudicado', label: 'Adjudicado' }, { value: 'en_ejecucion', label: 'En ejecución' }, { value: 'ejecutado', label: 'Ejecutado' }] },
  { key: 'content_status', label: 'Publicación', type: 'select', defaultValue: 'draft', options: publicationOptions }, { key: 'cover_image_url', label: 'Imagen de la obra', type: 'image' },
]

export const authorityFields: ResourceField[] = [
  { key: 'full_name', label: 'Nombre completo', required: true }, { key: 'position', label: 'Cargo', required: true },
  { key: 'authority_type', label: 'Tipo', type: 'select', defaultValue: 'directivo', options: [{ value: 'alcalde', label: 'Alcalde' }, { value: 'concejal', label: 'Concejal' }, { value: 'directivo', label: 'Directivo' }, { value: 'unidad', label: 'Unidad' }] },
  { key: 'organization_area', label: 'Área institucional' }, { key: 'biography', label: 'Reseña', type: 'textarea' }, { key: 'photo_url', label: 'Fotografía de perfil', type: 'image', hint: 'Use una fotografía vertical 4:5 o una composición cuadrada con buena resolución. El sistema conservará sus proporciones.' },
  { key: 'sort_order', label: 'Orden', type: 'number', defaultValue: '0' }, { key: 'status', label: 'Publicación', type: 'select', defaultValue: 'draft', options: publicationOptions },
]

export const newsFields: ResourceField[] = [
  { key: 'title', label: 'Título', required: true }, { key: 'slug', label: 'Slug URL', required: true }, { key: 'excerpt', label: 'Resumen', type: 'textarea', required: true }, { key: 'body', label: 'Contenido', type: 'textarea', required: true },
  { key: 'category', label: 'Categoría', type: 'select', defaultValue: 'Salud', options: [{ value: 'Salud', label: 'Salud' }, { value: 'Turismo', label: 'Turismo' }, { value: 'Educación', label: 'Educación' }] },
  { key: 'cover_image_url', label: 'Imagen de portada', type: 'image' }, { key: 'status', label: 'Publicación', type: 'select', defaultValue: 'draft', options: publicationOptions },
]

export const documentFields: ResourceField[] = [
  { key: 'title', label: 'Título', required: true }, { key: 'description', label: 'Descripción', type: 'textarea' },
  { key: 'category', label: 'Categoría', type: 'select', defaultValue: 'POA', options: [{ value: 'POA', label: 'POA' }, { value: 'Resolución', label: 'Resolución' }] },
  { key: 'document_number', label: 'Número de documento' }, { key: 'fiscal_year', label: 'Gestión', type: 'number', defaultValue: '2026' },
  { key: 'file_path', label: 'Archivo PDF', type: 'file', required: true }, { key: 'status', label: 'Publicación', type: 'select', defaultValue: 'draft', options: publicationOptions },
]

export const proceduresFields: ResourceField[] = [
  { key: 'title', label: 'Nombre del Trámite', required: true }, { key: 'description', label: 'Descripción', type: 'textarea' },
  { key: 'requirements', label: 'Requisitos (uno por línea)', type: 'textarea' },
  { key: 'cost', label: 'Costo (Bs)', type: 'number', defaultValue: '0' }, { key: 'estimated_duration', label: 'Tiempo estimado' },
  { key: 'category', label: 'Área Municipal (Categoría)', required: true },
  { key: 'status', label: 'Publicación', type: 'select', defaultValue: 'draft', options: publicationOptions },
]

export const hrEmployeeFields: ResourceField[] = [
  { key: 'identity_document', label: 'Cédula de Identidad', required: true },
  { key: 'first_name', label: 'Nombres', required: true }, { key: 'last_name', label: 'Apellidos', required: true },
  { key: 'email', label: 'Correo electrónico' }, { key: 'phone', label: 'Teléfono' },
  { key: 'date_of_birth', label: 'Fecha de nacimiento (YYYY-MM-DD)' }, { key: 'address', label: 'Dirección' },
  { key: 'status', label: 'Estado', type: 'select', defaultValue: 'active', options: [{ value: 'active', label: 'Activo' }, { value: 'inactive', label: 'Inactivo' }, { value: 'suspended', label: 'Suspendido' }] }
]

export const hrContractFields: ResourceField[] = [
  { key: 'employee_id', label: 'ID del Empleado (UUID)', required: true },
  { key: 'contract_type', label: 'Tipo de Contrato', type: 'select', defaultValue: 'plazo_fijo', options: [{ value: 'indefinido', label: 'Indefinido' }, { value: 'plazo_fijo', label: 'Plazo Fijo' }, { value: 'consultoria', label: 'Consultoría (Línea)' }, { value: 'eventual', label: 'Eventual' }] },
  { key: 'position', label: 'Cargo', required: true }, { key: 'department', label: 'Secretaría / Dirección', required: true },
  { key: 'salary', label: 'Salario (Bs)', type: 'number', required: true, defaultValue: '0' },
  { key: 'start_date', label: 'Fecha de inicio (YYYY-MM-DD)', required: true }, { key: 'end_date', label: 'Fecha de conclusión (YYYY-MM-DD)' }
]

export const inventoryAssetFields: ResourceField[] = [
  { key: 'asset_code', label: 'Código Patrimonial', required: true },
  { key: 'name', label: 'Nombre del Bien (ej. Camioneta Hilux)', required: true },
  { key: 'description', label: 'Descripción / Marca / Serie', type: 'textarea' },
  { key: 'category', label: 'Categoría', type: 'select', defaultValue: 'mueble', options: [{ value: 'vehículo', label: 'Vehículo' }, { value: 'equipo_computo', label: 'Equipo de Cómputo' }, { value: 'mueble', label: 'Mueble/Enser' }, { value: 'inmueble', label: 'Inmueble' }, { value: 'maquinaria', label: 'Maquinaria Pesada' }, { value: 'otro', label: 'Otro' }] },
  { key: 'status', label: 'Estado', type: 'select', defaultValue: 'operativo', options: [{ value: 'operativo', label: 'Operativo' }, { value: 'mantenimiento', label: 'En Mantenimiento' }, { value: 'de_baja', label: 'De Baja / Desechado' }] },
  { key: 'acquisition_date', label: 'Fecha de Adquisición (YYYY-MM-DD)' },
  { key: 'acquisition_cost', label: 'Costo de Adquisición (Bs)', type: 'number', defaultValue: '0' },
  { key: 'location', label: 'Ubicación / Oficina' },
  { key: 'assigned_to', label: 'ID del Empleado Responsable (UUID, opcional)' }
]

export const homeBannerFields: ResourceField[] = [
  { key: 'title', label: 'Título del Banner (ej. La Curicha)', required: true },
  { key: 'eyebrow', label: 'Subtítulo / Etiqueta (ej. Agua natural)' },
  { key: 'image_url', label: 'Imagen de portada', type: 'image', required: true },
  { key: 'link_url', label: 'Enlace al hacer clic (opcional, ej. /turismo)' },
  { key: 'sort_order', label: 'Orden de aparición', type: 'number', defaultValue: '1' },
  { key: 'is_active', label: 'Visibilidad', type: 'select', defaultValue: 'true', options: [{ value: 'true', label: 'Activo' }, { value: 'false', label: 'Oculto' }] },
]
