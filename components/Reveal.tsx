"use client";

import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number; // en ms, pour décaler les cartes d'une grille
}

/**
 * Fait apparaître son contenu en fondu quand il entre dans le viewport.
 * IntersectionObserver est géré par le navigateur hors du thread principal :
 * bien plus performant qu'un listener "scroll" qui appelle getBoundingClientRect().
 */
export function Reveal({ children, as: Tag = "div", className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  // L'état "visible" vit dans React (et non via classList.add) : sinon un
  // re-render réécrirait className et effacerait la classe ajoutée à la main.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect(); // une seule fois : on libère l'observation
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect(); // nettoyage au démontage
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${visible ? "is-visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}
