export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type CmsRole = 'superadmin' | 'admin' | 'editor' | 'helpdesk'
export type ContentStatus = 'draft' | 'published' | 'archived'
export type AuthorityType = 'alcalde' | 'concejal' | 'directivo' | 'unidad'
export type WorkStatus = 'adjudicado' | 'en_ejecucion' | 'ejecutado'
export type ComplaintStatus = 'abierto' | 'en_revision' | 'resuelto'

export type ComplaintCategory = {
  id: string
  name: string
  description: string | null
  color: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type CmsAuditLog = {
  id: string
  actor_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  summary: string
  metadata: Json
  created_at: string
}

type TableDefinition<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Profile = {
  id: string
  email: string
  full_name: string
  role: CmsRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Authority = {
  id: string
  parent_id: string | null
  full_name: string
  position: string
  authority_type: AuthorityType
  organization_area: string | null
  biography: string | null
  photo_url: string | null
  sort_order: number
  status: ContentStatus
  created_by: string | null
  updated_by: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export type Work = {
  id: string
  slug: string
  title: string
  summary: string | null
  description: string | null
  location: string
  contractor: string | null
  budget: number
  physical_progress: number
  status: WorkStatus
  content_status: ContentStatus
  cover_image_url: string | null
  gallery_urls: string[]
  started_at: string | null
  expected_end_at: string | null
  completed_at: string | null
  created_by: string | null
  updated_by: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export type NewsArticle = {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  category: 'Salud' | 'Turismo' | 'Educación'
  cover_image_url: string | null
  status: ContentStatus
  created_by: string | null
  updated_by: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export type Document = {
  id: string
  title: string
  description: string | null
  category: 'POA' | 'Resolución'
  document_number: string | null
  fiscal_year: number
  file_path: string
  file_name: string
  mime_type: string
  file_size_bytes: number | null
  status: ContentStatus
  created_by: string | null
  updated_by: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export type Procedure = {
  id: string
  title: string
  description: string | null
  requirements: string[] | null
  cost: number | null
  estimated_duration: string | null
  category: string
  status: ContentStatus
  created_by: string | null
  updated_by: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export type Complaint = {
  id: string
  ticket_number: string
  full_name: string
  identity_document: string | null
  email: string | null
  phone: string
  category: string
  location: string
  latitude: number | null
  longitude: number | null
  description: string
  status: ComplaintStatus
  assigned_to: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export type ComplaintUpdate = {
  id: string
  complaint_id: string
  author_id: string | null
  from_status: ComplaintStatus | null
  to_status: ComplaintStatus | null
  message: string
  is_public: boolean
  created_at: string
}

export type HrEmployeeStatus = 'active' | 'inactive' | 'suspended'
export type HrContractType = 'indefinido' | 'plazo_fijo' | 'consultoria' | 'eventual'

export type HrEmployee = {
  id: string
  identity_document: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  date_of_birth: string | null
  address: string | null
  status: HrEmployeeStatus
  created_at: string
  updated_at: string
}

export type HrContract = {
  id: string
  employee_id: string
  contract_type: HrContractType
  position: string
  department: string
  salary: number
  start_date: string
  end_date: string | null
  created_at: string
  updated_at: string
}

export type InventoryAssetCategory = 'vehículo' | 'equipo_computo' | 'mueble' | 'inmueble' | 'maquinaria' | 'otro'
export type InventoryAssetStatus = 'operativo' | 'mantenimiento' | 'de_baja'

export type InventoryAsset = {
  id: string
  asset_code: string
  name: string
  description: string | null
  category: InventoryAssetCategory
  status: InventoryAssetStatus
  acquisition_date: string | null
  acquisition_cost: number | null
  location: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export type HomeBanner = {
  id: string
  title: string
  eyebrow: string | null
  image_url: string
  link_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: TableDefinition<
        Profile,
        {
          id: string
          email: string
          full_name?: string
          role?: CmsRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        },
        Partial<Omit<Profile, 'id' | 'created_at'>>
      >
      authorities: TableDefinition<
        Authority,
        {
          id?: string
          parent_id?: string | null
          full_name: string
          position: string
          authority_type: AuthorityType
          organization_area?: string | null
          biography?: string | null
          photo_url?: string | null
          sort_order?: number
          status?: ContentStatus
          created_by?: string | null
          updated_by?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        },
        Partial<Omit<Authority, 'id' | 'created_at'>>
      >
      works: TableDefinition<
        Work,
        {
          id?: string
          slug: string
          title: string
          summary?: string | null
          description?: string | null
          location?: string
          contractor?: string | null
          budget?: number
          physical_progress?: number
          status?: WorkStatus
          content_status?: ContentStatus
          cover_image_url?: string | null
          gallery_urls?: string[]
          started_at?: string | null
          expected_end_at?: string | null
          completed_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        },
        Partial<Omit<Work, 'id' | 'created_at'>>
      >
      news: TableDefinition<
        NewsArticle,
        {
          id?: string
          slug: string
          title: string
          excerpt?: string
          body?: string
          category: NewsArticle['category']
          cover_image_url?: string | null
          status?: ContentStatus
          created_by?: string | null
          updated_by?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        },
        Partial<Omit<NewsArticle, 'id' | 'created_at'>>
      >
      documents: TableDefinition<
        Document,
        {
          id?: string
          title: string
          description?: string | null
          category: Document['category']
          document_number?: string | null
          fiscal_year: number
          file_path: string
          file_name: string
          mime_type?: string
          file_size_bytes?: number | null
          status?: ContentStatus
          created_by?: string | null
          updated_by?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        },
        Partial<Omit<Document, 'id' | 'created_at'>>
      >
      procedures: TableDefinition<
        Procedure,
        {
          id?: string
          title: string
          description?: string | null
          requirements?: string[] | null
          cost?: number | null
          estimated_duration?: string | null
          category: string
          status?: ContentStatus
          created_by?: string | null
          updated_by?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        },
        Partial<Omit<Procedure, 'id' | 'created_at'>>
      >
      complaint_ticket_counters: TableDefinition<
        { ticket_year: number; last_value: number },
        { ticket_year: number; last_value?: number },
        { last_value?: number }
      >
      complaint_categories: TableDefinition<
        ComplaintCategory,
        { id?: string; name: string; description?: string | null; color?: string; is_active?: boolean; sort_order?: number; created_at?: string; updated_at?: string },
        Partial<Omit<ComplaintCategory, 'id' | 'created_at'>>
      >
      cms_audit_logs: TableDefinition<
        CmsAuditLog,
        { id?: string; actor_id?: string | null; action: string; entity_type: string; entity_id?: string | null; summary: string; metadata?: Json; created_at?: string },
        never
      >
      complaints: TableDefinition<
        Complaint,
        {
          id?: string
          ticket_number: string
          full_name: string
          identity_document?: string | null
          email?: string | null
          phone: string
          category: string
          location: string
          latitude?: number | null
          longitude?: number | null
          description: string
          status?: ComplaintStatus
          assigned_to?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        },
        Partial<Omit<Complaint, 'id' | 'ticket_number' | 'created_at'>>
      >
      complaint_updates: TableDefinition<
        ComplaintUpdate,
        {
          id?: string
          complaint_id: string
          author_id?: string | null
          from_status?: ComplaintStatus | null
          to_status?: ComplaintStatus | null
          message: string
          is_public?: boolean
          created_at?: string
        },
        Partial<Omit<ComplaintUpdate, 'id' | 'complaint_id' | 'created_at'>>
      >
      hr_employees: TableDefinition<
        HrEmployee,
        {
          id?: string
          identity_document: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          address?: string | null
          status?: HrEmployeeStatus
          created_at?: string
          updated_at?: string
        },
        Partial<Omit<HrEmployee, 'id' | 'created_at'>>
      >
      hr_contracts: TableDefinition<
        HrContract,
        {
          id?: string
          employee_id: string
          contract_type: HrContractType
          position: string
          department: string
          salary?: number
          start_date: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
        },
        Partial<Omit<HrContract, 'id' | 'created_at'>>
      >
      inventory_assets: TableDefinition<
        InventoryAsset,
        {
          id?: string
          asset_code: string
          name: string
          description?: string | null
          category: InventoryAssetCategory
          status?: InventoryAssetStatus
          acquisition_date?: string | null
          acquisition_cost?: number | null
          location?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        },
        Partial<Omit<InventoryAsset, 'id' | 'created_at'>>
      >
      home_banners: TableDefinition<
        HomeBanner,
        {
          id?: string
          title: string
          eyebrow?: string | null
          image_url: string
          link_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        },
        Partial<Omit<HomeBanner, 'id' | 'created_at'>>
      >
    }
    Views: Record<string, never>
    Functions: {
      create_complaint: {
        Args: {
          p_full_name: string
          p_identity_document: string
          p_email: string
          p_phone: string
          p_category: string
          p_location: string
          p_description: string
          p_latitude?: number | null
          p_longitude?: number | null
        }
        Returns: string
      }
      track_complaint: {
        Args: { p_ticket_number: string }
        Returns: Array<{
          ticket_number: string
          status: ComplaintStatus
          category: string
          created_at: string
          updated_at: string
          public_updates: Json
        }>
      }
    }
    Enums: {
      cms_role: CmsRole
      content_status: ContentStatus
      authority_type: AuthorityType
      work_status: WorkStatus
      complaint_status: ComplaintStatus
    }
    CompositeTypes: Record<string, never>
  }
}
