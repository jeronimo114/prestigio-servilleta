import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      // Return a fake ID so the app still works without Supabase
      return NextResponse.json({ id: 'local-' + Date.now() })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        nombre: body.nombre,
        empresa: body.empresa,
        email: body.email || null,
        datos: {
          sector: body.sector,
          anioAnterior: body.anioAnterior,
          anioActual: body.anioActual,
          datosAnioAnterior: body.datosAnioAnterior,
          datosAnioActual: body.datosAnioActual,
        },
        indicadores: {
          indicadoresAnterior: body.indicadoresAnterior,
          indicadoresActual: body.indicadoresActual,
        },
        completed_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ id: 'local-' + Date.now() })
    }

    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ id: 'local-' + Date.now() })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id || id.startsWith('local-')) {
    return NextResponse.json({ error: 'Session local' }, { status: 404 })
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 404 })

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
