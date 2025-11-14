
import React, { useState, useEffect, useCallback, createContext, useContext, useRef, ReactNode, CSSProperties } from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Imported `Type` for defining response schemas for Gemini API calls.
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

// --- DATA ---
const BIBLE_VERSES = [
  // Gospel (10)
  { ref: "John 3:16", text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.", book: "John", themes: ["Love", "Gospel"] },
  { ref: "Romans 3:23", text: "For all have sinned and fall short of the glory of God.", book: "Romans", themes: ["Gospel", "Core Doctrine"] },
  { ref: "Romans 6:23", text: "For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord.", book: "Romans", themes: ["Gospel", "Core Doctrine"] },
  { ref: "Ephesians 2:8-9", text: "For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast.", book: "Ephesians", themes: ["Gospel", "Core Doctrine"] },
  { ref: "John 14:6", text: "Jesus said to him, “I am the way, and the aletheia, and the zoe. No one comes to the Father except through me.”", book: "John", themes: ["Gospel"] },
  { ref: "Romans 5:8", text: "But God shows his love for us in that while we were still sinners, Christ died for us.", book: "Romans", themes: ["Gospel", "Love"] },
  { ref: "1 John 1:9", text: "If we confess our sins, he is faithful and just to forgive us our sins and to cleanse us from all unrighteousness.", book: "1 John", themes: ["Gospel"] },
  { ref: "Acts 4:12", text: "And there is salvation in no one else, for there is no other name under heaven given among men by which we must be saved.", book: "Acts", themes: ["Gospel"] },
  { ref: "John 1:12", text: "But to all who did receive him, who believed in his name, he gave the right to become children of God.", book: "John", themes: ["Gospel"] },
  { ref: "Revelation 3:20", text: "Behold, I stand at the door and knock. If anyone hears my voice and opens the door, I will come in to him and eat with him, and he with me.", book: "Revelation", themes: ["Gospel"] },
  // Psalms (15)
  { ref: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want.", book: "Psalm", themes: ["Encouragement", "Psalms"] },
  { ref: "Psalm 119:105", text: "Your word is a lamp to my feet and a light to my path.", book: "Psalm", themes: ["Psalms"] },
  { ref: "Psalm 46:1", text: "God is our refuge and strength, a very present help in trouble.", book: "Psalm", themes: ["Encouragement", "Psalms"] },
  { ref: "Psalm 1:1-2", text: "Blessed is the man who walks not in the counsel of the wicked, nor stands in the way of sinners, nor sits in the seat of scoffers; but his delight is in the law of the Lord, and on his law he meditates day and night.", book: "Psalm", themes: ["Psalms"] },
  { ref: "Psalm 19:14", text: "Let the words of my mouth and the meditation of my heart be acceptable in your sight, O Lord, my rock and my redeemer.", book: "Psalm", themes: ["Psalms"] },
  { ref: "Psalm 37:4", text: "Delight yourself in the Lord, and he will give you the desires of your heart.", book: "Psalm", themes: ["Psalms"] },
  { ref: "Psalm 51:10", text: "Create in me a clean heart, O God, and renew a right spirit within me.", book: "Psalm", themes: ["Psalms"] },
  { ref: "Psalm 139:14", text: "I praise you, for I am fearfully and wonderfully made. Wonderful are your works; my soul knows it very well.", book: "Psalm", themes: ["Psalms"] },
  { ref: "Psalm 27:1", text: "The Lord is my light and my salvation; whom shall I fear? The Lord is the stronghold of my life; of whom shall I be afraid?", book: "Psalm", themes: ["Encouragement", "Psalms"] },
  { ref: "Psalm 91:1", text: "He who dwells in the shelter of the Most High will abide in the shadow of the Almighty.", book: "Psalm", themes: ["Psalms"] },
  { ref: "Psalm 118:24", text: "This is the day that the Lord has made; let us rejoice and be glad in it.", book: "Psalm", themes: ["Psalms"] },
  { ref: "Psalm 121:1-2", text: "I lift up my eyes to the hills. From where does my help come? My help comes from the Lord, who made heaven and earth.", book: "Psalm", themes: ["Psalms"] },
  { ref: "Psalm 34:8", text: "Oh, taste and see that the Lord is good! Blessed is the man who takes refuge in him!", book: "Psalm", themes: ["Psalms"] },
  { ref: "Psalm 119:11", text: "I have stored up your word in my heart, that I might not sin against you.", book: "Psalm", themes: ["Psalms"] },
  { ref: "Psalm 150:6", text: "Let everything that has breath praise the Lord! Praise the Lord!", book: "Psalm", themes: ["Psalms"] },
  // Encouragement (10)
  { ref: "Philippians 4:13", text: "I can do all things through him who strengthens me.", book: "Philippians", themes: ["Encouragement"] },
  { ref: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.", book: "Joshua", themes: ["Encouragement"] },
  { ref: "Isaiah 41:10", text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.", book: "Isaiah", themes: ["Encouragement"] },
  { ref: "Romans 8:28", text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.", book: "Romans", themes: ["Encouragement"] },
  { ref: "2 Corinthians 12:9", text: "But he said to me, “My grace is sufficient for you, for my power is made perfect in weakness.” Therefore I will boast all the more gladly of my weaknesses, so that the power of Christ may rest upon me.", book: "2 Corinthians", themes: ["Encouragement"] },
  { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.", book: "Proverbs", themes: ["Encouragement"] },
  { ref: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.", book: "Jeremiah", themes: ["Encouragement"] },
  { ref: "Matthew 11:28", text: "Come to me, all who labor and are heavy laden, and I will give you rest.", book: "Matthew", themes: ["Encouragement"] },
  { ref: "1 Peter 5:7", text: "Casting all your anxieties on him, because he cares for you.", book: "1 Peter", themes: ["Encouragement"] },
  { ref: "Philippians 4:6-7", text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.", book: "Philippians", themes: ["Encouragement", "Peace"] },
  // Core Doctrine (15)
  { ref: "Genesis 1:1", text: "In the beginning, God created the heavens and the earth.", book: "Genesis", themes: ["Core Doctrine"] },
  { ref: "Hebrews 11:1", text: "Now faith is the assurance of things hoped for, the conviction of things not seen.", book: "Hebrews", themes: ["Core Doctrine"] },
  { ref: "2 Timothy 3:16-17", text: "All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness, that the man of God may be complete, equipped for every good work.", book: "2 Timothy", themes: ["Core Doctrine"] },
  { ref: "Galatians 5:22-23", text: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control; against such things there is no law.", book: "Galatians", themes: ["Core Doctrine", "Love", "Peace"] },
  { ref: "Matthew 28:19-20", text: "Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, teaching them to observe all that I have commanded you. And behold, I am with you always, to the end of the age.", book: "Matthew", themes: ["Core Doctrine"] },
  { ref: "Matthew 22:37-39", text: "And he said to him, “You shall love the Lord your God with all your heart and with all your soul and with all your mind. This is the great and first commandment. And a second is like it: You shall love your neighbor as yourself.”", book: "Matthew", themes: ["Core Doctrine", "Love"] },
  { ref: "Romans 8:38-39", text: "For I am sure that neither death nor life, nor angels nor rulers, nor things present nor things to come, nor powers, nor height nor depth, nor anything else in all creation, will be able to separate us from the love of God in Christ Jesus our Lord.", book: "Romans", themes: ["Core Doctrine", "Love", "Encouragement"] },
  { ref: "1 Corinthians 10:31", text: "So, whether you eat or drink, or whatever you do, do all to the glory of God.", book: "1 Corinthians", themes: ["Core Doctrine"] },
  { ref: "John 1:1", text: "In the beginning was the Word, and the Word was with God, and the Word was God.", book: "John", themes: ["Core Doctrine"] },
  { ref: "Colossians 3:16", text: "Let the word of Christ dwell in you richly, teaching and admonishing one another in all wisdom, singing psalms and hymns and spiritual songs, with thankfulness in your hearts to God.", book: "Colossians", themes: ["Core Doctrine"] },
  { ref: "1 Corinthians 13:4-7", text: "Love is patient and kind; love does not envy or boast; it is not arrogant or rude. It does not insist on its own way; it is not irritable or resentful; it does not rejoice at wrongdoing, but rejoices with the truth. Love bears all things, believes all things, hopes all things, endures all things.", book: "1 Corinthians", themes: ["Love"] },
  { ref: "Isaiah 53:5", text: "But he was pierced for our transgressions; he was crushed for our iniquities; upon him was the chastisement that brought us peace, and with his wounds we are healed.", book: "Isaiah", themes: ["Gospel", "Core Doctrine", "Peace"] },
  { ref: "Matthew 6:33", text: "But seek first the kingdom of God and his righteousness, and all these things will be added to you.", book: "Matthew", themes: ["Core Doctrine"] },
  { ref: "Hebrews 12:1-2", text: "Therefore, since we are surrounded by so great a cloud of witnesses, let us also lay aside every weight, and sin which clings so closely, and let us run with endurance the race that is set before us, looking to Jesus, the founder and perfecter of our faith, who for the joy that was set before him endured the cross, despising the shame, and is seated at the right hand of the throne of God.", book: "Hebrews", themes: ["Core Doctrine", "Encouragement"] },
  { ref: "2 Corinthians 5:17", text: "Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come.", book: "2 Corinthians", themes: ["Core Doctrine"] },
];

type Verse = typeof BIBLE_VERSES[0];

const THEME_PACKS = [
    { id: "gospel", title: "📖 The Gospel", verses: BIBLE_VERSES.filter(v => v.themes.includes("Gospel")).map(v => v.ref), isPro: false },
    { id: "peace", title: "🕊️ Finding Peace", verses: BIBLE_VERSES.filter(v => v.themes.includes("Peace")).map(v => v.ref), isPro: false },
    { id: "love", title: "❤️ On Love", verses: BIBLE_VERSES.filter(v => v.themes.includes("Love")).map(v => v.ref), isPro: true },
    { id: "encouragement", title: "💪 Encouragement", verses: BIBLE_VERSES.filter(v => v.themes.includes("Encouragement")).map(v => v.ref), isPro: true },
    { id: "armor", title: "⚔️ Armor of God", verses: ["Ephesians 6:11", "Ephesians 6:13", "Ephesians 6:14", "Ephesians 6:16", "Ephesians 6:17"], isPro: true },
    { id: "psalms", title: "🎶 Psalms of Praise", verses: BIBLE_VERSES.filter(v => v.themes.includes("Psalms")).map(v => v.ref), isPro: true }
];

const REWARDS: Record<number, {id: string; title: string; description: string; content: RewardContent}> = {
    7: { id: "faithful", title: "Faithful Learner", description: "Unlock a 1-page devotional", content: {type: 'pdf', title: "The Power of Hidden Word", text: "Colossians 3:16 says, 'Let the word of Christ dwell in you richly...' This isn't just about reading, but about making God's Word a part of who you are. When you memorize Scripture, you're not just storing information; you're planting seeds of truth, hope, and strength in your heart. This 'hidden word' becomes an anchor in storms, a light in darkness, and a constant source of wisdom. It shapes your thoughts, guides your decisions, and comforts your soul. Your 7-day streak shows faithfulness. You are building a treasure that moths and rust cannot destroy. Keep hiding His Word in your heart, and you will find it living and active in every area of your life."} },
    14: { id: "disciplined", title: "Disciplined Disciple", description: "Unlock a guided audio prayer", content: {type: 'audio', title: "A Prayer for a Hearing Heart"} },
    30: { id: "master", title: "Memory Master", description: "Unlock a custom verse wallpaper", content: {type: 'wallpaper', title: "Your Custom Wallpaper"} }
};

// FIX: Added a specific type for reward content to improve type safety and fix inference issues.
interface RewardContent {
    type: 'pdf' | 'audio' | 'wallpaper';
    title: string;
    text?: string;
}

// --- CONTEXT & STATE MANAGEMENT ---
interface VerseProgress {
    mastered: boolean;
    favorite: boolean;
    level: number; // SRS level
    nextReviewDate: string | null; // ISO Date string yyyy-mm-dd
    lastReviewedDate: string | null; // ISO Date string yyyy-mm-dd
    masteredDate?: string; // ISO Date string yyyy-mm-dd
}

interface PracticeRecord {
    date: string; // ISO Date string yyyy-mm-dd
    verseRef: string;
    score: number;
}

interface AppState {
    progress: Record<string, VerseProgress>;
    streak: number;
    longestStreak: number;
    lastPracticeDate: string | null;
    settings: {
        translation: string;
        reminderTime: string;
        darkMode: boolean;
    };
    isPro: boolean;
    sessionsToday: number;
    lastSessionDate: string | null;
    practiceHistory: PracticeRecord[];
    isAuthenticated: boolean;
    user: { name: string } | null;
}

interface AppContextType {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    updateProgress: (verseRef: string, result: {isCorrect: boolean, score: number}) => void;
    updateStreak: () => void;
    checkSessionLimit: () => boolean;
    incrementSession: () => void;
    login: (email: string, pass: string) => boolean;
    signup: (name: string, email: string, pass: string) => boolean;
    logout: () => void;
    continueAsGuest: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const AppProvider = ({ children }: { children?: ReactNode }) => {
    const [state, setState] = useState<AppState>(() => {
        const savedState = localStorage.getItem('smc_state');
        const currentUser = localStorage.getItem('smc_currentUser');
        const defaultState: AppState = {
            progress: {},
            streak: 0,
            longestStreak: 0,
            lastPracticeDate: null,
            settings: { translation: "KJV", reminderTime: "07:00", darkMode: false },
            isPro: false,
            sessionsToday: 0,
            lastSessionDate: null,
            practiceHistory: [],
            isAuthenticated: !!currentUser,
            user: currentUser ? JSON.parse(currentUser) : null,
        };
        try {
            if (savedState) {
                const parsed = JSON.parse(savedState);
                parsed.settings = { ...defaultState.settings, ...parsed.settings };
                if (parsed.settings?.darkMode) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                }
                return { ...defaultState, ...parsed };
            }
            return defaultState;
        } catch {
            return defaultState;
        }
    });

    useEffect(() => {
        const stateToSave = { ...state };
        // Don't persist auth state in the main settings blob
        delete (stateToSave as Partial<AppState>).isAuthenticated;
        delete (stateToSave as Partial<AppState>).user;
        localStorage.setItem('smc_state', JSON.stringify(stateToSave));
        document.documentElement.setAttribute('data-theme', state.settings.darkMode ? 'dark' : 'light');
    }, [state]);

    const SRS_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60, 120, 240, 365];

    const updateProgress = (verseRef: string, result: {isCorrect: boolean, score: number}) => {
        setState(s => {
            const verseProgress = s.progress[verseRef] || { level: 0, mastered: false, favorite: false, nextReviewDate: null, lastReviewedDate: null };
            const { isCorrect, score } = result;
            
            let newLevel = verseProgress.level;
            if (isCorrect) {
                newLevel = Math.min(newLevel + 1, SRS_INTERVALS_DAYS.length - 1);
            } else {
                newLevel = Math.max(0, newLevel - 2); 
            }

            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            const nextReviewDate = new Date(today);
            const interval = SRS_INTERVALS_DAYS[newLevel];
            nextReviewDate.setDate(today.getDate() + interval);
            
            const isNowMastered = newLevel >= 5;
            const wasAlreadyMastered = verseProgress.mastered;

            const newHistory: PracticeRecord[] = [...(s.practiceHistory || []), { date: todayStr, verseRef, score }];

            return {
                ...s,
                practiceHistory: newHistory,
                progress: {
                    ...s.progress,
                    [verseRef]: {
                        ...verseProgress,
                        level: newLevel,
                        lastReviewedDate: todayStr,
                        nextReviewDate: nextReviewDate.toISOString().split('T')[0],
                        mastered: isNowMastered,
                        masteredDate: isNowMastered && !wasAlreadyMastered ? todayStr : verseProgress.masteredDate
                    }
                }
            };
        });
    };

    const updateStreak = () => {
        setState(s => {
            const today = new Date().toDateString();
            if (s.lastPracticeDate === today) return s; // Already practiced today

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            const newStreak = s.lastPracticeDate === yesterday.toDateString() ? s.streak + 1 : 1;
            
            return {
                ...s,
                streak: newStreak,
                longestStreak: Math.max(s.longestStreak, newStreak),
                lastPracticeDate: today
            };
        });
    };
    
    const checkSessionLimit = () => {
        const today = new Date().toDateString();
        if (state.lastSessionDate !== today) {
             return true;
        }
        if (!state.isPro && state.sessionsToday >= 3) {
            return false;
        }
        return true;
    };

    const incrementSession = () => {
        const today = new Date().toDateString();
        setState(s => ({
            ...s, 
            sessionsToday: s.lastSessionDate === today ? s.sessionsToday + 1 : 1,
            lastSessionDate: today
        }));
    }

    const login = (email: string, pass: string): boolean => {
        const users = JSON.parse(localStorage.getItem('smc_users') || '[]');
        const user = users.find((u: any) => u.email === email && u.pass === pass); // Simplified auth
        if (user) {
            const userData = { name: user.name };
            localStorage.setItem('smc_currentUser', JSON.stringify(userData));
            setState(s => ({ ...s, isAuthenticated: true, user: userData }));
            return true;
        }
        return false;
    };

    const signup = (name: string, email: string, pass: string): boolean => {
        const users = JSON.parse(localStorage.getItem('smc_users') || '[]');
        if (users.some((u: any) => u.email === email)) {
            alert("An account with this email already exists.");
            return false;
        }
        const newUser = { name, email, pass }; // In a real app, hash the pass
        users.push(newUser);
        localStorage.setItem('smc_users', JSON.stringify(users));
        
        const userData = { name: newUser.name };
        localStorage.setItem('smc_currentUser', JSON.stringify(userData));
        setState(s => ({ ...s, isAuthenticated: true, user: userData }));
        return true;
    };

    const logout = () => {
        localStorage.removeItem('smc_currentUser');
        setState(s => ({ ...s, isAuthenticated: false, user: null }));
    };
    
    const continueAsGuest = () => {
        const userData = { name: 'Guest' };
        localStorage.setItem('smc_currentUser', JSON.stringify(userData));
        setState(s => ({ ...s, isAuthenticated: true, user: userData }));
    };

    const value: AppContextType = { state, setState, updateProgress, updateStreak, checkSessionLimit, incrementSession, login, signup, logout, continueAsGuest };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useApp = () => useContext(AppContext) as AppContextType;


// --- AI SERVICE ---
class AIService {
    private ai: GoogleGenAI | null;

    constructor(apiKey: string | undefined) {
        if (!apiKey) {
            console.warn("API key is not set. AI features will be disabled.");
            this.ai = null;
        } else {
            this.ai = new GoogleGenAI({ apiKey });
        }
    }

    async parseJsonResponse(text: string) {
        try {
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (e) {
            console.error("Failed to parse Gemini JSON response:", e);
            console.error("Original text:", text);
            return null;
        }
    }

    async gradeAnswer(verseText: string, quizText: string, userInput: string, mode: 'fill-in-the-blank' | 'first-letter') {
        if (!this.ai) return { score: userInput ? 100 : 0, isCorrect: !!userInput, feedback: "Keep hiding God's Word in your heart!" };
        
        const prompt = mode === 'fill-in-the-blank' 
            ? `You are an AI Bible quiz grader. The full verse is: "${verseText}". The user was shown this text with blanks: "${quizText}". The user typed the following words to fill the blanks: "${userInput}". Grade the user's accuracy from 0 to 100. A perfect score is 100. Deduct points for incorrect words. Accept close spelling or reasonable synonyms. Also, provide a short, warm, biblical-tone encouragement message based on their performance. Respond ONLY with a valid JSON object in the format: { "score": number, "isCorrect": boolean, "feedback": "Your encouraging message here." }`
            : `You are an AI Bible quiz grader. The full verse is: "${verseText}". The user was shown only the first letter of each word and typed the following: "${userInput}". Grade the user's accuracy from 0 to 100 based on how closely their input matches the full verse. A perfect score is 100. Minor typos or punctuation errors should only have small deductions. Also, provide a short, warm, biblical-tone encouragement message based on their performance. Respond ONLY with a valid JSON object in the format: { "score": number, "isCorrect": boolean, "feedback": "Your encouraging message here." }`;

        try {
            // FIX: Added responseMimeType and responseSchema to ensure a valid JSON response.
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.NUMBER },
                            isCorrect: { type: Type.BOOLEAN },
                            feedback: { type: Type.STRING },
                        },
                        required: ["score", "isCorrect", "feedback"],
                    },
                }
            });
            const resultText = response.text;
            const parsed = await this.parseJsonResponse(resultText);
            if(parsed) return parsed;
            throw new Error("Parsed response is null");
        } catch (error) {
            console.error("Error grading answer:", error);
            return { score: 0, isCorrect: false, feedback: "Sorry, I had trouble checking your answer. Let's try again." };
        }
    }

    async generateMnemonic(verseText: string) {
        if (!this.ai) return { mnemonic: "Remember to focus on the key ideas of the verse." };
        
        const prompt = `You are an AI memory aid. Create 3 distinct mnemonic options for the Bible verse: "${verseText}". Options can include acronyms, visual stories, or keyword associations. Keep each under 15 words. For example, for "John 3:16", you could generate options like "GSL: God's Son is Life" or "Picture a loving God giving the world a gift." Respond ONLY with a valid JSON object in the format: { "mnemonics": ["Option 1", "Option 2", "Option 3"] }`;

        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            mnemonics: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                        },
                        required: ["mnemonics"],
                    },
                }
            });
            const resultText = response.text;
            const parsed = await this.parseJsonResponse(resultText);
            if (parsed && parsed.mnemonics && parsed.mnemonics.length > 0) return parsed;
            throw new Error("Parsed response is invalid or empty");
        } catch (error) {
            console.error("Error generating mnemonics:", error);
            return { mnemonics: ["Focus on the key ideas of the verse."] };
        }
    }
    
    async explainVerse(verseRef: string, verseText: string) {
        if (!this.ai) return { explanation: "AI features are disabled. Please check your API key." };
        
        const prompt = `You are a helpful Bible assistant. Explain the verse "${verseRef}: ${verseText}" in simple, clear terms, suitable for someone new to the Bible. Focus on the core message and its application. Keep it under 100 words. Respond ONLY with a valid JSON object in the format: { "explanation": "Your explanation here." }`;

        try {
            // FIX: Added responseMimeType and responseSchema to ensure a valid JSON response.
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            explanation: { type: Type.STRING },
                        },
                        required: ["explanation"],
                    },
                }
            });
            const resultText = response.text;
            const parsed = await this.parseJsonResponse(resultText);
            if(parsed) return parsed;
            throw new Error("Parsed response is null");
        } catch (error) {
            console.error("Error generating explanation:", error);
            return { explanation: "Sorry, I had trouble generating an explanation. Please try again." };
        }
    }
}
const aiService = new AIService(API_KEY);

