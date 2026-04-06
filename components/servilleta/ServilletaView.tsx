'use client'

import { useState } from 'react'
import { useWizardStore } from '@/lib/wizard-store'
import { HelpCircle, X } from 'lucide-react'

// ── Tooltips ────────────────────────────────────────────────────────
const TIPS: Record<string, string> = {
  ingresos: 'Todo el dinero que entra por venta de tus productos o servicios. Es la linea principal de tu P&G.',
  costos: 'Lo que te cuesta producir o comprar lo que vendes: materia prima, mano de obra directa, etc.',
  gastos: 'Gastos de administracion, ventas, arriendo, nomina administrativa, publicidad, etc.',
  depAmort: 'Desgaste de tus activos fijos (maquinaria, vehiculos, equipos). Si no tienes, pon 0.',
  cartera: 'Dinero que te deben tus clientes (cuentas por cobrar).',
  inventarios: 'Mercancia o materia prima que tienes en bodega.',
  proveedores: 'Dinero que tu le debes a tus proveedores.',
  activosFijos: 'Maquinaria, vehiculos, equipos, inmuebles de tu empresa.',
  impuestos: 'Impuesto de renta pagado en el periodo.',
  servicioDeuda: 'Intereses + abono a capital que pagaste por tus creditos en el periodo.',
  dividendos: 'Dinero distribuido a los socios. Si no repartiste, pon 0.',
}

// ── Formato de numeros ──────────────────────────────────────────────
function fmt(n: number): string {
  if (n === 0) return '0'
  return n.toLocaleString('es-CO', { maximumFractionDigits: 0 })
}

function fmtSigned(n: number): string {
  const prefix = n > 0 ? '+' : ''
  return `${prefix}${fmt(n)}`
}

// ── Mini componente de input inline ─────────────────────────────────
function CampoInline({
  value,
  onChange,
  tip,
  placeholder = '0',
}: {
  value: number
  onChange: (v: number) => void
  tip?: string
  placeholder?: string
}) {
  const [focused, setFocused] = useState(false)
  const [display, setDisplay] = useState(value > 0 ? fmt(value) : '')
  const [showTip, setShowTip] = useState(false)

  function handleFocus() {
    setFocused(true)
    setDisplay(value > 0 ? String(value) : '')
  }

  function handleBlur() {
    setFocused(false)
    setDisplay(value > 0 ? fmt(value) : '')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    setDisplay(raw)
    const num = parseFloat(raw)
    onChange(isNaN(num) ? 0 : num)
  }

  // Sync external value changes
  if (!focused && value > 0 && display !== fmt(value)) {
    // will re-render with correct display
  }

  return (
    <span className="inline-flex items-center gap-1 relative">
      <span className="text-gray-400 text-sm">$</span>
      <input
        type="text"
        inputMode="decimal"
        value={focused ? display : (value > 0 ? fmt(value) : '')}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-24 sm:w-28 text-right text-sm font-semibold border-b-2 border-amber-400 bg-amber-50/60 px-1.5 py-1 focus:border-amber-600 focus:bg-amber-50 outline-none transition-colors rounded-t-sm"
      />
      <span className="text-gray-400 text-xs">M</span>
      {tip && (
        <>
          <button
            type="button"
            onClick={() => setShowTip(!showTip)}
            className="text-prestigio-400 hover:text-prestigio-600 transition-colors flex-shrink-0"
          >
            <HelpCircle size={14} />
          </button>
          {showTip && (
            <div className="absolute bottom-full right-0 mb-1 w-56 bg-prestigio-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-50">
              {tip}
              <button onClick={() => setShowTip(false)} className="absolute top-1 right-1 text-white/60 hover:text-white">
                <X size={10} />
              </button>
            </div>
          )}
        </>
      )}
    </span>
  )
}

