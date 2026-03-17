import { createFlagsDiscoveryEndpoint, getProviderData } from "flags/next";
import { landingEnabled } from "@/lib/flags";

export const GET = createFlagsDiscoveryEndpoint((_request) => {
  return getProviderData({ landingEnabled });
});
