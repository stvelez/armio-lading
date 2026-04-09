/**
 * Google Analytics 4 tracking utilities
 */

type GtagFn = (command: string, eventName: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

type Location = "hero" | "footer" | "popup" | "pricing" | "cta" | "cta-mobile";

const gtag = (...args: Parameters<GtagFn>) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
};

/**
 * Track newsletter signup event
 */
export const trackNewsletterSignup = (location: Location) => {
  gtag("event", "newsletter_signup", { location });
};

/**
 * Track CTA click event
 */
export const trackCTAClick = (location: Location) => {
  gtag("event", "cta_click", { location });
};

/**
 * Track pricing view event
 */
export const trackPricingView = () => {
  gtag("event", "pricing_view");
};

/**
 * Track feature hover event
 */
export const trackFeatureHover = (featureName: string) => {
  gtag("event", "feature_hover", { feature_name: featureName });
};

/**
 * Track testimonial view event
 */
export const trackTestimonialView = (testimonialIndex: number) => {
  gtag("event", "testimonial_view", { testimonial_index: testimonialIndex });
};

/**
 * Track video event (start or complete)
 */
export const trackVideoEvent = (action: "start" | "complete", label: string) => {
  gtag("event", `video_${action}`, { video_label: label });
};

/**
 * Track FAQ expand event
 */
export const trackFAQExpand = (question: string) => {
  gtag("event", "faq_expand", { question });
};

/**
 * Track scroll depth event
 */
export const trackScrollDepth = (depth: 25 | 50 | 75 | 90) => {
  gtag("event", "scroll_depth", { depth_percent: depth });
};

/**
 * Track exit intent signup event
 */
export const trackExitIntentSignup = () => {
  gtag("event", "exit_intent_signup");
};
