import { GoogleGenerativeAI } from '@google/generative-ai';
import { PayrollStats } from '../../types/payroll.types.js';

export class GeminiService {
  /**
   * Realiza una consulta analítica de nómina utilizando Gemini.
   * Si no se provee API Key, se utiliza un fallback determinista basado en análisis de palabras clave.
   */
  static async queryPayroll(query: string, stats: PayrollStats, clientName: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    const formattedStats = `
Cliente / Empresa: ${clientName}
Masa Salarial Total: $${stats.summary.totalRemuneration.toLocaleString('es-AR')} ARS
Total Empleados (Fuerza Laboral): ${stats.summary.totalEmployees}
Sueldo Promedio: $${stats.summary.averageRemuneration.toLocaleString('es-AR')} ARS
Adicionales y Premios Totales: $${stats.summary.totalAdicionales.toLocaleString('es-AR')} ARS
Deducciones Totales estimadas (Ley): $${(stats.summary.totalRemuneration * 0.17).toLocaleString('es-AR')} ARS
Distribución por Convenios (Obras Sociales / Sindicatos):
${stats.distributions.obraSocial.map(os => `- ${os.name}: ${os.value} empleados`).join('\n')}
Distribución por Condición:
${stats.distributions.condicion.map(c => `- ${c.name}: ${c.value} empleados`).join('\n')}
`;

    if (!apiKey) {
      console.warn('[GeminiService] GEMINI_API_KEY no configurada. Utilizando fallback analítico inteligente.');
      return this.generateMockResponse(query, stats, clientName, formattedStats);
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Usamos gemini-1.5-flash para velocidad y rendimiento en texto
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
Eres un Auditor Experto de Nómina, Costos de Personal y Consultor BI de Recursos Humanos de la empresa ${clientName}.
Tu objetivo es analizar la base de datos de nómina provista mediante estadísticas consolidadas y responder a la pregunta del usuario.

Estadísticas Consolidadas de Nómina:
${formattedStats}

Pregunta del usuario:
"${query}"

Instrucciones para la respuesta:
1. Responde de manera profesional y clara en español.
2. Usa formato Markdown con negritas, listas y/o tablas si es necesario.
3. Sé directo al grano, no des introducciones innecesarias.
4. Incluye un tip de control laboral de 1-2 oraciones útil para el analista.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (err: any) {
      console.error('[GeminiService] Error llamando a la API de Gemini:', err.message);
      return `⚠️ **Error en la API de Gemini**: ${err.message}\n\n*Nota del sistema: Se produjo un error al conectar con el servicio de IA de Google. Por favor, revisa la API Key configurada.*`;
    }
  }

  /**
   * Generador de respuestas analíticas predefinidas para simular la IA.
   */
  private static generateMockResponse(query: string, stats: PayrollStats, clientName: string, formattedStats: string): string {
    const q = query.toLowerCase();

    // 1. Promedio salarial
    if (q.includes('promedio') || q.includes('media') || q.includes('ganan') || q.includes('sueldo medio')) {
      return `### 📊 Análisis de Sueldo Promedio - **${clientName}**

El sueldo bruto promedio registrado para este período es de **$${stats.summary.averageRemuneration.toLocaleString('es-AR')} ARS**.

*   **Distribución Salarial**: La masa salarial total asciende a **$${stats.summary.totalRemuneration.toLocaleString('es-AR')} ARS**, distribuida entre los **${stats.summary.totalEmployees} colaboradores activos**.
*   **Adicionales y Premios**: Se han liquidado adicionales por un total de **$${stats.summary.totalAdicionales.toLocaleString('es-AR')} ARS** (lo que representa un **${((stats.summary.totalAdicionales / stats.summary.totalRemuneration) * 100).toFixed(1)}%** de la masa total).

💡 **Tip de Control**: Te sugiero monitorear las desviaciones del sueldo de directivos versus el personal de convenio para evitar desvíos presupuestarios imprevistos.`;
    }

    // 2. Empleados o dotación
    if (q.includes('empleado') || q.includes('dotacion') || q.includes('personas') || q.includes('fuerza') || q.includes('personal')) {
      const topConvenio = stats.distributions.obraSocial[0] || { name: 'Ninguno', value: 0 };
      return `### 👥 Análisis de Fuerza Laboral - **${clientName}**

La empresa cuenta actualmente con una dotación activa de **${stats.summary.totalEmployees} colaboradores**.

*   **Sindicato/Obra Social Mayoritaria**: La mayor parte del personal está nucleado bajo **${topConvenio.name}** con **${topConvenio.value} colaboradores** (**${((topConvenio.value / stats.summary.totalEmployees) * 100).toFixed(1)}%** del total).
*   **Condición**: La distribución muestra a la mayoría del personal en condición de revista de tipo *Activo/Convenio*.

💡 **Tip de Control**: Una alta concentración de personal en un solo convenio sindical requiere un monitoreo cercano de paritarias bimestrales para proyectar de forma correcta la caja de la empresa.`;
    }

    // 3. Costos, total o masa salarial
    if (q.includes('masa') || q.includes('total') || q.includes('costo') || q.includes('cuanto') || q.includes('gasto') || q.includes('remuneracion')) {
      return `### 💸 Auditoría de Costos de Nómina - **${clientName}**

El costo salarial bruto directo total del período asciende a **$${stats.summary.totalRemuneration.toLocaleString('es-AR')} ARS**.

*   **Sueldos Básicos & Conceptos Fijos**: Representan la mayor proporción del costo laboral.
*   **Conceptos Variables (Premios/Adicionales)**: Suman **$${stats.summary.totalAdicionales.toLocaleString('es-AR')} ARS**.
*   **Retenciones Estimadas de Ley (17%)**: Suman aproximadamente **$${(stats.summary.totalRemuneration * 0.17).toLocaleString('es-AR')} ARS**, lo que dejaría una masa neta a pagar en banco de unos **$${(stats.summary.totalRemuneration * 0.83).toLocaleString('es-AR')} ARS**.

💡 **Tip de Control**: Auditar que las retenciones del 17% de ley (Jubilación, Obra Social, Ley 19032) estén correctamente calculadas previene multas de organismos de control fiscal.`;
    }

    // 4. Convenios o sindicatos
    if (q.includes('convenio') || q.includes('obra') || q.includes('sindicato')) {
      const list = stats.distributions.obraSocial.map(os => `*   **${os.name}**: ${os.value} empleados (${((os.value / stats.summary.totalEmployees) * 100).toFixed(1)}%)`).join('\n');
      return `### 📜 Distribución de Convenios y Sindicatos - **${clientName}**

El personal de la empresa se encuentra distribuido bajo las siguientes representaciones colectivas:

${list}

💡 **Tip de Control**: Asegurar la correcta parametrización de las escalas salariales vigentes para cada convenio para evitar reclamos gremiales retroactivos.`;
    }

    // Default response
    return `### 🤖 Asistente de Auditoría AI - **${clientName}**

He analizado el resumen de la base de datos de nómina para el período seleccionado:

*   **Dotación**: ${stats.summary.totalEmployees} colaboradores activos.
*   **Masa Salarial**: $${stats.summary.totalRemuneration.toLocaleString('es-AR')} ARS de remuneraciones brutas totales.
*   **Sueldo Promedio**: $${stats.summary.averageRemuneration.toLocaleString('es-AR')} ARS.
*   **Conceptos Variables**: $${stats.summary.totalAdicionales.toLocaleString('es-AR')} ARS liquidados en adicionales.

*Nota: Tu pregunta ("${query}") se ha procesado con el motor de análisis local por defecto debido a que no hay una API Key configurada. Puedes consultar sobre promedio salarial, dotación o costos totales.*

💡 **Tip de Control**: Realizar conciliaciones bancarias mensuales contra el consolidado de remuneraciones evita desvíos en transferencias de sueldos.`;
  }
}
