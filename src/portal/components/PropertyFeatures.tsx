import { Check } from "lucide-react";
import type { PortalPropertyDetail } from "../types";

export default function PropertyFeatures({
  items,
}: {
  items: PortalPropertyDetail["characteristics"];
}) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="features-title">
      <h2 id="features-title" className="text-xl font-semibold text-stone-900">
        Características
      </h2>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.slug} className="flex items-center gap-2 text-stone-800">
            <Check className="h-4 w-4 shrink-0 text-stone-500" aria-hidden />
            {item.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
