// src/pages/LandingPage.tsx
import Navbar from '../components/layout/Navbar';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import Impact from '../components/sections/Impact';
import HowItWorks from '../components/sections/HowItWorks';
import CTA from '../components/sections/CTA';
import Footer from '../components/layout/Footer';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />
            <main>
                <Hero />
                <Features />
                <Impact />
                <HowItWorks />
                <CTA />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;