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
import Gif from "../components/Gif"
import Awards from "../components/Awards"

export default function Home() {
  return (
    <>
 
      <Hero />
      <Categories />
      <Gif/>
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