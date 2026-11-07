import { PhoneCamera } from "@/components/live/PhoneCamera";
import { pageTitle } from "@/i18n/server";

export const generateMetadata = () => pageTitle("phone");

export default async function PhoneCameraPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <PhoneCamera code={code} />;
}
