import { useEffect } from 'react';

/**
 * A custom hook to handle document title changes
 * @param {string} title - The title to set for the document
 * @param {boolean} overrideOnUnmount - Whether to override the title on unmount (default: true)
 */
export default function useDocumentTitle(title, overrideOnUnmount = true) {
    const defaultTitle = 'IndoQuran - Al-Quran Digital Bahasa Indonesia';
    
    useEffect(() => {
        // Save the original document title
        const originalTitle = document.title;
        
        // Set the new document title
        document.title = title || defaultTitle;
        
        // Restore the original title when the component unmounts
        return () => {
            if (overrideOnUnmount) {
                document.title = originalTitle;
            }
        };
    }, [title, overrideOnUnmount, defaultTitle]);
}
