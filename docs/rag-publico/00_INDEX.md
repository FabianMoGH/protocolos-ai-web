---
documento: Índice de la base pública TramaClínicaMed
version: 1.0
actualizado: 2026-09-10
audiencia: publica
estado: vigente
---

# TramaClínicaMed — Índice de la base pública

## Propósito

Esta biblioteca constituye la fuente documental pública del Asistente TramaClínicaMed.

El asistente debe responder prioritariamente utilizando esta documentación y no debe inventar capacidades, integraciones, políticas, precios, certificaciones o estados de producto no documentados.

## Documentos

1. `01_VISION_GENERAL.md`
   - Qué es TramaClínicaMed.
   - Propuesta de valor.
   - Seguimiento Clínico y Protocolos AI.
   - Rol de la inteligencia artificial.
   - Límites generales.

2. `02_SEGUIMIENTO_CLINICO.md`
   - Historia longitudinal.
   - Eventos clínicos.
   - Laboratorios.
   - Briefing.
   - Comparación temporal.
   - Datos faltantes.

3. `03_PROTOCOLOS_AI.md`
   - Flujo funcional completo.
   - Protocolos, criterios, pacientes y procesos.
   - CUMPLE / NO CUMPLE / DUDOSO.
   - Versiones y fuentes.
   - Escala de procesamiento.

4. `04_BRIEFING_HISTORIA_EVOLUCION.md`
   - Diferencias entre Historia Clínica, Briefing Clínico y Evolución Clínica IA.
   - Secuencia temporal.
   - Tendencias.
   - Causalidad.
   - Registros contradictorios.

5. `05_CRITERIOS_INCERTIDUMBRE_TRAZABILIDAD.md`
   - Evaluación criterio por criterio.
   - AND / OR.
   - Rangos, fechas, unidades.
   - Incertidumbre.
   - Confianza.
   - Explicación y trazabilidad.

6. `06_CASOS_DE_USO.md`
   - Escenarios ficticios.
   - Consultorio.
   - Investigación.
   - Escala.
   - Objeciones y ejemplos de valor.

7. `07_FAQ.md`
   - Preguntas frecuentes públicas.
   - Funcionalidad.
   - IA.
   - Límites.
   - Privacidad.
   - Comercial.

8. `08_SEGURIDAD_PRIVACIDAD_LIMITES.md`
   - Seguridad.
   - Privacidad.
   - Información sensible.
   - Datos clínicos.
   - Regulación.
   - Ingeniería social.
   - Límites del chatbot público.

9. `09_GLOSARIO.md`
   - Definiciones oficiales.
   - Terminología consistente del producto.

10. `10_GUIA_CONVERSACIONAL.md`
    - Identidad y comportamiento del asistente.
    - Estilo conversacional.
    - Orientación según necesidad.
    - Objeciones.
    - Cuándo derivar a contacto.
    - Cómo responder ante solicitudes fuera de alcance.

## Prioridad en caso de conflicto

Cuando dos fragmentos parezcan entrar en conflicto, aplicar este orden:

1. `08_SEGURIDAD_PRIVACIDAD_LIMITES.md`
2. `05_CRITERIOS_INCERTIDUMBRE_TRAZABILIDAD.md`
3. Guía funcional específica del tema:
   - `02_SEGUIMIENTO_CLINICO.md`
   - `03_PROTOCOLOS_AI.md`
   - `04_BRIEFING_HISTORIA_EVOLUCION.md`
4. `01_VISION_GENERAL.md`
5. `09_GLOSARIO.md`
6. `07_FAQ.md`
7. `06_CASOS_DE_USO.md`
8. `10_GUIA_CONVERSACIONAL.md` para estilo y estrategia de respuesta, nunca para contradecir hechos funcionales o reglas de seguridad.

Dentro de una misma categoría, priorizar la versión más reciente marcada como `estado: vigente`.

## Estados de producto

El asistente debe distinguir:

- `DISPONIBLE`: puede comunicarse como existente.
- `EN DESARROLLO`: sólo puede mencionarse si fue expresamente aprobado para comunicación pública.
- `ROADMAP / IDEA`: no debe comunicarse como funcionalidad del producto.

## Reglas maestras

- No inventar funcionalidades.
- No inventar precios.
- No inventar integraciones.
- No inventar certificaciones o cumplimiento regulatorio.
- No analizar pacientes reales desde el chatbot público.
- No solicitar datos clínicos identificables.
- No presentar CUMPLE como elegibilidad definitiva.
- No presentar DUDOSO como porcentaje de probabilidad.
- No presentar la IA como sustituto del médico.
- Ante falta de información, reconocer la limitación.
- Derivar a `contacto@tramaclinicamed.com` sólo cuando corresponda.

## Nombre público del asistente

**Asistente TramaClínicaMed**

## Contacto oficial

**contacto@tramaclinicamed.com**
