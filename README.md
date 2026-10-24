# DevDay Slides · San Salvador

Las slides de **DevDay Exchange San Salvador** (sábado 24 de octubre de 2026, BINAES, organiza Ai Labs): la apertura del evento y seis charlas alrededor de lo que anunció OpenAI en DevDay 2026. Cada slide es un componente React; el público sigue una guía en su teléfono y responde encuestas en vivo.

Esta rama rehace la UI de Grok bot Slides con la identidad de DevDay: las caras del evento en lugar de los bots, Geist, lienzo blanco, OpenAI y Codex como referencia y Ai Labs como organizador. La lógica de sesiones, encuestas y Convex es la misma.

El frontend usa **React 19, TypeScript, TanStack Router y Vite**. Es una SPA. Convex conserva las sesiones y sincroniza a los participantes cuando está configurado; la biblioteca y las presentaciones funcionan también sin Convex.

## Empezar

Requisitos: Node.js 22.12 o posterior y npm.

```bash
npm install
npm run dev
```

Abrí la dirección que imprime Vite, normalmente `http://localhost:5173`. No hace falta un proyecto de Convex para explorar la biblioteca, presentar, abrir el QR o probar las preguntas.

Sin `VITE_CONVEX_URL` aparece **«No ha sido configurado Convex»**: el modo local guarda la sesión en el navegador y sincroniza pestañas del **mismo origen y perfil de navegador**. No conecta otros teléfonos. Para probar, usá **Abrir vista del público** desde el modal del QR.

## Qué incluye

| Deck | Slug | Speaker | Slides |
| --- | --- | --- | ---: |
| DevDay Exchange San Salvador (apertura) | `devday-exchange-san-salvador` | Ai Labs | 6 |
| De una idea a algo que funciona con Codex | `codex-en-la-nube` | Walter Morales | 10 |
| Notion × Codex: de tus notas al trabajo hecho | `notion-codex` | Daniela Huezo | 10 |
| De un video largo a un clip con Codex | `video-con-codex` | Rodrigo Garciaguirre | 10 |
| Dots: ayuda que le da seguimiento a tus pendientes | `dots` | Saul Calderon | 10 |
| ¿Qué hace AI-native a una empresa? | `agents-api` | Fernando Borea | 16 |
| Tema por definir | `decisions-api` | Frank Calderon | 4 |

Todos los decks empiezan con la misma portada de espera **00** (la multitud de caras del holding screen de DevDay, OpenAI DevDay Exchange, Codex y Ai Labs), sin encuesta y fuera del tiempo de charla.

La **apertura** está completa y sirve de ejemplo del sistema visual: bienvenida, los seis anuncios de DevDay en tarjetas, la agenda (leída de las charlas), cómo participar desde el teléfono y el cierre con `#DevDayCommunity`.

Las cinco charlas con tema definido están pensadas para público variado, sin experiencia técnica previa. Cada una dura 15 minutos: **01 portada** (0:30), **02 resumen del recorrido** (1:30), seis slides de contenido (10:00) y preguntas (3:00). La portada de espera 00 queda fuera del tiempo.

La **slide 02** explica el objetivo, los puntos a cubrir, la demo propuesta y lo que se lleva el público. Se genera desde `brief` en cada `deck.ts`; su guía móvil usa el mismo contenido. `brief.preparation` agrega instrucciones para preparar y ensayar la demo en las notas del presentador. Es el punto de partida para quien complete el deck.

Las slides de contenido siguen como borradores hasta que el speaker agregue su componente. **Frank queda pendiente**, sin tema ni demo asignados: su ruta `decisions-api` se conserva por compatibilidad, pero no confirma una charla sobre esa API. El antiguo deck `sol-o-astra` fue reemplazado por `video-con-codex`.

El [brief de las charlas](docs/charlas.md) reúne el orden, los enlaces a los resúmenes y las fuentes oficiales.

Para armar una charla, usá la skill [`devday-slides`](.agents/skills/devday-slides/SKILL.md) o seguí [cómo personalizar los decks](docs/customize.md).

## Presentar

La vista del moderador (`/deck/<slug>`) muestra la slide actual, miniaturas, navegación por teclado, notas y resultados en tiempo real. **Abrir proyección** abre `/screen/<deck>/<sessionId>` en otra ventana. Las slides se proyectan en tema claro (blanco DevDay) y el selector sol/luna cambia al tema oscuro del evento.