// --- HELPER COMPONENTS ---
const StreakBadge = () => {
    const { state } = useApp();
    return (
        <div className="streak-badge">
            <span>🔥</span>
            <span>{state.streak}</span>
        </div>
    );
};

const ProgressBar = ({ value, max, label }: { value: number; max: number; label: string }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div style={styles.progressBarContainer}>
            <div style={styles.progressBarLabel}>
                <span>{label}</span>
                <span>{value} / {max}</span>
            </div>
            <div style={styles.progressBarTrack}>
                <div style={{ ...styles.progressBarFill, width: `${percentage}%` }} />
            </div>
        </div>
    );
};

const Modal = ({ show, onClose, title, children }: { show: boolean, onClose: () => void, title: string, children?: ReactNode }) => {
    if (!show) return null;
    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h3 style={styles.modalTitle}>{title}</h3>
                    <button style={styles.modalCloseButton} onClick={onClose}>&times;</button>
                </div>
                <div style={styles.modalBody}>
                    {children}
                </div>
            </div>
        </div>
    );
};

const Icon = ({ name }: { name: string }) => {
    const icons: Record<string, ReactNode> = {
        home: <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>,
        practice: <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/>,
        progress: <path d="M4 11h16v2H4zm0-4h16v2H4zm0 8h16v2H4z"/>,
        stats: <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>,
        settings: <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59-1.69.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>,
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
            {icons[name] || <circle cx="12" cy="12" r="10"/>}
        </svg>
    );
};


