import { useCallback, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { createUser, login } from '../../client'
import { setAccessToken } from '../../api/config'
import LoginSuccessModal from './LoginSuccessModal'

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="m3 3 18 18M10.6 6.2A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a17.8 17.8 0 0 1-3.1 3.9M6.2 6.8C3.7 8.4 2.5 12 2.5 12s3.5 6 9.5 6c1 0 1.9-.2 2.7-.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export default function LoginPage() {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [username, setUsername] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successState, setSuccessState] = useState<{
    isOpen: boolean
    mode: 'sign-in' | 'sign-up'
    username: string
  } | null>(null)

  const navigate = useNavigate()
  const hasNavigatedRef = useRef(false)

  const handleNavigateHome = useCallback(async () => {
    if (hasNavigatedRef.current) return
    hasNavigatedRef.current = true
    await navigate({ to: '/' })
  }, [navigate])

  const isSignIn = mode === 'sign-in'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isSignIn && password !== confirmPassword) {
      setPasswordError(true)
      setSubmitted(false)
      return
    }

    setPasswordError(false)
    setErrorMessage('')
    setSubmitted(false)
    setIsSubmitting(true)

    try {
      if (!isSignIn) {
        await createUser({
          body: { username, password },
          throwOnError: true,
        })
      }

      const response = await login({
        body: { username, password },
        throwOnError: true,
      })

      setAccessToken(response.data.access_token)
      setSuccessState({
        isOpen: true,
        mode,
        username,
      })
    } catch (error) {
      const detail =
        error &&
        typeof error === 'object' &&
        'detail' in error &&
        typeof error.detail === 'string'
          ? error.detail
          : undefined

      setErrorMessage(
        detail === 'Invalid credentials'
          ? 'Käyttäjätunnus tai salasana on väärä.'
          : detail === 'Username already exists'
            ? 'Käyttäjätunnus on jo käytössä.'
            : 'Kirjautuminen ei onnistunut. Yritä hetken kuluttua uudelleen.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#182130] text-white">
      <div className="flex min-h-screen flex-col">
        <nav className="flex h-[70px] shrink-0 items-center justify-between border-b border-[#323645] px-6 sm:px-8">
          <Link
            to="/"
            className="font-sans text-3xl font-semibold tracking-[-0.04em] text-white"
          >
            Majakka
          </Link>
          <div className="flex items-center gap-6 text-sm font-semibold text-slate-300 sm:gap-10 sm:text-lg">
            <Link to="/" className="transition hover:text-white">
              Etusivu
            </Link>
            <Link to="/IALA" className="transition hover:text-white">
              IALA-valot
            </Link>
          </div>
        </nav>

        <div className="grid flex-1 lg:grid-cols-2">
          <section className="flex items-center px-5 py-14 sm:px-10 lg:px-[clamp(2.5rem,7vw,6rem)]">
            <div className="mx-auto w-full max-w-[529px]">
              <div className="mb-12 text-center lg:text-left">
                <p className="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-[#718096]">
                  Yönavigoinnin oppimateriaali
                </p>
                <h1 className="font-sans text-4xl font-semibold tracking-tighter text-white sm:text-5xl">
                  {isSignIn ? 'Tervetuloa takaisin' : 'Luo käyttäjätili'}
                </h1>
              </div>

              <div className="mb-10 grid grid-cols-2 gap-3 rounded-[10px] bg-[#181b29] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('sign-up')
                    setPasswordError(false)
                    setSubmitted(false)
                    setSuccessState(null)
                  }}
                  className={`h-12 rounded-lg px-4 text-base font-semibold transition sm:text-xl ${
                    !isSignIn
                      ? 'bg-[#4a5065] text-white'
                      : 'text-[#aeb4c7] hover:text-white'
                  }`}
                >
                  Rekisteröityminen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('sign-in')
                    setPasswordError(false)
                    setSubmitted(false)
                    setSuccessState(null)
                  }}
                  className={`h-12 rounded-lg px-4 text-base font-semibold transition sm:text-xl ${
                    isSignIn
                      ? 'bg-[#4a5065] text-white'
                      : 'text-[#aeb4c7] hover:text-white'
                  }`}
                >
                  Kirjautuminen
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-base font-medium text-white"
                  >
                    Käyttäjätunnus
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Kirjoita käyttäjätunnus"
                    required
                    value={username}
                    onChange={(event) => {
                      setUsername(event.target.value)
                      setErrorMessage('')
                    }}
                    className="h-[55px] w-full rounded-md border border-transparent bg-[#323645] px-3 text-base text-white outline-none placeholder:text-[#718096] focus:border-[#1d90f4] focus:ring-2 focus:ring-[#1d90f4]/25"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-base font-medium text-white"
                  >
                    Salasana
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={
                        isSignIn ? 'current-password' : 'new-password'
                      }
                      placeholder="Kirjoita salasana"
                      required
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value)
                        setPasswordError(false)
                      }}
                      className="h-[55px] w-full rounded-md border border-transparent bg-[#323645] px-3 pr-14 text-base text-white outline-none placeholder:text-[#718096] focus:border-[#1d90f4] focus:ring-2 focus:ring-[#1d90f4]/25"
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? 'Piilota salasana' : 'Näytä salasana'
                      }
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center border-l border-white/60 text-white transition hover:text-[#1d90f4]"
                    >
                      <EyeIcon visible={showPassword} />
                    </button>
                  </div>
                </div>

                {!isSignIn && (
                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="mb-2 block text-base font-medium text-white"
                    >
                      Vahvista salasana
                    </label>
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Kirjoita salasana uudelleen"
                      required
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value)
                        setPasswordError(false)
                      }}
                      aria-invalid={passwordError}
                      aria-describedby={
                        passwordError ? 'password-error' : undefined
                      }
                      className={`h-[55px] w-full rounded-md border bg-[#323645] px-3 text-base text-white outline-none placeholder:text-[#718096] focus:border-[#1d90f4] focus:ring-2 focus:ring-[#1d90f4]/25 ${
                        passwordError ? 'border-red-400' : 'border-transparent'
                      }`}
                    />
                    {passwordError && (
                      <p
                        id="password-error"
                        className="mt-2 text-sm text-red-300"
                      >
                        Salasanat eivät täsmää.
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || Boolean(successState?.isOpen)}
                  className="h-[60px] w-full rounded-[10px] border border-black bg-[#1d90f4] px-6 text-xl font-semibold text-[#f7fafc] transition hover:bg-[#43a5f7] focus:outline-none focus:ring-2 focus:ring-[#8bc9ff] focus:ring-offset-2 focus:ring-offset-[#182130] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting
                    ? 'Käsitellään...'
                    : isSignIn
                      ? 'Kirjaudu sisään'
                      : 'Luo tili'}
                </button>

                {errorMessage && (
                  <p
                    role="alert"
                    className="rounded-md border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200"
                  >
                    {errorMessage}
                  </p>
                )}

                {submitted && (
                  <p
                    role="status"
                    className="rounded-md border border-[#1d90f4]/30 bg-[#1d90f4]/10 px-4 py-3 text-sm text-[#c9e7ff]"
                  >
                    {isSignIn
                      ? 'Kirjautumispyyntö vastaanotettu.'
                      : 'Käyttäjätilin luontipyyntö vastaanotettu.'}
                  </p>
                )}
              </form>
            </div>
          </section>

          <aside
            aria-label="Majakan yömaisema"
            className="relative hidden min-h-[520px] overflow-hidden bg-[#111827] lg:block"
            style={{
              backgroundImage:
                'linear-gradient(90deg, #182130 5%, rgba(24,33,48,0.2) 100%), linear-gradient(0deg, #182130 0%, rgba(24,33,48,0.05) 48%), url(https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=1200&q=85)',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center px-8">
              <p className="max-w-sm text-center font-sans text-2xl font-extralight tracking-[0.03em] text-white/90 sm:text-3xl">
                Learn to read the lights of the night sea
              </p>
            </div>
          </aside>
        </div>
      </div>

      <LoginSuccessModal
        isOpen={Boolean(successState?.isOpen)}
        mode={successState?.mode ?? 'sign-in'}
        username={successState?.username ?? username}
        onNavigateHome={handleNavigateHome}
      />
    </main>
  )
}
