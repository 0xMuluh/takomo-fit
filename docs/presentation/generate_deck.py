"""Generate Takomo Pocket Fitter Finals Presentation Deck.

Strictly aligned with Takomo Fit brand styling:
- Primary: Ink (#0B0B0B) & Paper (#F8F8F8)
- Accent: Takomo Orange (#FF6E01 / #E86300)
- Validation: Fairway Green (#1F5135 / #E3EEE6)
- Typography: Bold Condensed Uppercase Headers & High-Contrast Cards
- Official Assets: Takomo Logo lockup (TAKOMO | FIT), Iron Head Cutouts (101 MKII, 201 MKII, 301 CB)
"""
from pathlib import Path
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck(output_path: str):
    prs = pptx.Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Exact Takomo Fit Theme Colors from web/src/app/globals.css
    COLOR_INK = RGBColor(11, 11, 11)           # #0B0B0B (Deep Black)
    COLOR_PAPER = RGBColor(248, 248, 248)       # #F8F8F8 (Takomo Warm Off-White)
    COLOR_WHITE = RGBColor(255, 255, 255)       # #FFFFFF
    COLOR_ACCENT = RGBColor(255, 110, 1)        # #FF6E01 (Signature Takomo Orange)
    COLOR_ACCENT_STRONG = RGBColor(232, 99, 0)  # #E86300
    COLOR_FAIRWAY = RGBColor(31, 81, 53)        # #1F5135 (Deep Fairway Green)
    COLOR_FAIRWAY_SOFT = RGBColor(227, 238, 230)# #E3EEE6 (Soft Fairway Pill)
    COLOR_MUTED = RGBColor(107, 107, 107)       # #6B6B6B (Slate Text)
    COLOR_LINE = RGBColor(224, 224, 224)        # #E0E0E0 (Subtle Border)
    COLOR_CARD_DARK = RGBColor(22, 22, 22)      # #161616 (Dark surface)
    COLOR_LINE_DARK = RGBColor(40, 40, 40)      # #282828

    assets_dir = Path("docs/assets")
    logo_dark = assets_dir / "takomo-logo-dark.png"
    iron_101 = assets_dir / "101_MKII_product_cut.png"
    iron_201 = assets_dir / "201_MKII_product_cut.png"
    iron_301 = assets_dir / "301_CB_product_cut.png"

    def apply_background(slide, dark=True):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_INK if dark else COLOR_PAPER
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, dark=True, category="TAKOMO GOLF · ONLINE FITTING"):
        # Category tracking label
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(8.5), Inches(0.35))
        tf_c = cat_box.text_frame
        tf_c.word_wrap = True
        p_c = tf_c.paragraphs[0]
        p_c.text = category.upper()
        p_c.font.size = Pt(10)
        p_c.font.bold = True
        p_c.font.color.rgb = COLOR_ACCENT

        # Title (Uppercase Bold Display Style)
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(8.8), Inches(0.75))
        tf_t = title_box.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = title_text.upper()
        p_t.font.size = Pt(23)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_WHITE if dark else COLOR_INK

        # Takomo Logo Lockup (Top Right): Wordmark + Divider + FIT
        if logo_dark.exists():
            slide.shapes.add_picture(str(logo_dark), Inches(10.6), Inches(0.55), width=Inches(1.5))
            div = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(12.2), Inches(0.57), Inches(0.015), Inches(0.2))
            div.fill.solid()
            div.fill.fore_color.rgb = RGBColor(120, 120, 120)
            div.line.fill.background()
            fit_box = slide.shapes.add_textbox(Inches(12.25), Inches(0.50), Inches(0.6), Inches(0.3))
            p_fit = fit_box.text_frame.paragraphs[0]
            p_fit.text = "FIT"
            p_fit.font.size = Pt(13)
            p_fit.font.bold = True
            p_fit.font.color.rgb = COLOR_ACCENT

        # Divider line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.48), Inches(11.7), Inches(0.015))
        line.fill.solid()
        line.fill.fore_color.rgb = COLOR_LINE_DARK if dark else COLOR_LINE
        line.line.fill.background()

    def add_card(slide, left, top, width, height, title, lines, dark=True, highlight=None, pill_text=None):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD_DARK if dark else COLOR_WHITE
        card.line.color.rgb = COLOR_LINE_DARK if dark else COLOR_LINE
        card.line.width = Pt(1)

        tx_box = slide.shapes.add_textbox(left + Inches(0.22), top + Inches(0.2), width - Inches(0.44), height - Inches(0.4))
        tf = tx_box.text_frame
        tf.word_wrap = True

        p0 = tf.paragraphs[0]
        p0.text = title.upper()
        p0.font.size = Pt(14)
        p0.font.bold = True
        p0.font.color.rgb = COLOR_WHITE if dark else COLOR_INK

        if pill_text:
            p_pill = tf.add_paragraph()
            p_pill.text = f"CONFIRMED: {pill_text}"
            p_pill.font.size = Pt(10)
            p_pill.font.bold = True
            p_pill.font.color.rgb = COLOR_FAIRWAY
            p_pill.space_before = Pt(2)

        if highlight:
            pv = tf.add_paragraph()
            pv.text = highlight
            pv.font.size = Pt(26)
            pv.font.bold = True
            pv.font.color.rgb = COLOR_ACCENT
            pv.space_before = Pt(4)

        for line in lines:
            p = tf.add_paragraph()
            p.text = "• " + line if not line.startswith("•") else line
            p.font.size = Pt(11.5)
            p.font.color.rgb = RGBColor(180, 180, 180) if dark else COLOR_MUTED
            p.space_before = Pt(3)

        return card

    # ==========================================
    # SLIDE 1: TITLE SLIDE
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    apply_background(s1, dark=True)

    # Wordmark + FIT badge
    if logo_dark.exists():
        s1.shapes.add_picture(str(logo_dark), Inches(1.2), Inches(1.3), width=Inches(2.8))
        div = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(4.15), Inches(1.32), Inches(0.025), Inches(0.38))
        div.fill.solid()
        div.fill.fore_color.rgb = RGBColor(120, 120, 120)
        div.line.fill.background()
        fit_box = s1.shapes.add_textbox(Inches(4.25), Inches(1.20), Inches(1.2), Inches(0.6))
        p_fit = fit_box.text_frame.paragraphs[0]
        p_fit.text = "FIT"
        p_fit.font.size = Pt(26)
        p_fit.font.bold = True
        p_fit.font.color.rgb = COLOR_ACCENT

    # Orange Accent Bar
    bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.2), Inches(2.3), Inches(0.08), Inches(3.6))
    bar.fill.solid()
    bar.fill.fore_color.rgb = COLOR_ACCENT
    bar.line.fill.background()

    tb = s1.shapes.add_textbox(Inches(1.5), Inches(2.2), Inches(6.8), Inches(3.8))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "THE FITTER IN YOUR POCKET · TURKU 2026"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_ACCENT

    p2 = tf.add_paragraph()
    p2.text = "TAKOMO POCKET FITTER"
    p2.font.size = Pt(40)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_WHITE
    p2.space_before = Pt(8)

    p3 = tf.add_paragraph()
    p3.text = "Making an online club fitting feel as trustworthy as an hour with a professional fitter."
    p3.font.size = Pt(16)
    p3.font.color.rgb = RGBColor(190, 190, 190)
    p3.space_before = Pt(10)

    p4 = tf.add_paragraph()
    p4.text = "Live App: takomo-fitter.web.app\nGitHub: github.com/0xMuluh/takomo-fit\nDev Spec Score: 87.91 / 100 (Dev Split)"
    p4.font.size = Pt(12)
    p4.font.color.rgb = COLOR_ACCENT
    p4.space_before = Pt(16)

    # Hero Iron Cutout on Title Slide (Right side)
    if iron_101.exists():
        s1.shapes.add_picture(str(iron_101), Inches(8.5), Inches(1.8), width=Inches(4.5))

    s1.notes_slide.notes_text_frame.text = (
        "Takomo sells direct to golfers with no shops or middlemen, reaching over €70M in revenue across 109 countries. "
        "More than 25% of our iron orders go through the online fitting. Today, we show you how to give every golfer "
        "the confidence of an hour with a pro fitter right on their phone."
    )

    # ==========================================
    # SLIDE 2: THE PROBLEM (WHY TRUST MATTERS)
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    apply_background(s2, dark=True)
    add_header(s2, "The Real Problem: The Gap is Trust")

    add_card(s2, Inches(0.8), Inches(1.8), Inches(3.8), Inches(5.0),
             "Direct-to-Consumer Model",
             ["€70M+ Revenue today, up tenfold in 2 years",
              "109 Countries shipped direct",
              "600k+ Online fittings in the last 6 months",
              "Fitting decides the model, specs, and stock vs custom"],
             highlight="25%+ Iron Sales")

    add_card(s2, Inches(4.8), Inches(1.8), Inches(3.8), Inches(5.0),
             "The Questionnaire Limit",
             ["Self-reported carry: lab median over-report 15 yd",
              "7-iron lofts differ 29°-34° across brands (~12 m carry diff)",
              "Questionnaire returns a spec without measured evidence",
              "Custom builds cannot be returned"],
             highlight="Self-report")

    fig3_path = assets_dir / "fig3_selfreport_error.png"
    if fig3_path.exists():
        s2.shapes.add_picture(str(fig3_path), Inches(8.8), Inches(1.8), width=Inches(3.7))

    s2.notes_slide.notes_text_frame.text = (
        "A questionnaire asks the right questions, but it gives a result without evidence and without a clear why. "
        "Golfers guess their carry distance, and brand lofts vary up to 5 degrees. "
        "Because custom sets cannot be returned, any uncertainty at checkout leads to abandoned orders."
    )

    # ==========================================
    # SLIDE 3: THE SOLUTION (THREE PILLARS)
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    apply_background(s3, dark=True)
    add_header(s3, "Takomo Pocket Fitter: Multimodal AI Fitting")

    add_card(s3, Inches(0.8), Inches(1.8), Inches(4.5), Inches(2.4),
             "1. Voice Interviewer (Ilmari)",
             ["Conversational pro-fitter built with ElevenLabs",
              "Interviews golfer in EN, FI, SV, and DE",
              "Catches distance optimism and loft discrepancies",
              "Explains clubhead feel, bounce, and shaft profile"],
             highlight="Adaptive Voice")

    add_card(s3, Inches(0.8), Inches(4.4), Inches(4.5), Inches(2.4),
             "2. Zero-Print Vision & Bayes Fusion",
             ["Measures body, hand, and tempo with phone camera",
              "Uses any bank card as standard scale (no printer)",
              "Linear-Gaussian fusion over partial evidence masks",
              "UI Confirmed when confidence >= 95% and not a close call"],
             highlight="Edge Vision")

    landing_path = assets_dir / "landing_page.png"
    if landing_path.exists():
        s3.shapes.add_picture(str(landing_path), Inches(5.6), Inches(1.8), width=Inches(6.9))

    s3.notes_slide.notes_text_frame.text = (
        "Optional voice via ElevenLabs client tools opens camera measurements on the phone. "
        "Evidence feeds the FastAPI engine; decide.py samples 800 posterior draws through Takomo rules."
    )

    # ==========================================
    # SLIDE 4: ZERO-PRINT HARDWARE-FREE VISION
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    apply_background(s4, dark=True)
    add_header(s4, "Zero-Print Smartphone Vision & Phone Handoff")

    add_card(s4, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Bank Card Reference Scale (ISO/IEC 7810)",
             ["Starter kit used a printed A4 sheet; app uses ID-1 card instead",
              "ISO/IEC 7810 card: 85.60 mm x 53.98 mm scale in browser",
              "MediaPipe Hands: wrist crease to fingertip -> hand length",
              "Grip from GLOVE_EDGES_CM / glove->grip map (not 17.5/19.5 bands)",
              "MediaPipe Pose for height and wrist-to-floor ratio",
              "Lead wrist timing for backswing / downswing seconds"],
             highlight="No Printer")

    add_card(s4, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Desktop-to-Phone Pairing (/m/[code])",
             ["Desktop golfers scan a QR code with their mobile camera",
              "Phone opens instantly without login or app store download",
              "MediaPipe runs client-side: zero video leaves the device",
              "Live coaching cues ('step back 2 paces') stream to desktop",
              "Measurement locks and automatically updates desktop fit",
              "100% GDPR compliant zero-video-egress architecture"],
             highlight="Instant Pair")

    s4.notes_slide.notes_text_frame.text = (
        "Hand scale uses any bank or ID card instead of a printed sheet. "
        "Pose and hands run in the browser; only scalar measurements go to the API. "
        "Desktop shoppers scan a QR code to open /m/[code] on the phone for camera capture."
    )

    # ==========================================
    # SLIDE 5: DYNAMIC TESTS & RADAR INTEGRATION
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    apply_background(s5, dark=True)
    add_header(s5, "Dynamic Ball-Line Lie & Launch Monitor Fusion")

    add_card(s5, Inches(0.8), Inches(1.8), Inches(5.6), Inches(2.4),
             "Dynamic Ball-Line Lie Test",
             ["B1 questionnaire lie match ~41% (lab START_HERE)",
              "Delivery differs from static height / WTF charts",
              "Face photo: manual 4-point tap -> tiltDeg (not Hough)",
              "Dev component lie exact: 58.3% (model.json)"],
             highlight="Dynamic Lie")

    add_card(s5, Inches(0.8), Inches(4.4), Inches(5.6), Inches(2.4),
             "Launch Monitor Ingestion",
             ["Accepts TrackMan reports, CSV uploads, or radar screen photos",
              "Normalizes consumer radars: Garmin R10, Mevo+, SkyTrak",
              "Converts raw ball speed and dynamic loft to 7-iron physics"],
             highlight="Radar Agnostic")

    fig1_path = assets_dir / "fig1_physics_calibration.png"
    if fig1_path.exists():
        s5.shapes.add_picture(str(fig1_path), Inches(6.8), Inches(1.8), width=Inches(5.7))

    s5.notes_slide.notes_text_frame.text = (
        "B1 lie match is about 41%. Ball-line in the app is a four-point tap on a face photo (tiltDeg), not a Hough pipeline. "
        "Dev component lie exact is 58.3%. Launch-monitor CSV / screen / report import is available when configured."
    )

    # ==========================================
    # SLIDE 6: MATHEMATICAL RIGOR & CALIBRATION
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    apply_background(s6, dark=True)
    add_header(s6, "Calibrated Bayesian Fusion & Monte Carlo Decision")

    add_card(s6, Inches(0.8), Inches(1.8), Inches(3.6), Inches(5.0),
             "Linear-Gaussian Fusion",
             ["Pre-fits regression models for all evidence masks",
              "Optimal fallback routing for unobserved inputs",
              "Computes exact posterior mean and residual spread (sigma)",
              "HistGradientBoosting for discrete skill and flight priors"],
             highlight="Bayes Prior")

    add_card(s6, Inches(4.8), Inches(1.8), Inches(3.6), Inches(5.0),
             "Monte Carlo Engine (N=800)",
             ["Draws 800 hypothetical golfers from joint posterior",
              "Pushes draws through Takomo's exact engineering rules",
              "Evaluates complete product matrix (101 to 301 MB)",
              "Modal spec + confidence from draw frequencies"],
             highlight="800 Draws")

    add_card(s6, Inches(8.8), Inches(1.8), Inches(3.6), Inches(5.0),
             "Calibrated Output (ECE < 0.015)",
             ["Expected Calibration Error < 1.5% across all components",
              "Head ECE: 0.014 | Flex: 0.006 | Lie: 0.010 | Length: 0.009",
              "When model says 95%+, empirical hit rate is 98.8%-99.7%",
              "Only >=95% confidence receives the 'Confirmed' badge"],
             highlight="ECE < 0.015")

    s6.notes_slide.notes_text_frame.text = (
        "Spec selection is fusion plus 800 draws through Takomo product rules, not an LLM inventing numbers. "
        "Confidence is the empirical share of draws. ECE on the dev split is in model.json. "
        "UI Confirmed means >=95% confidence and not a close call."
    )

    # ==========================================
    # SLIDE 7: BENCHMARK RESULTS (TABLE & CHART)
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    apply_background(s7, dark=True)
    add_header(s7, "Benchmark Validation: Dev Split Performance")

    rows, cols = 6, 4
    left, top, width, height = Inches(0.8), Inches(1.8), Inches(7.5), Inches(4.2)
    table_shape = s7.shapes.add_table(rows, cols, left, top, width, height)
    tbl = table_shape.table

    tbl.columns[0].width = Inches(2.7)
    tbl.columns[1].width = Inches(1.6)
    tbl.columns[2].width = Inches(1.6)
    tbl.columns[3].width = Inches(1.6)

    table_data = [
        ["Benchmark Metric", "B1: Questionnaire", "B2: Rules+Phone", "Pocket Fitter"],
        ["Spec Agreement Score", "77.1", "83.6", "87.91"],
        ["Full Spec Exact Match %", "13.7 %", "25.3 %", "39.0 %"],
        ["Unbuildable / Missing Specs", "-", "-", "0"],
        ["Lie exact %", "~41 (START_HERE)", "-", "58.3"],
        ["Flex exact %", "-", "-", "90.8"]
    ]

    for r_idx, row in enumerate(table_data):
        for c_idx, val in enumerate(row):
            cell = tbl.cell(r_idx, c_idx)
            cell.text = val
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(11.5)
            p.alignment = PP_ALIGN.LEFT if c_idx == 0 else PP_ALIGN.CENTER
            if r_idx == 0:
                p.font.bold = True
                p.font.color.rgb = COLOR_ACCENT
                cell.fill.solid()
                cell.fill.fore_color.rgb = RGBColor(30, 30, 30)
            else:
                cell.fill.solid()
                cell.fill.fore_color.rgb = COLOR_CARD_DARK
                if c_idx == 3:
                    p.font.bold = True
                    p.font.color.rgb = RGBColor(74, 222, 128)
                else:
                    p.font.color.rgb = COLOR_WHITE

    fig4_path = assets_dir / "fig4_baselines_dev.png"
    if fig4_path.exists():
        s7.shapes.add_picture(str(fig4_path), Inches(8.6), Inches(1.8), width=Inches(3.9))

    fn_box = s7.shapes.add_textbox(Inches(0.8), Inches(6.2), Inches(11.7), Inches(0.5))
    tf_fn = fn_box.text_frame
    p_fn = tf_fn.paragraphs[0]
    p_fn.text = "Dev split n=3000 from model.json. Synthetic score = recovery under lab simulator assumptions, not pro-fitter agreement on real golfers."
    p_fn.font.size = Pt(10.5)
    p_fn.font.color.rgb = COLOR_MUTED

    s7.notes_slide.notes_text_frame.text = (
        "On 3,000 lab-dev golfers: B1 77.1 / 13.7% exact, B2 83.6 / 25.3%, Pocket Fitter 87.91 / 39.0%, unbuildable 0. "
        "Lie component exact is 58.3%, not 88%. That score is simulator recovery, not a live pro-fitter study."
    )

    # ==========================================
    # SLIDE 8: DESIGNING FOR TRUST
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    apply_background(s8, dark=True)
    add_header(s8, "Designing for Trust: Transparent Fitting Advice")

    add_card(s8, Inches(0.8), Inches(1.8), Inches(3.6), Inches(5.0),
             "1. Physical Explanations",
             ["Lateral miss from yards_per_lie_degree(loft, carry)",
              "Example: 160 yd, 29° loft, 2° lie miss ~ 3.1 yd",
              "Component reasons list evidence sources",
              "What-if overrides re-run decide"],
             highlight="explain.py")

    add_card(s8, Inches(4.8), Inches(1.8), Inches(3.6), Inches(5.0),
             "2. Close Calls",
             ["Runner-up shown when probability is split",
              "close_call flag on components",
              "Confirmed only at >=95% and not close",
              "Confidence = draw frequency, not marketing copy"],
             highlight="Close Calls")

    add_card(s8, Inches(8.8), Inches(1.8), Inches(3.6), Inches(5.0),
             "3. Stock vs Custom",
             ["Stock sets keep 30-day returns; custom does not",
              "stock_advice on FitResponse",
              "Recommends stock when custom gain is not justified",
              "Purchase component scored in the lab scorer"],
             highlight="stock_advice")

    s8.notes_slide.notes_text_frame.text = (
        "Explanations come from explain.py: evidence lists and lie dispersion from the loft/carry formula. "
        "Close calls surface the runner-up. stock_advice recommends stock when that keeps the return window."
    )

    # ==========================================
    # SLIDE 9: BUSINESS CASE & ROLLOUT
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    apply_background(s9, dark=True)
    add_header(s9, "Business Impact & Phased Rollout Plan")

    add_card(s9, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Brief facts (Takomo-provided)",
             ["€70M+ revenue; 109 countries",
              "600k+ fittings in last 6 months",
              ">25% of iron orders via online fitting",
              "Conversion / AOV / return € models: not provided",
              "Any uplift spreadsheet = illustrative assumptions only"],
             highlight="Brief facts")

    add_card(s9, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Suggested rollout",
             ["Live today: takomo-fitter.web.app",
              "Canary A/B on takomogolf.com vs questionnaire",
              "Locales already: en, fi, sv, de",
              "Shopify cart line items: planned, not shipped",
              "Later: driver / wedge models"],
             highlight="Next steps")

    s9.notes_slide.notes_text_frame.text = (
        "Use only brief facts for market context. Do not present invented conversion, AOV, or return euros as Takomo data. "
        "App is live; storefront embed and Shopify cart handoff are next engineering steps."
    )

    # ==========================================
    # SLIDE 10: CONCLUSION & DEMONSTRATION
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    apply_background(s10, dark=True)
    add_header(s10, "Takomo Pocket Fitter: The Pro-Fitter in Your Pocket")

    add_card(s10, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Experience the Live Deployed System",
             ["Live App: https://takomo-fitter.web.app/",
              "GitHub Repository: https://github.com/0xMuluh/takomo-fit",
              "Live voice consultation with Ilmari (ElevenLabs edge audio)",
              "Mobile phone handoff via QR code (/m/[code])",
              "Zero-print bank card hand sizing and MediaPipe Pose",
              "Calibrated Bayesian recommendations with ball-flight dispersion",
              "Full localization in English, Finnish, Swedish, and German"],
             highlight="takomo-fitter.web.app")

    voice_path = assets_dir / "voice_fitter.png"
    if voice_path.exists():
        s10.shapes.add_picture(str(voice_path), Inches(6.8), Inches(1.8), width=Inches(5.7))

    # Add real Iron 201 MKII cutout overlay on the corner
    if iron_201.exists():
        s10.shapes.add_picture(str(iron_201), Inches(10.5), Inches(4.3), width=Inches(2.5))

    s10.notes_slide.notes_text_frame.text = (
        "Demo the live app: questionnaire or voice, one phone measurement, then the result with confidence. "
        "Links: takomo-fitter.web.app and github.com/0xMuluh/takomo-fit."
    )

    prs.save(output_path)
    print(f"Deck written to {output_path}")

if __name__ == "__main__":
    out_file = "docs/presentation/Takomo_Pocket_Fitter_Finals.pptx"
    create_deck(out_file)
