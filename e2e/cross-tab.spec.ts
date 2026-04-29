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
  test("a write from another tab is reflected via BroadcastChannel", async ({ context }) => {
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

    // Tab A writes new data directly to IndexedDB and broadcasts a "projects-updated" message.
    await tabA.evaluate(async () => {
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
      const req = indexedDB.open("keyval-store")
      const db: IDBDatabase = await new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      })
      const tx = db.transaction("keyval", "readwrite")
      tx.objectStore("keyval").put(renamed, "projects")
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
      db.close()
      const channel = new BroadcastChannel("projects-sync")
      channel.postMessage({ type: "projects-updated" })
      channel.close()
    })

    await expect(tabB.getByText("Renombrado desde A")).toBeVisible({ timeout: 3000 })

    expect(errorsA, errorsA.join("\n")).toHaveLength(0)
    expect(errorsB, errorsB.join("\n")).toHaveLength(0)
  })
})
