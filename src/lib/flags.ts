import { flag } from "flags/next";

export const landingEnabled = flag<boolean>({
  key: "landing-enabled",
  defaultValue: false,
  decide() {
    const envValue = process.env.LANDING_ENABLED;
    if (envValue !== undefined) return envValue === "true";
    return this.defaultValue ?? false;
  },
});
