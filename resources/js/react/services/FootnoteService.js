/**
 * FootnoteService.js
 * Service to handle footnote functionality in the Quran translation
 */

// Cache for storing fetched footnotes to avoid repeated API calls
const footnoteCache = {};

/**
 * Fetch footnote content by ID
 * @param {string|number} footnoteId - The ID of the footnote to fetch
 * @returns {Promise<string>} - The footnote content
 */
export const fetchFootnote = async (footnoteId) => {
    // If we already have this footnote in cache, return it
    if (footnoteCache[footnoteId]) {
        return footnoteCache[footnoteId];
    }

    try {
        // In a real implementation, you would make an API call here
        // For now, we're mocking the response
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock response - in a real application, you would fetch this from your backend
        const footnoteContent = `Ini adalah catatan kaki dengan ID ${footnoteId}`;
        
        // Store in cache for future use
        footnoteCache[footnoteId] = footnoteContent;
        
        return footnoteContent;
    } catch (error) {
        console.error('Error fetching footnote:', error);
        return `Catatan kaki #${footnoteId}`;
    }
};

/**
 * Process a text string to properly format footnote tags
 * @param {string} text - The text containing footnote tags
 * @returns {string} - The processed text with proper footnote HTML
 */
export const processFootnoteText = (text) => {
    if (!text) return text;
    
    // Regular expression to find footnote patterns like <sup foot_note=123>1</sup>
    // This will also work for patterns like <sup foot_note=134952>1</sup>
    const footnoteRegex = /<sup\s+foot_note=(\d+)>(\d+)<\/sup>/g;
    
    // Replace each footnote with properly formatted HTML
    return text.replace(footnoteRegex, (match, footnoteId, footnoteNumber) => {
        return `<sup foot_note="${footnoteId}" class="footnote-reference">${footnoteNumber}</sup>`;
    });
};

export default {
    fetchFootnote,
    processFootnoteText
};
