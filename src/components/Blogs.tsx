import styles from './Deal.module.css'
import image from '../assets/SCREENS.svg'
import swiper from '../assets/Frame 20.svg'
export default function Blogs(){
    return(
         <section className={styles.blogs}>
             <h2 className={styles.header}>Our Latest Blogs</h2>
      <div className={styles.blogcontainer}>
<div className={styles.blogOne}>
<img className={styles.image} src={image} alt="screens" />
<div className={styles.padding}>
    <div className={styles.discover} >
    Discover the Perfect Keyboard for Your Needs: Gaming, Work, and Everyday Use
</div>
<div className={styles.explore}>
    Explore our range of computer keyboards, including wireless and wired options, mechanical and membrane designs, and ergonomic models. Featuring top brands like Logitech, our keyboards offer responsive keys, durable construction, and intuitive layouts to enhance your productivity.
</div>
</div>
</div>
<div className={styles.blogOne}>
<img className={styles.image} src={image} alt="screens" />
<div className={styles.padding}>
    <div className={styles.discover} >
    Discover the Perfect Keyboard for Your Needs: Gaming, Work, and Everyday Use
</div>
<div className={styles.explore}>
    Explore our range of computer keyboards, including wireless and wired options, mechanical and membrane designs, and ergonomic models. Featuring top brands like Logitech, our keyboards offer responsive keys, durable construction, and intuitive layouts to enhance your productivity.
</div>
</div>
</div>
<div className={styles.blogOne}>
<img className={styles.image} src={image} alt="screens" />
<div className={styles.padding}>
    <div className={styles.discover} >
    Discover the Perfect Keyboard for Your Needs: Gaming, Work, and Everyday Use
</div>
<div className={styles.explore}>
    Explore our range of computer keyboards, including wireless and wired options, mechanical and membrane designs, and ergonomic models. Featuring top brands like Logitech, our keyboards offer responsive keys, durable construction, and intuitive layouts to enhance your productivity.
</div>
</div>
</div>
<div className={styles.blogOne}>
<img className={styles.image} src={image} alt="screens" />
<div className={styles.padding}>
    <div className={styles.discover} >
    Discover the Perfect Keyboard for Your Needs: Gaming, Work, and Everyday Use
</div>
<div className={styles.explore}>
    Explore our range of computer keyboards, including wireless and wired options, mechanical and membrane designs, and ergonomic models. Featuring top brands like Logitech, our keyboards offer responsive keys, durable construction, and intuitive layouts to enhance your productivity.
</div>
</div>
</div>
<div className={styles.blogOne}>
<img className={styles.image} src={image} alt="screens" />
<div className={styles.padding}>
    <div className={styles.discover} >
    Discover the Perfect Keyboard for Your Needs: Gaming, Work, and Everyday Use
</div>
<div className={styles.explore}>
    Explore our range of computer keyboards, including wireless and wired options, mechanical and membrane designs, and ergonomic models. Featuring top brands like Logitech, our keyboards offer responsive keys, durable construction, and intuitive layouts to enhance your productivity.
</div>
</div>
</div>
<div className={styles.blogOne}>
<img className={styles.image} src={image} alt="screens" />
<div className={styles.padding}>
    <div className={styles.discover} >
    Discover the Perfect Keyboard for Your Needs: Gaming, Work, and Everyday Use
</div>
<div className={styles.explore}>
    Explore our range of computer keyboards, including wireless and wired options, mechanical and membrane designs, and ergonomic models. Featuring top brands like Logitech, our keyboards offer responsive keys, durable construction, and intuitive layouts to enhance your productivity.
</div>
</div>
</div>

      </div>
      <img className={styles.swiper} src={swiper} alt="swiper" />
      </section>
    )
}