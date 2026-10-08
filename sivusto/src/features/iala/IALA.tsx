import { useState } from "react";
import './IALA-lights.css'

interface Characteristic {
  abbr: string;
  name: string;
  animClass: string;
  color: string;
  colorLabel: string;
  period: string;
  description: string;
}

interface BuoyType {
  name: string;
  lights: string[];
  animClass: string;
  char: string;
  shape: string;
  description: string;
  kind: BuoyKind;
}

interface LateralRow {
  side: string;
  colorA: string;
  colorB: string;
  labelA: string;
  labelB: string;
  regionA: string;
  regionB: string;
}

type IalaRegion = "A" | "B";
type BuoyKind =
  | "port"
  | "starboard"
  | "north"
  | "south"
  | "east"
  | "west"
  | "safe-water"
  | "special"
  | "isolated-danger";

const characteristics: Characteristic[] = [
  {
    abbr: "F",
    name: "Kiinteä",
    animClass: "light-flash-fixed",
    color: "#f8fafc",
    colorLabel: "Valkoinen",
    period: "Jatkuva",
    description:
      "Tasainen, katkeamaton valo. Yksinkertaisin loistotyyppi — palaa jatkuvasti ilman katkoja. Käytetään johtoloistoissa ja joissain pienissä merkkiloistoissa, joissa pysyvä säde riittää.",
  },
  {
    abbr: "Vl",
    name: "Välkkyvä",
    animClass: "light-flash-single",
    color: "#f8fafc",
    colorLabel: "Valkoinen",
    period: "3 s",
    description:
      "Yksittäinen välähdys toistuu säännöllisin väliajoin, pimeys aina valoa pidempää. Yleisin loistotyyppi poijuissa ja merimerkkiloistoissa ympäri maailman.",
  },
  {
    abbr: "Vl(2)",
    name: "Ryhmävälkky (2)",
    animClass: "light-flash-group2",
    color: "#22c55e",
    colorLabel: "Vihreä",
    period: "5 s",
    description:
      "Kaksi nopeaa välähdystä peräkkäin, sitten pidempi pimeys. Ryhmävälkkyloistoja käytetään erottamaan vierekkäiset merkit toisistaan — ryhmän välähdysten lukumäärä on tunnistuksen avain.",
  },
  {
    abbr: "Vl(3)",
    name: "Ryhmävälkky (3)",
    animClass: "light-flash-group3",
    color: "#ef4444",
    colorLabel: "Punainen",
    period: "7 s",
    description:
      "Kolme nopeaa välähdystä ennen pimeää jaksoa. Välähdysten laskeminen on tärkeää merkin tunnistamiseksi heikossa näkyvyydessä.",
  },
  {
    abbr: "Iso",
    name: "Isofaasi",
    animClass: "light-flash-iso",
    color: "#f8fafc",
    colorLabel: "Valkoinen",
    period: "2 s",
    description:
      "Yhtä pitkät valo- ja pimeäjaksot — valo palaa täsmälleen puolet ajasta ja sammuu puolet. Täydellisen tasapainoinen rytmi tekee isofaasiloistoista välittömästi tunnistettavan merellä.",
  },
  {
    abbr: "Pim",
    name: "Pimennetty",
    animClass: "light-flash-occulting",
    color: "#f8fafc",
    colorLabel: "Valkoinen",
    period: "3 s",
    description:
      "Välkkyvän vastakohta — valo palaa kauemmin kuin on pimeänä. Lyhyt pimennys katkaisee muuten tasaisen säteen. Käytetään yleisesti johtoloistoissa ja sektorivaroitusloistoissa.",
  },
  {
    abbr: "Np",
    name: "Nopea",
    animClass: "light-flash-quick",
    color: "#f59e0b",
    colorLabel: "Keltainen",
    period: "0,8 s",
    description:
      "Erittäin nopea välkyntä, 50–60 välähdystä minuutissa. Korkea tahti luo tunnusomaisen kiireellisen luonteen, jota käytetään kardinaalimerkkiloistoissa osoittamaan, että nimetyllä puolella on turvallista navigointivettä.",
  },
  {
    abbr: "PVl",
    name: "Pitkä välkky",
    animClass: "light-flash-longflash",
    color: "#f8fafc",
    colorLabel: "Valkoinen",
    period: "10 s",
    description:
      "Yksittäinen vähintään kahden sekunnin mittainen välähdys. Pitkä hehku erottuu selvästi tavallisista välkkyloistosta. Tyypillisesti turvavesimerkeissä, jotka osoittavat väylän keskikohdan tai maatumispaikan.",
  },
  {
    abbr: "Mo(A)",
    name: "Morsekoodi — A",
    animClass: "light-flash-morse-a",
    color: "#f8fafc",
    colorLabel: "Valkoinen",
    period: "6 s",
    description:
      "Loisto, joka lähettää morseaakkoset A (• —) välähdyssekvensseinä. Morsekoodimerkkejä käytetään turvavesimerkeissä ja joissain johtoloistoissa yksiselitteisen tunnisteen antamiseksi.",
  },
];

