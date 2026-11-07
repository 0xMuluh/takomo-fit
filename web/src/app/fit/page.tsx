import { LiveFitter } from "@/components/live/LiveFitter";
import { pageTitle } from "@/i18n/server";

export const generateMetadata = () => pageTitle("live");

export default function FitPage() {
  return <LiveFitter />;
}
