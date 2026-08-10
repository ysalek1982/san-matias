import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Download, FileSearch2, FileText, Filter, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { PageHero } from '@/components/layout/page-hero'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getDocuments } from '@/server/public'

export const Route = createFileRoute('/documentos')({
  loader: () => getDocuments(),
  component: DocumentsPage,
})

function DocumentsPage() {
  const documents = Route.useLoaderData()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [fiscalYear, setFiscalYear] = useState('all')

  const categories = useMemo(() => ['all', ...new Set(documents.map((d) => d.category))], [documents])
  const years = useMemo(() => ['all', ...new Set(documents.map((d) => String(d.fiscal_year)))], [documents])

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchCat = category === 'all' || doc.category === category
      const matchYear = fiscalYear === 'all' || String(doc.fiscal_year) === fiscalYear
      const q = search.toLowerCase().trim()
      const matchSearch =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        (doc.document_number && doc.document_number.toLowerCase().includes(q)) ||
        doc.file_name.toLowerCase().includes(q) ||
        (doc.description && doc.description.toLowerCase().includes(q))

      return matchCat && matchYear && matchSearch
    })
  }, [documents, category, fiscalYear, search])

  return (
    <main>
      <PageHero
        eyebrow="Gobierno abierto"
        title="Documentos y transparencia"
        description="Acceda al Plan Operativo Anual (POA), resoluciones municipales y documentación pública organizada por gestión."
        aside={
          <div className="rounded-2xl border border-white/15 bg-white/5 px-6 py-5 text-center backdrop-blur">
            <strong className="font-display text-4xl font-semibold">{documents.length}</strong>
            <span className="mt-1 block text-xs text-white/60">documentos publicados</span>
          </div>
        }
      />

      <section className="mx-auto max-w-7xl px-6 py-16">
        {/* Search and Filters Bar */}
        <div className="mb-8 grid gap-4 rounded-2xl border border-forest-900/10 bg-white p-5 shadow-sm sm:grid-cols-[1fr_auto_auto]">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, número o contenido..."
              className="rounded-xl border-forest-900/15 pl-10"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <Filter className="size-4 shrink-0 text-earth-700 hidden sm:block" />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full rounded-xl border-forest-900/15 sm:w-44">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.filter((c) => c !== 'all').map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fiscal year filter */}
          <div className="flex items-center gap-2">
            <Calendar className="size-4 shrink-0 text-earth-700 hidden sm:block" />
            <Select value={fiscalYear} onValueChange={setFiscalYear}>
              <SelectTrigger className="w-full rounded-xl border-forest-900/15 sm:w-36">
                <SelectValue placeholder="Gestión" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las gestiones</SelectItem>
                {years.filter((y) => y !== 'all').map((yr) => (
                  <SelectItem key={yr} value={yr}>Gestión {yr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-hidden rounded-[2rem] border border-forest-900/10 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f8f6ef] border-b border-forest-900/10">
                <TableHead className="py-4 font-extrabold text-forest-950 uppercase text-[10px] tracking-wider">Documento</TableHead>
                <TableHead className="font-extrabold text-forest-950 uppercase text-[10px] tracking-wider">Categoría</TableHead>
                <TableHead className="font-extrabold text-forest-950 uppercase text-[10px] tracking-wider">Gestión</TableHead>
                <TableHead className="text-right font-extrabold text-forest-950 uppercase text-[10px] tracking-wider">Descarga</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((document) => (
                <TableRow key={document.id} className="hover:bg-forest-50/50 transition duration-150">
                  <TableCell className="py-4">
                    <div className="flex items-start gap-3.5">
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-forest-100 text-forest-800">
                        <FileText className="size-5" />
                      </span>
                      <div>
                        <p className="font-bold text-forest-950 text-base leading-snug">{document.title}</p>
                        {document.description && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 max-w-xl">{document.description}</p>
                        )}
                        <p className="mt-1 font-mono text-xs text-earth-700">
                          {document.document_number ? `Nº ${document.document_number}` : document.file_name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-middle">
                    <Badge variant="secondary" className="rounded-full bg-forest-100 text-forest-800 font-semibold px-3 py-1">
                      {document.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-middle font-semibold text-forest-900">
                    {document.fiscal_year}
                  </TableCell>
                  <TableCell className="text-right align-middle">
                    <Button asChild size="sm" variant="outline" className="rounded-full border-forest-900/20 font-bold hover:bg-forest-900 hover:text-white">
                      <a href={document.file_path} target="_blank" rel="noopener noreferrer" download>
                        <Download className="size-3.5 mr-1" /> Descargar PDF
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredDocuments.length === 0 && (
            <div className="grid place-items-center px-6 py-20 text-center">
              <FileSearch2 className="size-14 text-forest-300" />
              <h2 className="mt-5 font-display text-2xl font-semibold text-forest-950">
                {documents.length === 0 ? 'Repositorio en actualización' : 'No se encontraron documentos'}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {documents.length === 0
                  ? 'Los documentos serán publicados por la unidad de transparencia desde el panel institucional.'
                  : 'Intente modificar los filtros de búsqueda o la categoría seleccionada.'}
              </p>
            </div>
          )}

          {filteredDocuments.length > 0 && (
            <div className="border-t border-forest-900/10 bg-[#f8f6ef] px-6 py-3 text-xs text-muted-foreground">
              Mostrando {filteredDocuments.length} de {documents.length} documentos públicos
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
