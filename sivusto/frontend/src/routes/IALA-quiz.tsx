import { createFileRoute } from '@tanstack/react-router'
import { IALAQuizPage } from '../features/iala-quiz'

export const Route = createFileRoute('/IALA-quiz')({
  component: IALAQuizPage,
  head: () => ({ meta: [{ title: 'IALA-tietovisa – Majakka' }] }),
})
