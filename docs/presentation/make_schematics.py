"""Generate high-resolution dark-themed CAD/HUD schematics using clean sentence case and large legible typography."""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

COLOR_BG = '#0B0B0B'
COLOR_SURFACE = '#141414'
COLOR_BORDER = '#262626'
COLOR_ACCENT = '#FF6E01'
COLOR_ACCENT_SOFT = '#FFA252'
COLOR_GREEN = '#1F5135'
COLOR_GREEN_BRIGHT = '#34D399'
COLOR_WHITE = '#FFFFFF'
COLOR_MUTED = '#999999'
COLOR_CYAN = '#38BDF8'
COLOR_RED = '#EF4444'

def make_ball_line_schematic(out_path):
    fig, ax = plt.subplots(figsize=(11, 5.5), facecolor=COLOR_BG)
    ax.set_facecolor(COLOR_BG)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 55)
    ax.axis('off')

    # Background grid lines (subtle HUD style)
    for x in range(5, 100, 10):
        ax.axvline(x, color='#1A1A1A', lw=0.5, ls='--')
    for y in range(5, 55, 10):
        ax.axhline(y, color='#1A1A1A', lw=0.5, ls='--')

    # Card 1: Marked ball
    card1 = patches.FancyBboxPatch((3, 5), 29, 45, boxstyle="round,pad=1,rounding_size=2",
                                   facecolor=COLOR_SURFACE, edgecolor=COLOR_BORDER, lw=1.5)
    ax.add_patch(card1)
    ax.text(17.5, 46.5, "Step 1: marked ball", color=COLOR_ACCENT, fontsize=13, fontweight='bold', ha='center')
    ax.text(17.5, 43, "Equatorial line transfer", color=COLOR_MUTED, fontsize=10, ha='center')

    circle = patches.Circle((17.5, 26), 11, facecolor='#1F1F1F', edgecolor='#E0E0E0', lw=2)
    ax.add_patch(circle)
    ax.plot([12.5, 22.5], [17, 35], color=COLOR_ACCENT, lw=4, solid_capstyle='round')
    ax.text(17.5, 9.5, "Strike 3–5 balls with 7-iron\nLine transfers directly to face", color=COLOR_WHITE, fontsize=10, ha='center', linespacing=1.4)

    # Card 2: Clubface 4-point impact registration
    card2 = patches.FancyBboxPatch((35, 5), 33, 45, boxstyle="round,pad=1,rounding_size=2",
                                   facecolor=COLOR_SURFACE, edgecolor=COLOR_BORDER, lw=1.5)
    ax.add_patch(card2)
    ax.text(51.5, 46.5, "Step 2: 4-point registration", color=COLOR_ACCENT, fontsize=13, fontweight='bold', ha='center')
    ax.text(51.5, 43, "On-device tap alignment", color=COLOR_MUTED, fontsize=10, ha='center')

    club_pts = np.array([[38, 17], [42, 34], [62, 35], [64, 18]])
    clubface = patches.Polygon(club_pts, closed=True, facecolor='#1E1E1E', edgecolor='#666666', lw=1.5)
    ax.add_patch(clubface)

    for gy in range(21, 32, 3):
        ax.plot([43, 60], [gy, gy + 0.5], color='#333333', lw=1)

    pts = {
        'Heel': (40, 17.5),
        'Toe': (63, 18.5),
        'Line bottom': (49, 21),
        'Line top': (53, 31)
    }
    ax.plot([40, 63], [17.5, 18.5], color=COLOR_CYAN, lw=2, ls=':')
    ax.plot([49, 53], [21, 31], color=COLOR_ACCENT, lw=3.5)

    for name, (px, py) in pts.items():
        c = patches.Circle((px, py), 1.2, facecolor=COLOR_ACCENT_SOFT, edgecolor=COLOR_WHITE, lw=1.5)
        ax.add_patch(c)
        offset_y = 2.4 if 'top' in name else -2.6
        ax.text(px, py + offset_y, name, color=COLOR_WHITE, fontsize=9.5, fontweight='bold', ha='center')

    ax.text(51.5, 9.5, "4 taps determine precise dynamic\nrelative face tilt angle (θ_tilt)", color=COLOR_WHITE, fontsize=10, ha='center', linespacing=1.4)

    # Card 3: Dynamic lie resolution
    card3 = patches.FancyBboxPatch((71, 5), 26, 45, boxstyle="round,pad=1,rounding_size=2",
                                   facecolor=COLOR_SURFACE, edgecolor=COLOR_BORDER, lw=1.5)
    ax.add_patch(card3)
    ax.text(84, 46.5, "Step 3: dynamic lie", color=COLOR_GREEN_BRIGHT, fontsize=13, fontweight='bold', ha='center')
    ax.text(84, 43, "Lateral yardage dispersion", color=COLOR_MUTED, fontsize=10, ha='center')

    ax.text(84, 34, "58.3% exact", color=COLOR_GREEN_BRIGHT, fontsize=20, fontweight='bold', ha='center')
    ax.text(84, 29, "Dynamic lie accuracy on dev\nvs. ~41% static baseline", color=COLOR_WHITE, fontsize=10, ha='center', linespacing=1.3)

    acc_box = patches.FancyBboxPatch((73, 9), 22, 15, boxstyle="round,pad=0.5,rounding_size=1.5",
                                     facecolor='#132A1C', edgecolor=COLOR_GREEN_BRIGHT, lw=1.2)
    ax.add_patch(acc_box)
    ax.text(84, 19, "Dispersion impact", color=COLOR_GREEN_BRIGHT, fontsize=11, fontweight='bold', ha='center')
    ax.text(84, 13, "2° dynamic lie miss =\n3.1 yd push/pull at 160 yd",
            color=COLOR_WHITE, fontsize=9.5, ha='center', linespacing=1.3)

    plt.tight_layout()
    plt.savefig(out_path, dpi=200, bbox_inches='tight', facecolor=COLOR_BG)
    plt.close()
    print(f"Created {out_path}")

