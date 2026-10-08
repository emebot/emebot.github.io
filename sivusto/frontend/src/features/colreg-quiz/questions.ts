import type { QuizDefinition } from '../../components/quiz/types'

export const colregQuiz: QuizDefinition = {
  eyebrow: 'Meriteiden säännöt — COLREG',
  accentLights: ['#ef4444', '#22c55e', '#f8fafc'],
  title: 'COLREG-tietovisa',
  description:
    'Testaa, tunnistatko alusten kulkuvalot ja tiedätkö kumpi alus väistää. Saat jokaisesta vastauksesta perustelun heti.',
  questions: [
    {
      id: 'colreg-1',
      hint: 'Kulkuvalot',
      prompt:
        'Näet pimeällä edessäsi sekä punaisen että vihreän sivuvalon ja niiden yläpuolella valkoisen valon. Mitä se kertoo?',
      options: [
        { id: 'a', label: 'Alus tulee suoraan kohti' },
        { id: 'b', label: 'Alus menee poispäin' },
        { id: 'c', label: 'Alus on ankkurissa' },
        { id: 'd', label: 'Alus risteää oikealta vasemmalle' },
      ],
      correctOptionId: 'a',
      explanation:
        'Molemmat sivuvalot näkyvät vain suoraan edestä. Punainen on aluksen paapuurissa ja vihreä styyrpuurissa, joten alus on tulossa kohti — kyseessä on vastaantulotilanne.',
    },
    {
      id: 'colreg-2',
      hint: 'Väistämissäännöt',
      prompt:
        'Kaksi konealusta kohtaa suoraan vastakkain. Mitä sääntö 14 edellyttää?',
      options: [
        { id: 'b', label: 'Molemmat kääntyvät vasemmalle eli paapuuriin' },
        { id: 'a', label: 'Molemmat kääntyvät oikealle eli styyrpuuriin' },
        { id: 'c', label: 'Pienempi alus väistää aina' },
        { id: 'd', label: 'Kumpikaan ei muuta kurssia' },
      ],
      correctOptionId: 'a',
      explanation:
        'Vastaantulotilanteessa molemmat alukset kääntävät kurssiaan oikealle, jolloin ne ohittavat toisensa paapuuri paapuuria vasten. Sääntö on symmetrinen: kumpikaan ei jää odottamaan toisen liikettä.',
    },
    {
      id: 'colreg-3',
      hint: 'Väistämissäännöt',
      prompt: 'Kaksi konealusta risteää. Kumpi väistää sääntö 15:n mukaan?',
      options: [
        {
          id: 'b',
          label: 'Se, jolla toinen alus on omalla paapuurin puolella',
        },
        { id: 'c', label: 'Nopeampi alus' },
        {
          id: 'a',
          label: 'Se, jolla toinen alus on omalla styyrpuurin puolella',
        },
        { id: 'd', label: 'Se, joka havaitsi toisen ensin' },
      ],
      correctOptionId: 'a',
      explanation:
        'Risteävässä tilanteessa väistää se alus, jolla toinen on oikealla eli styyrpuurin puolella — se näkee toisen punaisen sivuvalon. Väistämisen tulee olla selvä ja ajoissa tehty.',
    },
    {
      id: 'colreg-4',
      hint: 'Kulkuvalot',
      prompt: 'Mitkä valot purjealus näyttää purjeilla kulkiessaan?',
      options: [
        { id: 'b', label: 'Sivuvalot, perävalo ja mastovalo' },
        { id: 'c', label: 'Pelkkä ympärinäkyvä valkoinen valo' },
        { id: 'd', label: 'Kaksi punaista ympärinäkyvää valoa' },
        { id: 'a', label: 'Sivuvalot ja perävalo, ei mastovaloa' },
      ],
      correctOptionId: 'a',
      explanation:
        'Purjealus näyttää vain sivuvalot ja perävalon. Valkoinen mastovalo kuuluu konealukselle, joten sen puuttuminen erottaa purjealuksen konealuksesta. Jos purjealus käyttää konetta, se on konealus ja näyttää myös mastovalon.',
    },
    {
      id: 'colreg-5',
      hint: 'Valosektorit',
      prompt: 'Kuinka laajalla sektorilla sivuvalot näkyvät?',
      options: [
        { id: 'a', label: '112,5° kummallakin puolella' },
        { id: 'b', label: '225° kummallakin puolella' },
        { id: 'c', label: '135° kummallakin puolella' },
        { id: 'd', label: '360° eli ympärinäkyvästi' },
      ],
      correctOptionId: 'a',
      explanation:
        'Sivuvalot näkyvät 112,5° sektorilla keulasta taaksepäin kummallakin puolella. Mastovalon sektori on 225° ja perävalon 135°. Yhdessä ne kattavat täyden ympyrän.',
    },
    {
      id: 'colreg-6',
      hint: 'Kulkuvalot',
      prompt:
        'Alus näyttää kaksi punaista ympärinäkyvää valoa päällekkäin. Mitä se tarkoittaa?',
      options: [
        { id: 'b', label: 'Ankkurissa oleva alus' },
        { id: 'a', label: 'Ohjailukyvytön alus' },
        { id: 'c', label: 'Kalastava alus' },
        { id: 'd', label: 'Luotsialus' },
      ],
      correctOptionId: 'a',
      explanation:
        'Kaksi punaista ympärinäkyvää valoa päällekkäin tarkoittaa ohjailukyvytöntä alusta, joka ei poikkeuksellisen tilanteen vuoksi pysty väistämään. Jos alus liikkuu vedessä, se näyttää lisäksi sivuvalot ja perävalon.',
    },
    {
      id: 'colreg-7',
      hint: 'Väistämissäännöt',
      prompt:
        'Alus lähestyy toista takaviistosta yli 22,5° peräsuunnan takaa. Kuka väistää?',
      options: [
        { id: 'b', label: 'Ohitettava alus väistää aina' },
        { id: 'c', label: 'Konealus väistää purjealusta' },
        { id: 'a', label: 'Ohittava alus väistää aina' },
        { id: 'd', label: 'Kumpikaan ei väistä' },
      ],
      correctOptionId: 'a',
      explanation:
        'Kyseessä on ohittaminen, ja sääntö 13 on yksiselitteinen: ohittava alus väistää ohitettavaa, kunnes se on selvästi ohitse. Ohittava alus näkee ohitettavan perävalon eikä sivuvaloja.',
    },
    {
      id: 'colreg-8',
      hint: 'Kulkuvalot',
      prompt:
        'Alus näyttää ympärinäkyvän vihreän valon valkoisen yläpuolella. Mikä alus on kyseessä?',
      options: [
        { id: 'b', label: 'Luotsialus' },
        { id: 'c', label: 'Ohjailukyvytön alus' },
        { id: 'd', label: 'Syväyksensä vuoksi rajoittunut alus' },
        { id: 'a', label: 'Troolaava kalastusalus' },
      ],
      correctOptionId: 'a',
      explanation:
        'Vihreä valkoisen päällä tarkoittaa troolaavaa alusta. Muu kuin troolaava kalastusalus näyttää punaisen valkoisen päällä, ja luotsialus valkoisen punaisen päällä.',
    },
    {
      id: 'colreg-9',
      hint: 'Kulkuvalot',
      prompt: 'Alle 50-metrinen alus on ankkurissa. Mitä valoa se näyttää?',
      options: [
        { id: 'a', label: 'Yhtä ympärinäkyvää valkoista valoa keulassa' },
        { id: 'b', label: 'Kahta punaista valoa päällekkäin' },
        { id: 'c', label: 'Sivuvaloja ja perävaloa' },
        { id: 'd', label: 'Mastovaloa ja perävaloa' },
      ],
      correctOptionId: 'a',
      explanation:
        'Ankkurissa oleva alle 50-metrinen alus näyttää yhden ympärinäkyvän valkoisen valon siellä, missä se parhaiten näkyy. Vähintään 50-metrinen alus näyttää lisäksi toisen, alemman valon perässä.',
    },
    {
      id: 'colreg-10',
      hint: 'Kulkuvalot',
      prompt:
        'Näet aluksen perästä pelkän valkoisen valon etkä lainkaan sivuvaloja. Mitä se kertoo?',
      options: [
        { id: 'b', label: 'Alus tulee suoraan kohti' },
        { id: 'a', label: 'Näet aluksen perävalon eli alus menee poispäin' },
        { id: 'c', label: 'Alus on ohjailukyvytön' },
        { id: 'd', label: 'Alus risteää vasemmalta oikealle' },
      ],
      correctOptionId: 'a',
      explanation:
        'Perävalo näkyy 135° sektorilla suoraan takaa, eivätkä sivuvalot ulotu sinne. Pelkkä valkoinen valo ilman sivuvaloja tarkoittaa siis, että katsot alusta takaa ja olet mahdollisesti ohittamassa sitä.',
    },
  ],
}
