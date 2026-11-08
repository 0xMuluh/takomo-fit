import { FITTER_NAME as N } from "../config";
import type { Messages } from "./en";

type Dir = "left" | "right" | "both";
const DIR: Record<Dir, string> = { left: "vasemmalle", right: "oikealle", both: "molempiin suuntiin" };
const SIDE = { left: "vasemmalle", right: "oikealle" };

const fi: Messages = {
  meta: {
    title: "Takomo Fit",
    pages: { live: "Takomo Fit", guided: "Ohjattu Takomo Fit", spec: "Sinun Takomo Fit", phone: "Puhelimen kamera" },
    description: `Täysi Takomo 7-raudan sovitus puhelimellasi ${N}n, Takomon tekoälysovittajan, kanssa: suositus, `
      + "perustelut ja kuinka varmoja olemme.",
  },
  switcher: { language: "Kieli", units: "Yksiköt", imperial: "yd · mph", metric: "m · km/h" },
  header: { findFit: "Takomo Fit", store: "Takomo-kauppa", faq: "UKK ja tuki" },
  common: {
    back: "Takaisin", send: "Lähetä", done: "Valmis", skip: "Ohita", cancel: "Peruuta", continue: "Jatka", useThis: "Käytä tätä",
    retake: "Ota uusi", notSure: "En ole varma", undo: "Kumoa", restart: "Aloita alusta", measuring: "Mitataan",
    dismiss: "Sulje", eg: (v) => `esim. ${v}`, and: " ja ", or: (a, b) => `${a} tai ${b}`,
    minutes: (n) => `~${n} min`,
  },
  fitter: { role: "Takomon tekoälysovittaja", initial: N[0], aiNotice: `${N} on tekoäly, ei ihminen.` },

  home: {
    kicker: "Takomo Golf",
    title: "Sovittaja taskussasi.",
    intro: `Tapaa ${N}, Takomon tekoälysovittaja. Live-sovitus 7-raudalle milloin ja missä vain.`,
    steps: [
      [`Juttele ${N}n kanssa`, "Puhuen tai kirjoittaen."],
      ["Mittaukset", "Puhelimen kameralla."],
      ["Suositus rakentuu", "Pää, varsi, pituus, lie, grippi."],
      ["Kysy mitä vain", "Miksi tämä varsi? Entä jos…?"],
    ],
    start: "Aloita live-sovitus",
    guided: "Vastaa kysymyksiin napauttamalla",
    privacy: "Kuvat ja videot pysyvät puhelimessasi.",
    needs: "3–6 min · 7-rauta + pankkikortti",
    example: "Esimerkkisuositus",
  },

  part: { head: "Mailanpää", shaft: "Varsi", length: "Pituus", lie: "Lie-kulma", grip: "Grippi", purchase: "Kokoonpano" },
  spec: {
    lie: "Lie", hand: "Käsi", left: "Vasen", right: "Oikea", stock: "Vakio", custom: "Custom", standard: "Vakio",
    inch: (v) => `${v} tuumaa`,
    upright: (v) => `${v} pystympi`,
    flat: (v) => `${v} loivempi`,
    grip: { standard: "Standard", midsize: "Midsize", oversize: "Oversize" },
    flex: { lady: "Ladies", senior: "Senior", regular: "Regular", stiff: "Stiff", "x-stiff": "X-Stiff" },
    material: { steel: "Teräs", graphite: "Grafiitti" },
    improves: { lie: "lie-kulma", grip: "grippi", flex: "varren jäykkyys", head: "mailanpää", shaft: "varsi", length: "pituus" },
  },
  certainty: { confirmed: "Varmistettu", likely: "Todennäköinen", check: "Tarkistettava" },
  summary: {
    settled: (list) => `Varmat: ${list}.`,
    close: (list) => `Vielä tarkistettavana: ${list}.`,
  },
  testTitle: {
    "ball-line test": "Pallolinjatesti",
    "hand photo with a bank card": "Käsikuva kortin kanssa",
    "slow-motion swing video": "Hidastettu svingivideo",
    "launch monitor upload": "Launch monitor -sessio",
  },
  missing: {
    score: "tyypillinen tulos", carry: "7-raudan lentomatka tai mailanpään nopeus", flight: "lentorata",
    tempo: "tempo", age: "ikä", sex: "sukupuoli", height: "pituus",
  },

  live: {
    kind: {
      body: "Kokovartalokuva", hand: "Käsikuva", swing: "Svingi", ball_line: "Pallolinjatesti",
      launch_monitor: "Launch monitor -sessio",
    },
    kindHint: {
      launch_monitor: "Kuva, video, TrackMan-linkki tai CSV",
      swing: "Kuvaa tai lataa svingi",
      body: "Päästä varpaisiin: pituus ja lie",
      hand: "Pankkikortin vieressä: gripin koko",
      ball_line: "Tussiviiva pallossa: lie-kulma",
    },
    attach: "Lisää lukemat tai mittaus",
    opened: (what) => `Avattu: ${what}`,
    dropped: `Yhteys ${N}in katkesi.`,
    measuredNoUpdate: "Mittaus onnistui, mutta sovitusta ei voitu päivittää. Tarkista yhteytesi.",
    busy: "Juuri nyt sovitetaan monia golfareita. Yritä uudelleen muutaman minuutin päästä.",
    micNeeded: `${N} tarvitsee mikrofonin. Salli se selaimen asetuksista tai valitse kirjoittaminen.`,
    unreachable: `Emme saaneet yhteyttä ${N}in. Tarkista yhteytesi ja yritä uudelleen.`,
    liveFitting: "Live", ended: "Sessio päättyi", end: "Lopeta",
    seeFull: "Näytä koko sovitus", again: `Juttele ${N}n kanssa uudelleen`, resultsTitle: "Sovituksesi tähän asti",
    intro: {
      title: "Live-sovituksesi",
      body: `Studiosovitus ${N}n kanssa: ensin pelisi, sitten mittaukset kameralla.`,
      bullets: ["3–6 min", "7-rauta + pankkikortti", "Tilaa svingata", "Lopeta milloin vain"],
      welcomeBack: (name) => `Tervetuloa takaisin${name ? `, ${name}` : ""}.`,
      remembers: `${N} muistaa, mihin jäitte.`,
      continueText: "Jatka kirjoittamalla",
      unavailable: "Live-sovittaja ei ole vielä käytössä täällä.",
      unavailableLink: "Tee ohjattu sovitus sen sijaan",
      unavailableTail: "; se käyttää samaa laskentaa.",
      connecting: `Yhdistetään ${N}in…`,
      startNew: "Aloita uusi sovitus",
      start: "Aloita puhuminen",
      type: "Kirjoitan mieluummin",
      guided: "Tai vastaa kysymyksiin napauttamalla",
      privacy: "Kuvat ja videot pysyvät puhelimessasi. Äänesi käsittelee puhepalvelumme.",
    },
    hud: {
      yourSpec: "Suosituksesi",
      buildsHere: "Rakentuu tähän keskustelun aikana.",
      stillNeeds: (list) => `${N} tarvitsee vielä: ${list}.`,
      answersProgress: (n) => `${n}/7 vastausta`,
      confirmedProgress: (n, total) => `${n}/${total} varmistettu`,
    },
    joining: `${N} liittyy…`,
    micOff: "Mikrofoni pois",
    talking: `${N} puhuu. Puhu keskeyttääksesi.`,
    listening: "Kuuntelen…",
    mute: "Mykistä", unmute: "Poista mykistys",
    typeAnswer: "Kirjoita vastauksesi…", orType: "Tai kirjoita tähän…", messageLabel: `Viesti ${N}lle`,
    openFull: "Avaa koko erittely",
  },
  phone: {
    here: "Käytä tätä tietokonetta", phone: "Käytä puhelinta",
    scan: "Skannaa puhelimella",
    scanTip: `Avaa tämän vaiheen puhelimessa. ${N} jatkaa täällä.`,
    waiting: "Odotetaan puhelinta…",
    connected: "Puhelin yhdistetty. Jatka siellä.",
    expired: "Koodi vanheni.", newCode: "Uusi koodi",
    failed: "Koodia ei saatu tehtyä. Käytä tämän tietokoneen kameraa.",
    paired: "Yhdistetty tietokoneeseesi",
    sent: "Lähetetty. Palaa tietokoneelle.",
    sendFailed: "Lähetys ei onnistunut. Tarkista yhteys.", retry: "Yritä uudelleen",
    gone: "Linkki on vanhentunut. Skannaa uusi koodi tietokoneelta.",
  },

  agent: {
    hello: `Moi, olen ${N}, Takomon tekoälysovittaja. Tämä vie noin 3–6 minuuttia kolmessa vaiheessa: 7 nopeaa kysymystä `
      + "pelistäsi, välitön ensiarvio speksistäsi ja valinnaiset mittaukset puhelimen kameralla. Mikä on etunimesi ja "
      + "mitä haet uusilta raudoilta?",
    welcomeBack: (name) => `Tervetuloa takaisin${name ? `, ${name}` : ""}. Täällä taas ${N}. Jatketaan siitä, mihin jäimme.`,
    onFit: (name) => `Hei${name ? ` ${name}` : ""}, täällä ${N}. Sovituksesi on edessäni. Käydäänkö se läpi, vai `
      + "kiinnostaako jokin tietty osa?",
  },

  camera: {
    blocked: "Kameran käyttö on estetty. Salli se selaimen asetuksista ja yritä uudelleen.",
    unavailable: "Kameraa ei voitu avata tällä laitteella.",
    opening: "Avataan kameraa…", flip: "Käännä", flipLabel: "Vaihda kameraa",
  },

  vision: {
    noHand: "Emme löytäneet kättäsi. Aseta se tasaisesti, sormet yhdessä, kokonaan kuvaan.",
    cardEdges: "Emme saaneet selvää kortin reunoista. Aseta se tasaiselle pinnalle ja kohdista se ohjeen mukaan.",
    cardSkew: "Pidä puhelin vaakatasossa pöydän yläpuolella, jotta kortti ei näy vinossa.",
    fingersTogether: "Pidä sormet yhdessä.",
    handImplausible: "Käden pituus ei näytä oikealta. Yritä uudelleen kortti kätesi vieressä.",
    tapCorners: "Napauta kortin kahta vastakkaista kulmaa.",
    noPerson: "Kuvasta ei löytynyt ihmistä. Seiso kokonaan kuvassa ja yritä uudelleen.",
    hidden: "Osa sinusta on piilossa. Pään, molempien käsien ja molempien jalkojen täytyy näkyä selvästi.",
    noHeadTop: "Päälakesi ei näkynyt. Jätä tilaa pään yläpuolelle.",
    armsDown: "Anna molempien käsien roikkua suoraan alas.",
    standStraight: "Seiso suorassa, paino tasaisesti molemmilla jaloilla.",
    phoneLevel: "Pidä puhelin suorassa, ei kallellaan.",
    stepCloser: "Tule lähemmäs, jotta täytät vähintään puolet kuvan korkeudesta.",
    margins: "Jätä vähän tilaa pään yläpuolelle ja jalkojen alapuolelle.",
    bodyImplausible: "Mittaus ei näytä oikealta. Varmista, että kätesi roikkuvat suoraan, ja yritä uudelleen.",
    noBackswing: "Taaksevientiä ei löytynyt. Kuvaa koko svingi lähtöasennosta loppuasentoon.",
    noImpact: "Osumaa ei löytynyt. Jatka kuvaamista, kunnes pallo on lyöty.",
    notInVideo: "Emme nähneet sinua videolla. Kuvaa edestä niin, että koko vartalosi on kuvassa.",
    lostHands: "Kätesi katosivat näkyvistä. Pidä koko vartalosi kuvassa.",
    slowCamera: "Kamera toimii liian hitaasti. Lisää valoa ja yritä uudelleen.",
    notASwing: "Se ei näyttänyt yhdeltä täydeltä svingiltä. Tee täysi, normaali svingi.",
  },

  media: { takePhoto: "Ota kuva", recordVideo: "Kuvaa video", library: "Valitse galleriasta" },
  photoFailed: "Kuvan lukemisessa meni jotain pieleen. Kokeile toista kuvaa.",

  captures: {
    title: {
      body: "Kokovartalokuva", hand: "Käsikuva kortin kanssa", swing: "Svingivideo", ballLine: "Pallolinjatesti",
      radar: "Launch monitor -sessio",
    },
    sets: {
      body: "pituus ja lie-kulma", hand: "gripin koko", swing: "varsi ja tempo", ballLine: "lie-kulma",
      radar: "varsi ja mailanpää",
    },
    needs: {
      body: "Joku pitelemään puhelinta tai ajastin", hand: "Mikä tahansa pankkikortti",
      swing: "7-rauta ja tilaa svingata", ballLine: "Tussi, palloja ja lyöntimatto", radar: "Kuva näytöstä, TrackMan-linkki tai CSV-tiedosto",
    },
    setsYour: (sets, min) => `Määrittää: ${sets} · ${min}`,
    skipped: (title) => `${title} · ohitettu`,
    intro: {
      body: (toeHeel) => "Sovittaja aloittaa pituudestasi ja ranne–lattia-mitastasi; ne määrittävät mailan pituuden "
        + "ja lie-kulman lähtökohdan. Yksi kokovartalokuva antaa minulle molemmat."
        + (toeHeel ? " Se myös kertoo, selittääkö mailan pituus kärki- ja kantaosumasi." : ""),
      hand: (unsure) => "Gripin koko määräytyy kätesi mukaan. Yksi kuva pankkikortin vieressä mittaa sen muutaman "
        + "millimetrin tarkkuudella." + (unsure ? " Et ollut varma hanskasi koosta, joten tämä on tärkeä." : ""),
      swing: (carry, tempo) => "Seuraavaksi katsoisin svingiäsi. Edestä kuvattu video kertoo tempon, ja 240 fps:n "
        + "hidastuksella myös mailanpään nopeuden."
        + (carry || tempo
          ? ` Et ollut varma ${carry && tempo ? "lentomatkastasi etkä temmostasi" : carry ? "lentomatkastasi" : "temmostasi"}, `
            + "joten tämä on hyödyllisin asia, jonka voit tehdä."
          : ""),
      ballLine: (dir) => "Näin sovittaja tarkistaa lie-kulman: miten maila todella kohtaa maan svingatessasi."
        + (dir ? ` Kerroit, että huonot lyöntisi lähtevät ${DIR[dir]}; väärä lie-kulma on yksi mahdollinen syy.` : "")
        + " Tarvitset paikan, jossa voi lyödä palloja.",
      radar: "Jos sinulla tai kaverillasi on launch monitor, kymmenen 7-rautalyöntiä mittaa nopeutesi ja lähtökulmasi "
        + "suoraan. Se on vahvin yksittäinen todiste varren valintaan.",
    },
  },

  body: {
    onDevice: "Mitataan puhelimessasi. Kuva ei lähde puhelimesta.",
    wtf: "Ranne–lattia",
    ofHeight: (pct, height) => `${pct} pituudestasi (${height}). Tämä määrittää mailan pituuden.`,
    retakeAdvice: (issues) => `Käytämme tätä pienemmällä painolla, mutta uusi kuva olisi tarkempi: ${issues}`,
    steps: (room) => [
      "Laita jalkaan kengät, joilla pelaat, ja seiso kovalla lattialla.",
      "Kädet roikkuvat rentoina sivuilla, katse suoraan eteenpäin.",
      `Pyydä jotakuta pitämään puhelinta vyötärön korkeudella ${room} päässä, tai nojaa puhelin johonkin ja käytä ajastinta.`,
      "Koko vartalosi pitää näkyä kuvassa, ja pään yläpuolelle jää vähän tilaa.",
    ],
  },
  hand: {
    steps: [
      "Aseta mikä tahansa pankki-, henkilö- tai kanta-asiakaskortti tasaiselle pöydälle. Ne ovat kaikki samankokoisia.",
      "Aseta hanskakätesi tasaisesti sen viereen, sormet yhdessä, rannetaive näkyvissä.",
      "Pidä puhelinta vaakatasossa suoraan yläpuolella niin, että koko käsi ja kortti täyttävät kuvan.",
    ],
    measured: "Tämän mittasimme.",
    length: "Käden pituus, rannetaipeesta keskisormen päähän",
    setsGrip: "Tämä määrittää gripin koon.",
    retakeAdvice: (issues) => `Uusi kuva olisi tarkempi: ${issues}`,
    markAgain: "Merkitse uudelleen", newPhoto: "Uusi kuva",
  },
  ballLine: {
    prompts: [
      "Napauta lavassa näkyvän tussiviivan alapäätä.",
      "Napauta tussiviivan yläpäätä.",
      "Napauta etureunaa kannan päästä (lähimpänä vartta).",
      "Napauta etureunaa kärjen päästä.",
    ],
    offLine: "Viiva on yli 20° vinossa. Varmista, että napautit ensin viivan päät ja sitten etureunan, ja yritä uudelleen.",
    steps: [
      "Piirrä palloon suora viiva taulutussilla.",
      "Aseta pallo kovalle matolle viiva pystysuorassa mailaa kohti.",
      "Lyö 7-raudalla normaalilla svingilläsi.",
      "Kuvaa lapa läheltä ja suoraan edestä niin, että jälki ja etureuna näkyvät selvästi.",
      "Pyyhi lapa ja toista. Viisi lyöntiä on ihanteellinen; kolme on minimi.",
    ],
    shots: (n) => `Mitattuja lyöntejä: ${n}`,
    average: (v) => `Keskiarvo ${v}. Positiivinen tarkoittaa, että kärki oli ylhäällä osumassa (lie-kulma liian pysty).`,
    photoNext: "Kuvaa seuraava lyönti", photoFirst: "Kuvaa ensimmäinen lyönti",
    use: (n) => `Käytä ${n} lyöntiä`, removeLast: "Poista viimeisin lyönti",
  },
  radar: {
    intro: "Lyö noin kymmenen 7-rautalyöntiä normaalilla svingilläsi, vie sessio sovelluksesta CSV-tiedostona ja lataa se tähän.",
    home: "Kotitutka", homeHint: "Garmin R10, Mevo, Rapsodo, SkyTrak…",
    studio: "Studiomonitori", studioHint: "TrackMan, GCQuad, Foresight…",
    choose: "Valitse CSV-tiedosto", readFailed: "Tiedostoa ei voitu lukea.",
    noColumns: "Tiedostosta ei löytynyt mailanpään nopeuden tai lentomatkan sarakkeita.",
    tooFew: "Tiedostossa pitää olla vähintään kolme 7-rautalyöntiä.",
    found: (n, sevenIron, avg) =>
      `Löytyi ${n} ${sevenIron ? "7-rauta" : ""}lyöntiä${avg ? `, keskimääräinen mailanpään nopeus ${avg}` : ""}.`,
    using: (cols) => `Käytössä: ${cols}`,
    columns: {
      club_speed_mph: "mailanpään nopeus", carry_yd: "lentomatka", launch_angle_deg: "lähtökulma",
      landing_angle_deg: "laskeutumiskulma", dynamic_loft_deg: "dynaaminen loft", attack_angle_deg: "iskukulma",
      face_to_path_deg: "lapa suhteessa rataan", side_yd: "sivupoikkeama", impact_offset_mm: "osumakohta",
      impact_toe_up_deg: "kärki ylhäällä osumassa",
    },
    noClub: "Mailasaraketta ei löytynyt, joten oletimme jokaisen lyönnin olevan 7-raudalla.",
    useSession: "Käytä tätä sessiota",
  },
  swing: {
    steps: (room) => [
      "Kuvaa edestä niin, että koko vartalosi ja maila ovat kuvassa.",
      `Nojaa puhelin lantion korkeudelle noin ${room} päähän.`,
      "Yksi svingi 7-raudalla lähtöasennosta osuman jälkeen.",
      "Hidastus (120 tai 240 fps) on paras. 240 fps:llä voimme mitata myös mailanpään nopeuden.",
    ],
    howFilm: "Miten kuvaat?", normal: "Normaali", slow120: "Hidastus 120", slow240: "Hidastus 240",
    readFailed: "Videota ei voitu lukea. Kuvaa se uudelleen.",
    tracking: "Seurataan svingiäsi puhelimessasi",
    tryAnother: "Kokeile toista videota",
    backswing: "Taaksevienti", downswing: "Alasvienti", ratio: "Suhde",
    alsoSpeed: "Mittaa myös mailanpään nopeus", useTempo: "Käytä tempoa", newVideo: "Uusi video",
    twoFrames: "Merkitse mailanpää kahteen eri kuvaan.",
    implausible: (v) => `Siitä tulee ${v}, mikä ei ole uskottavaa. Merkitse uudelleen napauttamalla mailanpään keskikohtaa.`,
    tapBall: (n) => `Napauta pallon vasenta reunaa ja sitten oikeaa (${n}/2). Pallon tunnettu koko antaa mittakaavan.`,
    stepFrame: "Siirry kuvaan juuri ennen osumaa, jossa mailanpää näkyy terävänä, ja napauta sen keskikohtaa.",
    movedFrame: "Siirryimme yhden kuvan eteenpäin. Napauta mailanpään keskikohtaa uudelleen.",
    prevFrame: "Edellinen kuva", nextFrame: "Seuraava kuva", frameBack: "◀ Kuva", frameFwd: "Kuva ▶",
  },
  liveBody: {
    start: "Nojaa puhelin vyötärön korkeudelle ja peräänny, kunnes näyt kuvassa päästä varpaisiin.",
    notVisible: "En näe sinua vielä. Astu kuvaan.",
    headHands: "Peräänny, jotta näen pääsi ja molemmat kätesi.",
    feet: "Peräänny, jotta näen jalkasi.",
    spaceAbove: "Jätä vähän tilaa pään yläpuolelle.",
    feetEdge: "Jalkasi ovat kuvan reunalla. Peräänny hieman.",
    closer: "Tule vähän lähemmäs puhelinta.",
    holdStill: "Pysy paikallasi…",
    perfect: "Täydellistä. Pysy paikallasi…",
    got: (n, of) => `${n}/${of} mitattu. Pysy juuri noin.`,
    frameFailed: "Kuva ei onnistunut. Pysy paikallasi, niin yritän uudelleen.",
    noClean: "En saanut puhdasta mittausta. Tarkista yllä olevat vinkit ja seiso paikallasi kasvot puhelinta kohti.",
    tips: (room) => [
      "Golfkengät jalassa, kova lattia, kädet roikkuvat rentoina.",
      `Puhelin nojaa vyötärön korkeudella ${room} päässä, tai kaveri pitää sitä suorassa.`,
    ],
    result: (wtf, pct) => `Ranne–lattia: ${wtf} (${pct} pituudestasi).`,
  },
  liveSwing: {
    useLive: "Käytä live-kameraa",
    start: (room) => `Nojaa puhelin lantion korkeudelle noin ${room} eteesi, kasvot kohti, koko vartalo ja maila kuvassa.`,
    result: (b, d, r) => `Taaksevienti ${b}, alasvienti ${d}: tempo ${r}.`,
    swingDone: (n, b, d, of) =>
      `Svingi ${n} valmis: taaksevienti ${b}, alasvienti ${d}. Asetu lähtöasentoon svingiä ${n + 1}/${of} varten.`,
    couldntTime: "En saanut ajoitettua sitä. Asetu uudelleen ja svingaa.",
    headToToe: "Peräänny, jotta näen sinut päästä varpaisiin, kasvot puhelinta kohti.",
    address: "Asetu lähtöasentoon ja pysy hetki paikallasi.",
    ready: "Valmis. Svingaa, kun haluat.",
    swinging: "Svingi käynnissä…",
    tips: [
      "Kasvot puhelinta kohti, koko vartalo ja maila kuvassa. 7-rauta, normaali täysi svingi.",
      "Kolme svingiä. Lyö palloja verkkoon tai tee täysiä harjoitussvingejä, jos tilaa on.",
    ],
    upload: "Onko sinulla hidastettu video? Lataa se; 240 fps:llä se mittaa myös mailanpään nopeuden.",
  },

  notes: {
    wtf: (v) => `Kuvasi mukaan ranne–lattia-mittasi on ${v}.`,
    hand: (v) => `Kätesi pituus rannetaipeesta sormenpäähän on ${v}.`,
    swing: (b, d, r, speed) =>
      `Taaksevientisi kestää ${b} ja alasvientisi ${d}, eli tempo on ${r}${speed ? `, ja mailanpään nopeus on ${speed}` : ""}.`,
    ballLineSquare: "Pallolinjan jäljet ovat suorassa lapaan nähden: maila kohtaa maan tasaisesti.",
    ballLineLean: (v, toe) => `Pallolinjan jäljet kallistuvat keskimäärin ${v} ${toe ? "kärkeä" : "kantaa"} kohti, `
      + `joten vakio lie-kulma on svingillesi liian ${toe ? "pysty" : "loiva"}.`,
    radar: (n, avg) => `${n} lyöntiä${avg ? `, keskimääräinen mailanpään nopeus ${avg}` : ""}.`,
    radarSummary: (source, speed, shots, from) =>
      `${source === "photo" ? "Näyttökuvasta" : source === "video" ? "Videostasi" : source === "report" ? "TrackMan-raportista" : "Tiedostosta"}`
      + (!speed ? "" : from
        ? `: ${from.club}, ${shots === 1 ? "yksi lyönti" : "keskiarvo"} ${from.speed}, 7-raudalla noin ${speed}`
        : `: ${shots === 1 ? "yksi 7-raudan lyönti, mailanpään nopeus" : "7-raudan keskimääräinen mailanpään nopeus"} ${speed}`) + ".",
    added: "Mittaus lisätty.",
  },

  honest: {
    title: "Mitä kerroit, mitä mittasimme",
    said: "Kerroit", measured: "Mittasimme",
    saidCarry: (v) => `7-rautasi lentää ${v}`,
    saidSpeed: (v) => `7-rautasi mailanpään nopeus on ${v}`,
    measuredSpeed: (v, sd) => `7-raudan mailanpään nopeus ${v} (± ${sd})`,
    carryAt: (v, head, loft) => `Se lentää noin ${v} ${head} -7-raudalla${loft ? ` (loft ${loft})` : ""}.`,
    footer: "Lähes jokainen golfari muistaa hyvän lyönnin. Sovituksesi perustuu mitattuun lukuun, joten se sopii "
      + "svingiin, jonka tuot kentälle tavallisena päivänä.",
  },

  lmImport: {
    photo: "Kuva", photoHint: "Mikä tahansa launch monitorin näyttö tai kuvakaappaus",
    video: "Video", videoHint: "Sinä lyömässä, näyttö kuvassa",
    videoTips: "Pidä näyttö kuvassa muutama sekunti jokaisen lyönnin jälkeen.",
    readingVideo: "Luetaan videotasi…",
    videoPrivacy: "Vain pysäytyskuvat luetaan, sitten ne poistetaan.",
    retryVideo: "Kokeile toista videota",
    link: "TrackMan-linkki", linkHint: "TrackManin sähköpostista",
    csv: "CSV", csvHint: "Vienti launch monitorin sovelluksesta",
    photoTips: "Mene lähelle, suoraan edestä. Keskiarvot, jos näyttö näyttää ne.",
    unread: "Ei luettavissa",
    unitQ: "Näytön matkat",
    yards: "Jaardeja", metres: "Metrejä",
    privacy: "Tekoälymme lukee kuvan ja poistaa sen.",
    reading: "Luetaan näyttöäsi…",
    linkLabel: "Liitä raportin linkki",
    fetch: "Hae lukuni", fetching: "Haetaan raporttiasi…",
    check: "Tarkista, että luvut vastaavat näyttöäsi",
    club: "Maila",
    shots: (n) => (n ? `${n} lyöntiä` : "Session keskiarvo"),
    oneShot: "Yksi lyönti",
    spread: (v) => `± ${v}`,
    notes: {
      single_shot: "Yksi lyönti, ei keskiarvo, joten se painaa vähemmän.",
      units_guessed: "Yksiköitä ei voitu lukea. Tarkista jaardit tai metrit.",
      carry_implausible: "Lentomatka ja nopeus eivät täsmää. Tarkista näyttö.",
      smash_implausible: "Pallon ja mailan nopeus eivät täsmää.",
      low_res: "Näyttö liian pieni keskiarvoille; käytimme viimeistä lyöntiä.",
      unsure: "Epäselvät luvut jätettiin pois.",
    },
    otherIron: (club, speed) => `${club}: 7-raudalla noin ${speed}. Lentomatkaa ja lähtökulmaa ei käytetä.`,
    notIron: "Vain raudat (5–9).",
    unknownClub: "Millä mailalla lyönnit lyötiin?",
    use: "Kyllä, käytä näitä lukuja", retry: "Kokeile toista kuvaa", tryLink: "Kokeile toista linkkiä",
    errors: {
      not_configured: "Kuvien luku ei ole käytössä. Käytä TrackMan-linkkiä tai CSV:tä.",
      unreadable: "Ei voitu lukea. Kokeile terävämpää kuvaa suoraan edestä.",
      no_numbers: "Mailanpään nopeutta tai lentomatkaa ei löytynyt.",
      implausible: "Ei näytä rautasessiolta.",
      bad_image: "Tiedostoa ei voi avata.",
      provider: "Lukija ei vastannut. Yritä uudelleen.",
      not_trackman_link: "Vain TrackMan-linkit toimivat. Muista merkeistä lähetä kuva tai video.",
      no_screen: "Launch monitorin näyttöä ei löytynyt. Svingivideo? Käytä + › Svingi.",
      video_unclear: "Yksikään lyönti ei ollut tarpeeksi selvä. Kuvaa lähempää.",
      report_not_found: "Raporttia ei löytynyt. Kopioi koko linkki.",
      report_private: "Raportti on yksityinen. Lähetä kuva.",
      rate: "Liian monta yritystä. Yritä myöhemmin.",
      generic: "Jokin meni pieleen.",
      video_codec: "Selain ei voi toistaa videota. Kokeile puhelimesta, jolla kuvasit.",
    },
    clubs: {
      "4i": "4-rauta", "5i": "5-rauta", "6i": "6-rauta", "7i": "7-rauta", "8i": "8-rauta", "9i": "9-rauta",
      pw: "pitching wedge", gw: "gap wedge", sw: "sand wedge", lw: "lob wedge", hybrid: "hybridi", wood: "väylämetsä",
      driver: "draiveri",
    },
  },

  interview: {
    scores: ["Alle 71", "71–77", "78–84", "85–92", "Yli 92"],
    rounds: ["Alle 10", "10–30", "31–50", "Yli 50"],
    under: (v) => `Alle ${v}`,
    over: (v) => `Yli ${v}`,
    chars: {
      forgiveness: "Anteeksiantavuus", distance: "Pituus", "forged feel": "Taottu tuntuma",
      "distance control": "Pituuskontrolli", workability: "Muotoiltavuus", "less offset": "Vähemmän offsetia",
      "more offset": "Enemmän offsetia",
    },
    misses: {
      left: "Vasemmalle", right: "Oikealle", fat: "Pohjaan (maa ensin)", thin: "Ohut", toe: "Kärjestä",
      heel: "Kannasta",
    },
    missComment: {
      start: "Lähtösuunta johtuu osittain lie-kulmasta, joten tarkistamme, miten mailasi kohtaa maan.",
      toeHeel: "Kärki- ja kantaosumat johtuvat osittain mailan pituudesta; vartalokuvasi tarkistaa sen.",
      fatThin: "Pohjat ja ohuet ovat enimmäkseen tekniikkaa, mutta varmistan, ettei mailan pituus pahenna niitä.",
    },
    say: {
      hand: `Hei, olen ${N}, Takomon tekoälysovittaja. Tehdään tämä kuin studiosovitus: ensin muutama kysymys `
        + "pelistäsi, sitten mittaan sinut puhelimellasi, ja näet suosituksesi tarkentuvan matkan varrella. "
        + "Aluksi: kummalla kädellä pelaat?",
      score: "Mikä on tyypillinen tuloksesi 18 reiällä? Tavallinen kierros, ei paras päiväsi.",
      rounds: "Ja suunnilleen montako kierrosta pelaat vuodessa?",
      carry: "Kuinka pitkälle normaali, puhdas 7-rautalyöntisi lentää ilmassa? Vain lentomatka, ei vierintää.",
      speed: "Hienoa. Mikä on 7-rautasi mailanpään nopeus?",
      carryRange: "Ei hätää, useimmat golfarit eivät ole varmoja. Mikä haarukka kuulostaa lähimmältä? Mittaan sen kunnolla myöhemmin.",
      carryCheck: (dist, long, score) => `Lentomatka ${dist} on ${long ? "pidempi" : "lyhyempi"} kuin useimmilla `
        + `golfareilla, joiden tyypillinen tulos on ${score}. Omat arviot menevät usein pieleen, joten tarkistetaan.`,
      club: "Millä 7-raudalla pelaat nyt? Loftit vaihtelevat paljon merkkien välillä. Jotkin modernit 7-raudat ovat "
        + "4–5° vahvempia kuin meidän, ja siksi ne lentävät pidemmälle. Jos tiedät loftin, voin verrata suoraan.",
      misses: "Minne huonot 7-rautalyöntisi yleensä menevät? Valitse kaikki sopivat.",
      flight: "Miten 7-rautasi yleensä lentää?",
      tempo: "Millaiseksi kuvailisit svingisi tempoa?",
      priorities: (tempoUnsure) => (tempoUnsure ? "Ei haittaa, mittaan tempon videolta. " : "")
        + "Mitä haluat raudoiltasi eniten? Valitse enintään kolme, tärkein ensin.",
      body: "Lopuksi muutama tieto mittauksia varten.",
      glove: "Tiedätkö hanskasi koon?",
    },
    rightHanded: "Oikeakätinen", leftHanded: "Vasenkätinen",
    isCarry: "Se on lentomatka, ilmassa", isCarryEcho: "Se on lentomatka", includesRoll: "Siihen sisältyy vierintää",
    thatsRight: "Pitää paikkansa",
    flight: { low: "Matala", mid: "Keskikorkea", high: "Korkea" },
    flightHint: { low: "Lattea, suora", mid: "Siltä väliltä", high: "Nousee jyrkästi" },
    tempo: { smooth: "Rauhallinen", moderate: "Kohtalainen", quick: "Nopea" },
    tempoHint: { smooth: "Kiireetön, tasainen", moderate: "Siltä väliltä", quick: "Nopea taakse ja läpi" },
    about: (v) => `Noin ${v}`,
    carryIn: (unit) => `Lentomatka (${unit})`,
    yards: "jaardit", metres: "metrit",
    knowSpeed: "Tiedän svinginopeuteni", knowSpeedEcho: "Tiedän mailanpään nopeuteni",
    clubPlaceholder: "Merkki ja malli, esim. Ping G425",
    myClub: "Oma 7-rautani", loftUnknown: "loft ei tiedossa", loftAria: "7-raudan loft asteina", loftUnit: "° loft",
    ifKnown: "Jos tiedät", ratherNot: "En halua kertoa",
    noPattern: "Ei selvää kaavaa",
    noPreference: "Ei toivetta", noStrongPreference: "Ei vahvaa toivetta",
    male: "Mies", female: "Nainen", age: "Ikä", years: "vuotta",
    height: "Pituus golfkengissä", heightCm: "Pituus senttimetreinä", heightFt: "Pituus, jalat",
    heightIn: "Pituus, tuumat",
    changeLast: "Muuta viimeisintä vastaustani",
  },

  session: {
    noChange: "Tämä vahvistaa sen, mitä minulla jo oli, joten mikään ei muutu.",
    changes: (part, from, to) => `${part} vaihtuu: ${from} → ${to}.`,
    stays: (part, to, cert, pct) => `${part} pysyy: ${to}, nyt ${cert} (${pct}).`,
    refitFailed: "En saanut päivitettyä sovitustasi. Yritä uudelleen.",
    updatedRead: (summary) => `Päivitin sovituksesi uusilla vastauksillasi. ${summary}`,
    firstRead: (head, shaft, summary) => `Ensimmäinen arvioni: ${head} ja varsi ${shaft}. ${summary} Sen verran `
      + "pystyn päättelemään pelkistä vastauksistasi. Mitataan nyt, niin näet suosituksen tarkentuvan.",
    brand: "Takomo Fit",
    talkInstead: `Juttele mieluummin ${N}n kanssa`,
    startOver: "Aloita alusta",
    backToMeasuring: "Takaisin mittauksiin",
    firstReadBusy: "Kokoan ensimmäistä arviotani",
    changeAnswers: "Muuta vastauksiani",
    redo: "Tee uudelleen", doNow: "Tee nyt",
    expect: (part, a, b) => `Odotan varmuuden (${part}) nousevan: ${a} → noin ${b}.`,
    updating: "Päivitetään sovitustasi",
    start: "Aloita", skipForNow: "Ohita toistaiseksi",
    allDone: (did) => (did ? "Siinä kaikki, mitä mittaisin kotona. " : "Ei hätää, voimme mitata myöhemmin. "),
    skipRest: "Ohita loput ja näytä sovitus",
    seeFull: "Näytä koko sovitus",
    soFar: "Suosituksesi tähän asti", updatingShort: "· päivitetään…",
    closeCalls: (n) => `${n} tarkistettavana`,
    allSettled: "Kaikki varmoja",
  },

  result: {
    notFound: "Sovitusta ei löytynyt. Se on ehkä vanhentunut.",
    addFailed: "Mittausta ei voitu lisätä.",
    startNew: "Aloita uusi sovitus",
    loading: "Ladataan sovitustasi",
    kicker: "Sinun Takomo 7-rautasi",
    buyStock: "Osta vakiomallina", orderCustom: "Tilaa custom", returns: "30 päivän palautus", madeToOrder: "Tehdään tilauksesta",
    stockChance: (p) => `Todennäköisyys, että vakiosetti on juuri sitä, mitä svingisi vaatii: ${p}`,
    customTitle: "Mittauksesi puoltavat räätälöityä settiä",
    stockTitle: "Vakiosetti sopii svingiisi",
    toCheck: (n, list) => `${n === 1 ? "Yksi asia" : `${n} asiaa`} tarkistettavana: ${list}.`,
    allConfirmed: "Kaikki osat on varmistettu.",
    nextStep: (test) => `Seuraava askel: ${test}`,
    whyEach: "Miksi kukin osa",
    settle: "Varmista loput",
    settleIntro: "Järjestetty sen mukaan, kuinka paljon kukin testi tarkentaisi suositustasi, laskettu ennen kuin teet sen.",
    expected: "odotettu",
    more: "Lisää mittauksia",
    runnerUp: "Toiseksi paras:",
    added: (title) => `${title} lisätty`,
    agrees: "Tämä vahvistaa aiemman, joten suosituksesi pysyy samana.",
    orderOnTakomo: (name) => `Tilaa ${name} osoitteesta takomogolf.com`,
    buyShort: "Tilaa",
    copySpec: "Kopioi speksini",
    copiedSpec: "Speksi kopioitu",
  },

  compare: {
    title: "Vertailu",
    of5: (n) => `${n}/5`,
    notKnown: "Ei tiedossa", yourCurrent: "Nykyinen mailasi",
    estimate: (v) => `${v} (oma arviosi)`,
    loft: "7-raudan loft", carry: "Lentomatka",
    yourVs: (name) => `Oma 7-rautasi vs. ${name}`,
    moreLoft: (d) => `Meidän mallissamme on ${d} enemmän loftia, joten samalla svingillä pallo lähtee korkeammalle, `
      + "laskeutuu pehmeämmin ja lentää hieman lyhyemmän matkan. Kyse on loftista, ei menetetystä nopeudesta.",
    lessLoft: (d) => `Meidän mallissamme on ${d} vähemmän loftia, joten samalla svingillä pallo lentää matalammalta ja pidemmälle.`,
    sameLoft: "Loftit ovat suunnilleen samat, joten odota samankaltaista pituutta.",
    yoursLonger: (loft) => "Jos nykyinen 7-rautasi lentää pidemmälle, sen loft on luultavasti vahvempi: monissa "
      + `moderneissa game improvement -7-raudoissa on useita asteita vähemmän kuin meidän ${loft}. Kyse on loftista, ei menetetystä nopeudesta.`,
    topTwo: "Kaksi parasta mailanpäätä",
    rating: {
      forgiveness: "Anteeksiantavuus", distance: "Pituus", workability: "Muotoiltavuus", distance_control: "Pituuskontrolli",
    },
    forgedFeel: "Taottu tuntuma", no: "Ei", offset: "Offset", builtFor: "Tehty tuloksille", yourCarry: "Lentomatkasi",
    rightForYou: "Sopii sinulle",
    rightNote: "”Sopii sinulle” kertoo, kuinka usein kukin mailanpää nousee kärkeen, kun huomioidaan kaikki, mistä emme vielä ole varmoja.",
    shaftsTitle: "Varresi vs. toiseksi paras",
    flex: "Jäykkyys", weight: "Paino", material: "Materiaali", launch: "Lentorata", suitsTempo: "Sopii tempolle",
    any: "kaikille",
    launchLevel: { low: "matala", mid: "keskikorkea", high: "korkea" },
    tempoLevel: { smooth: "rauhallinen", moderate: "kohtalainen", quick: "nopea", any: "mikä tahansa" },
    shaftLine: (model, launch, tempo) =>
      `${model}: ${[launch && `lentorata ${launch}`, tempo ? `sopii, kun tempo on ${tempo}` : "sopii kaikille tempoille"].filter(Boolean).join(", ")}.`,
    stiffer: (name) => `${name} on jäykempi: se lentäisi matalammalta, vähemmällä spinillä ja tuntuisi kovemmalta.`,
    softer: (name) => `${name} on pehmeämpi: se lähtisi korkeammalle, spinnaisi enemmän ja tuntuisi elävämmältä.`,
    heavier: (model, g) => `${model} on ${g} painavampi, mikä antaa hallitumman tuntuman.`,
    lighter: (model, g) => `${model} on ${g} kevyempi, mikä tekee svingaamisesta helpompaa.`,
  },

  whatIf: {
    title: "Entä jos…",
    intro: "Katso, miten suosituksesi muuttuisi, jos svingisi tai kehosi olisi erilainen.",
    speed: "7-raudan nopeus", height: "Pituus", flight: "Lentorata", tempo: "Tempo",
    show: "Näytä", running: "Lasketaan sovitusta uudelleen", failed: "Se ei onnistunut. Yritä uudelleen.",
    same: "Suosituksesi pysyisi samana.",
    now: (v) => `(nyt ${v})`,
    saidSpeed: (said, used) => `Sanoit ${said}; sovitus käyttää arvoa ${used}.`,
    saidCarry: (said, used) => `Ilmoittamastasi ${said} lentomatkasta sovitus käyttää nopeutta ${used}.`,
  },

  ask: {
    title: `Kysy ${N}lta`,
    intro: "Vastaukset tulevat suoraan sovituksesi taustalla olevista luvuista.",
    whyHead: (name) => `Miksi ${name}?`,
    whyShaft: "Miksi tämä varsi?",
    whyLie: (v) => `Miksi lie-kulma ${v.toLowerCase()}?`,
    whyLength: (v) => `Miksi pituus ${v.toLowerCase()}?`,
    grip: "Miten gripin koko valittiin?",
    stockCustom: "Vakio vai custom?",
    next: "Mitä minun pitäisi tehdä seuraavaksi?",
    sure: (p) => `Varmuuteni on ${p}.`,
    alternative: (v, p) => `Vaihtoehto on ${v}, todennäköisyys ${p}.`,
    missesLie: (dir, upright, flat) =>
      `Kerroit, että huonot lyöntisi lähtevät ${DIR[dir]}. Jos lie-kulma on sinulle liian pysty, pallo lähtee `
      + `${SIDE[upright]}; liian loiva, ${SIDE[flat]}. Svingirata tekee saman, joten vain pallolinjatesti kertoo, `
      + "onko syy mailassa vai svingissä.",
    nextTest: (title, how) => `${title}. ${how}`,
    improve: (part, a, b) => `Sen pitäisi nostaa varmuutta (${part}): ${a} → noin ${b}.`,
    nothingElse: "Mikään muu ei muuttaisi tätä sovitusta. Olet valmis tilaamaan.",
    rather: "Haluatko mieluummin puhua sen läpi?",
  },

  voice: {
    dropped: "Ääniyhteys katkesi.",
    notOn: "Äänisovittaja ei ole käytössä tällä palvelimella.",
    mic: "Tarvitsemme mikrofonin käyttöoikeuden puhumiseen. Salli se selaimen asetuksista ja yritä uudelleen.",
    failed: `Emme saaneet ${N}a käynnistettyä. Yritä uudelleen.`,
    talking: `${N} puhuu`, listening: "Kuuntelen…", connecting: "Yhdistetään…", talkThrough: "Puhu se läpi",
    hint: "Kysy, miksi jokin osa valittiin, mikä muuttuu, jos olet pidempi tai svingaat nopeammin, tai miten kaksi "
      + "mailanpäätä eroavat. Jokainen vastaus perustuu sovitukseesi, ei arvailuun.",
    end: "Lopeta keskustelu", talk: `Juttele ${N}n kanssa`,
  },
};

export default fi;
