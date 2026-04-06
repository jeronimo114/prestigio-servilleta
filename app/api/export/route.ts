import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import path from 'path'
import fs from 'fs'
import type { DatosAnio } from '@/types/servilleta'

// Compute derived P&G values from new input fields
function derivar(d: DatosAnio) {
  const utilidadBruta = d.ingresosOperacionales - d.costosTotales
  const utilidadOperacional = utilidadBruta - d.gastosTotales
  const ebitda = utilidadOperacional + d.depreciacionesAmortizaciones
  return { utilidadBruta, utilidadOperacional, ebitda }
}

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

    // Derive calculated P&G fields
    const derivAnt = derivar(datosAnioAnterior)
    const derivAct = derivar(datosAnioActual)

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

    // --- Clear column D, E, G (third year we don't have) ---
    const clearRows = [4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33]
    for (const row of clearRows) {
      ws.getCell(`D${row}`).value = null
      ws.getCell(`E${row}`).value = null
      ws.getCell(`G${row}`).value = null
    }
    const indicatorRows = [37, 38, 39, 40, 41, 42, 43, 44, 46, 47, 48, 50, 51, 53, 54, 55, 56, 57, 58, 59]
    for (const row of indicatorRows) {
      ws.getCell(`D${row}`).value = null
    }

    // --- Estado de Resultados ---
    // Column F = anioAnterior
    setInput('F7', datosAnioAnterior.ingresosOperacionales)
    setInput('F8', derivAnt.utilidadBruta)
    setInput('F9', derivAnt.ebitda)
    setInput('F10', derivAnt.utilidadOperacional)
    setInput('F11', datosAnioAnterior.intereses || 0)
    setInput('F12', datosAnioAnterior.impuestos)
    setInput('F13', datosAnioAnterior.otrosIngresosEgresos || 0)

    // Column H = anioActual
    setInput('H7', datosAnioActual.ingresosOperacionales)
    setInput('H8', derivAct.utilidadBruta)
    setInput('H9', derivAct.ebitda)
    setInput('H10', derivAct.utilidadOperacional)
    setInput('H11', datosAnioActual.intereses || 0)
    setInput('H12', datosAnioActual.impuestos)
    setInput('H13', datosAnioActual.otrosIngresosEgresos || 0)

    // --- Balance General - Activos ---
    setInput('F16', datosAnioAnterior.carteraNeta)
    setInput('F17', datosAnioAnterior.inventarios)
    setInput('F18', datosAnioAnterior.activosFijosNetos)
    setInput('F19', datosAnioAnterior.otrosActivos || 0)

    setInput('H16', datosAnioActual.carteraNeta)
    setInput('H17', datosAnioActual.inventarios)
    setInput('H18', datosAnioActual.activosFijosNetos)
    setInput('H19', datosAnioActual.otrosActivos || 0)

    // --- Balance General - Pasivos ---
    setInput('F21', datosAnioAnterior.obligacionesFinancierasCP || 0)
    setInput('F22', datosAnioAnterior.obligacionesFinancierasLP || 0)
    setInput('F24', datosAnioAnterior.proveedores)
    setInput('F25', datosAnioAnterior.otrosPasivos || 0)
    setInput('F27', datosAnioAnterior.capitalSuperavit || 0)
    setInput('F28', datosAnioAnterior.totalPatrimonio || 0)

    setInput('H21', datosAnioActual.obligacionesFinancierasCP || 0)
    setInput('H22', datosAnioActual.obligacionesFinancierasLP || 0)
    setInput('H24', datosAnioActual.proveedores)
    setInput('H25', datosAnioActual.otrosPasivos || 0)
    setInput('H27', datosAnioActual.capitalSuperavit || 0)
    setInput('H28', datosAnioActual.totalPatrimonio || 0)

    // --- Mini servilleta ---
    const mini = wb.getWorksheet('Mini servilleta')
    if (mini) {
      function setMini(cell: string, value: number | string | Date) {
        const c = mini!.getCell(cell)
        c.value = value as ExcelJS.CellValue
      }

      setMini('C2', new Date(anioAnterior, 11, 31))
      setMini('D2', new Date(anioActual, 11, 31))

      // Estado de Resultados
      setMini('C5', datosAnioAnterior.ingresosOperacionales)
      setMini('D5', datosAnioActual.ingresosOperacionales)

      // Costos y gastos
      setMini('C6', datosAnioAnterior.costosTotales + datosAnioAnterior.gastosTotales)
      setMini('D6', datosAnioActual.costosTotales + datosAnioActual.gastosTotales)

      setMini('C7', derivAnt.ebitda)
      setMini('D7', derivAct.ebitda)

      setMini('C8', datosAnioAnterior.intereses || 0)
      setMini('D8', datosAnioActual.intereses || 0)

      setMini('C9', datosAnioAnterior.impuestos)
      setMini('D9', datosAnioActual.impuestos)

      // Balance General
      setMini('C11', datosAnioAnterior.carteraNeta)
      setMini('D11', datosAnioActual.carteraNeta)

      setMini('C12', datosAnioAnterior.inventarios)
      setMini('D12', datosAnioActual.inventarios)

      setMini('C13', datosAnioAnterior.activosFijosNetos)
      setMini('D13', datosAnioActual.activosFijosNetos)

      setMini('C14', datosAnioAnterior.proveedores)
      setMini('D14', datosAnioActual.proveedores)
    }

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
