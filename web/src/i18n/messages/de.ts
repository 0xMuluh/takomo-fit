import { FITTER_NAME as N } from "../config";
import type { Messages } from "./en";

type Dir = "left" | "right" | "both";
const DIR: Record<Dir, string> = { left: "nach links", right: "nach rechts", both: "in beide Richtungen" };
const SIDE = { left: "links", right: "rechts" };

const de: Messages = {
  meta: {
    title: "Takomo Fit",
    pages: { live: "Dein Takomo Fit", guided: "Geführtes Takomo Fit", spec: "Dein Takomo Fit", phone: "Handy-Kamera" },
    description: `Ein komplettes Takomo-Fitting für dein Eisen 7 mit dem Handy, mit ${N}, Takomos KI-Fitter: die `
      + "Spezifikation, die Gründe und wie sicher wir uns sind.",
  },
  switcher: { language: "Sprache", units: "Einheiten", imperial: "yd · mph", metric: "m · km/h" },
  header: { findFit: "Takomo Fit", store: "Takomo-Shop", faq: "FAQ & Support" },
  common: {
    send: "Senden", done: "Fertig", skip: "Überspringen", cancel: "Abbrechen", continue: "Weiter",
    useThis: "Übernehmen", retake: "Neu aufnehmen", notSure: "Weiß nicht", undo: "Rückgängig",
    restart: "Neu starten", measuring: "Messe", dismiss: "Schließen", eg: (v) => `z. B. ${v}`, and: " und ",
    or: (a, b) => `${a} oder ${b}`, minutes: (n) => `~${n} Min.`,
  },
  fitter: { role: "Takomos KI-Fitter", initial: N[0], aiNotice: `${N} ist eine KI, kein Mensch.` },

  home: {
    kicker: "Takomo Golf",
    title: "Der Fitter für die Hosentasche.",
    intro: `Lerne ${N} kennen, Takomos KI-Fitter. Ein Live-Fitting für dein Eisen 7 am Handy.`,
    steps: [
      [`Sprich mit ${N}`, "Per Stimme oder Text."],
      ["Lass dich vermessen", "Mit der Handykamera."],
      ["Sieh deine Spezifikation wachsen", "Kopf, Schaft, Länge, Lie, Griff."],
      ["Frag, was du willst", "Warum dieser Schaft? Was wäre, wenn…?"],
    ],
    start: "Mein Live-Fitting starten",
    guided: "Lieber Fragen antippen",
    privacy: "Fotos und Videos bleiben auf deinem Handy.",
    needs: "15 Min. · Eisen 7 + Bankkarte",
    example: "Beispiel-Spezifikation",
  },

  part: { head: "Kopf", shaft: "Schaft", length: "Länge", lie: "Lie-Winkel", grip: "Griff", purchase: "Build" },
  spec: {
    lie: "Lie", hand: "Hand", left: "Links", right: "Rechts", stock: "Standard", custom: "Custom", standard: "Standard",
    inch: (v) => `${v} Zoll`,
    upright: (v) => `${v} aufrecht`,
    flat: (v) => `${v} flach`,
    grip: { standard: "Standard", midsize: "Midsize", oversize: "Oversize" },
    flex: { lady: "Ladies", senior: "Senior", regular: "Regular", stiff: "Stiff", "x-stiff": "X-Stiff" },
    material: { steel: "Stahl", graphite: "Graphit" },
    improves: { lie: "Lie", grip: "Griff", flex: "Schaft-Flex", head: "Kopf", shaft: "Schaft", length: "Länge" },
  },
  certainty: { confirmed: "Bestätigt", likely: "Wahrscheinlich", check: "Zu prüfen" },
  summary: {
    settled: (list) => `Entschieden: ${list}.`,
    close: (list) => `Noch zu prüfen: ${list}.`,
  },
  testTitle: {
    "ball-line test": "Ball-Linien-Test",
    "hand photo with a bank card": "Handfoto mit Karte",
    "slow-motion swing video": "Schwungvideo in Zeitlupe",
    "launch monitor upload": "Launch-Monitor-Session",
  },
  missing: {
    score: "typisches Ergebnis", carry: "Carry oder Schlägerkopfgeschwindigkeit mit dem Eisen 7",
    flight: "Ballflug", tempo: "Tempo", age: "Alter", sex: "Geschlecht", height: "Körpergröße",
  },

  live: {
    kind: {
      body: "Ganzkörperfoto", hand: "Handfoto", swing: "Schwung", ball_line: "Ball-Linien-Test",
      launch_monitor: "Launch-Monitor-Session",
    },
    kindHint: {
      launch_monitor: "Foto, Video, TrackMan-Link oder CSV",
      swing: "Schwung filmen oder hochladen",
      body: "Kopf bis Fuß: Länge und Lie",
      hand: "Neben einer Bankkarte: Griffstärke",
      ball_line: "Stiftlinie auf einem Ball: Lie-Winkel",
    },
    attach: "Zahlen oder eine Messung hinzufügen",
    opened: (what) => `Geöffnet: ${what}`,
    dropped: `Die Verbindung zu ${N} ist abgebrochen.`,
    measuredNoUpdate: "Wir haben das gemessen, konnten dein Fitting aber nicht aktualisieren. Prüfe deine Verbindung.",
    busy: "Gerade werden viele Golfer gefittet. Bitte versuch es in ein paar Minuten noch einmal.",
    micNeeded: `${N} braucht das Mikrofon. Erlaube es in den Browser-Einstellungen oder wähle stattdessen Text.`,
    unreachable: `Wir konnten ${N} nicht erreichen. Prüfe deine Verbindung und versuch es noch einmal.`,
    liveFitting: "Live-Fitting", ended: "Sitzung beendet", results: "Ergebnis", end: "Beenden",
    seeFull: "Mein komplettes Fitting ansehen", again: `Noch einmal mit ${N} sprechen`,
    resultsTitle: "Dein Fitting bisher",
    intro: {
      title: "Dein Live-Fitting",
      body: `Ein Studio-Fitting mit ${N}: zuerst dein Spiel, dann Messungen mit der Kamera.`,
      bullets: ["15 Min.", "Eisen 7 + Bankkarte", "Platz zum Schwingen", "Jederzeit pausieren"],
      welcomeBack: (name) => `Willkommen zurück${name ? `, ${name}` : ""}.`,
      remembers: `${N} weiß, wo ihr wart.`,
      continueText: "Per Text weitermachen",
      unavailable: "Der Live-Fitter ist hier noch nicht eingeschaltet.",
      unavailableLink: "Mach stattdessen das geführte Fitting",
      unavailableTail: "; es nutzt dieselbe Berechnung.",
      connecting: `Verbinde mit ${N}…`,
      startNew: "Neues Fitting starten",
      start: "Sprechen",
      type: "Ich schreibe lieber",
      guided: "Oder Fragen antippen",
      privacy: "Fotos und Videos bleiben auf deinem Handy. Die Stimme verarbeitet unser Sprachdienst.",
    },
    hud: {
      yourSpec: "Deine Spezifikation",
      buildsHere: "Entsteht hier, während ihr sprecht.",
      stillNeeds: (list) => `${N} braucht noch: ${list}.`,
    },
    joining: `${N} kommt dazu…`,
    micOff: "Mikrofon aus",
    talking: `${N} spricht. Sprich, um zu unterbrechen.`,
    listening: "Hört zu…",
    mute: "Stumm", unmute: "Ton an",
    typeAnswer: "Schreib deine Antwort…", orType: "Oder hier schreiben…", messageLabel: `Nachricht an ${N}`,
    notNow: "Nicht jetzt",
    openFull: "Komplette Auswertung öffnen",
    newTab: `Öffnet sich in einem neuen Tab, damit ${N} in der Leitung bleibt.`,
  },
  phone: {
    here: "Dieser Computer", phone: "Mein Handy",
    scan: "Mit dem Handy scannen",
    scanTip: `Öffnet diesen Schritt auf dem Handy. ${N} bleibt hier.`,
    waiting: "Warte auf dein Handy…",
    connected: "Handy verbunden. Mach dort weiter.",
    expired: "Code abgelaufen.", newCode: "Neuer Code",
    failed: "Kein Code möglich. Nutze die Kamera dieses Computers.",
    paired: "Mit deinem Computer verbunden",
    sent: "Gesendet. Zurück zum Computer.",
    sendFailed: "Senden fehlgeschlagen. Prüfe deine Verbindung.", retry: "Erneut versuchen",
    gone: "Dieser Link ist abgelaufen. Scanne einen neuen Code am Computer.",
  },

  agent: {
    hello: `Hi, ich bin ${N}, Takomos KI-Fitter. Das dauert etwa 5 Minuten in drei Schritten: 7 kurze Fragen zu deinem `
      + "Spiel, eine direkte Ersteinschätzung deiner Spezifikation und optionale Kamera-Messungen zur Feinabstimmung. "
      + "Wie ist dein Vorname und was wünschst du dir von neuen Eisen?",
    welcomeBack: (name) => `Willkommen zurück${name ? `, ${name}` : ""}. Hier ist wieder ${N}. Machen wir da weiter, wo wir aufgehört haben.`,
    onFit: (name) => `Hallo${name ? ` ${name}` : ""}, hier ist ${N}. Ich habe dein Fitting vor mir. Soll ich es mit `
      + "dir durchgehen, oder interessiert dich ein bestimmtes Teil?",
  },

  camera: {
    blocked: "Der Kamerazugriff ist blockiert. Erlaube ihn in den Browser-Einstellungen und versuch es noch einmal.",
    unavailable: "Wir konnten die Kamera auf diesem Gerät nicht öffnen.",
    opening: "Kamera wird geöffnet…", flip: "Wechseln", flipLabel: "Kamera wechseln",
  },

  vision: {
    noHand: "Wir konnten deine Hand nicht finden. Leg sie flach hin, Finger zusammen, ganz im Bild.",
    cardEdges: "Wir konnten die Kanten der Karte nicht erkennen. Leg sie auf eine glatte Fläche und richte sie an der Vorlage aus.",
    cardSkew: "Halte das Handy flach über den Tisch, damit die Karte nicht verzerrt ist.",
    fingersTogether: "Halte die Finger zusammen.",
    handImplausible: "Diese Handlänge sieht nicht richtig aus. Versuch es noch einmal mit der Karte neben deiner Hand.",
    tapCorners: "Tippe auf zwei gegenüberliegende Ecken der Karte.",
    noPerson: "Wir konnten keine Person auf dem Foto finden. Stell dich ganz ins Bild und versuch es noch einmal.",
    hidden: "Ein Teil von dir ist verdeckt. Kopf, beide Hände und beide Füße müssen gut sichtbar sein.",
    noHeadTop: "Wir konnten deinen Scheitel nicht sehen. Lass oben etwas Platz.",
    armsDown: "Lass beide Arme gerade nach unten hängen.",
    standStraight: "Steh gerade, das Gewicht gleichmäßig auf beiden Füßen.",
    phoneLevel: "Halte das Handy gerade, nicht geneigt.",
    stepCloser: "Komm näher, sodass du mindestens die halbe Bildhöhe füllst.",
    margins: "Lass etwas Platz über dem Kopf und unter den Füßen.",
    bodyImplausible: "Diese Messung sieht nicht richtig aus. Prüfe, ob deine Arme gerade hängen, und versuch es noch einmal.",
    noBackswing: "Kein Rückschwung gefunden. Filme den ganzen Schwung von der Ansprechposition bis zum Finish.",
    noImpact: "Wir konnten den Treffmoment nicht finden. Filme weiter, bis der Ball getroffen ist.",
    notInVideo: "Wir konnten dich im Video nicht sehen. Filme frontal mit deinem ganzen Körper im Bild.",
    lostHands: "Ich habe deine Hände aus den Augen verloren. Bleib mit dem ganzen Körper im Bild.",
    slowCamera: "Die Kamera läuft zu langsam. Mach mehr Licht und versuch es noch einmal.",
    notASwing: "Das sah nicht nach einem ganzen Schwung aus. Mach einen vollen, normalen Schwung.",
  },

  media: { takePhoto: "Foto aufnehmen", recordVideo: "Video aufnehmen", library: "Aus der Mediathek wählen" },
  photoFailed: "Beim Lesen des Fotos ist etwas schiefgegangen. Bitte versuch ein anderes.",

  captures: {
    title: {
      body: "Ganzkörperfoto", hand: "Handfoto mit Karte", swing: "Schwungvideo", ballLine: "Ball-Linien-Test",
      radar: "Launch-Monitor-Session",
    },
    sets: {
      body: "Länge und Lie", hand: "Griffstärke", swing: "Schaft und Tempo", ballLine: "Lie-Winkel",
      radar: "Schaft und Kopf",
    },
    needs: {
      body: "Jemand, der das Handy hält, oder ein Selbstauslöser", hand: "Irgendeine Bankkarte",
      swing: "Ein Eisen 7 und Platz zum Schwingen", ballLine: "Marker, Bälle, eine Abschlagmatte",
      radar: "Ein Foto des Bildschirms, ein TrackMan-Link oder eine CSV-Datei",
    },
    setsYour: (sets, min) => `Bestimmt ${sets} · ${min}`,
    skipped: (title) => `${title} · übersprungen`,
    intro: {
      body: (toeHeel) => "Ein Fitter beginnt mit deiner Körpergröße und dem Abstand Handgelenk–Boden; daraus ergeben "
        + "sich Länge und Ausgangs-Lie. Ein Ganzkörperfoto liefert mir beides."
        + (toeHeel ? " Es zeigt auch, ob die Schlägerlänge deine Treffer an Spitze und Ferse erklärt." : ""),
      hand: (unsure) => "Die Griffstärke ergibt sich aus deiner Hand. Ein Foto neben einer beliebigen Bankkarte misst "
        + "sie auf wenige Millimeter genau."
        + (unsure ? " Du warst dir bei deiner Handschuhgröße nicht sicher, also ist das hier wichtig." : ""),
      swing: (carry, tempo) => "Als Nächstes würde ich dir beim Schwingen zusehen. Ein Video von vorn liefert mir dein "
        + "Tempo und, mit 240 fps gefilmt, auch deine Schlägerkopfgeschwindigkeit."
        + (carry || tempo
          ? ` Du warst dir bei ${carry && tempo ? "deiner Weite und deinem Tempo" : carry ? "deiner Weite" : "deinem Tempo"} `
            + "nicht sicher, also ist das das Nützlichste, was du tun kannst."
          : ""),
      ballLine: (dir) => "So prüft ein Fitter den Lie: wie der Schläger beim Schwung tatsächlich den Boden trifft."
        + (dir ? ` Du hast gesagt, deine Fehlschläge starten ${DIR[dir]}; ein falscher Lie-Winkel ist eine mögliche Ursache.` : "")
        + " Du brauchst einen Ort, an dem du Bälle schlagen kannst.",
      radar: "Wenn du oder ein Freund einen Launch-Monitor habt, messen zehn Schläge mit dem Eisen 7 deine "
        + "Geschwindigkeit und deinen Abflugwinkel direkt. Das ist der stärkste einzelne Beleg für deinen Schaft.",
    },
  },

  body: {
    onDevice: "Wird auf deinem Handy gemessen. Das Foto verlässt es nie.",
    wtf: "Handgelenk bis Boden",
    ofHeight: (pct, height) => `${pct} deiner Körpergröße von ${height}. Das bestimmt deine Schlägerlänge.`,
    retakeAdvice: (issues) => `Wir nutzen das mit geringerem Gewicht, aber ein neues Foto wäre genauer: ${issues}`,
    steps: (room) => [
      "Zieh die Schuhe an, in denen du spielst, und stell dich auf einen harten Boden.",
      "Arme hängen locker seitlich, Blick geradeaus.",
      `Lass jemanden das Handy auf Hüfthöhe in ${room} Abstand halten, oder stell es auf und nutze den Selbstauslöser.`,
      "Dein ganzer Körper muss im Bild sein, mit etwas Platz über dem Kopf.",
    ],
  },
  hand: {
    steps: [
      "Leg eine beliebige Bank-, Ausweis- oder Kundenkarte auf einen glatten Tisch. Sie sind alle gleich groß.",
      "Leg die Hand, an der du den Handschuh trägst, flach daneben, Finger zusammen, Handgelenksfalte sichtbar.",
      "Halte das Handy flach direkt darüber, sodass Hand und Karte das Bild füllen.",
    ],
    measured: "Das haben wir gemessen.",
    length: "Handlänge, Handgelenksfalte bis Mittelfingerspitze",
    setsGrip: "Das bestimmt deine Griffstärke.",
    retakeAdvice: (issues) => `Ein neues Foto wäre genauer: ${issues}`,
    markAgain: "Neu markieren", newPhoto: "Neues Foto",
  },
  ballLine: {
    prompts: [
      "Tippe auf das untere Ende der Markerlinie auf der Schlagfläche.",
      "Tippe auf das obere Ende der Markerlinie.",
      "Tippe auf die Vorderkante an der Ferse (nahe am Schaft).",
      "Tippe auf die Vorderkante an der Spitze.",
    ],
    offLine: "Diese Linie ist mehr als 20° geneigt. Tippe zuerst auf die Enden der Linie, dann auf die Vorderkante, und versuch es noch einmal.",
    steps: [
      "Zieh mit einem Whiteboard-Marker eine gerade Linie auf einen Ball.",
      "Leg ihn auf eine harte Matte, die Linie senkrecht zum Schläger.",
      "Schlag ein Eisen 7 mit deinem normalen Schwung.",
      "Fotografiere die Schlagfläche aus der Nähe und gerade von vorn, sodass Abdruck und Vorderkante gut zu sehen sind.",
      "Wisch die Schlagfläche ab und wiederhole. Fünf Schläge sind ideal, drei das Minimum.",
    ],
    shots: (n) => `Gemessene Schläge: ${n}`,
    average: (v) => `Durchschnitt ${v}. Positiv heißt, die Spitze war im Treffmoment oben (Lie zu aufrecht).`,
    photoNext: "Nächsten Schlag fotografieren", photoFirst: "Ersten Schlag fotografieren",
    use: (n) => `${n} Schläge übernehmen`, removeLast: "Letzten Schlag entfernen",
  },
  radar: {
    intro: "Schlag etwa zehn Eisen 7 mit deinem normalen Schwung, exportiere die Session in der App als CSV und lade sie hier hoch.",
    home: "Heim-Radar", homeHint: "Garmin R10, Mevo, Rapsodo, SkyTrak…",
    studio: "Studio-Monitor", studioHint: "TrackMan, GCQuad, Foresight…",
    choose: "CSV-Export wählen", readFailed: "Wir konnten die Datei nicht lesen.",
    noColumns: "Wir haben in der Datei keine Spalten für Schlägerkopfgeschwindigkeit oder Carry gefunden.",
    tooFew: "Die Datei muss mindestens drei Schläge mit dem Eisen 7 enthalten.",
    found: (n, sevenIron, avg) =>
      `${n} ${sevenIron ? "Schläge mit dem Eisen 7" : "Schläge"} gefunden${avg ? `, mittlere Schlägerkopfgeschwindigkeit ${avg}` : ""}.`,
    using: (cols) => `Verwendet: ${cols}`,
    columns: {
      club_speed_mph: "Schlägerkopfgeschwindigkeit", carry_yd: "Carry", launch_angle_deg: "Abflugwinkel",
      landing_angle_deg: "Landewinkel", dynamic_loft_deg: "dynamischer Loft", attack_angle_deg: "Anstellwinkel",
      face_to_path_deg: "Schlagfläche zur Schwungbahn", side_yd: "Seitenabweichung", impact_offset_mm: "Trefferlage",
      impact_toe_up_deg: "Spitze oben im Treffmoment",
    },
    noClub: "Keine Schläger-Spalte gefunden, also gehen wir davon aus, dass jeder Schlag ein Eisen 7 war.",
    useSession: "Diese Session übernehmen",
  },
  swing: {
    steps: (room) => [
      "Filme frontal, von vorn, mit deinem ganzen Körper und dem Schläger im Bild.",
      `Stell das Handy auf Hüfthöhe in etwa ${room} Abstand auf.`,
      "Ein Schwung mit dem Eisen 7, von der Ansprechposition bis nach dem Treffmoment.",
      "Zeitlupe (120 oder 240 fps) ist am besten. Bei 240 fps können wir auch deine Schlägerkopfgeschwindigkeit messen.",
    ],
    howFilm: "Wie filmst du?", normal: "Normal", slow120: "Zeitlupe 120", slow240: "Zeitlupe 240",
    readFailed: "Wir konnten das Video nicht lesen. Versuch, es noch einmal aufzunehmen.",
    tracking: "Dein Schwung wird auf deinem Handy verfolgt",
    tryAnother: "Anderes Video versuchen",
    backswing: "Rückschwung", downswing: "Abschwung", ratio: "Verhältnis",
    alsoSpeed: "Auch Schlägerkopfgeschwindigkeit messen", useTempo: "Tempo übernehmen", newVideo: "Neues Video",
    twoFrames: "Markiere den Schlägerkopf in zwei verschiedenen Bildern.",
    implausible: (v) => `Das ergibt ${v}, was nicht plausibel ist. Markiere neu und tippe auf die Mitte des Schlägerkopfs.`,
    tapBall: (n) => `Tippe auf den linken Rand des Balls, dann auf den rechten (${n}/2). Die bekannte Ballgröße liefert den Maßstab.`,
    stepFrame: "Geh zu einem Bild kurz vor dem Treffmoment, auf dem der Schlägerkopf scharf ist, und tippe auf seine Mitte.",
    movedFrame: "Wir sind ein Bild weiter. Tippe noch einmal auf die Mitte des Schlägerkopfs.",
    prevFrame: "Vorheriges Bild", nextFrame: "Nächstes Bild", frameBack: "◀ Bild", frameFwd: "Bild ▶",
  },
  liveBody: {
    start: "Stell das Handy auf Hüfthöhe auf und geh zurück, bis du von Kopf bis Fuß im Bild bist.",
    notVisible: "Ich sehe dich noch nicht. Tritt ins Bild.",
    headHands: "Geh zurück, damit ich deinen Kopf und beide Hände sehe.",
    feet: "Geh zurück, damit ich deine Füße sehe.",
    spaceAbove: "Lass etwas Platz über deinem Kopf.",
    feetEdge: "Deine Füße sind am Bildrand. Geh ein Stück zurück.",
    closer: "Komm etwas näher ans Handy.",
    holdStill: "Halt still…",
    perfect: "Perfekt. Halt still…",
    got: (n, of) => `${n} von ${of}. Bleib genau so.`,
    frameFailed: "Das Bild hat nicht geklappt. Halt still, ich versuche es noch einmal.",
    noClean: "Ich habe keine saubere Messung bekommen. Lies die Tipps oben und steh still, das Gesicht zum Handy.",
    tips: (room) => [
      "Golfschuhe an, harter Boden, Arme hängen locker.",
      `Handy auf Hüfthöhe in ${room} Abstand aufgestellt, oder ein Freund hält es gerade.`,
    ],
    result: (wtf, pct) => `Handgelenk bis Boden: ${wtf} (${pct} deiner Körpergröße).`,
  },
  liveSwing: {
    useLive: "Stattdessen die Live-Kamera nutzen",
    start: (room) => `Stell das Handy auf Hüfthöhe etwa ${room} vor dir auf, frontal, mit ganzem Körper und Schläger im Bild.`,
    result: (b, d, r) => `Rückschwung ${b}, Abschwung ${d}: ein Tempo von ${r}.`,
    swingDone: (n, b, d, of) =>
      `Schwung ${n} erledigt: ${b} zurück, ${d} runter. Geh wieder in die Ansprechposition für Schwung ${n + 1} von ${of}.`,
    couldntTime: "Den konnte ich nicht messen. Stell dich neu auf und schwing noch einmal.",
    headToToe: "Geh zurück, damit ich dich von Kopf bis Fuß sehe, frontal zum Handy.",
    address: "Geh in die Ansprechposition und halt kurz still.",
    ready: "Bereit. Schwing, wann du willst.",
    swinging: "Schwung läuft…",
    tips: [
      "Gesicht zum Handy, ganzer Körper und Schläger im Bild. Ein Eisen 7, ein normaler voller Schwung.",
      "Drei Schwünge. Schlag Bälle in ein Netz oder mach volle Probeschwünge, wenn du Platz hast.",
    ],
    upload: "Hast du ein Zeitlupenvideo? Lade es stattdessen hoch; bei 240 fps misst es auch deine Schlägerkopfgeschwindigkeit.",
  },

  notes: {
    wtf: (v) => `Laut deinem Foto beträgt dein Abstand Handgelenk–Boden ${v}.`,
    hand: (v) => `Deine Hand misst ${v} von der Handgelenksfalte bis zur Fingerspitze.`,
    swing: (b, d, r, speed) =>
      `Dein Rückschwung dauert ${b} und dein Abschwung ${d}, ein Tempo von ${r}${speed ? `, bei einer Schlägerkopfgeschwindigkeit von ${speed}` : ""}.`,
    ballLineSquare: "Deine Ball-Linien-Abdrücke stehen senkrecht zur Schlagfläche: Der Schläger trifft den Boden flach.",
    ballLineLean: (v, toe) => `Deine Ball-Linien-Abdrücke neigen sich im Schnitt ${v} zur ${toe ? "Spitze" : "Ferse"}, `
      + `also ist ein Standard-Lie für deinen Schwung ${toe ? "zu aufrecht" : "zu flach"}.`,
    radar: (n, avg) => `${n} Schläge${avg ? `, mittlere Schlägerkopfgeschwindigkeit ${avg}` : ""}.`,
    radarSummary: (source, speed, shots, from) =>
      `${source === "photo" ? "Aus dem Bildschirmfoto" : source === "video" ? "Aus deinem Video" : source === "report" ? "Aus dem TrackMan-Report" : "Aus der Datei"}`
      + (!speed ? "" : from
        ? `: ${from.club}, ${shots === 1 ? "ein Schlag" : "Mittel"} ${from.speed}, mit dem Eisen 7 etwa ${speed}`
        : `: ${shots === 1 ? "ein Schlag mit dem Eisen 7, Schlägerkopfgeschwindigkeit" : "mittlere Schlägerkopfgeschwindigkeit mit dem Eisen 7"} ${speed}`) + ".",
    added: "Messung hinzugefügt.",
  },

  honest: {
    title: "Was du uns gesagt hast, was wir gemessen haben",
    said: "Du hast gesagt", measured: "Wir haben gemessen",
    saidCarry: (v) => `Dein Eisen 7 fliegt ${v} Carry`,
    saidSpeed: (v) => `Deine Schlägerkopfgeschwindigkeit mit dem Eisen 7 ist ${v}`,
    measuredSpeed: (v, sd) => `Schlägerkopfgeschwindigkeit mit dem Eisen 7 ${v} (± ${sd})`,
    carryAt: (v, head, loft) => `Das sind etwa ${v} Carry mit dem ${head} Eisen 7${loft ? ` (${loft} Loft)` : ""}.`,
    footer: "Fast jeder Golfer erinnert sich an einen guten Schlag. Dein Fitting rechnet mit dem gemessenen Wert, "
      + "damit es zu dem Schwung passt, den du an einem normalen Tag mitbringst.",
  },

  lmImport: {
    photo: "Foto", photoHint: "Jeder Launch-Monitor-Bildschirm oder App-Screenshot",
    video: "Video", videoHint: "Du beim Schlagen, Bildschirm im Bild",
    videoTips: "Halte den Bildschirm nach jedem Schlag ein paar Sekunden im Bild.",
    readingVideo: "Video wird gelesen…",
    videoPrivacy: "Nur Standbilder werden gelesen, dann gelöscht.",
    retryVideo: "Anderes Video versuchen",
    link: "TrackMan-Link", linkHint: "Aus deiner TrackMan-E-Mail",
    csv: "CSV", csvHint: "Export aus der Launch-Monitor-App",
    photoTips: "Nah ran, gerade von vorn. Durchschnitte, wenn der Bildschirm sie zeigt.",
    unread: "Nicht lesbar",
    unitQ: "Distanzen am Bildschirm",
    yards: "Yards", metres: "Meter",
    privacy: "Von unserer KI gelesen, dann gelöscht.",
    reading: "Dein Bildschirm wird gelesen…",
    linkLabel: "Report-Link einfügen",
    fetch: "Meine Zahlen holen", fetching: "Dein Report wird geholt…",
    check: "Prüf, ob die Zahlen zu deinem Bildschirm passen",
    club: "Schläger",
    shots: (n) => (n ? `${n} Schläge` : "Session-Durchschnitt"),
    oneShot: "Ein Schlag",
    spread: (v) => `± ${v}`,
    notes: {
      single_shot: "Ein Schlag, kein Durchschnitt, zählt also weniger.",
      units_guessed: "Einheiten nicht lesbar. Prüfe Yards oder Meter.",
      carry_implausible: "Carry und Tempo passen nicht. Prüf den Bildschirm.",
      smash_implausible: "Ball- und Schlägertempo passen nicht.",
      low_res: "Bildschirm zu klein für Durchschnitte; letzter Schlag verwendet.",
      unsure: "Unklare Zahlen weggelassen.",
    },
    otherIron: (club, speed) => `${club}: etwa ${speed} mit dem Eisen 7. Carry und Abflugwinkel nicht verwendet.`,
    notIron: "Nur Eisen (5–9).",
    unknownClub: "Mit welchem Schläger waren diese Schläge?",
    use: "Ja, diese Zahlen verwenden", retry: "Anderes Foto versuchen", tryLink: "Anderen Link versuchen",
    errors: {
      not_configured: "Fotolesen ist aus. Nimm einen TrackMan-Link oder CSV.",
      unreadable: "Nicht lesbar. Versuch ein schärferes Foto von vorn.",
      no_numbers: "Kein Schlägertempo oder Carry gefunden.",
      implausible: "Sieht nicht nach einer Eisen-Session aus.",
      bad_image: "Datei lässt sich nicht öffnen.",
      provider: "Keine Antwort vom Lesedienst. Nochmal versuchen.",
      not_trackman_link: "Nur TrackMan-Links gehen. Für andere Marken: Foto oder Video.",
      no_screen: "Kein Launch-Monitor-Bildschirm gefunden. Schwungvideo? Nimm + › Schwung.",
      video_unclear: "Kein Schlag klar genug. Näher am Bildschirm filmen.",
      report_not_found: "Report nicht gefunden. Ganzen Link kopieren.",
      report_private: "Der Report ist privat. Schick ein Foto.",
      rate: "Zu viele Versuche. Später nochmal.",
      generic: "Etwas ist schiefgegangen.",
      video_codec: "Der Browser kann das Video nicht abspielen. Versuch es vom Handy, das gefilmt hat.",
    },
    clubs: {
      "4i": "Eisen 4", "5i": "Eisen 5", "6i": "Eisen 6", "7i": "Eisen 7", "8i": "Eisen 8", "9i": "Eisen 9",
      pw: "Pitching Wedge", gw: "Gap Wedge", sw: "Sand Wedge", lw: "Lob Wedge", hybrid: "Hybrid", wood: "Fairwayholz",
      driver: "Driver",
    },
  },

  interview: {
    scores: ["Unter 71", "71–77", "78–84", "85–92", "Über 92"],
    rounds: ["Unter 10", "10–30", "31–50", "Über 50"],
    under: (v) => `Unter ${v}`,
    over: (v) => `Über ${v}`,
    chars: {
      forgiveness: "Fehlerverzeihung", distance: "Weite", "forged feel": "Geschmiedetes Gefühl",
      "distance control": "Längenkontrolle", workability: "Formbarkeit", "less offset": "Weniger Offset",
      "more offset": "Mehr Offset",
    },
    misses: {
      left: "Links", right: "Rechts", fat: "Fett (Boden zuerst)", thin: "Dünn getroffen", toe: "An der Spitze",
      heel: "An der Ferse",
    },
    missComment: {
      start: "Die Startrichtung hängt teils vom Lie-Winkel ab, also prüfen wir, wie dein Schläger den Boden trifft.",
      toeHeel: "Treffer an Spitze und Ferse hängen teils von der Schlägerlänge ab; dein Körperfoto prüft das.",
      fatThin: "Fette und dünne Schläge sind meist Technik, aber ich achte darauf, dass die Schlägerlänge sie nicht verstärkt.",
    },
    say: {
      hand: `Hallo, ich bin ${N}, Takomos KI-Fitter. Wir machen das wie ein Fitting im Studio: zuerst ein paar Fragen `
        + "zu deinem Spiel, dann vermesse ich dich mit deinem Handy, und du siehst, wie deine Spezifikation immer "
        + "sicherer wird. Zum Start: Spielst du rechts oder links?",
      score: "Was spielst du normalerweise über 18 Löcher? Eine typische Runde, nicht dein bester Tag.",
      rounds: "Und wie viele Runden ungefähr im Jahr?",
      carry: "Wie weit fliegt ein normales, gut getroffenes Eisen 7 bei dir in der Luft? Nur Carry, ohne Rollen.",
      speed: "Super. Wie hoch ist deine Schlägerkopfgeschwindigkeit mit dem Eisen 7?",
      carryRange: "Kein Problem, die meisten Golfer sind sich nicht sicher. Welcher Bereich kommt am ehesten hin? Ich messe es später genau.",
      carryCheck: (dist, long, score) => `${dist} ist ${long ? "weiter" : "kürzer"} als bei den meisten Golfern, die `
        + `normalerweise ${score} spielen. Selbst geschätzte Weiten liegen oft daneben, also lass mich nachfragen.`,
      club: "Welches Eisen 7 spielst du gerade? Die Lofts unterscheiden sich stark zwischen den Marken. Manche modernen "
        + "Eisen 7 sind 4–5° stärker als unseres, deshalb fliegen sie weiter. Wenn du den Loft kennst, kann ich direkt vergleichen.",
      misses: "Wohin gehen deine Fehlschläge mit dem Eisen 7 meistens? Wähl alles aus, was zutrifft.",
      flight: "Wie fliegt dein Eisen 7 normalerweise?",
      tempo: "Wie würdest du dein Schwungtempo beschreiben?",
      priorities: (tempoUnsure) => (tempoUnsure ? "Kein Problem, ich messe dein Tempo aus einem Video. " : "")
        + "Was willst du von deinen Eisen am meisten? Wähl bis zu drei, das Wichtigste zuerst.",
      body: "Zum Schluss noch ein paar Angaben für die Messungen.",
      glove: "Kennst du deine Handschuhgröße?",
    },
    rightHanded: "Rechtshänder", leftHanded: "Linkshänder",
    isCarry: "Das ist Carry, in der Luft", isCarryEcho: "Das ist Carry", includesRoll: "Das Rollen ist mit drin",
    thatsRight: "Stimmt so",
    flight: { low: "Niedrig", mid: "Mittel", high: "Hoch" },
    flightHint: { low: "Flach, gerade", mid: "Dazwischen", high: "Steigt steil" },
    tempo: { smooth: "Ruhig", moderate: "Mittel", quick: "Schnell" },
    tempoHint: { smooth: "Ohne Eile, gleichmäßig", moderate: "Dazwischen", quick: "Schnell zurück und durch" },
    about: (v) => `Etwa ${v}`,
    carryIn: (unit) => `Carry in ${unit}`,
    yards: "Yards", metres: "Metern",
    knowSpeed: "Ich kenne meine Schwunggeschwindigkeit", knowSpeedEcho: "Ich kenne meine Schlägerkopfgeschwindigkeit",
    clubPlaceholder: "Marke und Modell, z. B. Ping G425",
    myClub: "Mein Eisen 7", loftUnknown: "Loft unbekannt", loftAria: "Loft des Eisen 7 in Grad", loftUnit: "° Loft",
    ifKnown: "Falls bekannt", ratherNot: "Möchte ich lieber nicht sagen",
    noPattern: "Kein klares Muster",
    noPreference: "Keine Vorliebe", noStrongPreference: "Keine klare Vorliebe",
    male: "Männlich", female: "Weiblich", age: "Alter", years: "Jahre",
    height: "Körpergröße, in deinen Golfschuhen", heightCm: "Körpergröße in Zentimetern", heightFt: "Körpergröße, Fuß",
    heightIn: "Körpergröße, Zoll",
    changeLast: "Meine letzte Antwort ändern",
  },

  session: {
    noChange: "Das passt zu dem, was ich hatte, also ändert sich nichts.",
    changes: (part, from, to) => `${part} wechselt von ${from} zu ${to}.`,
    stays: (part, to, cert, pct) => `${part} bleibt bei ${to}, jetzt ${cert} (${pct}).`,
    refitFailed: "Ich konnte dein Fitting nicht aktualisieren. Bitte versuch es noch einmal.",
    updatedRead: (summary) => `Ich habe dein Fitting mit deinen neuen Antworten aktualisiert. ${summary}`,
    firstRead: (head, shaft, summary) => `Meine erste Einschätzung: ${head} mit einem ${shaft}-Schaft. ${summary} `
      + "So viel verraten mir deine Antworten allein. Jetzt messen wir, und du siehst, wie es sicherer wird.",
    brand: "Takomo Fit",
    talkInstead: `Lieber mit ${N} sprechen`,
    startOver: "Neu beginnen",
    backToMeasuring: "Zurück zu den Messungen",
    firstReadBusy: "Meine erste Einschätzung entsteht",
    changeAnswers: "Meine Antworten ändern",
    redo: "Wiederholen", doNow: "Jetzt machen",
    expect: (part, a, b) => `Ich erwarte, dass das deine Sicherheit bei ${part} von ${a} auf etwa ${b} bringt.`,
    updating: "Dein Fitting wird aktualisiert",
    start: "Starten", skipForNow: "Vorerst überspringen",
    allDone: (did) => (did ? "Das ist alles, was ich zu Hause messen würde. " : "Kein Problem, wir können später messen. "),
    skipRest: "Rest überspringen und mein Fitting ansehen",
    seeFull: "Mein komplettes Fitting ansehen",
    soFar: "Deine Spezifikation bisher", updatingShort: "· wird aktualisiert…",
    closeCalls: (n) => `${n} zu prüfen`,
    allSettled: "Alles entschieden",
  },

  result: {
    notFound: "Wir konnten dieses Fitting nicht finden. Vielleicht ist es abgelaufen.",
    addFailed: "Wir konnten diese Messung nicht hinzufügen.",
    startNew: "Neues Fitting starten",
    loading: "Dein Fitting wird geladen",
    backToFit: "Zurück zu meinem Fitting",
    kicker: "Dein Takomo Eisen 7",
    buyStock: "Standard kaufen", orderCustom: "Custom bestellen", returns: "30 Tage Rückgabe",
    madeToOrder: "Auf Bestellung gefertigt",
    stockChance: (p) => `Wahrscheinlichkeit, dass ein Standardsatz genau das ist, was dein Schwung braucht: ${p}`,
    customTitle: "Deine Messwerte sprechen für eine Maßanfertigung",
    stockTitle: "Ein Standardsatz passt zu deinem Schwung",
    toCheck: (n, list) => `${n === 1 ? "Ein Punkt" : `${n} Punkte`} zu prüfen: ${list}.`,
    allConfirmed: "Alle Teile sind bestätigt.",
    nextStep: (test) => `Nächster Schritt: ${test}`,
    whyEach: "Warum jedes Teil",
    settle: "Offene Punkte klären",
    settleIntro: "Sortiert danach, wie sehr jeder Test deine Spezifikation absichern würde, berechnet, bevor du ihn machst.",
    expected: "erwartet",
    more: "Weitere Messungen",
    footer: (id, model) => `Fitting ${id} · Modell ${model}`,
    back: `Zurück zu ${N}`,
    runnerUp: "Zweitbeste Wahl:",
    added: (title) => `${title} hinzugefügt`,
    agrees: "Das passt zu dem, was wir hatten, also bleibt deine Spezifikation gleich.",
    orderOnTakomo: (name) => `${name} auf takomogolf.com bestellen`,
    copySpec: "Spezifikation kopieren",
    copiedSpec: "Kopiert",
  },

  compare: {
    title: "Vergleich",
    of5: (n) => `${n} von 5`,
    notKnown: "Unbekannt", yourCurrent: "Dein aktuelles",
    estimate: (v) => `${v} (deine Schätzung)`,
    loft: "Loft Eisen 7", carry: "Carry",
    yourVs: (name) => `Dein Eisen 7 vs. ${name}`,
    moreLoft: (d) => `Unseres hat ${d} mehr Loft, also startet es mit demselben Schwung höher, landet weicher und `
      + "fliegt etwas kürzer. Das ist der Loft, keine verlorene Geschwindigkeit.",
    lessLoft: (d) => `Unseres hat ${d} weniger Loft, also fliegt es mit demselben Schwung flacher und weiter.`,
    sameLoft: "Die Lofts sind etwa gleich, also rechne mit ähnlicher Weite.",
    yoursLonger: (loft) => "Wenn dein aktuelles Eisen 7 weiter fliegt, hat es wahrscheinlich einen stärkeren Loft: "
      + `Viele moderne Game-Improvement-Eisen 7 haben mehrere Grad weniger als unsere ${loft}. Das ist der Loft, keine verlorene Geschwindigkeit.`,
    topTwo: "Die zwei besten Köpfe",
    rating: {
      forgiveness: "Fehlerverzeihung", distance: "Weite", workability: "Formbarkeit", distance_control: "Längenkontrolle",
    },
    forgedFeel: "Geschmiedetes Gefühl", no: "Nein", offset: "Offset", builtFor: "Gebaut für Ergebnisse",
    yourCarry: "Dein Carry",
    rightForYou: "Passt zu dir",
    rightNote: "„Passt zu dir“ zeigt, wie oft jeder Kopf vorne liegt, über alles hinweg, bei dem wir uns noch nicht sicher sind.",
    shaftsTitle: "Dein Schaft vs. die zweitbeste Wahl",
    flex: "Flex", weight: "Gewicht", material: "Material", launch: "Abflug", suitsTempo: "Passt zu Tempo", any: "jedem",
    launchLevel: { low: "niedrig", mid: "mittel", high: "hoch" },
    tempoLevel: { smooth: "ruhig", moderate: "mittel", quick: "schnell", any: "jedes" },
    shaftLine: (model, launch, tempo) =>
      `${model}: ${[launch && `Abflug ${launch}`, tempo ? `passt zu Tempo ${tempo}` : "passt zu jedem Tempo"].filter(Boolean).join(", ")}.`,
    stiffer: (name) => `Der ${name} ist steifer: Er würde flacher fliegen, mit weniger Spin, und sich fester anfühlen.`,
    softer: (name) => `Der ${name} ist weicher: Er würde höher starten, mehr spinnen und sich lebendiger anfühlen.`,
    heavier: (model, g) => `Der ${model} ist ${g} schwerer, für ein kontrollierteres Gefühl.`,
    lighter: (model, g) => `Der ${model} ist ${g} leichter, für ein müheloseres Gefühl.`,
  },

  whatIf: {
    title: "Was wäre, wenn…",
    intro: "Sieh dir an, wie sich deine Spezifikation ändern würde, wenn dein Schwung oder Körper anders wäre.",
    speed: "Geschwindigkeit Eisen 7", height: "Körpergröße", flight: "Ballflug", tempo: "Tempo",
    show: "Zeig es mir", running: "Dein Fitting wird neu berechnet", failed: "Das hat nicht geklappt. Bitte versuch es noch einmal.",
    same: "Deine Spezifikation bliebe gleich.",
    now: (v) => `(jetzt ${v})`,
  },

  ask: {
    title: `Frag ${N}`,
    intro: "Die Antworten kommen direkt aus den Zahlen hinter deinem Fitting.",
    whyHead: (name) => `Warum das ${name}?`,
    whyShaft: "Warum dieser Schaft?",
    whyLie: (v) => `Warum Lie ${v}?`,
    whyLength: (v) => `Warum Länge ${v}?`,
    grip: "Wie wurde meine Griffstärke bestimmt?",
    stockCustom: "Standard oder Custom?",
    next: "Was sollte ich als Nächstes tun?",
    sure: (p) => `Ich bin mir zu ${p} sicher.`,
    alternative: (v, p) => `Die Alternative ist ${v}, zu ${p} wahrscheinlich.`,
    missesLie: (dir, upright, flat) =>
      `Du hast gesagt, deine Fehlschläge starten ${DIR[dir]}. Ein für dich zu aufrechter Lie lässt die Bälle `
      + `${SIDE[upright]} starten; ein zu flacher ${SIDE[flat]}. Die Schwungbahn bewirkt dasselbe, also kann nur der `
      + "Ball-Linien-Test zeigen, ob es am Schläger oder am Schwung liegt.",
    nextTest: (title, how) => `${title}. ${how}`,
    improve: (part, a, b) => `Damit sollte deine Sicherheit bei ${part} von ${a} auf etwa ${b} steigen.`,
    nothingElse: "Nichts anderes würde dieses Fitting ändern. Du kannst bestellen.",
    rather: "Lieber darüber sprechen?",
  },

  voice: {
    dropped: "Die Sprachverbindung ist abgebrochen.",
    notOn: "Der Sprach-Fitter ist auf diesem Server nicht eingeschaltet.",
    mic: "Zum Sprechen brauchen wir Zugriff auf dein Mikrofon. Erlaube ihn in den Browser-Einstellungen und versuch es noch einmal.",
    failed: `Wir konnten ${N} nicht starten. Bitte versuch es noch einmal.`,
    talking: `${N} spricht`, listening: "Hört zu…", connecting: "Verbinde…", talkThrough: "Durchsprechen",
    hint: "Frag, warum ein Teil gewählt wurde, was sich ändert, wenn du größer bist oder schneller schwingst, oder "
      + "wie sich zwei Köpfe unterscheiden. Jede Antwort kommt aus deinem Fitting, nicht aus Vermutungen.",
    end: "Gespräch beenden", talk: `Mit ${N} sprechen`,
  },
};

export default de;
