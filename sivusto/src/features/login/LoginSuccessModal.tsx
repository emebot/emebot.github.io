import { useEffect, useRef, useState } from 'react'

interface LoginSuccessModalProps {
  isOpen: boolean
  mode: 'sign-in' | 'sign-up'
  username: string
  onNavigateHome: () => void
}

const TOTAL_COUNTDOWN_SECONDS = 10

export default function LoginSuccessModal({
  isOpen,
  mode,
  username,
  onNavigateHome,
}: LoginSuccessModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_COUNTDOWN_SECONDS)
  const continueButtonRef = useRef<HTMLButtonElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)

  const isSignIn = mode === 'sign-in'

  // Reset countdown and manage focus / scroll lock when modal opens
  useEffect(() => {
    if (!isOpen) return

    setSecondsLeft(TOTAL_COUNTDOWN_SECONDS)

    // Save previous overflow style and lock scroll
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Auto-focus the primary action button
    const focusTimeout = setTimeout(() => {
      continueButtonRef.current?.focus()
    }, 50)

    // Handle Escape key
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onNavigateHome()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      clearTimeout(focusTimeout)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onNavigateHome])

  // Handle countdown timer
  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onNavigateHome()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, onNavigateHome])

  if (!isOpen) {
    return null
  }

  const progressPercentage = (secondsLeft / TOTAL_COUNTDOWN_SECONDS) * 100

  return (
    <div
      role="presentation"
      onClick={(e) => {
        // Light dismiss when clicking outside modal box
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onNavigateHome()
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md transition-opacity duration-300"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        aria-describedby="success-modal-description"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-[#1e2738] to-[#121927] p-6 text-center shadow-2xl shadow-black/80 sm:p-8"
      >
        {/* Soft background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl"
        />

        {/* Close button */}
        <button
          type="button"
          onClick={onNavigateHome}
          aria-label="Sulje ja siirry etusivulle"
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#1d90f4]"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>

        {/* Success Icon */}
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <div
            aria-hidden="true"
            className="absolute inset-0 animate-pulse rounded-full bg-emerald-500/25 blur-lg"
          />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/40 bg-gradient-to-b from-emerald-500/20 to-emerald-600/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2
          id="success-modal-title"
          className="font-sans text-2xl font-bold tracking-tight text-white sm:text-3xl"
        >
          {isSignIn ? 'Kirjautuminen onnistui!' : 'Käyttäjätili luotu!'}
        </h2>

        {/* Message */}
        <p
          id="success-modal-description"
          className="mt-3 text-base text-slate-300 sm:text-lg"
        >
          {isSignIn ? (
            <>
              Tervetuloa takaisin,{' '}
              <span className="font-semibold text-white">{username}</span>!
            </>
          ) : (
            <>
              Tervetuloa Majakkaan,{' '}
              <span className="font-semibold text-white">{username}</span>!
              Käyttäjätilisi on luotu ja olet kirjautunut sisään.
            </>
          )}
        </p>

        {/* Progress bar and countdown note */}
        <div className="mt-6 space-y-2">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full border border-white/10 bg-[#181b29]"
            role="progressbar"
            aria-valuenow={secondsLeft}
            aria-valuemin={0}
            aria-valuemax={TOTAL_COUNTDOWN_SECONDS}
            aria-label="Aika etusivulle siirtymiseen"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#1d90f4] to-emerald-400 transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">
            Siirrytään automaattisesti etusivulle ({secondsLeft} s)...
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="mt-6">
          <button
            ref={continueButtonRef}
            id="btn-continue-to-home"
            type="button"
            onClick={onNavigateHome}
            className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#1d90f4] px-6 text-lg font-semibold text-white shadow-lg shadow-[#1d90f4]/25 transition hover:bg-[#43a5f7] focus:outline-none focus:ring-2 focus:ring-[#8bc9ff] focus:ring-offset-2 focus:ring-offset-[#121927] active:scale-[0.98]"
          >
            <span>Jatka etusivulle</span>
            <svg
              className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
