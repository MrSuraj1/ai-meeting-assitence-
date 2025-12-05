// src/component/MeetingUI.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { FiMic, FiVideo, FiMonitor, FiVolume2 } from "react-icons/fi"; 
import { FaHandPaper, FaSignOutAlt, FaStopCircle, FaExpandAlt, FaCompressAlt, FaRegStopCircle, FaMagic } from "react-icons/fa"; 
import { IoIosMicOff } from "react-icons/io"; 

// --- Configuration ---
const LANGUAGE_OPTIONS = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'auto', name: 'Original (No Translation)' },
];

// --- Custom Hooks ---

// Local Storage Hook for persistence (जैसे, सबटाइटल क्लियर न करने पर बने रहें)
function useLocalStorage(key, initial) {
    const [state, setState] = useState(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : initial;
        } catch (e) {
            return initial;
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (e) {}
    }, [key, state]);
    return [state, setState];
}

// --- Main Component ---

export default function MeetingUI({ meetingId, token, isAdmin = false }) {
    
    // UI state
    const [joined, setJoined] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [name, setName] = useState(() => {
        return localStorage.getItem("meeting_username") || "";
    });
    
    const [focusedParticipantId, setFocusedParticipantId] = useState(null);

    // Subtitle state
    const [captions, setCaptions] = useLocalStorage("meeting_captions", []);
    const [captionsOn, setCaptionsOn] = useState(false);
    const recognitionRef = useRef(null);
    
    const [targetLanguage, setTargetLanguage] = useState(
        localStorage.getItem("meeting_target_lang") || 'en'
    );

    // visual states
    const [micOn, setMicOn] = useState(false);
    const [camOn, setCamOn] = useState(false);
    
    // RECORDING STATES
    const [isCloudRecording, setIsCloudRecording] = useState(false); 
    const [isLocalRecording, setIsLocalRecording] = useState(false); 
    const recorderRef = useRef(null);
    const chunksRef = useRef([]);

    // NEW STATE: Combined AI Magic Status (Controls Local Recording + Captions)
    const [isMagicOn, setIsMagicOn] = useState(false); 

    // raise-hand set
    const [raiseHandSet, setRaiseHandSet] = useState(new Set());


    // =====================================================================
    // STEP 1: DEFINE THE MEETING OBJECT (VideoSDK)
    // =====================================================================
    const meeting = useMeeting({
        onMeetingJoined: () => {
            console.log("✅ Meeting joined");
            setJoined(true);
        },
        onMeetingLeft: () => {
            console.log("❌ Meeting left");
            setJoined(false);
            stopAIMagic(); // Ensure local recording/captions are stopped on leave
        },
        onRecordingStarted: () => {
            console.log("🔴 Cloud Recording started");
            setIsCloudRecording(true);
        },
        onRecordingStopped: () => {
            console.log("🟢 Cloud Recording stopped. Video will be available shortly.");
            setIsCloudRecording(false);
            alert("Cloud Recording stopped. File will be processed by Videosdk shortly.");
        },
        onParticipantJoined: (p) => console.log("🟢 Participant joined", p),
        onParticipantLeft: (p) => console.log("🔴 Participant left", p),
        onSpeakerChanged: (id) => console.log("🔊 Active speaker:", id),
        // यह मुख्य हैंडलर है जो पार्टिसिपेंट के मैसेज को प्राप्त करता है
        onMessageReceived: (msg) => handleIncomingMessage(msg) 
    });
    
    // =====================================================================
    // STEP 2: DEFINE CALL-BACK FUNCTIONS 
    // =====================================================================

    // --- UTILITY FUNCTIONS ---
    async function translateToTargetLanguage(text, targetLang) {
        if (targetLang === 'auto') return text;
        try {
            const q = encodeURIComponent(text);
            // This is the UN-OFFICIAL Google Translate API endpoint.
            // Translation might fail if Google changes this endpoint.
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${q}`;
            const res = await fetch(url);
            const data = await res.json();
            return data?.[0]?.[0]?.[0] || text;
        } catch (e) {
            console.warn("translate error (using unofficial API)", e);
            return text;
        }
    }

    async function sendPayload(obj) {
        try {
            const s = JSON.stringify(obj);
            // यह VideoSDK की मैसेजिंग लेयर है
            await meeting.send(s); 
        } catch (e) {
            console.warn("meeting.send failed", e);
        }
    }

    // --- LOCAL SCREEN RECORDING LOGIC (Helper Functions) ---
    // (Local Recording logic is unchanged, used as part of AI Magic)
    const stopLocalRecording = useCallback(() => {
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
            const tracks = recorderRef.current.stream.getTracks();
            tracks.forEach(track => track.stop()); // Stop stream tracks too
            recorderRef.current.stop();
        }
    }, []);

    const startLocalRecording = useCallback(async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });
            
            recorderRef.current = new MediaRecorder(screenStream);
            chunksRef.current = [];
            
            recorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            recorderRef.current.onstop = () => {
                console.log("Local Recording stopped. Preparing download...");
                
                if (chunksRef.current.length > 0) {
                    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `meeting_recording_${new Date().toISOString()}.webm`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                } else {
                     console.warn("No data recorded to download.");
                }
                
                setIsLocalRecording(false);
            };

            recorderRef.current.start();
            setIsLocalRecording(true);
            
            screenStream.getVideoTracks()[0].onended = () => {
                console.log("Browser sharing ended, stopping local recorder.");
                stopLocalRecording();
            };

            return true; 
        } catch (screenError) {
            console.warn("Screen share/Local Recording failed (permission denied or error)", screenError);
            setIsLocalRecording(false);
            return false; 
        }
    }, [stopLocalRecording]);


    // --- CAPTIONS LOGIC (Helper Functions) ---
    const restartRecognition = useCallback(() => {
        if (!captionsOn || !recognitionRef.current) return;
        
        try {
            recognitionRef.current.stop();
        } catch (e) {}

        setTimeout(() => {
            if (captionsOn && recognitionRef.current) {
                 try {
                     recognitionRef.current.start();
                     console.log("SR stopped and successfully restarted.");
                 } catch(e) {
                     console.warn("Failed to restart SR after stop:", e);
                 }
            }
        }, 100); 

    }, [captionsOn]);
    
    async function startCaptions() {
        if (captionsOn) return true;
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            console.error("SpeechRecognition not supported. Use Chrome/Edge.");
            alert("SpeechRecognition not supported. Use Chrome/Edge.");
            return false;
        }

        const rec = new SR();
        rec.continuous = true;
        rec.interimResults = false;
        
        // "auto" पर सेट है ताकि यह आपकी भाषा (हिंदी/इंग्लिश) को पहचानने की कोशिश करे
        rec.lang = "auto"; 

        rec.onresult = async (ev) => {
            const last = ev.results[ev.results.length - 1];
            const text = last[0].transcript.trim();
            
            if (!text) return;
            
            console.log("💬 Transcript Received:", text);
            
            // ट्रांसलेशन लॉजिक
            const translated = await translateToTargetLanguage(text, targetLanguage);
            
            console.log(`🌍 Translation (to ${targetLanguage}):`, translated);

            const payload = {
                type: "subtitle",
                senderId: meeting?.localParticipant?.id,
                senderName: meeting?.localParticipant?.displayName || name || "You",
                original: text,
                text: translated,
                ts: new Date().toISOString()
            };

            // 1. Local push: आपको अपनी बात तुरंत दिखाने के लिए।
            setCaptions((prev) => [...prev, {
                senderName: payload.senderName, text: payload.text, original: payload.original, ts: payload.ts
            }]);

            // 2. Send to ALL other participants: पार्टिसिपेंट को आपकी बात भेजने के लिए।
            await sendPayload(payload); 
            
            console.log("🚀 Subtitle Payload Sent:", payload);
        };

        rec.onerror = (e) => {
            console.warn("SR error", e);
            if (e.error === 'network' || e.error === 'service-not-allowed' || e.error === 'audio-capture') {
                restartRecognition();
            } else if (e.error === 'not-allowed') {
                 console.error("🎤 Microphone Access Denied for Speech Recognition.");
                 alert("Microphone access needed for Captions. Please check your browser settings.");
                 stopCaptions(); 
                 return;
            }
        };
        
        rec.onend = () => {
            console.log("SR ended, checking for auto-restart.");
            restartRecognition();
        };

        try {
            rec.start();
            recognitionRef.current = rec;
            setCaptionsOn(true);
            console.log("✅ Speech Recognition started successfully.");
            return true;
        } catch (e) {
            console.warn("start SR failed", e);
            return false;
        }
    }

    function stopCaptions() {
        setCaptionsOn(false);
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) {}
            recognitionRef.current = null;
            console.log("🛑 Speech Recognition stopped.");
        }
    }
    // --- END CAPTIONS LOGIC ---

    // --- MAIN AI MAGIC FUNCTION ---
    async function toggleAIMagic() {
        if (isCloudRecording) return alert("Please stop cloud recording before starting AI Magic.");

        if (!isMagicOn) {
            // Ensure Mic is ON
            if (!meeting?.localParticipant?.micOn) {
                try { 
                    await meeting.toggleMic(); 
                    setMicOn(true); 
                } catch(e) { 
                    console.warn("Auto-toggle mic failed:", e);
                }
                if (!meeting?.localParticipant?.micOn) {
                    alert("Please turn on your Microphone first to enable Live Captions.");
                    return false; 
                }
            }
            
            const captionsStarted = await startCaptions(); // Captions start
            const recordingStarted = await startLocalRecording(); // Local Recording starts

            if (captionsStarted && recordingStarted) {
                setIsMagicOn(true);
                console.log("✨ AI Magic successfully started (Captions + Recording).");
            } else {
                if (captionsStarted) stopCaptions();
                if (recordingStarted) stopLocalRecording();
                setIsMagicOn(false);
                alert("Failed to start AI Magic. Check if you granted both Microphone and Screen Sharing permissions.");
            }

        } else {
            // Stop Logic
            stopCaptions();
            stopLocalRecording(); // This will trigger the download
            setIsMagicOn(false);
            console.log("🛑 AI Magic stopped.");
            alert("AI Magic stopped. Recording download should start automatically shortly.");
        }
    }

    // Combined cleanup function
    const stopAIMagic = useCallback(() => {
        if (isMagicOn) { 
            stopCaptions();
            stopLocalRecording();
            setIsMagicOn(false);
        }
    }, [isMagicOn, stopLocalRecording]);


    // =====================================================================
    // STEP 3: HANDLERS AND LIFECYCLE
    // =====================================================================

    /**
     * @function handleIncomingMessage
     * @description यह फंक्शन दूसरे पार्टिसिपेंट की बातचीत को कैप्चर करता है।
     */
    function handleIncomingMessage(msg) {
          try {
            let parsed = null;
            if (typeof msg === "string") parsed = JSON.parse(msg);
            else if (msg && typeof msg === "object") {
                if (msg.payload && typeof msg.payload === "string") parsed = JSON.parse(msg.payload);
                else parsed = msg;
            }
            if (!parsed) return;

            // --- Subtitle Handling ---
            if (parsed.type === "subtitle") {
                // *** FIX: यह चेक करें कि मैसेज खुद ने नहीं भेजा है। ***
                if (parsed.senderId !== meeting?.localParticipant?.id) { 
                     setCaptions((prev) => [...prev, {
                        senderName: parsed.senderName || parsed.senderId || "Unknown",
                        // IMPORTANT: पार्टिसिपेंट ने जो ट्रांसलेटेड टेक्स्ट भेजा, उसे दिखाओ
                        text: parsed.text || parsed.original || "", 
                        original: parsed.original || "",
                        ts: parsed.ts || new Date().toISOString()
                    }]);
                    console.log(`✅ Received Subtitle from ${parsed.senderName}: ${parsed.text}`);
                }
            } else if (parsed.type === "raise-hand") {
                setRaiseHandSet((prev) => {
                    const next = new Set(prev);
                    if (parsed.action === "raise") next.add(parsed.from);
                    else next.delete(parsed.from);
                    return next;
                });
            } else if (parsed.type === "end-meeting") {
                alert("Meeting ended by host");
                try { meeting.leave(); } catch (e) {}
            }
        } catch (e) {
            console.warn("Failed to process incoming message payload", e);
        }
    }

    // --- Other Handlers (Join, Leave, Mic/Cam Toggle, etc.) are standard ---
    const participants = [...(meeting?.participants?.values?.() || [])];

    function toggleFocus(participantId) {
        setFocusedParticipantId(prev => (prev === participantId ? null : participantId));
    }
    
    useEffect(() => {
        localStorage.setItem("meeting_target_lang", targetLanguage);
    }, [targetLanguage]);


    async function handleJoinClick() {
        if (!name || !name.trim()) {
            setShowNameModal(true);
            return;
        }
        localStorage.setItem("meeting_username", name);
        try {
            await meeting.join({ name }); 
            setMicOn(Boolean(meeting?.localParticipant?.micOn));
            setCamOn(Boolean(meeting?.localParticipant?.webcamOn));
        } catch (e) {
            console.warn("join failed", e);
        }
    }

    function handleLeave() {
        if (isCloudRecording) {
            alert("Cloud Recording is active. Please stop it manually before leaving.");
            return;
        }
        
        if (isMagicOn) {
            stopAIMagic();
            setTimeout(() => {
                try { meeting.leave(); setJoined(false); setFocusedParticipantId(null); } catch (e) { console.warn(e); }
            }, 1000);
        } else {
            try { meeting.leave(); setJoined(false); setFocusedParticipantId(null); } catch (e) { console.warn(e); }
        }
    }

    async function handleEnd() {
        if (!isAdmin) return alert("Only host can end the meeting");
        if (isCloudRecording) {
             alert("Stopping cloud recording before ending the meeting...");
             await meeting.stopRecording();
        }
        stopAIMagic(); 
        await sendPayload({ type: "end-meeting", senderName: meeting?.localParticipant?.displayName || name, ts: new Date().toISOString() });
        try { if (typeof meeting.end === 'function') await meeting.end(); else meeting.leave(); } catch (e) { console.warn(e); }
    }


    async function toggleMic() {
        try {
            await meeting.toggleMic();
            setMicOn((s) => !s);
        } catch (e) { console.warn(e); }
    }
    async function toggleCam() {
        try {
            await meeting.toggleWebcam();
            setCamOn((s) => !s);
        } catch (e) { console.warn(e); }
    }

    async function toggleRaiseHand() {
        const id = meeting?.localParticipant?.id || "local";
        const has = raiseHandSet.has(id);
        const payload = { type: "raise-hand", action: has ? "lower" : "raise", from: id, senderName: meeting?.localParticipant?.displayName || name, ts: new Date().toISOString() };
        await sendPayload(payload);
        setRaiseHandSet((prev) => {
            const next = new Set(prev);
            if (has) next.delete(id); else next.add(id);
            return next;
        });
    }

    useEffect(() => {
        return () => {
            stopAIMagic(); // Cleanup on component unmount
        };
    }, [stopAIMagic]); 

    // =====================================================================
    // STEP 4: RENDER
    // =====================================================================

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* TOP FIXED OP BAR */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 p-2">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                
                <div className="flex items-center gap-4">
                    <div className="font-bold text-lg text-indigo-400">AI Meeting 
                        assistence</div>
                    <div className="text-sm text-gray-300">ID: {meetingId}</div>
                    <div className="text-sm font-medium hidden sm:block">
                      {isCloudRecording ? <span className="text-red-500 font-bold">🔴 CLOUD RECORDING</span> 
                      : isMagicOn ? <span className="text-pink-400 font-bold">✨ AI MAGIC ACTIVE (Captions/Rec)</span>
                      : <span className="text-green-400">{joined ? `Joined as: ${name || 'You'}` : 'Not Joined'}</span>}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    
                    {!joined ? (
                    <button onClick={handleJoinClick} className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 flex items-center gap-2 font-medium transition duration-200">Join Meeting</button>
                    ) : (
                    <>
                        {/* --- AI Magic Button (MUST BE PRESSED by all for captions) --- */}
                        <button 
                            onClick={toggleAIMagic} 
                            disabled={isCloudRecording}
                            className={`px-3 py-2 rounded-full font-medium flex items-center gap-2 transition duration-200 ${isMagicOn ? 'bg-pink-600 hover:bg-pink-700' : 'bg-gray-700 hover:bg-pink-500'}`} 
                            title={isMagicOn ? "Stop AI Magic (Download Recording & Captions)" : "Start AI Magic (Captions + Local Screen Recording)"}
                        >
                            {isMagicOn ? <FaRegStopCircle /> : <FaMagic />} <span className="hidden sm:inline">{isMagicOn ? 'Stop' : 'AI Magic'}</span>
                        </button>
                        
                        <button onClick={toggleMic} aria-pressed={micOn} className={`px-3 py-2 rounded-full transition duration-200 ${micOn ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`} title="Toggle Mic">
                        {micOn ? <FiMic /> : <IoIosMicOff />}
                        </button>

                        <button onClick={toggleCam} aria-pressed={camOn} className={`px-3 py-2 rounded-full transition duration-200 ${camOn ? 'bg-green-500 text-black' : 'bg-gray-700'}`} title="Toggle Camera">
                        <FiVideo />
                        </button>

                        <button onClick={() => meeting.toggleScreenShare?.()} className="px-3 py-2 rounded-full bg-gray-700 hover:bg-gray-600 transition duration-200" title="Toggle Screen Share">
                        <FiMonitor />
                        </button>

                        <button onClick={toggleRaiseHand} className={`px-3 py-2 rounded-full transition duration-200 ${raiseHandSet.has(meeting?.localParticipant?.id) ? 'bg-yellow-400 text-black animate-pulse' : 'bg-gray-700 hover:bg-yellow-500'}`} title="Raise Hand">
                        <FaHandPaper />
                        </button>

                        <button onClick={handleLeave} className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 flex items-center gap-2 transition duration-200" title="Leave">
                        <FaSignOutAlt /> <span className="hidden sm:inline">Leave</span>
                        </button>

                        {isAdmin && (
                          <button onClick={handleEnd} className="px-4 py-2 rounded-full bg-red-800 hover:bg-red-900 flex items-center gap-2 transition duration-200" title="End Meeting for all">
                            <FaStopCircle /> <span className="hidden sm:inline">End All</span>
                          </button>
                        )}
                    </>
                    )}
                </div>
                </div>
            </div>

            <div className="pt-20"></div>

            {/* MAIN CONTENT: Video Grid and Subtitle Panel */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_20rem] gap-4 p-4">
                
                {/* LEFT (Video Grid/Focus View) */}
                <main className="bg-transparent p-1">
                <div className="grid gap-4 h-[80vh] overflow-y-auto">
                    
                    {focusedParticipantId ? (
                    <div className="w-full h-full">
                        <ParticipantTile
                        key={focusedParticipantId}
                        participantId={focusedParticipantId}
                        activeSpeakerId={meeting?.activeSpeakerId}
                        toggleFocus={toggleFocus}
                        isFocused={true}
                        raiseHandSet={raiseHandSet} 
                        />
                    </div>
                    ) : (
                    <div className={`grid gap-4 ${participants.length > 2 ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
                        {participants.map((p) => (
                        <ParticipantTile 
                            key={p.id} 
                            participantId={p.id} 
                            activeSpeakerId={meeting?.activeSpeakerId} 
                            toggleFocus={toggleFocus} 
                            isFocused={false} 
                            raiseHandSet={raiseHandSet} 
                        />
                        ))}
                    </div>
                    )}
                </div>

                </main>

                {/* RIGHT: subtitles panel (20rem wide on large screens) */}
                <aside className="bg-gray-800 text-white p-4 rounded-lg shadow-xl border border-gray-700 h-[80vh] flex flex-col">
                
                {/* Fixed Header for Captions Panel */}
                <div className="flex-shrink-0 flex items-center justify-between mb-4 border-b border-gray-700 pb-2">
                    <h3 className="text-xl font-bold text-pink-400">Live Captions {captionsOn && <span className="text-sm text-green-400">(Listening)</span>}</h3>
                    
                    {/* Language Dropdown for Target Translation */}
                    <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="p-1 border rounded text-sm bg-gray-700 text-white focus:ring-pink-500 focus:border-pink-500"
                    >
                    {LANGUAGE_OPTIONS.map(opt => (
                        <option key={opt.code} value={opt.code}>
                        Translate to {opt.name}
                        </option>
                    ))}
                    </select>
                </div>

                {/* Captions Feed (Scrollable) */}
                <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-1"> 
                    {captions.length === 0 ? (
                    <div className="text-gray-500 p-4 text-center">Start AI Magic (Captions) to see live conversation.</div>
                    ) : (
                    captions.slice(-20).map((c, idx) => ( 
                        <div key={idx} className="p-3 bg-gray-700 rounded-lg border-l-4 border-pink-500 transition duration-300 hover:bg-gray-600">
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                            <span className="font-semibold text-white truncate">{c.senderName}</span>
                            <span>{new Date(c.ts).toLocaleTimeString()}</span>
                        </div>
                        {/* Original Text (पार्टिसिपेंट ने क्या बोला) */}
                        <div className="text-sm font-light italic text-gray-300">{c.original}</div> 
                        {/* Translated Text (ट्रांसलेट होकर क्या आया) */}
                        <div className="mt-1 text-md font-medium text-white">{c.text}</div> 
                        </div>
                    ))
                    )}
                </div>

                <div className="mt-4 pt-2 border-t border-gray-700 flex-shrink-0">
                    <button onClick={() => { setCaptions([]); localStorage.removeItem('meeting_captions'); }} className="text-xs text-red-500 hover:text-red-400 transition duration-200">Clear saved subtitles</button>
                </div>
                </aside>
            </div>

            {/* Name modal (if needed) */}
            {showNameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                <div className="bg-gray-900 rounded-lg p-6 w-11/12 max-w-md border border-indigo-500 shadow-2xl">
                    <h3 className="font-semibold mb-4 text-white text-xl">Enter your display name</h3>
                    <input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="w-full border border-gray-600 p-3 rounded-lg mb-4 text-white bg-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400" 
                        placeholder="Your name" 
                    />
                    <div className="flex gap-3">
                    <button onClick={() => { if(!name.trim()){ alert('Please enter name'); return;} setShowNameModal(false); localStorage.setItem('meeting_username', name); handleJoinClick(); }} className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition duration-200">Join Meeting</button>
                    <button onClick={() => setShowNameModal(false)} className="flex-1 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition duration-200">Cancel</button>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
}

// --- Participant Tile Component ---

function ParticipantTile({ participantId, activeSpeakerId, toggleFocus, isFocused, raiseHandSet }) {
    const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName, screenShareStream } = useParticipant(participantId);
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const screenRef = useRef(null);

    const isHandRaised = raiseHandSet.has(participantId);

    // Video Stream Effect
    useEffect(() => {
        if (webcamStream && videoRef.current) {
            const ms = new MediaStream();
            ms.addTrack(webcamStream.track);
            videoRef.current.srcObject = ms;
            videoRef.current.play().catch(() => {});
        }
    }, [webcamStream]);

    // Audio Stream Effect
    useEffect(() => {
        if (micStream && audioRef.current) {
            const ms = new MediaStream();
            ms.addTrack(micStream.track);
            audioRef.current.srcObject = ms;
            audioRef.current.play().catch(() => {});
        }
    }, [micStream]);

    // Screen Share Stream Effect
    useEffect(() => {
        if (screenShareStream && screenRef.current) {
            const ms = new MediaStream();
            ms.addTrack(screenShareStream.track);
            screenRef.current.srcObject = ms;
            screenRef.current.play().catch(() => {});
        }
    }, [screenShareStream]);

    const isActive = activeSpeakerId === participantId;
    
    // UI Enhancements for Focus Mode
    const tileClasses = `
        bg-black p-1 rounded-lg relative border cursor-pointer transition-all duration-300 shadow-lg
        ${isFocused ? 'h-full w-full' : 'h-64'} 
        ${isActive ? 'border-4 border-yellow-400 ring-4 ring-yellow-700' : 'border-gray-700 hover:border-indigo-500'}
    `;
    const objectFit = isFocused ? 'object-contain' : 'object-cover';


    return (
        <div 
            onClick={() => toggleFocus(participantId)}
            className={tileClasses}
        >
        
        {/* Main Media Display */}
        {screenShareStream ? (
            <video ref={screenRef} autoPlay playsInline className={`w-full h-full ${objectFit} rounded-md`} />
        ) : webcamOn ? (
            <video ref={videoRef} autoPlay playsInline muted={isLocal} className={`w-full h-full ${objectFit} rounded-md`} />
        ) : (
            <div className="h-full flex justify-center items-center text-white text-4xl font-bold bg-gray-800 rounded-md">
                {displayName?.charAt(0) || 'U'}
            </div>
        )}

        {/* Audio Player (muted for local participant) */}
        <audio ref={audioRef} autoPlay playsInline muted={isLocal} />

        {/* Participant Info/Overlay */}
        <div className="absolute bottom-1 left-1 right-1 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-b-lg flex justify-between items-center text-sm">
            
            <span className="font-semibold truncate max-w-[70%]">
                {displayName} {isLocal ? '(You)' : ''}
            </span>

            {/* Status Icons */}
            <div className="flex gap-2 items-center">
                {/* Hand Raised Icon */}
                {isHandRaised && (
                    <FaHandPaper className="text-yellow-400 text-base animate-pulse" title="Hand Raised" />
                )}

                {/* Active Speaker Indicator */}
                {isActive && (
                    <FiVolume2 className="text-green-400 text-base" title="Active Speaker" />
                )}

                {/* Mic Status */}
                {!micOn && (
                    <IoIosMicOff className="text-red-500 text-base" title="Mic Off" />
                )}
            </div>
        </div>
        
        {/* Focus/Maximize Button */}
        <div className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full text-xs transition duration-200" title={isFocused ? "Click to minimize" : "Click to maximize"}>
            {isFocused ? <FaCompressAlt /> : <FaExpandAlt />}
        </div>
        
        {/* Large Speaking Indicator */}
        {isActive && !isFocused && <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center pointer-events-none">
            <div className="bg-yellow-400 text-black px-4 py-2 rounded-full text-lg font-bold shadow-xl animate-pulse">SPEAKING</div>
        </div>}

        </div>
    );
}