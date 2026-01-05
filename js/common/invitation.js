/**
 * Invitation Data Loader Module
 *
 * This module loads invitation data from window.invitationData and injects it
 * into the HTML by finding elements with data-invitation attributes.
 *
 * Usage:
 *   import { invitation } from './common/invitation.js';
 *   invitation.init();
 */

export const invitation = (() => {
    let data = null;

    /**
     * Initialize the invitation data loader
     * Loads data from window.invitationData and injects into DOM
     */
    const init = () => {
        // Load data from window (set by invitation-data.js)
        data = window.invitationData;

        if (!data) {
            console.error('[Invitation] Invitation data not found. Please include invitation-data.js before guest.js');
            return;
        }

        console.log('[Invitation] Data loaded successfully');

        // Set countdown datetime on body if provided
        if (data.event && data.event.countdownDatetime) {
            document.body.setAttribute('data-time', data.event.countdownDatetime);
            console.log('[Invitation] Countdown datetime set to:', data.event.countdownDatetime);
        }

        // Inject data into HTML elements
        injectData();
    };

    /**
     * Find all elements with data-invitation attribute and update them
     */
    const injectData = () => {
        const elements = document.querySelectorAll('[data-invitation]');
        console.log(`[Invitation] Found ${elements.length} elements to update`);

        let successCount = 0;
        let errorCount = 0;

        elements.forEach(el => {
            const path = el.getAttribute('data-invitation');
            const updateType = el.getAttribute('data-update-type') || 'auto';
            const value = getValueByPath(path);

            if (value !== undefined && value !== null) {
                try {
                    updateElement(el, value, updateType);
                    successCount++;
                } catch (error) {
                    console.error(`[Invitation] Error updating element with path '${path}':`, error);
                    errorCount++;
                }
            } else {
                console.warn(`[Invitation] No value found for path: ${path}`);
                errorCount++;
            }
        });

        console.log(`[Invitation] Injection complete: ${successCount} successful, ${errorCount} errors`);
    };

    /**
     * Get value from nested object using dot notation path
     * Supports both object paths (couple.groom.name) and array indices (story.chapters[0].title)
     *
     * @param {string} path - Dot notation path (e.g., 'couple.groom.name' or 'story.chapters[0].title')
     * @returns {*} The value at the path, or undefined if not found
     */
    const getValueByPath = (path) => {
        if (!path || !data) return undefined;

        // Split path by dots
        const parts = path.split('.');
        let current = data;

        for (const part of parts) {
            if (current === undefined || current === null) {
                return undefined;
            }

            // Check if part contains array index notation: property[index]
            const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);

            if (arrayMatch) {
                // Extract property name and index
                const [, propName, index] = arrayMatch;
                current = current[propName];

                if (Array.isArray(current)) {
                    current = current[parseInt(index, 10)];
                } else {
                    return undefined;
                }
            } else {
                // Regular property access
                current = current[part];
            }
        }

        return current;
    };

    /**
     * Update an HTML element with a value based on element type
     *
     * @param {HTMLElement} el - The element to update
     * @param {*} value - The value to set
     * @param {string} type - Update type ('auto', 'text', 'placeholder', 'image', 'href', 'meta', 'data-message', 'data-copy')
     */
    const updateElement = (el, value, type) => {
        switch (type) {
            case 'text':
                el.textContent = value;
                break;

            case 'placeholder':
                el.placeholder = value;
                break;

            case 'image':
                // For images, update data-src (used by lazy loading)
                el.setAttribute('data-src', value);
                break;

            case 'href':
                el.href = value;
                break;

            case 'meta':
                // For meta tags, update content attribute
                el.content = value;
                break;

            case 'data-message':
                // For elements with data-message attribute
                el.dataset.message = value;
                break;

            case 'data-copy':
                // For copy buttons, update data-copy attribute
                el.dataset.copy = value;
                break;

            case 'auto':
            default:
                // Auto-detect based on element type and attributes
                autoUpdateElement(el, value);
                break;
        }
    };

    /**
     * Auto-detect how to update an element based on its type and attributes
     *
     * @param {HTMLElement} el - The element to update
     * @param {*} value - The value to set
     */
    const autoUpdateElement = (el, value) => {
        const tagName = el.tagName;

        // Images - update data-src for lazy loading
        if (tagName === 'IMG') {
            el.setAttribute('data-src', value);
        }
        // Links - update href
        else if (tagName === 'A') {
            el.href = value;
        }
        // Link tags (canonical, etc.) - update href
        else if (tagName === 'LINK' && el.hasAttribute('href')) {
            el.href = value;
        }
        // Meta tags - update content
        else if (tagName === 'META') {
            el.content = value;
        }
        // Title tag - update text
        else if (tagName === 'TITLE') {
            el.textContent = value;
        }
        // Input/Textarea - update placeholder if it exists, otherwise value
        else if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
            if (el.hasAttribute('placeholder')) {
                el.placeholder = value;
            } else {
                el.value = value;
            }
        }
        // Select options - update text
        else if (tagName === 'OPTION') {
            el.textContent = value;
        }
        // Buttons with data-copy - update both text and data-copy
        else if (el.hasAttribute('data-copy')) {
            el.dataset.copy = value;
            // Only update text content if element doesn't have icons
            if (!el.querySelector('i')) {
                el.textContent = value;
            }
        }
        // Default - update text content
        else {
            el.textContent = value;
        }
    };

    /**
     * Get the loaded invitation data
     * @returns {object} The invitation data object
     */
    const get = () => data;

    // Public API
    return {
        init,
        get
    };
})();
