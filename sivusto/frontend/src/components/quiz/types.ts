export interface QuizOption {
  id: string
  label: string
}

export interface QuizQuestion {
  id: string
  prompt: string
  /** Short context shown above the prompt, e.g. the light pattern being asked about. */
  hint?: string
  options: QuizOption[]
  correctOptionId: string
  explanation: string
}

export interface QuizDefinition {
  /** Small uppercase label above the title, matching the other pages' hero style. */
  eyebrow: string
  /** Hero light colours, echoing the dot motif on the IALA lights page. */
  accentLights: string[]
  title: string
  description: string
  questions: QuizQuestion[]
}

export interface QuizAnswer {
  questionId: string
  selectedOptionId: string
  correct: boolean
}
