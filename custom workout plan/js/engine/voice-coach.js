/**
 * ==============================================================================
 * HANUMAN GYM — VOICE COACH & WEB AUDIO CHIMES ENGINE (v1.0)
 * ==============================================================================
 * 
 * High-performance audio synthesizer & voice coach using browser-native
 * Web Audio API (zero external assets/network latency) and Web Speech API.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.VoiceCoachEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const ENGINE_VERSION = '1.0';

    let _audioCtx = null;
    let _voiceEnabled = true;
    let _soundFxEnabled = true;

    // Load persisted preferences
    if (typeof localStorage !== 'undefined') {
        try {
            const v = localStorage.getItem('fitphysique_voice_coach_enabled');
            if (v !== null) _voiceEnabled = v === 'true';
            const s = localStorage.getItem('fitphysique_sound_fx_enabled');
            if (s !== null) _soundFxEnabled = s === 'true';
        } catch(e) {}
    }

    function getAudioContext() {
        if (typeof window === 'undefined') return null;
        if (!_audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                _audioCtx = new AudioContext();
            }
        }
        if (_audioCtx && _audioCtx.state === 'suspended') {
            _audioCtx.resume().catch(() => {});
        }
        return _audioCtx;
    }

    /**
     * Synthesizes a pure sine/square tone without audio files.
     */
    function playTone(freq, type = 'sine', durationMs = 150, volume = 0.15) {
        if (!_soundFxEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;

        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (durationMs / 1000));

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + (durationMs / 1000));
        } catch(e) {
            console.warn('[VoiceCoach] Audio tone playback error:', e);
        }
    }

    /**
     * Plays rest countdown tick beep (800Hz standard, 1200Hz GO).
     */
    function playCountdownBeep(isFinal = false) {
        if (isFinal) {
            playTone(1200, 'sine', 350, 0.25);
        } else {
            playTone(850, 'sine', 120, 0.15);
        }
    }

    /**
     * Plays a pleasant 2-tone success chime on set completion.
     */
    function playSuccessChime() {
        if (!_soundFxEnabled) return;
        playTone(523.25, 'sine', 120, 0.15); // C5
        setTimeout(() => {
            playTone(659.25, 'sine', 200, 0.15); // E5
        }, 120);
    }

    /**
     * Plays an energetic 3-tone victory fanfare on PR achievement.
     */
    function playPrFanfare() {
        if (!_soundFxEnabled) return;
        playTone(587.33, 'sine', 100, 0.2); // D5
        setTimeout(() => playTone(739.99, 'sine', 120, 0.2), 100); // F#5
        setTimeout(() => playTone(880.00, 'sine', 300, 0.25), 220); // A5
    }

    /**
     * Speaks text aloud using the browser's Web Speech API.
     */
    function speak(text, rate = 1.05) {
        if (!_voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

        try {
            window.speechSynthesis.cancel(); // Stop overlapping speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = rate;
            utterance.pitch = 1.0;
            utterance.volume = 0.9;
            window.speechSynthesis.speak(utterance);
        } catch(e) {
            console.warn('[VoiceCoach] Speech synthesis error:', e);
        }
    }

    function announceRestStart(seconds, nextExName = '') {
        const minStr = seconds >= 60 ? `${Math.round(seconds / 60)} minute` : `${seconds} seconds`;
        let msg = `Set complete. Starting ${minStr} rest.`;
        if (nextExName) {
            msg += ` Next up: ${nextExName}.`;
        }
        speak(msg);
    }

    function announceRestWarning(remainingSec) {
        speak(`${remainingSec} seconds remaining. Prepare to lift.`);
    }

    function announceRestComplete() {
        playCountdownBeep(true);
        speak("Rest complete. Let's go!");
    }

    function announcePrAchieved(exName, load, unit = 'kg') {
        playPrFanfare();
        setTimeout(() => {
            speak(`Incredible! New Personal Record on ${exName}! ${load} ${unit}!`);
        }, 400);
    }

    function setVoiceEnabled(enabled) {
        _voiceEnabled = Boolean(enabled);
        if (typeof localStorage !== 'undefined') {
            try { localStorage.setItem('fitphysique_voice_coach_enabled', String(_voiceEnabled)); } catch(e) {}
        }
    }

    function setSoundFxEnabled(enabled) {
        _soundFxEnabled = Boolean(enabled);
        if (typeof localStorage !== 'undefined') {
            try { localStorage.setItem('fitphysique_sound_fx_enabled', String(_soundFxEnabled)); } catch(e) {}
        }
    }

    function isVoiceEnabled() {
        return _voiceEnabled;
    }

    function isSoundFxEnabled() {
        return _soundFxEnabled;
    }

    return {
        ENGINE_VERSION,
        playTone,
        playCountdownBeep,
        playSuccessChime,
        playPrFanfare,
        speak,
        announceRestStart,
        announceRestWarning,
        announceRestComplete,
        announcePrAchieved,
        setVoiceEnabled,
        setSoundFxEnabled,
        isVoiceEnabled,
        isSoundFxEnabled
    };
}));
