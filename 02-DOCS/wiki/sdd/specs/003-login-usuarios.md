---
type: spec
title: Spec — Login de usuarios
description: WHAT y WHY del sistema de login multi-usuario para la app de cuentas personales — registro abierto, aislamiento de datos por cuenta, cierre de sesión.
tags: [sdd, spec]
timestamp: 2026-11-17T14:44:54Z
topic: sdd
slug: 003-login-usuarios
branch: feature/003-login-usuarios
status: approved
---

# Spec — Login de usuarios

> Slug: `003-login-usuarios` · Status: approved (paso a paso, 2026-11-17) · Created: 2026-11-17
> Inherits: [constitution](../constitution.md) **v1.1.0** (enmendada 2026-11-17)
> Prompt inicial del dueño: «Quiero implementar el sistema de login para el
> proyecto de cuentas personales, primero genera una spec en un spec.md»
> Decisión de rumbo previa: la constitución se enmendó a v1.1.0 antes de
> escribir esta spec (stack Supabase, privacidad en nube con RLS, main
> re-cerrada, auth always-human).

## Problem & why

La app de cuentas personales es abierta: quien llega al servidor ve y edita
todas las finanzas que haya registradas. Para un piloto local de una persona
sirvió; para usarla con datos reales — o que la use más de alguien — no. Un
sistema de login con cuentas individuales la convierte en una app utilizable
por varias personas sin que cada una vea las finanzas de la otra, y ejercita
en el piloto una pieza que todo sistema real tiene: autenticación y
aislamiento de datos.

## Cost of not building it

La app queda como juguete local: no se puede desplegar ni compartir sin exponer
las finanzas personales de quien la use, y el piloto no ejercita
autenticación ni aislamiento — piezas centrales al escalar el método SDD a
proyectos reales.

## The cheapest alternative

Una única contraseña compartida que proteja la app entera. Resuelve «que no
entre cualquiera» con una fracción del costo, pero sin cuentas ni
aislamiento: todos los que entran ven los mismos datos. Suficiente solo si la
app tiene exactamente un usuario — y el dueño decidió multi-usuario real
(ronda de frontera, 2026-11-17).

## Goals

- Un visitante puede crear una cuenta propia e identificarse con ella.
- El login resiste fuerza bruta: tras varios intentos fallidos, el acceso
  se bloquea temporalmente.
- Cada usuario ve, registra, elimina y exporta **solo sus** movimientos; el
  saldo y el resumen se calculan solo sobre los suyos.
- Sin identificación, la app no expone ningún dato.
- Un usuario autenticado puede cerrar su sesión.
- Un usuario que olvida su contraseña puede recuperarla por email.

## Non-goals / out of scope

- Cambio de contraseña estando autenticado (perfil logueado).
- Login social (Google, Apple, etc.).
- Verificación de email al registrarse.
- Rate limiting general de la API (endpoints fuera del login).
- Compartir datos entre cuentas (finanzas compartidas).
- Roles o administrador.
- «Recordar dispositivo» configurable o expiración de sesión configurable.

## Users & context

El dueño (P1er0uni) y cualquier persona que quiera llevar sus cuentas
personales en la app. Navegador, la app desplegada (hoy localhost). Ninguna
cuenta existe todavía; la tabla `movimientos` tiene 1 fila sin dueño.

## What the user can do

- Un visitante sin cuenta puede registrarse con email y contraseña
  (registro abierto: cualquiera puede crear la suya).
- Un usuario con cuenta puede iniciar sesión con sus credenciales.
- Un usuario autenticado puede usar todo lo que ya existe — registrar, listar,
  eliminar movimientos, saldo, resumen, CSV — pero solo sobre sus datos.
- Un usuario autenticado puede cerrar sesión.
- Nadie puede ver ni tocar los datos de una cuenta que no es la suya.

## What result they get

- Tras registrarse: sesión iniciada y la app principal, vacía — salvo el
  movimiento preexistente si es la primera cuenta del sistema (heredado).
- Tras iniciar sesión: la app principal con sus datos.
- Sin sesión: la pantalla de acceso; los endpoints de datos responden «no
  autenticado» (401) en la forma de error JSON del proyecto, sin ningún dato.
- Tras cerrar sesión: pantalla de acceso; sus datos dejan de ser accesibles
  desde ese navegador.
- Referencia: los criterios de aceptación son la referencia mecánica (respuestas
  esperadas de la API); la pantalla de acceso/registro la aprueba el dueño al
  verla servida en la verificación del ciclo.

## What it must respect

- Constitución v1.1.0: P2 (`npm test` en verde con tests nuevos como merge
  bar), P3 (errores JSON `{"errores": [...]}` / `{"error": "..."}`), P7 (RLS
  activado en toda tabla con datos personales; service key solo en el
  servidor; nada de datos personales en el repo), P8 (UI operable por
  teclado, labels visibles, modo oscuro, sin dependencias de build), P11
  (documento de feature con métricas por paso).
- Auth es camino **always-human** (REVIEW.md, enmienda v1.1.0): el ship de
  esta feature espera al dueño.
- RLS ya está activado en `movimientos` (sin políticas): el aislamiento debe
  ser real en la base, no solo un filtro en el servidor.
- La API existente conserva sus formas de respuesta para usuarios
  autenticados.
