# Ajustes Fase 2 — Feedback Diana (Abril 2026)

---

## A implementar

### 1. PrestIA mas visible

**Problema:** El boton flotante es solo un circulo con "P" — no es claro que hay un asistente IA disponible.

**Archivo:** `components/asistente/MascotaAI.tsx:267-287`

**Cambios:**
- Reemplazar la "P" sola por un label visible tipo "PrestIA" o un icono de chat con texto
- Agregar un tooltip o badge permanente que diga "Preguntame" o "PrestIA te ayuda" cuando el chat esta cerrado
- El boton actual es `w-16 h-16` con `<span>P</span>` — cambiar por un boton mas ancho con texto o agregar un label flotante al lado
- Considerar una animacion inicial (pulse o bounce) que llame la atencion la primera vez que carga la pagina
- Ya existe en la pagina de resultados (`app/resultados/[sessionId]/page.tsx:247`), verificar que tambien sea visible ahi

**Ejemplo de implementacion:**
```tsx
// En lugar de solo "P", mostrar label expandido
{abierto ? (
  <X size={24} className="text-white" />
) : (
  <div className="flex items-center gap-2">
    <span className="text-white text-lg font-bold">PrestIA</span>
    <MessageCircle size={18} className="text-white" />
  </div>
)}
```
El boton necesitaria pasar de `w-16 h-16 rounded-full` a algo como `px-4 py-3 rounded-full` para acomodar el texto.

---

### 4. Separar intereses de amortizacion a capital

**Problema:** Se pide un solo campo "Servicio de la Deuda" pero internamente se necesitan intereses y amortizacion por separado. Ademas, `indicadores.ts` usa `datos.intereses` (que no se pide explicitamente en la UI) y calcula amortizacion desde `obligacionesFinancierasLP`, causando inconsistencias.

**Archivos a modificar:**

#### a) `types/servilleta.ts`
- `DatosAnio` ya tiene `intereses: number` (linea 13) y `servicioDeuda: number` (linea 33)
- Agregar campo `amortizacionDeuda: number` (abono a capital)
- Deprecar o eliminar `servicioDeuda` ya que sera la suma de ambos
- Actualizar `valoresPorDefecto` si existen

#### b) `components/servilleta/ServilletaView.tsx:546-553`
- Donde hoy dice `(-) Servicio de la Deuda` con un solo `CampoInline`, reemplazar por DOS campos:
  ```
  (-) Intereses financieros     [campo]
  (-) Amortizacion a capital    [campo]
  ```
- Actualizar `onChange` para usar `updateDatosActual('intereses', v)` y `updateDatosActual('amortizacionDeuda', v)`
- Agregar TIPS especificos para cada campo:
  - Intereses: "Lo que pagas al banco por el uso del dinero prestado"
  - Amortizacion: "El abono a capital que reduces de tu deuda"

#### c) `components/servilleta/ServilletaView.tsx:339-341` (calculo cajaFinal en UI)
- Hoy: `const servDeuda = act.servicioDeuda || 0`
- Cambiar a: `const servDeuda = (act.intereses || 0) + (act.amortizacionDeuda || 0)`

#### d) `lib/indicadores.ts`
- Linea donde calcula `servicioDeudaIntereses` y `servicioDeudaAmortizacion` — ahora tomar directamente de `datos.intereses` y `datos.amortizacionDeuda` en lugar de derivarlos
- Esto elimina la inconsistencia actual donde intereses se estima en vez de pedirse

#### e) `lib/wizard-store.ts`
- Agregar `amortizacionDeuda: 0` a los valores por defecto de `datosActual`
- Manejar migracion de localStorage: si existe `servicioDeuda` sin `amortizacionDeuda`, migrar (poner servicioDeuda en intereses o dejarlo como amortizacion con warning)

#### f) `app/api/export/route.ts`
- Actualizar celdas del Excel para escribir intereses y amortizacion por separado donde corresponda
- Mini-servilleta celda C8/D8 ya escribe `intereses` — verificar que ahora tome el valor correcto

---

