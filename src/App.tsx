import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "./context/CartContext";
import ScrollToTop from "./components/ScrolltoTop";
import BacktoTop from "./components/BacktoTop";
import Chatbox from "./components/Chatbox";
import PageLoader from "./components/PageLoader";
import { Toaster } from "sonner";
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
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout";
import ForgotPassword from "./pages/Forgot";
import Product from "./pages/Productpage";

// Wrapper component for animated routes
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Home />
          </motion.div>
        } />
        <Route path="/shop" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Shop />
          </motion.div>
        } />
        <Route path="/signup" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <SignUp />
          </motion.div>
        } />
        <Route path="/login" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Login />
          </motion.div>
        } />
        <Route path="/terms-of-use" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <TermsOfUse />
          </motion.div>
        } />
        <Route path="/track-order" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <OrderTracking />
          </motion.div>
        } />
        <Route path="/privacy-policy" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Privacy />
          </motion.div>
        } />
        <Route path="/faqs" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <FAQ />
          </motion.div>
        } />
        <Route path="/about-us" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <About />
          </motion.div>
        } />
        <Route path="/contact" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Contact />
          </motion.div>
        } />
        <Route path="/cart" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Cart />
          </motion.div>
        } />
        <Route path="/checkout" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Checkout />
          </motion.div>
        } />
        <Route path="/forgotpassword" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <ForgotPassword />
          </motion.div>
        } />
        <Route path="/product/:id" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Product />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <HelmetProvider>
    <CartProvider>
      <BrowserRouter>
        <PageLoader />
        <ScrollToTop />
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            style: { fontFamily: 'inherit' },
          }}
        />
        <Topnav/>
        <Navbar/>
        <AnimatedRoutes />
        <Chatbox />
        <BacktoTop />
        <Footer />
      </BrowserRouter>
    </CartProvider>
    </HelmetProvider>
  )
};