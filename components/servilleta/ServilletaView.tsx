'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import { useWizardStore } from '@/lib/wizard-store'
import { calcularCajaFinal, calcularFCL } from '@/lib/indicadores'
import { HelpCircle, X, CheckCircle2 } from 'lucide-react'
import type { DatosAnio } from '@/types/servilleta'

// ── Tooltips ────────────────────────────────────────────────────────
const TIPS: Record<string, string> = {
  ingresos: 'Todo el dinero que entra por la venta de tus productos o servicios. Es la línea principal de tu Estado de Resultados.',
  costos: 'Lo que te cuesta producir o comprar lo que vendes: materia prima, mano de obra directa, etc.',
  gastos: 'Gastos de administración, ventas, arriendo, nómina administrativa, publicidad, etc.',
  depreciaciones: 'Desgaste de tus activos fijos tangibles (maquinaria, vehículos, equipos). Si no tienes, pon 0.',
  amortizaciones: 'Distribución del costo de activos intangibles (software, marcas, licencias). Si no tienes, pon 0.',
  cartera: 'Dinero que te deben tus clientes (cuentas por cobrar).',
  inventarios: 'Mercancía o materia prima que tienes en bodega.',
  proveedores: 'Dinero que tú le debes a tus proveedores.',
  activosFijos: 'Maquinaria, vehículos, equipos, inmuebles de tu empresa.',
  impuestos: 'Impuesto de renta pagado en el período.',
  intereses: 'Lo que le pagas al banco por el uso del dinero prestado (intereses de tus créditos).',
  amortizacionDeuda: 'El abono a capital que reduces de tu deuda (sin contar intereses).',
  dividendos: 'Dinero distribuido a los socios. Si no repartiste, pon 0.',
  capitalizacion: 'Aportes adicionales de capital de los socios al negocio. Si no hubo, pon 0.',
}

// ── Formato de números ──────────────────────────────────────────────
function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '—'
  if (n === 0) return '0'
  return n.toLocaleString('es-CO', { maximumFractionDigits: 0 })
}

function fmtSigned(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '—'
  const prefix = n > 0 ? '+' : ''
  return `${prefix}${fmt(n)}`
}

// ── Hook: detectar cambio para animar ───────────────────────────────
function useValueChanged(value: number) {
  const prevRef = useRef(value)
  const [changed, setChanged] = useState(false)

  useEffect(() => {
    if (prevRef.current !== value) {
      setChanged(true)
      prevRef.current = value
      const timer = setTimeout(() => setChanged(false), 600)
      return () => clearTimeout(timer)
    }
  }, [value])

  return changed
}

// ── Tooltip flotante ────────────────────────────────────────────────
function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="text-prestigio-400 hover:text-prestigio-700 transition-colors"
        aria-label="Ayuda"
      >
        <HelpCircle size={15} />
      </button>
      {show && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setShow(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-80 bg-prestigio-900 text-white text-sm rounded-2xl px-5 py-4 shadow-2xl z-[9999] leading-relaxed">
            {text}
            <button
              onClick={() => setShow(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white text-prestigio-900 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors border-2 border-gray-200"
              aria-label="Cerrar"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>
        </>
      )}
    </span>
  )
}

// ── Valor animado (pulsa al cambiar) ────────────────────────────────
function ValorAnimado({
  valor,
  className = '',
  prefix = '$ ',
  suffix = ' M',
}: {
  valor: number
  className?: string
  prefix?: string
  suffix?: string
}) {
  const changed = useValueChanged(valor)
  const controls = useAnimationControls()

  useEffect(() => {
    if (changed) {
      controls.start({
        scale: [1, 1.15, 1],
        transition: { duration: 0.4, ease: 'easeOut' },
      })
    }
  }, [changed, controls])

  return (
    <motion.span animate={controls} className={`inline-block ${className}`}>
      {prefix}{fmt(valor)}{suffix}
    </motion.span>
  )
}

