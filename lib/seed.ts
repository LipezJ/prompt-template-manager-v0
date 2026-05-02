import type { Project } from "@/types/prompt"

export function createDefaultProjects(): Project[] {
  return [
    {
      id: "default",
      name: "Mi Primer Proyecto",
      icon: "Sparkles",
      uiPreferences: {
        promptSetsSidebarVisible: false,
      },
      promptSets: [
        {
          id: "set1",
          name: "prompt set",
          variables: [
            { id: "name", name: "name", value: "Juan" },
            { id: "role", name: "role", value: "asistente" },
            { id: "task", name: "task", value: "crear un plan de marketing" },
          ],
          prompts: [
            { id: "prompt1", content: "Hello {name}\nYou are {role}\nplease help me with {task}" },
            { id: "prompt2", content: "Now, as a {role}, for the {task}" },
          ],
          uiPreferences: {
            splitPosition: 50,
            variablesPanelVisible: true,
            cardView: false,
          },
        },
        {
          id: "set2",
          name: "prompt set 2",
          variables: [
            { id: "name", name: "name", value: "María" },
            { id: "role", name: "role", value: "experto" },
          ],
          prompts: [
            { id: "prompt1", content: "Hola {name}, como {role}, ¿podrías ayudarme?" },
          ],
          uiPreferences: {
            splitPosition: 50,
            variablesPanelVisible: true,
            cardView: false,
          },
        },
      ],
    },
  ]
}