// ── Mini input para la tabla de dos anos ─────────────────────────────
function CampoTabla({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [focused, setFocused] = useState(false)
  const [display, setDisplay] = useState(value > 0 ? fmt(value) : '')

  function handleFocus() {
    setFocused(true)
    setDisplay(value > 0 ? String(value) : '')
  }

  function handleBlur() {
    setFocused(false)
    setDisplay(value > 0 ? fmt(value) : '')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    setDisplay(raw)
    const num = parseFloat(raw)
    onChange(isNaN(num) ? 0 : num)
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={focused ? display : (value > 0 ? fmt(value) : '')}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder="0"
      className="w-20 sm:w-24 text-right text-sm font-medium border-b-2 border-amber-400 bg-amber-50/60 px-1 py-0.5 focus:border-amber-600 focus:bg-amber-50 outline-none transition-colors rounded-t-sm"
    />
  )
}

// ── Fila calculada ──────────────────────────────────────────────────
function FilaCalculada({
  label,
  valor,
  highlight = false,
}: {
  label: string
  valor: number
  highlight?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between py-2 px-3 ${
        highlight
          ? 'bg-prestigio-100 border-l-4 border-prestigio-600 rounded-r-lg'
          : 'bg-prestigio-50/50'
      }`}
    >
      <span className={`text-sm ${highlight ? 'font-bold text-prestigio-900' : 'font-semibold text-prestigio-800'}`}>
        {label}
      </span>
      <span className={`text-sm font-bold ${highlight ? 'text-prestigio-900 text-base' : 'text-prestigio-700'}`}>
        $ {fmt(valor)} M
      </span>
    </div>
  )
}

// ── Fila de referencia (valor traido de seccion anterior) ───────────
function FilaReferencia({
  label,
  valor,
}: {
  label: string
  valor: number
}) {
  return (
    <div className="flex items-center justify-between py-1.5 px-3">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-medium ${valor >= 0 ? 'text-gray-700' : 'text-red-600'}`}>
        $ {fmtSigned(valor)} M
      </span>
    </div>
  )
}

// ── Componente principal ────────────────────────────────────────────
interface Props {
  onNext: () => void
  onPrev: () => void
}

