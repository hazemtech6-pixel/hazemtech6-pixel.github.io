/**
 * FlexiOS v1.0 - Core Desktop Engine
 * Theme: Neubrutalist-Pop
 */

class FlexiOS {
    constructor() {
        this.zIndexCounter = 100;
        this.activeWindow = null;
        this.isDragging = false;
        
        // Initialize once DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('🚀 FlexiOS v1.0 Booting...');
        
        this.setupWindowSystem();
        this.setupTerminal();
        this.setupDock();
        this.setupCustomization();
        this.renderStatus();
    }

    /**
     * Window Management Logic
     * Handles dragging, z-index, and physical state transitions
     */
    setupWindowSystem() {
        const windows = document.querySelectorAll('.os-window, .window-frame');

        windows.forEach(win => {
            const header = win.querySelector('.os-window-header, .window-header');
            if (!header) return;

            let xOffset = 0;
            let yOffset = 0;
            let initialX;
            let initialY;

            // Make window interactive
            header.style.cursor = 'grab';

            const dragStart = (e) => {
                // Handle both touch and mouse
                const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
                const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

                initialX = clientX - xOffset;
                initialY = clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    this.isDragging = true;
                    this.focusWindow(win);
                    header.style.cursor = 'grabbing';
                }
            };

            const dragEnd = () => {
                initialX = xOffset;
                initialY = yOffset;
                this.isDragging = false;
                header.style.cursor = 'grab';
            };

            const drag = (e) => {
                if (this.isDragging) {
                    e.preventDefault();
                    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
                    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
                    
                    xOffset = clientX - initialX;
                    yOffset = clientY - initialY;

                    // Apply physics: lift the window slightly while dragging
                    win.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0) scale(1.01)`;
                    win.style.boxShadow = `12px 12px 0px 0px var(--shadow-color, #1b1b1b)`;
                }
            };

            // Event Listeners
            header.addEventListener('mousedown', dragStart);
            window.addEventListener('mousemove', drag);
            window.addEventListener('mouseup', dragEnd);

            // Touch Support
            header.addEventListener('touchstart', dragStart, { passive: false });
            window.addEventListener('touchmove', drag, { passive: false });
            window.addEventListener('touchend', dragEnd);

            // Close/Minimize Logic
            win.querySelectorAll('.btn-close, .control-dot:nth-child(1)').forEach(btn => {
                btn.onclick = () => this.closeWindow(win);
            });
        });
    }

    focusWindow(win) {
        this.zIndexCounter++;
        win.style.zIndex = this.zIndexCounter;
        // Visual feedback for active window
        document.querySelectorAll('.os-window').forEach(w => w.style.opacity = '0.9');
        win.style.opacity = '1';
    }

    closeWindow(win) {
        win.style.transform += ' scale(0.9)';
        win.style.opacity = '0';
        setTimeout(() => {
            win.style.display = 'none';
            this.updateDockIndicator(win.id, false);
        }, 150);
    }

    /**
     * Terminal Logic
     * Simulates a Linux-based CLI with "recessed" input styling
     */
    setupTerminal() {
        const termInput = document.querySelector('.terminal-input');
        const termOutput = document.querySelector('.terminal-output');

        if (!termInput) return;

        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = termInput.value.trim().toLowerCase();
                const line = document.createElement('div');
                line.className = 'term-line';
                line.innerHTML = `<span style="color:var(--primary)">root@flexios</span>:~$ ${cmd}`;
                
                termOutput.appendChild(line);
                this.processCommand(cmd, termOutput);
                
                termInput.value = '';
                termOutput.scrollTop = termOutput.scrollHeight;
            }
        });
    }

    processCommand(cmd, output) {
        const response = document.createElement('div');
        response.style.marginBottom = '8px';

        switch(cmd) {
            case 'help':
                response.innerHTML = 'Available: <span class="chip">help</span> <span class="chip">clear</span> <span class="chip">neofetch</span> <span class="chip">ls</span>';
                break;
            case 'neofetch':
                response.innerHTML = `<pre style="color:var(--secondary)">
   .-.     FlexiOS v1.0
  oo|      OS: Flex Linux x86_64
 /  \\     Kernel: 6.2.0-bubble
(\\_/ )    Shell: FlexBash
             </pre>`;
                break;
            case 'clear':
                output.innerHTML = '';
                return;
            case 'ls':
                response.innerHTML = 'Applications/  Documents/  System/  Personalities/';
                break;
            case '':
                return;
            default:
                response.innerHTML = `command not found: ${cmd}`;
        }
        output.appendChild(response);
    }

    /**
     * Customization Logic
     * Swaps CSS variables or Backgrounds
     */
    setupCustomization() {
        const presets = document.querySelectorAll('.wallpaper-preset');
        presets.forEach(p => {
            p.onclick = () => {
                const color = p.dataset.color || '#f9f9f9';
                document.body.style.backgroundColor = color;
                console.log(`Wallpaper changed to: ${color}`);
            };
        });
    }

    /**
     * Dock & Taskbar Logic
     */
    setupDock() {
        const icons = document.querySelectorAll('.dock-icon');
        icons.forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                icon.style.transform = 'translateY(-10px) scale(1.2)';
            });
            icon.addEventListener('mouseleave', () => {
                icon.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    updateDockIndicator(winId, active) {
        const dot = document.querySelector(`[data-win-id="${winId}"] .indicator`);
        if (dot) dot.style.background = active ? 'var(--secondary)' : 'transparent';
    }

    renderStatus() {
        const updateClock = () => {
            const clock = document.querySelector('.system-clock');
            if (clock) {
                const now = new Date();
                clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        };
        setInterval(updateClock, 1000);
        updateClock();
    }
}

// Instantiate the OS
const Flex = new FlexiOS();
