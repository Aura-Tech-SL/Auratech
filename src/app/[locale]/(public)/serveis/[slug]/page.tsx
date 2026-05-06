import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ServiceJsonLd } from "@/components/seo/json-ld";
import { ServiceLandingClient } from "./service-landing-client";

const slugToKey: Record<string, string> = {
  "estrategia-digital": "strategy",
  "cloud-devops": "cloud",
  "desenvolupament": "dev",
  "iot-retail": "iot",
};

interface Props {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const key = slugToKey[params.slug];
  if (!key) return {};

  const t = await getTranslations({
    locale: params.locale,
    namespace: "serviceLanding",
  });

  return {
    title: t(`${key}.metaTitle`),
    description: t(`${key}.metaDesc`),
  };
}

export default async function ServiceLandingPage({ params }: Props) {
  const key = slugToKey[params.slug];
  if (!key) {
    notFound();
  }

  const t = await getTranslations({
    locale: params.locale,
    namespace: "serviceLanding",
  });

  return (
    <>
      <ServiceJsonLd
        name={t(`${key}.headline`)}
        description={t(`${key}.description`)}
      />
      <ServiceLandingClient slug={params.slug} />
    </>
  );
}
