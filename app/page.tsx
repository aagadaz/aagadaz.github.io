import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { ExperienceTimeline } from "@/components/ExperienceTimeline";
import { Projects } from "@/components/Projects";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { caseStudySlugs } from "@/lib/case-studies";

// Server Component : rendu en HTML au build (export statique).
// Seuls ThemeToggle, Reveal et le filtre de Projects envoient du JS au client.
export default function HomePage() {
  // Lu sur le disque au build (Server Component) ; le client ne reçoit que la liste.
  const detailed = caseStudySlugs();
  return (
    <>
      <a href="#main" className="skip-link">Aller au contenu</a>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <ExperienceTimeline />
        <Projects detailedSlugs={detailed} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
