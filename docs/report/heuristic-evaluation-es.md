# Evaluación Heurística — PosturePilot

> Evaluación basada en las **10 heurísticas de usabilidad de Nielsen** aplicada al prototipo PosturePilot.  
> Alcance: evaluación comparativa antes y después de las iteraciones de diseño e implementación.  
> Escala de puntuación: 0–10 por heurística.

---

## Introducción

PosturePilot es un asistente de conciencia postural basado en webcam, diseñado para trabajadores de escritorio, estudiantes e investigadores. Esta evaluación heurística analiza en qué medida la interfaz cumple cada uno de los principios de Nielsen, tanto en el estado inicial del prototipo como tras las mejoras implementadas en las fases de diseño iterativo.

---

## Tabla resumen

| # | Heurística | Estado antes | Puntuación antes | Estado después | Puntuación después | Mejora |
|---|-----------|-------------|-----------------|---------------|-------------------|--------|
| 1 | Visibilidad del estado del sistema | Parcial | 5 | Bueno | 8 | +3 |
| 2 | Correspondencia con el mundo real | Débil | 4 | Parcial | 7 | +3 |
| 3 | Control y libertad del usuario | Parcial | 6 | Bueno | 8 | +2 |
| 4 | Consistencia y estándares | Parcial | 5 | Parcial | 7 | +2 |
| 5 | Prevención de errores | Débil | 3 | Bueno | 8 | **+5** |
| 6 | Reconocimiento en lugar de recuerdo | Débil | 3 | Parcial | 7 | +4 |
| 7 | Flexibilidad y eficiencia de uso | Parcial | 6 | Bueno | 8 | +2 |
| 8 | Diseño estético y minimalista | Parcial | 6 | Parcial | 7 | +1 |
| 9 | Ayudar a reconocer, diagnosticar y recuperarse de errores | Débil | 4 | Parcial | 7 | +3 |
| 10 | Ayuda y documentación | Ausente | 2 | Bueno | 8 | **+6** |

**Puntuación media antes:** 4,4 / 10  
**Puntuación media después:** 7,5 / 10  
**Mejora media:** +3,1 puntos

---

## Análisis por heurística

### H1 — Visibilidad del estado del sistema (5 → 8)

**Evidencia:** `FeedbackBadge`, `SessionPanel`, `PostureReport`, estados de carga, indicador LIVE.

**Cambios implementados:**
- Spinner con mensaje de texto mientras se carga el modelo de pose.
- Indicador pulsante "LIVE" durante la sesión activa.
- Insignia de estado postural (Buena / Aviso / Mala) actualizada en cada fotograma analizado.
- Porcentaje de confianza mostrado en la cabecera del reporte postural.
- Barra de estadísticas de sesión con tiempo transcurrido y número de fotogramas.

---

### H2 — Correspondencia con el mundo real (4 → 7)

**Evidencia:** `gestureDictionary`, `PostureReport`, `UserGuide`, nombres de condiciones en inglés natural.

**Cambios implementados:**
- Las cinco condiciones posturales utilizan nombres en inglés natural y comprensible: *Upright posture*, *Uneven shoulders*, *Trunk lean*, *Head misalignment*, *Low body visibility*.
- Los textos de retroalimentación describen comportamientos corporales observables, sin términos técnicos.
- Cada condición incluye una instrucción correctiva directa ("What to do:").
- La guía de configuración usa medidas cotidianas (1,5–2 metros de distancia recomendada, iluminación frontal).

---

### H3 — Control y libertad del usuario (6 → 8)

**Evidencia:** controles de `PoseCamera`, botones Start/Stop/Reset, panel de detalles de postura.

**Cambios implementados:**
- Botones Start, Stop y Reset siempre accesibles durante la sesión.
- El panel de detalles posturales ("Show posture details") permite al usuario controlar la densidad de información.
- El Reset está disponible durante y después de la sesión.
- Los estados de error muestran un botón "Try again" con explicación del motivo.

---

### H4 — Consistencia y estándares (5 → 7)

**Evidencia:** propiedades CSS, `FeedbackBadge`, tarjetas de condición, barras de resumen.

**Cambios implementados:**
- Sistema de colores compartido (`--color-good`, `--color-warning`, `--color-bad`) aplicado de forma uniforme en el esqueleto, las insignias de estado, las tarjetas de condición y las barras de resumen.
- Los identificadores de condición son consistentes en `gestureDictionary`, `postureMath` y `PostureReport`.
- Los estados del ciclo de sesión (idle, running, paused, stopped) siguen una nomenclatura coherente en todo el código.