const buoyTypes: BuoyType[] = [
  {
    name: "Lateraali — Paapuuri (IALA-A)",
    lights: ["#ef4444"],
    animClass: "light-flash-single",
    char: "Vl P",
    shape: "Tynnyri",
    kind: "port",
    description:
      "Merkitsee väylän paapuuripuolen (vasen) kulkusuunnassa. Punainen tynnyripoiju punaisella välkkyvalolla. IALA-B-alueilla (Ameriikat, Japani) paapuuri- ja styyrpuuripuolen värit ovat päinvastoin.",
  },
  {
    name: "Lateraali — Styyrpuuri (IALA-A)",
    lights: ["#22c55e"],
    animClass: "light-flash-single",
    char: "Vl V",
    shape: "Kartio",
    kind: "starboard",
    description:
      "Merkitsee väylän styyrpuuripuolen (oikea) IALA-A-alueilla. Vihreä kartiopoiju vihreällä välkkyvalolla. Muistiohje 'punainen paapuuriin, vihreä styyrpuuriin' pätee Euroopassa ja useimmilla kansainvälisillä vesillä.",
  },
  {
    name: "Kardinaali — Pohjoinen",
    lights: ["#f8fafc"],
    animClass: "light-flash-quick",
    char: "Np",
    shape: "Pilari / Sauva",
    kind: "north",
    description:
      "Kulje merkin POHJOISPUOLELTA. Musta-keltainen pilaripoiju kahdella ylöspäin osoittavalla kartiolla. Nopea valkoinen valo (Np) tai erittäin nopea valkoinen valo (ENp). Kaksoiskartiohuippumerkki muistuttaa kirjainta P.",
  },
  {
    name: "Kardinaali — Eteläinen",
    lights: ["#f8fafc"],
    animClass: "light-flash-cardinal-south",
    char: "Np(6)+PVl",
    shape: "Pilari / Sauva",
    kind: "south",
    description:
      "Kulje merkin ETELÄPUOLELTA. Keltainen-musta poiju kahdella alaspäin osoittavalla kartiolla. Kuusi nopeaa välähdystä ja yksi pitkä välkky joka 15 sekunti — kello kuusi on kellotaulun alhaalla.",
  },
  {
    name: "Kardinaali — Itäinen",
    lights: ["#f8fafc"],
    animClass: "light-flash-cardinal-east",
    char: "Np(3)",
    shape: "Pilari / Sauva",
    kind: "east",
    description:
      "Kulje merkin ITÄPUOLELTA. Musta-keltainen-musta poiju kahdella ulospäin osoittavalla kartiolla. Kolme nopeaa välähdystä joka 10 sekunti — kolme on kellotaulun oikealla (idässä).",
  },
  {
    name: "Kardinaali — Läntinen",
    lights: ["#f8fafc"],
    animClass: "light-flash-cardinal-west",
    char: "Np(9)",
    shape: "Pilari / Sauva",
    kind: "west",
    description:
      "Kulje merkin LÄNSIPUOLELTA. Keltainen-musta-keltainen poiju kahdella sisäänpäin osoittavalla kartiolla. Yhdeksän nopeaa välähdystä joka 15 sekunti — yhdeksän on kellotaulun vasemmalla (lännessä).",
  },
  {
    name: "Turvavesimerkki",
    lights: ["#ef4444", "#f8fafc"],
    animClass: "light-flash-morse-a",
    char: "Mo(A) / PVl / Iso",
    shape: "Pallonmuotoinen",
    kind: "safe-water",
    description:
      "Osoittaa turvallisen kulkuveden joka suuntaan — väylän keskilinja tai maatumismerkki. Punainen-valkoinen pystyraita pallonmuotoinen poiju, usein pitkä välkky, isofaasi tai Morse A valkoinen valo.",
  },
  {
    name: "Erikoismerkki",
    lights: ["#f59e0b"],
    animClass: "light-flash-single",
    char: "Vl K",
    shape: "Vaihteleva (X-huippumerkki)",
    kind: "special",
    description:
      "Merkitsee merikortissa mainittua erityisaluetta tai -kohdetta — liikenteen erottelujärjestelmät, sotilasharjoitusalueet, kaapeli- ja putkistot tai vesiviljely. Keltainen runko keltaisella valolla (mikä tahansa tyyppi).",
  },
  {
    name: "Eristetty vaaramerkki",
    lights: ["#ef4444", "#f8fafc"],
    animClass: "light-flash-group2",
    char: "Vl(2)",
    shape: "Pilari / Sauva",
    kind: "isolated-danger",
    description:
      "Merkitsee eristyneen vaaran, jonka ympärillä on turvallista kulkuvettä. Musta-punainen vaakasuoraitattu poiju kahdella mustalla pallolla huippumerkkinä. Ryhmävälkky valkoinen valo (2) joka viisi sekuntia on standardi.",
  },
];

