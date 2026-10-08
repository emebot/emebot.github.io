import { createFileRoute } from '@tanstack/react-router'
import { COLREGQuizPage } from '../features/colreg-quiz'

export const Route = createFileRoute('/COLREG-quiz')({
  component: COLREGQuizPage,
  head: () => ({ meta: [{ title: 'COLREG-tietovisa – Majakka' }] }),
})