// --- AUTH SCREENS ---
const AuthScreen = () => {
    const [mode, setMode] = useState<'welcome' | 'login' | 'signup'>('welcome');
    
    switch(mode) {
        case 'login':
            return <LoginScreen onSwitchMode={() => setMode('signup')} />;
        case 'signup':
            return <SignUpScreen onSwitchMode={() => setMode('login')} />;
        default:
            return <WelcomeScreen onSetMode={setMode} />;
    }
};

const WelcomeScreen = ({ onSetMode }: { onSetMode: (mode: 'login' | 'signup') => void }) => {
    const { continueAsGuest } = useApp();
    return (
        <div className="screen" style={styles.authContainer}>
            <div style={styles.authContent}>
                <h1 style={styles.welcomeTitle}>Dwell</h1>
                <p style={styles.welcomeSubtitle}>Hide His Word in Your Heart.</p>
                <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '40px'}}>
                    <button className="button button-primary" onClick={() => onSetMode('signup')}>Create Account</button>
                    <button className="button button-secondary" onClick={() => onSetMode('login')}>Sign In</button>
                    <button style={styles.guestButton} onClick={continueAsGuest}>Continue as Guest</button>
                </div>
            </div>
        </div>
    );
};

const LoginScreen = ({ onSwitchMode }: { onSwitchMode: () => void }) => {
    const { login } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!login(email, password)) {
            alert('Invalid email or password.');
        }
    };
    
    return (
        <div className="screen fade-in" style={styles.authContainer}>
            <div style={styles.authContent}>
                <h2 style={styles.authTitle}>Sign In</h2>
                <form onSubmit={handleLogin} style={styles.authForm}>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={styles.authInput} required />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={styles.authInput} required />
                    <button type="submit" className="button button-primary">Sign In</button>
                </form>
                <p style={styles.authSwitchText}>
                    Don't have an account? <span onClick={onSwitchMode} style={styles.authSwitchLink}>Sign Up</span>
                </p>
            </div>
        </div>
    );
};

