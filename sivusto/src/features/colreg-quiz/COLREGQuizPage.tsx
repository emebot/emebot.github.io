import { Link } from '@tanstack/react-router'
import QuizRunner from '../../components/quiz/QuizRunner'
import { colregQuiz } from './questions'

export default function COLREGQuizPage() {
  return (
    <QuizRunner
      quiz={colregQuiz}
      relatedLink={
        <Link
          to="/IALA-quiz"
          className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
        >
          Kokeile IALA-tietovisaa
        </Link>
      }
    />
  )
}
