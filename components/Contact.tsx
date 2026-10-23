import { profile } from "@/data/profile";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

export function Contact() {
  return (
    <section id="contact" className="section container" aria-labelledby="contact-title">
      <SectionHeading index="05" title="Contact" id="contact-title" />
      <Reveal className="card contact-card">
        <h3 className="contact-title">Construisons quelque chose ensemble.</h3>
        <p className="muted">
          Je recherche un premier CDI en ML engineering, data science ou AI engineering à Paris.
          Je réponds généralement sous 24 h.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href={`mailto:${profile.email}`}>M&apos;écrire</a>
          {profile.socials.map((s) => (
            <a key={s.label} className="btn btn-ghost" href={s.href} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
