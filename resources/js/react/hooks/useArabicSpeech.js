import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for Arabic text-to-speech using Web Speech API
 * Features:
 * - Automatic Arabic voice detection (ar-SA, ar-EG, ar-*, etc.)
 * - Long text chunking to prevent browser speech timeout (Chrome ~15s limit)
 * - Play, Pause, Resume, Stop controls
 * - Speech rate adjustment (0.75x, 0.85x, 1x, etc.)
 * - Singleton playback (only one hadith plays at a time)
 */
export function useArabicSpeech() {
    const [isSupported, setIsSupported] = useState(false);
    const [activeId, setActiveId] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [totalChunks, setTotalChunks] = useState(0);
    const [rate, setRate] = useState(0.85); // 0.85 is ideal for Arabic articulation
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);

    const chunksRef = useRef([]);
    const chunkIndexRef = useRef(0);
    const rateRef = useRef(rate);
    const activeIdRef = useRef(null);
    const isStoppingRef = useRef(false);

    // Keep rate ref in sync
    useEffect(() => {
        rateRef.current = rate;
    }, [rate]);

    // Check support and load voices
    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
            setIsSupported(true);

            const loadVoices = () => {
                const availableVoices = window.speechSynthesis.getVoices();
                setVoices(availableVoices);

                // Priority: ar-SA > ar-EG > any ar-* voice
                const arabicVoice = availableVoices.find(v => v.lang === 'ar-SA' || v.lang === 'ar_SA') ||
                    availableVoices.find(v => v.lang.startsWith('ar')) ||
                    null;

                setSelectedVoice(arabicVoice);
            };

            loadVoices();

            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = loadVoices;
            }
        } else {
            setIsSupported(false);
        }

        // Cleanup on unmount: stop any active speech
        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    /**
     * Split long Arabic text into natural, manageable sentences/phrases
     * preventing browser speech-synthesis truncation
     */
    const splitArabicTextIntoChunks = useCallback((text) => {
        if (!text) return [];

        // Remove superfluous whitespace or bracket tags if needed
        const cleanText = text.replace(/\s+/g, ' ').trim();

        // Split by Arabic sentence/clause punctuation (، , ؛ ; . ؟ \n)
        const rawSegments = cleanText.split(/([،,؛;\.\?\!\n]+)/g);
        const chunks = [];
        let buffer = '';

        for (let i = 0; i < rawSegments.length; i++) {
            const seg = rawSegments[i];
            if (!seg) continue;

            // If buffer + segment is around 120-160 chars or is punctuation, push chunk
            if ((buffer + seg).length > 140 && buffer.trim()) {
                chunks.push(buffer.trim());
                buffer = seg;
            } else {
                buffer += seg;
            }
        }

        if (buffer.trim()) {
            chunks.push(buffer.trim());
        }

        return chunks.length > 0 ? chunks : [cleanText];
    }, []);

    /**
     * Internal function to speak a specific chunk
     */
    const speakChunk = useCallback((index) => {
        if (!('speechSynthesis' in window)) return;
        if (isStoppingRef.current) return;

        const chunks = chunksRef.current;
        if (index >= chunks.length) {
            // All chunks finished
            setIsPlaying(false);
            setIsPaused(false);
            setActiveId(null);
            activeIdRef.current = null;
            return;
        }

        chunkIndexRef.current = index;
        setCurrentChunkIndex(index);

        const chunkText = chunks[index];
        const utterance = new SpeechSynthesisUtterance(chunkText);
        utterance.lang = selectedVoice ? selectedVoice.lang : 'ar-SA';
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        utterance.rate = rateRef.current;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            setIsPlaying(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            if (!isStoppingRef.current) {
                // Speak next chunk
                speakChunk(index + 1);
            }
        };

        utterance.onerror = (e) => {
            console.warn('SpeechSynthesis error:', e);
            if (!isStoppingRef.current) {
                // If it's not a manual cancel, try next chunk or stop
                if (e.error === 'interrupted' || e.error === 'canceled') {
                    // Canceled intentionally
                    return;
                }
                speakChunk(index + 1);
            }
        };

        window.speechSynthesis.speak(utterance);
    }, [selectedVoice]);

    /**
     * Play or restart reading Arabic text for a specific hadith ID
     */
    const play = useCallback((id, arabicText) => {
        if (!('speechSynthesis' in window)) return;

        // Cancel previous speech
        isStoppingRef.current = false;
        window.speechSynthesis.cancel();

        const chunks = splitArabicTextIntoChunks(arabicText);
        chunksRef.current = chunks;
        chunkIndexRef.current = 0;
        setTotalChunks(chunks.length);
        setCurrentChunkIndex(0);

        setActiveId(id);
        activeIdRef.current = id;
        setIsPlaying(true);
        setIsPaused(false);

        // Small timeout to ensure synthesis queue is clean
        setTimeout(() => {
            speakChunk(0);
        }, 50);
    }, [splitArabicTextIntoChunks, speakChunk]);

    /**
     * Pause speech
     */
    const pause = useCallback(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.pause();
            setIsPaused(true);
            setIsPlaying(false);
        }
    }, []);

    /**
     * Resume speech
     */
    const resume = useCallback(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            setIsPlaying(true);
        }
    }, []);

    /**
     * Stop speech completely
     */
    const stop = useCallback(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            isStoppingRef.current = true;
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            setIsPaused(false);
            setActiveId(null);
            activeIdRef.current = null;
            setCurrentChunkIndex(0);
            setTotalChunks(0);
        }
    }, []);

    /**
     * Change speech rate
     */
    const changeRate = useCallback((newRate) => {
        setRate(newRate);
        rateRef.current = newRate;
        // If currently playing, restart from current chunk with new rate
        if (isPlaying && activeIdRef.current) {
            const currentIdx = chunkIndexRef.current;
            window.speechSynthesis.cancel();
            setTimeout(() => {
                speakChunk(currentIdx);
            }, 50);
        }
    }, [isPlaying, speakChunk]);

    return {
        isSupported,
        activeId,
        isPlaying,
        isPaused,
        currentChunkIndex,
        totalChunks,
        rate,
        selectedVoice,
        play,
        pause,
        resume,
        stop,
        changeRate
    };
}
