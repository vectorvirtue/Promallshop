import Hero from "../components/Hero"
import Categories from "../components/Categories"
import FlashSales from "../components/FlashSales"
import FeaturedProducts from "../components/Featuredproducts"
import Deals from "../components/Deals"
import Choose from "../components/Whychoose"
import Whybuy from "../components/Whybuy"
import Partners from "../components/Partners"
import Newsletter from "../components/Newsletter"
import Blogs from "../components/Blogs"
import Awards from "../components/Awards"
import { Helmet } from "react-helmet-async"
import homeSocialImage from "../assets/promall1crop-2@2x.png"

export default function Home() {
  const homeUrl = `${window.location.origin}/`
  const homeImage = new URL(homeSocialImage, window.location.origin).toString()

  return (
    <>
      <Helmet>
        <title>Nigeria’s Top Tech Store: VC Solutions, Accessories, and More | Promallshop</title>
        <meta
          name="description"
          content="Find top video conferencing solutions, headsets, webcams, keyboards, coding & robotic kits, and accessories at Promallshop. Best deals today!"
        />
        <meta
          name="keywords"
          content="Wireless Headsets, Gaming Headsets, Noise-canceling Headphones, Bluetooth Headsets, Logitech H390 USB Headset, Best Webcams for Streaming, Logitech Webcams, Video Conferencing Tools, Video Conferencing Solutions, Mechanical Keyboards, Ergonomic Keyboards, Gaming Keyboards, Wireless Keyboard and Mouse, Curved Monitors, Samsung Odyssey Monitors, Touchscreen Displays, Interactive Touchscreen Displays, Digital Signage, Wireless Presentation Devices, Logitech Video Conferencing Accessories, Wireless Mouse for Gaming, Programmable Mouse, Gaming Mice, Best Coding and Robotics Kits, Programmable Robot Kits for Adults, Programmable Robot Kits for Beginners, Arduino Kits, Mobile Phone Accessories, Powerbanks, Belkin Accessories, Headphones, AirPods, Car Chargers, USB Cables, Accessories, Mouse, Office Equipment, Toner Cartridge, Printer, Toner, Cartridge, Sublimation Printer, Printing Near Me, DTF Printer, Printer Ink, Office, Equipment, Scanner, Yealink, Huawei, Samsung, Hikvision, Belkin, Logitech, Video Conferencing, Shop, Technology"
        />

        <meta property="og:url" content={homeUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="PROMALLSHOP ECOMMERCE STORE" />
        <meta
          property="og:description"
          content="Shop headsets, IT accessories, webcams, keyboards, coding kits, home automation, and office equipment at Promallshop. Discover deals on the latest tech."
        />
        <meta property="og:image" content={homeImage} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@promallshop" />
        <meta name="twitter:site:id" content="1709918300" />
        <meta name="twitter:creator" content="@promallshop" />
        <meta name="twitter:title" content="Promallshop Online Shopping" />
        <meta name="twitter:description" content="Shop headsets, IT accessories, webcams, keyboards, coding kits, home automation, and office equipment at Promallshop. Discover deals on the latest tech." />
        <meta name="twitter:image" content={homeImage} />
        <meta name="twitter:url" content={homeUrl} />

        <link rel="canonical" href={homeUrl} />
      </Helmet>

      <Hero />
      <Categories />
      <FlashSales />
      <FeaturedProducts />
            

      <Deals/>
      <Blogs/>
      <Choose/>
      <Whybuy/>
      <Partners/>
     
      <Newsletter/>
       <Awards/>
    </>
  )
}