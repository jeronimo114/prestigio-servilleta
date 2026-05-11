# Prestigio — Servilleta Financiera PAE

Herramienta web de diagnóstico financiero para PYMEs colombianas, desarrollada para el programa PAE de Bancolombia.

El usuario llena una "servilleta" de una sola página con datos de Estado de Resultados y Balance General de los últimos dos años, y recibe indicadores financieros con semáforo (verde/amarillo/rojo), recomendaciones, y un Excel descargable con la mini servilleta calculada.

---

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** para estilos
- **Zustand** para estado del wizard (con persistencia a localStorage)
- **ExcelJS** para generar el Excel descargable desde la plantilla `lib/templates/servilleta.xlsm`
- **Supabase** (opcional) para guardar sesiones
- **DeepSeek API** para el chat IA "PrestIA"
- **Vitest** para tests unitarios

---

## Requisitos previos

- **Node.js 20+** (recomendado 22). Instala con `brew install node` o desde [nodejs.org](https://nodejs.org).
- npm (viene con Node)

---

## Setup (primera vez)

```bash
# 1. Descomprime el zip y entra a la carpeta
cd prestigio-servilleta

# 2. Instala dependencias
npm install

# 3. (Opcional) Configura variables de entorno
# Crea un archivo .env.local con:
#   DEEPSEEK_API_KEY=...              # Para el chat IA. Sin esto el chat no funciona pero el resto sí.
#   NEXT_PUBLIC_SUPABASE_URL=...      # Opcional. Sin esto las sesiones se guardan localmente.
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
#   SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Comandos

```bash
npm run dev        # Servidor de desarrollo en http://localhost:3000
npm run build      # Build de producción (también sirve como type-check)
npm run start      # Servidor de producción (después de build)
npm test           # Corre los tests con vitest
npm run test:watch # Tests en modo watch
```

---

## Cómo probar la app

1. Corre `npm run dev`
2. Abre http://localhost:3000/wizard en el navegador
3. Verás 3 pasos:
   - **Paso 1**: datos de la empresa (nombre, cédula, sector, años a comparar)
   - **Paso 2**: la servilleta financiera (P&G + Balance + FCL + Caja Final, todo con dos columnas año anterior / año actual)
   - **Paso 3**: confirmación
4. Al terminar verás el diagnóstico con indicadores semáforo y opción de descargar el Excel

Los campos vienen pre-llenados con datos ficticios de "Delicias del Valle S.A.S." (cadena de restaurantes) para acelerar el testing. Para reset, hay un botón "Hacer un nuevo análisis" al final del diagnóstico.

---

## Estructura del proyecto

```
app/
  page.tsx                       # Landing
  wizard/page.tsx                # Wizard de 3 pasos
  resultados/[sessionId]/page.tsx # Página de diagnóstico
  api/
    chat/route.ts                # SSE streaming endpoint para PrestIA (DeepSeek)
    export/route.ts              # Genera Excel desde plantilla
    session/route.ts             # CRUD sesiones (Supabase)

components/
  servilleta/ServilletaView.tsx  # Formulario principal — la "servilleta"
  resultados/                    # Cards de indicadores y botón descarga
  wizard/                        # Steps del wizard
  asistente/MascotaAI.tsx        # Burbuja flotante de PrestIA

lib/
  wizard-store.ts                # Zustand store con persistencia
  indicadores.ts                 # TODOS los cálculos financieros (KTNO, EBITDA, FCL, caja final, semáforos)
  templates/servilleta.xlsm      # Plantilla Excel con fórmulas pre-construidas

types/servilleta.ts              # Tipos: DatosAnio, IndicadoresAnio, etc.

tests/indicadores.test.ts        # Tests vitest
```

---

## Conceptos clave

**Servilleta**: la metáfora del proyecto. La idea es que el diagnóstico financiero debe ser tan simple como hacer cuentas en una servilleta de restaurante. La hoja Excel original de Bancolombia se llama así.

**Mini servilleta vs. Servilleta completa**: actualmente sólo recolectamos los datos necesarios para la **mini servilleta** (ingresos, costos+gastos, EBITDA, intereses, impuestos, cartera, inventarios, activos fijos, proveedores, servicio deuda, dividendos, capitalización). Los indicadores mostrados son sólo los derivables de esos datos.

**Indicadores semáforo**: verde = saludable, amarillo = atención, rojo = crítico. Los umbrales actuales están definidos internamente y **pendientes de validación con Bancolombia**.

**Caja Final**: fórmula unificada en `lib/indicadores.ts → calcularCajaFinal()`:
```
Caja Final = FCL - Intereses - Amortización Capital - Dividendos + Capitalización
```

---

## Contexto del proyecto

- **Diana**: project lead en Prestigio, reviewer principal. Da feedback por audio.
- **Bancolombia PAE team (Isa, Diana, Dianis)**: expertas financieras que diseñaron la servilleta original.
- **Idioma**: todo está en español (UI, código, tipos, comentarios).
- **Usuario objetivo**: "don Jerónimo", dueño de PYME que no necesariamente sabe términos financieros — el lenguaje debe ser simple, no técnico.

Para el plan detallado de la fase 2 (correcciones por feedback de Diana), ver `ajustes-fase-2.md`.

Para guidance al asistente IA Claude Code, ver `CLAUDE.md`.

---

## Pendientes de validación con Bancolombia

- Umbrales de los semáforos por sector económico
- Las rotaciones (cartera, inventarios, proveedores) en la plantilla Excel tienen una división por 12 y multiplicación por 12 que se anula matemáticamente — preguntar a Dianis por qué está esa fórmula
- Si soportar 3 años (la plantilla Excel original tiene 3 columnas)

---

## Contacto

Cualquier duda, hablar con Jerónimo.
