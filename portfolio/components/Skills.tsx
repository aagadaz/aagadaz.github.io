import { skills } from "@/data/profile";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

export function Skills() {
  return (
    <section id="skills" className="section container" aria-labelledby="skills-title">
      <SectionHeading index="02" title="Compétences" id="skills-title" />
      <div className="skills-grid">
        {skills.map((g, i) => (
          <Reveal key={g.label} className="card skill-card" delay={i * 70}>
            <h3>{g.label}</h3>
            <ul className="tags">
              {g.items.map((s) => <li key={s} className="tag">{s}</li>)}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