// ── Mini input para celdas de tabla ─────────────────────────────────
function CampoTabla({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [focused, setFocused] = useState(false)
  const [display, setDisplay] = useState('')

  function handleFocus() {
    setFocused(true)
    setDisplay(value > 0 ? String(value) : '')
  }

  function handleBlur() {
    setFocused(false)
    setDisplay('')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    setDisplay(raw)
    const num = parseFloat(raw)
    onChange(isNaN(num) ? 0 : num)
  }

  const shown = focused ? display : (value > 0 ? fmt(value) : '')

  return (
    <input
      type="text"
      inputMode="decimal"
      value={shown}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder="0"
      className={`w-full text-right text-sm font-medium border-b-2 border-amber-400 bg-amber-50/60 px-1 py-0.5 outline-none transition-all duration-200 rounded-t-sm ${
        focused
          ? 'border-amber-600 bg-amber-50 shadow-[0_2px_8px_rgba(245,158,11,0.25)]'
          : 'hover:bg-amber-50/80'
      }`}
    />
  )
}

// ── Indicador de sección completada ─────────────────────────────────
function SeccionHeader({
  titulo,
  completada,
  children,
}: {
  titulo: string
  completada: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="bg-prestigio-900 px-4 py-2 flex items-center justify-between">
      <h3 className="text-white font-semibold text-sm tracking-wide">{titulo}</h3>
      <div className="flex items-center gap-2">
        {children}
        <AnimatePresence>
          {completada && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <CheckCircle2 size={18} className="text-green-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Header de tabla con dos años ────────────────────────────────────
function HeaderDosAnios({
  anioAnterior,
  anioActual,
  conCambio = false,
}: {
  anioAnterior: number
  anioActual: number
  conCambio?: boolean
}) {
  return (
    <div
      className={`grid ${conCambio ? 'grid-cols-[1fr_5rem_5rem_4rem] sm:grid-cols-[1fr_6rem_6rem_5rem]' : 'grid-cols-[1fr_5rem_5rem] sm:grid-cols-[1fr_6rem_6rem]'} gap-2 px-3 py-1.5 bg-gray-50 border-b border-gray-200 items-center`}
    >
      <span className="text-xs font-medium text-gray-500"></span>
      <span className="text-xs font-medium text-gray-500 text-center">{anioAnterior}</span>
      <span className="text-xs font-medium text-gray-500 text-center">{anioActual}</span>
      {conCambio && <span className="text-xs font-medium text-gray-500 text-right">Cambio</span>}
    </div>
  )
}

// ── Fila con dos inputs (un valor por año) ──────────────────────────
function FilaInputDosAnios({
  label,
  tip,
  valueAnt,
  valueAct,
  onChangeAnt,
  onChangeAct,
}: {
  label: string
  tip?: string
  valueAnt: number
  valueAct: number
  onChangeAnt: (v: number) => void
  onChangeAct: (v: number) => void
}) {
  return (
    <div className="grid grid-cols-[1fr_5rem_5rem] sm:grid-cols-[1fr_6rem_6rem] gap-2 px-3 py-2 items-center">
      <span className="text-sm text-gray-700 flex items-center gap-1">
        {label} {tip && <Tooltip text={tip} />}
      </span>
      <CampoTabla value={valueAnt} onChange={onChangeAnt} />
      <CampoTabla value={valueAct} onChange={onChangeAct} />
    </div>
  )
}

// ── Fila calculada con dos años ─────────────────────────────────────
function FilaCalcDosAnios({
  label,
  valorAnt,
  valorAct,
  highlight = false,
}: {
  label: string
  valorAnt: number
  valorAct: number
  highlight?: boolean
}) {
  const changedAct = useValueChanged(valorAct)

  return (
    <motion.div
      animate={changedAct ? { backgroundColor: ['rgba(0,114,126,0.15)', 'rgba(0,114,126,0)'] } : {}}
      transition={{ duration: 0.6 }}
      className={`grid grid-cols-[1fr_5rem_5rem] sm:grid-cols-[1fr_6rem_6rem] gap-2 px-3 py-2 items-center ${
        highlight
          ? 'bg-prestigio-100 border-l-4 border-prestigio-600'
          : 'bg-prestigio-50/50'
      }`}
    >
      <span className={`text-sm ${highlight ? 'font-bold text-prestigio-900' : 'font-semibold text-prestigio-800'}`}>
        {label}
      </span>
      <span className={`text-sm text-right font-medium ${highlight ? 'text-prestigio-900' : 'text-prestigio-700'}`}>
        $ {fmt(valorAnt)}
      </span>
      <ValorAnimado
        valor={valorAct}
        prefix="$ "
        suffix=""
        className={`text-sm font-bold text-right ${highlight ? 'text-prestigio-900' : 'text-prestigio-700'}`}
      />
    </motion.div>
  )
}

// ── Fila tabla con cambio (cartera/inventarios/proveedores) ─────────
function FilaCambioDosAnios({
  label,
  tip,
  valueAnt,
  valueAct,
  onChangeAnt,
  onChangeAct,
  invertirCambio = false,
}: {
  label: string
  tip?: string
  valueAnt: number
  valueAct: number
  onChangeAnt: (v: number) => void
  onChangeAct: (v: number) => void
  invertirCambio?: boolean
}) {
  const cambio = invertirCambio ? valueAct - valueAnt : valueAnt - valueAct
  return (
    <div className="grid grid-cols-[1fr_5rem_5rem_4rem] sm:grid-cols-[1fr_6rem_6rem_5rem] gap-2 px-3 py-2 items-center">
      <span className="text-sm text-gray-700 flex items-center gap-1">
        {label} {tip && <Tooltip text={tip} />}
      </span>
      <CampoTabla value={valueAnt} onChange={onChangeAnt} />
      <CampoTabla value={valueAct} onChange={onChangeAct} />
      <CambioAnimado valor={cambio} />
    </div>
  )
}

// ── Fila calculada simple con cambio (KTNO total, etc.) ─────────────
function FilaCalcConCambio({ label, valor }: { label: string; valor: number }) {
  const changed = useValueChanged(valor)
  return (
    <motion.div
      animate={changed ? { backgroundColor: ['rgba(0,114,126,0.15)', 'rgba(0,114,126,0)'] } : {}}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-[1fr_5rem_5rem_4rem] sm:grid-cols-[1fr_6rem_6rem_5rem] gap-2 px-3 py-2 items-center bg-prestigio-50/50"
    >
      <span className="col-span-3 text-sm font-semibold text-prestigio-800">{label}</span>
      <span className={`text-sm font-bold text-right ${valor >= 0 ? 'text-prestigio-700' : 'text-red-600'}`}>
        {fmtSigned(valor)}
      </span>
    </motion.div>
  )
}

// ── Variantes de animación para secciones ───────────────────────────
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' as const },
  }),
}

// ── Helpers de cálculo por año ──────────────────────────────────────
function calcUtilidadOp(d: DatosAnio): number {
  return (d.ingresosOperacionales || 0) - (d.costosTotales || 0) - (d.gastosTotales || 0)
}
function calcEbitda(d: DatosAnio): number {
  return calcUtilidadOp(d) + (d.depreciaciones || 0) + (d.amortizaciones || 0)
}

// ── Componente principal ────────────────────────────────────────────
interface Props {
  onNext: () => void
  onPrev: () => void
}

export function ServilletaView({ onNext, onPrev }: Props) {
  const store = useWizardStore()
  const { anioAnterior, anioActual, datosAnioActual: act, datosAnioAnterior: ant } = store

  // P&G calculado por año
  const utilOpAnt = calcUtilidadOp(ant)
  const utilOpAct = calcUtilidadOp(act)
  const ebitdaAnt = calcEbitda(ant)
  const ebitdaAct = calcEbitda(act)

  // Cambios
  const deltaCartera = (ant.carteraNeta || 0) - (act.carteraNeta || 0)
  const deltaInventarios = (ant.inventarios || 0) - (act.inventarios || 0)
  const deltaProveedores = (act.proveedores || 0) - (ant.proveedores || 0)
  const cambioKTNO = deltaCartera + deltaInventarios + deltaProveedores
  const deltaAF = (ant.activosFijosNetos || 0) - (act.activosFijosNetos || 0)

  // FCL y Caja Final — usan funciones unificadas de indicadores.ts
  const fclAct = calcularFCL(act, ant)
  const cajaFinalAct = calcularCajaFinal(act, ant)

  // Margen EBITDA (año actual)
  const margenEbitdaAct = act.ingresosOperacionales > 0 ? (ebitdaAct / act.ingresosOperacionales) * 100 : 0

  // Secciones completadas
  const seccion1Completa = act.ingresosOperacionales > 0 && act.costosTotales > 0
  const seccion2Completa = (act.carteraNeta > 0 || act.inventarios > 0) && act.proveedores > 0
  const seccion3Completa = seccion1Completa && seccion2Completa
  const seccion4Completa = seccion3Completa && (act.intereses > 0 || act.amortizacionDeuda > 0)

  return (
    <div className="space-y-4">
      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-1"
      >
        <h2 className="text-xl font-bold text-prestigio-900">Tu Servilleta Financiera</h2>
        <p className="text-sm text-gray-500">
          Llena solo los campos en <span className="inline-block bg-amber-50 border-b-2 border-amber-400 px-1.5 text-amber-700 font-medium text-xs">amarillo</span>
          {' '}para ambos años — nosotros calculamos el resto
        </p>
      </motion.div>

      {/* ═══ SECCIÓN 1: Estado de Resultados ═══ */}
      <motion.div
        custom={0}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
      >
        <SeccionHeader titulo="Estado de Resultados (P&G)" completada={seccion1Completa} />

        <HeaderDosAnios anioAnterior={anioAnterior} anioActual={anioActual} />

        <div className="divide-y divide-gray-100">
          <FilaInputDosAnios
            label="Ingresos Operacionales"
            tip={TIPS.ingresos}
            valueAnt={ant.ingresosOperacionales}
            valueAct={act.ingresosOperacionales}
            onChangeAnt={(v) => store.updateDatosAnterior('ingresosOperacionales', v)}
            onChangeAct={(v) => store.updateDatosActual('ingresosOperacionales', v)}
          />
          <FilaInputDosAnios
            label="(-) Costos Totales"
            tip={TIPS.costos}
            valueAnt={ant.costosTotales}
            valueAct={act.costosTotales}
            onChangeAnt={(v) => store.updateDatosAnterior('costosTotales', v)}
            onChangeAct={(v) => store.updateDatosActual('costosTotales', v)}
          />
          <FilaInputDosAnios
            label="(-) Gastos Totales"
            tip={TIPS.gastos}
            valueAnt={ant.gastosTotales}
            valueAct={act.gastosTotales}
            onChangeAnt={(v) => store.updateDatosAnterior('gastosTotales', v)}
            onChangeAct={(v) => store.updateDatosActual('gastosTotales', v)}
          />

          <FilaCalcDosAnios label="= Utilidad Operativa" valorAnt={utilOpAnt} valorAct={utilOpAct} />

          <FilaInputDosAnios
            label="(+) Depreciaciones"
            tip={TIPS.depreciaciones}
            valueAnt={ant.depreciaciones}
            valueAct={act.depreciaciones}
            onChangeAnt={(v) => store.updateDatosAnterior('depreciaciones', v)}
            onChangeAct={(v) => store.updateDatosActual('depreciaciones', v)}
          />
          <FilaInputDosAnios
            label="(+) Amortizaciones"
            tip={TIPS.amortizaciones}
            valueAnt={ant.amortizaciones}
            valueAct={act.amortizaciones}
            onChangeAnt={(v) => store.updateDatosAnterior('amortizaciones', v)}
            onChangeAct={(v) => store.updateDatosActual('amortizaciones', v)}
          />

          <FilaCalcDosAnios label="= EBITDA" valorAnt={ebitdaAnt} valorAct={ebitdaAct} highlight />

          {/* Margen EBITDA (año actual) */}
          <div className="px-3 py-2 bg-gray-50">
            <p className="text-xs text-gray-500">
              Margen EBITDA {anioActual}:{' '}
              <motion.span
                key={margenEbitdaAct.toFixed(1)}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`font-bold inline-block transition-colors duration-500 ${
                  margenEbitdaAct >= 15 ? 'text-green-600' : margenEbitdaAct >= 5 ? 'text-yellow-600' : 'text-red-600'
                }`}
              >
                {margenEbitdaAct.toFixed(1)}%
              </motion.span>
              {act.ingresosOperacionales > 0 && (
                <span className="text-gray-400"> — De cada $100 que vendes, ${margenEbitdaAct.toFixed(0)} quedan como EBITDA</span>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ═══ SECCIÓN 2: Capital de Trabajo ═══ */}
      <motion.div
        custom={1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
      >
        <SeccionHeader titulo="Balance — Capital de Trabajo" completada={seccion2Completa} />

        <HeaderDosAnios anioAnterior={anioAnterior} anioActual={anioActual} conCambio />

        <div className="divide-y divide-gray-100">
          <FilaCambioDosAnios
            label="Cartera"
            tip={TIPS.cartera}
            valueAnt={ant.carteraNeta}
            valueAct={act.carteraNeta}
            onChangeAnt={(v) => store.updateDatosAnterior('carteraNeta', v)}
            onChangeAct={(v) => store.updateDatosActual('carteraNeta', v)}
          />
          <FilaCambioDosAnios
            label="Inventarios"
            tip={TIPS.inventarios}
            valueAnt={ant.inventarios}
            valueAct={act.inventarios}
            onChangeAnt={(v) => store.updateDatosAnterior('inventarios', v)}
            onChangeAct={(v) => store.updateDatosActual('inventarios', v)}
          />
          <FilaCambioDosAnios
            label="Proveedores"
            tip={TIPS.proveedores}
            valueAnt={ant.proveedores}
            valueAct={act.proveedores}
            onChangeAnt={(v) => store.updateDatosAnterior('proveedores', v)}
            onChangeAct={(v) => store.updateDatosActual('proveedores', v)}
            invertirCambio
          />

          <FilaCalcConCambio label="= Cambio Capital de Trabajo" valor={cambioKTNO} />

          <FilaCambioDosAnios
            label="Activos Fijos"
            tip={TIPS.activosFijos}
            valueAnt={ant.activosFijosNetos}
            valueAct={act.activosFijosNetos}
            onChangeAnt={(v) => store.updateDatosAnterior('activosFijosNetos', v)}
            onChangeAct={(v) => store.updateDatosActual('activosFijosNetos', v)}
          />

          <FilaCalcConCambio label="= Cambio CAPEX" valor={deltaAF} />
        </div>
      </motion.div>

      {/* ═══ SECCIÓN 3: Flujo de Caja Libre ═══ */}
      <motion.div
        custom={2}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
      >
        <SeccionHeader titulo={`Flujo de Caja Libre (${anioActual})`} completada={seccion3Completa} />

        <HeaderDosAnios anioAnterior={anioAnterior} anioActual={anioActual} />

        <div className="divide-y divide-gray-100">
          <FilaCalcDosAnios label="EBITDA" valorAnt={ebitdaAnt} valorAct={ebitdaAct} />

          <div className="grid grid-cols-[1fr_5rem_5rem] sm:grid-cols-[1fr_6rem_6rem] gap-2 px-3 py-2 items-center">
            <span className="col-span-3 text-xs text-gray-500 italic">
              (+/-) Cambio Capital de Trabajo y CAPEX se calculan automáticamente
            </span>
          </div>

          <FilaInputDosAnios
            label="(-) Impuestos"
            tip={TIPS.impuestos}
            valueAnt={ant.impuestos}
            valueAct={act.impuestos}
            onChangeAnt={(v) => store.updateDatosAnterior('impuestos', v)}
            onChangeAct={(v) => store.updateDatosActual('impuestos', v)}
          />

          {/* FCL año actual destacado */}
          <div className="bg-prestigio-100 border-l-4 border-prestigio-600 px-3 py-3 flex items-center justify-between">
            <span className="text-sm font-bold text-prestigio-900">= Flujo de Caja Libre {anioActual}</span>
            <ValorAnimado
              valor={fclAct}
              className="text-base font-bold text-prestigio-900"
            />
          </div>
        </div>
      </motion.div>

      {/* ═══ SECCIÓN 4: Caja Final ═══ */}
      <motion.div
        custom={3}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
      >
        <SeccionHeader titulo={`Caja Final (${anioActual})`} completada={seccion4Completa} />

        <HeaderDosAnios anioAnterior={anioAnterior} anioActual={anioActual} />

        <div className="divide-y divide-gray-100">
          {/* FCL referencia */}
          <div className="grid grid-cols-[1fr_5rem_5rem] sm:grid-cols-[1fr_6rem_6rem] gap-2 px-3 py-2 items-center bg-gray-50">
            <span className="text-sm text-gray-600">Flujo de Caja Libre</span>
            <span className="text-sm font-medium text-gray-500 text-right">—</span>
            <span className="text-sm font-medium text-gray-700 text-right">$ {fmt(fclAct)}</span>
          </div>

          <FilaInputDosAnios
            label="(-) Intereses Financieros"
            tip={TIPS.intereses}
            valueAnt={ant.intereses}
            valueAct={act.intereses}
            onChangeAnt={(v) => store.updateDatosAnterior('intereses', v)}
            onChangeAct={(v) => store.updateDatosActual('intereses', v)}
          />
          <FilaInputDosAnios
            label="(-) Amortización a Capital"
            tip={TIPS.amortizacionDeuda}
            valueAnt={ant.amortizacionDeuda}
            valueAct={act.amortizacionDeuda}
            onChangeAnt={(v) => store.updateDatosAnterior('amortizacionDeuda', v)}
            onChangeAct={(v) => store.updateDatosActual('amortizacionDeuda', v)}
          />
          <FilaInputDosAnios
            label="(-) Dividendos"
            tip={TIPS.dividendos}
            valueAnt={ant.dividendos}
            valueAct={act.dividendos}
            onChangeAnt={(v) => store.updateDatosAnterior('dividendos', v)}
            onChangeAct={(v) => store.updateDatosActual('dividendos', v)}
          />
          <FilaInputDosAnios
            label="(+) Capitalización"
            tip={TIPS.capitalizacion}
            valueAnt={ant.capitalizacion}
            valueAct={act.capitalizacion}
            onChangeAnt={(v) => store.updateDatosAnterior('capitalizacion', v)}
            onChangeAct={(v) => store.updateDatosActual('capitalizacion', v)}
          />

          {/* Caja Final destacada (año actual) */}
          <motion.div
            animate={
              cajaFinalAct >= 0
                ? { backgroundColor: 'rgba(240, 253, 244, 1)' }
                : { backgroundColor: 'rgba(254, 242, 242, 1)' }
            }
            transition={{ duration: 0.5 }}
            className={`flex items-center justify-between py-3 px-3 border-l-4 transition-colors duration-500 ${
              cajaFinalAct >= 0 ? 'border-green-500' : 'border-red-500'
            }`}
          >
            <span className="text-base font-bold text-gray-900">= CAJA FINAL {anioActual}</span>
            <ValorAnimado
              valor={cajaFinalAct}
              className={`text-base font-bold ${cajaFinalAct >= 0 ? 'text-green-700' : 'text-red-700'}`}
            />
          </motion.div>

          {/* Interpretación */}
          <div className="px-3 py-2 bg-gray-50">
            <p className="text-xs text-gray-500">
              {cajaFinalAct >= 0
                ? `Tu empresa genera $${fmt(cajaFinalAct)}M de caja después de pagar operación, deuda, dividendos y aportes de socios.`
                : `Tu empresa tiene un déficit de caja de $${fmt(Math.abs(cajaFinalAct))}M. Necesitas financiación adicional o reducir gastos.`
              }
            </p>
          </div>
        </div>
      </motion.div>

      {/* Botones */}
      <motion.div
        custom={4}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="flex gap-3 pt-2"
      >
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
          Ver mi Diagnóstico →
        </button>
      </motion.div>
    </div>
  )
}

// ── Cambio animado (columna "Cambio" en tabla) ──────────────────────
function CambioAnimado({ valor }: { valor: number }) {
  const changed = useValueChanged(valor)

  return (
    <motion.span
      animate={changed ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.3 }}
      className={`text-sm font-medium text-right ${valor >= 0 ? 'text-green-600' : 'text-red-600'}`}
    >
      {fmtSigned(valor)}
    </motion.span>
  )
}
