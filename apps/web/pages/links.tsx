import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { FormattedMessage, useIntl } from 'react-intl';
import { GetStaticProps } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarCheck,
  faShoppingCart,
  faPlayCircle,
  faBriefcase,
  faEnvelope,
  faArrowRight,
  faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';
import {
  faLinkedin,
  faGithub,
  faInstagram,
} from '@fortawesome/free-brands-svg-icons';

// ============================================================================
// TYPES
// ============================================================================

interface LinkItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: typeof faCalendarCheck;
  isAffiliate: boolean;
  isPrimary: boolean;
}

interface LinksPageProps {
  locale: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PROFILE_IMAGE_URL =
  'https://dbydvpdhbaqudqqjteoq.supabase.co/storage/v1/object/sign/avatars/profile.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhdmF0YXJzL3Byb2ZpbGUucG5nIiwiaWF0IjoxNzIyMDMzMzMwLCJleHAiOjIwMzczOTMzMzB9.2fCp8-hDw_e05QacUp-MRSDYVp08Z-4TJzJ8RJqmyKo';

const LINKS: LinkItem[] = [
  {
    id: 'consultation',
    title: 'Book 1:1 Call',
    description: 'Schedule a personal consultation with me',
    url: '#',
    icon: faCalendarCheck,
    isAffiliate: false,
    isPrimary: true,
  },
  {
    id: 'affiliate-gear',
    title: 'My Tech Gear',
    description: 'Tools & gadgets I use daily (Amazon)',
    url: 'https://www.amazon.com/shop/swapnilsrivastava',
    icon: faShoppingCart,
    isAffiliate: true,
    isPrimary: false,
  },
  {
    id: 'youtube-latest',
    title: 'Latest YouTube Video',
    description: 'Watch my newest tech content',
    url: 'https://youtube.com/@srivastava-swapnil?si=s_N9hiut8vZX1KRW',
    icon: faPlayCircle,
    isAffiliate: false,
    isPrimary: false,
  },
  {
    id: 'portfolio',
    title: 'View My Work',
    description: 'Projects, case studies & portfolio',
    url: '/technology',
    icon: faBriefcase,
    isAffiliate: false,
    isPrimary: false,
  },
];

const SOCIAL_LINKS = [
  {
    id: 'linkedin',
    url: 'https://www.linkedin.com/in/swapnilsrivastava',
    icon: faLinkedin,
    label: 'LinkedIn',
  },
  {
    id: 'github',
    url: 'https://github.com/swapnil-srivastava',
    icon: faGithub,
    label: 'GitHub',
  },
  {
    id: 'instagram',
    url: 'https://www.instagram.com/swapnilsrivastava',
    icon: faInstagram,
    label: 'Instagram',
  },
];

// ============================================================================
// JSON-LD STRUCTURED DATA
// ============================================================================

const jsonLdData = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  mainEntity: {
    '@type': 'Person',
    name: 'Swapnil Srivastava',
    alternateName: 'swapnilsrivastava',
    description:
      'Architect & Full Stack Engineer. Building modern web applications with Next.js, React, TypeScript, Spring Boot, Apache Kafka, and cloud technologies (GCP, Azure, AWS). Specialized in solutions architecture, microservices, and end-to-end development.',
    url: 'https://swapnilsrivastava.eu',
    image: PROFILE_IMAGE_URL,
    sameAs: [
      'https://www.linkedin.com/in/swapnilsrivastava',
      'https://github.com/swapnil-srivastava',
      'https://www.instagram.com/swapnilsrivastava',
      'https://youtube.com/@srivastava-swapnil',
    ],
    jobTitle: 'Architect & Full Stack Engineer',
    worksFor: {
      '@type': 'Organization',
      name: 'Tech Industry',
    },
    knowsAbout: [
      'Next.js',
      'TypeScript',
      'React',
      'Node.js',
      'Spring Boot',
      'Apache Kafka',
      'Google Cloud Platform',
      'Microsoft Azure',
      'Amazon Web Services',
      'Cloud Architecture',
      'Full Stack Development',
      'Solutions Architecture',
      'Web Development',
      'Software Engineering',
      'Microservices',
    ],
  },
};

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Swapnil Srivastava - Architect & Full Stack Engineer | Links',
  description:
    'Connect with Swapnil Srivastava. Book consultations, explore tech recommendations, watch latest videos, and view portfolio.',
  url: 'https://swapnilsrivastava.eu/links',
  inLanguage: 'en-US',
  isPartOf: {
    '@type': 'WebSite',
    name: "Swapnil's Odyssey",
    url: 'https://swapnilsrivastava.eu',
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://swapnilsrivastava.eu',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Links',
        item: 'https://swapnilsrivastava.eu/links',
      },
    ],
  },
  potentialAction: {
    '@type': 'ReadAction',
    target: 'https://swapnilsrivastava.eu/links',
  },
};

