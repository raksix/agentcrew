import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Only allows safe HTML tags and CSS styles.
 * Removes: script, iframe, object, embed, form, input, meta, link, base, head, style (inline only allowed), event handlers
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Check if DOMParser is available (browser only, not SSR)
  if (typeof DOMParser === 'undefined') {
    // SSR fallback: basic regex-based sanitization
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
      .replace(/<input\b[^>]*>/gi, '')
      .replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '')
      .replace(/<meta\b[^>]*>/gi, '')
      .replace(/<link\b[^>]*>/gi, '')
      .replace(/<base\b[^>]*>/gi, '')
      .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:text\/html/gi, '')
      .replace(/vbscript:/gi, '');
  }

  // Create a temporary DOM element to parse HTML
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Remove dangerous elements completely
  const dangerousTags = [
    'script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea',
    'meta', 'link', 'base', 'head', 'style', 'svg', 'math', 'template',
    'slot', 'portal', 'frame', 'frameset', 'applet', 'noscript'
  ];

  dangerousTags.forEach(tag => {
    const elements = doc.querySelectorAll(tag);
    elements.forEach(el => el.remove());
  });

  // Remove all event handlers and dangerous attributes from remaining elements
  const allElements = doc.body.querySelectorAll('*');
  allElements.forEach(el => {
    // Get all attributes
    const attrs = Array.from(el.attributes);
    attrs.forEach(attr => {
      const name = attr.name.toLowerCase();
      
      // Remove event handlers (onclick, onerror, onload, etc.)
      if (name.startsWith('on')) {
        el.removeAttribute(attr.name);
        return;
      }

      // Remove javascript: and data: URLs in href/src
      if (['href', 'src', 'action', 'formaction', 'xlink:href', 'data'].includes(name)) {
        const value = attr.value.toLowerCase().trim();
        if (value.startsWith('javascript:') || value.startsWith('data:text/html') || value.startsWith('vbscript:')) {
          el.removeAttribute(attr.name);
        }
      }

      // Remove srcdoc (can contain arbitrary HTML)
      if (name === 'srcdoc') {
        el.removeAttribute(attr.name);
      }

      // Sanitize style attribute - remove expressions, behaviors, urls that could be malicious
      if (name === 'style') {
        let styleValue = attr.value;
        // Remove expression(), url() with javascript/data, behavior, -moz-binding
        styleValue = styleValue.replace(/expression\s*\([^)]*\)/gi, '');
        styleValue = styleValue.replace(/url\s*\(\s*["']?\s*javascript:[^)]*\)/gi, '');
        styleValue = styleValue.replace(/url\s*\(\s*["']?\s*data:text\/html[^)]*\)/gi, '');
        styleValue = styleValue.replace(/behavior\s*:[^;]*/gi, '');
        styleValue = styleValue.replace(/-moz-binding\s*:[^;]*/gi, '');
        styleValue = styleValue.replace(/-webkit-[^:]+\s*:[^;]*expression[^;]*/gi, '');
        el.setAttribute('style', styleValue);
      }
    });

    // Remove dangerous tag names that might have been missed (custom elements with scripts)
    const tagName = el.tagName.toLowerCase();
    if (tagName.includes('script') || tagName.includes('javascript')) {
      el.remove();
    }
  });

  // Return sanitized HTML
  return doc.body.innerHTML;
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
