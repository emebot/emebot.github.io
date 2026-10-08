import { useState, type SubmitEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faEnvelope, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

type Topic = {
    title: string;
    tag: string;
    description: string;
    lights: string[];
    to?: '/colregs' | '/IALA' | '/IALA-quiz';
};

const topics: Topic[] = [
    {
        title: 'Veneiden kulkuvalot',
        tag: 'COLREG-SÄÄNNÖT',
        description:
            'Opi tunnistamaan punaisen, vihreän ja valkoisen kulkuvalon yhdistelmistä, mihin suuntaan alus on menossa ja kumman aluksen tulee väistää.',
        lights: ['#ef4444', '#22c55e', '#f8fafc'],
        to: '/colregs',
    },
    {
        title: 'IALA-valorytmit ja -poijumerkit',
        tag: 'VÄYLÄMERKIT',
        description:
            'Tutustu IALA-järjestelmän mukaisiin loistoihin ja niiden vilkkumissekvensseihin ja väreihin.',
        lights: ['#f59e0b', '#f8fafc'],
        to: '/IALA',
    },
    {
        title: 'Alusten siluetit',
        tag: 'HÄMÄRÄTUNNISTUS',
        description:
            'Harjoittele tunnistamaan aluksen tyyppi ääriviivoista silloinkin, kun valot eivät vielä erotu selvästi.',
        lights: ['#38bdf8'],
    },
    {
        title: 'Tietovisa',
        tag: 'SIMULAATIO',
        description:
            'Testaa oppimasi tiedot käytännön tilanteissa ja seuraa omaa edistymistäsi.',
        lights: ['#f8fafc', '#f59e0b'],
        to: '/IALA-quiz',
    },
]

const cutCorner = '[clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,0_100%)]';

const field = 'w-full rounded-xl border border-[#2A3548] bg-[#121a26] px-4 py-2.5 text-sm text-[#E3E3E3] placeholder:text-[#526077] focus:border-[#1D90F4] focus:outline-none focus:ring-1 focus:ring-[#1D90F4] transition';

const gridStyle = {
    backgroundImage: `
        radial-gradient(
            circle at 50% 0%,
            rgba(29, 144, 244, 0.14) 0%,
            transparent 55%
        ),
        radial-gradient(
            circle at 90% 30%,
            rgba(56, 189, 248, 0.08) 0%,
            transparent 45%
        ),
        linear-gradient(
            to right,
            rgba(255, 255, 255, 0.03) 1px,
            transparent 1px
        ),
        linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.03) 1px,
            transparent 1px
        )
    `,
    backgroundSize: `
        100% 100%,
        100% 100%,
        40px 40px,
        40px 40px
    `,
}

function Lights({ colors, size }: { colors: string[]; size: string }) {
    return (
        <div
            className="flex items-center justify-center gap-4"
            aria-hidden="true"
        >
            {colors.map((color, index) => (
                <span
                    key={index}
                    className={`${size} rounded-full transition-transform`}
                    style={{
                        backgroundColor: color,
                        boxShadow: `0 0 20px 4px ${color}, 0 0 35px 6px ${color}66`,
                    }}
                />
            ))}
        </div>
    )
}

export default function HomePage() {
    const [sent, setSent] = useState(false)

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSent(true)
        e.currentTarget.reset()
        setTimeout(() => setSent(false), 5000)
    }

    return (
        <div
            className="relative min-h-screen bg-[#182130] font-['Inter',sans-serif] text-[#E3E3E3]"
            style={gridStyle}
        >
            {/* hero section */}
            <section className="relative overflow-hidden">
                <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pt-16 pb-20 lg:grid-cols-12 lg:pt-24 lg:pb-28">
                    <div className="lg:col-span-7">
                        <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                            Opi lukemaan pimeän meren{' '}
                            <span className="text-[#1D90F4]">valot</span>
                        </h1>

                        <p className="mt-8 max-w-xl text-lg font-light leading-8 text-[#c3cddb]">
                            Sivusto opettaa tunnistamaan veneiden kulkuvalot,
                            majakoiden ja väylämerkkien loistot sekä alusten
                            siluetit — taidot, joita jokainen pimeällä vesillä
                            liikkuva tarvitsee.
                        </p>

                        <div className="mt-10 flex flex-wrap items-center gap-4">
                            <Link
                                to="/"
                                hash="aiheet"
                                className={`${cutCorner} inline-flex items-center gap-2 bg-[#1D90F4] px-7 py-3.5 text-lg font-semibold text-white shadow-lg shadow-[#1D90F4]/20 transition hover:-translate-y-0.25 hover:bg-[#3BA0F6]`}
                            >
                                Tutustu aiheisiin
                                <span className="text-sm"><FontAwesomeIcon icon={faArrowRight}/></span>
                            </Link>

                            <Link
                                to="/"
                                hash="miksi"
                                className="px-3 py-3.5 text-lg font-medium text-[#1D90F4] underline-offset-4 hover:underline"
                            >
                                Miksi tämä on tärkeää?
                            </Link>
                        </div>
                    </div>
                    <div className="lg:col-span-5">
                        <div className="relative overflow-hidden rounded-2xl border border-[#2A3548] bg-[#0F1724] p-5 shadow-2xl">
                            <div className="flex aspect-[4/3] items-center justify-center rounded-sm bg-[#0F1724] lg:aspect-square">
                                <Lights
                                    colors={["#ef4444", "#22c55e", "#f8fafc"]}
                                    size="h-6 w-6 sm:h-8 sm:w-8"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* aiheet section */}
            <section
                id="aiheet"
                className="border-t border-[#2A3548]/80 bg-[#070d1a] scroll-mt-20"
            >
                <div className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
                    <div className="text-center">
                        <span className="text-xs uppercase tracking-widest text-[#1D90F4]">
                            Aiheet
                        </span>
                        <h2 className="mt-2 text-3xl font-light text-white sm:text-4xl">
                            Neljä kokonaisuutta, yksi taito
                        </h2>
                        <p className="mt-3 font-light text-[#9fb0c7]">
                            Jokainen osio keskittyy yhteen pimeän ajan
                            navigoinnin peruspilariin.
                        </p>
                    </div>

                    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {topics.map((topic) => {
                            const cardContent = (
                                <>
                                    <div className="relative flex h-36 items-center justify-center border-b border-[#2A3548]/40 bg-[#0F1724]">
                                        <span className="absolute top-3 left-3 text-[10px] text-[#718096]">
                                            {topic.tag}
                                        </span>
                                        {!topic.to && (
                                            <span className="absolute top-3 right-3 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                                                Tulossa
                                            </span>
                                        )}
                                        <Lights
                                            colors={topic.lights}
                                            size="h-4 w-4"
                                        />
                                    </div>

                                    <div className="flex flex-1 flex-col justify-between p-5">
                                        <div>
                                            <h3 className="mt-1 text-xl font-light text-[#1D90F4]">
                                                {topic.title}
                                            </h3>
                                            <p className="mt-3 text-sm leading-relaxed text-[#9fb0c7]">
                                                {topic.description}
                                            </p>
                                        </div>
                                        {topic.to && (
                                            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#1D90F4]">
                                                <span>Avaa</span>
                                                <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                                            </div>
                                        )}
                                    </div>
                                </>
                            );

                            return topic.to ? (
                                <Link
                                    key={topic.title}
                                    to={topic.to}
                                    className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#2A3548] bg-[#1E2839]/80 text-[#E3E3E3] transition-all duration-300 hover:-translate-y-1 hover:border-[#1D90F4]/60 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D90F4]"
                                >
                                    {cardContent}
                                </Link>
                            ) : (
                                <div
                                    key={topic.title}
                                    className="flex flex-col justify-between overflow-hidden rounded-xl border border-[#2A3548] bg-[#1E2839]/50 text-[#E3E3E3] opacity-80"
                                >
                                    {cardContent}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* miksi section*/}
            <section
                id="miksi"
                className="border-t border-[#2A3548]/80 py-20 scroll-mt-20"
            >
                <div className="mx-auto max-w-6xl scroll-mt-20 px-6">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        <div>
                            <span className="text-xs uppercase tracking-widest text-[#1D90F4]">
                                Tilannetietoisuus
                            </span>
                            <h2 className="mt-2 text-3xl font-light text-white sm:text-4xl">
                                Miksi valojen tunnistaminen on tärkeää
                            </h2>
                            <p className="mt-6 font-light leading-7 text-[#c3cddb]">
                                Pimeällä merellä valot ja siluetit ovat usein
                                ainoa tieto siitä, mitä toinen alus tekee —
                                mihin suuntaan se on menossa, onko se ankkurissa
                                vai liikkeellä ja kumman aluksen tulee väistää.
                                Väärä tulkinta voi johtaa vaaratilanteeseen.
                            </p>
                            <p className="mt-4 font-light leading-7 text-[#9fb0c7]">
                                Tämä sivusto on osa opiskelijoiden
                                innovaatioprojektia, jonka tavoitteena on tehdä
                                näiden sääntöjen opettelusta havainnollista ja
                                käytännönläheistä.
                            </p>
                        </div>

                        <dl className="space-y-4 rounded-xl border border-[#2A3548] bg-[#0F1724]/90 p-8 shadow-2xl backdrop-blur-md">
                            {[
                                {
                                    term: 'Kulkuvalot',
                                    text: 'Kertovat aluksen suunnan ja tyypin pimeällä.',
                                    lights: ['#ef4444', '#22c55e', '#f8fafc'], // Punainen, Vihreä, Valkoinen valoina
                                },
                                {
                                    term: 'Loistot',
                                    text: 'Ohjaavat turvallisesti väylällä ja merkitsevät vaaroja.',
                                    spec: 'IALA REGION A • VILKUT',
                                },
                                {
                                    term: 'Siluetit',
                                    text: 'Auttavat tunnistamaan aluksen tyypin myös hämärässä.',
                                    spec: 'RUNKOMALLIT & MASTOT',
                                },
                            ].map((item) => (
                                <div
                                    key={item.term}
                                    className="rounded-lg border border-[#2A3548]/60 bg-[#182130]/60 p-4 transition hover:border-[#1D90F4]/50"
                                >
                                    <div className="flex items-center justify-between">
                                        <dt className="text-lg font-medium text-[#1D90F4]">
                                            {item.term}
                                        </dt>
                                        {item.lights ? (
                                            <div className="flex items-center gap-2">
                                                <Lights colors={item.lights} size="h-2.5 w-2.5" />
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-[#718096]">
                                                {item.spec}
                                            </span>
                                        )}
                                    </div>
                                    <dd className="mt-1 font-light text-[#c3cddb]">
                                        {item.text}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </section>

            {/* yhteys section */}
            <section
                id="yhteys"
                className="border-t border-[#2A3548]/80 bg-[#070d1a] py-20 relative scroll-mt-20"
            >
                <div className="mx-auto max-w-6xl scroll-mt-20 px-6">
                    <div className="rounded-3xl border border-[#2A3548] bg-[#0F1724]/95 p-8 lg:p-12 shadow-2xl backdrop-blur-xl">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                            <div className="lg:col-span-5 space-y-5">
                                <h2 className="text-3xl font-bold tracking-tight text-[#1D90F4]">
                                    Ota yhteyttä
                                </h2>

                                <p className="text-sm leading-relaxed text-[#c3cddb]">
                                    Onko sinulla kysyttävää opetusmateriaaleista,
                                    simulaattorin toiminnasta, väyläkartoista tai
                                    haluatko antaa palautetta? Lähetä viesti suoraan
                                    projektitiimillemme.
                                </p>

                                <div className="space-y-3 pt-2 text-xs text-[#9fb0c7]">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1D90F4]/20 font-bold text-[#38bdf8]">
                                            <FontAwesomeIcon icon={faEnvelope} />
                                        </div>
                                        <span>email@address.com</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1D90F4]/20 font-bold text-[#38bdf8]">
                                            <FontAwesomeIcon icon={faDiscord} />
                                        </div>
                                        <span>Discord: discord.gg/majakka</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1D90F4]/20 font-bold text-[#38bdf8]">
                                            <FontAwesomeIcon icon={faLocationDot} />
                                        </div>
                                        <span>Helsinki, Suomi • katuosoite 123</span>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-7">
                                <div className="rounded-2xl border border-[#2A3548] bg-[#182130] p-6 sm:p-8">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs tracking-wider text-[#9fb0c7] mb-1.5">
                                                    Etunimi
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Etunimi"
                                                    className={field}
                                                    name="firstName"
                                                    autoComplete="given-name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs tracking-wider text-[#9fb0c7] mb-1.5">
                                                    Sukunimi
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Sukunimi"
                                                    className={field}
                                                    name="lastName"
                                                    autoComplete="family-name"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs tracking-wider text-[#9fb0c7] mb-1.5">
                                                    Sähköpostiosoite
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="email@address.com"
                                                    className={field}
                                                    name="email"
                                                    autoComplete="email"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs tracking-wider text-[#9fb0c7] mb-1.5">
                                                    Aihe
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        name="topic"
                                                        className={`${field} appearance-none pr-10 cursor-pointer`}
                                                    >
                                                        <option>Palautetta simulaattorista</option>
                                                        <option>Koulutus- ja kurssisisällöt</option>
                                                        <option>Väylä- ja loistotietojen korjaus</option>
                                                        <option>Muu yhteydenotto</option>
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#718096]">
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs tracking-wider text-[#9fb0c7] mb-1.5">
                                                Viesti
                                            </label>
                                            <textarea
                                                rows={4}
                                                required
                                                placeholder="Kirjoita viestisi tai havaintosi tähän..."
                                                className={`${field} resize-none`}
                                                name="message"
                                            />
                                        </div>

                                        <div className="pt-2 flex flex-col sm:flex-row justify-end">
                                            <button
                                                type="submit"
                                                className={`${cutCorner} w-full sm:w-auto bg-[#1D90F4] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#1D90F4]/20 transition hover:bg-[#3BA0F6] active:scale-95 cursor-pointer`}
                                            >
                                                Lähetä viesti <FontAwesomeIcon icon={faArrowRight} />
                                            </button>
                                        </div>

                                        {sent && (
                                            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 p-3 text-center font-mono text-xs text-emerald-300">
                                                Viesti lähetetty onnistuneesti! Vastaus toimitetaan sähköpostiisi.
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}