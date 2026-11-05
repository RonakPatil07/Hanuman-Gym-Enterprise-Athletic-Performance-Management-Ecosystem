/**
 * ==============================================================================
 * HANUMAN GYM — SOCIAL SHARE CARD & PROGRAM EXPORT ENGINE (v1.0)
 * ==============================================================================
 * 
 * High-resolution canvas rendering for Instagram/WhatsApp story cards,
 * QR code data serialization, and print-ready gym card export.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SocialExportEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const ENGINE_VERSION = '1.0';

    const CARD_FORMATS = {
        STORY: { width: 1080, height: 1920, label: 'Instagram / WhatsApp Story (9:16)' },
        SQUARE: { width: 1080, height: 1080, label: 'Feed / Square Card (1:1)' }
    };

    /**
     * Renders a high-resolution social share card onto an HTML5 canvas.
     * 
     * @param {Object} program Workout program
     * @param {string} format 'story' | 'square'
     * @returns {HTMLCanvasElement|null} Rendered Canvas
     */
    function renderSocialCardCanvas(program, format = 'story') {
        if (typeof document === 'undefined' || !program) return null;

        const spec = format === 'square' ? CARD_FORMATS.SQUARE : CARD_FORMATS.STORY;
        const canvas = document.createElement('canvas');
        canvas.width = spec.width;
        canvas.height = spec.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const isStory = format !== 'square';
        const W = canvas.width;
        const H = canvas.height;

        // 1. Background Gradient
        const bgGrad = ctx.createLinearGradient(0, 0, W, H);
        bgGrad.addColorStop(0, '#0a0d14');
        bgGrad.addColorStop(0.5, '#121826');
        bgGrad.addColorStop(1, '#080b10');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // 2. Decorative Performance Lime Cyber Accents
        ctx.strokeStyle = 'rgba(179, 221, 36, 0.15)';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, 40, W - 80, H - 80);

        ctx.strokeStyle = '#B3DD24';
        ctx.lineWidth = 4;
        // Corner accents
        const cornerSize = 40;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(40, 40 + cornerSize); ctx.lineTo(40, 40); ctx.lineTo(40 + cornerSize, 40);
        ctx.stroke();
        // Top-right
        ctx.beginPath();
        ctx.moveTo(W - 40 - cornerSize, 40); ctx.lineTo(W - 40, 40); ctx.lineTo(W - 40, 40 + cornerSize);
        ctx.stroke();
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(40, H - 40 - cornerSize); ctx.lineTo(40, H - 40); ctx.lineTo(40 + cornerSize, H - 40);
        ctx.stroke();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(W - 40 - cornerSize, H - 40); ctx.lineTo(W - 40, H - 40); ctx.lineTo(W - 40, H - 40 - cornerSize);
        ctx.stroke();

        // 3. Header Branding
        ctx.fillStyle = '#B3DD24';
        ctx.font = 'bold 38px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ HANUMAN GYM — ELITE TRAINING ⚡', W / 2, 130);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 60px system-ui, -apple-system, sans-serif';
        const programTitle = program.programTitle || 'CUSTOM WORKOUT BLUEPRINT';
        ctx.fillText(programTitle.toUpperCase(), W / 2, 220);

        // 4. Sub-header Badges
        const profile = program.profileSummary || program.canonicalProfile || {};
        const goalStr = (profile.primaryGoal || program.goal || 'Hypertrophy & Strength').toUpperCase();
        const daysStr = `${program.sessions ? program.sessions.length : 4} DAYS / WEEK`;

        ctx.fillStyle = 'rgba(179, 221, 36, 0.12)';
        ctx.fillRect((W / 2) - 350, 270, 700, 70);
        ctx.strokeStyle = '#B3DD24';
        ctx.lineWidth = 1.5;
        ctx.strokeRect((W / 2) - 350, 270, 700, 70);

        ctx.fillStyle = '#B3DD24';
        ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
        ctx.fillText(`🎯 ${goalStr}  •  🗓️ ${daysStr}`, W / 2, 316);

        // 5. Training Sessions Snapshot
        const sessions = program.sessions || [];
        const sessionCountToRender = isStory ? Math.min(sessions.length, 4) : Math.min(sessions.length, 2);
        let startY = 400;

        sessions.slice(0, sessionCountToRender).forEach((sess, idx) => {
            const cardHeight = isStory ? 280 : 250;

            // Card box
            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.fillRect(80, startY, W - 160, cardHeight);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(80, startY, W - 160, cardHeight);

            // Left lime indicator bar
            ctx.fillStyle = '#B3DD24';
            ctx.fillRect(80, startY, 8, cardHeight);

            // Session Title
            ctx.fillStyle = '#00e5ff';
            ctx.font = 'bold 34px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${sess.day || `Day ${idx + 1}`}: ${sess.title || 'Training Session'}`, 110, startY + 50);

            // Exercise items
            const exercises = sess.exercises || [];
            let exY = startY + 105;
            exercises.slice(0, isStory ? 4 : 3).forEach((ex, exIdx) => {
                ctx.fillStyle = '#e2e8f0';
                ctx.font = '500 26px system-ui, -apple-system, sans-serif';
                ctx.fillText(`• ${ex.exerciseName || 'Exercise'}`, 115, exY);

                ctx.fillStyle = '#a0aec0';
                ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText(`${ex.sets} sets × ${ex.reps}`, W - 110, exY);
                ctx.textAlign = 'left';

                exY += 44;
            });

            startY += cardHeight + 30;
        });

        // 6. Metrics Summary Footer Bar
        let totalSets = 0;
        sessions.forEach(s => (s.exercises || []).forEach(e => { totalSets += (parseInt(e.sets, 10) || 3); }));

        const footerY = isStory ? H - 240 : H - 140;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(80, footerY, W - 160, 100);
        ctx.strokeStyle = 'rgba(179, 221, 36, 0.3)';
        ctx.strokeRect(80, footerY, W - 160, 100);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`⚡ WEEKLY WORKLOAD: ${totalSets} DIRECT SETS  •  PERIODIZATION: 12 WEEKS`, W / 2, footerY + 60);

        // 7. Watermark Tag
        ctx.fillStyle = '#718096';
        ctx.font = '600 24px system-ui, -apple-system, sans-serif';
        ctx.fillText('Generated with Hanuman Gym AI Workout Architect', W / 2, H - 70);

        return canvas;
    }

    /**
     * Encodes a minimal, portable base64 JSON payload of the program for QR code generation.
     */
    function generateCompactProgramPayload(program) {
        if (!program || typeof program !== 'object') return '';
        const payload = {
            v: ENGINE_VERSION,
            id: program.programId,
            title: program.programTitle,
            goal: program.goal,
            sessions: (program.sessions || []).map(s => ({
                day: s.day,
                title: s.title,
                exercises: (s.exercises || []).map(e => ({
                    name: e.exerciseName,
                    sets: e.sets,
                    reps: e.reps
                }))
            }))
        };
        try {
            return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
        } catch(e) {
            return '';
        }
    }

    /**
     * Downloads an HTML5 canvas as a PNG file.
     */
    function downloadCanvasAsPNG(canvas, filename = 'hanuman-gym-workout-card.png') {
        if (!canvas || typeof document === 'undefined') return;
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    /**
     * Triggers the native Web Share API with the generated card image.
     */
    async function shareCanvasNative(canvas, title = 'My Custom Hanuman Gym Workout Plan') {
        if (!canvas || typeof navigator === 'undefined' || !navigator.share) {
            downloadCanvasAsPNG(canvas);
            return false;
        }

        try {
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    downloadCanvasAsPNG(canvas);
                    return;
                }
                const file = new File([blob], 'hanuman-workout-plan.png', { type: 'image/png' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title,
                        text: 'Check out my custom AI-generated workout blueprint from Hanuman Gym!',
                        files: [file]
                    });
                } else {
                    downloadCanvasAsPNG(canvas);
                }
            });
            return true;
        } catch(e) {
            downloadCanvasAsPNG(canvas);
            return false;
        }
    }

    return {
        ENGINE_VERSION,
        CARD_FORMATS,
        renderSocialCardCanvas,
        generateCompactProgramPayload,
        downloadCanvasAsPNG,
        shareCanvasNative
    };
}));
