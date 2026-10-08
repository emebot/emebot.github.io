import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { QuizAnswer, QuizDefinition } from './types'
import './quiz.css'

type Phase = 'intro' | 'active' | 'result'

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * Navigation-light dot echoing the motif on the IALA lights page. Reimplemented
 * locally so this component does not depend on that page's markup or stylesheet.
 */
function QuizLight({ color, index }: { color: string; index: number }) {
  const size = 20
  return (
    <span
      aria-hidden="true"
      className={`inline-block rounded-full quiz-light quiz-light-${index % 3}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: `0 0 ${size * 1.2}px ${size * 0.6}px ${color}88`,
      }}
    />
  )
}

/**
 * Left accent bar used beside section titles in the Figma quiz frames.
 */
function TitleBar() {
  return (
    <span
      aria-hidden="true"
      className="h-7 w-1 shrink-0 rounded-full bg-amber-300"
    />
  )
}

export default function QuizRunner({
  quiz,
  relatedLink,
}: {
  quiz: QuizDefinition
  relatedLink?: ReactNode
}) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [index, setIndex] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)

  const questionHeadingRef = useRef<HTMLHeadingElement>(null)

  const total = quiz.questions.length
  const question = quiz.questions[index]
  const correctCount = answers.filter((answer) => answer.correct).length

  function start() {
    setPhase('active')
    setIndex(0)
    setSelectedOptionId(null)
    setRevealed(false)
    setShowValidation(false)
    setAnswers([])
    setStartedAt(Date.now())
    setElapsedMs(0)
  }

  function checkAnswer() {
    if (selectedOptionId === null) {
      setShowValidation(true)
      return
    }

    setRevealed(true)
    setAnswers((previous) => [
      ...previous,
      {
        questionId: question.id,
        selectedOptionId,
        correct: selectedOptionId === question.correctOptionId,
      },
    ])
  }

  function goToNext() {
    if (index + 1 >= total) {
      setElapsedMs(startedAt === null ? 0 : Date.now() - startedAt)
      setPhase('result')
      return
    }

    setIndex(index + 1)
    setSelectedOptionId(null)
    setRevealed(false)
    setShowValidation(false)
    // Move focus to the new question so keyboard and screen-reader users follow along.
    window.requestAnimationFrame(() => questionHeadingRef.current?.focus())
  }

  const heroClasses = 'relative overflow-hidden px-6 pb-16 pt-20 sm:pt-28'

  // --- Empty state -------------------------------------------------------
  if (total === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <section className={heroClasses}>
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
              {quiz.eyebrow}
            </p>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              {quiz.title}
            </h1>
          </div>
        </section>
        <section className="flex-1 border-t border-white/10 bg-navy-900 px-6 py-16">
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="font-serif text-xl font-semibold">
              Tietovisassa ei ole vielä kysymyksiä
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Kysymykset lisätään tähän osioon myöhemmin. Palaa hetken kuluttua
              uudelleen.
            </p>
            {relatedLink ? <div className="mt-6">{relatedLink}</div> : null}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className={heroClasses}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.12) 0%, transparent 45%), radial-gradient(circle at 80% 10%, rgba(245,158,11,0.10) 0%, transparent 40%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center gap-4">
            {quiz.accentLights.map((color, lightIndex) => (
              <QuizLight
                key={color + lightIndex}
                color={color}
                index={lightIndex}
              />
            ))}
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            {quiz.eyebrow}
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            {quiz.title}
          </h1>
          <p className="mt-6 text-lg text-slate-300">{quiz.description}</p>
        </div>
      </section>

      <section className="flex-1 border-t border-white/10 bg-navy-900 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          {/* --- Intro state --------------------------------------------- */}
          {phase === 'intro' ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <div className="flex items-center gap-3">
                <TitleBar />
                <h2 className="font-serif text-2xl font-semibold">
                  Ennen kuin aloitat
                </h2>
              </div>
              <dl className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-400">Kysymyksiä</dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold">
                    {total}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">Arvioitu kesto</dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold">
                    {Math.max(1, Math.round((total * 30) / 60))} min
                  </dd>
                </div>
              </dl>
              <p className="mt-6 text-sm leading-relaxed text-slate-300">
                Valitse jokaiseen kysymykseen yksi vaihtoehto ja tarkista
                vastauksesi. Saat perustelun heti, ja yhteenvedon näet lopuksi.
              </p>
              <button
                type="button"
                onClick={start}
                className="mt-8 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-navy-950 transition hover:bg-amber-200 quiz-focus"
              >
                Aloita tietovisa
              </button>
            </div>
          ) : null}

          {/* --- Active question state ----------------------------------- */}
          {phase === 'active' ? (
            <div>
              {/* Progress */}
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-300">
                  Kysymys {index + 1} / {total}
                </p>
                {answers.length > 0 ? (
                  <p className="text-sm text-slate-400">
                    Oikein {correctCount} / {answers.length}
                  </p>
                ) : null}
              </div>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={index + (revealed ? 1 : 0)}
                aria-label="Tietovisan edistyminen"
                className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10"
              >
                <div
                  className="h-full rounded-full bg-amber-300 transition-all duration-300"
                  style={{
                    width: `${((index + (revealed ? 1 : 0)) / total) * 100}%`,
                  }}
                />
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                <fieldset
                  role="radiogroup"
                  aria-labelledby={`question-${question.id}`}
                >
                  <legend className="w-full">
                    {question.hint ? (
                      <span className="mb-2 block font-mono text-xs uppercase tracking-wide text-amber-300">
                        {question.hint}
                      </span>
                    ) : null}
                    <h2
                      id={`question-${question.id}`}
                      ref={questionHeadingRef}
                      tabIndex={-1}
                      className="font-serif text-2xl font-semibold leading-snug quiz-question"
                    >
                      {question.prompt}
                    </h2>
                  </legend>

                  <div className="mt-6 space-y-3">
                    {question.options.map((option) => {
                      const isSelected = selectedOptionId === option.id
                      const isCorrect = option.id === question.correctOptionId

                      let stateClasses =
                        'border-white/10 bg-white/5 hover:border-amber-300/40 hover:bg-white/10'
                      let markClasses = isSelected
                        ? 'border-amber-300'
                        : 'border-white/30'
                      let dotClasses = 'bg-amber-300'

                      if (revealed && isCorrect) {
                        stateClasses = 'border-green-400/60 bg-green-400/10'
                        markClasses = 'border-green-400'
                        dotClasses = 'bg-green-400'
                      } else if (revealed && isSelected) {
                        stateClasses = 'border-red-400/60 bg-red-400/10'
                        markClasses = 'border-red-400'
                        dotClasses = 'bg-red-400'
                      } else if (revealed) {
                        stateClasses = 'border-white/10 bg-white/5 opacity-60'
                      } else if (isSelected) {
                        stateClasses = 'border-amber-300 bg-amber-300/10'
                      }

                      return (
                        <label
                          key={option.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition quiz-option ${stateClasses} ${
                            revealed ? 'cursor-default' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name={`quiz-${quiz.title}-${question.id}`}
                            value={option.id}
                            checked={isSelected}
                            disabled={revealed}
                            onChange={() => {
                              setSelectedOptionId(option.id)
                              setShowValidation(false)
                            }}
                            className="sr-only"
                          />
                          <span
                            aria-hidden="true"
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${markClasses}`}
                          >
                            {isSelected ? (
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${dotClasses}`}
                              />
                            ) : null}
                          </span>
                          <span className="text-sm leading-relaxed text-slate-100">
                            {option.label}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>

                {/* Validation */}
                {showValidation ? (
                  <p
                    role="alert"
                    className="mt-4 rounded-xl border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-sm text-amber-200"
                  >
                    Valitse ensin yksi vaihtoehto.
                  </p>
                ) : null}

                {/* Feedback */}
                <div aria-live="polite">
                  {revealed ? (
                    <div
                      className={`mt-4 rounded-xl border p-4 ${
                        selectedOptionId === question.correctOptionId
                          ? 'border-green-400/40 bg-green-400/10'
                          : 'border-red-400/40 bg-red-400/10'
                      }`}
                    >
                      <p className="text-sm font-semibold">
                        {selectedOptionId === question.correctOptionId
                          ? 'Oikein'
                          : 'Väärin'}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        {question.explanation}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {revealed ? (
                    <button
                      type="button"
                      onClick={goToNext}
                      className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-navy-950 transition hover:bg-amber-200 quiz-focus"
                    >
                      {index + 1 >= total
                        ? 'Näytä tulokset'
                        : 'Seuraava kysymys'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={checkAnswer}
                      className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-navy-950 transition hover:bg-amber-200 quiz-focus"
                    >
                      Tarkista vastaus
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* --- Result state -------------------------------------------- */}
          {phase === 'result' ? (
            <div>
              <div className="flex items-center gap-3">
                <TitleBar />
                <h2 className="font-serif text-2xl font-semibold">Tulokset</h2>
              </div>

              {/* Score card — mirrors the Figma "Quiz History" card anatomy. */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                <p className="font-serif text-xl font-semibold">{quiz.title}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {new Date().toLocaleDateString('fi-FI', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm text-slate-400">Käytetty aika</dt>
                    <dd className="mt-1 font-mono text-2xl font-semibold">
                      {formatDuration(elapsedMs)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-400">Pisteet</dt>
                    <dd className="mt-1 font-mono text-2xl font-semibold text-amber-300">
                      {correctCount}/{total}
                    </dd>
                  </div>
                </dl>
                <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-amber-300"
                    style={{ width: `${(correctCount / total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Per-question review */}
              <ol className="mt-6 space-y-3">
                {quiz.questions.map((item, itemIndex) => {
                  const answer = answers.find(
                    (entry) => entry.questionId === item.id,
                  )
                  const chosen = item.options.find(
                    (option) => option.id === answer?.selectedOptionId,
                  )
                  const correct = item.options.find(
                    (option) => option.id === item.correctOptionId,
                  )

                  return (
                    <li
                      key={item.id}
                      className={`rounded-2xl border p-5 ${
                        answer?.correct
                          ? 'border-green-400/30 bg-green-400/5'
                          : 'border-red-400/30 bg-red-400/5'
                      }`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Kysymys {itemIndex + 1}
                      </p>
                      <p className="mt-1 font-serif text-lg font-semibold leading-snug">
                        {item.prompt}
                      </p>
                      <p className="mt-3 text-sm text-slate-300">
                        <span className="text-slate-400">Vastauksesi: </span>
                        {chosen?.label ?? '—'}
                      </p>
                      {!answer?.correct ? (
                        <p className="mt-1 text-sm text-slate-300">
                          <span className="text-slate-400">
                            Oikea vastaus:{' '}
                          </span>
                          {correct?.label ?? '—'}
                        </p>
                      ) : null}
                    </li>
                  )
                })}
              </ol>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={start}
                  className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-navy-950 transition hover:bg-amber-200 quiz-focus"
                >
                  Yritä uudelleen
                </button>
                {relatedLink}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
