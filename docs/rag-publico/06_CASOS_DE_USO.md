---
documento: TramaClínicaMed — Casos de uso públicos
version: 1.0
actualizado: 2026-09-10
audiencia: publica
estado: vigente
---

# Casos de uso y ejemplos

Todos los casos son ficticios.

## 1. Pacientes que vuelven cada seis meses

Problema:
el médico debe reconstruir qué ocurrió desde el último control.

TramaClínicaMed:
historia longitudinal + briefing.

Valor:
reducir revisión manual previa.

## 2. Historia muy extensa

Problema:
años de consultas, laboratorios y tratamientos.

TramaClínicaMed:
cronología + síntesis.

Valor:
hacer navegable una historia grande.

## 3. Comparación de laboratorios

HbA1c:
- marzo 6,8 %
- junio 7,1 %
- septiembre 7,4 %

La IA puede describir el aumento.

No debe concluir automáticamente deterioro clínico.

## 4. Briefing antes de consulta

Puede resumir:

- diagnósticos;
- tratamiento;
- último laboratorio;
- última consulta;
- datos faltantes.

## 5. Evolución Clínica IA

Secuencia:
consulta → laboratorio → cambio de medicación → nuevo laboratorio.

La IA describe la secuencia. El profesional interpreta.

## 6. Información insuficiente

Un solo valor de creatinina.

Respuesta correcta:
“No hay suficientes puntos históricos para describir evolución.”

## 7. Registros contradictorios

Un registro indica alergia y otro posterior la niega.

La IA debe señalar la contradicción.

## 8. Centro con 300 pacientes y 5 protocolos

Hasta 1.500 combinaciones.

Protocolos AI puede clasificar:

- compatibles;
- incompatibles;
- dudosos;
- incompletos.

## 9. Incompatibilidad clara

Criterio:
edad 40–65.

Paciente ficticio:
72.

Resultado:
NO CUMPLE.

## 10. DUDOSO por faltante

Edad y diagnóstico compatibles, pero falta eGFR.

Resultado:
DUDOSO.

## 11. Resultado cambia por nuevo dato

ENERO:
DUDOSO.

MARZO:
se carga laboratorio nuevo.

Nueva evaluación:
CUMPLE.

## 12. Resultado cambia por nueva versión

Versión A:
edad máxima 70.

Versión B:
edad máxima 75.

Paciente:
72.

La trazabilidad explica por qué el resultado cambia.

## 13. Historias incompletas

Protocolos AI puede convertir faltantes en una lista concreta de datos a revisar.

## 14. Médico que ya usa otra historia clínica

No afirmar que debe reemplazarla.

Explicar:
TramaClínicaMed agrega síntesis, seguimiento longitudinal y análisis asistido.

## 15. Médico sin investigación

Puede usar Seguimiento Clínico sin Protocolos AI.

## 16. Profesional con ambos ámbitos

Seguimiento Clínico para historia y evolución.

Protocolos AI para preevaluación de estudios.

## 17. Centro con muchos DUDOSO

Puede revelar:

- datos clínicos faltantes;
- criterios difíciles;
- problemas de estructuración.

## 18. Visitante técnico

Pregunta:
“¿Es sólo un wrapper de ChatGPT?”

Respuesta:
“No. La IA es una capa dentro de una aplicación con datos estructurados, reglas, procesos y trazabilidad.”

## 19. Visitante desconfiado

Pregunta:
“No quiero que la IA decida sobre mis pacientes.”

Respuesta:
“No está diseñada para hacerlo. La IA organiza y preevalúa; el profesional decide.”

## 20. Precio

Pregunta:
“¿Cuánto cuesta?”

Respuesta:
“Los precios y modalidades se consultan en contacto@tramaclinicamed.com.”

## 21. Integración no documentada

Pregunta:
“¿Se conecta con sistema X?”

Respuesta:
“No tengo información pública suficiente para confirmarlo. Podés consultarlo en contacto@tramaclinicamed.com.”

## 22. Función futura

Si pregunta por agenda, SMS, mapa corporal u otra idea no publicada:

No presentarla como disponible.

## 23. Explicación simple de Protocolos AI

“Automatiza una primera revisión de pacientes frente a criterios para ayudar al equipo a priorizar casos, manteniendo explicación y trazabilidad.”

## 24. Explicación simple de Seguimiento Clínico

“Ayuda a organizar la historia del paciente y recuperar rápidamente información relevante, incluyendo laboratorios, evolución y resúmenes asistidos por IA.”

## 25. Regla final

Cada caso debe explicar:

- problema;
- función relevante;
- papel de la IA;
- límite profesional.
