import type { Lang, Locale } from "@/i18n/config";
import type { components } from "./api-types";

type S = components["schemas"];
export type FitRequest = S["FitRequest"];
export type FitResponse = S["FitResponse"];
export type Questionnaire = S["Questionnaire"];
export type Evidence = S["Evidence"];
export type Component = S["Component"];
export type NextTest = S["NextTest"];
export type Overrides = S["Overrides"];
export type WhatIfResponse = S["WhatIfResponse"];
export type BodyPhoto = S["BodyPhoto"];
export type HandPhoto = S["HandPhoto"];
export type SwingVideo = S["SwingVideo"];
export type LaunchMonitor = S["LaunchMonitor"];
export type Shot = S["Shot"];
export type Reading = S["Reading"];
export type ImportResult = S["ImportResult"];
export type Characteristic = NonNullable<Questionnaire["characteristics"]>[number];

export type HeadInfo = {
  slug: string;
  name: string;
  description: string;
  seven_iron_loft_deg: number;
  seven_iron_offset_mm: number;
  target_score_label: string;
  ratings: Record<"distance" | "forgiveness" | "workability" | "distance_control" | "feel" | "offset", number>;
  stock_shafts: string[];
};
export type ShaftInfo = {
  slug: string;
  model: string;
  manufacturer: string;
  material: string;
  flex: string;
  weight_g: number | null;
  tempo_profile: string[] | null;
  flight_profile: string[] | null;
};
export type Catalog = { heads: HeadInfo[]; shafts: ShaftInfo[] };

const BASE = "/api/pf";

export class ApiError extends Error {
  /** Stable reason from endpoints that return `{detail: {code, message}}`; "rate" for 429s. */
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let detail = res.statusText;
    let code = res.status === 429 ? "rate" : undefined;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") detail = body.detail;
      else if (typeof body.detail?.code === "string") {
        code = body.detail.code;
        detail = body.detail.message ?? code;
      } else detail = JSON.stringify(body.detail);
    } catch {}
    throw new ApiError(res.status, detail, code);
  }
  return res.json() as Promise<T>;
}

const fit = (id: string, path: string, loc: Locale) =>
  `/v1/fits/${encodeURIComponent(id)}${path}?lang=${loc.lang}&units=${loc.units}`;

/** Every fit is worded in the golfer's language and units; the spec itself never depends on them. */
export const api = {
  catalog: (lang: Lang) => call<Catalog>(`/v1/catalog?lang=${lang}`),
  createFit: (req: Omit<FitRequest, "locale">, loc: Locale) =>
    call<FitResponse>("/v1/fits", { method: "POST", body: JSON.stringify({ ...req, locale: loc }) }),
  getFit: (id: string, loc: Locale) => call<FitResponse>(fit(id, "", loc)),
  addEvidence: (id: string, ev: Evidence, loc: Locale) =>
    call<FitResponse>(fit(id, "/evidence", loc), { method: "POST", body: JSON.stringify(ev) }),
  whatIf: (id: string, ov: Overrides, loc: Locale) =>
    call<WhatIfResponse>(fit(id, "/what-if", loc), { method: "POST", body: JSON.stringify(ov) }),
  voiceSession: (id?: string) =>
    call<{ signed_url: string }>(`/v1/voice/session${id ? `?fit_id=${encodeURIComponent(id)}` : ""}`),
  readLaunchPhoto: (image: string) =>
    call<ImportResult>("/v1/launch-monitor/photo", { method: "POST", body: JSON.stringify({ image }) }),
  readLaunchVideo: (frames: string[]) =>
    call<ImportResult>("/v1/launch-monitor/video", { method: "POST", body: JSON.stringify({ frames }) }),
  readLaunchReport: (url: string) =>
    call<ImportResult>("/v1/launch-monitor/report", { method: "POST", body: JSON.stringify({ url }) }),
};
