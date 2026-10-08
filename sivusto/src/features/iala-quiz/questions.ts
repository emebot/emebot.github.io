import type { QuizDefinition } from '../../components/quiz/types'

export const ialaQuiz: QuizDefinition = {
  eyebrow: 'IALA-merenkulun merkintäjärjestelmä',
  accentLights: ['#ef4444', '#22c55e', '#f8fafc', '#f59e0b'],
  title: 'IALA-tietovisa',
  description:
    'Testaa, tunnistatko IALA-järjestelmän poijut, huippumerkit ja loistojen rytmit. Saat jokaisesta vastauksesta perustelun heti.',
  questions: [
    {
      id: 'iala-1',
      hint: 'Lateraalimerkit',
      prompt:
        'Mitä väriä on paapuurin lateraalimerkki IALA-A-alueella, johon Suomi kuuluu?',
      options: [
        { id: 'a', label: 'Punainen' },
        { id: 'b', label: 'Vihreä' },
        { id: 'c', label: 'Keltainen' },
        { id: 'd', label: 'Musta-keltainen' },
      ],
      correctOptionId: 'a',
      explanation:
        "IALA-A-alueella paapuurin (vasemman puolen) merkki on punainen tynnyripoiju punaisella valolla. Muistisääntö on 'punainen paapuuriin, vihreä styyrpuuriin'. IALA-B-alueella, esimerkiksi Amerikoissa ja Japanissa, värit ovat päinvastoin.",
    },
    {
      id: 'iala-2',
      hint: 'Kardinaalimerkit',
      prompt:
        'Poijussa on kaksi ylöspäin osoittavaa kartiota huippumerkkinä. Miltä puolelta merkki ohitetaan?',
      options: [
        { id: 'b', label: 'Eteläpuolelta' },
        { id: 'a', label: 'Pohjoispuolelta' },
        { id: 'c', label: 'Itäpuolelta' },
        { id: 'd', label: 'Länsipuolelta' },
      ],
      correctOptionId: 'a',
      explanation:
        'Kaksi ylöspäin osoittavaa kartiota merkitsee pohjoiskardinaalia: kulje merkin pohjoispuolelta. Kartiot osoittavat samaan suuntaan kuin se ilmansuunta, jolta merkki ohitetaan.',
    },
    {
      id: 'iala-3',
      hint: 'Loistojen rytmit',
      prompt: "Mitä lyhenne 'Iso' tarkoittaa loiston tunnuksessa?",
      options: [
        { id: 'b', label: 'Nopea välkky, 50–60 välähdystä minuutissa' },
        { id: 'c', label: 'Kiinteä, katkeamaton valo' },
        { id: 'a', label: 'Isofaasi — yhtä pitkät valo- ja pimeäjaksot' },
        { id: 'd', label: 'Pimennetty, jossa valo palaa pimeyttä kauemmin' },
      ],
      correctOptionId: 'a',
      explanation:
        'Isofaasiloistossa valo palaa täsmälleen puolet ajasta ja on sammuneena puolet. Täysin tasapainoinen rytmi tekee siitä helposti tunnistettavan merellä.',
    },
    {
      id: 'iala-4',
      hint: 'Kardinaalimerkit',
      prompt:
        'Eteläkardinaalin loistotunnus on Np(6)+PVl. Miksi välähdyksiä on juuri kuusi?',
      options: [
        { id: 'b', label: 'Merkin syvyys on kuusi metriä' },
        { id: 'c', label: 'Merkki ohitetaan kuuden solmun nopeudella' },
        { id: 'd', label: 'Kuusi tarkoittaa kuutta turvallista väylää' },
        {
          id: 'a',
          label: 'Kello kuusi on kellotaulun alhaalla eli etelässä',
        },
      ],
      correctOptionId: 'a',
      explanation:
        'Kardinaalimerkkien välähdysmäärät noudattavat kellotaulua: kolme idässä (kello 3), kuusi etelässä (kello 6) ja yhdeksän lännessä (kello 9). Etelämerkin pitkä välkky erottaa sen läntisestä yhdeksän välähdyksen merkistä.',
    },
    {
      id: 'iala-5',
      hint: 'Turvavesimerkki',
      prompt:
        'Punavalkoinen pystyraidallinen pallopoiju, jonka valo on Mo(A). Mitä se tarkoittaa?',
      options: [
        { id: 'a', label: 'Turvallista kulkuvettä joka suuntaan' },
        { id: 'b', label: 'Eristetty vaara, jonka ympäri kuljetaan' },
        { id: 'c', label: 'Erikoisalue, esimerkiksi kaapeli tai putkisto' },
        { id: 'd', label: 'Väylän styyrpuurin puoli' },
      ],
      correctOptionId: 'a',
      explanation:
        'Turvavesimerkki osoittaa, että sen ympärillä on turvallista kulkuvettä joka suuntaan. Se merkitsee usein väylän keskilinjan tai maatumiskohdan. Valo on Morse A, pitkä välkky tai isofaasi, aina valkoinen.',
    },
    {
      id: 'iala-6',
      hint: 'Eristetty vaaramerkki',
      prompt:
        'Poijussa on kaksi mustaa palloa päällekkäin huippumerkkinä. Mikä merkki on kyseessä?',
      options: [
        { id: 'b', label: 'Turvavesimerkki' },
        { id: 'a', label: 'Eristetty vaaramerkki' },
        { id: 'c', label: 'Pohjoiskardinaali' },
        { id: 'd', label: 'Erikoismerkki' },
      ],
      correctOptionId: 'a',
      explanation:
        'Kaksi mustaa palloa päällekkäin on eristetyn vaaramerkin huippumerkki. Runko on musta-punainen vaakaraidallinen ja valo valkoinen ryhmävälkky Vl(2). Merkin ympärillä on turvallista vettä.',
    },
    {
      id: 'iala-7',
      hint: 'Erikoismerkit',
      prompt: 'Minkä värinen on erikoismerkin runko ja valo?',
      options: [
        { id: 'b', label: 'Musta runko ja valkoinen valo' },
        { id: 'c', label: 'Vihreä runko ja vihreä valo' },
        { id: 'a', label: 'Keltainen runko ja keltainen valo' },
        { id: 'd', label: 'Punavalkoinen runko ja valkoinen valo' },
      ],
      correctOptionId: 'a',
      explanation:
        'Erikoismerkki on keltainen ja sen valo on keltainen. Huippumerkkinä on keltainen X. Se merkitsee merikortissa mainittua erityisaluetta, kuten kaapelia, putkistoa, vesiviljelyä tai harjoitusaluetta.',
    },
    {
      id: 'iala-8',
      hint: 'Loistojen rytmit',
      prompt: "Loiston tunnus on 'Vl(3) 7s'. Mitä se kertoo valon rytmistä?",
      options: [
        { id: 'b', label: 'Kolmen sekunnin välähdys 7 kertaa minuutissa' },
        { id: 'c', label: 'Seitsemän välähdystä kolmen sekunnin välein' },
        { id: 'd', label: 'Valo palaa 3 sekuntia ja on pimeänä 7 sekuntia' },
        {
          id: 'a',
          label: 'Kolme välähdystä ryhmässä, jakso toistuu 7 sekunnin välein',
        },
      ],
      correctOptionId: 'a',
      explanation:
        'Suluissa oleva luku kertoo ryhmän välähdysten määrän ja perässä oleva aika koko jakson pituuden. Vl(3) 7s tarkoittaa siis kolmea nopeaa välähdystä, joiden jälkeen seuraa pimeä jakso, ja koko kuvio toistuu 7 sekunnin välein.',
    },
    {
      id: 'iala-9',
      hint: 'IALA-alueet',
      prompt: 'Mikä on ainoa ero IALA-A- ja IALA-B-alueiden välillä?',
      options: [
        {
          id: 'a',
          label: 'Punaisen ja vihreän värin sijoittelu lateraalimerkeissä',
        },
        { id: 'b', label: 'Kardinaalimerkkien huippumerkkien suunta' },
        { id: 'c', label: 'Turvavesimerkin väritys' },
        { id: 'd', label: 'Loistojen välähdysrytmit' },
      ],
      correctOptionId: 'a',
      explanation:
        'Kardinaali-, turvavesi-, erikois- ja vaaramerkit ovat samanlaisia kaikkialla. Ainoastaan lateraalimerkkien punainen ja vihreä vaihtavat paikkaa: IALA-A-alueella punainen on paapuurissa, IALA-B-alueella styyrpuurissa.',
    },
    {
      id: 'iala-10',
      hint: 'Loistojen rytmit',
      prompt:
        'Mikä loistotyyppi palaa kauemmin kuin on pimeänä, eli lyhyt pimennys katkaisee tasaisen valon?',
      options: [
        { id: 'b', label: 'Välkkyvä (Vl)' },
        { id: 'a', label: 'Pimennetty (Pim)' },
        { id: 'c', label: 'Nopea (Np)' },
        { id: 'd', label: 'Pitkä välkky (PVl)' },
      ],
      correctOptionId: 'a',
      explanation:
        'Pimennetty loisto on välkkyvän vastakohta: valoa on enemmän kuin pimeyttä. Sitä käytetään yleisesti johtoloistoissa ja sektorivaroitusloistoissa.',
    },
  ],
}
