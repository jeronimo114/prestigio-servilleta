import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import type { DatosAnio } from '@/types/servilleta'
import { calcularDerivedosAnio, calcularIndicadores } from '@/lib/indicadores'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { empresa, nombre, anioAnterior, anioActual, datosAnioAnterior, datosAnioActual } = body as {
      empresa: string
      nombre: string
      anioAnterior: number
      anioActual: number
      datosAnioAnterior: DatosAnio
      datosAnioActual: DatosAnio
    }

    const derivAnt = calcularDerivedosAnio(datosAnioAnterior)
    const derivAct = calcularDerivedosAnio(datosAnioActual)
    const indAnt = calcularIndicadores(datosAnioAnterior)
    const indAct = calcularIndicadores(datosAnioActual, datosAnioAnterior.ingresosOperacionales)

    const wb = new ExcelJS.Workbook()
    wb.creator = 'Prestigio'
    wb.created = new Date()

    // ===================== HOJA 1: SERVILLETA =====================
    const ws = wb.addWorksheet('Servilleta')

    // Styles
    const headerStyle: Partial<ExcelJS.Style> = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003A4B' } },
      font: { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      },
    }
    const subHeaderStyle: Partial<ExcelJS.Style> = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F8FB' } },
      font: { bold: true, color: { argb: 'FF003A4B' } },
      border: {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      },
    }
    const numStyle: Partial<ExcelJS.Style> = {
      numFmt: '#,##0.000',
      alignment: { horizontal: 'right' },
      border: {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      },
    }
    const pctStyle: Partial<ExcelJS.Style> = {
      numFmt: '0.0%',
      alignment: { horizontal: 'right' },
      border: {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      },
    }

    ws.columns = [
      { width: 35 }, // A: Concepto
      { width: 18 }, // B: Año anterior valor
      { width: 12 }, // C: Año anterior %
      { width: 18 }, // D: Año actual valor
      { width: 12 }, // E: Año actual %
      { width: 12 }, // F: Var horizontal
    ]

    // Title
    ws.mergeCells('A1:F1')
    const titleRow = ws.getRow(1)
    titleRow.getCell(1).value = `SERVILLETA FINANCIERA PRESTIGIO — ${empresa.toUpperCase()}`
    titleRow.getCell(1).style = { ...headerStyle, font: { ...headerStyle.font, size: 14 } }
    titleRow.height = 30

    ws.mergeCells('A2:F2')
    ws.getRow(2).getCell(1).value = `Responsable: ${nombre} | Generado: ${new Date().toLocaleDateString('es-CO')} | Prestigio`
    ws.getRow(2).getCell(1).style = { alignment: { horizontal: 'center' }, font: { italic: true, color: { argb: 'FF6B7280' } } }

    // Headers
    const row3 = ws.getRow(3)
    row3.values = ['Concepto', `${anioAnterior} - Valor`, `${anioAnterior} - %`, `${anioActual} - Valor`, `${anioActual} - %`, 'Var. Horiz.']
    row3.eachCell(cell => { cell.style = headerStyle })
    row3.height = 25

    // Section helper
    function addSection(label: string) {
      const r = ws.addRow([label])
      r.getCell(1).style = subHeaderStyle
      ws.mergeCells(`A${r.number}:F${r.number}`)
    }

    function addDataRow(
      label: string,
      valAnt: number,
      pctAnt: number,
      valAct: number,
      pctAct: number,
      varH: number
    ) {
      const r = ws.addRow([label, valAnt, pctAnt, valAct, pctAct, varH])
      r.getCell(1).style = { border: numStyle.border! }
      r.getCell(2).style = numStyle
      r.getCell(3).style = pctStyle
      r.getCell(4).style = numStyle
      r.getCell(5).style = pctStyle
      r.getCell(6).style = pctStyle
    }

    const ingAnt = datosAnioAnterior.ingresosOperacionales || 1
    const ingAct = datosAnioActual.ingresosOperacionales || 1
    const varH = (v: number, ant: number) => ant ? (v - ant) / ant : 0

    // Estado de Resultados
    addSection('ESTADO DE RESULTADOS')
    addDataRow('Ingresos Operacionales', datosAnioAnterior.ingresosOperacionales, 1, datosAnioActual.ingresosOperacionales, 1, varH(datosAnioActual.ingresosOperacionales, datosAnioAnterior.ingresosOperacionales))
    addDataRow('Utilidad Bruta', datosAnioAnterior.utilidadBruta, datosAnioAnterior.utilidadBruta / ingAnt, datosAnioActual.utilidadBruta, datosAnioActual.utilidadBruta / ingAct, varH(datosAnioActual.utilidadBruta, datosAnioAnterior.utilidadBruta))
    addDataRow('EBITDA', datosAnioAnterior.ebitda, datosAnioAnterior.ebitda / ingAnt, datosAnioActual.ebitda, datosAnioActual.ebitda / ingAct, varH(datosAnioActual.ebitda, datosAnioAnterior.ebitda))
    addDataRow('Utilidad Operacional', datosAnioAnterior.utilidadOperacional, datosAnioAnterior.utilidadOperacional / ingAnt, datosAnioActual.utilidadOperacional, datosAnioActual.utilidadOperacional / ingAct, varH(datosAnioActual.utilidadOperacional, datosAnioAnterior.utilidadOperacional))
    addDataRow('Intereses', datosAnioAnterior.intereses, datosAnioAnterior.intereses / ingAnt, datosAnioActual.intereses, datosAnioActual.intereses / ingAct, varH(datosAnioActual.intereses, datosAnioAnterior.intereses))
    addDataRow('Impuestos', datosAnioAnterior.impuestos, datosAnioAnterior.impuestos / ingAnt, datosAnioActual.impuestos, datosAnioActual.impuestos / ingAct, varH(datosAnioActual.impuestos, datosAnioAnterior.impuestos))
    addDataRow('Otros Ingresos/Egresos', datosAnioAnterior.otrosIngresosEgresos, datosAnioAnterior.otrosIngresosEgresos / ingAnt, datosAnioActual.otrosIngresosEgresos, datosAnioActual.otrosIngresosEgresos / ingAct, varH(datosAnioActual.otrosIngresosEgresos, datosAnioAnterior.otrosIngresosEgresos))
    addDataRow('Utilidad Neta', derivAnt.utilidadNeta, derivAnt.utilidadNeta / ingAnt, derivAct.utilidadNeta, derivAct.utilidadNeta / ingAct, varH(derivAct.utilidadNeta, derivAnt.utilidadNeta))

    // Balance
    addSection('BALANCE GENERAL')
    addDataRow('Cartera Neta', datosAnioAnterior.carteraNeta, datosAnioAnterior.carteraNeta / derivAnt.totalActivos, datosAnioActual.carteraNeta, datosAnioActual.carteraNeta / derivAct.totalActivos, varH(datosAnioActual.carteraNeta, datosAnioAnterior.carteraNeta))
    addDataRow('Inventarios', datosAnioAnterior.inventarios, datosAnioAnterior.inventarios / derivAnt.totalActivos, datosAnioActual.inventarios, datosAnioActual.inventarios / derivAct.totalActivos, varH(datosAnioActual.inventarios, datosAnioAnterior.inventarios))
    addDataRow('Activos Fijos Netos', datosAnioAnterior.activosFijosNetos, datosAnioAnterior.activosFijosNetos / derivAnt.totalActivos, datosAnioActual.activosFijosNetos, datosAnioActual.activosFijosNetos / derivAct.totalActivos, varH(datosAnioActual.activosFijosNetos, datosAnioAnterior.activosFijosNetos))
    addDataRow('Otros Activos', datosAnioAnterior.otrosActivos, datosAnioAnterior.otrosActivos / derivAnt.totalActivos, datosAnioActual.otrosActivos, datosAnioActual.otrosActivos / derivAct.totalActivos, varH(datosAnioActual.otrosActivos, datosAnioAnterior.otrosActivos))
    addDataRow('TOTAL ACTIVOS', derivAnt.totalActivos, 1, derivAct.totalActivos, 1, varH(derivAct.totalActivos, derivAnt.totalActivos))
    addDataRow('Obligaciones Fcieras. CP', datosAnioAnterior.obligacionesFinancierasCP, datosAnioAnterior.obligacionesFinancierasCP / derivAnt.totalActivos, datosAnioActual.obligacionesFinancierasCP, datosAnioActual.obligacionesFinancierasCP / derivAct.totalActivos, varH(datosAnioActual.obligacionesFinancierasCP, datosAnioAnterior.obligacionesFinancierasCP))
    addDataRow('Obligaciones Fcieras. LP', datosAnioAnterior.obligacionesFinancierasLP, datosAnioAnterior.obligacionesFinancierasLP / derivAnt.totalActivos, datosAnioActual.obligacionesFinancierasLP, datosAnioActual.obligacionesFinancierasLP / derivAct.totalActivos, varH(datosAnioActual.obligacionesFinancierasLP, datosAnioAnterior.obligacionesFinancierasLP))
    addDataRow('Proveedores', datosAnioAnterior.proveedores, datosAnioAnterior.proveedores / derivAnt.totalActivos, datosAnioActual.proveedores, datosAnioActual.proveedores / derivAct.totalActivos, varH(datosAnioActual.proveedores, datosAnioAnterior.proveedores))
    addDataRow('Otros Pasivos', datosAnioAnterior.otrosPasivos, datosAnioAnterior.otrosPasivos / derivAnt.totalActivos, datosAnioActual.otrosPasivos, datosAnioActual.otrosPasivos / derivAct.totalActivos, varH(datosAnioActual.otrosPasivos, datosAnioAnterior.otrosPasivos))
    addDataRow('TOTAL PASIVOS', derivAnt.totalPasivos, derivAnt.totalPasivos / derivAnt.totalActivos, derivAct.totalPasivos, derivAct.totalPasivos / derivAct.totalActivos, varH(derivAct.totalPasivos, derivAnt.totalPasivos))
    addDataRow('Total Patrimonio', datosAnioAnterior.totalPatrimonio, datosAnioAnterior.totalPatrimonio / derivAnt.totalActivos, datosAnioActual.totalPatrimonio, datosAnioActual.totalPatrimonio / derivAct.totalActivos, varH(datosAnioActual.totalPatrimonio, datosAnioAnterior.totalPatrimonio))

    // Indicadores
    addSection('INDICADORES')
    const indHeaders = ws.addRow(['Indicador', `${anioAnterior}`, '', `${anioActual}`, '', 'Tendencia'])
    indHeaders.eachCell(c => { c.style = subHeaderStyle })

    function addInd(label: string, valAnt: number, valAct: number, fmt = 'pct') {
      const trend = valAct > valAnt ? '↑ Mejora' : valAct < valAnt ? '↓ Baja' : '→ Igual'
      const fmtVal = (v: number) => fmt === 'pct' ? `${(v * 100).toFixed(1)}%` : fmt === 'veces' ? `${v.toFixed(2)}x` : `${Math.round(v)} días`
      const r = ws.addRow([label, fmtVal(valAnt), '', fmtVal(valAct), '', trend])
      r.getCell(1).style = { border: numStyle.border! }
    }

    addInd('Margen EBITDA', indAnt.margenEbitda, indAct.margenEbitda)
    addInd('Margen Neto', indAnt.margenNeto, indAct.margenNeto)
    addInd('Crecimiento en Ventas', 0, indAct.crecimientoVentas)
    addInd('Endeudamiento', indAnt.endeudamiento, indAct.endeudamiento)
    addInd('Endeudamiento Financiero', indAnt.endeudamientoFinanciero, indAct.endeudamientoFinanciero)
    addInd('Palanca de Crecimiento (PDC)', indAnt.palancaCrecimiento, indAct.palancaCrecimiento, 'veces')
    addInd('EBITDA / Intereses', indAnt.ebitdaIntereses, indAct.ebitdaIntereses, 'veces')
    addInd('Ciclo Financiero (días)', indAnt.cicloFinancieroDias, indAct.cicloFinancieroDias, 'dias')
    addInd('KTNO', indAnt.ktno, indAct.ktno, 'veces')
    addInd('Rotación Cartera (días)', indAnt.rotacionCarteraDias, indAct.rotacionCarteraDias, 'dias')
    addInd('Rotación Inventarios (días)', indAnt.rotacionInventariosDias, indAct.rotacionInventariosDias, 'dias')
    addInd('Rotación Proveedores (días)', indAnt.rotacionProveedoresDias, indAct.rotacionProveedoresDias, 'dias')

    // Generate
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
