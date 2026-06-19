import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import ScrollToTop from "./components/ScrolltoTop";
import BacktoTop from "./components/BacktoTop";
import Chatbox from "./components/Chatbox";
import PageLoader from "./components/PageLoader";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Topnav from "./components/Topnav";
import SignUp from "./pages/Signup";
import Login from "./pages/Login";
import TermsOfUse from "./legal/TOU";
import OrderTracking from "./pages/TrackOrder";
import Privacy from "./legal/Privacy";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import ForgotPassword from "./pages/Forgot";
import Product from "./pages/Productpage";
export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <PageLoader />
        <ScrollToTop />
        <Topnav/>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route  path="/shop" element={<Shop />} />
           <Route  path="/signup" element={<SignUp />} />
           <Route  path="/login" element={<Login />} />
           <Route  path="/terms-of-use" element={<TermsOfUse />} />
             <Route  path="/track-order" element={<OrderTracking />} />
               <Route  path="/privacy-policy" element={<Privacy />} />
               <Route  path="/faqs" element={<FAQ />} />
               <Route  path="/about-us" element={<About />} />
               <Route  path="/contact" element={<Contact />} />
               <Route  path="/cart" element={<Cart />} />
               <Route  path="/forgotpassword" element={<ForgotPassword />} />
               <Route  path="/product/" element={<Product />} />
        </Routes>
        <Chatbox />
        <BacktoTop />
        <Footer />
      </BrowserRouter>
    </CartProvider>
  )
};