const SignUpScreen = ({ onSwitchMode }: { onSwitchMode: () => void }) => {
    const { signup } = useApp();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        signup(name, email, password);
    };
    
    return (
        <div className="screen fade-in" style={styles.authContainer}>
            <div style={styles.authContent}>
                <h2 style={styles.authTitle}>Create Account</h2>
                <form onSubmit={handleSignup} style={styles.authForm}>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={styles.authInput} required />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={styles.authInput} required />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={styles.authInput} required />
                    <button type="submit" className="button button-primary">Create Account</button>
                </form>
                 <p style={styles.authSwitchText}>
                    Already have an account? <span onClick={onSwitchMode} style={styles.authSwitchLink}>Sign In</span>
                </p>
            </div>
        </div>
    );
};


// --- SCREENS ---
const HomeScreen = ({ onNavigate }: { onNavigate: (screen: string, params?: any) => void }) => {
    const { state, checkSessionLimit, incrementSession } = useApp();

    const handleStartPractice = () => {
        if (checkSessionLimit()) {
            incrementSession();
            onNavigate('practice');
        } else {
            alert("You've reached your session limit for today. Upgrade to Pro for unlimited practice!");
        }
    };
    
    const handleStartTheme = (packId: string, isPro: boolean) => {
        if (isPro && !state.isPro) {
            alert("This is a Pro feature. Upgrade to unlock all theme packs!");
            return;
        }
        if (checkSessionLimit()) {
            incrementSession();
            onNavigate('practice', { packId });
        } else {
            alert("You've reached your session limit for today. Upgrade to Pro for unlimited practice!");
        }
    };
    
    return (
        <div className="screen fade-in">
            <div className="screen-header">
                <h1 className="screen-title">Welcome, {state.user?.name || 'Friend'}!</h1>
                <StreakBadge />
            </div>

            <div style={{ marginBottom: '24px' }}>
                <button className="button button-primary" onClick={handleStartPractice}>
                    Start Daily Practice
                </button>
            </div>
            
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Theme Packs</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {THEME_PACKS.map(pack => (
                    <div key={pack.id} style={styles.themePackCard} onClick={() => handleStartTheme(pack.id, pack.isPro)}>
                        <span style={{ fontSize: '24px', marginRight: '16px' }}>{pack.title.split(' ')[0]}</span>
                        <div style={{ flexGrow: 1 }}>
                            <div style={styles.themePackTitle}>{pack.title.substring(pack.title.indexOf(' ') + 1)}</div>
                            <div style={styles.themePackVerseCount}>{pack.verses.length} verses</div>
                        </div>
                        {pack.isPro && !state.isPro && <span style={styles.proBadge}>PRO</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};


const PracticeScreen = ({ onNavigate, packId }: { onNavigate: (screen: string) => void; packId?: string }) => {
    const { state, updateProgress, updateStreak } = useApp();
    const [verse, setVerse] = useState<Verse | null>(null);
    const [quizText, setQuizText] = useState<ReactNode | null>(null);
    const [userInput, setUserInput] = useState("");
    const [result, setResult] = useState<{ score: number, feedback: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMnemonics, setShowMnemonics] = useState(false);
    const [mnemonics, setMnemonics] = useState<string[]>([]);
    const [practiceMode, setPracticeMode] = useState<'fill-in-the-blank' | 'first-letter'>('fill-in-the-blank');
    const [explanation, setExplanation] = useState("");
    const [showExplanation, setShowExplanation] = useState(false);
    const [allDone, setAllDone] = useState(false);

    const setupQuiz = useCallback((v: Verse, mode: 'fill-in-the-blank' | 'first-letter') => {
        if (!v) return;
        if (mode === 'fill-in-the-blank') {
            const words = v.text.split(" ");
            const blankIndices = new Set();
            const numBlanks = Math.max(1, Math.floor(words.length * 0.25)); // ~25% blanks
            while (blankIndices.size < numBlanks) {
                blankIndices.add(Math.floor(Math.random() * words.length));
            }
            const quizWords = words.map((word, index) =>
                blankIndices.has(index) ? <span key={index} style={styles.blank}>{word.replace(/[a-zA-Z]/g, '_')}</span> : ` ${word} `
            );
            setQuizText(<div>{quizWords}</div>);
        } else { // first-letter mode
            const firstLetters = v.text.split(" ").map(word => word.charAt(0)).join(" ");
            setQuizText(<div style={{fontFamily: 'monospace'}}>{firstLetters}</div>)
        }
    }, []);
    
    const selectAndSetupVerse = useCallback(() => {
        let versesToPractice = BIBLE_VERSES;
        if (packId) {
            const packVerses = THEME_PACKS.find(p => p.id === packId)?.verses || [];
            versesToPractice = BIBLE_VERSES.filter(v => packVerses.includes(v.ref));
        }
        const today = new Date().toISOString().split('T')[0];
        
        const dueVerses = versesToPractice.filter(v => {
            const p = state.progress[v.ref];
            return p && p.nextReviewDate && p.nextReviewDate <= today;
        }).sort((a, b) => (state.progress[a.ref]?.level || 0) - (state.progress[b.ref]?.level || 0));

        const newVerses = versesToPractice.filter(v => !state.progress[v.ref]);

        const nextVerse = dueVerses.length > 0 ? dueVerses[0] : (newVerses.length > 0 ? newVerses[0] : null);

        if (nextVerse) {
            setVerse(nextVerse);
            setupQuiz(nextVerse, practiceMode);
            setUserInput("");
            setResult(null);
            setShowMnemonics(false);
            setMnemonics([]);
            setShowExplanation(false);
            setExplanation("");
            setAllDone(false);
        } else {
            setAllDone(true);
            setVerse(null);
        }
    }, [packId, state.progress, setupQuiz, practiceMode]);

    useEffect(() => {
        selectAndSetupVerse();
    }, [selectAndSetupVerse]);

    const handleNext = () => {
        selectAndSetupVerse();
    };

    const handleSubmit = async () => {
        if (!verse) return;
        setIsSubmitting(true);
        const res = await aiService.gradeAnswer(verse.text, quizText?.toString() || "", userInput, practiceMode);
        setResult(res);
        updateProgress(verse.ref, res);
        updateStreak();
        setIsSubmitting(false);
    };

    const toggleMnemonic = async () => {
        if (showMnemonics) {
            setShowMnemonics(false);
            return;
        }
        if (!verse) return;
        setIsLoading(true);
        const res = await aiService.generateMnemonic(verse.text);
        setMnemonics(res.mnemonics);
        setShowMnemonics(true);
        setIsLoading(false);
    };

    const toggleExplanation = async () => {
        if(showExplanation) {
            setShowExplanation(false);
            return;
        }
        if (!verse) return;
        setIsLoading(true);
        const res = await aiService.explainVerse(verse.ref, verse.text);
        setExplanation(res.explanation);
        setShowExplanation(true);
        setIsLoading(false);
    }
    
    if (allDone) {
        return (
            <div className="screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700' }}>All Done for Today!</h2>
                <p style={{ color: 'var(--text-muted)' }}>You've reviewed all your due verses. Great job! Come back tomorrow to continue building your habit.</p>
                <button className="button button-primary" style={{marginTop: '20px'}} onClick={() => onNavigate('home')}>Go to Home</button>
            </div>
        );
    }
    
    if (!verse) return <div>Loading...</div>;

    return (
        <div className="screen" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <button onClick={() => onNavigate('home')} style={styles.backButton}>&larr; Home</button>
                <div style={styles.practiceModeToggle}>
                    <button onClick={() => setPracticeMode('fill-in-the-blank')} className={practiceMode === 'fill-in-the-blank' ? 'active' : ''}>Fill-in-the-Blank</button>
                    <button onClick={() => setPracticeMode('first-letter')} className={practiceMode === 'first-letter' ? 'active' : ''}>First Letter</button>
                </div>
            </div>

            <div style={{ flexGrow: 1 }}>
                <h2 style={styles.verseRef}>{verse.ref}</h2>
                <div style={styles.quizTextContainer}>{quizText}</div>

                {practiceMode === 'fill-in-the-blank' ? (
                    <input
                        style={styles.textInput}
                        type="text"
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        placeholder="Type the missing words..."
                        disabled={!!result}
                    />
                ) : (
                    <textarea
                        style={{...styles.textInput, height: '100px'}}
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        placeholder="Type the full verse..."
                        disabled={!!result}
                    />
                )}
            </div>

            <div style={{ marginTop: 'auto' }}>
                {result && (
                    <div style={{...styles.resultCard, backgroundColor: result.score > 80 ? 'var(--correct)' : 'var(--incorrect)'}}>
                        <div style={styles.resultHeader}>
                            <h3 style={styles.resultTitle}>{result.score > 80 ? "Well done!" : "Keep practicing!"}</h3>
                            <span style={styles.resultScore}>{result.score}/100</span>
                        </div>
                        <p style={styles.resultFeedback}>{result.feedback}</p>
                    </div>
                )}
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                     <button className="button button-secondary" style={{ flex: 1 }} onClick={toggleMnemonic} disabled={isLoading}>
                        {isLoading && !showMnemonics ? '...' : (showMnemonics ? 'Hide Tip' : 'AI Tip')}
                     </button>
                     <button className="button button-secondary" style={{ flex: 1 }} onClick={toggleExplanation} disabled={isLoading}>
                        {isLoading && !showExplanation ? '...' : (showExplanation ? 'Hide Explanation' : 'Explain')}
                     </button>
                </div>

                {showMnemonics && (
                    <div style={styles.aiMnemonicContainer}>
                        {mnemonics.map((m, i) => (
                           <div key={i} style={styles.aiTipBubble}>💡 {m}</div>
                        ))}
                    </div>
                )}
                {showExplanation && <div style={styles.aiTipBubble}>📖 {explanation}</div>}

                {result ? (
                    <button className="button button-primary" onClick={handleNext}>Next Verse &rarr;</button>
                ) : (
                    <button className="button button-primary" onClick={handleSubmit} disabled={isSubmitting || !userInput}>
                        {isSubmitting ? "Checking..." : "Check Answer"}
                    </button>
                )}
            </div>
        </div>
    );
};

const ProgressScreen = () => {
    const { state } = useApp();
    const masteredCount = Object.values(state.progress).filter(p => p.mastered).length;
    
    return (
        <div className="screen fade-in">
            <div className="screen-header">
                <h1 className="screen-title">My Progress</h1>
            </div>
            <div style={styles.progressSummaryCard}>
                <ProgressBar value={masteredCount} max={BIBLE_VERSES.length} label="Mastered Verses" />
                <div style={styles.streakInfoContainer}>
                    <div>
                        <div style={styles.streakStat}>{state.streak}</div>
                        <div style={styles.streakLabel}>Current Streak</div>
                    </div>
                     <div>
                        <div style={styles.streakStat}>{state.longestStreak}</div>
                        <div style={styles.streakLabel}>Longest Streak</div>
                    </div>
                </div>
            </div>
            
            <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '24px 0 16px' }}>All Verses</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {BIBLE_VERSES.map(verse => {
                    const p = state.progress[verse.ref];
                    return (
                        <div key={verse.ref} style={styles.verseProgressCard}>
                            <div>
                                <div style={styles.verseProgressRef}>{verse.ref}</div>
                                <div style={styles.verseProgressText}>{verse.text.substring(0, 50)}...</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                {p?.mastered ? <span style={styles.masteredBadge}>MASTERED</span> : 
                                 p ? <span style={styles.srsLevelBadge}>LEVEL {p.level}</span> :
                                 <span style={styles.accuracyBadge} >NEW</span>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

const StatisticsScreen = () => {
    const { state } = useApp();
    
    // Calculate stats
    const masteredCount = Object.values(state.progress).filter(p => p.mastered).length;
    const overallAccuracy = state.practiceHistory.length > 0
        ? Math.round(state.practiceHistory.reduce((acc, cur) => acc + cur.score, 0) / state.practiceHistory.length)
        : 0;

    // Weekly Mastery Data
    const getWeeklyMasteryData = () => {
        const weeklyData: Record<string, number> = {};
        Object.values(state.progress).forEach(p => {
            if (p.mastered && p.masteredDate) {
                const date = new Date(p.masteredDate);
                const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
                const weekKey = weekStart.toISOString().split('T')[0];
                weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
            }
        });
        return Object.entries(weeklyData)
            .sort(([keyA], [keyB]) => new Date(keyA).getTime() - new Date(keyB).getTime())
            .slice(-5) // Last 5 weeks
            .map(([date, count]) => ({
                label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: count
            }));
    };
    
    const weeklyMasteryData = getWeeklyMasteryData();

    // Accuracy Trend Data
    const accuracyTrendData = state.practiceHistory.slice(-15).map(p => p.score);

    const handleShare = () => {
        const shareText = `I've mastered ${masteredCount} verses with an overall accuracy of ${overallAccuracy}% and a ${state.longestStreak}-day streak on Dwell! 🙏`;
        if (navigator.share) {
            navigator.share({
                title: 'My Scripture Memory Progress',
                text: shareText,
            }).catch(console.error);
        } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(shareText);
            alert('Progress copied to clipboard!');
        }
    };
    
    // Chart components
    const BarChart = ({ data, title }: { data: {label: string, value: number}[], title: string }) => {
        const maxValue = Math.max(...data.map(d => d.value), 1);
        return (
            <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>{title}</h3>
                <div style={styles.barChart}>
                    {data.map((d, i) => (
                        <div key={i} style={styles.barWrapper}>
                            <div style={styles.barValue}>{d.value}</div>
                            <div style={{...styles.bar, height: `${(d.value / maxValue) * 100}%`}}></div>
                            <div style={styles.barLabel}>{d.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const LineChart = ({ data, title }: { data: number[], title: string }) => {
        const maxValue = 100;
        const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d / maxValue) * 100}`).join(' ');

        return (
            <div style={styles.chartContainer}>
                 <h3 style={styles.chartTitle}>{title}</h3>
                 {data.length > 1 ? (
                    <svg viewBox="0 0 100 100" style={styles.lineChart}>
                        <polyline fill="none" stroke="var(--primary-green)" strokeWidth="2" points={points}/>
                    </svg>
                 ) : <p style={{textAlign: 'center', color: 'var(--text-muted)'}}>Practice more to see your trend!</p>}
            </div>
        );
    }
    
    return (
        <div className="screen fade-in">
            <div className="screen-header">
                <h1 className="screen-title">Statistics</h1>
            </div>
            
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{masteredCount}</div>
                    <div style={styles.statLabel}>Verses Mastered</div>
                </div>
                 <div style={styles.statCard}>
                    <div style={styles.statValue}>{overallAccuracy}%</div>
                    <div style={styles.statLabel}>Overall Accuracy</div>
                </div>
                 <div style={styles.statCard}>
                    <div style={styles.statValue}>{state.longestStreak}</div>
                    <div style={styles.statLabel}>Longest Streak</div>
                </div>
            </div>

            <BarChart data={weeklyMasteryData} title="Weekly Mastery" />
            <LineChart data={accuracyTrendData} title="Accuracy Trend (Last 15 sessions)" />

            <div style={{marginTop: '24px'}}>
                <button className="button button-secondary" onClick={handleShare}>Share My Progress</button>
            </div>
        </div>
    );
};


const SettingsScreen = () => {
    const { state, setState, logout } = useApp();
    
    const handleSettingChange = (key: string, value: any) => {
        setState(s => ({
            ...s,
            settings: { ...s.settings, [key]: value }
        }));
    };
    
    return (
        <div className="screen fade-in">
            <div className="screen-header">
                <h1 className="screen-title">Settings</h1>
            </div>

            <div style={styles.settingsGroup}>
                <div style={styles.settingItem}>
                    <label htmlFor="translation" style={styles.settingLabel}>Bible Translation</label>
                    <select id="translation" style={styles.selectInput} value={state.settings.translation} onChange={e => handleSettingChange('translation', e.target.value)}>
                        <option>KJV</option>
                        <option>NIV</option>
                        <option>ESV</option>
                    </select>
                </div>
                <div style={styles.settingItem}>
                    <label htmlFor="reminder" style={styles.settingLabel}>Daily Reminder</label>
                    <input id="reminder" type="time" style={styles.timeInput} value={state.settings.reminderTime} onChange={e => handleSettingChange('reminderTime', e.target.value)} />
                </div>
                 <div style={styles.settingItem}>
                    <label style={styles.settingLabel}>Dark Mode</label>
                    <label className="switch">
                        <input type="checkbox" checked={state.settings.darkMode} onChange={e => handleSettingChange('darkMode', e.target.checked)} />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            <div style={styles.proCard}>
                <h3 style={styles.proTitle}>Upgrade to Pro</h3>
                <p style={styles.proText}>Unlock all theme packs, unlimited practice sessions, and more features!</p>
                <button className="button button-primary" style={{ backgroundColor: 'var(--accent-blue)', borderBottomColor: '#1a95d4' }} onClick={() => setState(s => ({...s, isPro: !s.isPro}))}>
                   {state.isPro ? 'Pro Enabled' : 'Upgrade Now'}
                </button>
            </div>

            <div style={{ marginTop: '24px' }}>
                <button className="button button-secondary" onClick={logout}>Sign Out</button>
            </div>
        </div>
    );
};


const BottomNav = ({ currentScreen, onNavigate }: { currentScreen: string, onNavigate: (screen: string) => void }) => {
    const navItems = [
        { name: 'home', icon: 'home' },
        { name: 'practice', icon: 'practice' },
        { name: 'progress', icon: 'progress' },
        { name: 'stats', icon: 'stats' },
        { name: 'settings', icon: 'settings' }
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map(item => (
                <div 
                    key={item.name} 
                    className={`nav-item ${currentScreen === item.name ? 'active' : ''}`}
                    onClick={() => onNavigate(item.name)}
                >
                    <Icon name={item.icon} />
                    <span>{item.name}</span>
                </div>
            ))}
        </nav>
    );
};

const App = () => {
    const { state } = useApp();
    const [currentScreen, setCurrentScreen] = useState('home');
    const [screenParams, setScreenParams] = useState<any>({});
    const [modal, setModal] = useState<{show: boolean, title: string, content: ReactNode}>({show: false, title: "", content: null});

    const handleNavigate = (screen: string, params: any = {}) => {
        setCurrentScreen(screen);
        setScreenParams(params);
    };

    useEffect(() => {
        const checkReward = () => {
            const reward = REWARDS[state.streak];
            if (reward) {
                const rewardKey = `smc_reward_${reward.id}`;
                if (!localStorage.getItem(rewardKey)) {
                    setModal({
                        show: true, 
                        title: `🎉 Reward Unlocked! 🎉`,
                        // FIX: Cast reward.content to the new type to satisfy the Modal component.
                        content: <RewardModalContent content={reward.content as RewardContent} />
                    });
                    localStorage.setItem(rewardKey, 'true');
                }
            }
        };
        if(state.isAuthenticated) {
            checkReward();
        }
    }, [state.streak, state.isAuthenticated]);

    const RewardModalContent = ({ content }: { content: RewardContent }) => (
        <div style={styles.rewardModalContent}>
            <h4>{content.title}</h4>
            {content.text && <p style={{marginTop: '8px', color: 'var(--text-muted)'}}>{content.text}</p>}
        </div>
    );
    
    const renderScreen = () => {
        switch (currentScreen) {
            case 'practice':
                return <PracticeScreen onNavigate={handleNavigate} {...screenParams} />;
            case 'progress':
                return <ProgressScreen />;
            case 'stats':
                return <StatisticsScreen />;
            case 'settings':
                return <SettingsScreen />;
            default:
                return <HomeScreen onNavigate={handleNavigate} />;
        }
    };
    
    if (!state.isAuthenticated) {
        return (
            <div className="app-container">
                <AuthScreen />
            </div>
        );
    }

    return (
        <div className="app-container">
            <Modal show={modal.show} onClose={() => setModal({show: false, title: "", content: null})} title={modal.title}>
                {modal.content}
            </Modal>
            {renderScreen()}
            <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />
        </div>
    );
};

const styles: Record<string, CSSProperties> = {
    // Component-specific styles
    themePackCard: { display: 'flex', alignItems: 'center', backgroundColor: 'var(--card-bg)', padding: '16px', borderRadius: '12px', border: '2px solid var(--border-color)', cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' },
    themePackTitle: { fontWeight: 600, color: 'var(--text-dark)' },
    themePackVerseCount: { color: 'var(--text-muted)', fontSize: '14px' },
    proBadge: { position: 'absolute', top: '12px', right: '12px', backgroundColor: 'var(--accent-blue)', color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700 },
    backButton: { background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '16px', cursor: 'pointer', fontWeight: 600 },
    practiceModeToggle: { display: 'flex', backgroundColor: 'var(--background)', borderRadius: '8px', padding: '4px' },
    verseRef: { fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '16px', color: 'var(--text-dark)' },
    quizTextContainer: { fontSize: '18px', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '24px', padding: '16px', backgroundColor: 'var(--background)', borderRadius: '8px', minHeight: '100px' },
    blank: { color: 'var(--accent-blue)', fontWeight: 600, letterSpacing: '2px', margin: '0 4px', display: 'inline-block' },
    textInput: { width: '100%', padding: '16px', fontSize: '16px', borderRadius: '12px', border: '2px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-dark)', marginBottom: '24px' },
    resultCard: { padding: '16px', borderRadius: '12px', marginBottom: '16px', color: 'white' },
    resultHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    resultTitle: { fontSize: '18px', fontWeight: 700 },
    resultScore: { fontSize: '16px', fontWeight: 600 },
    resultFeedback: { fontSize: '14px', opacity: 0.9 },
    aiMnemonicContainer: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
    aiTipBubble: { backgroundColor: 'var(--chat-bubble-user-bg)', padding: '12px', borderRadius: '12px', fontSize: '14px', color: 'var(--text-dark)' },
    progressSummaryCard: { backgroundColor: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '2px solid var(--border-color)' },
    progressBarContainer: { marginBottom: '20px' },
    progressBarLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' },
    progressBarTrack: { height: '10px', backgroundColor: 'var(--border-color)', borderRadius: '5px', overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: 'var(--primary-green)', borderRadius: '5px' },
    streakInfoContainer: { display: 'flex', justifyContent: 'space-around', textAlign: 'center', paddingTop: '20px', borderTop: '1px solid var(--border-color)' },
    streakStat: { fontSize: '28px', fontWeight: 700, color: 'var(--accent-blue)' },
    streakLabel: { fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' },
    verseProgressCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--background)', borderRadius: '8px' },
    verseProgressRef: { fontWeight: 600, color: 'var(--text-dark)' },
    verseProgressText: { fontSize: '14px', color: 'var(--text-muted)' },
    masteredBadge: { backgroundColor: 'var(--primary-green)', color: 'white', padding: '4px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 700 },
    srsLevelBadge: { backgroundColor: 'var(--accent-blue)', color: 'white', padding: '4px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 700 },
    accuracyBadge: { backgroundColor: 'var(--border-color)', color: 'var(--text-muted)', padding: '4px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 700 },
    settingsGroup: { marginBottom: '24px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' },
    settingItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-color)' },
    settingLabel: { fontWeight: 600, color: 'var(--text-dark)' },
    selectInput: { padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--text-dark)' },
    timeInput: { padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--text-dark)' },
    proCard: { backgroundColor: 'var(--accent-blue)', color: 'white', padding: '24px', borderRadius: '16px', textAlign: 'center' },
    proTitle: { fontSize: '22px', fontWeight: 700, marginBottom: '8px' },
    proText: { marginBottom: '16px', opacity: 0.9 },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'var(--card-bg)', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    modalTitle: { fontWeight: 700, fontSize: '20px' },
    modalCloseButton: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-muted)' },
    modalBody: { },
    rewardModalContent: { backgroundColor: 'var(--reward-unlocked-bg)', padding: '16px', borderRadius: '12px', textAlign: 'center' },
    // Stats Screen Styles
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' },
    statCard: { backgroundColor: 'var(--background)', padding: '16px', borderRadius: '12px', textAlign: 'center' },
    statValue: { fontSize: '24px', fontWeight: 700, color: 'var(--accent-blue)' },
    statLabel: { fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 },
    chartContainer: { backgroundColor: 'var(--background)', padding: '16px', borderRadius: '12px', marginBottom: '16px' },
    chartTitle: { fontSize: '16px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '16px' },
    barChart: { display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '150px' },
    barWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
    bar: { width: '60%', backgroundColor: 'var(--accent-blue)', borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease-out' },
    barValue: { fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '4px' },
    barLabel: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', whiteSpace: 'nowrap' },
    lineChart: { width: '100%', height: '150px' },
    // Auth Styles
    authContainer: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', paddingBottom: '24px' },
    authContent: { width: '100%', maxWidth: '320px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    welcomeTitle: { fontSize: '48px', fontWeight: 700, color: 'var(--primary-green)' },
    welcomeSubtitle: { fontSize: '18px', color: 'var(--text-muted)', marginTop: '8px' },
    guestButton: { background: 'none', border: 'none', color: 'var(--text-muted)', marginTop: '16px', fontWeight: 600, cursor: 'pointer', fontSize: '16px' },
    authTitle: { fontSize: '28px', fontWeight: 700, marginBottom: '24px' },
    authForm: { width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' },
    authInput: { width: '100%', padding: '16px', fontSize: '16px', borderRadius: '12px', border: '2px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-dark)' },
    authSwitchText: { color: 'var(--text-muted)' },
    authSwitchLink: { color: 'var(--accent-blue)', fontWeight: 600, cursor: 'pointer' },
};

// Add active styles for practice mode toggle
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    .practice-mode-toggle button {
        padding: 8px 12px;
        border: none;
        background-color: transparent;
        color: var(--text-muted);
        font-weight: 600;
        cursor: pointer;
        border-radius: 6px;
    }
    .practice-mode-toggle button.active {
        background-color: var(--card-bg);
        color: var(--primary-green);
    }
`;
document.head.appendChild(styleSheet);


const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <AppProvider>
            <App />
        </AppProvider>
    </React.StrictMode>
);