function LightDot({
  color,
  animClass,
  size = "md",
}: {
  color: string;
  animClass: string;
  size?: "sm" | "md" | "lg";
}) {
  const s = size === "lg" ? 20 : size === "md" ? 13 : 9;
  return (
    <span
      className={`inline-block rounded-full ${animClass}`}
      style={{
        width: s,
        height: s,
        backgroundColor: color,
        boxShadow: `0 0 ${s * 1.2}px ${s * 0.6}px ${color}88`,
        flexShrink: 0,
      }}
    />
  );
}


function CharCard({ c }: { c: Characteristic }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-amber-300/40 hover:bg-white/8">
      <div className="flex items-center gap-3">
        <LightDot color={c.color} animClass={c.animClass} size="lg" />
        <div>
          <span className="block font-mono text-xs text-amber-300">{c.abbr}</span>
          <span className="block font-serif text-lg font-semibold leading-tight">
            {c.name}
          </span>
        </div>
        <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-xs text-slate-400">
          {c.period}
        </span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-300">
        {c.description}
      </p>
      <p className="mt-3 text-xs text-slate-500">
        Väri:&nbsp;
        <span className="text-slate-400">{c.colorLabel}</span>
      </p>
    </div>
  );
}

function BuoyIllustration({ kind, name }: { kind: BuoyKind; name: string }) {
  const bodyClipId = `marker-body-${kind}`;
  const darkMarkProps = {
    fill: "#050505",
    stroke: "#94a3b8",
    strokeWidth: 1.25,
    strokeLinejoin: "round" as const,
  };

  const body = (() => {
    switch (kind) {
      case "port":
      case "starboard":
        return (
          <path
            d="M81 68h18v112q0 9-9 9t-9-9Z"
            fill={kind === "port" ? "#ef2929" : "#55b950"}
          />
        );
      case "north":
        return (
          <g clipPath={`url(#${bodyClipId})`}>
            <rect x="80" y="66" width="20" height="54" fill="#050505" />
            <rect x="80" y="120" width="20" height="70" fill="#ffe500" />
          </g>
        );
      case "south":
        return (
          <g clipPath={`url(#${bodyClipId})`}>
            <rect x="80" y="66" width="20" height="54" fill="#ffe500" />
            <rect x="80" y="120" width="20" height="70" fill="#050505" />
          </g>
        );
      case "west":
        return (
          <g clipPath={`url(#${bodyClipId})`}>
            <rect x="80" y="66" width="20" height="40" fill="#ffe500" />
            <rect x="80" y="106" width="20" height="41" fill="#050505" />
            <rect x="80" y="147" width="20" height="43" fill="#ffe500" />
          </g>
        );
      case "east":
        return (
          <g clipPath={`url(#${bodyClipId})`}>
            <rect x="80" y="66" width="20" height="40" fill="#050505" />
            <rect x="80" y="106" width="20" height="41" fill="#ffe500" />
            <rect x="80" y="147" width="20" height="43" fill="#050505" />
          </g>
        );
      case "isolated-danger":
        return (
          <g clipPath={`url(#${bodyClipId})`}>
            <rect x="80" y="66" width="20" height="40" fill="#050505" />
            <rect x="80" y="106" width="20" height="42" fill="#ef2929" />
            <rect x="80" y="148" width="20" height="42" fill="#050505" />
          </g>
        );
      case "safe-water":
        return (
          <path d="M81 58h18v122q0 9-9 9t-9-9Z" fill="#ed1738" />
        );
      case "special":
        return (
          <path d="M81 57h18v123q0 9-9 9t-9-9Z" fill="#f5d90a" />
        );
    }
  })();

  const topMark = (() => {
    switch (kind) {
      case "port":
        return (
          <g>
            <rect x="70" y="38" width="40" height="35" rx="1.5" fill="#ef2929" />
            <path d="M75 43h30" stroke="#fca5a5" strokeOpacity=".45" strokeWidth="2" />
          </g>
        );
      case "starboard":
        return (
          <path
            d="M90 34 59 75h62Z"
            fill="#55b950"
            stroke="#86efac"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        );
      case "north":
        return (
          <g {...darkMarkProps}>
            <path d="M90 42 67 72h46Z" />
            <path d="M90 14 67 44h46Z" />
          </g>
        );
      case "south":
        return (
          <g {...darkMarkProps}>
            <path d="M67 14h46L90 44Z" />
            <path d="M67 42h46L90 72Z" />
          </g>
        );
      case "west":
        return (
          <g {...darkMarkProps}>
            <path d="M65 15h50L90 48Z" />
            <path d="M90 48 65 81h50Z" />
          </g>
        );
      case "east":
        return (
          <g {...darkMarkProps}>
            <path d="M90 14 65 48h50Z" />
            <path d="M65 48h50L90 82Z" />
          </g>
        );
      case "isolated-danger":
        return (
          <circle cx="90" cy="39" r="22" {...darkMarkProps} />
        );
      case "safe-water":
        return (
          <circle cx="90" cy="39" r="21" fill="#ed1738" stroke="#fda4af" strokeWidth="1" />
        );
      case "special":
        return (
          <path
            d="m66 17 15 23-15 23 24-14 24 14-15-23 15-23-24 14Z"
            fill="#f5d90a"
            stroke="#fef08a"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        );
    }
  })();

  return (
    <svg
      viewBox="0 0 180 210"
      role="img"
      aria-label={`${name}, päivämerkki`}
      className="h-52 w-full"
    >
      <defs>
        <clipPath id={bodyClipId}>
          <path d="M80 65h20v115q0 10-10 10t-10-10Z" />
        </clipPath>
        <filter id={`top-shadow-${kind}`} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#020617" floodOpacity=".45" />
        </filter>
      </defs>
      <ellipse cx="90" cy="190" rx="30" ry="4" fill="#020617" opacity=".24" />
      <path d="M43 193q16-6 32 0t32 0 32 0" fill="none" stroke="#38bdf8" strokeOpacity=".2" />
      {body}
      {["north", "south", "east", "west", "isolated-danger"].includes(kind) && (
        <path
          d="M80 65h20v115q0 10-10 10t-10-10V65Z"
          fill="none"
          stroke="#cbd5e1"
          strokeOpacity=".5"
          strokeWidth="1"
        />
      )}
      <path
        d="M85 71v105"
        stroke="#fff"
        strokeOpacity=".12"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <g filter={`url(#top-shadow-${kind})`}>{topMark}</g>
    </svg>
  );
}