def make_bayesian_pipeline_schematic(out_path):
    fig, ax = plt.subplots(figsize=(11, 5), facecolor=COLOR_BG)
    ax.set_facecolor(COLOR_BG)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 52)
    ax.axis('off')

    stages = [
        {
            "num": "01",
            "x": 2, "w": 22,
            "title": "Evidence input",
            "color": COLOR_CYAN,
            "items": ["Voice dialogue answers", "ISO card scale factor", "Pose wrist-to-floor", "Ball-line impact tilt"]
        },
        {
            "num": "02",
            "x": 27, "w": 22,
            "title": "Fusion engine",
            "color": COLOR_ACCENT,
            "items": ["Linear-Gaussian fusion", "Evidence mask handling", "Dynamic tempo prior", "Continuous distributions"]
        },
        {
            "num": "03",
            "x": 52, "w": 22,
            "title": "Monte Carlo",
            "color": COLOR_WHITE,
            "items": ["N=800 joint draws", "Posterior uncertainty", "Close-call runner ups", "ECE < 0.015 calibrated"]
        },
        {
            "num": "04",
            "x": 77, "w": 21,
            "title": "Takomo output",
            "color": COLOR_GREEN_BRIGHT,
            "items": ["0 unbuildable specs", "Standard return logic", "Confirmed badges", "1-click cart injection"]
        }
    ]

    for s in stages:
        box = patches.FancyBboxPatch((s["x"], 5), s["w"], 42, boxstyle="round,pad=1,rounding_size=2",
                                     facecolor=COLOR_SURFACE, edgecolor=COLOR_BORDER, lw=1.5)
        ax.add_patch(box)
        ax.text(s["x"] + 3, 42.5, s["num"], color=s["color"], fontsize=14, fontweight='bold')
        ax.text(s["x"] + s["w"]/2 + 2, 42.5, s["title"], color=s["color"], fontsize=12, fontweight='bold', ha='center')
        ax.plot([s["x"] + 2, s["x"] + s["w"] - 2], [38, 38], color='#2A2A2A', lw=1)

        y = 32
        for item in s["items"]:
            ax.plot(s["x"] + 3, y + 0.8, marker='o', markersize=4, color=s["color"])
            ax.text(s["x"] + 5.5, y, item, color=COLOR_WHITE, fontsize=9.5, va='center')
            y -= 7.0

    arrow_props = dict(arrowstyle="->,head_width=0.4,head_length=0.6", color=COLOR_ACCENT, lw=2)
    ax.annotate("", xy=(26, 26), xytext=(24, 26), arrowprops=arrow_props)
    ax.annotate("", xy=(51, 26), xytext=(49, 26), arrowprops=arrow_props)
    ax.annotate("", xy=(76, 26), xytext=(74, 26), arrowprops=arrow_props)

    plt.tight_layout()
    plt.savefig(out_path, dpi=200, bbox_inches='tight', facecolor=COLOR_BG)
    plt.close()
    print(f"Created {out_path}")