### 5. Aclarar ano en label de impuestos

**Problema:** El campo "(-) Impuestos" no indica de que ano son.

**Archivo:** `components/servilleta/ServilletaView.tsx:520-527`

**Cambio:**
- Hoy: `<span>(-) Impuestos</span>`
- Cambiar a: `<span>(-) Impuestos {anioActual}</span>` usando el ano del store
- Hacer lo mismo con cualquier otro campo de la seccion de Caja Final que no tenga ano explicito
- Verificar que el TIPS de impuestos tambien mencione el ano

**Nota:** Este cambio depende de la respuesta de Diana sobre si quiere datos de ambos anos. Si se piden impuestos de ambos anos, cada uno debe tener su label con ano.

---

### 7. Mostrar rotaciones individuales ademas del ciclo financiero

**Problema:** Solo se muestra "Ciclo Financiero" como indicador, pero Diana quiere ver tambien rotacion de cartera, inventarios y proveedores individualmente (en dias).

**Archivos:**

#### a) `lib/indicadores.ts:198-220` (funcion `indicadoresConSemaforo`)
- Agregar 3 indicadores nuevos al array de retorno:
```ts
{
  nombre: 'Rotacion de Cartera',
  valor: ind.rotacionCarteraDias,
  semaforo: semaforo('rotacionCarteraDias', ind.rotacionCarteraDias),
  descripcion: 'Dias promedio que tardas en cobrar a tus clientes',
  formato: 'dias',
},
{
  nombre: 'Rotacion de Inventarios',
  valor: ind.rotacionInventariosDias,
  semaforo: semaforo('rotacionInventariosDias', ind.rotacionInventariosDias),
  descripcion: 'Dias promedio que tu inventario permanece almacenado',
  formato: 'dias',
},
{
  nombre: 'Rotacion de Proveedores',
  valor: ind.rotacionProveedoresDias,
  semaforo: semaforo('rotacionProveedoresDias', ind.rotacionProveedoresDias),
  descripcion: 'Dias promedio que tardas en pagar a tus proveedores',
  formato: 'dias',
},
```

#### b) `lib/indicadores.ts` — funcion `obtenerSemaforo`
- Agregar umbrales para las 3 rotaciones nuevas. Umbrales sugeridos (pendientes de validacion con Bancolombia):
  - Cartera: verde <= 30, amarillo <= 60, rojo > 60
  - Inventarios: verde <= 45, amarillo <= 90, rojo > 90
  - Proveedores: verde >= 30 (mas dias = mejor), amarillo >= 15, rojo < 15
  - **OJO:** Proveedores tiene logica invertida — mas dias es mejor (mas plazo para pagar)

#### c) `app/resultados/[sessionId]/page.tsx`
- Los indicadores nuevos apareceran automaticamente si se agregan a `indicadoresConSemaforo()`, ya que la pagina de resultados itera sobre el array
- Verificar que el layout soporte 3 cards adicionales sin romperse
- Considerar agrupar los 3 + ciclo financiero bajo un subtitulo "Ciclo Financiero" para claridad visual

---

### 10. PDC — verificar que siempre diga "Palanca de Crecimiento"

**Problema:** Diana dice que "PDC" a secas no se entiende.

**Estado actual:** Ya esta implementado en la mayoria de lugares. Verificar estos archivos:

| Archivo | Linea | Texto actual | Accion |
|---------|-------|-------------|--------|
| `app/resultados/[sessionId]/page.tsx:49` | `Tu PDC > 1 significa...` | Cambiar a "Tu Palanca de Crecimiento (PDC) > 1..." |
| `app/resultados/[sessionId]/page.tsx:216-217` | `PDC de ${...}` | Verificar que tenga contexto |
| `lib/ai-client.ts:12` | Ya dice "Palanca de Crecimiento (PDC)" | OK |
| `app/api/chat/route.ts:10` | Ya dice "Palanca de Crecimiento (PDC)" | OK |

