import { FitResult } from "@/components/results/FitResult";
import { pageTitle } from "@/i18n/server";

export const generateMetadata = () => pageTitle("spec");

export default async function FitResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FitResult id={id} />;
}
