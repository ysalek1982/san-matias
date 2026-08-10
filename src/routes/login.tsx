import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { MunicipalMark } from '@/components/brand/municipal-mark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export const Route = createFileRoute('/login')({ component: LoginPage })

function LoginPage() { const router = useRouter(); const [pending, setPending] = useState(false)
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setPending(true); const form = new FormData(event.currentTarget); const { error } = await getSupabaseBrowserClient().auth.signInWithPassword({ email: String(form.get('email')), password: String(form.get('password')) }); if (error) { toast.error('Credenciales incorrectas'); setPending(false); return } await router.navigate({ to: '/admin' }) }
  return <main className="grid min-h-screen bg-forest-950 lg:grid-cols-2"><section className="relative hidden overflow-hidden lg:block"><img src="/images/pantanal.png" alt="Paisaje del Pantanal" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/30 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-14 text-white"><p className="text-xs font-extrabold tracking-[.18em] text-earth-200 uppercase">Sistema institucional</p><h1 className="mt-4 max-w-xl font-display text-6xl leading-[.95] font-semibold">Gestionar también es cuidar.</h1><p className="mt-5 max-w-md text-sm leading-7 text-white/65">Administre información pública y atención ciudadana desde un único lugar.</p></div></section><section className="grid place-items-center bg-[#f4f1e9] p-6"><div className="w-full max-w-md"><Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-forest-900"><ArrowLeft className="size-4" /> Volver al portal</Link><div className="rounded-[2rem] border border-forest-900/10 bg-white p-8 shadow-xl shadow-forest-950/5"><div className="flex items-center gap-3"><MunicipalMark /><div><p className="font-display text-xl font-semibold text-forest-950">CMS San Matías</p><p className="text-xs text-muted-foreground">Acceso para servidores públicos</p></div></div><form method="post" action="/login" onSubmit={submit} className="mt-9 grid gap-5"><div className="grid gap-2"><Label htmlFor="email">Correo institucional</Label><Input id="email" name="email" type="email" required autoComplete="username" /></div><div className="grid gap-2"><Label htmlFor="password">Contraseña</Label><Input id="password" name="password" type="password" required autoComplete="current-password" /></div><Button disabled={pending} className="mt-2 h-12 rounded-xl"><LockKeyhole /> {pending ? 'Ingresando…' : 'Ingresar al sistema'}</Button></form></div></div></section></main> }