**Cambio:** Buscar TODAS las ocurrencias de "PDC" y asegurar que la primera mencion en cada seccion/componente use el nombre completo "Palanca de Crecimiento (PDC)". Usos subsecuentes en el mismo bloque pueden usar solo "PDC".

---

### 11. Bug critico: caja final no coincide entre web y Excel

**Problema:** La caja final en la web muestra -112 pero en la mini-servilleta del Excel descargado muestra 293.

**Causa raiz identificada:** HAY DOS CALCULOS DIFERENTES de caja final:

#### Calculo en la UI (ServilletaView.tsx:339-341):
```ts
const cajaFinal = fcl - servDeuda - dividendos
```
Usa `datos.servicioDeuda` (valor directo del usuario).

#### Calculo en indicadores.ts:
```ts
cajaPeriodo = flujoCajaLibre - servicioDeudaIntereses - servicioDeudaAmortizacion + cambioEnDeuda
```
Usa `datos.intereses` + amortizacion derivada de `obligacionesFinancierasLP / 2`. Ademas suma `cambioEnDeuda` que la UI no considera.

#### En el Excel:
La mini-servilleta NO recibe cajaPeriodo/cajaFinal como dato — el Excel la calcula con sus propias formulas internas a partir de los inputs que recibe. Si los inputs no estan completos (falta servicioDeuda, dividendos, etc.) o las formulas del template difieren, el resultado sera distinto.

**Solucion:**

1. **Unificar el calculo** — Debe haber UNA SOLA funcion que calcule cajaFinal, usada tanto por la UI como por indicadores.ts:
   - Crear o refactorizar en `lib/indicadores.ts` una funcion `calcularCajaFinal(datos)` que sea la fuente de verdad
   - `ServilletaView.tsx` debe importar y usar esa funcion en vez de calcular inline
   - Esto se resuelve naturalmente al implementar punto 4 (separar intereses/amortizacion)

2. **Alimentar el Excel correctamente** — En `app/api/export/route.ts`:
   - Escribir `servicioDeuda` (o intereses + amortizacion) en las celdas correspondientes de la mini-servilleta
   - Escribir `dividendos` en su celda
   - Actualmente NO se escriben estos valores (ver punto 12)
   - Identificar las celdas exactas abriendo el template `lib/templates/servilleta.xlsm` y buscando donde van servicio de deuda, dividendos y caja final

3. **Verificar formulas del template Excel** — Abrir `servilleta.xlsm` y confirmar que las formulas de la mini-servilleta calculen caja final de la misma manera que el codigo

---

### 12. Campos faltantes en mini-servilleta del Excel

**Problema:** La mini-servilleta descargada no incluye servicio de la deuda, dividendos ni capitalización.

**Archivo:** `app/api/export/route.ts:121-160`

**Celdas actuales que se escriben:**
- C5/D5: Ingresos
- C6/D6: Costos+Gastos
- C7/D7: EBITDA
- C8/D8: Intereses
- C9/D9: Impuestos
- C11/D11: Cartera
- C12/D12: Inventarios
- C13/D13: Activos fijos
- C14/D14: Proveedores

**Celdas que FALTAN por escribir** (verificar posicion exacta en el template):
- Servicio de la deuda (o sus componentes: intereses ya esta en C8/D8, falta amortizacion a capital)
- Dividendos
- Capitalizacion (si se agrega como campo nuevo — ver seccion pendientes)

**Pasos:**
1. Abrir `lib/templates/servilleta.xlsm`, hoja "Mini servilleta"
2. Identificar en que filas van: amortizacion deuda, dividendos, capitalizacion, caja final
3. Agregar los `setInput()` correspondientes en el export route
4. Verificar que la caja final del Excel coincida con la de la web despues de los cambios

---

## Pendientes de validacion con Diana / Bancolombia

Estos puntos NO se deben implementar hasta tener respuesta. Se listan con contexto para facilitar la conversacion.

### P1. Datos del P&G — un ano o dos anos?

**Lo que dijo Diana:** "Solo pides informacion del 2025, debes preguntar tambien 2024."

