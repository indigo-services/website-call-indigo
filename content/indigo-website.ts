export const indigoWebsiteContent = {
  site: {
    brandName: 'INDIGO',
    legalName: 'Indigo Home & Facility Services',
    primaryPhone: '(512) 608-4999',
    publicEmailDisplay: 'support [at] indigoservices-tx.com',
    address: '1005 Meredith Drive, Austin, TX 78748',
    serviceArea: 'Austin, Texas and surrounding service areas',
  },
  navigation: [
    { label: 'Home', href: '#hero' },
    { label: 'Commercial', href: '/commercial' },
    { label: 'Residential', href: '/residential' },
    { label: 'Services', href: '#services' },
    { label: 'Contact', href: '#contact' },
  ],
  home: {
    seo: {
      title: 'Indigo Home & Facility Services',
      description:
        'Call Indigo for home, facility, rental property, commercial, and non-commercial service needs in Austin, Texas.',
    },
    hero: {
      title: 'Your single phone call for any address',
      body: 'Home services, facility support, repairs, walk-throughs, and project coordination from a local Austin team built for residential, rental, and commercial properties.',
      primaryCta: { label: 'Commercial', href: '/commercial' },
      secondaryCta: { label: 'Residential', href: '/residential' },
      phoneLabel: 'Call us today',
      proof: ['Austin based', 'Family operated', 'Home & facility services'],
      image: {
        src: 'https://source.unsplash.com/1200x900/?property,services',
        alt: 'Modern property interior prepared for service coordination',
      },
    },
    pathways: [
      {
        title: 'Indigo Facilities',
        body: 'Facility services, commercial maintenance, walk-throughs, repairs, and coordinated project support for property teams.',
        href: '/commercial',
        cta: 'Explore commercial',
        image: {
          src: 'https://source.unsplash.com/900x650/?commercial,building',
          alt: 'Commercial building exterior',
        },
      },
      {
        title: 'Indigo Homes',
        body: 'Residential service support for repairs, installations, make-readies, rental properties, and ongoing home care.',
        href: '/residential',
        cta: 'Explore residential',
        image: {
          src: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=900&auto=format&fit=crop',
          alt: 'Residential home exterior',
        },
      },
    ],
    services: [
      {
        title: 'Plumbing',
        body: 'Emergency plumbing, commercial plumbing, water heaters, leak detection, sinks, faucets, toilets, and gas line work.',
        icon: 'droplets',
      },
      {
        title: 'Electrical',
        body: 'Residential and commercial electrical support, wiring, lighting, ceiling fans, and exhaust fan installation.',
        icon: 'zap',
      },
      {
        title: 'Handyman & Repairs',
        body: 'Doors, decks, fences, drywall, siding, painting, and repair scopes for homes and properties.',
        icon: 'wrench',
      },
      {
        title: 'Property Support',
        body: 'Walk-throughs, estimates, scheduling, coordinator support, and service planning for property managers.',
        icon: 'building',
      },
    ],
    proof: [
      'Local Austin team',
      'Residential, rental, and commercial support',
      'Phone bids or field walk-throughs depending on scope',
      'Verification needed before publishing license or review claims',
    ],
    process: [
      {
        title: 'Call Indigo',
        body: 'Start with one phone call and the address that needs service.',
      },
      {
        title: 'Define the scope',
        body: 'Simple work may be estimated by phone. Larger jobs get a walk-through or detailed proposal.',
      },
      {
        title: 'Schedule the work',
        body: 'Approved estimates are coordinated by the Indigo team and scheduled around the property need.',
      },
      {
        title: 'Maintain the address',
        body: 'Use Indigo as the service partner for recurring property, home, and facility needs.',
      },
    ],
    trust: {
      title: 'Corrected source facts first',
      body: 'The first draft uses the legacy Indigo site as the source for phone, contact, service categories, and verification-needed claims before deeper copywriting.',
      items: [
        'Phone: (512) 608-4999',
        'Public contact: support [at] indigoservices-tx.com',
        'Address: 1005 Meredith Drive, Austin, TX 78748',
        'Review counts, licenses, and national claims require approval before publishing',
      ],
    },
    finalCta: {
      title: 'Call Indigo for the address that needs attention',
      body: 'Tell us what kind of property you have and what needs to be repaired, scoped, or coordinated.',
      cta: 'Call (512) 608-4999',
      href: 'tel:+15126084999',
    },
  },
} as const;

export type IndigoWebsiteContent = typeof indigoWebsiteContent;
