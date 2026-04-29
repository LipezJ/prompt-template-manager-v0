import { test, expect } from "@playwright/test"
import type { Page } from "@playwright/test"

const SAMPLE_PROJECTS = [
  {
    id: "default",
    name: "Mi Primer Proyecto",
    promptSets: [
      {
        id: "set1",
        name: "smoke set",
        variables: [],
        prompts: [{ id: "prompt1", content: "hola" }],
        uiPreferences: { splitPosition: 50, variablesPanelVisible: true, cardView: false },
      },
    ],
  },
]

function captureFatalErrors(page: Page) {
  const errors: string[] = []
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`))
  return errors
}

test.describe("cross-tab sync", () => {
  test("a write in one tab is reflected in another tab via storage event", async ({ context }) => {
    await context.addInitScript((data) => {
      window.localStorage.setItem("projects", JSON.stringify(data))
    }, SAMPLE_PROJECTS)

    const tabA = await context.newPage()
    const tabB = await context.newPage()
    const errorsA = captureFatalErrors(tabA)
    const errorsB = captureFatalErrors(tabB)

    await tabA.goto("/")
    await tabB.goto("/")
    await Promise.all([tabA.waitForLoadState("networkidle"), tabB.waitForLoadState("networkidle")])

    // Both tabs see the seeded project name initially.
    await expect(tabA.getByText("Mi Primer Proyecto")).toBeVisible()
    await expect(tabB.getByText("Mi Primer Proyecto")).toBeVisible()

    // Tab A renames the project by writing directly to localStorage and emitting a storage event.
    // (Real-world: any mutation in A persists via saveProjects, which the browser broadcasts to B.)
    await tabA.evaluate(() => {
      const renamed = [
        {
          id: "default",
          name: "Renombrado desde A",
          promptSets: [
            {
              id: "set1",
              name: "smoke set",
              variables: [],
              prompts: [{ id: "prompt1", content: "hola" }],
              uiPreferences: { splitPosition: 50, variablesPanelVisible: true, cardView: false },
            },
          ],
        },
      ]
      window.localStorage.setItem("projects", JSON.stringify(renamed))
      // Browsers only fire storage events on OTHER tabs/windows automatically. Playwright's storage
      // event delivery between pages in the same context is not guaranteed, so dispatch explicitly
      // on the other tab below.
    })

    // Trigger the storage event on tab B as it would arrive in real browsers.
    await tabB.evaluate(() => {
      const newValue = window.localStorage.getItem("projects")
      window.dispatchEvent(
        new StorageEvent("storage", { key: "projects", newValue, oldValue: null, storageArea: window.localStorage }),
      )
    })

    await expect(tabB.getByText("Renombrado desde A")).toBeVisible({ timeout: 3000 })

    expect(errorsA, errorsA.join("\n")).toHaveLength(0)
    expect(errorsB, errorsB.join("\n")).toHaveLength(0)
  })
})
