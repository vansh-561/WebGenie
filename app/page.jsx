import Footer from "@/client/components/Footer";
import Hero from "@/client/components/Hero";
import {Navbar} from "@/client/components/Navbar";
import About from "@/client/components/About";
import Pricing from "@/client/components/Pricing";

export default function Home() {

  return (
    <>
      <Navbar>
        <Hero />
      </Navbar>
      <About />
      <Pricing />
      <Footer />
    </>
  );
}