**Estado actual:** El P&G se pide solo del ano actual. El balance se pide de ambos anos. Esto es asi porque la servilleta original de Bancolombia solo usa el P&G del ultimo periodo — los indicadores se calculan con un solo P&G.

**Implicacion de pedir P&G de ambos anos:**
- Habria que duplicar toda la seccion de P&G en la UI (ingresos, costos, gastos, dep&amort para cada ano)
- Permitiria calcular crecimiento en ventas, comparar margenes interanuales
- Actualmente `crecimientoVentas` se calcula comparando `ingresosOperacionales` de ambos anos — pero si solo se pide un P&G, el dato del ano anterior no existe (o se inicializa en 0)
- **Archivos afectados:** `ServilletaView.tsx` (duplicar seccion P&G), `wizard-store.ts` (datos anteriores del P&G), `indicadores.ts` (usar datos reales vs. estimados)

**Pregunta para Diana:** "El P&G se pide solo del ultimo ano porque asi esta la servilleta original. Si necesitas comparar margenes entre anos, podemos pedirlo de ambos. Confirma si quieres P&G completo de los dos anos o si el balance de ambos anos es suficiente."

---

### P2. Separar depreciaciones de amortizaciones

**Lo que dijo Diana:** "Separar depreciaciones de amortizaciones, no preguntarlo junto."

**Estado actual:** Un solo campo `depreciacionesAmortizaciones` en la UI y en el tipo `DatosAnio`. La servilleta original del Excel tambien los tiene juntos en una sola celda.

**Implicacion:**
- Separar cambia la estructura del tipo `DatosAnio` — agregar `depreciaciones: number` y `amortizaciones: number`
- La formula del EBITDA no cambia (suma ambos de todas formas): `EBITDA = Utilidad Bruta - Gastos Op + Dep + Amort`
- Ningun indicador actual usa dep o amort por separado
- El Excel template tendria que tener celdas separadas (hoy no las tiene)

**Pregunta para Diana:** "La servilleta original los tiene juntos. Si los separamos, es un cambio estructural que afecta el Excel. Hay algun indicador que necesite dep y amort por separado? O es solo para mayor claridad en la captura de datos?"

---

### P3. Agregar campo de capitalizacion

**Lo que dijo Diana:** "Falta la capitalizacion para tener la caja final."

**Contexto:** Capitalizacion = aportes adicionales de capital que hacen los socios al negocio. Es un flujo positivo (entra dinero). La formula completa de caja final seria:

```
Caja Final = FCL - Servicio Deuda - Dividendos + Capitalizacion
```

**Estado actual:** No existe el campo. `dividendos` existe y se resta. Si capitalizacion es relevante, hay que:
- Agregar `capitalizacion: number` a `DatosAnio` en `types/servilleta.ts`
- Agregar campo en `ServilletaView.tsx` en la seccion de Caja Final con signo positivo: `(+) Capitalizacion`
- Actualizar calculo de cajaFinal en `indicadores.ts` y en la UI
- Agregar celda en el export del Excel

**Pregunta para Diana:** "Confirmo: capitalizacion son aportes adicionales de socios? Es un campo separado de dividendos? Lo agrego como (+) Capitalizacion en la seccion de Caja Final."

---

### P4. Excel — descargar solo mini-servilleta o tambien la completa?

**Lo que dijo Diana:** "Solo descargar la mini-servilleta, que todo lo otro quede completamente en blanco."

**Historial:**
- Reunion marzo 2026: se hablo de descargar "Servilleta Su empresa" (la hoja principal)
- Reunion abril 2026: se implemento descarga de ambas hojas (Servilleta Su empresa + Mini servilleta)
- Audio abril 2026: Diana pide SOLO mini-servilleta, hojas extra en blanco

**Implicacion:**
- Eliminar la escritura de datos en la hoja "Servilleta Su empresa" del export route
- O mejor: eliminar las hojas extra del workbook antes de descargar, dejando solo "Mini servilleta"
- Alternativa: crear un template nuevo que solo tenga la mini-servilleta