1. Abrí un deck y pulsá **Iniciar presentación**.
2. Pulsá **Abrir proyección**, llevá la ventana a la pantalla de la audiencia y activá pantalla completa.
3. Usá **Mostrar QR en proyección** para invitar al público. Con Convex y una dirección accesible, las personas entran desde sus teléfonos sin registro.
4. Abrí la encuesta de la portada. Los resultados se actualizan en el moderador, la proyección y los teléfonos.
5. Avanzá con miniaturas, botones o teclado (Espacio, flechas, Home/End). El público sigue al presentador y puede leer a su ritmo con **Volver al vivo**.
6. Pulsá **Finalizar** para cerrar la sesión.

Para compartir después del evento, usá **Ver slides** o `/slides/<deck>`, por ejemplo `/slides/notion-codex`: muestra las slides completas sin sesión, encuestas ni notas.

## Conectar Convex

Crea `.env.local` a partir de `.env.example` si todavía no existe. Después ejecuta en una terminal:

```bash
npm run convex:dev
```

Sigue las instrucciones de la CLI para crear o seleccionar tu proyecto. El comando sincroniza el esquema y las funciones de `convex/` con el deployment de desarrollo. Configura el frontend en `.env.local`:

```dotenv
VITE_CONVEX_URL=https://tu-deployment.convex.cloud
VITE_WORKSPACE_SLUG=grok-bot-slides
VITE_PUBLIC_URL=
```

Conserva las variables que añada la CLI y reinicia `npm run dev` después de cambiar el archivo. La URL debe ser la del deployment de Convex, sin rutas, parámetros ni fragmentos. Si dejas la URL vacía, vuelves al modo local; una URL configurada cuyo backend no responde produce un error de conexión en la sesión.

