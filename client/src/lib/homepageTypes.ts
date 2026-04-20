export type HeroSlide = {
  rubrique: string;
  title: string;
  excerpt: string;
  image: string;
  slug: string;
  stats: { label1: string; label2: string; label3: string };
};

export type GreenMetric = {
  label: string;
  value: string;
  trend: string;
};

export type GreenCategory = {
  label: string;
  href: string;
  iconKey: string;
};

export type EcosystemCard = {
  title: string;
  desc: string;
  href: string;
  badge: string;
};

export type HomepageMagazine = {
  issueLabel: string;
  coverUrl: string;
  pdfUrl: string;
  pdfLabel: string;
  isFree: boolean;
};
