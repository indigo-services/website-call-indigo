import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LeadFormPage } from '@/components/lead-forms/lead-form-page';
import { leadFormConfigs } from '@/content/lead-forms';

const slugConfigMap: Record<
  string,
  { config: (typeof leadFormConfigs)[keyof typeof leadFormConfigs]; metadata: Metadata }
> = {
  appointment: {
    config: leadFormConfigs.appointment,
    metadata: {
      title: 'Book an Appointment | Call Indigo',
      description:
        'Request a residential home service appointment with Call Indigo in Austin, Buda, Kyle, and San Marcos.',
    },
  },
  commercial: {
    config: leadFormConfigs.commercial,
    metadata: {
      title: 'Commercial Services Inquiry | Call Indigo',
      description:
        'Request commercial facility services, inspections, and maintenance support from Call Indigo.',
    },
  },
  contact: {
    config: leadFormConfigs.contact,
    metadata: {
      title: 'Contact | Call Indigo',
      description:
        'Contact Call Indigo for residential home services, facility services, and general questions.',
    },
  },
};

const validSlugs = Object.keys(slugConfigMap);

export function generateStaticParams() {
  return validSlugs.map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    const entry = slugConfigMap[slug];
    return entry?.metadata ?? {};
  });
}

export default async function FormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = slugConfigMap[slug];

  if (!entry) {
    notFound();
  }

  return <LeadFormPage config={entry.config} />;
}