- El movimiento preexistente no se pierde (decisión del dueño: la primera
  cuenta lo hereda).
- El servidor sigue siendo el único cliente de la base.

## How it proves it

Cada criterio de aceptación tiene un test Vitest que lo demuestra; `npm test`
en verde con los tests nuevos es la evidencia del ciclo. La verificación
cierra con una pasada en vivo — registro, login, aislamiento entre dos
cuentas, logout — contra la app corriendo, documentada en el documento de la
feature con su evidencia.

## Behaviour

- Main: visitante registra cuenta → sesión iniciada → usa la app; sus
  movimientos quedan asociados a su cuenta y solo él los ve.
- Edge: la primera cuenta creada hereda el movimiento preexistente; un
  usuario autenticado que visita la pantalla de acceso es llevado a la app.
- Error: credenciales incorrectas → rechazo con mensaje genérico que no
  revela si el email existe; email ya registrado → error claro que lo dice;
  petición de datos sin sesión → 401 sin exponer ningún dato.
- Bloqueo: tras varios intentos fallidos de login, el acceso se rechaza
  temporalmente aunque las credenciales sean correctas, con un mensaje que
  indica el bloqueo y su duración.
- Recuperación: un usuario pide recuperar su contraseña → recibe un email con
  un enlace → definiendo una nueva contraseña por ese enlace puede iniciar
  sesión con ella; la vieja deja de valer y las sesiones activas de esa cuenta
  quedan cerradas.

## Acceptance criteria

- Given un visitante sin cuenta, When se registra con email y contraseña
  válidos, Then queda con sesión iniciada y ve la app principal.
- Given la primera cuenta que se crea en el sistema, When se registra, Then
  el movimiento preexistente pasa a ser suyo y aparece en su lista.
- Given un usuario autenticado, When registra un movimiento, Then el
  movimiento queda asociado a su cuenta.
- Given dos usuarios autenticados con datos propios, When uno lista
  movimientos, Then no ve ningún movimiento del otro.
- Given un usuario autenticado, When consulta saldo, resumen o CSV, Then los
  números y el archivo reflejan solo sus movimientos.
- Given una petición a un endpoint de datos sin sesión, When llega, Then
  responde 401 con el error en la forma JSON del proyecto y sin ningún dato.
- Given credenciales incorrectas, When se intenta iniciar sesión, Then se
  rechaza con un mensaje genérico sin revelar si el email existe.
- Given un email ya registrado, When se intenta registrar de nuevo, Then el
  registro se rechaza con un error que lo indica.
- Given un usuario autenticado, When cierra sesión, Then vuelve a la pantalla
  de acceso y las peticiones siguientes responden 401.
- Given varios intentos fallidos de login para un email, When se reintenta
  dentro de la ventana de bloqueo, Then el login se rechaza aunque las
  credenciales sean correctas, con un mensaje que indica el bloqueo temporal.
- Given un usuario con cuenta, When pide recuperar su contraseña y define una
  nueva por el enlace recibido, Then puede iniciar sesión con la nueva, la
  vieja deja de valer y las sesiones activas quedan cerradas.
- Given un email no registrado, When se pide la recuperación, Then la
  respuesta no revela si la cuenta existe.

## Points to clarify

- **suposición tomada (validada por el dueño, 2026-11-17)** — la sesión
  persiste entre visitas del navegador hasta cerrar sesión, sin expiración
  corta.
- **suposición tomada (decisión del dueño, 2026-11-17)** — contraseña con
  longitud mínima de 8, sin requisitos de complejidad.
- **suposición tomada (decisión del dueño, 2026-11-17)** — bloqueo tras 5
  intentos fallidos, 15 minutos, contados por email.
- **suposición tomada (decisión del dueño, 2026-11-17)** — la recuperación de
  contraseña **entra al alcance** (antes non-goal); el cambio de contraseña
  estando autenticado queda fuera.
- **suposición tomada** — el enlace de recuperación caduca a la hora
  (default de Supabase) y el email sale por el SMTP incluido de Supabase.
  *Base:* defaults del proveedor; el piloto no configura SMTP propio.
  *Riesgo:* si se exige email con dominio propio, hay trabajo extra fuera de
  alcance.
- **suposición tomada** — tras recuperar la contraseña, las sesiones activas
  de esa cuenta quedan cerradas. *Base:* práctica estándar de seguridad;
  barato con el session store propio.
- **área no formulable** — compartir datos entre cuentas (p. ej. finanzas de
  pareja); sospecho que habrá una pregunta ahí y todavía no sé enunciarla.

## Revisions

- 2026-11-17 — El dueño revisa el draft y mueve el **bloqueo por intentos
  fallidos** de decisión diferida al alcance (Goals, Behaviour y un criterio
  de aceptación nuevos): sin él, un atacante puede probar fuerza bruta contra
  el login. Quedan como pregunta abierta los parámetros (intentos y duración).
- 2026-11-17 — Ronda de clarify (dueño): contraseña mínima 8; bloqueo 5
  intentos → 15 min por email; sesión persistente confirmada; **recuperación
  de contraseña entra al alcance** (antes non-goal) — Goals, Behaviour y dos
  criterios nuevos. Sin preguntas abiertas restantes.
