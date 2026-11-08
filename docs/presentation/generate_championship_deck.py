"""Generate Championship Presentation Deck for Takomo Pocket Fitter (Finals).

Strictly adhering to clean sentence case, large readable typography, and Takomo brand styling:
- Sentence case everywhere (no unnecessary mid-sentence capitalizations)
- Large, bold typography matching the challenge brief (no tiny 9pt fluff)
- Elimination of repetitive labels ('core objective', 'key metric', etc.)
- 16:9 Widescreen (13.333 x 7.5 in)
- Nordic Dark Palette (#0B0B0B canvas, #141414 cards, #262626 borders)
- Large visuals dominating 70-80% of every slide
- Orange stickman branding throughout
"""
from pathlib import Path
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_championship_deck(output_path: str):
    prs = pptx.Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Constants
    C_BG = RGBColor(11, 11, 11)           # #0B0B0B
    C_CARD = RGBColor(20, 20, 20)         # #141414
    C_CARD_BORDER = RGBColor(38, 38, 38)  # #262626
    C_WHITE = RGBColor(255, 255, 255)
    C_OFFWHITE = RGBColor(230, 230, 230)
    C_MUTED = RGBColor(150, 150, 150)
    C_ACCENT = RGBColor(255, 110, 1)      # #FF6E01 Takomo Orange
    C_GREEN = RGBColor(52, 211, 153)      # #34D399 Fairway Green Bright
    C_GREEN_BG = RGBColor(19, 42, 28)     # #132A1C Deep Fairway Box
    C_CYAN = RGBColor(56, 189, 248)       # #38BDF8
    C_RED = RGBColor(239, 68, 68)

    assets = Path("docs/assets")
    header_logo = assets / "takomo_fit_header.png"
    phone_dual = assets / "live_session.png"
    fit_result_ui = assets / "fit_result.png"
    schematic_cv = assets / "golfer_biomechanics_clean.png"
    if not schematic_cv.exists():
        schematic_cv = assets / "golfer_biomechanics_schematic.png"
    schematic_ball_line = assets / "ball_line_impact_schematic.png"
    schematic_bayes = assets / "bayesian_engine_pipeline.png"
    schematic_d2c = assets / "d2c_trust_bottleneck.png"
    fig_baselines = assets / "fig4_baselines_dev.png"
    qr_code = assets / "app_qr_code.png"

    def set_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = C_BG
        bg.line.fill.background()
        return bg

    def add_top_nav(slide, kicker: str, title: str):
        kicker_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(8.5), Inches(0.35))
        tf_k = kicker_box.text_frame
        tf_k.word_wrap = True
        tf_k.margin_left = tf_k.margin_top = tf_k.margin_right = tf_k.margin_bottom = 0
        p_k = tf_k.paragraphs[0]
        p_k.text = kicker
        p_k.font.size = Pt(12)
        p_k.font.bold = True
        p_k.font.color.rgb = C_ACCENT

        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.72), Inches(10.2), Inches(0.65))
        tf_t = title_box.text_frame
        tf_t.word_wrap = True
        tf_t.margin_left = tf_t.margin_top = tf_t.margin_right = tf_t.margin_bottom = 0
        p_t = tf_t.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(25)
        p_t.font.bold = True
        p_t.font.color.rgb = C_WHITE

        if header_logo.exists():
            slide.shapes.add_picture(str(header_logo), Inches(10.6), Inches(0.45), height=Inches(0.44))

    # =========================================================================
    # SLIDE 1: Title Slide (Hero Dark with Phone Mockup)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_bg(s1)

    kicker_box = s1.shapes.add_textbox(Inches(0.9), Inches(1.15), Inches(6.8), Inches(0.35))
    tf0 = kicker_box.text_frame
    tf0.word_wrap = True
    tf0.margin_left = tf0.margin_top = tf0.margin_right = tf0.margin_bottom = 0
    p0 = tf0.paragraphs[0]
    p0.text = "Since AI Hackathon 2026 · Turku, Finland"
    p0.font.size = Pt(13)
    p0.font.bold = True
    p0.font.color.rgb = C_ACCENT

    if header_logo.exists():
        s1.shapes.add_picture(str(header_logo), Inches(0.9), Inches(1.6), width=Inches(4.8))

    left_box = s1.shapes.add_textbox(Inches(0.9), Inches(2.6), Inches(6.8), Inches(4.4))
    tf1 = left_box.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = 0

    p2 = tf1.paragraphs[0]
    p2.text = "Ilmari: the fitter in your pocket"
    p2.font.size = Pt(26)
    p2.font.bold = True
    p2.font.color.rgb = C_ACCENT
    p2.space_after = Pt(16)

    p3 = tf1.add_paragraph()
    p3.text = "5 mins with a master club fitter anywhere anytime"
    p3.font.size = Pt(20)
    p3.font.bold = True
    p3.font.color.rgb = C_WHITE
    p3.space_after = Pt(26)

    bullets = [
        "•  ElevenLabs multimodal voice",
        "•  Zero-print smartphone vision",
        "•  87.91 score · 0 unbuildable specs"
    ]
    for b in bullets:
        pt = tf1.add_paragraph()
        pt.text = b
        pt.font.size = Pt(17)
        pt.font.bold = True
        pt.font.color.rgb = C_OFFWHITE
        pt.space_after = Pt(10)

    if phone_dual.exists():
        s1.shapes.add_picture(str(phone_dual), Inches(7.7), Inches(1.1), width=Inches(5.0))

    # =========================================================================
    # SLIDE 2: The D2C Trust Bottleneck & Return Paradox
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_bg(s2)
    add_top_nav(s2, "The commercial challenge", "The D2C trust bottleneck & return paradox")

    ctx_box = s2.shapes.add_textbox(Inches(0.8), Inches(1.4), Inches(11.7), Inches(0.55))
    tf_c = ctx_box.text_frame
    tf_c.word_wrap = True
    p_c = tf_c.paragraphs[0]
    p_c.text = "Takomo sells €70M+ direct-to-consumer across 109 countries. Over 25% of all iron sales flow through the online fitter:"
    p_c.font.size = Pt(15)
    p_c.font.color.rgb = C_OFFWHITE

    if schematic_d2c.exists():
        s2.shapes.add_picture(str(schematic_d2c), Inches(0.8), Inches(2.05), width=Inches(11.7))

    # =========================================================================
    # SLIDE 3: Meet Ilmari (Conversational AI in Your Pocket)
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_bg(s3)
    add_top_nav(s3, "Conversational AI", "Meet Ilmari: the fitter in your pocket")

    ctx_ilmari = s3.shapes.add_textbox(Inches(0.8), Inches(1.4), Inches(11.7), Inches(0.5))
    tf_ilm = ctx_ilmari.text_frame
    tf_ilm.word_wrap = True
    p_ilm = tf_ilm.paragraphs[0]
    p_ilm.text = "Real-time ElevenLabs voice agent speaking EN, FI, SV, and DE with pro-fitter dialogue:"
    p_ilm.font.size = Pt(15)
    p_ilm.font.color.rgb = C_OFFWHITE

    ilmari_cards = [
        ("01", "Pro-fitter dialogue", "Flags 15-yard carry overestimates with pro-fitter tact", C_ACCENT),
        ("02", "Ball-flight physics", "Explains dynamic lie mismatch in lateral dispersion yards", C_CYAN),
        ("03", "Transparent close calls", "Surfaces runner-up specs with explicit trade-off reasoning", C_WHITE),
        ("04", "Commercial stock advice", "Recommends standard build to protect 30-day return policy", C_GREEN)
    ]
    x_pos = 0.8
    for num, title, desc, col in ilmari_cards:
        card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x_pos), Inches(2.1), Inches(2.78), Inches(4.7))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD
        card.line.color.rgb = C_CARD_BORDER

        tf_c = card.text_frame
        tf_c.word_wrap = True

        p_num = tf_c.paragraphs[0]
        p_num.text = num
        p_num.font.size = Pt(28)
        p_num.font.bold = True
        p_num.font.color.rgb = col
        p_num.space_after = Pt(14)

        p_t = tf_c.add_paragraph()
        p_t.text = title
        p_t.font.size = Pt(17)
        p_t.font.bold = True
        p_t.font.color.rgb = C_WHITE
        p_t.space_after = Pt(18)

        p_d = tf_c.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(14)
        p_d.font.color.rgb = C_OFFWHITE
        p_d.line_spacing = 1.3

        x_pos += 2.98

    # =========================================================================
    # SLIDE 4: Zero-Print Smartphone Vision & Edge Biometrics
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_bg(s4)
    add_top_nav(s4, "Computer vision innovation", "Zero-print smartphone vision & on-device biometrics")

    if schematic_cv.exists():
        s4.shapes.add_picture(str(schematic_cv), Inches(0.8), Inches(1.5), height=Inches(5.3))

    cv_cards = [
        ("85.60 mm", "ISO card optical anchor", "Any payment card in wallet · zero printer sheets needed", C_ACCENT),
        ("Hand span", "MediaPipe Hands", "Wrist crease-to-fingertip span mapped to factory grip sizes", C_GREEN),
        ("Pose & tempo", "Stature & swing ratio", "Wrist-to-floor proportions and 3:1 kinetic swing ratio", C_CYAN),
        ("Zero egress", "100% on-device WASM", "Strict GDPR compliance: zero raw camera frames leave device", C_WHITE)
    ]
    y_pos = 1.5
    for stat, title, desc, col in cv_cards:
        card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(y_pos), Inches(5.6), Inches(1.22))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD
        card.line.color.rgb = C_CARD_BORDER

        tf = card.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = f"{stat}  ·  {title}"
        p1.font.size = Pt(15.5)
        p1.font.bold = True
        p1.font.color.rgb = col
        p1.space_after = Pt(4)

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(13)
        p2.font.color.rgb = C_OFFWHITE

        y_pos += 1.36

    # =========================================================================
    # SLIDE 5: Dynamic Strike Geometry: Solving Lie Angle
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_bg(s5)
    add_top_nav(s5, "Impact biomechanics", "Dynamic strike geometry: solving lie angle")

    ctx_bio = s5.shapes.add_textbox(Inches(0.8), Inches(1.35), Inches(11.7), Inches(0.5))
    tf_b = ctx_bio.text_frame
    tf_b.word_wrap = True
    p_b = tf_b.paragraphs[0]
    p_b.text = "Static wrist-to-floor is only a prior. Dynamic shaft droop and toe-down delivery define ball flight:"
    p_b.font.size = Pt(15)
    p_b.font.color.rgb = C_OFFWHITE

    if schematic_ball_line.exists():
        s5.shapes.add_picture(str(schematic_ball_line), Inches(0.8), Inches(2.0), width=Inches(11.7))

    # =========================================================================
    # SLIDE 6: The Bayesian Fitting Engine (Deterministic Architecture)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_bg(s6)
    add_top_nav(s6, "Engineering architecture", "The Bayesian fitting engine: guaranteed buildable")

    ctx_eng = s6.shapes.add_textbox(Inches(0.8), Inches(1.35), Inches(11.7), Inches(0.5))
    tf_e = ctx_eng.text_frame
    tf_e.word_wrap = True
    p_e = tf_e.paragraphs[0]
    p_e.text = "Linear-Gaussian fusion across combinatorial evidence masks + N=800 Monte Carlo draws through strict Takomo rules:"
    p_e.font.size = Pt(15)
    p_e.font.color.rgb = C_OFFWHITE

    if schematic_bayes.exists():
        s6.shapes.add_picture(str(schematic_bayes), Inches(0.8), Inches(2.0), width=Inches(11.7))

    # =========================================================================
    # SLIDE 7: Benchmark Verification & Calibration (Large Stat Numbers)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_bg(s7)
    add_top_nav(s7, "Benchmark validation", "Benchmark results: 87.91 score & calibrated uncertainty")

    # Left panel: 4 bold stat cards (large typography matching challenge brief)
    stat_panel = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.3))
    stat_panel.fill.solid()
    stat_panel.fill.fore_color.rgb = C_CARD
    stat_panel.line.color.rgb = C_CARD_BORDER

    tf_s = stat_panel.text_frame
    tf_s.word_wrap = True

    p_top = tf_s.paragraphs[0]
    p_top.text = "Official benchmark (N=3,000 dev golfers)"
    p_top.font.size = Pt(13)
    p_top.font.bold = True
    p_top.font.color.rgb = C_ACCENT
    p_top.space_after = Pt(14)

    big_stats = [
        ("87.91", "Spec agreement score · +10.8 pts vs baseline (77.10)", C_ACCENT),
        ("39.0%", "Full-spec exact match · ~3x questionnaire baseline (13.7%)", C_GREEN),
        ("0", "Unbuildable specs · 100% manufacturable feasibility", C_CYAN),
        ("< 0.015", "Calibration ECE · strict alignment between confidence & truth", C_WHITE)
    ]
    for val, desc, col in big_stats:
        p_v = tf_s.add_paragraph()
        p_v.text = val
        p_v.font.size = Pt(28)
        p_v.font.bold = True
        p_v.font.color.rgb = col

        p_d = tf_s.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(12.5)
        p_d.font.color.rgb = C_OFFWHITE
        p_d.space_after = Pt(10)

    if fig_baselines.exists():
        s7.shapes.add_picture(str(fig_baselines), Inches(6.7), Inches(1.5), width=Inches(5.8))

    caveat = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.7), Inches(5.35), Inches(5.8), Inches(1.45))
    caveat.fill.solid()
    caveat.fill.fore_color.rgb = C_GREEN_BG
    caveat.line.color.rgb = C_GREEN
    tf_cav = caveat.text_frame
    tf_cav.word_wrap = True
    p_cav1 = tf_cav.paragraphs[0]
    p_cav1.text = "Next phase: pro-fitter clinical trials"
    p_cav1.font.size = Pt(13)
    p_cav1.font.bold = True
    p_cav1.font.color.rgb = C_GREEN
    p_cav1.space_after = Pt(4)

    p_cav2 = tf_cav.add_paragraph()
    p_cav2.text = "Parameter recovery verified on 3,000 challenge benchmark golfers. In-person clinical trials with club fitters are scheduled next."
    p_cav2.font.size = Pt(12)
    p_cav2.font.color.rgb = C_WHITE
    p_cav2.line_spacing = 1.3

    # =========================================================================
    # SLIDE 8: The Resolved Fit & Commercial Safety
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_bg(s8)
    add_top_nav(s8, "Checkout & commercial safety", "The resolved fit: confidence badges & stock advice")

    if fit_result_ui.exists():
        s8.shapes.add_picture(str(fit_result_ui), Inches(0.8), Inches(1.5), width=Inches(7.3))

    res_chips = [
        ("Confirmed badges", "≥95% posterior confidence locks length, shaft, and grip", C_GREEN),
        ("Amber 'To check' flag", "Prompts 4-point ball-line test when lie angle is uncertain", C_ACCENT),
        ("Physics carry telemetry", "84 mph radar swing carries 146 yd with 33° loft", C_CYAN),
        ("1-click storefront buy", "Pre-fills custom Iron 201T MKII line items directly into cart", C_WHITE)
    ]
    y_res = 1.5
    for title, desc, col in res_chips:
        c_box = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.4), Inches(y_res), Inches(4.1), Inches(1.22))
        c_box.fill.solid()
        c_box.fill.fore_color.rgb = C_CARD
        c_box.line.color.rgb = C_CARD_BORDER

        tf_r = c_box.text_frame
        tf_r.word_wrap = True

        p1 = tf_r.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(15)
        p1.font.bold = True
        p1.font.color.rgb = col
        p1.space_after = Pt(4)

        p2 = tf_r.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(12.5)
        p2.font.color.rgb = C_OFFWHITE

        y_res += 1.36

    # =========================================================================
    # SLIDE 9: Pilot Rollout (From Canary to Storefront)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_bg(s9)
    add_top_nav(s9, "Pilot rollout", "From canary to storefront")

    phases = [
        ("01", "Canary pilot", "5% web traffic A/B test",
         "Controlled trial vs static form on takomogolf.com to verify 0 unbuildable specs.", C_ACCENT),
        ("02", "European locales", "FI, SV, DE rollout",
         "Native voice and text engines driving conversion parity across Nordic & EU markets.", C_GREEN),
        ("03", "Headless Shopify", "Storefront integration",
         "Pre-filled cart permalinks with custom build line items to cut RMA returns.", C_CYAN),
        ("04", "Full bag suite", "Woods & wedges",
         "Bayesian model expansion from irons to drivers and wedges, lifting average order value.", C_WHITE)
    ]

    px = 0.85
    for num, p_title, p_scope, p_goal, col in phases:
        p_box = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(px), Inches(1.7), Inches(2.82), Inches(4.8))
        p_box.fill.solid()
        p_box.fill.fore_color.rgb = C_CARD
        p_box.line.color.rgb = C_CARD_BORDER

        tf_p = p_box.text_frame
        tf_p.word_wrap = True
        tf_p.margin_left = tf_p.margin_right = Inches(0.24)
        tf_p.margin_top = Inches(0.32)
        tf_p.margin_bottom = Inches(0.24)

        p_num = tf_p.paragraphs[0]
        p_num.text = num
        p_num.font.size = Pt(32)
        p_num.font.bold = True
        p_num.font.color.rgb = col
        p_num.space_after = Pt(14)

        p_head = tf_p.add_paragraph()
        p_head.text = p_title
        p_head.font.size = Pt(17.5)
        p_head.font.bold = True
        p_head.font.color.rgb = C_WHITE
        p_head.space_after = Pt(6)

        p_sub = tf_p.add_paragraph()
        p_sub.text = p_scope
        p_sub.font.size = Pt(12.5)
        p_sub.font.bold = True
        p_sub.font.color.rgb = col
        p_sub.space_after = Pt(22)

        p_body = tf_p.add_paragraph()
        p_body.text = p_goal
        p_body.font.size = Pt(13.5)
        p_body.font.color.rgb = C_OFFWHITE
        p_body.line_spacing = 1.35

        px += 2.96

    # =========================================================================
    # SLIDE 10: Try Takomo Fit Right Now & Key Takeaways
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_bg(s10)
    add_top_nav(s10, "Experience Ilmari", "Try Takomo Fit right now")

    # Left: QR Code card with stickman logo
    qr_card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(4.5), Inches(5.3))
    qr_card.fill.solid()
    qr_card.fill.fore_color.rgb = C_CARD
    qr_card.line.color.rgb = C_ACCENT
    qr_card.line.width = Pt(1.5)

    tf_qr = qr_card.text_frame
    tf_qr.word_wrap = True
    tf_qr.margin_left = tf_qr.margin_right = Inches(0.2)
    tf_qr.margin_top = Inches(0.3)
    p_q1 = tf_qr.paragraphs[0]
    p_q1.text = "Scan to launch live app"
    p_q1.font.size = Pt(16)
    p_q1.font.bold = True
    p_q1.font.color.rgb = C_ACCENT
    p_q1.alignment = PP_ALIGN.CENTER

    qr_path = assets / "app_qr_code_stickman.png"
    if not qr_path.exists():
        qr_path = assets / "app_qr_code.png"

    if qr_path.exists():
        s10.shapes.add_picture(str(qr_path), Inches(1.45), Inches(2.2), width=Inches(3.2))

    url_box = s10.shapes.add_textbox(Inches(0.8), Inches(5.8), Inches(4.5), Inches(0.8))
    tf_url = url_box.text_frame
    tf_url.word_wrap = True
    p_url = tf_url.paragraphs[0]
    p_url.text = "takomo-fitter.web.app"
    p_url.font.size = Pt(17)
    p_url.font.bold = True
    p_url.font.color.rgb = C_WHITE
    p_url.alignment = PP_ALIGN.CENTER

    # Right: Takeaway pillars
    summary_card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.6), Inches(1.5), Inches(6.9), Inches(5.3))
    summary_card.fill.solid()
    summary_card.fill.fore_color.rgb = C_CARD
    summary_card.line.color.rgb = C_CARD_BORDER

    tf_sum = summary_card.text_frame
    tf_sum.word_wrap = True

    ps0 = tf_sum.paragraphs[0]
    ps0.text = "What this means for Takomo"
    ps0.font.size = Pt(18)
    ps0.font.bold = True
    ps0.font.color.rgb = C_WHITE
    ps0.space_after = Pt(18)

    pillars = [
        ("1. Bridges the D2C trust gap", "Smartphone camera & voice replace self-reported guessing", C_ACCENT),
        ("2. 100% manufacturable output", "0 unbuildable specs guaranteed through physical guardrails", C_CYAN),
        ("3. Protects checkout conversion", "Stock advice eliminates 30-day return policy hesitation", C_GREEN),
        ("4. Production ready today", "Live on Google Cloud Run & Firebase with automated CI/CD", C_WHITE)
    ]
    for p_t, p_d, col in pillars:
        pt = tf_sum.add_paragraph()
        pt.text = p_t
        pt.font.size = Pt(15.5)
        pt.font.bold = True
        pt.font.color.rgb = col

        pd = tf_sum.add_paragraph()
        pd.text = f"   ↳ {p_d}"
        pd.font.size = Pt(13)
        pd.font.color.rgb = C_OFFWHITE
        pd.space_after = Pt(12)

    prs.save(output_path)
    print(f"Championship presentation generated at: {output_path}")

if __name__ == '__main__':
    build_championship_deck("docs/presentation/Takomo_Pocket_Fitter_Finals.pptx")
