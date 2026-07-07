import Hero from "../components/Hero"
import Categories from "../components/Categories"
import FlashSales from "../components/FlashSales"
import FeaturedProducts from "../components/Featuredproducts"
import Deals from "../components/Deals"
import Choose from "../components/Whychoose"
import Whybuy from "../components/Whybuy"
import Partners from "../components/Partners"
import Newsletter from "../components/Newsletter"

  
export default function Home() {
  return (
    <>
 
      <Hero />
      <Categories />
      <FlashSales />
      <FeaturedProducts />
      <Deals/>
      <Choose/>
      <Whybuy/>
      <Partners/>
      <Newsletter/>
    </>
  )
}