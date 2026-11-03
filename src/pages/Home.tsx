import Hero from "../components/Hero"
import Categories from "../components/Categories"
import FlashSales from "../components/FlashSales"
import FeaturedProducts from "../components/Featuredproducts"
import Deals from "../components/Deals"
import Choose from "../components/Whychoose"
import Whybuy, { FirstOrderOffer } from "../components/Whybuy"
import Partners from "../components/Partners"
import Newsletter from "../components/Newsletter"
import Blogs from "../components/Blogs"
import Awards from "../components/Awards"
import { Helmet } from "react-helmet-async"
import homeSocialImage from "../assets/promall1crop-2@2x.png"
import AffiliateBanner, { type AffiliateBannerRecord } from "../components/AffiliateBanner"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { useQuoteForm } from "../context/QuoteFormContext"
import styles from "./Home.module.css"

const homeTitle = "Buy IT Equipment in Nigeria | Promallshop"
const homeDescription = "Shop IT equipment in Nigeria at Promallshop. Find computer accessories, video conferencing systems, interactive displays, digital signage, robotics kits and networking solutions."

export default function Home({ affiliateBanners }: { affiliateBanners: AffiliateBannerRecord[] }) {
  const { openQuoteForm } = useQuoteForm()
  const homeUrl = `${window.location.origin}/`
  const homeImage = new URL(homeSocialImage, window.location.origin).toString()

  return (
    <>
      <Helmet>
        <title>{homeTitle}</title>
        <meta
          name="description"
          content={homeDescription}
        />
        <meta
          name="keywords"
          content="IT equipment in Nigeria, Computer accessories Nigeria, IT products Nigeria, Video conferencing equipment Nigeria, Interactive displays Nigeria, Digital signage Nigeria"
        />

        <meta property="og:url" content={homeUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={homeTitle} />
        <meta
          property="og:description"
          content={homeDescription}
        />
        <meta property="og:image" content={homeImage} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@promallshop" />
        <meta name="twitter:site:id" content="1709918300" />
        <meta name="twitter:creator" content="@promallshop" />
        <meta name="twitter:title" content={homeTitle} />
        <meta name="twitter:description" content={homeDescription} />
        <meta name="twitter:image" content={homeImage} />
        <meta name="twitter:url" content={homeUrl} />

        <link rel="canonical" href={homeUrl} />

        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Promallshop',
          url: window.location.origin,
          logo: `${window.location.origin}/favicon.svg`,
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+234-703-264-7755',
            contactType: 'customer service',
            areaServed: 'NG',
            availableLanguage: 'English',
          },
          sameAs: ['https://twitter.com/promallshop'],
        })}</script>

        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Promallshop',
          url: window.location.origin,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${window.location.origin}/shop/search/{search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        })}</script>
      </Helmet>

      <main>
      <Hero />
      <Categories />
      {affiliateBanners
        .filter((banner) => banner.placement === 'below_categories')
        .map((banner) => <AffiliateBanner key={banner.id} banner={banner} />)}
      <div className={styles.offerPlacement}>
        <FirstOrderOffer />
      </div>
      <FlashSales />
      <FeaturedProducts />
      <Deals/>
      <section className={styles.intro} aria-labelledby="home-title">
        <div className={styles.introHeading}>
          <p className={styles.eyebrow}>Discover. Compare. Quote. Procure. Deploy.</p>
          <h1 id="home-title">Buy IT Equipment and Technology Solutions in Nigeria</h1>
          <p className={styles.lead}>
            Welcome to Promallshop, your online destination for IT equipment, computer
            accessories and business technology solutions in Nigeria. We help businesses,
            schools, government institutions, IT resellers and individuals find the
            technology products they need for work, learning, communication and digital transformation.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} to="/shop">
              Shop IT Products <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <button className={styles.secondaryAction} type="button" onClick={() => openQuoteForm()}>
              Request a Quote
            </button>
          </div>
        </div>
        <div className={styles.introDetails}>
          <p className={styles.detailLabel}>For your next technology project</p>
          <p>
            From video conferencing equipment and interactive displays to digital signage
            screens, networking devices, robotics kits and computer peripherals, Promallshop
            brings together products from recognised global technology brands in one
            convenient shopping destination.
          </p>
          <p>
            Whether you are equipping an office, upgrading a meeting room, setting up a
            smart classroom or purchasing IT equipment for your business, discover
            technology solutions to meet your needs.
          </p>
          <a className={styles.categoryLink} href="#product-categories">
            Explore our product categories <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>
      <Choose/>
      <Partners/>
      <Whybuy/>
      <Blogs/>
     
      <Newsletter/>
       <Awards/>
      </main>
    </>
  )
}
