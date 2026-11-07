"""Golfer-facing wording in each supported language, and the units numbers are shown in.

Templates only place words around numbers; every number still comes from the engine and is formatted here.
Club specs stay in inches and degrees in every language, as on Takomo's spec sheets.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

Lang = Literal["en", "fi", "sv", "de"]
Units = Literal["imperial", "metric"]
LANGS: tuple[str, ...] = ("en", "fi", "sv", "de")
YD_TO_M = 0.9144
MPH_TO_KMH = 1.609344
SPEED_BAND_MPH = {1: (None, 60), 2: (60, 70), 3: (71, 80), 4: (81, 90), 5: (90, None)}

SOURCES = ["TrackMan", "TrackMan, Takomo test club", "TrackMan, own club", "ball-line test", "body photo (good)",
           "body photo (poor)", "carry with loft", "finger length", "glove size known", "hand photo", "home radar",
           "known loft", "photo height", "reported carry", "reported speed", "slow-motion video", "questionnaire"]

EN = {
    "and": " and ", "or": " or ", "list_sep": ", ",
    "pct": "{n}%", "inch": "{v} in", "inch_adj": "{v} inch",
    "speed.under": "under {v}", "speed.over": "over {v}", "speed.range": "{a}-{b}",
    "score.1": "Under 71", "score.2": "71-77", "score.3": "78-84", "score.4": "85-92", "score.5": "Over 92",
    **{f"src.{s}": s for s in SOURCES},
    "ev.answer": "your answer", "ev.video": "slow-motion video", "ev.radar": "home launch monitor",
    "ev.trackman": "TrackMan", "ev.body": "body photo", "ev.ball_line": "ball-line test", "ev.hand": "hand photo",
    "ev.speed": "7-iron speed {speed}", "ev.carry": "7-iron carry {carry}{loft}", "ev.carry_loft": " with a {loft} 7-iron",
    "ev.median": "median {speed}", "ev.radar_reading": "median {speed}, carry {carry}", "ev.height": "height {v}",
    "ev.wtf": "wrist-to-floor {v}", "ev.tilt": "mean tilt {v}", "ev.toe": "toe {v} at impact",
    "ev.glove_unknown": "glove size not known", "ev.glove": "glove {v}", "ev.hand_length": "hand {v}",
    "rating.forgiveness": "forgiveness", "rating.distance": "distance", "rating.workability": "workability",
    "rating.feel": "feel", "rating.vs": "{name} {a} vs {b}",
    "char.forgiveness": "forgiveness", "char.distance": "distance", "char.forged feel": "forged feel",
    "char.distance control": "distance control", "char.workability": "workability",
    "char.less offset": "less offset", "char.more offset": "more offset",
    "desc.101-mkii": "Forgiveness and distance in the world's sleekest package",
    "desc.201-mkii": "Perfect blend of distance, forgiveness and workability",
    "desc.201t-mkii": "Increased workability for players who need a hint of forgiveness",
    "desc.301-cb": "A forged, cavity back iron, that balances control and forgiveness",
    "desc.301-mb": "A forged, muscle back iron that enables maximum workability and feel",
    "head.score_optimism": "You said you usually shoot {said}. We all remember our good rounds: most golfers who answer "
                           "that average {real} over a season, so we fit for the clubs you need on an ordinary day "
                           "({p} likely).",
    "head.score_match": "Your typical score of {score} matches heads built for that level ({p} sure of that band).",
    "head.speed_points": "At about {speed} ({band}), {a} earns {pa} speed points and {b} {pb}.",
    "head.priorities": "Your priorities ({chars}) add {pa} points for {a} and {pb} for {b}.",
    "head.total": "Total: {a} {ta}, {b} {tb}.",
    "head.tie_reason": "The two score level, so Takomo's tie-break decides: {a} sits closer to your skill level. "
                       "Either is a sound choice; the difference is the trade-off below.",
    "head.tie_summary": "{a} and {b} score level for you; {a} wins the tie-break.",
    "head.close_summary": "{a}, narrowly ahead of {b} ({pa} vs {pb}).",
    "head.summary": "{a}: {desc}.",
    "head.effect": "Compared with {b} (ratings out of 5): {diffs}.",
    "flex.lady": "ladies", "flex.senior": "senior", "flex.regular": "regular", "flex.stiff": "stiff",
    "flex.x-stiff": "extra stiff", "material.steel": "steel", "material.graphite": "graphite",
    "launch.low": "low", "launch.mid": "mid", "launch.high": "high",
    "flight.low": "low", "flight.mid": "mid", "flight.high": "high",
    "tempo.smooth": "smooth", "tempo.moderate": "moderate", "tempo.quick": "quick",
    "shaft.speed": "Your 7-iron speed is about {speed}, give or take {sd} (from {sources}). That is the {band} band, "
                   "which calls for {flex} flex ({p} sure).",
    "shaft.alt_flex": "There is a {p} chance you belong in {flex} flex instead.",
    "shaft.graphite": "Graphite because {why}.",
    "shaft.graphite_light": "lighter graphite suits senior and ladies flex",
    "shaft.graphite_women": "Takomo fits graphite for women",
    "shaft.graphite_age": "Takomo fits graphite from age 70",
    "shaft.graphite_profile": "graphite matched your profile",
    "shaft.steel": "Steel, the standard for your speed and profile.",
    "shaft.any_tempo": "any tempo", "shaft.tempos": "{list} tempos",
    "shaft.profile": "{model} launches {launch} and suits {tempo_text}. You need a {flight} ball flight ({pf}) and "
                     "swing with a {tempo} tempo ({pt}).",
    "shaft.effect": "{w} g. A softer flex than you need tends to launch higher and spin more; a stiffer one flies "
                    "lower and can feel boardy.",
    "shaft.summary": "{model} {flex} ({material}).",
    "length.height": "Your height is about {v} (±{sd}, from {sources}).",
    "length.chart": "On the PING length chart Takomo uses, that gives {len}.",
    "length.edge": "You are {dist} from the {edge} line, so the next length over is {p} likely.",
    "length.ladies": "Ladies-flex shafts are built an inch shorter, so the inch is added back.",
    "length.effect": "The right length lets you stand to the ball naturally and find the centre of the face; too long "
                     "tends to heel strikes, too short to toe strikes.",
    "length.summary_std": "Standard length.", "length.summary": "{len}.",
    "lie.static": "From your height and wrist-to-floor, the PING colour chart puts you at {v}.",
    "lie.ball_line": "Your ball-line marks lean {v} {way}.",
    "lie.toward_toe": "toward the toe (club too upright for you)",
    "lie.toward_heel": "toward the heel (club too flat for you)",
    "lie.trackman": "With a standard-lie Takomo test club, TrackMan saw the toe {v} {dir} at impact.",
    "lie.up": "up", "lie.down": "down",
    "lie.need": "Putting it together, your swing needs about {need} (±{sd}), so {lie}",
    "lie.need_alt": "; {alt} is {p} likely.", "lie.need_end": ".",
    "lie.no_direct": "We have not seen how your club meets the ground yet, and body measurements only get within about "
                     "a degree. A ball-line test is the quickest way to firm this up.",
    "lie.effect": "Each degree too upright starts your {carry} 7-iron about {offset} {side} of where you aimed; each "
                  "degree too flat, the other way.",
    "side.left": "left", "side.right": "right",
    "lie.summary_std": "Standard lie.", "lie.summary_up": "{n}° upright.", "lie.summary_flat": "{n}° flat.",
    "grip.standard": "standard", "grip.midsize": "midsize", "grip.oversize": "oversize",
    "grip.hand": "Your hand is about {v} from wrist crease to fingertip (±{sd}, from {sources}).",
    "grip.maps": "That maps to a {grip} grip.",
    "grip.alt": "{alt} is {p} likely; a hand photo with a bank card settles it.",
    "grip.summary": "{grip} grip.",
    "grip.effect": "Too thin a grip lets the hands over-rotate (shots go left); too thick holds the face open (shots "
                   "go right).",
    "custom.shaft": "{model} {material} shaft", "custom.length": "length {v}", "custom.lie": "lie {v}",
    "custom.grip": "{grip} grip",
    "purchase.stock": "Every part of your fit is a stock option, so you get faster delivery and the 30-day return.",
    "purchase.soft_lie": "standard lie is still {p} likely",
    "purchase.soft_length": "standard length is still {p} likely",
    "purchase.custom": "Custom build because of {because}. Custom builds can't be returned.",
    "purchase.close": " It's a close call: {soft}. If the 30-day return matters to you, a stock set is a reasonable "
                      "choice",
    "purchase.close_ball_line": ", or do the ball-line test first.", "purchase.close_end": ".",
    "purchase.non_stock": "Non-stock parts: {list}.", "purchase.all_stock": "Every part is a stock option.",
    "purchase.p_stock": "Across everything we're unsure about, there's a {p} chance a stock set is what your swing "
                        "really calls for.",
    "purchase.policy": "Stock sets ship faster and come with a 30-day return; custom builds are made to order and "
                       "can't be returned.",
    "build.stock": "stock", "build.custom": "custom",
    "test.ball_line": "Draw a straight line on a ball with a whiteboard marker, set it with the line vertical facing "
                      "the club, hit five 7-irons off a hard mat, and photograph the face after each shot.",
    "test.hand": "Lay your hand flat on a table next to any bank card, fingers together, and take one photo from "
                 "straight above.",
    "test.video": "Film three 7-iron swings face-on in 240 fps slow motion with the whole club in frame.",
    "test.radar": "If you or a friend has a launch monitor, hit ten 7-irons and upload the session export.",
    "warn.body_ratio": "Body photo without a reference object is weighted conservatively until its error is measured "
                       "on real golfers.",
    "diff.head": "head changes from {a} to {b}", "diff.shaft": "shaft changes from {a} to {b}",
    "diff.length": "length changes from {a} to {b} inch", "diff.lie": "lie changes from {a} to {b} degrees",
    "diff.grip": "grip changes from {a} to {b}", "diff.build": "the build changes from {a} to {b}",
}

FI = {
    "and": " ja ", "or": " tai ", "list_sep": ", ",
    "pct": "{n}\u00a0%", "inch": "{v} tuumaa", "inch_adj": "{v} tuumaa",
    "speed.under": "alle {v}", "speed.over": "yli {v}", "speed.range": "{a}-{b}",
    "score.1": "alle 71", "score.2": "71-77", "score.3": "78-84", "score.4": "85-92", "score.5": "yli 92",
    "src.TrackMan": "TrackMan", "src.TrackMan, Takomo test club": "TrackMan, Takomo-testimaila",
    "src.TrackMan, own club": "TrackMan, oma maila", "src.ball-line test": "pallolinjatesti",
    "src.body photo (good)": "vartalokuva (hyvä)", "src.body photo (poor)": "vartalokuva (heikko)",
    "src.carry with loft": "lentomatka ja loft", "src.finger length": "sormen pituus",
    "src.glove size known": "hanskan koko", "src.hand photo": "käsikuva", "src.home radar": "oma launch monitor",
    "src.known loft": "tunnettu loft", "src.photo height": "pituus kuvasta",
    "src.reported carry": "kertomasi lentomatka", "src.reported speed": "kertomasi nopeus",
    "src.slow-motion video": "hidastettu video", "src.questionnaire": "kyselyvastaukset",
    "ev.answer": "vastauksesi", "ev.video": "hidastettu svingivideo", "ev.radar": "oma launch monitor",
    "ev.trackman": "TrackMan", "ev.body": "vartalokuva", "ev.ball_line": "pallolinjatesti", "ev.hand": "käsikuva",
    "ev.speed": "7-raudan mailanpään nopeus {speed}", "ev.carry": "7-raudan lentomatka {carry}{loft}",
    "ev.carry_loft": " ({loft} 7-raudalla)",
    "ev.median": "mediaani {speed}", "ev.radar_reading": "mediaani {speed}, lentomatka {carry}",
    "ev.height": "pituus {v}", "ev.wtf": "ranne–lattia {v}", "ev.tilt": "keskimääräinen kallistus {v}",
    "ev.toe": "kärki {v} osumassa", "ev.glove_unknown": "hanskan koko ei tiedossa", "ev.glove": "hanska {v}",
    "ev.hand_length": "käsi {v}",
    "rating.forgiveness": "anteeksiantavuus", "rating.distance": "pituus", "rating.workability": "muotoiltavuus",
    "rating.feel": "tuntuma", "rating.vs": "{name} {a} vs. {b}",
    "char.forgiveness": "anteeksiantavuus", "char.distance": "pituus", "char.forged feel": "taottu tuntuma",
    "char.distance control": "pituuskontrolli", "char.workability": "muotoiltavuus",
    "char.less offset": "vähemmän offsetia", "char.more offset": "enemmän offsetia",
    "desc.101-mkii": "Anteeksiantavuutta ja pituutta maailman tyylikkäimmässä paketissa",
    "desc.201-mkii": "Täydellinen yhdistelmä pituutta, anteeksiantavuutta ja muotoiltavuutta",
    "desc.201t-mkii": "Lisää muotoiltavuutta pelaajille, jotka kaipaavat ripauksen anteeksiantavuutta",
    "desc.301-cb": "Taottu cavity back -rauta, joka tasapainottaa kontrollin ja anteeksiantavuuden",
    "desc.301-mb": "Taottu muscle back -rauta maksimaaliseen muotoiltavuuteen ja tuntumaan",
    "head.score_optimism": "Kerroit pelaavasi yleensä {said}. Muistamme kaikki parhaat kierroksemme: useimmat näin "
                           "vastaavat pelaavat kauden keskiarvona {real}, joten sovitamme mailat tavalliseen "
                           "pelipäivään (todennäköisyys {p}).",
    "head.score_match": "Tyypillinen tuloksesi {score} vastaa tälle tasolle tehtyjä mailanpäitä (varmuus {p}).",
    "head.speed_points": "Noin {speed} nopeudella ({band}) malli {a} saa {pa} nopeuspistettä ja malli {b} {pb}.",
    "head.priorities": "Painotuksesi ({chars}) antavat mallille {a} {pa} pistettä ja mallille {b} {pb}.",
    "head.total": "Yhteensä: {a} {ta}, {b} {tb}.",
    "head.tie_reason": "Mallit saavat saman pistemäärän, joten Takomon tasapelisääntö ratkaisee: {a} on lähempänä "
                       "tasoasi. Kumpikin on hyvä valinta; ero on alla kuvattu kompromissi.",
    "head.tie_summary": "{a} ja {b} saavat sinulle saman pistemäärän; {a} voittaa tasapelisäännöllä.",
    "head.close_summary": "{a}, niukasti ennen mallia {b} ({pa} vs. {pb}).",
    "head.summary": "{a}: {desc}.",
    "head.effect": "Verrattuna malliin {b} (arviot asteikolla 1–5): {diffs}.",
    "flex.lady": "Ladies", "flex.senior": "Senior", "flex.regular": "Regular", "flex.stiff": "Stiff",
    "flex.x-stiff": "X-Stiff", "material.steel": "teräs", "material.graphite": "grafiitti",
    "launch.low": "matala", "launch.mid": "keskikorkea", "launch.high": "korkea",
    "flight.low": "matala", "flight.mid": "keskikorkea", "flight.high": "korkea",
    "tempo.smooth": "rauhallinen", "tempo.moderate": "kohtalainen", "tempo.quick": "nopea",
    "shaft.speed": "7-rautasi mailanpään nopeus on noin {speed}, ±{sd} (lähteet: {sources}). Se on nopeusluokka "
                   "{band}, joka vaatii jäykkyyden {flex} (varmuus {p}).",
    "shaft.alt_flex": "Sinulle voi sopia myös jäykkyys {flex} (todennäköisyys {p}).",
    "shaft.graphite": "Grafiitti, koska {why}.",
    "shaft.graphite_light": "kevyempi grafiitti sopii Senior- ja Ladies-jäykkyyksiin",
    "shaft.graphite_women": "Takomo sovittaa naisille grafiittivarret",
    "shaft.graphite_age": "Takomo sovittaa grafiittivarret 70 vuoden iästä alkaen",
    "shaft.graphite_profile": "grafiitti sopi profiiliisi",
    "shaft.steel": "Teräs, vakiovalinta nopeudellesi ja profiilillesi.",
    "shaft.any_tempo": "sopii kaikille tempoille", "shaft.tempos": "sopii, kun tempo on {list}",
    "shaft.profile": "{model}: lentorata {launch}, {tempo_text}. Sinulle sopii {flight} lentorata ({pf}) ja "
                     "svingitemposi on {tempo} ({pt}).",
    "shaft.effect": "{w} g. Liian pehmeä varsi nostaa lentorataa ja lisää spiniä; liian jäykkä lentää matalammalta "
                    "ja voi tuntua kovalta.",
    "shaft.summary": "{model} {flex} ({material}).",
    "length.height": "Pituutesi on noin {v} (±{sd}, lähteet: {sources}).",
    "length.chart": "Takomon käyttämän PING-pituustaulukon mukaan se tarkoittaa {len}.",
    "length.edge": "Olet {dist} päässä rajasta {edge}, joten seuraavan pituusluokan todennäköisyys on {p}.",
    "length.ladies": "Ladies-varret tehdään tuuman lyhyemmiksi, joten tuuma lisätään takaisin.",
    "length.effect": "Oikea pituus antaa sinun seistä pallon luona luontevasti ja osua lavan keskelle; liian pitkä "
                     "maila johtaa kantaosumiin, liian lyhyt kärkiosumiin.",
    "length.summary_std": "Vakiopituus.", "length.summary": "{len}.",
    "lie.static": "Pituutesi ja ranne–lattia-mittasi perusteella PINGin väritaulukko antaa {v}.",
    "lie.ball_line": "Pallolinjan jäljet kallistuvat {v} {way}.",
    "lie.toward_toe": "kärkeä kohti (maila on sinulle liian pysty)",
    "lie.toward_heel": "kantaa kohti (maila on sinulle liian loiva)",
    "lie.trackman": "Vakio-lie-kulmaisella Takomo-testimailalla TrackMan näki kärjen olevan {v} {dir} osumahetkellä.",
    "lie.up": "ylhäällä", "lie.down": "alhaalla",
    "lie.need": "Kaiken kaikkiaan svingisi tarvitsee noin {need} (±{sd}), eli {lie}",
    "lie.need_alt": "; {alt}: todennäköisyys {p}.", "lie.need_end": ".",
    "lie.no_direct": "Emme ole vielä nähneet, miten mailasi kohtaa maan, ja vartalomitat ovat tarkkoja vain noin "
                     "asteen sisällä. Pallolinjatesti on nopein tapa varmistaa tämä.",
    "lie.effect": "Kun 7-rautasi lentää {carry}, jokainen aste liian pystyä lie-kulmaa lähettää pallon noin {offset} "
                  "tähtäyksestä {side}; jokainen aste liian loivaa toiseen suuntaan.",
    "side.left": "vasemmalle", "side.right": "oikealle",
    "lie.summary_std": "Vakio lie-kulma.", "lie.summary_up": "Lie-kulma {n}° pystympi.",
    "lie.summary_flat": "Lie-kulma {n}° loivempi.",
    "grip.standard": "standard", "grip.midsize": "midsize", "grip.oversize": "oversize",
    "grip.hand": "Kätesi on noin {v} rannetaipeesta sormenpäähän (±{sd}, lähteet: {sources}).",
    "grip.maps": "Se vastaa grippikokoa {grip}.",
    "grip.alt": "{alt}: todennäköisyys {p}; käsikuva pankkikortin kanssa ratkaisee asian.",
    "grip.summary": "Grippi: {grip}.",
    "grip.effect": "Liian ohut grippi päästää kädet kääntymään liikaa (pallo lähtee vasemmalle); liian paksu pitää "
                   "lavan auki (pallo lähtee oikealle).",
    "custom.shaft": "{model}-varsi ({material})", "custom.length": "pituus {v}", "custom.lie": "lie-kulma {v}",
    "custom.grip": "grippi {grip}",
    "purchase.stock": "Kaikki sovituksesi osat ovat vakiovaihtoehtoja, joten saat nopeamman toimituksen ja 30 päivän "
                      "palautusoikeuden.",
    "purchase.soft_lie": "vakio lie-kulman todennäköisyys on yhä {p}",
    "purchase.soft_length": "vakiopituuden todennäköisyys on yhä {p}",
    "purchase.custom": "Custom-kokoonpano näistä syistä: {because}. Custom-kokoonpanoja ei voi palauttaa.",
    "purchase.close": " Valinta on tiukka: {soft}. Jos 30 päivän palautusoikeus on sinulle tärkeä, vakiosetti on "
                      "järkevä valinta",
    "purchase.close_ball_line": ", tai tee ensin pallolinjatesti.", "purchase.close_end": ".",
    "purchase.non_stock": "Ei-vakio-osat: {list}.", "purchase.all_stock": "Kaikki osat ovat vakiovaihtoehtoja.",
    "purchase.p_stock": "Kun kaikki epävarmuudet huomioidaan, todennäköisyys sille, että vakiosetti on juuri sitä, "
                        "mitä svingisi vaatii, on {p}.",
    "purchase.policy": "Vakiosetit toimitetaan nopeammin ja niillä on 30 päivän palautusoikeus; custom-kokoonpanot "
                       "tehdään tilauksesta, eikä niitä voi palauttaa.",
    "build.stock": "vakio", "build.custom": "custom",
    "test.ball_line": "Piirrä palloon suora viiva taulutussilla, aseta pallo viiva pystysuorassa mailaa kohti, lyö "
                      "viisi 7-rautalyöntiä kovalta matolta ja kuvaa lapa jokaisen lyönnin jälkeen.",
    "test.hand": "Aseta kätesi pöydälle minkä tahansa pankkikortin viereen sormet yhdessä ja ota yksi kuva suoraan "
                 "yläpuolelta.",
    "test.video": "Kuvaa kolme 7-rautasvingiä edestä 240 fps:n hidastuksella niin, että koko maila näkyy kuvassa.",
    "test.radar": "Jos sinulla tai kaverillasi on launch monitor, lyö kymmenen 7-rautalyöntiä ja lataa session "
                  "vientitiedosto.",
    "warn.body_ratio": "Vartalokuva ilman vertailuesinettä painotetaan varovasti, kunnes sen virhe on mitattu oikeilla "
                       "golfareilla.",
    "diff.head": "mailanpää vaihtuu: {a} → {b}", "diff.shaft": "varsi vaihtuu: {a} → {b}",
    "diff.length": "pituus vaihtuu: {a} → {b} tuumaa", "diff.lie": "lie-kulma vaihtuu: {a}° → {b}°",
    "diff.grip": "grippi vaihtuu: {a} → {b}", "diff.build": "kokoonpano vaihtuu: {a} → {b}",
}

SV = {
    "and": " och ", "or": " eller ", "list_sep": ", ",
    "pct": "{n}\u00a0%", "inch": "{v} tum", "inch_adj": "{v} tum",
    "speed.under": "under {v}", "speed.over": "över {v}", "speed.range": "{a}-{b}",
    "score.1": "under 71", "score.2": "71-77", "score.3": "78-84", "score.4": "85-92", "score.5": "över 92",
    "src.TrackMan": "TrackMan", "src.TrackMan, Takomo test club": "TrackMan, Takomo-testklubba",
    "src.TrackMan, own club": "TrackMan, egen klubba", "src.ball-line test": "bollinjetest",
    "src.body photo (good)": "kroppsfoto (bra)", "src.body photo (poor)": "kroppsfoto (svagt)",
    "src.carry with loft": "carry med loft", "src.finger length": "fingerlängd",
    "src.glove size known": "känd handskstorlek", "src.hand photo": "handfoto",
    "src.home radar": "egen launch monitor", "src.known loft": "känd loft", "src.photo height": "längd från foto",
    "src.reported carry": "uppgiven carry", "src.reported speed": "uppgiven hastighet",
    "src.slow-motion video": "slow motion-video", "src.questionnaire": "frågeformulär",
    "ev.answer": "ditt svar", "ev.video": "slow motion-video", "ev.radar": "egen launch monitor",
    "ev.trackman": "TrackMan", "ev.body": "kroppsfoto", "ev.ball_line": "bollinjetest", "ev.hand": "handfoto",
    "ev.speed": "klubbhastighet 7-järn {speed}", "ev.carry": "carry 7-järn {carry}{loft}",
    "ev.carry_loft": " (7-järn med {loft})",
    "ev.median": "median {speed}", "ev.radar_reading": "median {speed}, carry {carry}", "ev.height": "längd {v}",
    "ev.wtf": "handled–golv {v}", "ev.tilt": "genomsnittlig lutning {v}", "ev.toe": "tå {v} vid träff",
    "ev.glove_unknown": "handskstorlek okänd", "ev.glove": "handske {v}", "ev.hand_length": "hand {v}",
    "rating.forgiveness": "förlåtande", "rating.distance": "längd", "rating.workability": "formbarhet",
    "rating.feel": "känsla", "rating.vs": "{name} {a} mot {b}",
    "char.forgiveness": "förlåtande", "char.distance": "längd", "char.forged feel": "smidd känsla",
    "char.distance control": "längdkontroll", "char.workability": "formbarhet",
    "char.less offset": "mindre offset", "char.more offset": "mer offset",
    "desc.101-mkii": "Förlåtande och långt i världens snyggaste paket",
    "desc.201-mkii": "Perfekt balans mellan längd, förlåtande egenskaper och formbarhet",
    "desc.201t-mkii": "Mer formbarhet för spelare som vill ha en aning förlåtande hjälp",
    "desc.301-cb": "Ett smitt cavity back-järn som balanserar kontroll och förlåtande egenskaper",
    "desc.301-mb": "Ett smitt muscle back-järn för maximal formbarhet och känsla",
    "head.score_optimism": "Du sa att du brukar gå runt på {said}. Vi minns alla våra bästa rundor: de flesta golfare "
                           "som svarar så har i snitt {real} över en säsong, så vi anpassar efter klubborna du behöver "
                           "en vanlig dag ({p} sannolikt).",
    "head.score_match": "Ditt typiska resultat, {score}, matchar klubbhuvuden byggda för den nivån ({p} säker på den "
                        "nivån).",
    "head.speed_points": "Vid cirka {speed} ({band}) får {a} {pa} hastighetspoäng och {b} {pb}.",
    "head.priorities": "Dina prioriteringar ({chars}) ger {pa} poäng till {a} och {pb} till {b}.",
    "head.total": "Totalt: {a} {ta}, {b} {tb}.",
    "head.tie_reason": "De två får samma poäng, så Takomos tie-break avgör: {a} ligger närmare din spelnivå. Båda är "
                       "bra val; skillnaden är avvägningen nedan.",
    "head.tie_summary": "{a} och {b} får samma poäng för dig; {a} vinner på tie-break.",
    "head.close_summary": "{a}, knappt före {b} ({pa} mot {pb}).",
    "head.summary": "{a}: {desc}.",
    "head.effect": "Jämfört med {b} (betyg av 5): {diffs}.",
    "flex.lady": "Dam", "flex.senior": "Senior", "flex.regular": "Regular", "flex.stiff": "Stiff",
    "flex.x-stiff": "X-Stiff", "material.steel": "stål", "material.graphite": "grafit",
    "launch.low": "låg", "launch.mid": "medelhög", "launch.high": "hög",
    "flight.low": "låg", "flight.mid": "medelhög", "flight.high": "hög",
    "tempo.smooth": "lugnt", "tempo.moderate": "måttligt", "tempo.quick": "snabbt",
    "shaft.speed": "Din klubbhastighet med 7-järn är cirka {speed}, plus minus {sd} (från {sources}). Det är "
                   "intervallet {band}, som kräver flex {flex} ({p} säker).",
    "shaft.alt_flex": "Det är {p} chans att du hör hemma i flex {flex} i stället.",
    "shaft.graphite": "Grafit eftersom {why}.",
    "shaft.graphite_light": "lättare grafit passar senior- och damflex",
    "shaft.graphite_women": "Takomo anpassar grafit för kvinnor",
    "shaft.graphite_age": "Takomo anpassar grafit från 70 års ålder",
    "shaft.graphite_profile": "grafit matchade din profil",
    "shaft.steel": "Stål, standardvalet för din hastighet och profil.",
    "shaft.any_tempo": "passar alla tempon", "shaft.tempos": "passar spelare med {list} tempo",
    "shaft.profile": "{model} ger {launch} bollflykt och {tempo_text}. Du behöver {flight} bollflykt ({pf}) och "
                     "svingar med {tempo} tempo ({pt}).",
    "shaft.effect": "{w} g. Ett mjukare flex än du behöver ger ofta högre bollflykt och mer spinn; ett styvare flyger "
                    "lägre och kan kännas hårt.",
    "shaft.summary": "{model} {flex} ({material}).",
    "length.height": "Din längd är cirka {v} (±{sd}, från {sources}).",
    "length.chart": "Enligt PING-längdtabellen som Takomo använder ger det {len}.",
    "length.edge": "Du är {dist} från gränsen vid {edge}, så nästa längd är {p} sannolik.",
    "length.ladies": "Damskaft byggs en tum kortare, så tummen läggs tillbaka.",
    "length.effect": "Rätt längd låter dig stå naturligt vid bollen och träffa mitt på bladet; för lång ger ofta "
                     "hälträffar, för kort tåträffar.",
    "length.summary_std": "Standardlängd.", "length.summary": "{len}.",
    "lie.static": "Utifrån din längd och ditt handled–golv-mått placerar PINGs färgtabell dig på {v}.",
    "lie.ball_line": "Dina bollinjemärken lutar {v} {way}.",
    "lie.toward_toe": "mot tån (klubban är för upprätt för dig)",
    "lie.toward_heel": "mot hälen (klubban är för flat för dig)",
    "lie.trackman": "Med en Takomo-testklubba med standardlie såg TrackMan tån {v} {dir} vid träff.",
    "lie.up": "upp", "lie.down": "ner",
    "lie.need": "Sammantaget behöver din sving cirka {need} (±{sd}), alltså {lie}",
    "lie.need_alt": "; {alt} är {p} sannolikt.", "lie.need_end": ".",
    "lie.no_direct": "Vi har ännu inte sett hur din klubba möter marken, och kroppsmått träffar bara inom ungefär en "
                     "grad. Ett bollinjetest är det snabbaste sättet att säkra detta.",
    "lie.effect": "Varje grad för upprätt startar ditt 7-järn på {carry} cirka {offset} {side} om siktlinjen; varje "
                  "grad för flat åt andra hållet.",
    "side.left": "vänster", "side.right": "höger",
    "lie.summary_std": "Standardlie.", "lie.summary_up": "{n}° upprätt.", "lie.summary_flat": "{n}° flat.",
    "grip.standard": "standard", "grip.midsize": "midsize", "grip.oversize": "oversize",
    "grip.hand": "Din hand är cirka {v} från handledsvecket till fingertoppen (±{sd}, från {sources}).",
    "grip.maps": "Det motsvarar greppstorlek {grip}.",
    "grip.alt": "{alt} är {p} sannolikt; ett handfoto med ett bankkort avgör.",
    "grip.summary": "Grepp: {grip}.",
    "grip.effect": "Ett för tunt grepp låter händerna rotera för mycket (bollen går vänster); ett för tjockt håller "
                   "bladet öppet (bollen går höger).",
    "custom.shaft": "{model}-skaft ({material})", "custom.length": "längd {v}", "custom.lie": "lie {v}",
    "custom.grip": "{grip}-grepp",
    "purchase.stock": "Alla delar i din fitting är standardalternativ, så du får snabbare leverans och 30 dagars "
                      "returrätt.",
    "purchase.soft_lie": "standardlie är fortfarande {p} sannolikt",
    "purchase.soft_length": "standardlängd är fortfarande {p} sannolik",
    "purchase.custom": "Specialbygge på grund av {because}. Specialbyggen kan inte returneras.",
    "purchase.close": " Det är jämnt: {soft}. Om 30 dagars returrätt är viktig för dig är ett standardset ett rimligt "
                      "val",
    "purchase.close_ball_line": ", eller gör bollinjetestet först.", "purchase.close_end": ".",
    "purchase.non_stock": "Delar utanför standard: {list}.", "purchase.all_stock": "Alla delar är standardalternativ.",
    "purchase.p_stock": "Med all osäkerhet inräknad är det {p} chans att ett standardset är vad din sving faktiskt "
                        "kräver.",
    "purchase.policy": "Standardset levereras snabbare och har 30 dagars returrätt; specialbyggen tillverkas på "
                       "beställning och kan inte returneras.",
    "build.stock": "standard", "build.custom": "special",
    "test.ball_line": "Rita en rak linje på en boll med en whiteboardpenna, placera den med linjen lodrätt mot "
                      "klubban, slå fem 7-järn från en hård matta och fotografera bladet efter varje slag.",
    "test.hand": "Lägg handen platt på ett bord bredvid valfritt bankkort, fingrarna ihop, och ta ett foto rakt "
                 "ovanifrån.",
    "test.video": "Filma tre 7-järnssvingar framifrån i 240 fps slow motion med hela klubban i bild.",
    "test.radar": "Om du eller en vän har en launch monitor, slå tio 7-järn och ladda upp sessionens exportfil.",
    "warn.body_ratio": "Kroppsfoto utan referensobjekt viktas försiktigt tills felet har mätts på riktiga golfare.",
    "diff.head": "klubbhuvudet ändras från {a} till {b}", "diff.shaft": "skaftet ändras från {a} till {b}",
    "diff.length": "längden ändras från {a} till {b} tum", "diff.lie": "lien ändras från {a} till {b} grader",
    "diff.grip": "greppet ändras från {a} till {b}", "diff.build": "bygget ändras från {a} till {b}",
}

DE = {
    "and": " und ", "or": " oder ", "list_sep": ", ",
    "pct": "{n}\u00a0%", "inch": "{v} Zoll", "inch_adj": "{v} Zoll",
    "speed.under": "unter {v}", "speed.over": "über {v}", "speed.range": "{a}-{b}",
    "score.1": "unter 71", "score.2": "71-77", "score.3": "78-84", "score.4": "85-92", "score.5": "über 92",
    "src.TrackMan": "TrackMan", "src.TrackMan, Takomo test club": "TrackMan, Takomo-Testschläger",
    "src.TrackMan, own club": "TrackMan, eigener Schläger", "src.ball-line test": "Ball-Linien-Test",
    "src.body photo (good)": "Körperfoto (gut)", "src.body photo (poor)": "Körperfoto (schwach)",
    "src.carry with loft": "Carry mit Loft", "src.finger length": "Fingerlänge",
    "src.glove size known": "bekannte Handschuhgröße", "src.hand photo": "Handfoto",
    "src.home radar": "eigener Launch-Monitor", "src.known loft": "bekannter Loft", "src.photo height": "Größe aus Foto",
    "src.reported carry": "angegebenes Carry", "src.reported speed": "angegebene Geschwindigkeit",
    "src.slow-motion video": "Zeitlupenvideo", "src.questionnaire": "Fragebogen",
    "ev.answer": "deine Angabe", "ev.video": "Zeitlupenvideo", "ev.radar": "eigener Launch-Monitor",
    "ev.trackman": "TrackMan", "ev.body": "Körperfoto", "ev.ball_line": "Ball-Linien-Test", "ev.hand": "Handfoto",
    "ev.speed": "Schlägerkopfgeschwindigkeit Eisen 7: {speed}", "ev.carry": "Carry Eisen 7: {carry}{loft}",
    "ev.carry_loft": " (Eisen 7 mit {loft})",
    "ev.median": "Median {speed}", "ev.radar_reading": "Median {speed}, Carry {carry}", "ev.height": "Größe {v}",
    "ev.wtf": "Handgelenk–Boden {v}", "ev.tilt": "mittlere Neigung {v}", "ev.toe": "Spitze {v} im Treffmoment",
    "ev.glove_unknown": "Handschuhgröße unbekannt", "ev.glove": "Handschuh {v}", "ev.hand_length": "Hand {v}",
    "rating.forgiveness": "Fehlerverzeihung", "rating.distance": "Weite", "rating.workability": "Formbarkeit",
    "rating.feel": "Gefühl", "rating.vs": "{name} {a} vs. {b}",
    "char.forgiveness": "Fehlerverzeihung", "char.distance": "Weite", "char.forged feel": "geschmiedetes Gefühl",
    "char.distance control": "Längenkontrolle", "char.workability": "Formbarkeit",
    "char.less offset": "weniger Offset", "char.more offset": "mehr Offset",
    "desc.101-mkii": "Fehlerverzeihung und Weite im elegantesten Paket der Welt",
    "desc.201-mkii": "Die perfekte Mischung aus Weite, Fehlerverzeihung und Formbarkeit",
    "desc.201t-mkii": "Mehr Formbarkeit für Spieler, die etwas Fehlerverzeihung brauchen",
    "desc.301-cb": "Ein geschmiedetes Cavity-Back-Eisen mit ausgewogener Kontrolle und Fehlerverzeihung",
    "desc.301-mb": "Ein geschmiedetes Muscle-Back-Eisen für maximale Formbarkeit und maximales Gefühl",
    "head.score_optimism": "Du hast gesagt, dass du meist {said} spielst. Wir alle erinnern uns an unsere besten "
                           "Runden: Die meisten Golfer mit dieser Antwort spielen über eine Saison im Schnitt {real}, "
                           "also fitten wir für die Schläger, die du an einem normalen Tag brauchst ({p} "
                           "wahrscheinlich).",
    "head.score_match": "Dein typisches Ergebnis von {score} passt zu Köpfen, die für dieses Niveau gebaut sind ({p} "
                        "sicher bei diesem Bereich).",
    "head.speed_points": "Bei etwa {speed} ({band}) bekommt das {a} {pa} Geschwindigkeitspunkte und das {b} {pb}.",
    "head.priorities": "Deine Prioritäten ({chars}) bringen dem {a} {pa} Punkte und dem {b} {pb}.",
    "head.total": "Gesamt: {a} {ta}, {b} {tb}.",
    "head.tie_reason": "Beide liegen punktgleich, also entscheidet Takomos Tie-Break: Das {a} liegt näher an deinem "
                       "Spielniveau. Beide sind eine gute Wahl; der Unterschied ist der Kompromiss unten.",
    "head.tie_summary": "{a} und {b} liegen für dich punktgleich; das {a} gewinnt den Tie-Break.",
    "head.close_summary": "{a}, knapp vor dem {b} ({pa} vs. {pb}).",
    "head.summary": "{a}: {desc}.",
    "head.effect": "Im Vergleich zum {b} (Bewertungen von 5): {diffs}.",
    "flex.lady": "Ladies", "flex.senior": "Senior", "flex.regular": "Regular", "flex.stiff": "Stiff",
    "flex.x-stiff": "X-Stiff", "material.steel": "Stahl", "material.graphite": "Graphit",
    "launch.low": "niedrig", "launch.mid": "mittelhoch", "launch.high": "hoch",
    "flight.low": "niedrigen", "flight.mid": "mittelhohen", "flight.high": "hohen",
    "tempo.smooth": "ruhigem", "tempo.moderate": "mittlerem", "tempo.quick": "schnellem",
    "shaft.speed": "Deine Schlägerkopfgeschwindigkeit mit dem Eisen 7 liegt bei etwa {speed}, plus/minus {sd} "
                   "(Quellen: {sources}). Das ist der Bereich {band}, der Flex {flex} verlangt ({p} sicher).",
    "shaft.alt_flex": "Mit {p} Wahrscheinlichkeit gehörst du stattdessen in Flex {flex}.",
    "shaft.graphite": "Graphit, weil {why}.",
    "shaft.graphite_light": "leichteres Graphit zu Senior- und Ladies-Flex passt",
    "shaft.graphite_women": "Takomo Frauen mit Graphit fittet",
    "shaft.graphite_age": "Takomo ab 70 Jahren mit Graphit fittet",
    "shaft.graphite_profile": "Graphit zu deinem Profil passte",
    "shaft.steel": "Stahl, der Standard für deine Geschwindigkeit und dein Profil.",
    "shaft.any_tempo": "passt zu jedem Tempo", "shaft.tempos": "passt zu {list} Tempo",
    "shaft.profile": "Der {model} startet {launch} und {tempo_text}. Du brauchst einen {flight} Ballflug ({pf}) und "
                     "schwingst mit {tempo} Tempo ({pt}).",
    "shaft.effect": "{w} g. Ein weicherer Flex als nötig startet meist höher mit mehr Spin; ein steiferer fliegt "
                    "flacher und kann sich bretthart anfühlen.",
    "shaft.summary": "{model} {flex} ({material}).",
    "length.height": "Deine Körpergröße beträgt etwa {v} (±{sd}, Quellen: {sources}).",
    "length.chart": "Laut der PING-Längentabelle, die Takomo verwendet, ergibt das {len}.",
    "length.edge": "Du bist {dist} von der Grenze bei {edge} entfernt, daher ist die nächste Länge zu {p} "
                   "wahrscheinlich.",
    "length.ladies": "Ladies-Schäfte werden einen Zoll kürzer gebaut, daher wird der Zoll wieder addiert.",
    "length.effect": "Die richtige Länge lässt dich natürlich zum Ball stehen und die Schlagflächenmitte treffen; zu "
                     "lang führt eher zu Treffern an der Ferse, zu kurz an der Spitze.",
    "length.summary_std": "Standardlänge.", "length.summary": "{len}.",
    "lie.static": "Aus deiner Größe und dem Abstand Handgelenk–Boden ergibt die PING-Farbtabelle {v}.",
    "lie.ball_line": "Deine Ball-Linien-Abdrücke neigen sich {v} {way}.",
    "lie.toward_toe": "zur Spitze (der Schläger ist für dich zu aufrecht)",
    "lie.toward_heel": "zur Ferse (der Schläger ist für dich zu flach)",
    "lie.trackman": "Mit einem Takomo-Testschläger mit Standard-Lie sah TrackMan die Spitze im Treffmoment {v} {dir}.",
    "lie.up": "oben", "lie.down": "unten",
    "lie.need": "Insgesamt braucht dein Schwung etwa {need} (±{sd}), also {lie}",
    "lie.need_alt": "; {alt} ist zu {p} wahrscheinlich.", "lie.need_end": ".",
    "lie.no_direct": "Wir haben noch nicht gesehen, wie dein Schläger den Boden trifft, und Körpermaße sind nur auf "
                     "etwa ein Grad genau. Ein Ball-Linien-Test ist der schnellste Weg, das abzusichern.",
    "lie.effect": "Jedes Grad zu aufrecht schickt dein Eisen 7 mit {carry} Carry etwa {offset} {side} vom Ziel weg; "
                  "jedes Grad zu flach in die andere Richtung.",
    "side.left": "nach links", "side.right": "nach rechts",
    "lie.summary_std": "Standard-Lie.", "lie.summary_up": "{n}° aufrecht.", "lie.summary_flat": "{n}° flach.",
    "grip.standard": "Standard", "grip.midsize": "Midsize", "grip.oversize": "Oversize",
    "grip.hand": "Deine Hand misst etwa {v} von der Handgelenksfalte bis zur Fingerspitze (±{sd}, "
                 "Quellen: {sources}).",
    "grip.maps": "Das entspricht einem {grip}-Griff.",
    "grip.alt": "{alt} ist zu {p} wahrscheinlich; ein Handfoto mit einer Bankkarte klärt das.",
    "grip.summary": "Griff: {grip}.",
    "grip.effect": "Ein zu dünner Griff lässt die Hände überdrehen (Bälle gehen nach links); ein zu dicker hält die "
                   "Schlagfläche offen (Bälle gehen nach rechts).",
    "custom.shaft": "{model}-Schaft ({material})", "custom.length": "Länge {v}", "custom.lie": "Lie {v}",
    "custom.grip": "{grip}-Griff",
    "purchase.stock": "Alle Teile deines Fittings sind Standardoptionen, also bekommst du schnellere Lieferung und 30 "
                      "Tage Rückgaberecht.",
    "purchase.soft_lie": "Standard-Lie ist noch zu {p} wahrscheinlich",
    "purchase.soft_length": "Standardlänge ist noch zu {p} wahrscheinlich",
    "purchase.custom": "Custom-Build wegen {because}. Custom-Builds können nicht zurückgegeben werden.",
    "purchase.close": " Es ist knapp: {soft}. Wenn dir das 30-tägige Rückgaberecht wichtig ist, ist ein Standardsatz "
                      "eine vernünftige Wahl",
    "purchase.close_ball_line": ", oder mach zuerst den Ball-Linien-Test.", "purchase.close_end": ".",
    "purchase.non_stock": "Nicht-Standard-Teile: {list}.", "purchase.all_stock": "Alle Teile sind Standardoptionen.",
    "purchase.p_stock": "Über alle Unsicherheiten hinweg liegt die Wahrscheinlichkeit bei {p}, dass ein Standardsatz "
                        "genau das ist, was dein Schwung braucht.",
    "purchase.policy": "Standardsätze werden schneller geliefert und haben 30 Tage Rückgaberecht; Custom-Builds werden "
                       "auf Bestellung gefertigt und können nicht zurückgegeben werden.",
    "build.stock": "Standard", "build.custom": "Custom",
    "test.ball_line": "Zieh mit einem Whiteboard-Marker eine gerade Linie auf einen Ball, leg ihn mit der Linie "
                      "senkrecht zum Schläger hin, schlag fünf Eisen 7 von einer harten Matte und fotografiere nach "
                      "jedem Schlag die Schlagfläche.",
    "test.hand": "Leg deine Hand flach neben eine beliebige Bankkarte auf einen Tisch, Finger zusammen, und mach ein "
                 "Foto direkt von oben.",
    "test.video": "Filme drei Schwünge mit dem Eisen 7 frontal in 240-fps-Zeitlupe, mit dem ganzen Schläger im Bild.",
    "test.radar": "Wenn du oder ein Freund einen Launch-Monitor habt, schlag zehn Eisen 7 und lade den Export der "
                  "Session hoch.",
    "warn.body_ratio": "Ein Körperfoto ohne Referenzobjekt wird vorsichtig gewichtet, bis sein Fehler an echten "
                       "Golfern gemessen ist.",
    "diff.head": "Schlägerkopf wechselt von {a} zu {b}", "diff.shaft": "Schaft wechselt von {a} zu {b}",
    "diff.length": "Länge wechselt von {a} zu {b} Zoll", "diff.lie": "Lie wechselt von {a} zu {b} Grad",
    "diff.grip": "Griff wechselt von {a} zu {b}", "diff.build": "Build wechselt von {a} zu {b}",
}

MESSAGES: dict[str, dict[str, str]] = {"en": EN, "fi": FI, "sv": SV, "de": DE}


@dataclass(frozen=True)
class Loc:
    lang: str = "en"
    units: str = "imperial"

    @property
    def metric(self) -> bool:
        return self.units == "metric"

    def t(self, key: str, **kw) -> str:
        return MESSAGES[self.lang][key].format(**kw)

    def _dec(self, s: str) -> str:
        return s if self.lang == "en" else s.replace(".", ",")

    def num(self, v: float, d: int = 0) -> str:
        return self._dec(f"{v:.{d}f}")

    def signed(self, v: float, d: int = 1) -> str:
        return self._dec(f"{v:+.{d}f}")

    def pct(self, p: float) -> str:
        return self.t("pct", n=round(100 * p))

    def deg(self, v: float, d: int = 1, sign: bool = False) -> str:
        return (self.signed(v, d) if sign else self.num(v, d)) + "°"

    def cm(self, v: float, d: int = 1) -> str:
        return f"{self.num(v, d)} cm"

    def inches(self, v: float) -> str:
        return self.t("inch", v=self.signed(v, 1))

    def speed_value(self, mph: float, d: int = 0) -> str:
        return self.num(mph * MPH_TO_KMH if self.metric else mph, d)

    def speed(self, mph: float, d: int = 0) -> str:
        return f"{self.speed_value(mph, d)} {'km/h' if self.metric else 'mph'}"

    def dist(self, yd: float, d: int = 0) -> str:
        return f"{self.num(yd * YD_TO_M if self.metric else yd, d)} {'m' if self.metric else 'yd'}"

    def dist_adj(self, yd: float, d: int = 0) -> str:
        """Distance used as an adjective: "150-yd 7-iron" in English, plain elsewhere."""
        return self.dist(yd, d).replace(" ", "-") if self.lang == "en" else self.dist(yd, d)

    def speed_band(self, band: int) -> str:
        lo, hi = SPEED_BAND_MPH[band]
        unit = "km/h" if self.metric else "mph"
        if lo is None:
            return self.t("speed.under", v=f"{self.speed_value(hi)} {unit}")
        if hi is None:
            return self.t("speed.over", v=f"{self.speed_value(lo)} {unit}")
        return self.t("speed.range", a=self.speed_value(lo), b=self.speed_value(hi)) + f" {unit}"

    def sources(self, s: str) -> str:
        return " + ".join(MESSAGES[self.lang].get(f"src.{x}", x) for x in s.split(" + "))

    def join(self, items: list[str], word: str = "and") -> str:
        return self.t(word).join(items)

    def listing(self, items: list[str]) -> str:
        return self.t("list_sep").join(items)
