import "@testing-library/jest-dom/vitest"
import "fake-indexeddb/auto"
import { clear as idbClear } from "idb-keyval"
import { afterEach, beforeEach } from "vitest"
import { cleanup } from "@testing-library/react"

beforeEach(async () => {
  window.localStorage.clear()
  await idbClear()
})

afterEach(() => {
  cleanup()
})
