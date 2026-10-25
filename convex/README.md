# Convex para Grok bot Slides

La UI funciona sin despliegue de Convex. En ese caso muestra **No ha sido configurado Convex** y guarda la sesión en el navegador; las pestañas del mismo origen se sincronizan con `BroadcastChannel` y `storage`. El modo local no conecta otros teléfonos ni otros navegadores. El QR permite probar el recorrido en otra pestaña, y habilita dispositivos distintos al configurar Convex y publicar la web.

## Conectar tu proyecto

1. Ejecuta `npm run convex:dev` y selecciona o crea el proyecto de Convex.
2. Copia la URL del deployment en `.env.local` como `VITE_CONVEX_URL=https://tu-proyecto.convex.cloud`.
3. Define `VITE_WORKSPACE_SLUG=grok-bot-slides` o el slug de tu variante (minúsculas, números y guiones, máximo 80 caracteres).
4. Reinicia `npm run dev`. Convex desplegará `schema.ts` y las funciones de `sessions.ts`.
5. Para producción ejecuta `npm run convex:deploy` y configura `VITE_CONVEX_URL` con la URL de producción al compilar el frontend. Cada copia del proyecto puede usar ese mismo deployment y su propio workspace slug.

Las funciones usan los imports oficiales de `convex/_generated/server` y `src/live/api.ts` reexporta las referencias de `convex/_generated/api`. Los archivos generados se incluyen en el repositorio: una copia nueva puede compilar y usar el modo local sin configurar variables de entorno. `convex dev` los mantiene actualizados al conectar un deployment.

## Modelo de sesión

- `sessions` conserva el manifiesto de slides, la slide activa, el estado de la pregunta, la visibilidad de resultados, `qrVisible` y `projectionTheme`. Estos dos últimos campos son opcionales y se leen con valores por defecto para conservar sesiones existentes. `questionOpenedAt` también es opcional: identifica cada apertura de encuesta para avisar al público incluso tras una reconexión, sin repetir avisos por nuevos votos o cambios de tema.
- Cada sesión tiene un ID aleatorio. El namespace separa las variantes que comparten el deployment.
- La clave de presentador es una capacidad aleatoria de 192 bits guardada aparte en el navegador creador. El enlace público y el QR nunca la contienen.
- Cada participante conserva un token de 192 bits por sesión en su navegador. Recibe un nombre de animal y un avatar estables. Refrescar la página conserva su identidad y respuesta.
- Las queries devuelven solamente campos públicos; nunca claves o tokens. Las mutaciones de presentación comprueban la clave. Los votos se asocian al participante mediante su token, nunca mediante un ID proporcionado por el votante.
- La proyección se suscribe con `publicOnly`: no lee ni envía las credenciales del navegador y no se registra como participante. Recibe automáticamente los resultados de la slide actual mientras llegan los votos.
- Las acciones de QR y tema usan la misma comprobación de autoridad del moderador que la navegación.
- Navegar cierra la pregunta y oculta el QR. Los resultados aparecen al abrir la encuesta, se conservan al cerrarla y vuelven a mostrarse al regresar a una pregunta con votos. Tanto los votos como los controles de pregunta/resultados incluyen la slide esperada para rechazar acciones tardías desde una pestaña atrasada. La respuesta propia siempre es visible para su autor. Los resultados de los demás solo se comparten para la slide actual; no requieren publicación manual.
- `poll` y `single` admiten una respuesta; `multiple` admite varias opciones sin duplicados. Cambiar la respuesta reemplaza el voto propio de esa slide. Terminar la sesión bloquea navegación, ingreso y votación.
- Una sesión admite hasta **500 participantes** y **150 slides**. El participante 501 recibe un mensaje explícito; quienes ya ingresaron pueden volver a entrar. Las queries leen la sala acotada, los resultados de la slide actual y los votos propios mediante índices; nunca recortan silenciosamente los resultados.

El evento terminó y ya no hay contraseña de presentador. `requireLiveSessions` rechaza con `EVENT_ENDED` todas las mutaciones (`authorizePresenter`, `create`, `update`, `join` y `vote`) salvo que el deployment tenga `LIVE_SESSIONS_OPEN=true`. La query `snapshot` sigue leyendo las sesiones existentes. `update` todavía exige la clave de propiedad de la sesión; el workspace slug organiza contenido y no es una credencial.

## Pruebas sin deployment

`npm test` verifica las reglas, los mensajes de error y los transportes. También ejecuta las funciones reales de `sessions.ts` contra el esquema y la base de datos simulada oficial de `convex-test` con el entorno `edge-runtime`. Incluye el cierre de las sesiones después del evento, sesiones anteriores, rechazo de capacidades ajenas, votos inválidos, comandos atrasados y capacidad máxima. Las pruebas no crean ni se conectan a un deployment.

Referencia oficial: [API del servidor de Convex](https://docs.convex.dev/api/modules/server) y [cliente React](https://docs.convex.dev/api/classes/react.ConvexReactClient).
