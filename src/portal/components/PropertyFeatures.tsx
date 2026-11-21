import type { PortalPropertyDetail } from "../types";
import Icon from "./Icon";

export default function PropertyFeatures({
  items,
}: {
  items: PortalPropertyDetail["characteristics"];
}) {
  if (items.length === 0) return null;
  return (
    <section className="detail-section" aria-labelledby="features-title">
      <h2 id="features-title">Características</h2>
      <ul className="char-list">
        {items.map((item) => (
          <li key={item.slug}>
            <Icon name="check" />
            {item.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
