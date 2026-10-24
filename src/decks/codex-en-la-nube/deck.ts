import { speakers } from "../../devday/speakers";
import { defineTalk } from "../kit/talk";
import { ContextoSlide, DotsSlide, PrimerProyectoSlide, ProbarSlide, QueCrearSlide, RepartirSlide } from "./Slides";

export const codexCloudDeck = defineTalk({
  "slug": "codex-en-la-nube",
  "title": "De una idea a algo que funciona con Codex",
  "description": "Cómo pedirle ayuda a Codex para crear algo útil, repartir el trabajo y revisar el resultado. No necesitás saber programar para seguir la charla.",
  "topic": "Crear con Codex",
  "speaker": speakers.walter,
  "accent": "#272725",
  "brief": {
    "goal": "Convertí una idea en algo que podés probar.",
    "topics": [
      "Qué hace Codex y qué necesita saber de tu idea.",
      "Cómo repartir investigación, creación y revisión.",
      "Cómo probar el resultado y pedir una mejora."
    ],
    "demo": "Sin demo en vivo: un ejemplo inventado (la página del Mercadito del Sábado) recorre toda la charla.",
    "takeaway": "Una forma de pedir trabajo: objetivo, contexto y cómo saber si quedó bien.",
    "preparation": [
      "Mostrar el encargo y el resultado antes de explicar las herramientas.",
      "Explicar agente como un asistente que puede usar herramientas; repositorio como la carpeta del proyecto; PR como una propuesta de cambio para revisar.",
      "Relacionar el ejemplo con Codex en la nube y revisión de cambios anunciados en DevDay. Distinguir ejecución local de cloud; no prometer que cerrar la laptop mantiene una tarea local activa.",
      "Mostrar la revisión humana con el ejemplo. El objetivo es comprender el recorrido, no aprender comandos."
    ]
  },
  "openingQuestion": {
    "id": "codex-cloud-donde",
    "prompt": "¿Qué te gustaría crear con ayuda de IA?",
    "type": "single",
    "options": [
      {
        "id": "local",
        "label": "Una página para mi proyecto"
      },
      {
        "id": "nube",
        "label": "Una herramienta para mi trabajo"
      },
      {
        "id": "ambos",
        "label": "Mejorar algo que ya existe"
      },
      {
        "id": "ninguno",
        "label": "Todavía estoy explorando"
      }
    ]
  },
  "outline": [
    {
      "slug": "de-la-terminal-a-la-nube",
      "title": "¿Qué podés crear con Codex?",
      "kicker": "Contexto · 1:00",
      "component": QueCrearSlide,
      "guide": {
        "intro": "Codex es un agente: un asistente que puede usar herramientas. Lee y escribe archivos, prueba lo que hizo y te entrega algo que podés abrir.",
        "sections": [
          { "title": "Una página", "body": "Para tu evento, tu negocio o tu portafolio." },
          { "title": "Una herramienta", "body": "Algo que te ahorra una tarea repetida, como un cotizador." },
          { "title": "Una mejora", "body": "A algo que ya existe: más claro, más rápido o sin un error." }
        ],
        "takeaway": "El resultado es algo que podés abrir y probar, no solo una respuesta en un chat."
      },
      "speakerNotes": {
        "script": "Empezá por los resultados, no por la herramienta. Las tres ventanas son ejemplos. Definí agente una sola vez: un asistente que puede usar herramientas.",
        "timing": "1:00",
        "cues": ["El cotizador y la página del Mercadito del Sábado son inventados para la charla."]
      }
    },
    {
      "slug": "entornos",
      "title": "Una idea necesita contexto",
      "kicker": "Práctica · 1:00",
      "component": ContextoSlide,
      "guide": {
        "intro": "«Haceme una página para un evento» deja a Codex adivinando. Contá para quién es, qué problema resuelve, cómo se vería un buen resultado y qué material tenés.",
        "sections": [
          { "title": "Para quién", "body": "Vecinos de la colonia que nunca vinieron al mercadito." },
          { "title": "Qué resuelve", "body": "Hoy la información está perdida en un chat." },
          { "title": "Cómo se ve bien", "body": "Se lee en el celular y la fecha se entiende en tres segundos." },
          { "title": "Material", "body": "Fotos del mes pasado y la lista de puestos." }
        ],
        "takeaway": "Un buen encargo es el que le darías a una persona que no conoce tu proyecto."
      },
      "speakerNotes": {
        "script": "Leé primero el pedido vago y preguntá al público qué le falta. Después mostrá el encargo con las cuatro partes.",
        "timing": "1:00"
      }
    },
    {
      "slug": "agents",
      "title": "Repartí el trabajo",
      "kicker": "Concepto · 1:30",
      "component": RepartirSlide,
      "guide": {
        "intro": "Podés encargar investigación, creación y revisión por separado. Las tareas que no dependen entre sí avanzan al mismo tiempo; alguien tiene que reunir y comprobar el resultado.",
        "sections": [
          { "title": "Investigar", "body": "Mirar páginas parecidas y anotar qué datos ponen primero." },
          { "title": "Crear", "body": "Armar la página con el encargo y las fotos." },
          { "title": "Revisar", "body": "Abrirla en un celular y anotar lo que no se entiende." }
        ],
        "takeaway": "Encargos chicos y claros; vos reunís y decidís."
      },
      "speakerNotes": {
        "script": "Cada cara es una tarea de Codex con su propio encargo. Remarcá que la persona sigue siendo quien reúne y decide.",
        "timing": "1:30"
      }
    },
    {
      "slug": "dots",
      "title": "Dots: delegá una responsabilidad",
      "kicker": "DevDay · 0:30",
      "component": DotsSlide,
      "guide": {
        "intro": "Una tarea termina cuando se entrega. Con Dots, presentado en DevDay, delegás una responsabilidad: un agente siempre activo la atiende, trabaja con Codex cuando hay que cambiar algo y te avisa.",
        "sections": [
          { "title": "Le encargás", "body": "Seguí las inscripciones de puestos del Mercadito. Si cambia algo, actualizá la página y avisame." },
          { "title": "Te avisa", "body": "Cuando llegan puestos nuevos o hay un cambio listo." },
          { "title": "Vos revisás", "body": "El cambio llega como una propuesta para revisar antes de aceptarla." }
        ],
        "takeaway": "Codex hace una tarea; Dots sigue una responsabilidad y te llama cuando hace falta."
      },
      "speakerNotes": {
        "script": "Solo como referencia, no como demo. Mismo ejemplo del Mercadito: en vez de una tarea, un encargo que sigue en el tiempo. Remarcá que el cambio igual pasa por tu revisión.",
        "timing": "0:30",
        "cues": [
          "Fuente: https://openai.com/index/devday-2026-recap/.",
          "No prometer planes ni disponibilidad: OpenAI dijo que ampliará el acceso.",
          "Los avisos de la slide son un ejemplo inventado."
        ]
      }
    },
    {
      "slug": "code-review",
      "title": "Probalo antes de darlo por terminado",
      "kicker": "Práctica · 1:30",
      "component": ProbarSlide,
      "guide": {
        "intro": "Abrí la página, probá los botones y compará el resultado con el encargo. Revisar lo que cambió ayuda a encontrar errores antes de compartirlo.",
        "sections": [
          { "title": "¿Se abre en el celular?", "body": "Ahí la va a ver casi todo el mundo." },
          { "title": "¿Los botones llevan a donde dicen?", "body": "Tocá cada uno." },
          { "title": "¿Cumple el encargo?", "body": "Volvé a leer «cómo se ve bien» y compará." },
          { "title": "¿Qué cambió?", "body": "Codex deja una propuesta de cambio (PR, pull request) para revisar antes de aceptarla." }
        ],
        "takeaway": "Codex también puede revisar un cambio; la decisión de aceptarlo sigue siendo tuya."
      },
      "speakerNotes": {
        "script": "Explicá PR como una propuesta de cambio para revisar. Mencioná que DevDay presentó la revisión de cambios con Codex, sin prometer detalles de disponibilidad.",
        "timing": "1:30",
        "cues": ["Fuente: https://openai.com/index/devday-2026-recap/ (revisión de cambios)."]
      }
    },
    {
      "slug": "codex-security",
      "title": "Elegí tu primer proyecto",
      "kicker": "Cierre · 2:00",
      "component": PrimerProyectoSlide,
      "guide": {
        "intro": "Elegí algo pequeño, que te sirva esta semana y que puedas comprobar vos. Escribí el encargo con objetivo, contexto y cómo saber si quedó bien.",
        "sections": [
          { "title": "Tu primer encargo", "body": "Quiero… para… Queda bien si…" },
          { "title": "En tu computadora", "body": "Trabaja en tus archivos mientras la sesión está abierta." },
          { "title": "En la nube", "body": "Trabaja en una copia del proyecto en servidores de OpenAI; volvés y revisás el resultado." }
        ],
        "takeaway": "Objetivo, contexto y cómo saber si quedó bien. Empezá por el entorno que puedas supervisar."
      },
      "speakerNotes": {
        "script": "Invitá a que cada persona piense su primer encargo con la plantilla. Distinguí local y nube con calma.",
        "timing": "2:00",
        "cues": ["No prometer que cerrar la laptop mantiene activa una tarea local: eso es lo que distingue a la nube."]
      }
    }
  ]
});
