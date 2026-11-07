"use client";

import { useI18n } from "@/i18n/context";
import type { Catalog, FitResponse } from "@/lib/api";
import type { FitContext } from "@/lib/session";
import { Card } from "../ui";

const MEASURED = /video|radar|TrackMan/;

/** What the golfer remembered next to what was measured. Shown only once a measurement has set their speed. */
export function SaidVsMeasured({ fit, ctx, catalog }: { fit: FitResponse; ctx?: FitContext; catalog?: Catalog }) {
  const l = useI18n();
  const h = l.t.honest;
  const speed = fit.estimates.speed;
  const q = ctx?.q;
  if (!speed || !q || !MEASURED.test(speed.sources) || (q.carry_yd == null && q.speed_mph == null)) return null;
  const carry = fit.estimates[`carry_${fit.spec.head}`]?.mean;
  const loft = catalog?.heads.find((x) => x.slug === fit.spec.head)?.seven_iron_loft_deg;

  return (
    <Card className="space-y-3">
      <h2 className="font-display text-[20px] font-bold uppercase tracking-wide">{h.title}</h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-[13px] text-muted">{h.said}</dt>
          <dd className="text-[17px] font-medium">
            {q.speed_mph != null ? h.saidSpeed(l.f.speed(q.speed_mph)) : h.saidCarry(l.f.dist(q.carry_yd!))}
          </dd>
        </div>
        <div>
          <dt className="text-[13px] text-muted">{h.measured}</dt>
          <dd className="text-[17px] font-medium">{h.measuredSpeed(l.f.speed(speed.mean, 1), l.f.speed(speed.sd, 1))}</dd>
          {carry != null && (
            <dd className="text-[14px] text-ink/80">
              {h.carryAt(l.f.dist(carry), fit.spec.head_name, loft != null ? l.f.deg(loft, 0) : undefined)}
            </dd>
          )}
        </div>
      </dl>
      <p className="text-[14px] text-muted">{h.footer}</p>
    </Card>
  );
}
