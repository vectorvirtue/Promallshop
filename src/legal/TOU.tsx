import styles from "../legal/TOU.module.css";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
export default function TermsOfUse() {
  return (
    <>
    <Helmet><title>Terms Of Use — Promallshop </title></Helmet>
      <nav className={styles.breadcrumb}>
        <Link className={styles.link} to="/">
          Home
        </Link>
        <span>→</span>
        <span>Terms Of Use</span>
      </nav>
      <div className={styles.hero}>
<h3>Terms & Conditions </h3>
<h1>We Abide by <span className={styles.span}>these Rules</span></h1>
      </div>
      <div className={styles.container}>
        <h2>Table Of Contents</h2>

        <ul className={styles.margin}>
          <li>
            <a href="#one">1. Introduction</a>
          </li>
          <li>
            <a href="#two">2. Registration and Account</a>
          </li>
          <li>
            <a href="#three">3. Terms & Conditions of Sale</a>
          </li>
          <li>
            <a href="#four">4. Returns and refunds</a>
          </li>
          <li>
            <a href="#five">5. Payments</a>
          </li>
          <li>
            <a href="#six">6. Use of website</a>
          </li>
          <li>
            <a href="#seven">7. Copyright and trademarks</a>
          </li>
          <li>
            <a href="#eight">8. Data Privacy</a>
          </li>
          <li>
            <a href="#nine">9. Limitations and exclusions of liability</a>
          </li>
          <li>
            <a href="#ten">10. Indemnification</a>
          </li>
          <li>
            <a href="#eleven">11. Breaches of these general terms and conditions</a>
          </li>
          <li>
            <a href="#twelve">12. Law and jurisdiction</a>
          </li>
          <li>
            <a href="#thirteen">13. Our company details</a>
          </li>
        </ul>

        <div id="one" className={styles.choices}>
          <h2>Introduction</h2>

          <p>
            This Term of Service defines the principles and terms for using
            Promallstore online shop available at{" "}
            <a target="_blank" href=" http://www.promallshop.com">
              {" "}
              http://www.promallshop.com
            </a>{" "}
            operated by Proxynet Communications Limited., The Proxynet House, 5B
            Adedeji Close, Opebi, Ikeja, Lagos, Nigeria, It defines the
            principles for placing Orders and concluding sales contracts via
            remote means of communication, as well as logistics and payment
            infrastructure, for the sale and purchase of consumer products.
          </p>
          <p>
            These general terms and conditions shall apply to buyers on the
            marketplace and shall govern your use of the marketplace and related
            services.
          </p>
          <p>
            By using our marketplace, you accept these general terms and
            conditions in full. If you disagree with these general terms and
            conditions or any part of these general terms and conditions, you
            must not use our marketplace. If you use our marketplace in the
            course of a business or other organizational project, then by so
            doing you confirm that you have obtained the necessary authority to
            agree to these general terms and conditions;
          </p>
          <ol className={styles.list}>
            <li>
              Bind both yourself and the person, company or other legal entity
              that operates that business or organizational project, to these
              general terms and conditions; and
            </li>
            <li>
              Agree that "you" in these general terms and conditions shall
              reference both the individual user and the relevant person,
              company or legal entity unless the context requires otherwise.
            </li>
          </ol>
        </div>

        <div id="two" className={styles.choices}>
          <h2>Registration and account</h2>

          <p>
            You may not register with our marketplace if you are under 18 years
            of age (by using our marketplace or agreeing to these general terms
            and conditions, you warrant and represent to us that you are at
            least 18 years of age).
          </p>
          <p>
            You represent and warrant that all information provided in the
            registration form is complete and accurate.
          </p>

          <ol className={styles.list}>
            <li>
              If you register for an account with our marketplace, you will be
              asked to provide an email address/user ID and password and you
              agree to:Keep your password confidential;
            </li>
            <li>
              Notify us in writing immediately (using our contact details
              provided at section 13) if you become aware of any disclosure of
              your password; and
            </li>
            <li>
              Be responsible for any activity on our marketplace arising out of
              any failure to keep your password confidential, and that you may
              be held liable for any losses arising out of such a failure.
            </li>
          </ol>
          <p>
            Your account shall be used exclusively by you and you shall not
            transfer your account to any third party. If you authorize any third
            party to manage your account on your behalf this shall be at your
            own risk.
          </p>
          <p>
            We may suspend or cancel your account, and/or edit your account
            details, at any time in our sole discretion and without notice or
            explanation, providing that if we cancel any products or services
            you have paid for but not received, and you have not breached these
            general terms and conditions, we will refund you in respect of the
            same.
          </p>
          <p>
            You may cancel your account on our marketplace by contacting us as
            provided at section 13.
          </p>
        </div>

        <div id="three" className={styles.choices}>
          <h2>Terms & Conditions of Sale</h2>

          <p>You acknowledge and agree that:</p>

          <ol className={styles.list}>
            <li>
              The marketplace provides an online location for buyers to purchase
              products;
            </li>
            <li>
              The price for a product will be as stated in the relevant product
              listing;
            </li>
            <li>
              Delivery charges, packaging charges, handling charges,
              administrative charges, other ancillary costs and charges, will be
              applicable only if this is expressly and clearly stated in the
              product listing
            </li>
          </ol>
        </div>

        <div id="four" className={styles.choices}>
          <h2>Returns and refunds</h2>

          <p>
            Returns of products by buyers shall be managed by us. Acceptance of
            returns shall be in our discretion, subject to compliance with
            applicable laws of the territory.
          </p>
        </div>

        <div id="five" className={styles.choices}>
          <h2>Payments</h2>

          <p>
            You must make payments due under these general terms and conditions
            in accordance with the Payments Information and Guidelines on the
            marketplace.
          </p>
        </div>

        <div id="six" className={styles.choices}>
          <h2>Use of website</h2>

          <ol className={styles.list}>
            <li>
              In this section 8 words "marketplace" and "website" shall be used
              interchangeably to refer to Promallshop’s website.
            </li>
            <li>
              You may{" "}
              <ul>
                <li>view pages from our website in a web browser;</li>
                <li>
                  download pages from our website for caching in a web browser;
                </li>
                <li>
                  print pages from our website for your own personal and
                  noncommercial use, providing that such printing is not
                  systematic or excessive;
                </li>
                <li>
                  use our marketplace services by means of a web browser,
                  subject to the other provisions of these general terms and
                  conditions.
                </li>
              </ul>
            </li>

            <li>
              Except as expressly permitted by the provisions of these general
              terms and conditions, you must not download any material from our
              website or save any such material to your computer
            </li>
            <li>
              You may only use our website for your own personal and business
              purposes in respect of purchasing products on the marketplace
            </li>
            <li>
              Except as expressly permitted by these general terms and
              conditions, you must not edit or otherwise modify any material on
              our website.
            </li>
            <li>
              You may forward links to products on our website and redistribute
              our newsletter and promotional materials in print and electronic
              form to any person.
            </li>
            <li>
              We reserve the right to suspend or restrict access to our website,
              to areas of our website and/or to functionality upon our website.
              We may, for example, suspend access to the website during server
              maintenance or when we update the website. You must not circumvent
              or bypass, or attempt to circumvent or bypass, any access
              restriction measures on the website.
            </li>
            <li>
              You must not:
              <ul>
                <li>
                  use our website in any way or take any action that causes, or
                  may cause, damage to the website or impairment of the
                  performance, availability, accessibility, integrity or
                  security of the website;
                </li>
                <li>
                  use our website in any way that is unethical, unlawful,
                  illegal, fraudulent or harmful, or in connection with any
                  unlawful, illegal, fraudulent or harmful purpose or activity;
                </li>
                <li>hack or otherwise tamper with our website;</li>
                <li>
                  probe, scan or test the vulnerability of our website without
                  our permission;
                </li>
                <li>
                  circumvent any authentication or security systems or processes
                  on or relating to our website;
                </li>
                <li>
                  use our website to copy, store, host, transmit, send, use,
                  publish or distribute any material which consists of (or is
                  linked to) any spyware, computer virus, Trojan horse, worm,
                  keystroke logger, rootkit or other malicious computer
                  software;
                </li>
                <li>
                  impose an unreasonably large load on our website resources
                  (including bandwidth, storage capacity and processing
                  capacity);
                </li>
                <li>
                  decrypt or decipher any communications sent by or to our
                  website without our permission;
                </li>
                <li>
                  conduct any systematic or automated data collection activities
                  (including without limitation scraping, data mining, data
                  extraction and data harvesting) on or in relation to our
                  website without our express written consent;
                </li>
                <li>
                  access or otherwise interact with our website using any robot,
                  spider or other automated means, except for the purpose of
                  search engine indexing;
                </li>
                <li>
                  use our website except by means of our public interfaces;
                </li>
                <li>
                  violate the directives set out in the robots.txt file for our
                  website;
                </li>
                <li>
                  use data collected from our website for any direct marketing
                  activity (including without limitation email marketing, SMS
                  marketing, telemarketing and direct mailing); or
                </li>
                <li>
                  do anything that interferes with the normal use of our
                  website.
                </li>
              </ul>
            </li>
          </ol>
        </div>

        <div id="seven" className={styles.choices}>
          <h2>Copyright and trademarks</h2>

          <ol className={styles.list}>
            <li>
              Subject to the express provisions of these general terms and
              conditions:
              <ul>
                <li>
                  we, together with our licensors, own and control all the
                  copyright and other intellectual property rights in our
                  website and the material on our website; and
                </li>
                <li>
                  all the copyright and other intellectual property rights in
                  our website and the material on our website are reserved.
                </li>
              </ul>
            </li>
            <li>
              Promallshop’s logos and our other registered and unregistered
              trademarks are trademarks belonging to us; we give no permission
              for the use of these trademarks, and such use may constitute an
              infringement of our rights.
            </li>
            <li>
              The third party registered and unregistered trademarks or service
              marks on our website are the property of their respective owners
              and we do not endorse and are not affiliated with any of the
              holders of any such rights and as such we cannot grant any license
              to exercise such right
            </li>
          </ol>
        </div>
        <div id="eight" className={styles.choices}>
          <h2>Data Privacy</h2>

          <ol className={styles.list}>
            <li>
              Buyers agree to processing of their personal data in accordance
              with the terms of Promallshop’s Privacy and Cookie Notice
            </li>
            <li>
              Promallshop shall process all personal data obtained through the
              marketplace and related services in accordance with the terms of
              our Privacy and Cookie Notice and Privacy Policy.
            </li>
          </ol>
        </div>
        <div id="nine" className={styles.choices}>
          <h2>Limitations and exclusions of liability</h2>

          <ol className={styles.list}>
            <li>
              Nothing in these general terms and conditions will:{" "}
              <ul>
                <li>
                  limit any liabilities in any way that is not permitted under
                  applicable law; or
                </li>{" "}
                <li>
                  exclude any liabilities or statutory rights that may not be
                  excluded under applicable law.
                </li>
              </ul>
            </li>

            <li>
              In respect of the services offered to you free of charge we will
              not be liable to you for any loss or damage of any nature
              whatsoever.
            </li>
            <li>
              We will not be liable to you for any loss or damage of any nature,
              including in respect of:
              <ul>
                <li>
                  any losses occasioned by any interruption or dysfunction to
                  the website;
                </li>
                <li>
                  any losses arising out of any event or events beyond our
                  reasonable control;
                </li>
                <li>
                  any business losses, including (without limitation) loss of or
                  damage to profits, income, revenue, use, production,
                  anticipated savings, business, contracts, commercial
                  opportunities or goodwill;
                </li>
                <li>
                  any loss or corruption of any data, database or software; or
                </li>
                <li>any special, indirect or consequential loss or damage.</li>
              </ul>
            </li>
            <li>
              We accept that we have an interest in limiting the personal
              liability of our officers and employees and, having regard to that
              interest, you acknowledge that we are a limited liability entity;
              you agree that you will not bring any claim personally against our
              officers or employees in respect of any losses you suffer in
              connection with the marketplace or these general terms and
              conditions (this will not limit or exclude the liability of the
              limited liability entity itself for the acts and omissions of our
              officers and employees).
            </li>
            <li>
              Our marketplace includes hyperlinks to other websites owned and
              operated by third parties; such hyperlinks are not
              recommendations. We have no control over third party websites and
              their contents, and we accept no responsibility for them or for
              any loss or damage that may arise from your use of them.
            </li>
          </ol>
        </div>
        <div id="ten" className={styles.choices}>
          <h2>Indemnification</h2>
          <p>
            You hereby indemnify us, and undertake to keep us indemnified,
            against:
          </p>
          <ul className={styles.list}>
            <li>
              any and all losses, damages, costs, liabilities and expenses
              (including without limitation legal expenses and any amounts paid
              by us to any third party in settlement of a claim or dispute)
              incurred or suffered by us and arising directly or indirectly out
              of your use of our marketplace or any breach by you of any
              provision of these general terms and conditions, policies or
              guidelines; and
            </li>
            <li>
              any VAT liability or other tax liability that we may incur in
              relation to any sale, supply or purchase made through our
              marketplace, where that liability arises out of your failure to
              pay, withhold, declare or register to pay any VAT or other tax
              properly due in any jurisdiction.
            </li>
          </ul>
        </div>

        <div id="eleven" className={styles.choices}>
          <h2>Breaches of these general terms and conditions</h2>

          <ol className={styles.list}>
            <li>
              If we permit the registration of an account on our marketplace it
              will remain open indefinitely, subject to these general terms and
              conditions.
            </li>
            <li>
              If you breach these general terms and conditions, or if we
              reasonably suspect that you have breached these general terms and
              conditions, policies or guidelines in any way we may:
              <ul>
                <li>temporarily suspend your access to our marketplace;</li>
                <li>
                  permanently prohibit you from accessing our marketplace;
                </li>
                <li>
                  block computers using your IP address from accessing our
                  marketplace;{" "}
                </li>
                <li>
                  contact any or all of your internet service providers and
                  request that they block your access to our marketplace;
                </li>
                <li>
                  suspend or delete your account on our marketplace; and/or{" "}
                </li>
                <li>
                  commence legal action against you, whether for breach of
                  contract or otherwise.
                </li>
              </ul>
            </li>
          </ol>
        </div>

        <div id="twelve" className={styles.choices}>
          <h2>Law and jurisdiction</h2>

      
          <ol className={styles.list}>
            <li>
             These general terms and conditions shall be governed by and construed in accordance with the laws of the territory.
            </li>
            <li>
             Any disputes relating to these general terms and conditions shall be subject to the exclusive jurisdiction of the courts of the territory
            </li>
          </ol>
        </div>

        <div id="thirteen" className={styles.choices}>
          <h2>Our company details</h2>

         
          <p>
            The marketplace is operated by Proxynet Communications Limited Limited. We are registered in Nigeria, and our head office is at The Proxynet House, 5B, Adedeji Close, off Opebi Road, Ikeja, Lagos, Nigeria. You can contact us by using our contact form
          </p>
        
        </div>
      </div>
    </>
  );
}
