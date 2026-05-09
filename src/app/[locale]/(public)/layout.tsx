import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { CookieConsent } from "@/components/analytics/cookie-consent";
import { CursorBlob } from "@/components/ui/cursor-blob";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GoogleAnalytics />
      <CursorBlob />
      <Header />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer />
      <CookieConsent />
    </>
  );
}
