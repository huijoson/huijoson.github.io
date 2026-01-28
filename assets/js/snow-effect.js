/**
 * Japanese Snow Effect
 * A lightweight, performant snow animation with a serene aesthetic
 */

class JapaneseSnowEffect {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.snowflakes = [];
        this.animationId = null;
        this.isEnabled = this.loadPreference();
        this.maxSnowflakes = 35; // Softer, lighter snowfall
        
        this.init();
    }
    
    init() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'snow-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Setup event listeners
        window.addEventListener('resize', () => this.resize());
        
        // Create initial snowflakes
        this.createSnowflakes();
        
        // Start animation if enabled
        if (this.isEnabled) {
            this.start();
        } else {
            this.canvas.style.display = 'none';
        }
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createSnowflakes() {
        this.snowflakes = [];
        for (let i = 0; i < this.maxSnowflakes; i++) {
            this.snowflakes.push(this.createSnowflake());
        }
    }
    
    createSnowflake(fromTop = false) {
        return {
            x: Math.random() * this.canvas.width,
            y: fromTop ? -10 : Math.random() * this.canvas.height,
            radius: Math.random() * 1.4 + 0.8, // Size: 0.8-2.2px
            opacity: Math.random() * 0.45 + 0.15, // Opacity: 0.15-0.6
            speedY: Math.random() * 0.6 + 0.3, // Vertical speed: 0.3-0.9
            speedX: Math.random() * 0.3 - 0.15, // Horizontal drift: -0.15 to 0.15
            wobble: Math.random() * Math.PI * 2, // Phase for wobble motion
            wobbleSpeed: Math.random() * 0.018 + 0.006 // Wobble frequency
        };
    }
    
    updateSnowflakes() {
        for (let i = 0; i < this.snowflakes.length; i++) {
            const flake = this.snowflakes[i];
            
            // Update position
            flake.y += flake.speedY;
            flake.wobble += flake.wobbleSpeed;
            flake.x += Math.sin(flake.wobble) * 0.2 + flake.speedX;
            
            // Reset snowflake if it goes off screen
            if (flake.y > this.canvas.height + 10) {
                this.snowflakes[i] = this.createSnowflake(true);
            }
            
            // Handle horizontal boundaries
            if (flake.x > this.canvas.width + 10) {
                flake.x = -10;
            } else if (flake.x < -10) {
                flake.x = this.canvas.width + 10;
            }
        }
    }
    
    drawSnowflakes() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (const flake of this.snowflakes) {
            this.ctx.beginPath();
            this.ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            this.ctx.fill();
            
            // Subtle glow for larger flakes only
            if (flake.radius > 1.6) {
                this.ctx.beginPath();
                this.ctx.arc(flake.x, flake.y, flake.radius * 1.4, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity * 0.15})`;
                this.ctx.fill();
            }
        }
    }
    
    animate() {
        this.updateSnowflakes();
        this.drawSnowflakes();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    start() {
        if (this.animationId) return;
        this.canvas.style.display = 'block';
        this.isEnabled = true;
        this.savePreference(true);
        this.animate();
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.canvas.style.display = 'none';
        this.isEnabled = false;
        this.savePreference(false);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    toggle() {
        if (this.isEnabled) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    savePreference(enabled) {
        try {
            localStorage.setItem('snow-effect-enabled', enabled ? 'true' : 'false');
        } catch (e) {
            // LocalStorage might not be available
        }
    }
    
    loadPreference() {
        try {
            const saved = localStorage.getItem('snow-effect-enabled');
            return saved === null ? true : saved === 'true'; // Default to enabled
        } catch (e) {
            return true;
        }
    }
}

// Initialize snow effect when DOM is ready
let snowEffect;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        snowEffect = new JapaneseSnowEffect();
    });
} else {
    snowEffect = new JapaneseSnowEffect();
}

// Export for toggle button
window.toggleSnowEffect = function() {
    if (snowEffect) {
        snowEffect.toggle();
        updateToggleButton();
    }
};

function updateToggleButton() {
    const button = document.getElementById('snow-toggle');
    if (button && snowEffect) {
        button.textContent = snowEffect.isEnabled ? '❄️ 雪' : '☃️ 雪';
        button.setAttribute('aria-label', snowEffect.isEnabled ? '停用雪花效果' : '啟用雪花效果');
    }
}

// Update button state after initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateToggleButton);
} else {
    setTimeout(updateToggleButton, 100);
}