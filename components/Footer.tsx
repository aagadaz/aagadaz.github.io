import { profile } from "@/data/profile";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span className="mono muted">Next.js · TypeScript · GitHub Pages</span>
      </div>
    </footer>
  );
}