// ============================================================================
// ANALYTICS HELPER
// ============================================================================

const trackLinkClick = (linkName: string) => {
  // Simulating GA4 event - replace with actual GA4 implementation
  console.log('GA4 Event:', {
    event: 'link_click',
    link_name: linkName,
    page_location: typeof window !== 'undefined' ? window.location.href : '',
    timestamp: new Date().toISOString(),
  });
};

// ============================================================================
// SSG: STATIC SITE GENERATION
// ============================================================================

export const getStaticProps: GetStaticProps<LinksPageProps> = async ({ locale }) => {
  return {
    props: {
      locale: locale || 'en-US',
    },
    revalidate: 3600, // Revalidate every hour for fresh content
  };
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function LinksPage({ locale }: LinksPageProps) {
  const intl = useIntl();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    trackLinkClick('lead_magnet_signup');
    console.log('Email captured:', email);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setEmail('');
    }, 1000);
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>Swapnil Srivastava | Links - Architect & Full Stack Engineer</title>
        <meta
          name="description"
          content="Connect with Swapnil Srivastava - Architect & Full Stack Engineer specializing in Next.js, React, TypeScript, Spring Boot, Apache Kafka, and Cloud Solutions (GCP, Azure, AWS). Book 1:1 consultations, explore recommended tech gear, watch latest development tutorials, and view portfolio projects."
        />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Swapnil Srivastava" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#00539c" />

        {/* Keywords for SEO */}
        <meta
          name="keywords"
          content="Swapnil Srivastava, Architect, Full Stack Engineer, Solutions Architect, Next.js, TypeScript, React, Spring Boot, Apache Kafka, GCP, Azure, AWS, Cloud Platform, Web Development, Software Engineering, Tech Consultation, Microservices"
        />

        {/* Open Graph */}
        <meta property="og:type" content="profile" />
        <meta property="og:title" content="Swapnil Srivastava | Links - Architect & Full Stack Engineer" />
        <meta
          property="og:description"
          content="Connect with Swapnil Srivastava - Architect & Full Stack Engineer. Book consultations, explore tech gear, and view portfolio."
        />
        <meta property="og:image" content={PROFILE_IMAGE_URL} />
        <meta property="og:image:secure_url" content={PROFILE_IMAGE_URL} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="400" />
        <meta property="og:image:height" content="400" />
        <meta property="og:image:alt" content="Swapnil Srivastava - Architect & Full Stack Engineer" />
        <meta property="og:url" content="https://swapnilsrivastava.eu/links" />
        <meta property="og:site_name" content="Swapnil's Odyssey" />
        <meta property="og:locale" content={locale} />
        <meta property="profile:first_name" content="Swapnil" />
        <meta property="profile:last_name" content="Srivastava" />
        <meta property="profile:username" content="swapnilsrivastava" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@swapnilsrivas" />
        <meta name="twitter:creator" content="@swapnilsrivas" />
        <meta name="twitter:title" content="Swapnil Srivastava | Links" />
        <meta
          name="twitter:description"
          content="Connect with Swapnil Srivastava - Architect & Full Stack Engineer."
        />
        <meta name="twitter:image" content={PROFILE_IMAGE_URL} />
        <meta name="twitter:image:alt" content="Swapnil Srivastava - Architect & Full Stack Engineer" />

        {/* Additional SEO */}
        <link rel="canonical" href="https://swapnilsrivastava.eu/links" />
        <link rel="alternate" hrefLang="en" href="https://swapnilsrivastava.eu/links" />
        <link rel="alternate" hrefLang="de" href="https://swapnilsrivastava.eu/de/links" />
        <link rel="alternate" hrefLang="fr" href="https://swapnilsrivastava.eu/fr/links" />
        <link rel="alternate" hrefLang="hi" href="https://swapnilsrivastava.eu/hi/links" />
        <link rel="alternate" hrefLang="x-default" href="https://swapnilsrivastava.eu/links" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://www.amazon.com" />
        <link rel="preconnect" href="https://youtube.com" />
        <link rel="dns-prefetch" href="https://www.linkedin.com" />
        <link rel="dns-prefetch" href="https://github.com" />
        <link rel="dns-prefetch" href="https://www.instagram.com" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
        />
      </Head>

      {/* Main Container */}
      <main className="min-h-screen bg-blog-white dark:bg-fun-blue-500 flex flex-col items-center px-4 py-8 sm:py-12 pb-24">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mb-6 animate-fadeIn">
          {/* Profile Image */}
          <div className="relative w-[120px] h-[120px] mb-4">
            <Image
              src={PROFILE_IMAGE_URL}
              alt="Swapnil Srivastava - Architect and Full Stack Engineer"
              fill
              priority
              className="rounded-full object-cover ring-4 ring-hit-pink-500 dark:ring-caribbean-green-500 shadow-lg hover:ring-[6px] transition-all duration-300"
              sizes="120px"
            />
          </div>

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-bold text-blog-black dark:text-blog-white mb-2">
            Swapnil Srivastava
          </h1>

          {/* Bio */}
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-xs leading-relaxed mb-2">
            <FormattedMessage
              id="links-bio-line1"
              description="Bio first line"
              defaultMessage="Architect & Full Stack Engineer"
            />
            <br />
            <FormattedMessage
              id="links-bio-line2"
              description="Bio second line"
              defaultMessage="Building modern web experiences with passion"
            />
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm max-w-sm leading-relaxed">
            <FormattedMessage
              id="links-bio-line3"
              description="Bio third line"
              defaultMessage="Next.js • React • Spring Boot • Kafka • GCP • Azure • AWS"
            />
          </p>
        </section>

        {/* Links Stack */}
        <section className="w-full max-w-md flex flex-col gap-2 sm:gap-3 mb-8" aria-label="Quick Links">
          <h2 className="sr-only">
            <FormattedMessage
              id="links-section-heading"
              description="Links section heading for screen readers"
              defaultMessage="Quick Access Links"
            />
          </h2>
          {LINKS.map((link, index) => {
            const isExternal = link.url.startsWith('http');
            const linkProps = {
              href: link.url,
              onClick: (e: React.MouseEvent) => {
                trackLinkClick(link.id);
                if (link.id === 'consultation') {
                  e.preventDefault();
                }
              },
              className: `
                flex items-center gap-4 w-full p-4 rounded-xl
                transition-all duration-300 transform hover:scale-[1.02]
                drop-shadow-lg hover:drop-shadow-xl
                ${
                  link.isPrimary
                    ? 'bg-gradient-to-r from-hit-pink-500 to-hit-pink-600 hover:from-hit-pink-600 hover:to-hit-pink-700 text-blog-black'
                    : 'bg-white dark:bg-fun-blue-600 text-blog-black dark:text-blog-white hover:brightness-110'
                }
              `,
              style: { animationDelay: `${index * 100}ms` },
            };

            const linkContent = (
              <>
                {/* Icon */}
                <div
                  className={`
                    flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0
                    ${
                      link.isPrimary
                        ? 'bg-white/20 text-blog-black'
                        : 'bg-fun-blue-100 dark:bg-fun-blue-700 text-fun-blue-600 dark:text-caribbean-green-400'
                    }
                  `}
                >
                  <FontAwesomeIcon icon={link.icon} className="w-5 h-5" />
                </div>

                {/* Text Content */}
                <div className="flex-1 text-left">
                  <h2
                    className={`font-semibold text-base ${link.isPrimary ? 'text-blog-black' : ''}`}
                  >
                    <FormattedMessage
                      id={`links-${link.id}-title`}
                      description={`Link title for ${link.id}`}
                      defaultMessage={link.title}
                    />
                  </h2>
                  <p
                    className={`text-sm ${
                      link.isPrimary
                        ? 'text-blog-black/70'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <FormattedMessage
                      id={`links-${link.id}-description`}
                      description={`Link description for ${link.id}`}
                      defaultMessage={link.description}
                    />
                  </p>
                </div>

                {/* Arrow Icon */}
                <FontAwesomeIcon
                  icon={isExternal ? faExternalLinkAlt : faArrowRight}
                  className={`w-4 h-4 flex-shrink-0 ${
                    link.isPrimary
                      ? 'text-blog-black/60'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                />
              </>
            );

            // External links with proper rel attributes
            if (isExternal) {
              return (
                <a
                  key={link.id}
                  {...linkProps}
                  target="_blank"
                  rel={
                    link.isAffiliate
                      ? 'noopener noreferrer nofollow'
                      : 'noopener noreferrer'
                  }
                >
                  {linkContent}
                </a>
              );
            }

            // Internal links using Next.js Link
            return (
              <Link key={link.id} {...linkProps}>
                {linkContent}
              </Link>
            );
          })}
        </section>

        {/* Lead Magnet Section */}
        <section className="w-full max-w-md mb-8" aria-labelledby="newsletter-heading">
          <div className="bg-white dark:bg-fun-blue-600 rounded-xl p-6 drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 border-l-4 border-caribbean-green-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-caribbean-green-100 dark:bg-caribbean-green-900/30">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="w-5 h-5 text-caribbean-green-600 dark:text-caribbean-green-400"
                />
              </div>
              <div>
                <h3 id="newsletter-heading" className="font-semibold text-blog-black dark:text-blog-white text-base">
                  <FormattedMessage
                    id="links-lead-magnet-title"
                    description="Lead magnet section title"
                    defaultMessage="Get Weekly Tech Insights"
                  />
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <FormattedMessage
                    id="links-lead-magnet-subtitle"
                    description="Lead magnet section subtitle"
                    defaultMessage="Join 1,000+ developers"
                  />
                </p>
              </div>
            </div>

            {!submitted ? (
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={intl.formatMessage({
                    id: 'links-email-placeholder',
                    description: 'Email input placeholder',
                    defaultMessage: 'Enter your email',
                  })}
                  required
                  aria-label={intl.formatMessage({
                    id: 'links-email-input-label',
                    description: 'Email input accessibility label',
                    defaultMessage: 'Email address for newsletter subscription',
                  })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-fun-blue-700 
                           text-blog-black dark:text-blog-white 
                           placeholder-gray-400 dark:placeholder-gray-500
                           border border-gray-200 dark:border-fun-blue-500
                           focus:outline-none focus:ring-2 focus:ring-caribbean-green-500 
                           focus:border-transparent transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-label={intl.formatMessage({
                    id: 'links-subscribe-button-label',
                    description: 'Subscribe button accessibility label',
                    defaultMessage: 'Subscribe to weekly newsletter',
                  })}
                  className="w-full bg-caribbean-green-500 hover:bg-caribbean-green-600 
                           text-blog-black font-semibold py-3 px-4 rounded-lg
                           transition-all duration-200 hover:brightness-110
                           focus:outline-none focus:ring-2 focus:ring-caribbean-green-400 focus:ring-offset-2
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="animate-spin w-5 h-5 border-2 border-blog-black border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <FormattedMessage
                        id="links-subscribe-button"
                        description="Subscribe button text"
                        defaultMessage="Subscribe Free"
                      />
                      <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-caribbean-green-600 dark:text-caribbean-green-400 font-semibold">
                  <FormattedMessage
                    id="links-subscribe-success"
                    description="Subscribe success message"
                    defaultMessage="🎉 Thanks for subscribing!"
                  />
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Social Links Footer */}
        <footer className="flex items-center justify-center gap-4 sm:gap-6 mb-12" role="navigation" aria-label="Social Media Links">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackLinkClick(`social_${social.id}`)}
              aria-label={intl.formatMessage({
                id: `links-social-${social.id}-label`,
                description: `Social link label for ${social.label}`,
                defaultMessage: `Follow on ${social.label}`,
              })}
              className="w-14 h-14 flex items-center justify-center rounded-full
                       bg-white dark:bg-fun-blue-600 
                       text-gray-600 dark:text-gray-300
                       hover:text-fun-blue-500 dark:hover:text-caribbean-green-400
                       drop-shadow-lg hover:drop-shadow-xl
                       transition-all duration-300 hover:scale-110"
            >
              <FontAwesomeIcon icon={social.icon} className="w-6 h-6" />
            </a>
          ))}
        </footer>

        {/* Attribution */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">
          <FormattedMessage
            id="links-attribution"
            description="Page attribution"
            defaultMessage="swapnilsrivastava.eu"
          />
        </p>
      </main>
    </>
  );
}