---

### H5 — Prevención de errores (3 → 8)

**Evidencia:** `UserGuide`, condición `low_visibility`, mensajes de error de cámara.

**Cambios implementados:**
- La `UserGuide` muestra 10 pasos de configuración antes de que el usuario inicie la sesión: distancia, iluminación, visibilidad corporal y controles.
- La baja visibilidad se trata como condición explícita: si la confianza cae por debajo del umbral, el esqueleto se desvanece y una tarjeta de condición indica cómo reposicionarse.
- Los errores de cámara distinguen: permiso denegado, cámara no encontrada y fallo genérico — cada uno con un mensaje de resolución específico.
- Los landmarks incompletos o ausentes se manejan con un mecanismo de seguridad que evita cierres inesperados.

---

### H6 — Reconocimiento en lugar de recuerdo (3 → 7)

**Evidencia:** tarjetas de gesto en `UserGuide`, tarjetas de condición con `userInstruction`.

**Cambios implementados:**
- Las cinco condiciones posturales están documentadas en la `UserGuide` con nombre, descripción e instrucción correctiva.
- Las tarjetas de condición activas muestran la instrucción "What to do:" directamente en el reporte.
- Las tarjetas de gesto incluyen una sección colapsable con los puntos corporales analizados y las reglas de detección.

---

### H7 — Flexibilidad y eficiencia de uso (6 → 8)

**Evidencia:** controles Start/Stop/Reset, alternancia de detalles, reanudación de sesión.

**Cambios implementados:**
- El modelo de pose se carga una sola vez; las sesiones siguientes no requieren recarga de página.
- Las métricas técnicas están ocultas por defecto y accesibles bajo demanda.
- Al cambiar de pestaña, la sesión se pausa y puede reanudarse sin perder los datos acumulados.

---

### H8 — Diseño estético y minimalista (6 → 7)

**Evidencia:** botón "Show posture details", IDs en monoespaciado, tarjetas colapsables.

**Cambios implementados:**
- Inclinación de hombros, ángulo de tronco y desplazamiento de cuello están ocultos tras un botón de detalles — la vista predeterminada muestra solo el estado, la confianza y las tarjetas de condición.
- Los IDs de condición aparecen en una etiqueta monoespacio pequeña, visualmente secundaria al nombre legible.
- Las tarjetas de gesto usan una sección colapsable para los detalles técnicos, manteniendo la interfaz limpia.

---

### H9 — Ayudar a reconocer, diagnosticar y recuperarse de errores (4 → 7)

**Evidencia:** tarjetas de condición con `feedback + userInstruction`, tarjeta `low_visibility`, mensajes de error.

**Cambios implementados:**
- Cada tarjeta de condición explica qué se detectó (feedback) y qué debe hacer el usuario para corregirlo (userInstruction).
- La condición de baja visibilidad incluye instrucción de recuperación específica: reposicionarse, mejorar la iluminación, asegurar que cabeza, hombros y caderas estén en cuadro.
- Los errores de cámara distinguen entre `NotAllowedError`, `NotFoundError` y fallos genéricos.

---

### H10 — Ayuda y documentación (2 → 8)

**Evidencia:** componente `UserGuide`, pasos de configuración, tarjetas de referencia de gestos.

**Cambios implementados:**
- La `UserGuide` en la pestaña Home presenta 10 pasos de configuración visibles antes de la primera sesión.
- La pestaña Home actúa como referencia de incorporación permanente a la que el usuario puede volver en cualquier momento.
- Las cinco condiciones posturales están documentadas con nombre, descripción, nivel de severidad e instrucción de recuperación.
- Los pasos de configuración incluyen la distancia recomendada (1,5–2 metros) y el significado de Start, Stop y Reset.

---

## Interpretación general

Las mejoras más significativas se produjeron en las heurísticas con mayor impacto directo en la experiencia del usuario no técnico:

- **H5 — Prevención de errores (+5 puntos):** La guía de onboarding y el manejo explícito de la baja visibilidad transformaron un sistema que antes podía frustrar al usuario en uno que anticipa y previene los problemas más comunes.
- **H10 — Documentación (+6 puntos):** El prototipo inicial carecía de cualquier guía integrada. Ahora dispone de una referencia completa de condiciones, pasos de configuración e instrucciones de uso.

Las heurísticas que permanecen en nivel "parcial" (H2, H4, H6, H8, H9) representan áreas con margen de mejora en futuras iteraciones, especialmente en lo relativo a la adaptación visual para diferentes contextos de uso y la personalización más profunda de la retroalimentación.
