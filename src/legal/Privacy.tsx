import styles from "../legal/TOU.module.css";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
export default function Privacy(){
    return(
        
        <>
              <Helmet><title>Privacy Policy — Promallshop </title></Helmet>

              <nav className={styles.breadcrumb}>
        <Link className={styles.link} to="/">
          Home
        </Link>
        <span>→</span>
        <span>Privacy Policy</span>
        
      </nav>
      <div className={styles.hero}>
<h3>Privacy  Policy </h3>
<h1>We Protect your <span className={styles.span}> Information</span></h1>
      </div>
      <div className={styles.container}>
        <h5 className={styles.italic}>Last Updated: May 31, 2021</h5>
          <div className={styles.choices}>
          <h2>Data Collected When User Visits A Site</h2>

          <p>
           We collect your personal data in order to provide and continually improve our products and services. We may collect, use, store and transfer the following different kinds of personal data about you for marketing and personal data optimization purposes.
          </p>
        
          <ol className={styles.list}>
            <li>
           Information you provide to us: We receive and store the information you provide to us including your identity data, contact data and delivery address.
            </li>
            <li>
            Information on your use of our website: We automatically collect and store certain types of information regarding your use of the Promallshop online store including information about your searches, views, purchases.
            </li>
            <li>
                Information from third parties and publicly available sources: We may receive information about you from third parties including our carriers; payment service providers; merchants/brands; and advertising service providers.
            </li>
          </ol>
        </div>
        <div className={styles.choices}>
          <h2>Personal data protection</h2>
          <p>
            Your personal data administrator is Proxynet Communications Limited. Our databases are protected from access by third parties. The data gathered in the registration process or transaction are used for correct processing of the order and also for following the status of the order and making changes at the client’s request before it is dispatched. In order to realize a contract, the online store may share the collected information to such entities as payment system operators. In such cases, the amount of shared data is limited to the necessary minimum. Moreover, the provided data may also be made available to the authorities under the applicable laws. Clients shall retain the right to access, verify and remove their data from the database after order completion. These activities can be performed by contacting the department responsible for client's transaction.
          </p>
          </div>
           <div className={styles.choices}>
          <h2>How we use the personal data to contact the client</h2>
          <p>
           Our consultants make contact with clients by phone and e-mail. After placing an order, current information about the order status and realization may be sent by e-mail. Clients who gave their consent to receive information about new offers and promotions (especially the subscribers to our newsletter) receive the news from our store in the same way.
          </p>
          </div>
           <div className={styles.choices}>
          <h2>Financial Information</h2>
          <p>
           We use third party payment system operators who collect and store financial information, such as your payment method (valid credit card number, type, expiration date or other financial information), and their use and storage of that information is governed by the payment system operators applicable terms of service and privacy policy. Collected billing information is used for the purposes of processing billing payments and fraud detection.
          </p>
          </div>
           <div className={styles.choices}>
          <h2>IP Address Information and Other Information Collected Automatically</h2>
          <p>
            We may automatically receive and record information from your web browser when you interact with our online store, including your IP address. An IP address is a number assigned to you by your Internet service provider so you can access the Internet. We receive IP addresses in the normal course of the operation of our Site. We may automatically collect and record information about your use of features of our store, about the functionality of our store, and other information related to your interactions with the store. We use the information we automatically collect and record to analyze trends, to administer, monitor and improve the store, to track users' use of the store, and to gather broad demographic information for aggregate use. We do not use IP addresses to identify you personally or disclose them to others. This information is used for fighting spam/malware and also to facilitate collection of data concerning your interaction with the store (e.g., what links you have clicked on).
          </p>
          <p>
            Generally, the store may automatically collect usage information, such as the number and frequency of visitors to the store. We may use this data in aggregate form, that is, as a statistical measure, but not in a manner that would identify you personally. This type of aggregate data enables us and third parties authorized by us to figure out how often individuals use parts of the store so that we can analyze and improve them.
          </p>
          </div>
           <div className={styles.choices}>
          <h2>Cookies</h2>
          <p>
           As is true of most web sites, we gather certain information automatically and store it in log files. This information may include internet protocol (IP) addresses, browser type, internet service provider (ISP), referring/exit pages, operating system, date/time stamp, and clickstream data. To collect this information, when you visit our store, a "cookie" may be set on your computer. Cookies contain a small amount of information that allows our web servers to recognize you whenever you visit. We store information that we collect through cookies, log files and/or clear gifs to create "settings" regarding your preferences.
          </p>
          <p>
            We use cookie information to analyze trends, administer the website, track users' movements and gather demographic information for aggregate use. Promallshop also may use cookies to enable our servers to recognize your web browser and tell us how and when you visit the store and otherwise use the store through the Internet.
          </p>
          <p>
            Many browsers have an option for disabling cookies, which may prevent your browser from accepting new cookies or enable selective use of cookies. A user who does not accept cookies from our store may not be able to access certain areas of the store.
          </p>
          </div>
           <div className={styles.choices}>
          <h2>Google Analytics</h2>
          <p>
           Promallshop also uses Google Analytics, an analytics service provided by Google, Inc. ("Google"). Google Analytics uses cookies to collect non-identifying information, which may be transmitted to and stored by Google on servers in the United States. Google provides some additional privacy options described at <a target="_blank" href="https://google.com/policies/privacy/partners">www.google.com/policies/privacy/partners</a> regarding Google Analytics cookies.
          </p>
          <p>
            Promallshop uses a specific cookie in order to facilitate the use of Google Universal Analytics for users logged-in to the store. If you are a Logged-In User, Promallshop may use your Promallshop user ID in combination with Google Universal Analytics and Google Analytics to track and analyze the pages of the store you visit. We do this only to better understand how you use the Website and the other store, with a view to offering improvements for all Promallshop users; and to tailor our business and marketing activities accordingly, both generally and specifically to you. Google Analytics cookies do not provide Promallshop with any Personal Information.
          </p>
          <p>Learn more about privacy at Google and to opt-out of this feature by installing the Google Analytics Opt-out Browser Add-on.</p>
          </div>
           <div className={styles.choices}>
          <h2>Changes in the privacy policy</h2>
          <p>
           We reserve the right to introduce changes in the above privacy policy by publishing the new policy on this web page.
          </p>
          </div>
           <div className={styles.choices}>
          <h2>Contact</h2>
          <p>
           Questions concerning privacy protection should be sent to the e-mail address provided in the contact section.
          </p>
          </div>
      </div>
      </>
    )
}