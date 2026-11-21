"use client";

import { useEffect } from "react";

/**
 * Los dos efectos de JS del prototipo que no son contenido:
 * - cabecera: `.is-scrolled` al bajar más de 8 px (borde y sombra);
 * - `.reveal`: entra con `.is-in` al aparecer en pantalla. Se observan también los nodos que llegan
 *   después (paginación, navegación del cliente) y, con `prefers-reduced-motion`, se muestran ya.
 */
export default function PortalEffects() {
  useEffect(() => {
    const header = document.getElementById("header");
    const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const show = (node: Element) => node.classList.add("is-in");
    const observer =
      reduced || !("IntersectionObserver" in window)
        ? null
        : new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                show(entry.target);
                observer?.unobserve(entry.target);
              }
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
          );

    const watch = (node: Element) => {
      if (node.classList.contains("is-in")) return;
      if (observer) observer.observe(node);
      else show(node);
    };
    const scan = (root: ParentNode) => root.querySelectorAll(".reveal").forEach(watch);
    scan(document);

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.classList.contains("reveal")) watch(node);
          scan(node);
        });
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      mutations.disconnect();
      observer?.disconnect();
    };
  }, []);

  return null;
}