**Pregunta para Diana:** "En la reunion anterior habiamos dejado ambas hojas. Confirmas que solo baje la mini? Si bajamos solo la mini, la hoja completa con formulas de la servilleta se perderia. O prefieres que baje ambas pero solo la mini este llena?"

---

### P5. Ciclo financiero negativo — mostrar signo o no?

**Lo que dijo Diana:** "Sale -95 dias pero deberia ser 95 dias, el guion es un error."

**Realidad financiera:** Un ciclo financiero negativo es un dato real con significado:
- `Ciclo = Rot. Cartera + Rot. Inventarios - Rot. Proveedores`
- Si proveedores > cartera + inventarios, el ciclo es negativo
- Significa que la empresa se financia con plazos de proveedores (positivo para el negocio)
- Ejemplo: cobras a 30 dias, inventario rota en 20 dias, pagas proveedores a 150 dias → ciclo = 30 + 20 - 150 = -100 dias

**Opciones:**
1. **Mostrar con signo + explicacion contextual** (recomendado): "-95 dias — tu empresa se financia con proveedores, lo cual es positivo"
2. **Mostrar valor absoluto**: "95 dias" pero se pierde informacion
3. **Mostrar con indicador visual**: icono verde si es negativo (bueno), con tooltip explicativo

**Pregunta para Diana:** "El signo negativo no es error — significa que tus proveedores financian la operacion (es positivo). Propongo mostrarlo con signo y una explicacion clara. Si prefieres que no aparezca el signo, confirmame."

---

### P6. Umbrales del semaforo

**Pendiente desde reunion de marzo 2026.** Aun no validados con Bancolombia.

**Umbrales actuales (definidos internamente, sin validacion):**
- Margen EBITDA: verde >= 15%, amarillo >= 5%, rojo < 5%
- Margen Neto: verde >= 10%, amarillo >= 3%, rojo < 3%
- Endeudamiento: verde <= 40%, amarillo <= 60%, rojo > 60%
- Ciclo Financiero: verde <= 60 dias, amarillo <= 120 dias, rojo > 120 dias
- PDC: verde > 1, amarillo entre 0.5 y 1, rojo < 0.5

**Estos umbrales pueden variar por sector economico.** Bancolombia puede tener benchmarks sectoriales que harian los umbrales mas precisos.

**Nota:** Si se agregan rotaciones individuales (punto 7), tambien necesitan umbrales validados.

---

### P7. Soporte para 3 anos

**Contexto:** El Excel original tiene espacio para 3 columnas de anos. La app actualmente soporta 2.

**Pendiente desde reunion de marzo 2026.** Bancolombia debe definir:
- Si habilitar 3 anos o dejarlo en 2
- Que pasa con empresas de 1 solo ano de operacion

**No bloquea ninguna implementacion actual.**

---

### P8. Gestión y Acciones (feature futuro)

**Pendiente desde reunion de marzo 2026.** Es un modulo completo que guia al usuario en acciones correctivas segun los indicadores problematicos.

**Estructura (de la hoja "Gestion y Acciones" del Excel):**
- Columna izquierda: acciones tecnicas (Rubik) — tacticas, operativas, del dia a dia
- Columna derecha: acciones conscientes (Prestigio) — estrategicas, holisticas, de proposito
- Se activan segun el area problematica: ingresos, costos/gastos, inventarios, cartera, etc.

**No implementar hasta tener reunion especifica sobre este modulo.** Requiere diseno de UX completo (paso a paso? seleccion? generado por IA?).

---

## Orden de implementacion sugerido

1. **Punto 4** (separar intereses/amortizacion) — desbloquea la correccion del bug
2. **Punto 11** (bug caja final) — depende de punto 4, es el mas critico
3. **Punto 12** (campos faltantes Excel) — se hace junto con 11
4. **Punto 7** (rotaciones individuales) — cambio aislado en indicadores + resultados
5. **Punto 5** (label ano en impuestos) — cambio menor de UI
6. **Punto 1** (PrestIA visible) — cambio de UI independiente
7. **Punto 10** (PDC texto completo) — cambio menor, grep + replace
