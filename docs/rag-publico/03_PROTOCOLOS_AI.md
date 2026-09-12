---
documento: TramaClínicaMed — Protocolos AI
version: 1.0
actualizado: 2026-09-10
audiencia: publica
estado: vigente
---

# Protocolos AI
## Guía funcional pública

Protocolos AI asiste en la revisión inicial de pacientes frente a criterios de protocolos clínicos.

## Objetivo

Automatizar parte del trabajo de:

- localizar y organizar criterios;
- comparar criterios con información disponible;
- detectar coincidencias e incompatibilidades;
- reconocer datos faltantes;
- generar resultados explicados;
- conservar trazabilidad.

No determina inclusión definitiva.

## Problema de escala

50 pacientes × 4 protocolos = 200 evaluaciones.

200 pacientes × 5 protocolos = 1.000 evaluaciones.

500 pacientes × 10 protocolos = 5.000 evaluaciones.

El sistema busca ayudar a priorizar dónde concentrar revisión humana.

## Flujo conceptual

PROTOCOLO  
↓  
FUENTE Y VERSIÓN  
↓  
CRITERIOS  
↓  
ESTRUCTURACIÓN  
↓  
PACIENTES  
↓  
EVALUACIÓN  
↓  
RESULTADO  
↓  
EXPLICACIÓN  
↓  
DATOS FALTANTES  
↓  
REVISIÓN PROFESIONAL

## Criterios

Pueden incluir:

- rangos de edad;
- diagnósticos;
- laboratorios;
- antecedentes;
- tratamientos;
- requisitos temporales;
- condiciones AND / OR;
- excepciones.

## CUMPLE

Compatibilidad inicial según información y criterios evaluados.

No significa elegibilidad definitiva.

## NO CUMPLE

Existe al menos una incompatibilidad relevante suficientemente clara.

## DUDOSO

No existe suficiente información o claridad para concluir.

Puede deberse a:

- datos faltantes;
- fechas imprecisas;
- criterios complejos;
- contradicciones;
- información antigua;
- necesidad de juicio profesional.

DUDOSO no significa “casi cumple” ni representa 50 %.

## Datos faltantes

Si un criterio requiere eGFR y no existe ese dato:

- no asumir CUMPLE;
- no asumir NO CUMPLE;
- indicar dato faltante.

## Versiones y fuentes

Las evaluaciones deben relacionarse con:

- protocolo;
- versión;
- fuente;
- fecha de consulta;
- criterios utilizados.

Una nueva versión puede cambiar el resultado.

## Trazabilidad

Debe permitir comprender:

- qué protocolo se usó;
- qué versión;
- qué fuente;
- qué criterios;
- qué datos;
- qué resultado;
- qué faltó.

## Ejemplo ficticio

Protocolo requiere:
- edad 50–75;
- diagnóstico X;
- eGFR mayor a cierto valor.

Paciente:
- edad compatible;
- diagnóstico registrado;
- eGFR ausente.

Resultado:
**DUDOSO**

Motivo:
falta información para evaluar función renal.

## Escala

Protocolos AI no produce “decisiones automáticas” en masa.

Produce una primera clasificación para que el equipo pueda priorizar:

- casos compatibles;
- incompatibles;
- dudosos;
- incompletos.

## Reglas

Nunca afirmar:

- que CUMPLE garantiza inclusión;
- que DUDOSO significa “casi cumple”;
- que la IA siempre encuentra la última versión;
- que el sistema es infalible;
- que cumplir 8 de 10 criterios equivale a 80 % de elegibilidad.

## Preguntas frecuentes

### “¿Me dice quién entra al estudio?”

No. Ayuda a identificar candidatos potenciales y casos que requieren revisión.

### “¿Sirve si mis historias están incompletas?”

Sí. Puede identificar qué datos faltan.

### “¿Qué pasa si cambia el protocolo?”

Una nueva versión puede producir un resultado distinto. La trazabilidad permite entenderlo.

### “¿Dónde está el ahorro de tiempo si igual reviso?”

En priorizar. No todos los casos requieren el mismo nivel de revisión desde cero.

## Principio final

Protocolos AI automatiza trabajo previo repetitivo y conserva incertidumbre, explicación y trazabilidad. El profesional mantiene la decisión.
