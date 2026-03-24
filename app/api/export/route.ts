import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import path from 'path'
import fs from 'fs'
import type { DatosAnio } from '@/types/servilleta'

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

    // Read the template file
    const templatePath = path.join(process.cwd(), 'lib', 'templates', 'servilleta.xlsm')
    const templateBuffer = fs.readFileSync(templatePath)

    const wb = new ExcelJS.Workbook()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await wb.xlsx.load(templateBuffer as any)

    const ws = wb.getWorksheet('Servilleta Su empresa')
    if (!ws) {
      return NextResponse.json({ error: 'Hoja "Servilleta Su empresa" no encontrada en template' }, { status: 500 })
    }

    // Helper: set cell value preserving style
    function setInput(cell: string, value: number | string | Date) {
      const c = ws!.getCell(cell)
      c.value = value as ExcelJS.CellValue
    }

    // --- Company name (C3 is merged C3:C5) ---
    setInput('C3', `${empresa}\n`)

    // --- Date headers (F4 = anioAnterior, H4 = anioActual) ---
    setInput('F4', new Date(anioAnterior, 11, 31))
    setInput('H4', new Date(anioActual, 11, 31))

    // --- Year/Month metadata (used by rotation formulas) ---
    setInput('F57', anioAnterior)
    setInput('F58', 12)
    setInput('H57', anioActual)
    setInput('H58', 12)

    // --- Clear column D (third year we don't have) ---
    const inputRowsD = [7, 8, 9, 10, 11, 12, 13, 16, 17, 18, 19, 21, 22, 24, 25, 27, 28]
    for (const row of inputRowsD) {
      setInput(`D${row}`, 0)
    }
    setInput('D4', new Date(anioAnterior - 1, 11, 31))
    setInput('D57', anioAnterior - 1)
    setInput('D58', 12)

    // --- Estado de Resultados ---
    // Column F = anioAnterior
    setInput('F7', datosAnioAnterior.ingresosOperacionales)
    setInput('F8', datosAnioAnterior.utilidadBruta)
    setInput('F9', datosAnioAnterior.ebitda)
    setInput('F10', datosAnioAnterior.utilidadOperacional)
    setInput('F11', datosAnioAnterior.intereses)
    setInput('F12', datosAnioAnterior.impuestos)
    setInput('F13', datosAnioAnterior.otrosIngresosEgresos)

    // Column H = anioActual
    setInput('H7', datosAnioActual.ingresosOperacionales)
    setInput('H8', datosAnioActual.utilidadBruta)
    setInput('H9', datosAnioActual.ebitda)
    setInput('H10', datosAnioActual.utilidadOperacional)
    setInput('H11', datosAnioActual.intereses)
    setInput('H12', datosAnioActual.impuestos)
    setInput('H13', datosAnioActual.otrosIngresosEgresos)

    // --- Balance General - Activos ---
    setInput('F16', datosAnioAnterior.carteraNeta)
    setInput('F17', datosAnioAnterior.inventarios)
    setInput('F18', datosAnioAnterior.activosFijosNetos)
    setInput('F19', datosAnioAnterior.otrosActivos)

    setInput('H16', datosAnioActual.carteraNeta)
    setInput('H17', datosAnioActual.inventarios)
    setInput('H18', datosAnioActual.activosFijosNetos)
    setInput('H19', datosAnioActual.otrosActivos)

    // --- Balance General - Pasivos ---
    setInput('F21', datosAnioAnterior.obligacionesFinancierasCP)
    setInput('F22', datosAnioAnterior.obligacionesFinancierasLP)
    setInput('F24', datosAnioAnterior.proveedores)
    setInput('F25', datosAnioAnterior.otrosPasivos)
    setInput('F27', datosAnioAnterior.capitalSuperavit)
    setInput('F28', datosAnioAnterior.totalPatrimonio)

    setInput('H21', datosAnioActual.obligacionesFinancierasCP)
    setInput('H22', datosAnioActual.obligacionesFinancierasLP)
    setInput('H24', datosAnioActual.proveedores)
    setInput('H25', datosAnioActual.otrosPasivos)
    setInput('H27', datosAnioActual.capitalSuperavit)
    setInput('H28', datosAnioActual.totalPatrimonio)

    // Generate xlsx buffer
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
