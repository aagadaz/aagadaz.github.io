import { profile } from "@/data/profile";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

export function About() {
  return (
    <section id="about" className="section container" aria-labelledby="about-title">
      <SectionHeading index="01" title="À propos" id="about-title" />
      <Reveal className="about-grid">
        <div className="prose">
          {profile.about.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <dl className="facts">
          {profile.facts.map((f) => (
            <div key={f.label} className="fact">
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
