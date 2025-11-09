// LoadingScreen.js - Diablo-style loading screen for level transitions

export class LoadingScreen {
    constructor() {
        this.container = null;
        this.isActive = false;
        this.progress = 0;
        this.flavorTextIndex = 0;

        // Diablo-inspired flavor text messages
        this.flavorTexts = [
            "The air grows colder as you descend...",
            "Ancient evil stirs in the darkness below...",
            "Your torch flickers in the stale air...",
            "The stone steps are slick with moisture...",
            "Whispers echo from the depths...",
            "Shadows dance on the walls ahead...",
            "A foul stench rises from below...",
            "The weight of ages presses down upon you...",
            "Forgotten souls linger in these halls...",
            "Your footsteps disturb centuries of dust...",
            "The darkness seems almost alive...",
            "Something watches from the shadows...",
            "Your breath mists in the frigid air...",
            "The walls seem to close in around you...",
            "Ancient runes glow faintly in the gloom...",
            "Blood-stained stones tell dark tales...",
            "The dead do not rest easy here...",
            "Your courage will be tested below...",
            "Evil has taken root in these depths...",
            "Turn back while you still can...",
            "The abyss calls to you...",
            "Light holds no sway in the deep places...",
            "Your armor feels heavier with each step...",
            "The walls drip with condensation and... something else...",
            "Skeletal remains litter the path ahead...",
            "The very stones remember ancient horrors...",
            "Your sword hand trembles slightly...",
            "Madness lurks in the furthest chambers...",
            "The dungeon hungers for fresh blood..."
        ];

        this.createLoadingScreen();
    }

    createLoadingScreen() {
        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'loading-screen';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(180deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%);
            z-index: 10000;
            display: none;
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
            pointer-events: none;
        `;

        // Background texture overlay
        const texture = document.createElement('div');
        texture.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image:
                repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.15) 3px),
                repeating-linear-gradient(90deg, rgba(0,0,0,0.15) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.15) 3px);
            opacity: 0.3;
            pointer-events: none;
        `;
        this.container.appendChild(texture);

        // Gothic border frame
        const frame = document.createElement('div');
        frame.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            max-width: 800px;
            padding: 40px;
            border: 3px solid #4a2a1a;
            box-shadow:
                inset 0 0 30px rgba(0,0,0,0.8),
                0 0 40px rgba(200,100,50,0.3),
                0 0 80px rgba(200,100,50,0.2);
            background: radial-gradient(ellipse at center, rgba(30,15,10,0.9) 0%, rgba(10,5,5,0.95) 100%);
        `;

        // Content container
        const content = document.createElement('div');
        content.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 30px;
        `;

        // Flame/torch animation container (top)
        const torchContainer = document.createElement('div');
        torchContainer.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 400px;
            margin-bottom: 20px;
        `;

        // Left torch
        const leftTorch = this.createTorch();
        torchContainer.appendChild(leftTorch);

        // Right torch
        const rightTorch = this.createTorch();
        torchContainer.appendChild(rightTorch);

        content.appendChild(torchContainer);

        // Main loading text
        const loadingText = document.createElement('div');
        loadingText.id = 'loading-main-text';
        loadingText.textContent = 'DESCENDING...';
        loadingText.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 32px;
            font-weight: bold;
            color: #d4a574;
            text-transform: uppercase;
            letter-spacing: 4px;
            text-shadow:
                0 0 10px rgba(212,165,116,0.8),
                0 0 20px rgba(212,165,116,0.5),
                2px 2px 4px rgba(0,0,0,0.9);
            animation: pulse-glow 2s ease-in-out infinite;
        `;

        // Flavor text
        this.flavorTextElement = document.createElement('div');
        this.flavorTextElement.id = 'loading-flavor-text';
        this.flavorTextElement.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 16px;
            color: #b8b8b8;
            text-align: center;
            max-width: 600px;
            line-height: 1.6;
            font-style: italic;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.9);
            min-height: 50px;
        `;

        // Progress bar container
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: 100%;
            max-width: 500px;
            margin-top: 20px;
        `;

        const progressBg = document.createElement('div');
        progressBg.style.cssText = `
            width: 100%;
            height: 12px;
            background: rgba(0,0,0,0.6);
            border: 2px solid #4a2a1a;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
            position: relative;
            overflow: hidden;
        `;

        this.progressBar = document.createElement('div');
        this.progressBar.id = 'loading-progress-bar';
        this.progressBar.style.cssText = `
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #8b4513 0%, #d4a574 50%, #8b4513 100%);
            box-shadow:
                0 0 10px rgba(212,165,116,0.6),
                inset 0 0 5px rgba(255,255,255,0.3);
            transition: width 0.3s ease-out;
        `;

        progressBg.appendChild(this.progressBar);
        progressContainer.appendChild(progressBg);

        // Spinner/circular indicator
        const spinner = document.createElement('div');
        spinner.style.cssText = `
            width: 60px;
            height: 60px;
            border: 4px solid rgba(212,165,116,0.2);
            border-top: 4px solid #d4a574;
            border-radius: 50%;
            animation: spin 1.5s linear infinite;
            box-shadow: 0 0 20px rgba(212,165,116,0.4);
            margin-top: 20px;
        `;

