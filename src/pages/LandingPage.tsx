// src/pages/LandingPage.tsx
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import Impact from '../components/sections/Impact';
import HowItWorks from '../components/sections/HowItWorks';
import CTA from '../components/sections/CTA';

const LandingPage = () => {
    return (
        <div className="flex flex-col gap-24 md:gap-32 pb-20">
            <Hero />
            <Features />
            <Impact />
            <HowItWorks />
            <CTA />
        </div>
    );
};

export default LandingPage;
