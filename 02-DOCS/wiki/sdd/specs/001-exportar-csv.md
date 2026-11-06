---
type: spec
title: Spec — Exportar movimientos a CSV
description: WHAT y WHY de exportar los movimientos a un archivo CSV abrible en Excel — problema, metas, comportamiento y criterios de aceptación.
tags: [sdd, spec]
timestamp: 2026-11-06T22:20:00Z
topic: sdd
slug: 001-exportar-csv
status: draft
---

# Spec — Exportar movimientos a CSV

> Slug: `001-exportar-csv` · Status: draft · Created: 2026-11-06
> Inherits: [constitution](../constitution.md) · Aprobada en autopilot (el dueño
> autorizó la corrida completa sin pausas por fase)

## Problem & why

Los movimientos registrados solo se ven dentro de la app: para llevarlos a
Excel (analizarlos, archivarlos, compartirlos con alguien) hay que copiarlos a
mano desde la tabla, fila por fila. Es lento y propenso a errores de tipeo, y
pierde el formato de columnas.

## Cost of not building it

Copiar a mano unos minutos cada vez, con riesgo de error; y para el piloto
especifico: sin esta feature no hay primer ciclo SDD que medir. El costo real
de negocio es bajo — es una feature de conveniencia para un usuario único
local — y así se registra: no se maquilla.

## The cheapest alternative

Copiar y pegar la tabla de la página en Excel, o guardar/imprimir la página.
No basta: el pegado pierde columnas limpias (montos con símbolo, fechas),
no es repetible y no deja un archivo archivable.

## Goals

- Descargar **todos** los movimientos en un solo archivo que Excel abra
  directamente, sin importar nada a mano.
- El archivo trae una fila de encabezados y una fila por movimiento, con las
  mismas columnas que muestra la app: fecha, tipo, monto, categoría y
  descripción.

## Non-goals / out of scope

- Filtrar la exportación por mes o periodo (deferido; hoy exporta todo).
- Otros formatos (XLSX, PDF) o exportar los resúmenes/saldo.
- Elegir columnas o renombrarlas.
- Programar exportaciones automáticas.

## Users & context

El dueño de las cuentas (usuario único de la app, uso local): quiere llevar
sus movimientos a Excel para revisarlos fuera de la app.

## Qué podrá hacer el usuario

Pulsar un botón **«Exportar CSV»** visible junto a la lista de movimientos.
No requiere condición previa más allá de que la app esté corriendo; no hay
permisos ni roles (app local de usuario único).

## Qué resultado obtiene

El navegador descarga un archivo `.csv` que:
- trae una primera fila de encabezados: fecha, tipo, monto, categoría,
  descripción;
- trae una fila por movimiento, en el mismo orden que ve en la tabla
  (más reciente primero);
- se abre en Excel mostrando cada campo en su columna, con acentos y «ñ»
  correctos y cada celda de descripción en una sola celda aunque contenga
  comas.

## Qué debe respetar

- La tabla de movimientos, el saldo y el resumen siguen funcionando igual
  (esta feature solo agrega, no toca lo existente).
- La UI sigue operable por teclado y en modo oscuro (constitución, principio 8).
- Los errores de la app siguen mostrándose al usuario; nada falla en silencio.
- Los datos no salen del equipo: la exportación la genera la app local.

## Cómo lo demuestra

- Tests automáticos que generan la exportación con movimientos conocidos y
  comprueban encabezado, una fila por movimiento, orden y entrecomillado.
- Verificación manual registrada: descargar desde el navegador y abrir en
  Excel, anotando el resultado en el documento de la feature.

## Behaviour

- **Main path**: el usuario pulsa «Exportar CSV» y el navegador descarga el
  archivo con todos los movimientos.
- **Edge cases**: sin movimientos → el archivo trae solo la fila de encabezados;
  descripción vacía → celda vacía; descripción con comas o comillas → celda
  entrecomillada que Excel muestra en una sola celda; montos con decimales →
  tal cual están registrados.
- **Error paths**: si la app falla al generar el archivo, la página muestra el
  error y no descarga nada; no se revela ningún detalle interno del servidor.

## Acceptance criteria

- Given movimientos registrados, When el usuario pulsa «Exportar CSV»,
  Then el navegador descarga un `.csv` con encabezado
  `fecha,tipo,monto,categoria,descripcion` y una fila por movimiento,
  ordenadas como la tabla (más reciente primero).
- Given cero movimientos, When el usuario exporta,
  Then el archivo contiene únicamente la fila de encabezados.
- Given una descripción que contiene comas o comillas dobles,
  Then esa celda va entrecomillada (y las comillas internas escapadas),
  de modo que Excel la muestra en una sola celda.
- Given categorías con acentos o «ñ», When el archivo se abre en Excel,
  Then los caracteres se ven correctos (UTF-8 con BOM).
- Given la app no puede generar el archivo, When el usuario pulsa exportar,
  Then la página muestra un error visible y no se descarga nada.

## Points to clarify

- **suposición tomada** — el archivo va en UTF-8 con BOM y separador coma.
  *Base:* Excel en Windows abre UTF-8 con BOM directamente; la coma es el
  estándar CSV. *Riesgo:* alguna configuración regional de Excel espere «;»;
  si apareciera, es un cambio menor (separador) en una versión futura.
- **suposición tomada** — el orden de las filas replica el de la tabla
  (fecha DESC, id DESC). *Base:* es lo que el usuario ve al exportar; así el
  archivo no sorprende. *Riesgo:* para análisis en Excel a veces se prefiere
  ascendente; reordenar en Excel es un clic.
- **decisión diferida** — exportación filtrada por mes/periodo: fuera de este
  ciclo a propósito (ver Non-goals).
- **área no formulable** — futura exportación de resúmenes (por categoría/mes):
  se sabe que vendrá, aún no está afilada.