function BuoyCard({ b }: { b: BuoyType }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-amber-300/40 hover:bg-white/8">
      <div className="relative border-b border-white/10 bg-[#091428] px-4 pt-3">
        <BuoyIllustration kind={b.kind} name={b.name} />
        <span className="absolute left-4 top-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Päivämerkki
        </span>
      </div>
      <div className="p-6">
        <div className="mb-4 flex items-center gap-2">
          {b.lights.map((col, i) => (
            <LightDot key={i} color={col} animClass={b.animClass} size="md" />
          ))}
          <span className="ml-1 text-xs text-slate-500">Yövalo</span>
        </div>
        <h3 className="font-serif text-xl font-semibold">{b.name}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-0.5 font-mono text-xs text-amber-300">
            {b.char}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">
            {b.shape}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          {b.description}
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [activeSystem, setActiveSystem] = useState<IalaRegion>("A");

  return (
    <div className="bg-[#0b1830] text-white min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20 sm:pt-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(239,68,68,0.12) 0%, transparent 45%), radial-gradient(circle at 80% 10%, rgba(34,197,94,0.10) 0%, transparent 40%), radial-gradient(circle at 50% 80%, rgba(245,158,11,0.08) 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center gap-4">
            <LightDot color="#ef4444" animClass="light-flash-single" size="lg" />
            <LightDot color="#22c55e" animClass="light-flash-group2" size="lg" />
            <LightDot color="#f8fafc" animClass="light-flash-quick" size="lg" />
            <LightDot color="#f59e0b" animClass="light-flash-occulting" size="lg" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            IALA-merenkulun merkintäjärjestelmä
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            IALA-valorytmit ja -poijutyypit
          </h1>
          <p className="mt-6 text-lg text-slate-300">
            Jokaisella veden päällä näkyvällä valolla on tarkoituksensa — sen väri, rytmi ja sijainti sisältävät tärkeää navigointitietoa.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-navy-900 border-y border-white/10 px-6 py-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Värivaihtoehdot", value: "4", sub: "Punainen · Vihreä · Valkoinen · Keltainen" },
              { label: "Kardinaalipisteet", value: "4", sub: "P · E · I · L" },
              { label: "IALA-alueet", value: "2", sub: "Alue A & Alue B" },
              { label: "Loistotyypit", value: "12+", sub: "K · Vl · Pim · Iso · Np · Mo …" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <span className="block font-serif text-3xl font-semibold text-amber-300">
                  {stat.value}
                </span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-white mt-0.5">
                  {stat.label}
                </span>
                <span className="block text-xs text-slate-500 mt-0.5">{stat.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Light Characteristics */}
      <section id="characteristics" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300 mb-2">
              Osio 1
            </p>
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">
              Loistojen tyypit
            </h2>
            <p className="mt-4 text-slate-300">
              Loiston "tyyppi" määräytyy sen välähdysrytmin mukaan.
              Merenkulkijat tunnistavat loistot ajastamalla välähdykset kellolla
              ja vertaamalla merikarttaan. Jokainen alla oleva animoitu piste
              näyttää kyseisen tyypin todellisen rytmin.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {characteristics.map((c) => (
              <CharCard key={c.abbr} c={c} />
            ))}
          </div>
        </div>
      </section>

      {/* Buoy Types */}
      <section id="buoys" className="bg-navy-900 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300 mb-2">
              Osio 2
            </p>
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">
              IALA-poijutyypit
            </h2>
            <p className="mt-4 text-slate-300">
              IALA-järjestelmä määrittelee viisi merkkikategoriaa. Väri, muoto,
              huippumerkki ja loistotyyppi muodostavat yhdessä yksiselitteisen
              kuvauksen kunkin merkin merkityksestä.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {buoyTypes.map((b) => (
              <BuoyCard key={b.name} b={b} />
            ))}
          </div>
        </div>
      </section>

      {/* IALA-A vs IALA-B */}
      <section id="rules" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300 mb-2">
              Osio 3
            </p>
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">
              Alue A vai Alue B
            </h2>
            <p className="mt-4 text-slate-300">
              Maailma on jaettu kahteen IALA-alueeseen. Ainoa ero niiden välillä
              on punaisen ja vihreän värin sijoittelu paapuuri- ja
              styyrpuurilateraalimerkkeihin. Valitse alueesi alta.
            </p>
          </div>

          <div className="mb-10 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
            {(["A", "B"] as IalaRegion[]).map((r) => (
              <button
                key={r}
                onClick={() => setActiveSystem(r)}
                className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                  activeSystem === r
                    ? "bg-amber-300 text-navy-950"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                IALA-{r}
              </button>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {([
              {
                side: "Paapuuri (vasen)",
                colorA: "#ef4444",
                colorB: "#22c55e",
                labelA: "Punainen",
                labelB: "Vihreä",
                regionA:
                  "Eurooppa, Afrikka, Aasia (pl. Japani/Korea/Filippiinit), Australia, Uusi-Seelanti, Persianlahden maat.",
                regionB:
                  "Ameriikat, Japani, Etelä-Korea, Filippiinit.",
              },
              {
                side: "Styyrpuuri (oikea)",
                colorA: "#22c55e",
                colorB: "#ef4444",
                labelA: "Vihreä",
                labelB: "Punainen",
                regionA: "Vihreä kartiopoiju. Vihreä valo (mikä tahansa tyyppi).",
                regionB: "Punainen kartiopoiju. Punainen valo (mikä tahansa tyyppi).",
              },
            ] as LateralRow[]).map((row) => (
              <div
                key={row.side}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <LightDot
                    color={activeSystem === "A" ? row.colorA : row.colorB}
                    animClass="light-flash-single"
                    size="lg"
                  />
                  <div>
                    <p className="text-xs text-slate-400">Lateraalimerkki</p>
                    <p className="font-serif text-xl font-semibold">{row.side}</p>
                  </div>
                </div>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-amber-300">
                      Väri alueella IALA-{activeSystem}
                    </dt>
                    <dd className="mt-0.5 text-slate-300">
                      {activeSystem === "A" ? row.labelA : row.labelB}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-amber-300">
                      Kattavuus
                    </dt>
                    <dd className="mt-0.5 text-slate-300">
                      {activeSystem === "A" ? row.regionA : row.regionB}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}

            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-6 sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-300 mb-3">
                Muistisääntö
              </p>
              {activeSystem === "A" ? (
                <>
                  <p className="font-serif text-xl font-semibold mb-3">
                    "Punainen paapuuriin, vihreä styyrpuuriin"
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    IALA-A-vesillä (Eurooppa, Afrikka, suurin osa Aasiasta)
                    punainen poiju merkitsee aina väylän paapuuripuolen
                    kulkusuunnassa — yleensä kohti satamaa tai ylävirtaan.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-serif text-xl font-semibold mb-3">
                    "Red Right Returning"
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Klassinen amerikkalainen muistisääntö: pidä punaiset poijut
                    oikealla puolellasi palatessasi mereltä (sisämaahan tai
                    ylävirtaan). IALA-B-vesillä styyrpuurin lateraalimerkit
                    ovat punaisia.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