def make_d2c_bottleneck_schematic(out_path):
    fig, ax = plt.subplots(figsize=(11, 5), facecolor=COLOR_BG)
    ax.set_facecolor(COLOR_BG)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 50)
    ax.axis('off')

    # Card 1: Self-report noise
    b1 = patches.FancyBboxPatch((3, 5), 29, 41, boxstyle="round,pad=1,rounding_size=2",
                                facecolor=COLOR_SURFACE, edgecolor='#7F1D1D', lw=1.5)
    ax.add_patch(b1)
    ax.text(17.5, 41.5, "Self-report noise", color=COLOR_RED, fontsize=13, fontweight='bold', ha='center')
    ax.text(17.5, 38, "Unverified web inputs", color=COLOR_MUTED, fontsize=10, ha='center')

    ax.text(17.5, 29, "+14 yd", color=COLOR_RED, fontsize=22, fontweight='bold', ha='center')
    ax.text(17.5, 24, "Average 7-iron carry overestimate", color=COLOR_WHITE, fontsize=9.5, ha='center')

    ax.text(17.5, 17, "5° loft variance", color=COLOR_RED, fontsize=14, fontweight='bold', ha='center')
    ax.text(17.5, 11, "~12 m carry difference on same swing\nacross iron models", color=COLOR_MUTED, fontsize=9, ha='center', linespacing=1.3)

    # Card 2: Return paradox
    b2 = patches.FancyBboxPatch((35.5, 5), 29, 41, boxstyle="round,pad=1,rounding_size=2",
                                facecolor=COLOR_SURFACE, edgecolor=COLOR_ACCENT, lw=1.5)
    ax.add_patch(b2)
    ax.text(50, 41.5, "The return paradox", color=COLOR_ACCENT, fontsize=13, fontweight='bold', ha='center')
    ax.text(50, 38, "Commercial cart abandonment", color=COLOR_MUTED, fontsize=10, ha='center')

    s_stock = patches.FancyBboxPatch((37.5, 22), 25, 14, boxstyle="round,pad=0.5,rounding_size=1",
                                    facecolor='#132A1C', edgecolor=COLOR_GREEN_BRIGHT, lw=1.2)
    ax.add_patch(s_stock)
    ax.text(50, 31, "Standard stock sets", color=COLOR_GREEN_BRIGHT, fontsize=11, fontweight='bold', ha='center')
    ax.text(50, 25.5, "30-day hassle-free returns\nHigh shopper confidence", color=COLOR_WHITE, fontsize=9, ha='center', linespacing=1.3)

    s_custom = patches.FancyBboxPatch((37.5, 8), 25, 12, boxstyle="round,pad=0.5,rounding_size=1",
                                     facecolor='#261515', edgecolor=COLOR_RED, lw=1.2)
    ax.add_patch(s_custom)
    ax.text(50, 15, "Custom builds (+0.5\", 2° up)", color=COLOR_RED, fontsize=11, fontweight='bold', ha='center')
    ax.text(50, 10.5, "Non-returnable built-to-order\nShopper hesitation → abandonment", color=COLOR_WHITE, fontsize=9, ha='center', linespacing=1.3)

    # Card 3: Pocket Fitter solution
    b3 = patches.FancyBboxPatch((68, 5), 29, 41, boxstyle="round,pad=1,rounding_size=2",
                                facecolor=COLOR_SURFACE, edgecolor=COLOR_GREEN_BRIGHT, lw=1.5)
    ax.add_patch(b3)
    ax.text(82.5, 41.5, "Pocket Fitter solution", color=COLOR_GREEN_BRIGHT, fontsize=13, fontweight='bold', ha='center')
    ax.text(82.5, 38, "Evidence + stock advice", color=COLOR_MUTED, fontsize=10, ha='center')

    ax.text(82.5, 29, "≥95%", color=COLOR_GREEN_BRIGHT, fontsize=22, fontweight='bold', ha='center')
    ax.text(82.5, 24, "Confirmed confidence badges\nfor locked components", color=COLOR_WHITE, fontsize=9.5, ha='center', linespacing=1.3)

    ax.text(82.5, 15.5, "Protects 30-day returns", color=COLOR_CYAN, fontsize=12, fontweight='bold', ha='center')
    ax.text(82.5, 10.5, "Recommends stock sets when custom\nadvantage is within tolerance", color=COLOR_MUTED, fontsize=9, ha='center', linespacing=1.3)

    plt.tight_layout()
    plt.savefig(out_path, dpi=200, bbox_inches='tight', facecolor=COLOR_BG)
    plt.close()
    print(f"Created {out_path}")

if __name__ == '__main__':
    make_ball_line_schematic('docs/assets/ball_line_impact_schematic.png')
    make_bayesian_pipeline_schematic('docs/assets/bayesian_engine_pipeline.png')
    make_d2c_bottleneck_schematic('docs/assets/d2c_trust_bottleneck.png')
