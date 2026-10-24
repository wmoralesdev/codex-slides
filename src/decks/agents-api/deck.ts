import { speakers } from "../../devday/speakers";
import { defineTalk } from "../kit/talk";
import {
  BriefSlide,
  InfrastructureSlide,
  ManualSlide,
  MapSlide,
  MemorySlide,
  MondaySlide,
  NewHireSlide,
  NotReadySlide,
  PeopleAndAgentsSlide,
  ProductsSlide,
  QuestionsSlide,
  ReviewerSlide,
  TestsSlide,
} from "./Slides";

/*
 * 20 minutes: 15 of talk (0:30 cover + 1:30 summary + 13:00 outline) and 5 of questions.
 * Speaker notes ship in the frontend: no vendor names, no clients, nothing internal.
 * The slug stays `agents-api` so links and the poll id keep working.
 */
const talk = defineTalk({
  slug: "agents-api",
  title: "¿Qué hace AI-native a una empresa?",
  description: "Usar IA no alcanza. Cómo opera una empresa con agentes: el contexto que leen, el brief que reciben, quién revisa su trabajo y cómo se guarda lo aprendido.",
  topic: "Codex · AGENTS.md",
  speaker: speakers.fernando,
  accent: "#0066ff",
  duration: "20 min",
  brief: {
    goal: "Entender qué hace AI-native a una empresa.",
    topics: [
      "Las cuatro capas: contexto, brief, revisión y memoria.",
      "Casos reales, buenos y malos.",
      "Cómo empezar el lunes.",
    ],
    demo: "Sin demo en vivo: artefactos reales (un AGENTS.md, un brief, una revisión) y productos construidos así.",
    takeaway: "Una tarea elegida y un ciclo para delegarla.",
    preparation: [
      "Abrí la encuesta en la portada; el resultado se comenta en la slide 06.",
      "Todo lo que se muestra es real o adaptado de un caso real; las capturas usan datos de prueba.",
      "Hablá de modelos independientes y de roles (autor, revisor), sin nombrar proveedores.",
      "Tiempo: 15 minutos de charla y 5 de preguntas.",
    ],
  },
  openingQuestion: {
    id: "agents-api-herramientas",
    prompt: "¿Dónde vive hoy el «cómo se hace» de tu trabajo?",
    type: "single",
    options: [
      { id: "ninguna", label: "En la cabeza de alguien" },
      { id: "pocas", label: "En chats y correos" },
      { id: "varias", label: "En documentos sueltos" },
      { id: "muchas", label: "En un manual al día" },
    ],
  },
  outline: [
    {
      slug: "pocas-personas",
      title: "Pocas personas. Muchos agentes.",
      kicker: "Borea Labs · 0:45",
      component: PeopleAndAgentsSlide,
      guide: {
        intro: "Borea Labs es una empresa chica: un fundador, algunos colaboradores y un equipo de agentes de IA que hacen buena parte del trabajo.",
      },
      speakerNotes: {
        script: "Presentá Borea en una frase: pocas personas y muchos agentes. La charla no es sobre una herramienta, es sobre cómo se organiza el trabajo para que eso funcione.",
        timing: "0:45",
      },
    },
    {
      slug: "infraestructura",
      title: "Usar IA no te hace AI-native. Tener infraestructura, sí.",
      kicker: "La idea · 0:45",
      component: InfrastructureSlide,
      guide: {
        intro: "Usar un chat de IA no cambia cómo opera una empresa. Lo que la cambia es tener cuatro capas: contexto, brief, revisión y memoria.",
        sections: [
          { title: "Contexto", body: "Qué sabe el agente antes de empezar." },
          { title: "Brief", body: "Qué tiene que hacer y cuándo está listo." },
          { title: "Revisión", body: "Cómo sabés que el resultado está bien." },
          { title: "Memoria", body: "Dónde queda lo que aprendiste." },
        ],
      },
      speakerNotes: {
        script: "Esta es la tesis y el mapa de la charla. Los modelos cambian cada pocos meses; la estructura es lo que queda. Recorremos las cuatro capas de abajo hacia arriba.",
        timing: "0:45",
      },
    },
    {
      slug: "empleado-nuevo",
      title: "Sin contexto, un agente empieza como un empleado nuevo.",
      kicker: "Contexto · 0:45",
      component: NewHireSlide,
      guide: {
        intro: "No des por hecho que el agente tiene el contexto de ayer. Sin él, cada tarea arranca sin saber quiénes son tus clientes, cómo trabajás ni qué ya salió mal.",
      },
      speakerNotes: {
        script: "Imaginá contratar a alguien nuevo cada mañana. Si todo lo importante está en tu cabeza, lo vas a repetir todos los días.",
        timing: "0:45",
      },
    },
    {
      slug: "agents-md",
      title: "AGENTS.md es el manual del empleado, para agentes.",
      kicker: "Contexto · 1:30",
      component: ManualSlide,
      guide: {
        intro: "AGENTS.md es un archivo de texto que vive en tu proyecto. Codex lo lee antes de empezar: quiénes somos, cómo trabajamos y qué reglas no se rompen.",
        takeaway: "Si una regla vale para cualquier persona nueva, va en el manual.",
      },
      speakerNotes: {
        script: "Comentá el resultado de la encuesta: dónde vive hoy el «cómo se hace». AGENTS.md es lo mismo que un manual del empleado, pero lo lee un agente. En Borea, cualquier agente que entra lee primero este archivo.",
        timing: "1:30",
        cues: ["Volver a la encuesta de la portada y leer el resultado."],
      },
    },
    {
      slug: "un-solo-lugar",
      title: "Todo el contexto vive en un solo lugar.",
      kicker: "Contexto · 1:00",
      component: MapSlide,
      guide: {
        intro: "Estrategia, clientes, procedimientos y decisiones viven en un mismo repositorio de texto, con historial. Las tareas, el código y las contraseñas viven en otro lado.",
      },
      speakerNotes: {
        script: "Un repositorio es una carpeta con historial: se sabe quién cambió qué y cuándo. Ahí está el mapa de la empresa. Lo que no va ahí también está decidido: las tareas en su herramienta, el código en proyectos separados y las contraseñas nunca.",
        timing: "1:00",
      },
    },
    {
      slug: "el-brief",
      title: "El trabajo ya no es hacer la tarea. Es escribir el brief.",
      kicker: "Brief · 1:30",
      component: BriefSlide,
      guide: {
        intro: "Un buen brief dice qué hay que lograr, qué no se toca, cuándo está listo, cómo se deshace y qué se entrega.",
        takeaway: "Delegá el problema, no la solución.",
      },
      speakerNotes: {
        script: "Este brief está adaptado de uno real. Lo importante es «listo cuando» y «cómo se deshace»: sin eso, el agente decide solo cuándo terminó. Aparte breve: cuando un brief trae la respuesta adentro, cuatro agentes distintos te devuelven la misma idea.",
        timing: "1:30",
      },
    },
    {
      slug: "terminado-no-es-listo",
      title: "Cuatro rondas de revisión lo aprobaron. Deshacerlo lo rompía.",
      kicker: "Revisión · 1:30",
      component: NotReadySlide,
      guide: {
        intro: "Un cambio tenía que poder deshacerse. Cuatro rondas de revisión lo aprobaron. Al deshacerlo, el programa dejaba de funcionar. Lo encontró un revisor que no había participado.",
      },
      speakerNotes: {
        script: "Contá la historia en tres pasos. Las revisiones anteriores compartían el enfoque del autor y no comprobaron la vuelta atrás. Una revisión desde afuera, que no había participado, lo encontró. «Terminado» lo dice el autor; «listo» lo dice alguien más.",
        timing: "1:30",
      },
    },
    {
      slug: "quien-escribe-no-aprueba",
      title: "Quien escribe no aprueba.",
      kicker: "Revisión · 1:00",
      component: ReviewerSlide,
      guide: {
        intro: "El agente que hace el trabajo no es el que lo aprueba. El revisor es otro modelo, en otra sesión, y solo puede leer: no puede cambiar lo que revisa.",
      },
      speakerNotes: {
        script: "La regla: el autor nunca ocupa el asiento del revisor. Usamos modelos independientes, en sesiones separadas y en modo solo lectura. Y cada hallazgo se verifica antes de corregirlo: los revisores también se equivocan.",
        timing: "1:00",
      },
    },
    {
      slug: "210-pruebas",
      title: "Pasaba las 210 pruebas. Igual se podía saltar la verificación en dos pasos.",
      kicker: "Revisión · 0:45",
      component: TestsSlide,
      guide: {
        intro: "Una corrección de seguridad pasaba las 210 pruebas automáticas. Una revisión con Codex encontró que todavía se podía saltar la verificación en dos pasos, una variante que las pruebas todavía no cubrían.",
        takeaway: "Pruebas en verde no significan listo.",
      },
      speakerNotes: {
        script: "Las pruebas solo revisan lo que alguien pensó en probar. El hueco estaba afuera. Se encontró en revisión y se cerró antes de dar la corrección por terminada.",
        timing: "0:45",
      },
    },
    {
      slug: "la-regla-queda-escrita",
      title: "Un error se corrige. La regla queda escrita.",
      kicker: "Memoria · 1:00",
      component: MemorySlide,
      guide: {
        intro: "Cuando un error puede repetirse, la corrección y su motivo quedan escritos donde el próximo agente los va a leer: en el manual.",
      },
      speakerNotes: {
        script: "Contalo en primera persona: un día se publicó un cambio sin preparar la base de datos y todas las páginas con sesión fallaron. Fue un error del proceso que yo coordinaba. Desde ese día es una línea del manual: primero se aplica el cambio en la base de datos, después se publica el código.",
        timing: "1:00",
      },
    },
    {
      slug: "construido-asi",
      title: "Construido así.",
      kicker: "Resultado · 1:15",
      component: ProductsSlide,
      guide: {
        intro: "Tres productos construidos con este ciclo: Autoshop, un sistema para talleres que llegó a demo guiada en un día; Lima, una plataforma de licencias en producción; y RoKa IS, un sistema de gestión de importaciones.",
      },
      speakerNotes: {
        script: "Mostrá los tres en una frase cada uno. Las capturas usan datos de prueba. La revisión encontró fallos importantes en cada uno; las correcciones y las reglas quedaron incorporadas al proceso.",
        timing: "1:15",
      },
    },
    {
      slug: "el-lunes",
      title: "El lunes: elegí una tarea y delegala.",
      kicker: "Para empezar · 1:15",
      component: MondaySlide,
      guide: {
        intro: "Elegí una tarea que repetís. Escribí el contexto, escribí el brief con cuándo está listo, delegala, revisá el resultado y anotá lo aprendido.",
        takeaway: "Ese es el ciclo.",
      },
      speakerNotes: {
        script: "Cerrá con algo que se pueda hacer el lunes. No hace falta saber programar para escribir un contexto y un brief. Ese ciclo es exactamente el que usamos en Borea.",
        timing: "1:15",
      },
    },
  ],
  closingComponent: QuestionsSlide,
});

/** defineTalk fixes questions at 3:00; this talk has 5. */
export const agentsApiDeck = {
  ...talk,
  slides: talk.slides.map((slide) =>
    slide.slug === "preguntas"
      ? {
          ...slide,
          kicker: "Preguntas · 5:00",
          guide: { ...slide.guide, takeaway: "Escaneá el código para escribirle a Fernando." },
          speakerNotes: { script: "Abrí preguntas. El QR lleva a borealabs.com. Cerrá agradeciendo y presentando a quien sigue.", timing: "5:00" },
        }
      : slide,
  ),
};