La versión inicial de la integración se comprobó contra un deployment remoto de Convex: creación de sesión, ingreso, votación, actualización de la sesión, resultados y navegación sincronizada. Se usaron entornos de navegador con almacenamiento separado, uno en `localhost` y otro en la dirección LAN. **No se ha probado en un teléfono físico.** El flujo de configuración sigue la [guía oficial de Convex para React y Vite](https://docs.convex.dev/quickstart/react).

### Variables del frontend

| Variable              | Uso                                                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_CONVEX_URL`     | URL del deployment compartido. Vacía activa el modo local.                                                                                                 |
| `VITE_WORKSPACE_SLUG` | Identificador de tu variante. Por defecto, `grok-bot-slides`; admite minúsculas, números y guiones, hasta 80 caracteres, empezando por letra o número.     |
| `VITE_PUBLIC_URL`     | Origen público del frontend para el QR, por ejemplo `https://slides.example.com`. Tiene prioridad sobre el origen actual y la detección LAN de desarrollo. |

Las variables `VITE_*` forman parte del frontend compilado. Después de cambiarlas en producción, vuelve a compilar y publicar. `VITE_PUBLIC_URL` solo cambia el destino del QR: no publica la aplicación ni conecta dispositivos por sí misma. Usa una dirección accesible para el público y servida con la misma configuración de Convex y workspace; `localhost` en un teléfono se refiere al propio teléfono.

En desarrollo, al abrir la aplicación desde `localhost` con Convex conectado, el QR usa automáticamente una dirección IPv4 LAN detectada en el equipo, si está disponible. Conecta el teléfono a la misma red Wi-Fi y mantén Vite en ejecución. Si la dirección detectada no es accesible, abre la aplicación con la dirección de red correcta de Vite o configura `VITE_PUBLIC_URL`. En modo local se mantiene el origen actual; en el build de producción no hay detección LAN y puedes fijar el dominio público con `VITE_PUBLIC_URL`.

## Sesiones y variantes

Cada presentación crea un ID de sesión nuevo y toma una copia de los metadatos, las guías y las preguntas del deck. El componente React permanece en el frontend. Después de editar contenido, inicia otra sesión para que la audiencia reciba la versión nueva.

La clave aleatoria del presentador se conserva en `localStorage` del navegador que inicia la sesión. El QR y las respuestas públicas de Convex no incluyen esa clave; las mutaciones de control la comprueban en el servidor. Copiar la URL del presentador a otro navegador no transfiere sus permisos. Borrar el almacenamiento o cambiar de origen pierde ese acceso; en esta versión no hay cuentas ni recuperación de sesiones. Cada participante guarda un token propio por sesión para conservar avatar y respuesta al recargar.

Configura **`GROK_PRESENTER_PASSWORD`** en las variables de entorno del **deployment de Convex** al que apunta `VITE_CONVEX_URL`. No lleva prefijo `VITE_` ni se configura en Vercel. Crear sesiones y cada acción del moderador (incluidas las encuestas de sesiones anteriores) validan esa contraseña en el servidor antes de acceder a la base. Si falta, está vacía o supera 1024 caracteres, esas acciones quedan bloqueadas. El diálogo la solicita al iniciar o retomar el control; solo se conserva en memoria hasta recargar o cerrar la página, nunca en enlaces ni almacenamiento del navegador. Cambiarla en Convex revoca la contraseña anterior en la siguiente acción. Las lecturas públicas, el ingreso y los votos de participantes no requieren esta contraseña.

Varias copias del frontend pueden usar el **mismo deployment de Convex** con distintos `VITE_WORKSPACE_SLUG` y la misma contraseña del deployment. El slug organiza las sesiones de cada variante y no es una contraseña. El modo local es una demostración: almacena todos sus datos en el navegador y no requiere la contraseña; la autoridad del servidor se aplica al usar Convex.

Consulta [cómo personalizar decks y compartir una variante](docs/customize.md) y [el modelo de Convex](convex/README.md).

## Comandos

| Comando                 | Resultado                                                                        |
| ----------------------- | -------------------------------------------------------------------------------- |
| `npm run dev`           | Servidor Vite accesible en la red local.                                         |
| `npm run typecheck`     | Comprobación TypeScript sin generar archivos.                                    |
| `npm test`              | Pruebas de Vitest.                                                               |
| `npm run test:sites`    | Pruebas del fallback SPA del worker de hosting.                                  |
| `npm run build`         | TypeScript, compilación Vite en `dist/client` y preparación del worker de Sites. |
| `npm run preview`       | Vista local del build; no publica la aplicación.                                 |
| `npm run convex:dev`    | Configura/sincroniza el backend de desarrollo.                                   |
| `npm run convex:deploy` | Despliega las funciones y el esquema al backend de producción seleccionado.      |

## Publicar

### Vercel

El archivo `vercel.json` configura Vite, la salida `dist/client` y las rutas `/slides/`, `/deck/`, `/present/`, `/screen/` y `/join/` para que los enlaces funcionen también al abrirlos directamente o recargar. Los assets inexistentes conservan una respuesta 404.

Configura en el proyecto de Vercel las variables `VITE_CONVEX_URL`, `VITE_WORKSPACE_SLUG` y `VITE_PUBLIC_URL` antes de compilar. Para este frontend, el dominio previsto es `https://slides.ailabs.sv`. `VITE_CONVEX_URL` debe apuntar al deployment que quieras utilizar; publicar el frontend no modifica ni despliega el backend de Convex.

```bash
vercel link --project grok-bot-slides
vercel --prod
```

Conecta el repositorio desde `vercel git connect` si quieres publicar automáticamente los siguientes cambios de `main`. Las variables locales y la vinculación de `.vercel/` se excluyen del repositorio.

### Backend y otros proveedores

Despliega el backend con `npm run convex:deploy`. Configura `VITE_CONVEX_URL` con su URL de **producción**, junto con el workspace y el origen público, antes de ejecutar `npm run build`.

El frontend estático está en `dist/client`. El hosting debe servir `index.html` para las rutas de la aplicación, como `/deck/notion-codex`, `/present/...`, `/screen/...` y `/join/...`, incluso al abrirlas directamente o recargar. Conserva los 404 para assets que no existen. La configuración incluida para Sites añade `dist/server/index.js` con ese fallback; otro hosting debe configurar una reescritura SPA equivalente. La aplicación espera publicarse en la raíz de su dominio.

También puedes compilar con la URL de producción inyectada por la CLI:

```bash
npm run convex:deploy -- --cmd 'npm run build'
```

Después publica el frontend generado en tu hosting. Desplegar Convex no publica la web. Este proceso está descrito en la [documentación oficial de hosting de Convex](https://docs.convex.dev/production/hosting/custom).

## Estructura y procedencia

- `src/decks/devday/`: apertura del evento.
- `src/decks/<charla>/deck.ts`: cada charla, armada con `defineTalk`; `src/decks/talks.ts` fija el orden de la agenda.
- `src/decks/kit/`: kit visual compartido (portadas, speaker, borrador, cierre, `SlideFrame`, `Cards`, `Steps`, `Crowd`).
- `src/devday/`: motor de caras, speakers, datos del evento y logos.
- `src/pages/` y `src/components/`: biblioteca, presentador, proyección y público.
- `src/live/` y `convex/`: contrato de sesión, reglas y transportes local/Convex (sin cambios respecto de Grok bot Slides).

El motor de caras (`src/devday/faces.ts` y `Face.tsx`) se copió del repositorio `devday` (`src/lib/faces.ts`, `src/components/Face.tsx`), que también provee la paleta, el wordmark de Codex y los logos de OpenAI y Ai Labs. Ver [public/brand/README.md](public/brand/README.md).
