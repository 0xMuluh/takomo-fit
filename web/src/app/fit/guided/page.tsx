import { FitSession } from "@/components/session/FitSession";
import { pageTitle } from "@/i18n/server";

export const generateMetadata = () => pageTitle("guided");

export default function GuidedFitPage() {
  return <FitSession />;
}
