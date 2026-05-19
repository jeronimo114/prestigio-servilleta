import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import type { DatosAnio } from '@/types/servilleta'
import { buildServilletaWorkbook } from '@/lib/excel-builder'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { empresa, anioAnterior, anioActual, datosAnioAnterior, datosAnioActual } = body as {
      empresa: string
      nombre: string
      anioAnterior: number
      anioActual: number
      datosAnioAnterior: DatosAnio
      datosAnioActual: DatosAnio
    }

    const templatePath = path.join(process.cwd(), 'lib', 'templates', 'servilleta.xlsm')
    const templateBuffer = fs.readFileSync(templatePath)

    const wb = await buildServilletaWorkbook(
      { empresa, anioAnterior, anioActual, datosAnioAnterior, datosAnioActual },
      templateBuffer
    )

    const buffer = await wb.xlsx.writeBuffer()

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="servilleta-${empresa.replace(/\s+/g, '-').toLowerCase()}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Error generando Excel' }, { status: 500 })
  }
}
