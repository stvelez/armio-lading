import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Armio — Propiedades, leads y contratos en un solo lugar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#F5F4EF",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "80px",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: "#1D1D1B",
          letterSpacing: "-0.02em",
          marginBottom: 32,
          display: "flex",
        }}
      >
        armio
      </div>

      {/* Headline line 1 */}
      <div
        style={{
          fontSize: 60,
          fontWeight: 700,
          color: "#1D1D1B",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          marginBottom: 4,
          display: "flex",
        }}
      >
        Propiedades, leads y contratos
      </div>

      {/* Headline line 2 — accent color */}
      <div
        style={{
          fontSize: 60,
          fontWeight: 700,
          color: "#1D9E75",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          marginBottom: 28,
          display: "flex",
        }}
      >
        en un solo lugar
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 26,
          color: "#5F5E5A",
          maxWidth: 700,
          lineHeight: 1.4,
          marginBottom: 48,
          display: "flex",
        }}
      >
        Diseñado para independientes y agencias inmobiliarias en Colombia.
      </div>

      {/* Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#E1F5EE",
          border: "1px solid #A8E6CF",
          borderRadius: 100,
          padding: "10px 24px",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#1D9E75",
            display: "flex",
          }}
        />
        <div style={{ fontSize: 20, color: "#0F6E56", fontWeight: 600, display: "flex" }}>
          Early access abierto
        </div>
      </div>

      {/* URL — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          right: 80,
          fontSize: 22,
          color: "#888780",
          display: "flex",
        }}
      >
        armio.co
      </div>
    </div>,
    { ...size }
  );
}
