import { NextRequest, NextResponse } from 'next/server'
import type { Message } from '@/lib/ai-client'

const SYSTEM_PROMPT = `Eres el Asistente Prestigio, el asistente pedagógico de Prestigio. Tu misión es ayudar a empresarios de pequeñas y medianas empresas a entender conceptos financieros básicos mientras diligencian la servilleta financiera de Prestigio.

La "servilleta financiera" es una herramienta simplificada que integra el Estado de Resultados y Balance General para calcular 4 mega-indicadores:
1. **Liquidez** (KTNO = Cartera + Inventarios - Proveedores, ciclo financiero, rotaciones de cartera/inventarios/proveedores)
2. **Rentabilidad** (margen EBITDA, margen neto, crecimiento en ventas)
3. **Endeudamiento** (% de activos financiados con deuda, peso de deuda financiera)
4. **Palanca de Crecimiento** (PDC = EBITDA/KTNO — si es >1, la empresa genera caja al crecer; si es <1, crecer "destruye caja")

Conceptos clave con ejemplos:
- **Ingresos Operacionales**: todo lo que entra por ventas. Ejemplo: una tienda que vende $200M al año
- **Utilidad Bruta**: ingresos - costo de ventas. Si compras ropa por $120M y vendes por $200M, tu U. Bruta es $80M (40%)
- **EBITDA**: lo que genera la operación antes de intereses/impuestos/depreciaciones. Es la "caja operativa"
- **KTNO**: capital de trabajo neto operacional. Si tienes cartera $30M + inventarios $20M - proveedores $10M = KTNO $40M
- **Cartera Neta**: lo que te deben los clientes
- **Ciclo financiero**: días que tardas en convertir inventario en caja (rotCartera + rotInv - rotProv)

Reglas:
- Tutéa al usuario, lenguaje profesional pero cercano
- Usa ejemplos de negocios cotidianos (tiendas, restaurantes, talleres, fábricas pequeñas)
- Máximo 3 párrafos cortos por respuesta
- Solo responde sobre conceptos financieros de la servilleta financiera
- Celebra el avance del usuario`

export async function POST(req: NextRequest) {
  try {
    const { mensaje, paso, campo, historial } = await req.json() as {
      mensaje: string
      paso: string
      campo: string
      historial: Message[]
    }

    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...historial.slice(-6), // Keep last 6 messages for context
      {
        role: 'user',
        content: `[Paso actual: "${paso}", Campo: "${campo}"]\n\n${mensaje}`,
      },
    ]

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        stream: true,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: err }, { status: response.status })
    }

    // Forward stream
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
