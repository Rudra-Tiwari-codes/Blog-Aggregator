// Vercel Web Analytics initialization
(function() {
  if (typeof window !== 'undefined') {
    window.va = window.va || function() {
      (window.vaq = window.vaq || []).push(arguments);
    };
  }
})();

// Load Vercel Analytics script
(function() {
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  document.head.appendChild(script);
})();

// Track page views
if (typeof window !== 'undefined') {
  // Track initial page load
  window.va('pageview');

  // Log analytics loaded
  console.log('Vercel Web Analytics loaded');
}
