import { FITTER_NAME as N } from "../config";
import type { Messages } from "./en";

type Dir = "left" | "right" | "both";
const DIR: Record<Dir, string> = { left: "åt vänster", right: "åt höger", both: "åt båda hållen" };
const SIDE = { left: "vänster", right: "höger" };

const sv: Messages = {
  meta: {
    title: "Takomo Fit",
    pages: { live: "Din Takomo Fit", guided: "Guidad Takomo Fit", spec: "Din Takomo Fit", phone: "Mobilkamera" },
    description: `En komplett Takomo-fitting av ditt 7-järn i mobilen med ${N}, Takomos AI-fitter: specen, `
      + "skälen och hur säkra vi är.",
  },
  switcher: { language: "Språk", units: "Enheter", imperial: "yd · mph", metric: "m · km/h" },
  header: { findFit: "Takomo Fit", store: "Takomo-butiken", faq: "Frågor & support" },
  common: {
    send: "Skicka", done: "Klar", skip: "Hoppa över", cancel: "Avbryt", continue: "Fortsätt", useThis: "Använd detta",
    retake: "Ta om", notSure: "Vet inte", undo: "Ångra", restart: "Börja om", measuring: "Mäter",
    dismiss: "Stäng", eg: (v) => `t.ex. ${v}`, and: " och ", or: (a, b) => `${a} eller ${b}`,
    minutes: (n) => `~${n} min`,
  },
  fitter: { role: "Takomos AI-fitter", initial: N[0], aiNotice: `${N} är en AI, inte en människa.` },

  home: {
    kicker: "Takomo Golf",
    title: "Fittern i fickan.",
    intro: `Möt ${N}, Takomos AI-fitter. En live-fitting av ditt 7-järn i mobilen.`,
    steps: [
      [`Prata med ${N}`, "Med rösten eller i text."],
      ["Bli mätt", "Med mobilens kamera."],
      ["Se din spec växa", "Huvud, skaft, längd, lie, grepp."],
      ["Fråga vad du vill", "Varför det här skaftet? Tänk om…?"],
    ],
    start: "Starta min live-fitting",
    guided: "Klicka dig igenom frågorna",
    privacy: "Foton och videor stannar i din mobil.",
    needs: "15 min · 7-järn + bankkort",
    example: "Exempelspec",
  },

  part: { head: "Klubbhuvud", shaft: "Skaft", length: "Längd", lie: "Lievinkel", grip: "Grepp", purchase: "Bygge" },
  spec: {
    lie: "Lie", hand: "Hand", left: "Vänster", right: "Höger", stock: "Standard", custom: "Special", standard: "Standard",
    inch: (v) => `${v} tum`,
    upright: (v) => `${v} upprätt`,
    flat: (v) => `${v} flat`,
    grip: { standard: "Standard", midsize: "Midsize", oversize: "Oversize" },
    flex: { lady: "Dam", senior: "Senior", regular: "Regular", stiff: "Stiff", "x-stiff": "X-Stiff" },
    material: { steel: "Stål", graphite: "Grafit" },
    improves: { lie: "lie", grip: "grepp", flex: "skaftets flex", head: "klubbhuvud", shaft: "skaft", length: "längd" },
  },
  certainty: { confirmed: "Bekräftad", likely: "Trolig", check: "Att kontrollera" },
  summary: {
    settled: (list) => `Avgjort: ${list}.`,
    close: (list) => `Kvar att kontrollera: ${list}.`,
  },
  testTitle: {
    "ball-line test": "Bollinjetest",
    "hand photo with a bank card": "Handfoto med kort",
    "slow-motion swing video": "Svingvideo i slow motion",
    "launch monitor upload": "Launch monitor-session",
  },
  missing: {
    score: "typiskt resultat", carry: "carry eller klubbhastighet med 7-järn", flight: "bollflykt", tempo: "tempo",
    age: "ålder", sex: "kön", height: "längd",
  },

  live: {
    kind: {
      body: "Helkroppsfoto", hand: "Handfoto", swing: "Sving", ball_line: "Bollinjetest",
      launch_monitor: "Launch monitor-session",
    },
    kindHint: {
      launch_monitor: "Foto, video, TrackMan-länk eller CSV",
      swing: "Filma eller ladda upp en sving",
      body: "Topp till tå: längd och lie",
      hand: "Bredvid ett bankkort: greppstorlek",
      ball_line: "Tuschlinje på en boll: lievinkel",
    },
    attach: "Lägg till siffror eller en mätning",
    opened: (what) => `Öppnade: ${what}`,
    dropped: `Anslutningen till ${N} bröts.`,
    measuredNoUpdate: "Vi mätte det, men kunde inte uppdatera din fitting. Kontrollera din anslutning.",
    busy: "Många golfare fittas just nu. Försök igen om några minuter.",
    micNeeded: `${N} behöver mikrofonen. Tillåt den i webbläsarens inställningar, eller välj att skriva i stället.`,
    unreachable: `Vi kunde inte nå ${N}. Kontrollera din anslutning och försök igen.`,
    liveFitting: "Live-fitting", ended: "Sessionen avslutad", results: "Resultat", end: "Avsluta",
    seeFull: "Visa hela min fitting", again: `Prata med ${N} igen`, resultsTitle: "Din fitting hittills",
    intro: {
      title: "Din live-fitting",
      body: `En studiofitting med ${N}: först ditt spel, sedan mätningar med kameran.`,
      bullets: ["15 min", "7-järn + bankkort", "Plats att svinga", "Avbryt när du vill"],
      welcomeBack: (name) => `Välkommen tillbaka${name ? `, ${name}` : ""}.`,
      remembers: `${N} minns var ni var.`,
      continueText: "Fortsätt i text",
      unavailable: "Live-fittern är inte påslagen här än.",
      unavailableLink: "Gör den guidade fittingen i stället",
      unavailableTail: "; den använder samma motor.",
      connecting: `Ansluter till ${N}…`,
      startNew: "Starta en ny fitting",
      start: "Börja prata",
      type: "Jag skriver hellre",
      guided: "Eller klicka dig igenom frågorna",
      privacy: "Foton och video stannar i din mobil. Rösten hanteras av vår taltjänst.",
    },
    hud: {
      yourSpec: "Din spec",
      buildsHere: "Växer fram här medan ni pratar.",
      stillNeeds: (list) => `${N} behöver fortfarande: ${list}.`,
    },
    joining: `${N} ansluter…`,
    micOff: "Mikrofonen av",
    talking: `${N} pratar. Prata för att avbryta.`,
    listening: "Lyssnar…",
    mute: "Stäng av ljud", unmute: "Slå på ljud",
    typeAnswer: "Skriv ditt svar…", orType: "Eller skriv här…", messageLabel: `Meddelande till ${N}`,
    notNow: "Inte nu",
    openFull: "Öppna hela genomgången",
    newTab: `Öppnas i en ny flik så att ${N} är kvar i samtalet.`,
  },
  phone: {
    here: "Den här datorn", phone: "Min mobil",
    scan: "Skanna med mobilen",
    scanTip: `Öppnar steget i mobilen. ${N} stannar här.`,
    waiting: "Väntar på mobilen…",
    connected: "Mobilen är ansluten. Fortsätt där.",
    expired: "Koden har gått ut.", newCode: "Ny kod",
    failed: "Kunde inte skapa en kod. Använd datorns kamera i stället.",
    paired: "Kopplad till din dator",
    sent: "Skickat. Tillbaka till datorn.",
    sendFailed: "Kunde inte skicka. Kontrollera anslutningen.", retry: "Försök igen",
    gone: "Länken har gått ut. Skanna en ny kod på datorn.",
  },

  agent: {
    hello: `Hej, jag är ${N}, Takomos AI-fitter. Det här tar ungefär 5 minuter i tre steg: 7 snabba frågor om ditt `
      + "spel, en direkt första bedömning av din spec och valfria kameramätningar för att låsa den. Vad heter du i "
      + "förnamn och vad söker du i nya järn?",
    welcomeBack: (name) => `Välkommen tillbaka${name ? `, ${name}` : ""}. ${N} här igen. Vi fortsätter där vi slutade.`,
    onFit: (name) => `Hej${name ? ` ${name}` : ""}, ${N} här. Jag har din fitting framför mig. Vill du att jag går `
      + "igenom den, eller är det någon del du är nyfiken på?",
  },

  camera: {
    blocked: "Kameraåtkomst är blockerad. Tillåt den i webbläsarens inställningar och försök igen.",
    unavailable: "Vi kunde inte öppna kameran på den här enheten.",
    opening: "Öppnar kameran…", flip: "Vänd", flipLabel: "Byt kamera",
  },

  vision: {
    noHand: "Vi hittade inte din hand. Lägg den platt, fingrarna ihop, helt i bild.",
    cardEdges: "Vi kunde inte läsa kortets kanter. Lägg det på en slät yta och rikta in det efter guiden.",
    cardSkew: "Håll mobilen plant ovanför bordet så att kortet inte blir snett.",
    fingersTogether: "Håll ihop fingrarna.",
    handImplausible: "Den handlängden ser inte rätt ut. Försök igen med kortet bredvid handen.",
    tapCorners: "Tryck på två motsatta hörn av kortet.",
    noPerson: "Vi hittade ingen person på fotot. Ställ dig helt i bild och försök igen.",
    hidden: "En del av dig är dold. Huvudet, båda händerna och båda fötterna måste synas tydligt.",
    noHeadTop: "Vi kunde inte se toppen av ditt huvud. Lämna plats ovanför det.",
    armsDown: "Låt båda armarna hänga rakt ner.",
    standStraight: "Stå rak med vikten jämnt på båda fötterna.",
    phoneLevel: "Håll mobilen rak, inte lutad.",
    stepCloser: "Kom närmare så att du fyller minst halva bildens höjd.",
    margins: "Lämna lite plats ovanför huvudet och under fötterna.",
    bodyImplausible: "Den mätningen ser inte rätt ut. Kontrollera att armarna hänger rakt och försök igen.",
    noBackswing: "Ingen baksving hittades. Filma hela svingen från uppställning till avslut.",
    noImpact: "Vi hittade inte träffögonblicket. Fortsätt filma tills bollen är slagen.",
    notInVideo: "Vi kunde inte se dig i videon. Filma framifrån med hela kroppen i bild.",
    lostHands: "Jag tappade dina händer ur sikte. Håll hela kroppen i bild.",
    slowCamera: "Kameran går för långsamt. Tänd mer ljus och försök igen.",
    notASwing: "Det såg inte ut som en hel sving. Gör en hel, vanlig sving.",
  },

  media: { takePhoto: "Ta foto", recordVideo: "Spela in video", library: "Välj från biblioteket" },
  photoFailed: "Något gick fel när fotot lästes. Prova ett annat.",

  captures: {
    title: {
      body: "Helkroppsfoto", hand: "Handfoto med kort", swing: "Svingvideo", ballLine: "Bollinjetest",
      radar: "Launch monitor-session",
    },
    sets: {
      body: "längd och lie", hand: "greppstorlek", swing: "skaft och tempo", ballLine: "lievinkel",
      radar: "skaft och klubbhuvud",
    },
    needs: {
      body: "Någon som håller mobilen, eller självutlösare", hand: "Valfritt bankkort",
      swing: "Ett 7-järn och plats att svinga", ballLine: "Märkpenna, bollar, en slagmatta",
      radar: "Ett foto av skärmen, en TrackMan-länk eller en CSV-fil",
    },
    setsYour: (sets, min) => `Bestämmer ${sets} · ${min}`,
    skipped: (title) => `${title} · överhoppad`,
    intro: {
      body: (toeHeel) => "En fitter börjar med din längd och handled–golv; de bestämmer klubblängden och lien att utgå "
        + "från. Ett helkroppsfoto ger mig båda."
        + (toeHeel ? " Det visar också om klubblängden förklarar dina tå- och hälträffar." : ""),
      hand: (unsure) => "Greppstorleken kommer från din hand. Ett foto bredvid valfritt bankkort mäter den på några "
        + "millimeter när." + (unsure ? " Du var osäker på din handskstorlek, så den här är viktig." : ""),
      swing: (carry, tempo) => "Nästa steg är att se dig svinga. En video framifrån ger mig ditt tempo, och filmat i "
        + "240 fps även din klubbhastighet."
        + (carry || tempo
          ? ` Du var osäker på ${carry && tempo ? "din carry och ditt tempo" : carry ? "din carry" : "ditt tempo"}, `
            + "så det här är det mest användbara du kan göra."
          : ""),
      ballLine: (dir) => "Så här kontrollerar en fitter lien: hur klubban faktiskt möter marken när du svingar."
        + (dir ? ` Du sa att dina dåliga slag startar ${DIR[dir]}; fel lievinkel är en möjlig orsak.` : "")
        + " Du behöver någonstans att slå bollar.",
      radar: "Om du eller en vän har en launch monitor mäter tio slag med 7-järn din hastighet och utgångsvinkel "
        + "direkt. Det är det enskilt starkaste underlaget för ditt skaft.",
    },
  },

  body: {
    onDevice: "Mäter i din mobil. Fotot lämnar den aldrig.",
    wtf: "Handled till golv",
    ofHeight: (pct, height) => `${pct} av din längd på ${height}. Det bestämmer din klubblängd.`,
    retakeAdvice: (issues) => `Vi använder det här med lägre vikt, men ett nytt foto blir noggrannare: ${issues}`,
    steps: (room) => [
      "Ha på dig skorna du spelar i och stå på ett hårt golv.",
      "Armarna hänger avslappnat längs sidorna, blicken rakt fram.",
      `Be någon hålla mobilen i midjehöjd ${room} bort, eller ställ upp den och använd självutlösaren.`,
      "Hela kroppen måste synas på bilden, med lite plats ovanför huvudet.",
    ],
  },
  hand: {
    steps: [
      "Lägg valfritt bank-, id- eller kundkort på ett slätt bord. De är alla lika stora.",
      "Lägg handen du har handske på platt bredvid, fingrarna ihop, handledsvecket synligt.",
      "Håll mobilen plant, rakt ovanför, så att hela handen och kortet fyller bilden.",
    ],
    measured: "Det här mätte vi.",
    length: "Handlängd, handledsveck till långfingerspets",
    setsGrip: "Det bestämmer din greppstorlek.",
    retakeAdvice: (issues) => `Ett nytt foto blir noggrannare: ${issues}`,
    markAgain: "Markera igen", newPhoto: "Nytt foto",
  },
  ballLine: {
    prompts: [
      "Tryck på nedre änden av linjen på bladet.",
      "Tryck på övre änden av linjen.",
      "Tryck på framkanten vid hälen (närmast skaftet).",
      "Tryck på framkanten vid tån.",
    ],
    offLine: "Linjen lutar mer än 20°. Kontrollera att du tryckte på linjens ändar och sedan framkanten, och försök igen.",
    steps: [
      "Rita en rak linje på en boll med en whiteboardpenna.",
      "Lägg den på en hård matta med linjen lodrätt, vänd mot klubban.",
      "Slå ett 7-järn med din vanliga sving.",
      "Fotografera bladet nära och rakt framifrån så att märket och framkanten syns tydligt.",
      "Torka av bladet och upprepa. Fem slag är idealiskt; tre är minimum.",
    ],
    shots: (n) => `Uppmätta slag: ${n}`,
    average: (v) => `Snitt ${v}. Positivt betyder att tån var uppe vid träff (lien för upprätt).`,
    photoNext: "Fotografera nästa slag", photoFirst: "Fotografera första slaget",
    use: (n) => `Använd ${n} slag`, removeLast: "Ta bort senaste slaget",
  },
  radar: {
    intro: "Slå ungefär tio 7-järn med din vanliga sving, exportera sedan sessionen som CSV från appen och ladda upp den här.",
    home: "Hemmaradar", homeHint: "Garmin R10, Mevo, Rapsodo, SkyTrak…",
    studio: "Studiomonitor", studioHint: "TrackMan, GCQuad, Foresight…",
    choose: "Välj CSV-export", readFailed: "Vi kunde inte läsa filen.",
    noColumns: "Vi hittade inga kolumner för klubbhastighet eller carry i filen.",
    tooFew: "Filen måste innehålla minst tre slag med 7-järn.",
    found: (n, sevenIron, avg) =>
      `Hittade ${n} ${sevenIron ? "slag med 7-järn" : "slag"}${avg ? `, snittklubbhastighet ${avg}` : ""}.`,
    using: (cols) => `Använder: ${cols}`,
    columns: {
      club_speed_mph: "klubbhastighet", carry_yd: "carry", launch_angle_deg: "utgångsvinkel",
      landing_angle_deg: "landningsvinkel", dynamic_loft_deg: "dynamisk loft", attack_angle_deg: "anfallsvinkel",
      face_to_path_deg: "blad mot bana", side_yd: "sidled", impact_offset_mm: "träffpunkt",
      impact_toe_up_deg: "tå upp vid träff",
    },
    noClub: "Ingen klubbkolumn hittades, så vi antog att varje slag är med 7-järn.",
    useSession: "Använd den här sessionen",
  },
  swing: {
    steps: (room) => [
      "Filma framifrån med hela kroppen och klubban i bild.",
      `Ställ mobilen i höfthöjd ungefär ${room} bort.`,
      "En sving med 7-järn, från uppställning till efter träff.",
      "Slow motion (120 eller 240 fps) är bäst. I 240 fps kan vi också mäta din klubbhastighet.",
    ],
    howFilm: "Hur filmar du?", normal: "Normal", slow120: "Slow-mo 120", slow240: "Slow-mo 240",
    readFailed: "Vi kunde inte läsa videon. Försök spela in den igen.",
    tracking: "Följer din sving i mobilen",
    tryAnother: "Prova en annan video",
    backswing: "Baksving", downswing: "Nedsving", ratio: "Förhållande",
    alsoSpeed: "Mät även klubbhastighet", useTempo: "Använd tempot", newVideo: "Ny video",
    twoFrames: "Markera klubbhuvudet i två olika bildrutor.",
    implausible: (v) => `Det blir ${v}, vilket inte är rimligt. Markera igen och tryck mitt på klubbhuvudet.`,
    tapBall: (n) => `Tryck på bollens vänstra kant och sedan den högra (${n}/2). Bollens kända storlek ger skalan.`,
    stepFrame: "Stega till en bildruta strax före träff där klubbhuvudet är skarpt och tryck mitt på det.",
    movedFrame: "Vi gick fram en bildruta. Tryck mitt på klubbhuvudet igen.",
    prevFrame: "Föregående bildruta", nextFrame: "Nästa bildruta", frameBack: "◀ Ruta", frameFwd: "Ruta ▶",
  },
  liveBody: {
    start: "Ställ mobilen i midjehöjd och backa tills du syns från huvud till fot.",
    notVisible: "Jag ser dig inte än. Kliv in i bilden.",
    headHands: "Backa så att jag ser ditt huvud och båda händerna.",
    feet: "Backa så att jag ser dina fötter.",
    spaceAbove: "Lämna lite plats ovanför huvudet.",
    feetEdge: "Dina fötter är vid kanten. Backa lite.",
    closer: "Kom lite närmare mobilen.",
    holdStill: "Stå still…",
    perfect: "Perfekt. Stå still…",
    got: (n, of) => `${n} av ${of} klara. Stå kvar precis så.`,
    frameFailed: "Den bildrutan fungerade inte. Stå still så försöker jag igen.",
    noClean: "Jag fick ingen ren mätning. Läs tipsen ovan och stå still vänd mot mobilen.",
    tips: (room) => [
      "Golfskor på, hårt golv, armarna hänger avslappnat.",
      `Mobilen står i midjehöjd ${room} bort, eller en vän håller den rakt.`,
    ],
    result: (wtf, pct) => `Handled till golv: ${wtf} (${pct} av din längd).`,
  },
  liveSwing: {
    useLive: "Använd livekameran i stället",
    start: (room) => `Ställ mobilen i höfthöjd ungefär ${room} framför dig, vänd mot dig, med hela kroppen och klubban i bild.`,
    result: (b, d, r) => `Baksving ${b}, nedsving ${d}: tempo ${r}.`,
    swingDone: (n, b, d, of) =>
      `Sving ${n} klar: ${b} bak, ${d} ner. Ställ upp igen för sving ${n + 1} av ${of}.`,
    couldntTime: "Jag kunde inte tajma den. Ställ upp igen och svinga.",
    headToToe: "Backa så att jag ser dig från huvud till fot, vänd mot mobilen.",
    address: "Ställ upp dig och stå still ett ögonblick.",
    ready: "Klar. Svinga när du vill.",
    swinging: "Svingar…",
    tips: [
      "Vänd mot mobilen, hela kroppen och klubban i bild. Ett 7-järn, en vanlig full sving.",
      "Tre svingar. Slå bollar i ett nät, eller gör fulla provsvingar om du har plats.",
    ],
    upload: "Har du en slow motion-video? Ladda upp den i stället; i 240 fps mäter den även din klubbhastighet.",
  },

  notes: {
    wtf: (v) => `Enligt ditt foto är ditt mått handled till golv ${v}.`,
    hand: (v) => `Din hand mäter ${v} från handledsvecket till fingertoppen.`,
    swing: (b, d, r, speed) =>
      `Din baksving tar ${b} och din nedsving ${d}, ett tempo på ${r}${speed ? `, med klubbhuvudet i ${speed}` : ""}.`,
    ballLineSquare: "Dina bollinjemärken är vinkelräta mot bladet: klubban möter marken plant.",
    ballLineLean: (v, toe) => `Dina bollinjemärken lutar i snitt ${v} mot ${toe ? "tån" : "hälen"}, så en `
      + `standardlie är ${toe ? "för upprätt" : "för flat"} för din sving.`,
    radar: (n, avg) => `${n} slag${avg ? `, snittklubbhastighet ${avg}` : ""}.`,
    radarSummary: (source, speed, shots, from) =>
      `${source === "photo" ? "Från fotot av skärmen" : source === "video" ? "Från din video" : source === "report" ? "Från TrackMan-rapporten" : "Från filen"}`
      + (!speed ? "" : from
        ? `: ${from.club}, ${shots === 1 ? "ett slag" : "snitt"} ${from.speed}, med 7-järn ungefär ${speed}`
        : `: ${shots === 1 ? "ett slag med 7-järn, klubbhastighet" : "snittklubbhastighet med 7-järn"} ${speed}`) + ".",
    added: "Mätning tillagd.",
  },

  honest: {
    title: "Vad du sa, vad vi mätte",
    said: "Du sa", measured: "Vi mätte",
    saidCarry: (v) => `Ditt 7-järn har ${v} carry`,
    saidSpeed: (v) => `Din klubbhastighet med 7-järn är ${v}`,
    measuredSpeed: (v, sd) => `Klubbhastighet med 7-järn ${v} (± ${sd})`,
    carryAt: (v, head, loft) => `Det ger cirka ${v} carry med ${head} 7-järn${loft ? ` (${loft} loft)` : ""}.`,
    footer: "Nästan alla golfare minns ett bra slag. Din fitting bygger på det uppmätta värdet, så den passar "
      + "svingen du har en vanlig dag.",
  },

  lmImport: {
    photo: "Foto", photoHint: "Valfri launch monitor-skärm eller skärmdump",
    video: "Video", videoHint: "Du som slår, med skärmen i bild",
    videoTips: "Håll skärmen i bild några sekunder efter varje slag.",
    readingVideo: "Läser din video…",
    videoPrivacy: "Bara stillbilder läses, sedan raderas de.",
    retryVideo: "Prova en annan video",
    link: "TrackMan-länk", linkHint: "Från ditt TrackMan-mejl",
    csv: "CSV", csvHint: "Export från launch monitorns app",
    photoTips: "Gå nära, rakt framifrån. Snittvärden om skärmen visar dem.",
    unread: "Gick inte att läsa",
    unitQ: "Avstånd på skärmen",
    yards: "Yards", metres: "Meter",
    privacy: "Läses av vår AI, sedan raderas det.",
    reading: "Läser din skärm…",
    linkLabel: "Klistra in rapportlänken",
    fetch: "Hämta mina siffror", fetching: "Hämtar din rapport…",
    check: "Kontrollera att siffrorna stämmer med din skärm",
    club: "Klubba",
    shots: (n) => (n ? `${n} slag` : "Sessionens snitt"),
    oneShot: "Ett slag",
    spread: (v) => `± ${v}`,
    notes: {
      single_shot: "Ett slag, inte ett snitt, så det väger mindre.",
      units_guessed: "Enheterna gick inte att läsa. Kontrollera yards eller meter.",
      carry_implausible: "Carry och hastighet stämmer inte. Kolla skärmen.",
      smash_implausible: "Boll- och klubbhastighet stämmer inte.",
      low_res: "Skärmen för liten för snittvärden; vi använde ditt senaste slag.",
      unsure: "Oklara siffror utelämnades.",
    },
    otherIron: (club, speed) => `${club}: cirka ${speed} med 7-järn. Carry och utgångsvinkel används inte.`,
    notIron: "Bara järn (5–9).",
    unknownClub: "Vilken klubba slogs slagen med?",
    use: "Ja, använd de här siffrorna", retry: "Prova ett annat foto", tryLink: "Prova en annan länk",
    errors: {
      not_configured: "Fotoläsning är avstängd. Använd en TrackMan-länk eller CSV.",
      unreadable: "Gick inte att läsa. Prova ett skarpare foto rakt framifrån.",
      no_numbers: "Ingen klubbhastighet eller carry hittades.",
      implausible: "Ser inte ut som en järnsession.",
      bad_image: "Filen går inte att öppna.",
      provider: "Läsaren svarade inte. Försök igen.",
      not_trackman_link: "Bara TrackMan-länkar fungerar. För andra märken, skicka foto eller video.",
      no_screen: "Ingen launch monitor-skärm hittades. Svingvideo? Använd + › Sving.",
      video_unclear: "Inget slag var tydligt nog. Filma närmare skärmen.",
      report_not_found: "Rapporten hittades inte. Kopiera hela länken.",
      report_private: "Rapporten är privat. Skicka ett foto i stället.",
      rate: "För många försök. Försök igen senare.",
      generic: "Något gick fel.",
      video_codec: "Webbläsaren kan inte spela videon. Prova från telefonen som filmade.",
    },
    clubs: {
      "4i": "4-järn", "5i": "5-järn", "6i": "6-järn", "7i": "7-järn", "8i": "8-järn", "9i": "9-järn",
      pw: "pitching wedge", gw: "gap wedge", sw: "sand wedge", lw: "lob wedge", hybrid: "hybrid", wood: "fairwayträ",
      driver: "driver",
    },
  },

  interview: {
    scores: ["Under 71", "71–77", "78–84", "85–92", "Över 92"],
    rounds: ["Under 10", "10–30", "31–50", "Över 50"],
    under: (v) => `Under ${v}`,
    over: (v) => `Över ${v}`,
    chars: {
      forgiveness: "Förlåtande", distance: "Längd", "forged feel": "Smidd känsla",
      "distance control": "Längdkontroll", workability: "Formbarhet", "less offset": "Mindre offset",
      "more offset": "Mer offset",
    },
    misses: {
      left: "Vänster", right: "Höger", fat: "Duff (marken först)", thin: "Tunt", toe: "På tån", heel: "På hälen",
    },
    missComment: {
      start: "Startriktningen beror delvis på lievinkeln, så vi kollar hur din klubba möter marken.",
      toeHeel: "Tå- och hälträffar beror delvis på klubblängden; ditt kroppsfoto kollar det.",
      fatThin: "Duffar och tunna slag är mest teknik, men jag ser till att klubblängden inte förvärrar dem.",
    },
    say: {
      hand: `Hej, jag är ${N}, Takomos AI-fitter. Vi gör det här som en fitting i studio: först några frågor om ditt `
        + "spel, sedan mäter jag dig med mobilen, och du ser din spec bli säkrare under tiden. Till att börja med, "
        + "spelar du höger- eller vänsterhänt?",
      score: "Vad brukar du gå runt 18 hål på? En vanlig runda, inte din bästa dag.",
      rounds: "Och ungefär hur många rundor om året?",
      carry: "Hur långt flyger ett vanligt, rent träffat 7-järn i luften för dig? Bara carry, ingen rull.",
      speed: "Bra. Vad är din klubbhastighet med 7-järn?",
      carryRange: "Inga problem, de flesta golfare är osäkra. Vilket intervall låter närmast? Jag mäter det ordentligt senare.",
      carryCheck: (dist, long, score) => `${dist} är ${long ? "längre" : "kortare"} än för de flesta golfare som `
        + `brukar gå runt på ${score}. Uppskattade längder slår ofta fel, så låt mig kolla.`,
      club: "Vilket 7-järn spelar du med nu? Loften varierar mycket mellan märken. Vissa moderna 7-järn är 4–5° "
        + "starkare än våra, och det är därför de flyger längre. Om du vet loften kan jag jämföra rakt av.",
      misses: "Vart tar dina dåliga 7-järnsslag oftast vägen? Välj alla som stämmer.",
      flight: "Hur flyger ditt 7-järn oftast?",
      tempo: "Hur skulle du beskriva ditt svingtempo?",
      priorities: (tempoUnsure) => (tempoUnsure ? "Det gör inget, jag mäter ditt tempo från en video. " : "")
        + "Vad vill du helst ha av dina järn? Välj upp till tre, viktigast först.",
      body: "Till sist några uppgifter för mätningarna.",
      glove: "Vet du din handskstorlek?",
    },
    rightHanded: "Högerhänt", leftHanded: "Vänsterhänt",
    isCarry: "Det är carry, i luften", isCarryEcho: "Det är carry", includesRoll: "Rullen är inräknad",
    thatsRight: "Det stämmer",
    flight: { low: "Låg", mid: "Mellan", high: "Hög" },
    flightHint: { low: "Platt, rak", mid: "Mittemellan", high: "Stiger brant" },
    tempo: { smooth: "Lugnt", moderate: "Måttligt", quick: "Snabbt" },
    tempoHint: { smooth: "Utan brådska, jämnt", moderate: "Mittemellan", quick: "Snabbt bak och igenom" },
    about: (v) => `Cirka ${v}`,
    carryIn: (unit) => `Carry i ${unit}`,
    yards: "yards", metres: "meter",
    knowSpeed: "Jag vet min svinghastighet", knowSpeedEcho: "Jag vet min klubbhastighet",
    clubPlaceholder: "Märke och modell, t.ex. Ping G425",
    myClub: "Mitt 7-järn", loftUnknown: "loft okänd", loftAria: "7-järnets loft i grader", loftUnit: "° loft",
    ifKnown: "Om du vet den", ratherNot: "Jag vill helst inte säga",
    noPattern: "Inget tydligt mönster",
    noPreference: "Ingen preferens", noStrongPreference: "Ingen stark preferens",
    male: "Man", female: "Kvinna", age: "Ålder", years: "år",
    height: "Längd, i skorna du spelar i", heightCm: "Längd i centimeter", heightFt: "Längd, fot",
    heightIn: "Längd, tum",
    changeLast: "Ändra mitt senaste svar",
  },

  session: {
    noChange: "Det stämmer med vad jag hade, så inget ändras.",
    changes: (part, from, to) => `${part} ändras från ${from} till ${to}.`,
    stays: (part, to, cert, pct) => `${part} blir kvar på ${to}, nu ${cert} (${pct}).`,
    refitFailed: "Jag kunde inte uppdatera din fitting. Försök igen.",
    updatedRead: (summary) => `Jag har uppdaterat din fitting med dina nya svar. ${summary}`,
    firstRead: (head, shaft, summary) => `Min första bedömning: ${head} med skaftet ${shaft}. ${summary} Så långt `
      + "räcker dina svar. Nu mäter vi, så ser du specen bli säkrare.",
    brand: "Takomo Fit",
    talkInstead: `Prata med ${N} i stället`,
    startOver: "Börja om",
    backToMeasuring: "Tillbaka till mätningarna",
    firstReadBusy: "Sätter ihop min första bedömning",
    changeAnswers: "Ändra mina svar",
    redo: "Gör om", doNow: "Gör det nu",
    expect: (part, a, b) => `Jag räknar med att den tar din säkerhet för ${part} från ${a} till ungefär ${b}.`,
    updating: "Uppdaterar din fitting",
    start: "Starta", skipForNow: "Hoppa över tills vidare",
    allDone: (did) => (did ? "Det var allt jag skulle mäta hemma. " : "Inga problem, vi kan mäta senare. "),
    skipRest: "Hoppa över resten och visa min fitting",
    seeFull: "Visa hela min fitting",
    soFar: "Din spec hittills", updatingShort: "· uppdaterar…",
    closeCalls: (n) => `${n} att kontrollera`,
    allSettled: "Allt avgjort",
  },

  result: {
    notFound: "Vi hittade inte den här fittingen. Den kan ha gått ut.",
    addFailed: "Vi kunde inte lägga till mätningen.",
    startNew: "Starta en ny fitting",
    loading: "Laddar din fitting",
    backToFit: "Tillbaka till min fitting",
    kicker: "Ditt Takomo 7-järn",
    buyStock: "Köp standard", orderCustom: "Beställ special", returns: "30 dagars retur", madeToOrder: "Tillverkas på beställning",
    stockChance: (p) => `Chans att ett standardset är vad din sving kräver: ${p}`,
    customTitle: "Dina mätningar talar för en specialbyggd uppsättning",
    stockTitle: "Ett standardset passar din sving",
    toCheck: (n, list) => `${n === 1 ? "En sak" : `${n} saker`} att kontrollera: ${list}.`,
    allConfirmed: "Alla delar är bekräftade.",
    nextStep: (test) => `Nästa steg: ${test}`,
    whyEach: "Varför varje del",
    settle: "Kontrollera det som återstår",
    settleIntro: "Rangordnade efter hur mycket varje test skulle göra din spec säkrare, beräknat innan du gör det.",
    expected: "förväntat",
    more: "Fler mätningar",
    footer: (id, model) => `Fitting ${id} · modell ${model}`,
    back: `Tillbaka till ${N}`,
    runnerUp: "Tvåa:",
    added: (title) => `${title} tillagt`,
    agrees: "Det stämmer med vad vi hade, så din spec är oförändrad.",
    orderOnTakomo: (name) => `Beställ ${name} på takomogolf.com`,
    copySpec: "Kopiera min spec",
    copiedSpec: "Spec kopierad",
  },

  compare: {
    title: "Jämför",
    of5: (n) => `${n} av 5`,
    notKnown: "Okänd", yourCurrent: "Din nuvarande",
    estimate: (v) => `${v} (din uppskattning)`,
    loft: "Loft 7-järn", carry: "Carry",
    yourVs: (name) => `Ditt 7-järn mot ${name}`,
    moreLoft: (d) => `Vårt har ${d} mer loft, så med samma sving startar det högre, landar mjukare och går lite `
      + "kortare. Det är loften, inte förlorad hastighet.",
    lessLoft: (d) => `Vårt har ${d} mindre loft, så med samma sving flyger det lägre och längre.`,
    sameLoft: "Loften är ungefär desamma, så räkna med liknande längd.",
    yoursLonger: (loft) => "Om ditt nuvarande 7-järn går längre har det troligen starkare loft: många moderna "
      + `game improvement-7-järn har flera grader mindre än våra ${loft}. Det är loften, inte förlorad hastighet.`,
    topTwo: "De två bästa klubbhuvudena",
    rating: {
      forgiveness: "Förlåtande", distance: "Längd", workability: "Formbarhet", distance_control: "Längdkontroll",
    },
    forgedFeel: "Smidd känsla", no: "Nej", offset: "Offset", builtFor: "Byggd för resultat", yourCarry: "Din carry",
    rightForYou: "Rätt för dig",
    rightNote: "”Rätt för dig” är hur ofta varje klubbhuvud hamnar överst över allt vi fortfarande är osäkra på.",
    shaftsTitle: "Ditt skaft mot tvåan",
    flex: "Flex", weight: "Vikt", material: "Material", launch: "Utgång", suitsTempo: "Passar tempo", any: "alla",
    launchLevel: { low: "låg", mid: "mellan", high: "hög" },
    tempoLevel: { smooth: "lugnt", moderate: "måttligt", quick: "snabbt", any: "alla" },
    shaftLine: (model, launch, tempo) =>
      `${model}: ${[launch && `${launch} utgång`, tempo ? `passar ${tempo} tempo` : "passar alla tempon"].filter(Boolean).join(", ")}.`,
    stiffer: (name) => `${name} är styvare: den skulle flyga lägre med mindre spinn och kännas fastare.`,
    softer: (name) => `${name} är mjukare: den skulle starta högre, spinna mer och kännas livligare.`,
    heavier: (model, g) => `${model} är ${g} tyngre, för en mer kontrollerad känsla.`,
    lighter: (model, g) => `${model} är ${g} lättare, för en lättsamare känsla.`,
  },

  whatIf: {
    title: "Tänk om…",
    intro: "Se hur din spec skulle ändras om din sving eller kropp var annorlunda.",
    speed: "Hastighet 7-järn", height: "Längd", flight: "Bollflykt", tempo: "Tempo",
    show: "Visa mig", running: "Räknar om din fitting", failed: "Det fungerade inte. Försök igen.",
    same: "Din spec skulle vara oförändrad.",
    now: (v) => `(nu ${v})`,
  },

  ask: {
    title: `Fråga ${N}`,
    intro: "Svaren kommer direkt från siffrorna bakom din fitting.",
    whyHead: (name) => `Varför ${name}?`,
    whyShaft: "Varför det här skaftet?",
    whyLie: (v) => `Varför lie ${v.toLowerCase()}?`,
    whyLength: (v) => `Varför längd ${v.toLowerCase()}?`,
    grip: "Hur valdes min greppstorlek?",
    stockCustom: "Standard eller special?",
    next: "Vad ska jag göra härnäst?",
    sure: (p) => `Jag är ${p} säker.`,
    alternative: (v, p) => `Alternativet är ${v}, ${p} sannolikt.`,
    missesLie: (dir, upright, flat) =>
      `Du sa att dina dåliga slag startar ${DIR[dir]}. En lie som är för upprätt för dig startar slagen åt `
      + `${SIDE[upright]}; för flat, åt ${SIDE[flat]}. Svingbanan gör samma sak, så bara bollinjetestet kan avgöra `
      + "om det är klubban eller svingen.",
    nextTest: (title, how) => `${title}. ${how}`,
    improve: (part, a, b) => `Det borde ta din säkerhet för ${part} från ${a} till ungefär ${b}.`,
    nothingElse: "Inget annat skulle ändra den här fittingen. Du är redo att beställa.",
    rather: "Vill du hellre prata igenom det?",
  },

  voice: {
    dropped: "Röstanslutningen bröts.",
    notOn: "Röstfittern är inte påslagen på den här servern.",
    mic: "Vi behöver tillgång till mikrofonen för att prata. Tillåt den i webbläsarens inställningar och försök igen.",
    failed: `Vi kunde inte starta ${N}. Försök igen.`,
    talking: `${N} pratar`, listening: "Lyssnar…", connecting: "Ansluter…", talkThrough: "Prata igenom det",
    hint: "Fråga varför en del valdes, vad som ändras om du är längre eller svingar snabbare, eller hur två "
      + "klubbhuvuden skiljer sig. Varje svar kommer från din fitting, inte gissningar.",
    end: "Avsluta samtalet", talk: `Prata med ${N}`,
  },
};

export default sv;
