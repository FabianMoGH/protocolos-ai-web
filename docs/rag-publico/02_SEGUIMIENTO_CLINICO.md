---
documento: TramaClínicaMed — Seguimiento Clínico
version: 1.0
actualizado: 2026-09-10
audiencia: publica
estado: vigente
---

# Seguimiento Clínico
## Guía funcional pública

Seguimiento Clínico organiza y facilita la revisión de la información clínica de un paciente a lo largo del tiempo.

## Objetivos

Ayudar al profesional a responder rápidamente:

- qué antecedentes importantes tiene un paciente;
- qué ocurrió desde la última consulta;
- cuáles fueron sus últimos laboratorios;
- cómo evolucionaron determinados parámetros;
- qué diagnósticos y tratamientos están registrados;
- qué información relevante podría faltar.

## Historia longitudinal

La información clínica se entiende como una secuencia de eventos:

Consulta → Laboratorio → Cambio de tratamiento → Nueva consulta → Nuevo laboratorio.

La plataforma busca conservar esa dimensión temporal.

## Ficha del paciente

La ficha funciona como punto de acceso a la información clínica disponible.

Puede incluir:

- diagnósticos;
- tratamientos;
- medicación;
- alergias;
- consultas;
- laboratorios;
- otros eventos clínicos.

## Eventos clínicos

Un evento clínico representa algo ocurrido en un momento determinado.

Ejemplos:

- consulta;
- laboratorio;
- diagnóstico;
- cambio de medicación;
- internación;
- cirugía;
- vacunación.

## Laboratorios

Los laboratorios se conservan históricamente.

Un valor aislado representa una fotografía. Varios valores permiten observar una evolución.

Ejemplo ficticio:

HbA1c:
- marzo: 6,8 %
- junio: 7,1 %
- septiembre: 7,4 %

La plataforma puede facilitar la comparación. La interpretación clínica corresponde al profesional.

## Briefing Clínico

El Briefing es una síntesis estructurada asistida por IA.

Puede incluir:

- diagnósticos relevantes;
- tratamientos;
- alergias;
- laboratorio reciente;
- datos faltantes;
- aspectos que podrían merecer revisión.

No reemplaza la historia original y no genera un diagnóstico autónomo.

## Datos registrados versus observaciones IA

DATO REGISTRADO:
HbA1c 7,4 % el 10/09.

OBSERVACIÓN IA:
El valor es superior al control anterior.

La observación no debe presentarse como un hecho clínico adicional.

## Datos faltantes

El sistema debe poder reconocer:

- ausencia de laboratorio reciente;
- medicación no registrada;
- controles inexistentes;
- falta de información suficiente para comparar.

No debe inventar.

## Evolución Clínica

El Briefing pregunta:
**“¿Qué necesito saber ahora?”**

La Evolución Clínica pregunta:
**“¿Qué fue ocurriendo a través del tiempo?”**

El briefing es una fotografía organizada. La evolución es una película resumida.

## Tendencias

La IA puede describir:

- aumentos;
- disminuciones;
- estabilidad;
- variaciones;
- nuevos eventos.

No debe transformar una tendencia aislada en diagnóstico o pronóstico.

## Causalidad

La proximidad temporal no demuestra causalidad.

Puede decir:
“el cambio ocurrió después de…”

No debe afirmar:
“el tratamiento causó…”

sin evidencia suficiente.

## Información contradictoria

Si dos registros se contradicen, la IA debe señalar la discrepancia y no decidir arbitrariamente cuál es correcta.

## Preguntas frecuentes orientativas

### “¿Sirve si veo pacientes cada seis meses?”

Sí. El briefing y la historia longitudinal ayudan a recuperar contexto sin releer toda la historia desde cero.

### “¿Puede comparar laboratorios?”

Sí, cuando hay valores históricos comparables.

### “¿La IA diagnostica?”

No. Organiza y analiza información disponible como apoyo.

### “¿Tengo que abandonar mi sistema actual?”

No necesariamente. La utilidad depende del flujo actual y del problema que se quiera resolver.

### “¿Seguimiento Clínico sirve sin Protocolos AI?”

Sí. Son áreas relacionadas pero independientes.

## Regla final

Seguimiento Clínico busca transformar registros aislados en una historia más fácil de comprender y revisar, manteniendo al profesional como responsable de la interpretación.
