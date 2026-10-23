import { education, experiences } from "@/data/profile";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

export function ExperienceTimeline() {
  return (
    <section id="experience" className="section container" aria-labelledby="exp-title">
      <SectionHeading index="03" title="Parcours" id="exp-title" />
      <ol className="timeline">
        {experiences.map((e) => (
          <Reveal as="li" key={e.company} className="timeline-item">
            <div className="timeline-meta">
              <span className="mono">{e.period}</span>
              <span>{e.location}</span>
            </div>
            <div className="timeline-body">
              <h3>
                {e.role}{" "}
                <span className="accent">
                  @{" "}
                  {e.companyUrl ? (
                    <a href={e.companyUrl} target="_blank" rel="noopener noreferrer">{e.company}</a>
                  ) : (
                    e.company
                  )}
                </span>
              </h3>
              <ul>
                {e.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          </Reveal>
        ))}
      </ol>

      <h3 className="subheading">Formation</h3>
      <ol className="timeline">
        {education.map((ed) => (
          <Reveal as="li" key={ed.degree} className="timeline-item">
            <div className="timeline-meta">
              <span className="mono">{ed.period}</span>
              <span>{ed.location}</span>
            </div>
            <div className="timeline-body">
              <h3>{ed.degree} <span className="accent">@ {ed.school}</span></h3>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
