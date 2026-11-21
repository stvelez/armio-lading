import { describe, expect, it } from "vitest";
import { contactLinks } from "@/portal/components/ContactCard";

const base = {
  title: "Casa",
  url: "https://demo.armio.co/propiedades/1-casa",
};

describe("contactLinks", () => {
  it("no repite el mismo número como WhatsApp y teléfono", () => {
    const { wa, tel } = contactLinks({
      ...base,
      whatsapp: "300 123 4567",
      phone: "+57 300 123 4567",
    });
    expect(wa).toContain("wa.me/573001234567");
    expect(tel).toBeNull();
  });

  it("mantiene los dos canales cuando son números distintos", () => {
    const { wa, tel } = contactLinks({ ...base, whatsapp: "300 123 4567", phone: "601 555 0101" });
    expect(wa).toContain("wa.me/573001234567");
    expect(tel).toBe("tel:+576015550101");
  });

  it("sin teléfono no inventa un canal de llamada con el WhatsApp", () => {
    const { wa, tel } = contactLinks({ ...base, whatsapp: "300 123 4567", phone: null });
    expect(wa).toBeTruthy();
    expect(tel).toBeNull();
  });

  it("sin WhatsApp usa solo el teléfono", () => {
    const { wa, tel } = contactLinks({ ...base, whatsapp: null, phone: "601 555 0101" });
    expect(wa).toBeNull();
    expect(tel).toBe("tel:+576015550101");
  });
});
