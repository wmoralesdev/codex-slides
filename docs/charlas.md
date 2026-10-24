# Brief de las charlas · 23 de octubre de 2026

Público variado: estudiantes, profesionales, personas creativas y emprendedores. No asumir experiencia en programación. Explicar cada concepto con una tarea cotidiana y mostrar el resultado antes de entrar en herramientas.

## Orden y puntos de partida

| Orden | Speaker | Tema | Resumen (slide 02) | Archivo |
| --- | --- | --- | --- | --- |
| 1 | Walter Morales | De una idea a algo que funciona con Codex | [Ver resumen](http://127.0.0.1:5174/slides/codex-en-la-nube?slide=walter-morales) | `src/decks/codex-en-la-nube/deck.ts` |
| 2 | Daniela Huezo | Notion × Codex: de tus notas al trabajo hecho | [Ver resumen](http://127.0.0.1:5174/slides/notion-codex?slide=daniela-huezo) | `src/decks/notion-codex/deck.ts` |
| 3 | Rodrigo Garciaguirre | De un video largo a un clip con Codex | [Ver resumen](http://127.0.0.1:5174/slides/video-con-codex?slide=rodrigo-garciaguirre) | `src/decks/video-con-codex/deck.ts` |
| 4 | Saul Calderon | Dots: ayuda que le da seguimiento a tus pendientes | [Ver resumen](http://127.0.0.1:5174/slides/dots?slide=saul-calderon) | `src/decks/dots/deck.ts` |
| 5 | Fernando Borea | ¿Qué hace AI-native a una empresa? | [Ver resumen](http://127.0.0.1:5174/slides/agents-api?slide=fernando-borea) | `src/decks/agents-api/deck.ts` |
| 6 | Frank Calderon | Tema por definir | [Ver pendiente](http://127.0.0.1:5174/slides/decisions-api?slide=frank-calderon) | `src/decks/decisions-api/deck.ts` |

Los enlaces usan el servidor local de esta sesión (puerto 5174); adaptar el origen al entorno de cada persona. Las caras pertenecen a cada speaker y acompañan su nueva asignación.

## Cómo completar un deck

1. Leer el objeto `brief` del archivo y abrir la slide 02. Ahí están objetivo, temas, demo y resultado esperado.
2. Revisar `brief.preparation`, visible también en las notas del presentador: material previo, límites y respaldo para la demo.
3. Completar los seis componentes de `outline`, manteniendo sus guías alineadas con la explicación. Explicar agente como un asistente con herramientas, API como una conexión entre programas y MCP como un puente entre herramientas.
4. Respetar 0:30 de portada + 1:30 de resumen + 10:00 de recorrido + 3:00 de preguntas. Frank define su contenido y tiempos cuando confirme el tema.
5. Ensayar el recorrido y guardar un resultado de respaldo. Las demos son propuestas: no se afirma que estén implementadas o probadas.

La slide 00 es la espera; 01 es la portada; **02 es el resumen**, que reemplaza la antigua presentación personal. El speaker se presenta brevemente ahí. Las notas para preparar la demo quedan separadas de la guía pública.

## Anuncios y fuentes oficiales

Fuentes consultadas el 23 de octubre de 2026:

- [Resumen oficial de DevDay 2026](https://openai.com/index/devday-2026-recap/): Codex en la nube, revisión de cambios, Dots, Agents API con uso de computadora, plugins, eventos MCP, Space y Pages.
- [Dots](https://openai.com/index/introducing-dots/): responsabilidades y seguimiento continuo. Comprobar acceso antes de preparar la demo.
- [Agents API](https://developers.openai.com/api/docs/guides/agents-api/overview): agentes con herramientas y entornos administrados. Explicar su utilidad antes de la configuración.
- [Eventos MCP](https://developers.openai.com/plugins/build/mcp-events): conectar cambios de otras herramientas con automatizaciones.
- [Decisions API](https://developers.openai.com/api/docs/guides/decisions): la documentación consultada la presenta en beta pública. Aparece en el resumen de anuncios, pero **no es un tema asignado a Frank**.

La conexión Notion–Codex mediante MCP y Sign in with ChatGPT son mecanismos distintos. La demo propuesta usa una conexión con permisos comprobados; no presupone consumo de una suscripción en Notion.

La edición de video es una aplicación propuesta de Codex con herramientas configuradas, por ejemplo FFmpeg. No se presenta como un editor nativo anunciado en DevDay ni como una demo ya validada. Rodrigo debe ensayar cortes, subtítulos, audio y exportación con su material.
