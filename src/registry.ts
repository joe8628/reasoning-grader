import { readFileSync } from "fs"
import { join } from "path"
import type { TaskDefinition } from "./types.js"

const FILES = [
  "class-1-coherence", "class-2-premature", "class-3-misattribution",
  "class-4-deadend", "class-5-drift", "class-6-uncertainty",
  "class-7-decomposition", "general"
]

export class TaskRegistry {
  private tasks: TaskDefinition[]

  constructor(tasksDir: string) {
    this.tasks = FILES.flatMap(f => {
      const path = join(tasksDir, `${f}.jsonl`)
      try {
        return readFileSync(path, "utf8")
          .split("\n").filter(Boolean).map(l => JSON.parse(l) as TaskDefinition)
      } catch {
        return []
      }
    })
  }

  all() { return this.tasks }
  getById(id: string) { return this.tasks.find(t => t.id === id) }
  byClass(cls: number) { return this.tasks.filter(t => t.class === cls) }
}