export function ServilletaView({ onNext, onPrev }: Props) {
  const store = useWizardStore()
  const { anioAnterior, anioActual, datosAnioActual: act, datosAnioAnterior: ant } = store

  // Calculados P&G
  const utilidadOperativa = act.ingresosOperacionales - act.costosTotales - act.gastosTotales
  const ebitda = utilidadOperativa + act.depreciacionesAmortizaciones

  // Calculados Cambios
  const deltaCartera = ant.carteraNeta - act.carteraNeta
  const deltaInventarios = ant.inventarios - act.inventarios
  const deltaProveedores = act.proveedores - ant.proveedores
  const cambioKTNO = deltaCartera + deltaInventarios + deltaProveedores

  const deltaAF = ant.activosFijosNetos - act.activosFijosNetos

  // FCL
  const fcl = ebitda + cambioKTNO + deltaAF - act.impuestos

  // Caja final
  const cajaFinal = fcl - act.servicioDeuda - act.dividendos

  // Margen EBITDA para el indicador
  const margenEbitda = act.ingresosOperacionales > 0 ? (ebitda / act.ingresosOperacionales) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Titulo */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-prestigio-900">Tu Servilleta Financiera</h2>
        <p className="text-sm text-gray-500">
          Llena solo los campos en <span className="inline-block bg-amber-50 border-b-2 border-amber-400 px-1.5 text-amber-700 font-medium text-xs">amarillo</span>
          {' '}y nosotros calculamos el resto
        </p>
      </div>

      {/* ═══ SECCION 1: Estado de Resultados ═══ */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-prestigio-900 px-4 py-2">
          <h3 className="text-white font-semibold text-sm tracking-wide">
            Estado de Resultados ({anioActual})
          </h3>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Ingresos */}
          <div className="flex items-center justify-between py-2.5 px-3">
            <span className="text-sm text-gray-700">Ingresos Operacionales</span>
            <CampoInline
              value={act.ingresosOperacionales}
              onChange={(v) => store.updateDatosActual('ingresosOperacionales', v)}
              tip={TIPS.ingresos}
            />
          </div>

          {/* Costos */}
          <div className="flex items-center justify-between py-2.5 px-3">
            <span className="text-sm text-gray-700">(-) Costos Totales</span>
            <CampoInline
              value={act.costosTotales}
              onChange={(v) => store.updateDatosActual('costosTotales', v)}
              tip={TIPS.costos}
            />
          </div>

          {/* Gastos */}
          <div className="flex items-center justify-between py-2.5 px-3">
            <span className="text-sm text-gray-700">(-) Gastos Totales</span>
            <CampoInline
              value={act.gastosTotales}
              onChange={(v) => store.updateDatosActual('gastosTotales', v)}
              tip={TIPS.gastos}
            />
          </div>

          {/* Utilidad Operativa (calculada) */}
          <FilaCalculada label="= Utilidad Operativa" valor={utilidadOperativa} />

          {/* Dep & Amort */}
          <div className="flex items-center justify-between py-2.5 px-3">
            <span className="text-sm text-gray-700">(+) Depreciaciones y Amort.</span>
            <CampoInline
              value={act.depreciacionesAmortizaciones}
              onChange={(v) => store.updateDatosActual('depreciacionesAmortizaciones', v)}
              tip={TIPS.depAmort}
            />
          </div>

          {/* EBITDA (calculado, destacado) */}
          <FilaCalculada label="= EBITDA" valor={ebitda} highlight />

          {/* Margen EBITDA indicador */}
          <div className="px-3 py-2 bg-gray-50">
            <p className="text-xs text-gray-500">
              Margen EBITDA: <span className={`font-bold ${margenEbitda >= 15 ? 'text-green-600' : margenEbitda >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                {margenEbitda.toFixed(1)}%
              </span>
              <span className="text-gray-400"> — De cada $100 que vendes, ${margenEbitda.toFixed(0)} quedan como EBITDA</span>
            </p>
          </div>
        </div>
      </div>

      {/* ═══ SECCION 2: Cambios en Capital de Trabajo ═══ */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-prestigio-900 px-4 py-2">
          <h3 className="text-white font-semibold text-sm tracking-wide">
            Cambios en Capital de Trabajo ({anioAnterior} → {anioActual})
          </h3>
        </div>

        {/* Header de tabla */}
        <div className="grid grid-cols-[1fr,auto,auto,auto] gap-1 px-3 py-1.5 bg-gray-50 border-b border-gray-200 items-center">
          <span className="text-xs font-medium text-gray-500"></span>
          <span className="text-xs font-medium text-gray-500 text-center w-20 sm:w-24">{anioAnterior}</span>
          <span className="text-xs font-medium text-gray-500 text-center w-20 sm:w-24">{anioActual}</span>
          <span className="text-xs font-medium text-gray-500 text-right w-16 sm:w-20">Cambio</span>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Cartera */}
          <div className="grid grid-cols-[1fr,auto,auto,auto] gap-1 px-3 py-2 items-center">
            <span className="text-sm text-gray-700 flex items-center gap-1">
              Cartera
              <Tip text={TIPS.cartera} />
            </span>
            <CampoTabla
              value={ant.carteraNeta}
              onChange={(v) => store.updateDatosAnterior('carteraNeta', v)}
            />
            <CampoTabla
              value={act.carteraNeta}
              onChange={(v) => store.updateDatosActual('carteraNeta', v)}
            />
            <span className={`text-sm font-medium text-right w-16 sm:w-20 ${deltaCartera >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {fmtSigned(deltaCartera)}
            </span>
          </div>

          {/* Inventarios */}
          <div className="grid grid-cols-[1fr,auto,auto,auto] gap-1 px-3 py-2 items-center">
            <span className="text-sm text-gray-700 flex items-center gap-1">
              Inventarios
              <Tip text={TIPS.inventarios} />
            </span>
            <CampoTabla
              value={ant.inventarios}
              onChange={(v) => store.updateDatosAnterior('inventarios', v)}
            />
            <CampoTabla
              value={act.inventarios}
              onChange={(v) => store.updateDatosActual('inventarios', v)}
            />
            <span className={`text-sm font-medium text-right w-16 sm:w-20 ${deltaInventarios >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {fmtSigned(deltaInventarios)}
            </span>
          </div>

          {/* Proveedores */}
          <div className="grid grid-cols-[1fr,auto,auto,auto] gap-1 px-3 py-2 items-center">
            <span className="text-sm text-gray-700 flex items-center gap-1">
              Proveedores
              <Tip text={TIPS.proveedores} />
            </span>
            <CampoTabla
              value={ant.proveedores}
              onChange={(v) => store.updateDatosAnterior('proveedores', v)}
            />
            <CampoTabla
              value={act.proveedores}
              onChange={(v) => store.updateDatosActual('proveedores', v)}
            />
            <span className={`text-sm font-medium text-right w-16 sm:w-20 ${deltaProveedores >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {fmtSigned(deltaProveedores)}
            </span>
          </div>

          {/* Cambio KTNO */}
          <div className="grid grid-cols-[1fr,auto] gap-1 items-center">
            <FilaCalculada label="= Cambio Capital de Trabajo" valor={cambioKTNO} />
          </div>

          {/* Activos Fijos */}
          <div className="grid grid-cols-[1fr,auto,auto,auto] gap-1 px-3 py-2 items-center">
            <span className="text-sm text-gray-700 flex items-center gap-1">
              Activos Fijos
              <Tip text={TIPS.activosFijos} />
            </span>
            <CampoTabla
              value={ant.activosFijosNetos}
              onChange={(v) => store.updateDatosAnterior('activosFijosNetos', v)}
            />
            <CampoTabla
              value={act.activosFijosNetos}
              onChange={(v) => store.updateDatosActual('activosFijosNetos', v)}
            />
            <span className={`text-sm font-medium text-right w-16 sm:w-20 ${deltaAF >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {fmtSigned(deltaAF)}
            </span>
          </div>

          {/* Cambio CAPEX */}
          <div className="grid grid-cols-[1fr,auto] gap-1 items-center">
            <FilaCalculada label="= Cambio CAPEX" valor={deltaAF} />
          </div>
        </div>
      </div>

      {/* ═══ SECCION 3: Flujo de Caja Libre ═══ */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-prestigio-900 px-4 py-2">
          <h3 className="text-white font-semibold text-sm tracking-wide">
            Flujo de Caja Libre
          </h3>
        </div>

        <div className="divide-y divide-gray-100">
          <FilaReferencia label="EBITDA" valor={ebitda} />
          <FilaReferencia label="(+/-) Cambio Capital de Trabajo" valor={cambioKTNO} />
          <FilaReferencia label="(+/-) Cambio CAPEX" valor={deltaAF} />

          {/* Impuestos */}
          <div className="flex items-center justify-between py-2.5 px-3">
            <span className="text-sm text-gray-700">(-) Impuestos</span>
            <CampoInline
              value={act.impuestos}
              onChange={(v) => store.updateDatosActual('impuestos', v)}
              tip={TIPS.impuestos}
            />
          </div>

          {/* FCL */}
          <FilaCalculada label="= Flujo de Caja Libre" valor={fcl} highlight />
        </div>
      </div>

      {/* ═══ SECCION 4: Caja Final ═══ */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-prestigio-900 px-4 py-2">
          <h3 className="text-white font-semibold text-sm tracking-wide">
            Caja Final
          </h3>
        </div>

        <div className="divide-y divide-gray-100">
          <FilaReferencia label="Flujo de Caja Libre" valor={fcl} />

          {/* Servicio de la Deuda */}
          <div className="flex items-center justify-between py-2.5 px-3">
            <span className="text-sm text-gray-700">(-) Servicio de la Deuda</span>
            <CampoInline
              value={act.servicioDeuda}
              onChange={(v) => store.updateDatosActual('servicioDeuda', v)}
              tip={TIPS.servicioDeuda}
            />
          </div>

          {/* Dividendos */}
          <div className="flex items-center justify-between py-2.5 px-3">
            <span className="text-sm text-gray-700">(-) Dividendos</span>
            <CampoInline
              value={act.dividendos}
              onChange={(v) => store.updateDatosActual('dividendos', v)}
              tip={TIPS.dividendos}
            />
          </div>

          {/* Caja Final */}
          <div className={`flex items-center justify-between py-3 px-3 border-l-4 ${
            cajaFinal >= 0
              ? 'bg-green-50 border-green-500'
              : 'bg-red-50 border-red-500'
          }`}>
            <span className="text-base font-bold text-gray-900">= CAJA FINAL</span>
            <span className={`text-base font-bold ${cajaFinal >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              $ {fmt(cajaFinal)} M
            </span>
          </div>

          {/* Interpretacion */}
          <div className="px-3 py-2 bg-gray-50">
            <p className="text-xs text-gray-500">
              {cajaFinal >= 0
                ? `Tu empresa genera $${fmt(cajaFinal)}M de caja despues de pagar operacion, deuda y dividendos.`
                : `Tu empresa tiene un deficit de caja de $${fmt(Math.abs(cajaFinal))}M. Necesitas financiacion adicional o reducir gastos.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onPrev}
          className="flex-1 border-2 border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all"
        >
          ← Anterior
        </button>
        <button
          onClick={onNext}
          className="flex-[2] bg-prestigio-900 hover:bg-prestigio-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-prestigio-200"
        >
          Ver mi Diagnostico →
        </button>
      </div>
    </div>
  )
}

// ── Tooltip compacto ────────────────────────────────────────────────
function Tip({ text }: { text: string }) {
  const [show, setShow] = useState(false)

  return (
    <span className="relative">
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="text-prestigio-400 hover:text-prestigio-600 transition-colors"
      >
        <HelpCircle size={13} />
      </button>
      {show && (
        <div className="absolute bottom-full left-0 mb-1 w-48 bg-prestigio-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg z-50">
          {text}
          <button onClick={() => setShow(false)} className="absolute top-0.5 right-1 text-white/60 hover:text-white">
            <X size={10} />
          </button>
        </div>
      )}
    </span>
  )
}
