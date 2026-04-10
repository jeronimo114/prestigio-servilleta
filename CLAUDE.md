# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Prestigio - Servilleta Financiera PAE** is a financial diagnosis tool for Colombian SMEs, built for Bancolombia's PAE program. Users fill out a single-page financial form ("servilleta") with Income Statement and Balance Sheet data, and receive calculated financial indicators with traffic-light risk ratings, AI-powered explanations, and an Excel export.

Language: Spanish (all UI, variables, types, and comments are in Spanish).

## Commands

```bash
npm run dev    # Dev server on localhost:3000
npm run build  # Production build (also serves as type-check / lint)
npm run start  # Production server
```

No test framework is configured. No linter or formatter beyond TypeScript compilation via `next build`.

## Architecture

**Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Zustand, ExcelJS, Supabase (optional), DeepSeek API (AI chat).

### Data Flow

1. **Wizard** (`/wizard`) is a 3-step flow: Step 0 (company info), Step 1 (ServilletaView — single-page financial data entry), Step 2 (confirmation). State managed by `wizard-store.ts` (Zustand + localStorage key: `servilleta-wizard`)
2. On confirmation, data is POSTed to `/api/session` → saved to Supabase (or fallback local ID)
3. **Results page** (`/resultados/[sessionId]`) calculates indicators via `lib/indicadores.ts` and displays them with semáforo (traffic-light) colors
4. **Excel export** (`/api/export`) reads `lib/templates/servilleta.xlsm` template, populates cells with ExcelJS, returns xlsx download. Writes to two sheets: "Servilleta Su empresa" (full) and "Mini servilleta" (summary)

### Key Files

| File | Purpose |
|------|---------|
| `lib/wizard-store.ts` | Zustand store with all wizard state and persistence |
| `lib/indicadores.ts` | All financial calculations: KTNO, EBITDA margins, rotations, FCL, PDC, semáforo thresholds |
| `types/servilleta.ts` | Core types: `DatosAnio`, `IndicadoresAnio`, `ResultadosServilleta`, `SemaforoColor` |
| `components/servilleta/ServilletaView.tsx` | Main financial data entry form — single-page "servilleta" layout with inline calculations |
| `components/wizard/StepEmpresa.tsx` | Step 0: company info (nombre, cédula, empresa, email, sector) |
| `components/wizard/StepConfirmacion.tsx` | Step 2: review before submitting |
| `app/api/chat/route.ts` | SSE streaming endpoint for PrestIA (DeepSeek AI assistant) |
| `app/api/export/route.ts` | Excel generation from template — populates both full and mini servilleta sheets |
| `app/api/session/route.ts` | Session CRUD with Supabase |
| `components/asistente/MascotaAI.tsx` | Floating AI chat bubble ("P" button), contextual FAQ chips per step |
| `components/servilleta/CampoInline.tsx` | Inline currency input used in ServilletaView |
| `components/wizard/CampoMoneda.tsx` | Reusable currency input (formats as "Millones COP") |
| `lib/templates/servilleta.xlsm` | Excel template with pre-built formulas; app only populates data cells |

### ServilletaView Structure

The main form (`ServilletaView.tsx`) collects data in 4 sections on a single page:

1. **P&G (Estado de Resultados)** — current year only: ingresos, costos, gastos, depreciaciones y amortizaciones (combined field). Calculates inline: utilidad bruta, utilidad operacional, EBITDA
2. **Balance General** — both years (anterior + actual): cartera, inventarios, activos fijos, proveedores, obligaciones financieras CP/LP, capital, utilidades retenidas
3. **Flujo de Caja Libre** — derived from P&G + Balance changes: impuestos, KTNO change, CAPEX
4. **Caja Final** — servicio de la deuda (single combined field), dividendos

### Financial Calculations (`lib/indicadores.ts`)

`calcularIndicadores()` computes:
- **Rotaciones**: cartera, inventarios, proveedores (all in days), ciclo financiero
- **KTNO**: Capital de Trabajo Neto Operativo (cartera + inventarios - proveedores)
- **EBITDA**: utilidad bruta - gastos operacionales + depreciaciones y amortizaciones
- **Márgenes**: EBITDA, neto
- **FCL**: Flujo de Caja Libre
- **PDC**: Palanca de Crecimiento (EBITDA / KTNO)
- **Endeudamiento**: total y financiero
- **Caja periodo**: FCL - servicio deuda + cambio en deuda

`indicadoresConSemaforo()` returns indicator cards for display. Currently shows: margen EBITDA, margen neto, crecimiento ventas, endeudamiento, EBITDA/intereses, ciclo financiero, PDC. Individual rotations are calculated but NOT displayed as cards.

`obtenerSemaforo()` assigns verde/amarillo/rojo via fixed thresholds. **These thresholds are NOT validated by Bancolombia yet.**

### Known Issues

- **Caja final inconsistency**: ServilletaView calculates `cajaFinal = FCL - servicioDeuda - dividendos` inline, but `indicadores.ts` calculates `cajaPeriodo` differently using `intereses` + derived amortization + `cambioEnDeuda`. These can produce different results. The Excel template calculates its own caja final from its internal formulas. All three should be unified.
- **Missing field: capitalización** — the caja final formula should include `+ capitalización` (aportes de socios), pending validation.
- **servicioDeuda vs intereses**: The UI collects one combined `servicioDeuda` field, but `indicadores.ts` uses `datos.intereses` separately (which is not explicitly collected in the UI). Pending: split into two fields (intereses + amortización a capital).
- **Mini-servilleta export incomplete**: Missing servicio de la deuda, dividendos, and capitalización cells.

### Environment Variables

```
DEEPSEEK_API_KEY=...              # Required for AI chat
NEXT_PUBLIC_SUPABASE_URL=...      # Optional - app works without Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=... # Optional
SUPABASE_SERVICE_ROLE_KEY=...     # Optional (server-side)
```

### Styling

Tailwind CSS 4 with custom brand colors defined in `globals.css`: `--color-prestigio-{50-900}` (teal palette), `--color-oliva` (olive green). Fonts: Poppins (sans, primary) and Vollkorn (serif, taglines). Framer Motion for step transitions and mascot animations.

### Stakeholders & Context

- **Diana**: project lead at Prestigio, primary reviewer. Provides feedback via audio messages.
- **Bancolombia PAE team (Isa, Diana, Dianis)**: financial experts who designed the original servilleta Excel. Must validate indicator thresholds and data requirements.
- The tool is designed for "don Jerónimo" — a Colombian SME owner who may not know financial terms. Language must be simple, not technical.
- "Servilleta" = napkin. The metaphor is that financial diagnosis should be as simple as doing math on a napkin at a restaurant. The original 14-step wizard was replaced because it "felt like a tablecloth, not a napkin."

### Implementation Plan

See `ajustes-fase-2.md` for detailed Phase 2 implementation plan covering pending changes and validations.
