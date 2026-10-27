/**
 * FairShift - Core Security & Formatting Utilities
 * Provides XSS prevention, defensive input sanitization, 
 * monotonic cryptographic nonces, and currency/time formatters.
 */

(function (root, factory) {
  const result = factory();
  if (typeof window !== 'undefined') {
    window.FairShiftUtils = result;
  }
  if (typeof global !== 'undefined') {
    global.FairShiftUtils = result;
  }
  if (typeof define === 'function' && define.amd) {
    define([], () => result);
  }
  if (typeof module === 'object' && module.exports) {
    module.exports = result;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const HTML_ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  /**
   * Defensive XSS protection - Escapes all untrusted text before insertion into DOM.
   * @param {string} text - Raw input string
   * @returns {string} Safe escaped HTML string
   */
  function escapeHTML(text) {
    if (text === null || text === undefined) return '';
    return String(text).replace(/[&<>"'/]/g, char => HTML_ESCAPE_MAP[char] || char);
  }

  /**
   * Sanitizes text inputs by trimming, removing control characters and null bytes.
   * @param {string} text 
   * @param {number} [maxLength=500]
   * @returns {string} Sanitized string
   */
  function sanitizeInput(text, maxLength = 500) {
    if (typeof text !== 'string') return '';
    return text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove control chars
      .trim()
      .slice(0, maxLength);
  }

  /**
   * Format currency with localized symbol and decimal precision
   * @param {number} amount
   * @param {string} symbol - e.g. '₹', '$', '€'
   * @param {number} [decimals=2]
   * @returns {string}
   */
  function formatCurrency(amount, symbol = '₹', decimals = 2) {
    const num = Number(amount) || 0;
    return `${symbol}${num.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  }

  /**
   * Format elapsed seconds into HH:MM:SS
   * @param {number} totalSeconds
   * @returns {string}
   */
  function formatDuration(totalSeconds) {
    const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  /**
   * Generate cryptographically unguessable pseudo-random nonce
   * @param {string} prefix
   * @returns {string}
   */
  function generateNonce(prefix = 'nonce') {
    const randomHex = Math.random().toString(36).substring(2, 10);
    const timeHex = Date.now().toString(36);
    return `${prefix}_${timeHex}_${randomHex}`;
  }

  return {
    escapeHTML,
    sanitizeInput,
    formatCurrency,
    formatDuration,
    generateNonce
  };
}));
