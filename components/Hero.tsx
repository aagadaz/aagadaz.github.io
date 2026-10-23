import { profile } from "@/data/profile";

export function Hero() {
  return (
    <section id="top" className="hero container">
      <p className="eyebrow">
        <span className="status-dot" aria-hidden="true" />
        {profile.availability} · {profile.location}
      </p>
      <h1 className="hero-title">
        {profile.name}
        <span className="hero-role">{profile.title}</span>
      </h1>
      <p className="hero-tagline">{profile.tagline}</p>
      <div className="hero-actions">
        <a className="btn btn-primary" href="#projects">Voir mes projets</a>
        <a className="btn btn-ghost" href={profile.cvUrl} download>Télécharger mon CV</a>
      </div>
      <ul className="hero-socials">
        {profile.socials.map((s) => (
          <li key={s.label}>
            <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label} ↗</a>
          </li>
        ))}
        <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li>
      </ul>
    </section>
  );
}
