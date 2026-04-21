/**
 * Google Analytics 4 tracking utilities
 */

import type { NewsletterSignupSource } from "@/lib/validations";

type GtagFn = (command: string, eventName: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

export type SignupLocation = NewsletterSignupSource;
export type CTALocation = "hero" | "footer" | "pricing" | "cta" | "cta-mobile";
type SignupResult = "created" | "duplicate" | "error";
type ScrollDepth = 25 | 50 | 75 | 90;

const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
};

/**
 * Track newsletter signup event
 */
export const trackNewsletterSignup = (location: SignupLocation) => {
  trackEvent("newsletter_signup", { location });
};

export const trackNewsletterSignupResult = (location: SignupLocation, result: SignupResult) => {
  trackEvent("newsletter_signup_result", { location, result });
};

/**
 * Track CTA click event
 */
export const trackCTAClick = (location: CTALocation, label?: string) => {
  trackEvent("cta_click", label ? { location, label } : { location });
};

/**
 * Track pricing view event
 */
export const trackPricingView = () => {
  trackEvent("pricing_view");
};

/**
 * Track feature hover event
 */
export const trackFeatureHover = (featureName: string) => {
  trackEvent("feature_hover", { feature_name: featureName });
};

/**
 * Track testimonial view event
 */
export const trackTestimonialView = (testimonialIndex: number) => {
  trackEvent("testimonial_view", { testimonial_index: testimonialIndex });
};

/**
 * Track video event (start or complete)
 */
export const trackVideoEvent = (action: "start" | "complete", label: string) => {
  trackEvent(`video_${action}`, { video_label: label });
};

/**
 * Track FAQ expand event
 */
export const trackFAQExpand = (question: string) => {
  trackEvent("faq_expand", { question });
};

/**
 * Track scroll depth event
 */
export const trackScrollDepth = (depth: ScrollDepth) => {
  trackEvent("scroll_depth", { depth_percent: depth });
};

/**
 * Track exit intent signup event
 */
export const trackExitIntentSignup = () => {
  trackEvent("exit_intent_signup");
};
