import type { GradeResult, TaskDefinition } from "./types.js"

const REMEDIATION: Record<number, { artifact: string; proposal: string }> = {
  1: {
    artifact: "AGENTS.md rule",
    proposal: "Before finalizing any answer, restate the conclusion your reasoning reached and confirm the answer matches it. If they diverge, resolve the conflict explicitly before responding."
  },
  2: {
    artifact: "AGENTS.md rule + post-tool hook",
    proposal: "Do not choose an implementation approach until all relevant files have been read. If a file could affect your decision and you have not read it yet, read it first."
  },
  3: {
    artifact: "tool_call_auditor hook",
    proposal: "Hook on tool.execute.after builds a call manifest per turn. Before finalizing reasoning, cross-check factual claims against the manifest. Claims referencing uncalled tools are surfaced as system-reminder injections."
  },
  4: {
    artifact: "loop-detection hook",
    proposal: "Hook on tool.execute.after tracks (tool, args_hash) pairs per session. If the same pair appears 3+ times without measurable state change, inject: \"You have attempted this approach N times without progress. Stop and try a different strategy.\""
  },
  5: {
    artifact: "AGENTS.md rule + permission hook",
    proposal: "Only modify files explicitly mentioned in the task or directly required by it. If you identify out-of-scope issues, list them separately but do not fix them."
  },
  6: {
    artifact: "AGENTS.md rule",
    proposal: "When your reasoning contains conditional logic (\"this depends on...\", \"if the version is...\"), your answer must reflect that uncertainty explicitly. Never present a context-dependent answer as unconditional."
  },
  7: {
    artifact: "AGENTS.md rule + scope_definer tool",
    proposal: "For any task touching more than 2 files or involving more than one concern, produce a written step-by-step plan before executing. Do not begin editing until the plan is complete."
  },
}

export function buildReport(
  results: GradeResult[],
  tasks: TaskDefinition[],
  taskModel: { providerID: string; modelID: string },
  graderModel: { providerID: string; modelID: string },
) {
  const jsonl = results.map(r => JSON.stringify(r)).join("\n")

  const byClass = new Map<number, GradeResult[]>()
  for (const r of results) {
    const t = tasks.find(t => t.id === r.taskId)
    const cls = t?.class ?? 0
    byClass.set(cls, [...(byClass.get(cls) ?? []), r])
  }

  const lines: string[] = [
    "# Reasoning Grader Report\n",
    `**Run date:** ${new Date().toISOString()}`,
    `**Model under test:** ${taskModel.providerID} / ${taskModel.modelID}`,
    `**Grading model:** ${graderModel.providerID} / ${graderModel.modelID}`,
    `**Total tasks:** ${results.length}  **Passed:** ${results.filter(r => r.passed).length}\n`,
    "## Results by Class\n",
    "| Class | Tasks | Pass Rate | Mean Coherence |",
    "|---|---|---|---|"
  ]

  byClass.forEach((rs, cls) => {
    const pass = rs.filter(r => r.passed).length
    const coh = (rs.reduce((s, r) => s + r.scores.coherence, 0) / rs.length).toFixed(1)
    lines.push(`| ${cls === 0 ? "General" : `Class ${cls}`} | ${rs.length} | ${pass}/${rs.length} | ${coh} |`)
  })

  const failed = results.filter(r => !r.passed)

  lines.push("\n## Failed Tasks\n")

  if (failed.length === 0) {
    lines.push("All tasks passed.")
  } else {
    for (const r of failed) {
      const task = tasks.find(t => t.id === r.taskId)
      const cls = task?.class ?? 0
      const rem = REMEDIATION[cls]

      lines.push(`### ${r.taskId} — ${task?.title ?? r.targetClass}\n`)
      lines.push(`**Failure summary:** ${r.summary}`)
      lines.push(`**Oracle delta:** ${r.oracle_delta}\n`)

      if (r.errors.length > 0) {
        lines.push("**Observed errors:**")
        r.errors.forEach(e => lines.push(`- \`${e.severity}\` (${e.type}): "${e.excerpt}"`))
        lines.push("")
      }

      if (rem) {
        lines.push(`**Recommendation — ${rem.artifact}:**`)
        lines.push(`> ${rem.proposal}`)
        lines.push("")
      }
    }
  }

  return { jsonl, markdown: lines.join("\n") }
}
