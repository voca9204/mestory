import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - The potentially unsafe HTML string
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote'],
    ALLOWED_ATTR: ['class', 'style'],
    ALLOWED_STYLE_PROPS: ['color', 'background-color', 'font-weight', 'font-style', 'text-decoration']
  })
}

/**
 * Sanitize plain text content
 * @param text - The potentially unsafe text
 * @returns Sanitized text
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
}

/**
 * Convert newlines to <br> tags and sanitize
 * @param text - The text with newlines
 * @returns Sanitized HTML with <br> tags
 */
export function nl2br(text: string): string {
  const escaped = sanitizeText(text)
  return escaped.replace(/\n/g, '<br />')
}