export const businessProfile = {
  name: "Pronix Digital",
  email: "pronixdigital.tech@gmail.com",
  phone: "+91 7990101983",
  website: "https://pronixdigital.tech",
  address: {
    streetAddress: "Vadodara, Gujarat, India",
    addressLocality: "Vadodara",
    addressRegion: "Gujarat",
    postalCode: "390001",
    addressCountry: "IN",
  },
  geo: {
    latitude: 22.3072,
    longitude: 73.1812,
  },
  priceRange: "$$",
  openingHours: ["Mo-Sa 09:00-18:00"],
  serviceAreas: ["Vadodara", "Surat", "Gujarat", "India", "Worldwide Remote Services"],
  sameAs: [
    "https://www.linkedin.com/company/pronix-digital",
    "https://x.com/pronixdigital",
    "https://www.instagram.com/pronixdigital",
    "https://github.com/pronixdigital",
  ],
};

export const locationRegistry = [
  {
    key: "vadodara",
    slug: "vadodara",
    name: "Vadodara",
    title: "Website Developer in Vadodara",
    description:
      "Website development, application development, and digital marketing services for Vadodara businesses.",
    geo: { latitude: 22.3072, longitude: 73.1812 },
  },
  {
    key: "surat",
    slug: "surat",
    name: "Surat",
    title: "Website Developer in Surat",
    description:
      "Website development, application development, and digital marketing services for Surat businesses.",
    geo: { latitude: 21.1702, longitude: 72.8311 },
  },
  {
    key: "gujarat",
    slug: "gujarat",
    name: "Gujarat",
    title: "Website Development in Gujarat",
    description:
      "Scalable software, web, mobile, and marketing services for businesses across Gujarat.",
  },
  {
    key: "india",
    slug: "india",
    name: "India",
    title: "Website Development in India",
    description:
      "National website development, application development, and digital marketing services for Indian businesses.",
  },
  {
    key: "remote",
    slug: "remote",
    name: "Worldwide Remote Services",
    title: "Worldwide Remote Services",
    description:
      "Remote website development, mobile app development, and software delivery for global clients.",
  },
];

export function getLocationProfile(key) {
  if (!key) return null;
  const normalized = String(key).trim().toLowerCase();
  return locationRegistry.find((location) => location.key === normalized || location.slug === normalized || location.name.toLowerCase() === normalized) || null;
}
