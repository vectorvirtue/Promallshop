import styles from "../legal/TOU.module.css";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us — Promallshop</title>
      </Helmet>

      <nav className={styles.breadcrumb}>
        <Link className={styles.link} to="/">
          Home
        </Link>
        <span>→</span>
        <span>About Us</span>
      </nav>

      <div className={styles.hero}>
        <h3>About Us</h3>
      </div>

      <div className={styles.container}>
        {/* Introduction */}
        <section className={styles.section}>
          <p className={styles.paragraph}>
            Welcome to Promallshop, Nigeria's leading online store for cutting-edge technology solutions in video conferencing, computer peripherals, lifestyle products, robotics, coding kits, and more. We offer businesses and individuals easy access to the latest innovations, partnering with top brands like Maxhub, Belkin, Vbet, Yango, Norden, Photon, Makeblock, D-Link, Canon, Hikvision, Datapath, Panasonic, Huawei, Yealink, Logitech, Sharp, Samsung, and LG to deliver both quality and innovation.
          </p>
        </section>

        {/* Our Mission */}
        <section className={styles.section}>
          <h2 className={styles.heading}>Our Mission</h2>
          <p className={styles.paragraph}>
            At Promallshop, our mission is to provide high-quality, cutting-edge technology solutions that enhance productivity and communication. We are dedicated to innovation, excellence, and delivering a seamless and enjoyable shopping experience from our online store.
          </p>
        </section>

        {/* Our Commitment */}
        <section className={styles.section}>
          <h2 className={styles.heading}>Our Commitment</h2>
          <p className={styles.paragraph}>
            We are dedicated to delivering value to every customer through:
          </p>
          <ul className={styles.list}>
            <li>
              <strong>Quality Products:</strong> Explore a range of products, from cutting-edge technology solutions in video conferencing and interactive displays to coding kits and essential peripherals like headsets, webcams, and keyboards.
            </li>
            <li>
              <strong>Customer Satisfaction:</strong> Our online store is designed to offer a smooth, enjoyable shopping experience, with exceptional customer support.
            </li>
            <li>
              <strong>Innovation:</strong> We consistently update our offerings with the latest technology and cutting-edge solutions to meet your evolving needs.
            </li>
            <li>
              <strong>Value:</strong> Enjoy competitive pricing and exclusive online deals to get the best value for your money.
            </li>
            <li>
              <strong>Reliable Delivery:</strong> Benefit from fast, secure, and dependable delivery, directly to your doorstep anywhere in Nigeria.
            </li>
          </ul>
        </section>

        {/* Our Trusted Partners */}
        <section className={styles.section}>
          <h2 className={styles.heading}>Our Trusted Partners</h2>
          <p className={styles.paragraph}>
            At Promallshop, we collaborate with top technology brands like Maxhub, Belkin, Vbet, Yango, Norden, Photon, Makeblock, D-Link, Canon, Hikvision, Datapath, Panasonic, Huawei, Yealink, Logitech, Sharp, Samsung, and LG, and more to guarantee that every product you purchase from our online store offers premium quality and cutting-edge technology solutions.
          </p>
        </section>

        {/* Our Slogan */}
        <section className={styles.section}>
          <h2 className={styles.heading}>Our Slogan</h2>
          <p className={styles.paragraph}>
            <strong>Your one-stop shop for IT products and services.</strong>
          </p>
        </section>
      </div>
    </>
  )}