        content.appendChild(loadingText);
        content.appendChild(this.flavorTextElement);
        content.appendChild(progressContainer);
        content.appendChild(spinner);

        frame.appendChild(content);
        this.container.appendChild(frame);

        // Add CSS animations
        this.addAnimationStyles();

        // Don't append to body yet - will be added when needed
    }

    createTorch() {
        const torch = document.createElement('div');
        torch.style.cssText = `
            position: relative;
            width: 20px;
            height: 40px;
        `;

        // Flame
        const flame = document.createElement('div');
        flame.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 30px;
            background: linear-gradient(to top, #ff6600 0%, #ff9933 50%, #ffcc00 100%);
            border-radius: 50% 50% 20% 20%;
            animation: flicker 0.3s ease-in-out infinite alternate;
            box-shadow:
                0 0 20px #ff6600,
                0 0 40px #ff6600,
                0 0 60px rgba(255,102,0,0.5);
        `;

        // Inner flame
        const innerFlame = document.createElement('div');
        innerFlame.style.cssText = `
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 12px;
            height: 20px;
            background: linear-gradient(to top, #ffcc00 0%, #ffffff 100%);
            border-radius: 50% 50% 20% 20%;
            animation: flicker 0.2s ease-in-out infinite alternate;
        `;

        flame.appendChild(innerFlame);
        torch.appendChild(flame);

        return torch;
    }

    addAnimationStyles() {
        if (document.getElementById('loading-screen-animations')) return;

        const style = document.createElement('style');
        style.id = 'loading-screen-animations';
        style.textContent = `
            @keyframes pulse-glow {
                0%, 100% {
                    opacity: 1;
                    text-shadow:
                        0 0 10px rgba(212,165,116,0.8),
                        0 0 20px rgba(212,165,116,0.5),
                        2px 2px 4px rgba(0,0,0,0.9);
                }
                50% {
                    opacity: 0.8;
                    text-shadow:
                        0 0 15px rgba(212,165,116,1),
                        0 0 30px rgba(212,165,116,0.7),
                        2px 2px 4px rgba(0,0,0,0.9);
                }
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @keyframes flicker {
                0% {
                    transform: translateX(-50%) scaleY(1);
                    opacity: 1;
                }
                50% {
                    transform: translateX(-50%) scaleY(0.95);
                    opacity: 0.9;
                }
                100% {
                    transform: translateX(-50%) scaleY(1.05);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    show(loadingText = 'DESCENDING...') {
        if (this.isActive) return Promise.resolve();

        return new Promise((resolve) => {
            // Add to DOM if not already there
            if (!this.container.parentElement) {
                document.body.appendChild(this.container);
            }

            // Pick random flavor text
            this.flavorTextIndex = Math.floor(Math.random() * this.flavorTexts.length);
            this.flavorTextElement.textContent = this.flavorTexts[this.flavorTextIndex];

            // Update loading text
            const mainText = this.container.querySelector('#loading-main-text');
            if (mainText) {
                mainText.textContent = loadingText;
            }

            // Reset progress
            this.progress = 0;
            this.progressBar.style.width = '0%';

            // Show with fade in
            this.container.style.display = 'block';
            this.container.style.pointerEvents = 'all';

            // Trigger fade in
            setTimeout(() => {
                this.container.style.opacity = '1';
                this.isActive = true;
                setTimeout(resolve, 500); // Wait for fade in
            }, 10);
        });
    }

    hide() {
        if (!this.isActive) return Promise.resolve();

        return new Promise((resolve) => {
            // Fade out
            this.container.style.opacity = '0';

            setTimeout(() => {
                this.container.style.display = 'none';
                this.container.style.pointerEvents = 'none';
                this.isActive = false;
                resolve();
            }, 500); // Match transition duration
        });
    }

    updateProgress(percent) {
        this.progress = Math.min(100, Math.max(0, percent));
        this.progressBar.style.width = `${this.progress}%`;
    }

    setFlavorText(text) {
        if (this.flavorTextElement) {
            this.flavorTextElement.textContent = text;
        }
    }

    async simulateLoading(minDuration = 2000, maxDuration = 3000) {
        const duration = minDuration + Math.random() * (maxDuration - minDuration);
        const steps = 20;
        const stepDuration = duration / steps;

        for (let i = 0; i <= steps; i++) {
            this.updateProgress((i / steps) * 100);

            // Occasionally change flavor text midway
            if (i === Math.floor(steps / 2)) {
                const newIndex = (this.flavorTextIndex + 1 + Math.floor(Math.random() * (this.flavorTexts.length - 1))) % this.flavorTexts.length;
                this.flavorTextIndex = newIndex;
                this.setFlavorText(this.flavorTexts[this.flavorTextIndex]);
            }

            await new Promise(resolve => setTimeout(resolve, stepDuration));
        }
    }

    destroy() {
        if (this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }

        const styleElement = document.getElementById('loading-screen-animations');
        if (styleElement) {
            styleElement.remove();
        }
    }
}
