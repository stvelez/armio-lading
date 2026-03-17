/**
 * Google Analytics 4 tracking utilities
 */

type Location = 'hero' | 'footer' | 'popup';

/**
 * Track newsletter signup event
 */
export const trackNewsletterSignup = (location: Location) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'newsletter_signup', {
      location,
    });
  }
};

/**
 * Track CTA click event
 */
export const trackCTAClick = (location: Location | 'pricing') => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'cta_click', {
      location,
    });
  }
};

/**
 * Track pricing view event
 */
export const trackPricingView = () => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'pricing_view');
  }
};

/**
 * Track feature hover event
 */
export const trackFeatureHover = (featureName: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'feature_hover', {
      feature_name: featureName,
    });
  }
};

/**
 * Track testimonial view event
 */
export const trackTestimonialView = (testimonialIndex: number) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'testimonial_view', {
      testimonial_index: testimonialIndex,
    });
  }
};

/**
 * Track video event (start or complete)
 */
export const trackVideoEvent = (action: 'start' | 'complete', label: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', `video_${action}`, {
      video_label: label,
    });
  }
};

/**
 * Track FAQ expand event
 */
export const trackFAQExpand = (question: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'faq_expand', {
      question,
    });
  }
};

/**
 * Track scroll depth event
 */
export const trackScrollDepth = (depth: 25 | 50 | 75 | 90) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'scroll_depth', {
      depth_percent: depth,
    });
  }
};

/**
 * Track exit intent signup event
 */
export const trackExitIntentSignup = () => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'exit_intent_signup');
  }
};
