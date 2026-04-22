export type GradeSignalType = "reasoning_answer_delta" | "tool_sequence" | "keyword_pattern"
export type FixtureType = "injected" | "real_files"
export type Severity = "low" | "medium" | "high"

export interface TaskDefinition {
  id: string
  class: number
  class_name: string
  title: string
  prompt: string
  oracle: string
  target_failure: string
  grade_signal: { type: GradeSignalType; look_for: string }
  fixture: { type: FixtureType; source_dir?: string; inject_paths_into_prompt?: boolean }
  token_budget: number
  mock_tools?: Array<{ name: string; always_returns: unknown }>
  multi_prompt?: { inject_after_tool_calls: number; second_prompt: string }
}

export interface TurnTrace {
  taskId: string
  turn: number
  thinkingBlocks: string[]
  toolCalls: { tool: string; argsHash: string; resultSummary: string }[]
  finalResponse: string
  tokensThinking: number
  tokensOutput: number
  timedOut?: boolean
}

export interface GradeResult {
  taskId: string
  targetClass: string
  passed: boolean
  scores: {
    coherence: number
    decomposition: number
    tool_grounding: number
    uncertainty_handling: number
    efficiency: number
  }
  errors: Array<{ type: string; severity: Severity; excerpt: string }>
  oracle_delta: string
  summary: string
}
