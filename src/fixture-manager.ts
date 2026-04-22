import { mkdtempSync, cpSync, rmSync, existsSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import type { TaskDefinition } from "./types.js"

export class FixtureManager {
  constructor(private fixturesRoot: string) {}

  async setup(fixture: TaskDefinition["fixture"]): Promise<string | null> {
    if (fixture.type === "injected" || !fixture.source_dir) return null
    const src = join(this.fixturesRoot, fixture.source_dir)
    if (!existsSync(src)) throw new Error(`Fixture dir not found: ${src}`)
    const tmp = mkdtempSync(join(tmpdir(), "rg-"))
    cpSync(src, tmp, { recursive: true })
    return tmp
  }

  async teardown(tmpDir: string | null): Promise<void> {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
  }

  injectPaths(prompt: string, tmpDir: string | null): string {
    if (!tmpDir) return prompt
    return prompt.replace("[FIXTURE_PATH]", tmpDir)
  }
}
