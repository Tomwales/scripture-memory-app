import React, { useState, useEffect, useCallback, createContext, useContext, useRef, ReactNode, CSSProperties } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

// --- DATA ---
const BIBLE_VERSES = [
  // Gospel (10)
  { ref: "John 3:16", text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.", book: "John", themes: ["Love", "Gospel"] },
  { ref: "Romans 3:23", text: "For all have sinned and fall short of the glory of God.", book: "Romans", themes: ["Gospel", "Core Doctrine"] },
  { ref: "Romans 6:23", text: "For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord.", book: "Romans", themes: ["Gospel", "Core Doctrine"] },
  { ref: "Ephesians 2:8-9", text: "For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast.", book: "Ephesians", themes: ["Gospel", "Core Doctrine"] },
  { ref: "John 14:6", text: "Jesus said to him, “I am the way, and the truth, and the life. No one comes to the Father except through me.”", book: "John", themes: ["Gospel"] },
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
    { id: "peace", title: "🕊️ Peace", verses: BIBLE_VERSES.filter(v => v.themes.includes("Peace")).map(v => v.ref), isPro: false },
    { id: "armor", title: "⚔️ Armor of God", verses: ["Ephesians 6:11", "Ephesians 6:13", "Ephesians 6:14", "Ephesians 6:16", "Ephesians 6:17"], isPro: true },
    { id: "love", title: "❤️ Love", verses: BIBLE_VERSES.filter(v => v.themes.includes("Love")).map(v => v.ref), isPro: true },
    { id: "gospel", title: "🔵 Beginner Gospel", verses: BIBLE_VERSES.filter(v => v.themes.includes("Gospel")).map(v => v.ref), isPro: true }
];

const REWARDS = {
    7: { id: "faithful", title: "Faithful Learner", description: "Unlock a 1-page devotional", content: {type: 'pdf', title: "The Power of Hidden Word", text: "Colossians 3:16 says, 'Let the word of Christ dwell in you richly...' This isn't just about reading, but about making God's Word a part of who you are. When you memorize Scripture, you're not just storing information; you're planting seeds of truth, hope, and strength in your heart. This 'hidden word' becomes an anchor in storms, a light in darkness, and a constant source of wisdom. It shapes your thoughts, guides your decisions, and comforts your soul. Your 7-day streak shows faithfulness. You are building a treasure that moths and rust cannot destroy. Keep hiding His Word in your heart, and you will find it living and active in every area of your life."} },
    14: { id: "disciplined", title: "Disciplined Disciple", description: "Unlock a guided audio prayer", content: {type: 'audio', title: "A Prayer for a Hearing Heart"} },
    30: { id: "master", title: "Memory Master", description: "Unlock a custom verse wallpaper", content: {type: 'wallpaper', title: "Your Custom Wallpaper"} }
};


// --- CONTEXT & STATE MANAGEMENT ---
// FIX: Add type definitions for app state and context to resolve multiple typing errors
// regarding 'unknown' types and missing properties.
interface VerseProgress {
    attempts: number;
    correct: number;
    mastered: boolean;
    favorite: boolean;
}

interface AppState {
    progress: Record<string, VerseProgress>;
    streak: number;
    longestStreak: number;
    lastPracticeDate: string | null;
    settings: { translation: string; reminderTime: string; };
    isPro: boolean;
    sessionsToday: number;
    lastSessionDate: string | null;
}

interface AppContextType {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    updateProgress: (verseRef: string, isCorrect: boolean) => void;
    updateStreak: () => void;
    checkSessionLimit: () => boolean;
    incrementSession: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const AppProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<AppState>(() => {
        const savedState = localStorage.getItem('smc_state');
        const defaultState: AppState = {
            progress: {}, // { "John 3:16": { attempts: 0, correct: 0, mastered: false, favorite: false } }
            streak: 0,
            longestStreak: 0,
            lastPracticeDate: null,
            settings: { translation: "KJV", reminderTime: "07:00" },
            isPro: false,
            sessionsToday: 0,
            lastSessionDate: null
        };
        try {
            if (savedState) {
                return { ...defaultState, ...JSON.parse(savedState) };
            }
            return defaultState;
        } catch {
            return defaultState;
        }
    });

    useEffect(() => {
        localStorage.setItem('smc_state', JSON.stringify(state));
    }, [state]);

    const updateProgress = (verseRef: string, isCorrect: boolean) => {
        setState(s => {
            const verseProgress = s.progress[verseRef] || { attempts: 0, correct: 0, mastered: false, favorite: false };
            const newAttempts = verseProgress.attempts + 1;
            const newCorrect = verseProgress.correct + (isCorrect ? 1 : 0);
            const accuracy = newCorrect / newAttempts;
            
            return {
                ...s,
                progress: {
                    ...s.progress,
                    [verseRef]: {
                        ...verseProgress,
                        attempts: newAttempts,
                        correct: newCorrect,
                        mastered: accuracy >= 0.9 && newAttempts >= 3,
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

    const value: AppContextType = { state, setState, updateProgress, updateStreak, checkSessionLimit, incrementSession };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useApp = () => useContext(AppContext) as AppContextType;


// --- AI SERVICE ---
class AIService {
    // FIX: Declare class property 'ai' to resolve 'does not exist on type' errors.
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

    async gradeAnswer(verseText: string, quizText: string, userInput: string) {
        if (!this.ai) return { score: userInput ? 100 : 0, isCorrect: !!userInput, feedback: "Keep hiding God's Word in your heart!" };
        
        const prompt = `You are an AI Bible quiz grader. The full verse is: "${verseText}". The user was shown this text with blanks: "${quizText}". The user typed the following words to fill the blanks: "${userInput}". Grade the user's accuracy from 0 to 100. A perfect score is 100. Deduct points for incorrect words. Accept close spelling or reasonable synonyms. Also, provide a short, warm, biblical-tone encouragement message based on their performance. Respond ONLY with a valid JSON object in the format: { "score": number, "isCorrect": boolean, "feedback": "Your encouraging message here." }`;
        
        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
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
        
        const prompt = `You are an AI memory aid. Create a simple, powerful mnemonic for the Bible verse: "${verseText}". It can be an acronym or a short visual hook. Keep it under 15 words. For example, for "John 3:16", you could generate "GSL = Gift, Sacrifice, Love". Respond ONLY with a valid JSON object in the format: { "mnemonic": "Your mnemonic here." }`;

        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const resultText = response.text;
            const parsed = await this.parseJsonResponse(resultText);
            if(parsed) return parsed;
            throw new Error("Parsed response is null");
        } catch (error) {
            console.error("Error generating mnemonic:", error);
            return { mnemonic: "Remember to focus on the key ideas of the verse." };
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

const BottomNav = ({ currentPage, setPage }: { currentPage: string, setPage: (page: string) => void }) => {
    const navItems = ["Home", "Themes", "Progress", "Settings"];
    const icons = {
        Home: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
        Themes: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
        Progress: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
        Settings: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
    };

    return (
        <nav className="bottom-nav">
            {navItems.map(item => (
                <div key={item} className={`nav-item ${currentPage.toLowerCase() === item.toLowerCase() ? 'active' : ''}`} onClick={() => setPage(item)}>
                    {icons[item as keyof typeof icons]}
                    <span>{item}</span>
                </div>
            ))}
        </nav>
    );
};

const Modal = ({ show, onClose, title, children }: { show: boolean, onClose: () => void, title: ReactNode, children: ReactNode }) => {
    if (!show) return null;
    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} className="fade-in" onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h3 style={{margin: 0}}>{title}</h3>
                    <button onClick={onClose} style={styles.modalCloseButton}>&times;</button>
                </div>
                <div style={styles.modalBody}>
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- SCREENS ---
const HomeScreen = ({ setPage, setVerse }: { setPage: (page: string) => void, setVerse: (verse: Verse) => void }) => {
    const { state, checkSessionLimit, incrementSession } = useApp();
    const masteredCount = Object.values(state.progress).filter(p => p.mastered).length;

    const handleStart = () => {
        if (!checkSessionLimit()) {
            alert("You've reached your daily limit of 3 free sessions. Upgrade to Pro for unlimited practice!");
            setPage('Settings');
            return;
        }
        incrementSession();
        // Verse of the Day logic: pick one that's not mastered, or a random one
        const unmastered = BIBLE_VERSES.filter(v => !state.progress[v.ref]?.mastered);
        const verseToPractice = unmastered.length > 0 ? unmastered[Math.floor(Math.random() * unmastered.length)] : BIBLE_VERSES[Math.floor(Math.random() * BIBLE_VERSES.length)];
        setVerse(verseToPractice);
        setPage('Practice');
    }

    return (
        <div className="screen fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
                <div className="screen-header">
                    <h1 className="screen-title" style={{ fontSize: '24px' }}>Scripture Memory Coach</h1>
                    <StreakBadge />
                </div>
                <p style={{ textAlign: 'center', marginBottom: '40px', fontSize: '16px', color: '#7f8c8d' }}>Memorize God’s Word in 5 minutes a day.</p>
            </div>
            
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
                <button onClick={handleStart} className="button button-primary" style={{ padding: '20px', fontSize: '22px', borderRadius: '16px' }}>
                    Start Practicing
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', padding: '20px 0' }}>
                <div>
                    <div style={{ fontSize: '24px', fontWeight: '700' }}>{masteredCount}</div>
                    <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Verses Mastered</div>
                </div>
                <div>
                    <div style={{ fontSize: '24px', fontWeight: '700' }}>{state.streak}</div>
                    <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Current Streak</div>
                </div>
            </div>
        </div>
    );
};

const PracticeScreen = ({ verse, setPage, setVerse }: { verse: Verse, setPage: (page: string) => void, setVerse: (verse: Verse) => void }) => {
    const { state, updateProgress, updateStreak, incrementSession, checkSessionLimit } = useApp();
    const [quiz, setQuiz] = useState<{ text: string, correctWords: string[] } | null>(null);
    const [userInput, setUserInput] = useState('');
    const [result, setResult] = useState<{ score: number; isCorrect: boolean; feedback: string; } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mnemonic, setMnemonic] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const generateQuiz = useCallback(() => {
        const words = verse.text.replace(/[.,;:“”?]/g, '').split(' ');
        const eligibleIndices = words.map((w, i) => w.length > 3 ? i : -1).filter(i => i !== -1);
        const indicesToBlank: number[] = [];
        const numBlanks = Math.min(Math.floor(words.length / 5) + 1, 4, eligibleIndices.length);

        while (indicesToBlank.length < numBlanks && eligibleIndices.length > 0) {
            const randIndex = Math.floor(Math.random() * eligibleIndices.length);
            const wordIndex = eligibleIndices.splice(randIndex, 1)[0];
            indicesToBlank.push(wordIndex);
        }
        
        const correctWords: string[] = [];
        indicesToBlank.sort((a,b) => a-b).forEach(i => correctWords.push(words[i]));
        
        let quizText = verse.text;
        correctWords.forEach(word => {
            quizText = quizText.replace(new RegExp(`\\b${word}\\b`), '______');
        });

        setQuiz({ text: quizText, correctWords });
    }, [verse]);

    useEffect(() => {
        generateQuiz();
        setResult(null);
        setUserInput('');
        setMnemonic(null);
    }, [verse, generateQuiz]);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [result]);

    const handlePlayAudio = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Cancel any previous speech
            const utterance = new SpeechSynthesisUtterance(`${verse.ref}. ${verse.text}`);
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Sorry, your browser doesn't support text-to-speech.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !quiz) return;

        setIsLoading(true);
        const aiResult = await aiService.gradeAnswer(verse.text, quiz.text, userInput);
        
        if (aiResult) {
            setResult(aiResult);
            updateProgress(verse.ref, aiResult.isCorrect);
            if(aiResult.isCorrect){
                updateStreak();
            } else {
                const mnem = await aiService.generateMnemonic(verse.text);
                if(mnem) setMnemonic(mnem.mnemonic);
            }
        }
        setIsLoading(false);
        setUserInput('');
    };
    
    const handleTryAgain = () => {
        generateQuiz();
        setResult(null);
        setUserInput('');
        setMnemonic(null);
    }

    const handleNextVerse = () => {
        if (!checkSessionLimit()) {
            alert("You've reached your daily limit of 3 free sessions. Upgrade to Pro for unlimited practice!");
            setPage('Home');
            return;
        }
        incrementSession();
        const unmastered = BIBLE_VERSES.filter(v => !state.progress[v.ref]?.mastered && v.ref !== verse.ref);
        const verseToPractice = unmastered.length > 0 ? unmastered[Math.floor(Math.random() * unmastered.length)] : BIBLE_VERSES[Math.floor(Math.random() * BIBLE_VERSES.length)];
        setVerse(verseToPractice);
    }
    
    if (!quiz) return <div>Loading...</div>;

    return (
        <div className="screen fade-in" style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            <div style={styles.practiceVerseCard}>
                <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>{verse.ref}</h2>
                <button onClick={handlePlayAudio} style={styles.audioButton}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    <span style={{marginLeft: '8px'}}>Play Audio</span>
                </button>
            </div>
            
            <div style={{flexGrow: 1, overflowY: 'auto', padding: '10px 0'}}>
                <div style={styles.chatBubbleUser}>
                    <p style={{fontSize: '18px', lineHeight: 1.6}}>{quiz.text.split(' ').map((word, i) => word.includes('______') ? <strong key={i} style={{color: 'var(--primary-blue)'}}>{word} </strong> : `${word} `)}</p>
                </div>
                
                {result && (
                    <div style={styles.chatBubbleAI(result.isCorrect)} className="fade-in">
                        <p><strong>{result.isCorrect ? "✅ Correct!" : "❌ Let's review:"}</strong> {result.feedback}</p>
                        {!result.isCorrect && <p style={{marginTop: '10px', opacity: 0.9, fontSize: '14px'}}>The correct words were: <strong>{quiz.correctWords.join(', ')}</strong></p>}
                        {mnemonic && <p style={{marginTop: '10px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '10px'}}><strong>Memory Hook:</strong> {mnemonic}</p>}
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            { !result ? (
                <form onSubmit={handleSubmit} style={styles.inputArea}>
                    <input 
                        type="text" 
                        value={userInput} 
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type the missing word(s)..."
                        style={styles.chatInput}
                        disabled={isLoading}
                        autoFocus
                    />
                    <button type="submit" className="button-primary" style={styles.sendButton} disabled={isLoading || !userInput.trim()}>
                        {isLoading ? '...' : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>}
                    </button>
                </form>
            ) : (
                result.isCorrect ? (
                    <div style={{padding: '10px 0', display: 'flex', gap: '10px'}} className="fade-in">
                        <button onClick={() => setPage('Home')} className="button button-secondary" style={{flex: 1}}>Done</button>
                        <button onClick={handleNextVerse} className="button button-primary" style={{flex: 1}}>Next Verse</button>
                    </div>
                ) : (
                    <div style={{padding: '10px 0', display: 'flex', gap: '10px'}} className="fade-in">
                        <button onClick={handleTryAgain} className="button button-secondary" style={{flex: 1}}>Try Again</button>
                        <button onClick={handleNextVerse} className="button button-primary" style={{flex: 1}}>Next Verse</button>
                    </div>
                )
            )}
        </div>
    );
};

const ThemesScreen = () => {
    const { state } = useApp();

    const handleStartTheme = (pack: typeof THEME_PACKS[0]) => {
        if (pack.isPro && !state.isPro) {
            // In a real app, this would show the upgrade modal
            alert("This is a Pro feature. Please upgrade on the Settings page.");
            return;
        }
        // In a real app, this would start a session with verses from this theme.
        alert(`Starting theme: ${pack.title}`);
    }

    return (
        <div className="screen fade-in">
            <div className="screen-header">
                <h1 className="screen-title">Themes</h1>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {THEME_PACKS.map(pack => {
                    const progressCount = pack.verses.filter(ref => state.progress[ref]?.mastered).length;
                    const isLocked = pack.isPro && !state.isPro;
                    return (
                        <div key={pack.id} style={styles.themeCard(isLocked)} onClick={() => handleStartTheme(pack)}>
                            <div style={{flex: 1}}>
                                <h3 style={{fontSize: '20px', marginBottom: '8px'}}>{pack.title}</h3>
                                <p style={{fontSize: '14px', color: '#7f8c8d'}}>{pack.verses.length} Verses</p>
                                {!isLocked && (
                                  <div style={styles.progressBarContainer}>
                                      <div style={styles.progressBar(progressCount / pack.verses.length)}></div>
                                  </div>
                                )}
                            </div>
                            <button style={styles.themeButton(isLocked)}>
                                {isLocked ? '⭐ Pro' : 'Start'}
                            </button>
                        </div>
                    );
                })}
                 <div style={styles.themeCard(true)}>
                    <div style={{flex: 1}}>
                        <h3 style={{fontSize: '20px', marginBottom: '8px'}}>⭐ Create Custom Pack</h3>
                        <p style={{fontSize: '14px', color: '#7f8c8d'}}>Add your own verses</p>
                    </div>
                     <button style={styles.themeButton(true)}>Unlock</button>
                </div>
            </div>
        </div>
    );
};

const ProgressScreen = () => {
    const { state } = useApp();
    const [modalContent, setModalContent] = useState<any | null>(null);
    const masteredCount = Object.values(state.progress).filter(p => p.mastered).length;
    const totalAttempts = Object.values(state.progress).reduce((sum, p) => sum + (p.attempts || 0), 0);
    const unlockedRewards = Object.keys(REWARDS).filter(day => state.streak >= parseInt(day));

    const handleRewardClick = (reward: typeof REWARDS[keyof typeof REWARDS]) => {
        setModalContent(reward.content);
    };

    return (
        <div className="screen fade-in">
            <div className="screen-header">
                <h1 className="screen-title">Progress</h1>
                <StreakBadge />
            </div>
            <div style={styles.statsGrid}>
                <div style={styles.statCard}><span style={styles.statValue}>{masteredCount}</span><span style={styles.statLabel}>Mastered</span></div>
                <div style={styles.statCard}><span style={styles.statValue}>{state.streak}</span><span style={styles.statLabel}>Current Streak</span></div>
                <div style={styles.statCard}><span style={styles.statValue}>{totalAttempts}</span><span style={styles.statLabel}>Total Attempts</span></div>
                <div style={styles.statCard}><span style={styles.statValue}>{state.longestStreak}</span><span style={styles.statLabel}>Longest Streak</span></div>
            </div>
            
            <h2 style={{fontSize: '22px', marginTop: '32px', marginBottom: '16px'}}>Rewards</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {Object.entries(REWARDS).map(([day, reward]) => {
                    const isUnlocked = unlockedRewards.includes(day);
                    return (
                        <div key={reward.id} style={styles.rewardCard(isUnlocked)} onClick={() => isUnlocked && handleRewardClick(reward)}>
                             <div style={styles.rewardIcon(isUnlocked)}>{isUnlocked ? '🏆' : '🔒'}</div>
                            <div style={styles.rewardContent}>
                                <h4 style={{ margin: 0 }}>{reward.title}</h4>
                                <p style={{ fontSize: '14px', color: '#7f8c8d', margin: 0 }}>
                                    {isUnlocked ? 'Unlocked! Click to view.' : `Reach a ${day}-day streak`}
                                </p>
                            </div>
                            {isUnlocked && <div style={styles.rewardLock}>›</div>}
                        </div>
                    );
                })}
            </div>
             <Modal show={!!modalContent} onClose={() => setModalContent(null)} title={modalContent?.title}>
                {modalContent?.type === 'pdf' && (
                    <div>
                        <p style={{whiteSpace: 'pre-wrap', lineHeight: 1.6}}>{modalContent.text}</p>
                    </div>
                )}
                {modalContent?.type === 'audio' && (
                    <div style={{textAlign: 'center'}}>
                        <p style={{marginBottom: '20px'}}>Listen to this guided prayer for encouragement.</p>
                        <button className="button button-primary">▶️ Play Prayer</button>
                    </div>
                )}
                {modalContent?.type === 'wallpaper' && (
                    <div style={{textAlign: 'center'}}>
                        <p style={{marginBottom: '20px'}}>Download a beautiful wallpaper for your phone.</p>
                        <div style={{width: '150px', height: '266px', backgroundColor: 'var(--primary-blue)', color: 'white', margin: '0 auto', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', textAlign: 'center'}}>
                            "I can do all things through Christ who strengthens me."<br/>- Phil 4:13
                        </div>
                        <button className="button button-primary" style={{marginTop: '20px'}}>Download</button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const SettingsScreen = ({ setPage }: { setPage: (page: string) => void }) => {
    const { state, setState } = useApp();
    const [showProModal, setShowProModal] = useState(false);

    const handleSettingChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setState(s => ({ ...s, settings: { ...s.settings, [name]: value } }));
    };
    
    const handleDeleteData = () => {
        if(confirm("Are you sure you want to delete all your progress data? This cannot be undone.")) {
            localStorage.removeItem('smc_state');
            window.location.reload();
        }
    }

    return (
        <div className="screen fade-in">
            <div className="screen-header">
                <h1 className="screen-title">Settings</h1>
            </div>

            <div style={styles.settingRow}>
                <label htmlFor="translation" style={styles.settingLabel}>Bible Translation</label>
                <select id="translation" name="translation" value={state.settings.translation} onChange={handleSettingChange} style={styles.select}>
                    <option value="KJV">KJV (King James Version)</option>
                    <option value="ESV" disabled>ESV (Pro)</option>
                    <option value="NIV" disabled>NIV (Pro)</option>
                </select>
            </div>
            
            <div style={styles.settingRow}>
                <label htmlFor="reminderTime" style={styles.settingLabel}>Daily Reminder</label>
                <input type="time" id="reminderTime" name="reminderTime" value={state.settings.reminderTime} onChange={handleSettingChange} style={styles.input} />
            </div>

            <div style={styles.upgradeCard} onClick={() => setShowProModal(true)}>
                <h3>⭐ Upgrade to Pro</h3>
                <p>Unlock all features and support our ministry.</p>
            </div>

            <div style={{marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <button onClick={handleDeleteData} className="button" style={{backgroundColor: '#e74c3c', color: 'white'}}>Delete All Data</button>
            </div>
            
            <Modal show={showProModal} onClose={() => setShowProModal(false)} title="Go Pro">
                <ul style={{listStyle: 'none', paddingLeft: 0, marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                    <li>✅ Unlimited verse sessions</li>
                    <li>✅ Unlock all theme packs</li>
                    <li>✅ Create custom packs</li>
                    <li>✅ ESV & NIV Translations</li>
                    <li>✅ Download audio recitations</li>
                    <li>✅ Ad-free experience</li>
                </ul>
                <button className="button button-primary" onClick={() => { setState(s => ({ ...s, isPro: true })); setShowProModal(false); }}>
                    Upgrade Now ($4.99/mo)
                </button>
                 <button className="button button-secondary" style={{marginTop: '10px'}} onClick={() => { setShowProModal(false); alert("Purchase restored!"); }}>
                    Restore Purchase
                </button>
            </Modal>
        </div>
    );
};


const App = () => {
    const [page, setPage] = useState('Home');
    const [currentVerse, setCurrentVerse] = useState(BIBLE_VERSES[0]);
    
    const handleSetVerse = (verse: Verse) => {
        setCurrentVerse(verse);
    }
    
    const renderPage = () => {
        switch(page) {
            case 'Home':
                return <HomeScreen setPage={setPage} setVerse={handleSetVerse} />;
            case 'Practice':
                return <PracticeScreen verse={currentVerse} setPage={setPage} setVerse={handleSetVerse} />;
            case 'Themes':
                return <ThemesScreen />;
            case 'Progress':
                return <ProgressScreen />;
            case 'Settings':
                return <SettingsScreen setPage={setPage}/>;
            default:
                return <HomeScreen setPage={setPage} setVerse={handleSetVerse} />;
        }
    };

    return (
        <div className="app-container">
            {renderPage()}
            <BottomNav currentPage={page} setPage={setPage} />
        </div>
    );
}

// --- STYLES ---
// FIX: Cast specific CSS properties to be compatible with React.CSSProperties, fixing type errors.
const styles: { [key: string]: CSSProperties | ((...args: any[]) => CSSProperties) } = {
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'var(--card-bg)', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    modalCloseButton: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#7f8c8d' },
    modalBody: {},
    practiceVerseCard: { padding: '20px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', marginBottom: '16px', textAlign: 'center', border: '1px solid var(--border-color)' },
    audioButton: { display: 'inline-flex', alignItems: 'center', background: 'none', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '8px 16px', cursor: 'pointer', color: 'var(--text-dark)' },
    chatBubbleUser: { alignSelf: 'flex-start', backgroundColor: 'var(--card-bg)', padding: '16px', borderRadius: '20px 20px 20px 5px', marginBottom: '12px', maxWidth: '90%', border: '1px solid var(--border-color)' },
    chatBubbleAI: (isCorrect) => ({
        alignSelf: 'flex-start',
        backgroundColor: isCorrect ? '#e8f8f5' : '#fdedec',
        color: isCorrect ? '#1d8348' : '#a93226',
        padding: '16px',
        borderRadius: '20px 20px 20px 5px',
        marginBottom: '12px',
        maxWidth: '90%',
        border: `1px solid ${isCorrect ? 'var(--correct)' : 'var(--incorrect)'}`
    }),
    inputArea: { display: 'flex', padding: '10px 0', backgroundColor: 'var(--warm-cream)' },
    chatInput: { flex: 1, border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: '20px', backgroundColor: 'var(--card-bg)', fontSize: '16px', outline: 'none' },
    sendButton: { border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '10px', flexShrink: 0 },
    themeCard: (isLocked) => ({
        display: 'flex',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        opacity: isLocked ? 0.6 : 1,
        cursor: 'pointer'
    }),
    progressBarContainer: { height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', marginTop: '12px', overflow: 'hidden' },
    progressBar: (percentage) => ({ width: `${percentage * 100}%`, height: '100%', backgroundColor: 'var(--gold-accent)', borderRadius: '4px', transition: 'width 0.5s' }),
    themeButton: (isLocked) => ({
        padding: '10px 20px',
        border: `2px solid ${isLocked ? 'var(--gold-accent)' : 'var(--primary-blue)'}`,
        color: isLocked ? 'var(--gold-accent)' : 'var(--primary-blue)',
        backgroundColor: 'transparent',
        borderRadius: '20px',
        fontWeight: 600,
        pointerEvents: 'none'
    }),
    statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    statCard: { backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' },
    statValue: { display: 'block', fontSize: '24px', fontWeight: 700 },
    statLabel: { fontSize: '14px', color: '#7f8c8d' },
    rewardCard: (isUnlocked) => ({
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: isUnlocked ? '#FEF9E7' : 'var(--card-bg)',
        borderRadius: '12px',
        border: `1px solid ${isUnlocked ? 'var(--gold-accent)' : 'var(--border-color)'}`,
        cursor: isUnlocked ? 'pointer' : 'default',
        opacity: isUnlocked ? 1 : 0.7,
    }),
    rewardIcon: (isUnlocked) => ({ fontSize: '24px', marginRight: '16px', color: isUnlocked ? 'var(--gold-accent)' : '#7f8c8d' }),
    rewardContent: { flex: 1 },
    rewardLock: { fontSize: '24px', color: '#7f8c8d' },
    settingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-color)' },
    settingLabel: { fontSize: '16px' },
    select: { fontSize: '16px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' },
    input: { fontSize: '16px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' },
    upgradeCard: { background: 'linear-gradient(45deg, var(--primary-blue), #5dadec)', color: 'white', padding: '20px', borderRadius: '12px', marginTop: '24px', cursor: 'pointer', textAlign: 'center' },
};


// --- RENDER APP ---
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <AppProvider>
            <App />
        </AppProvider>
    </React.StrictMode>
);
