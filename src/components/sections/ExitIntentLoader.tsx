"use client";

import dynamic from "next/dynamic";

const ExitIntent = dynamic(() => import("@/components/sections/ExitIntent"), {
  ssr: false,
});

export default function ExitIntentLoader() {
  return <ExitIntent />;
}
