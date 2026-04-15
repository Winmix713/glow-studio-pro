<html lang="en" class="dark"><head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ComponentSynth Workspace</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,200;9..40,300;9..40,400;9..40,500&amp;display=swap" rel="stylesheet">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.iconify.design/iconify-icon/1.0.8/iconify-icon.min.js"></script>

    <style>
        :root {
            /* Base Theme */
            --bg: #09090b;
            --surface: rgba(255,255,255,0.04);
            --modal-bg: rgba(14,14,16,0.90);
            --border: rgba(255,255,255,0.08);
            --border-hover: rgba(255,255,255,0.15);
            --text-1: rgba(255,255,255,0.92);
            --text-2: rgba(255,255,255,0.45);
            --text-3: rgba(255,255,255,0.22);
            --accent: rgba(167, 139, 250, 1);
            --accent-bg: rgba(167, 139, 250, 0.1);
            --accent-glow: rgba(167, 139, 250, 0.15);
            --r-sm: 8px; --r-md: 13px; --r-lg: 20px; --r-xl: 26px;

            /* Glass Engine Dynamic Tokens */
            --glass-blur: 24px;
            --glass-saturation: 1.3;
            --glass-opacity: 0.20;
            --glass-radius: 24px;
            --glass-border-alpha: 0.18;
            --glass-highlight-alpha: 0.34;
            --glass-shadow-y: 28px;
            --glass-shadow-blur: 60px;
            --glass-shadow-alpha: 0.26;
            --glass-tint: 255, 255, 255;
            --glass-depth: 56px;
            --glass-inner-glow: 0.22;
        }

        body {
            font-family: 'DM Sans', sans-serif;
            background-color: var(--bg);
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }

        iconify-icon { stroke-width: 1.5px; }

        /* Custom Range Slider */
        input[type=range] {
            -webkit-appearance: none;
            width: 100%;
            background: transparent;
            height: 20px;
            display: flex;
            align-items: center;
        }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 2px;
            background: rgba(255,255,255,0.1);
            border-radius: 2px;
            transition: background 0.2s;
        }
        input[type=range]:hover::-webkit-slider-runnable-track { background: rgba(255,255,255,0.2); }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 12px;
            width: 12px;
            border-radius: 50%;
            background: #fff;
            margin-top: -5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            cursor: pointer;
            transition: transform 0.1s;
        }
        input[type=range]:active::-webkit-slider-thumb { transform: scale(1.2); }

        /* Component States */
        .ui-btn {
            background: var(--surface);
            color: var(--text-2);
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ui-btn:hover { background: rgba(255,255,255,0.07); color: var(--text-1); transform: scale(1.02); }
        .ui-btn:active { transform: scale(0.96); }
        .ui-btn.active { background: var(--surface); color: var(--text-1); box-shadow: inset 0 1px 0 rgba(255,255,255,0.1); }
        
        .mode-btn { transition: all 0.2s ease; border: 1px solid transparent; }
        .mode-btn.active {
            border-color: rgba(255,255,255,0.15);
            background: rgba(255,255,255,0.05);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        /* Glass Rendering Engine */
        .glass-hero {
            position: relative;
            isolation: isolate;
            padding: 32px;
            border-radius: var(--glass-radius);
            border: 1px solid rgba(255,255,255, var(--glass-border-alpha));
            backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
            -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
            background:
                linear-gradient(135deg, rgba(255,255,255,var(--glass-highlight-alpha)), rgba(255,255,255,.04) 45%, rgba(255,255,255,.02) 100%),
                rgba(var(--glass-tint), var(--glass-opacity));
            box-shadow:
                0 var(--glass-shadow-y) var(--glass-shadow-blur) rgba(0,0,0,var(--glass-shadow-alpha)),
                inset 0 1px 0 rgba(255,255,255,.28),
                inset 0 -1px 0 rgba(255,255,255,.04);
            transition: all 0.3s ease;
        }

        /* Glass Modes */
        [data-glass-mode="liquid"] .glass-hero {
            background:
                radial-gradient(circle at 18% 20%, rgba(255,255,255,.38), transparent 22%),
                linear-gradient(135deg, rgba(255,255,255,.28), rgba(255,255,255,.02) 55%),
                rgba(var(--glass-tint), calc(var(--glass-opacity) * 0.92));
            box-shadow:
                0 var(--glass-shadow-y) var(--glass-shadow-blur) rgba(0,0,0,var(--glass-shadow-alpha)),
                inset 0 1px 0 rgba(255,255,255,.34),
                inset 0 -14px 30px rgba(255,255,255,.06);
        }
        [data-glass-mode="clay"] .glass-hero {
            backdrop-filter: blur(calc(var(--glass-blur) * 0.6)) saturate(1.08);
            background: linear-gradient(180deg, rgba(var(--glass-tint), calc(var(--glass-opacity) + 0.12)), rgba(255,255,255,0.04));
            box-shadow:
                0 calc(var(--glass-shadow-y) * 0.8) calc(var(--glass-shadow-blur) * 0.75) rgba(0,0,0,0.24),
                inset 0 2px 0 rgba(255,255,255,0.24),
                inset 0 -10px 20px rgba(0,0,0,0.06);
        }
        [data-glass-mode="neu"] .glass-hero {
            backdrop-filter: blur(calc(var(--glass-blur) * 0.28)) saturate(1.02);
            background: rgba(var(--glass-tint), calc(var(--glass-opacity) + 0.18));
            box-shadow:
                calc(var(--glass-depth) * -0.12) calc(var(--glass-depth) * -0.12) calc(var(--glass-depth) * 0.25) rgba(255,255,255,0.10),
                calc(var(--glass-depth) * 0.16) calc(var(--glass-depth) * 0.16) calc(var(--glass-depth) * 0.45) rgba(0,0,0,0.24);
        }
        [data-glass-mode="inner"] .glass-hero {
            box-shadow:
                inset 0 0 calc(var(--glass-shadow-blur) * 0.4) rgba(255,255,255,var(--glass-inner-glow)),
                inset 0 1px 0 rgba(255,255,255,0.26),
                0 calc(var(--glass-shadow-y) * 0.5) calc(var(--glass-shadow-blur) * 0.65) rgba(0,0,0,0.18);
        }

        /* Utilities */
        .gradient-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); }
        .prompt-bar-focused { border-color: rgba(255,255,255,0.15); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.05); }
        
        .toast { opacity: 0; transform: translateY(10px); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); pointer-events: none; }
        .toast.show { opacity: 1; transform: translateY(0); }
    </style>
</head>
<body class="text-zinc-300 h-screen w-screen overflow-hidden flex flex-col selection:bg-indigo-500/30 antialiased font-light" data-glass-mode="glass">

    <!-- Header -->
    <header class="h-14 flex-none border-b border-white/5 bg-white/[0.01] backdrop-blur-md flex items-center justify-between px-4 relative z-30">
        <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 group cursor-pointer">
                <div class="w-7 h-7 rounded-[var(--r-sm)] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                    <iconify-icon icon="solar:box-linear" class="text-base"></iconify-icon>
                </div>
                <span class="tracking-tighter font-medium text-sm text-zinc-100">ComponentSynth</span>
            </div>
            
            <div class="w-px h-4 bg-white/10"></div>
            
            <nav class="flex items-center text-[11px] font-light tracking-wide gap-0.5">
                <button class="px-2 py-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors">Library</button>
                <iconify-icon icon="solar:alt-arrow-right-linear" class="text-[10px] text-zinc-600"></iconify-icon>
                <button class="px-2 py-1 rounded text-zinc-100 cursor-default">Glass Engine</button>
            </nav>
        </div>

        <div class="flex items-center gap-3">
            <div class="flex bg-black/40 p-0.5 rounded-[var(--r-sm)] border border-white/5">
                <button class="ui-btn active px-3 py-1 rounded text-[11px] font-light">Design</button>
                <button class="ui-btn px-3 py-1 rounded text-[11px] font-light">Prototype</button>
            </div>
            <div class="w-px h-4 bg-white/10 mx-1"></div>
            <button class="w-7 h-7 flex items-center justify-center rounded-[var(--r-sm)] hover:bg-white/5 text-zinc-400 hover:text-zinc-100 transition-colors">
                <iconify-icon icon="solar:sun-linear" class="text-sm"></iconify-icon>
            </button>
            <button class="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 text-zinc-300 hover:border-white/20 transition-colors">
                <iconify-icon icon="solar:user-linear" class="text-xs"></iconify-icon>
            </button>
        </div>
    </header>

    <!-- Main Workspace -->
    <main class="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] min-h-0 relative z-10">
        
        <!-- Left Panel: Engine Controls -->
        <aside class="hidden lg:flex flex-col border-r border-white/5 bg-zinc-950/40 backdrop-blur-xl relative z-20">
            <div class="h-10 flex items-center justify-between px-4 border-b border-white/[0.03]">
                <span class="text-[10px] font-medium tracking-[0.08em] uppercase text-zinc-500">Glass Engine</span>
                <button class="text-zinc-500 hover:text-zinc-200 transition-colors" onclick="randomizeSettings()" title="Randomize">
                    <iconify-icon icon="solar:refresh-linear" class="text-xs"></iconify-icon>
                </button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
                
                <!-- Modes -->
                <div>
                    <span class="text-[10px] font-medium tracking-[0.06em] uppercase text-zinc-500 block mb-3">Render Mode</span>
                    <div class="grid grid-cols-2 gap-2">
                        <button class="mode-btn active p-2 rounded-[var(--r-sm)] bg-white/[0.02] text-left group" onclick="setMode('glass', this)">
                            <span class="block text-xs text-zinc-200 group-hover:text-white transition-colors">Glass</span>
                            <span class="block text-[10px] text-zinc-500 mt-0.5">Balanced</span>
                        </button>
                        <button class="mode-btn p-2 rounded-[var(--r-sm)] bg-white/[0.02] text-left group" onclick="setMode('liquid', this)">
                            <span class="block text-xs text-zinc-200 group-hover:text-white transition-colors">Liquid</span>
                            <span class="block text-[10px] text-zinc-500 mt-0.5">Glossy</span>
                        </button>
                        <button class="mode-btn p-2 rounded-[var(--r-sm)] bg-white/[0.02] text-left group" onclick="setMode('clay', this)">
                            <span class="block text-xs text-zinc-200 group-hover:text-white transition-colors">Clay</span>
                            <span class="block text-[10px] text-zinc-500 mt-0.5">Soft 3D</span>
                        </button>
                        <button class="mode-btn p-2 rounded-[var(--r-sm)] bg-white/[0.02] text-left group" onclick="setMode('neu', this)">
                            <span class="block text-xs text-zinc-200 group-hover:text-white transition-colors">Neu</span>
                            <span class="block text-[10px] text-zinc-500 mt-0.5">Ambient</span>
                        </button>
                    </div>
                </div>

                <div class="gradient-divider"></div>

                <!-- Core Properties -->
                <div>
                    <span class="text-[10px] font-medium tracking-[0.06em] uppercase text-zinc-500 block mb-3">Surface Properties</span>
                    <div class="flex flex-col gap-4">
                        <div class="group">
                            <div class="flex justify-between items-center mb-1">
                                <label class="text-[11px] text-zinc-400 group-hover:text-zinc-200 transition-colors">Blur Amount</label>
                                <span class="text-[10px] text-zinc-500 tabular-nums" id="val-blur">24px</span>
                            </div>
                            <input type="range" min="0" max="60" value="24" oninput="updateVar('--glass-blur', this.value + 'px', 'val-blur')">
                        </div>
                        <div class="group">
                            <div class="flex justify-between items-center mb-1">
                                <label class="text-[11px] text-zinc-400 group-hover:text-zinc-200 transition-colors">Opacity</label>
                                <span class="text-[10px] text-zinc-500 tabular-nums" id="val-opacity">0.20</span>
                            </div>
                            <input type="range" min="0" max="100" value="20" oninput="updateVar('--glass-opacity', this.value / 100, 'val-opacity')">
                        </div>
                        <div class="group">
                            <div class="flex justify-between items-center mb-1">
                                <label class="text-[11px] text-zinc-400 group-hover:text-zinc-200 transition-colors">Saturation</label>
                                <span class="text-[10px] text-zinc-500 tabular-nums" id="val-sat">1.3</span>
                            </div>
                            <input type="range" min="100" max="200" value="130" oninput="updateVar('--glass-saturation', this.value / 100, 'val-sat')">
                        </div>
                    </div>
                </div>

                <div class="gradient-divider"></div>

                <!-- Borders & Lighting -->
                <div>
                    <span class="text-[10px] font-medium tracking-[0.06em] uppercase text-zinc-500 block mb-3">Lighting &amp; Edges</span>
                    <div class="flex flex-col gap-4">
                        <div class="group">
                            <div class="flex justify-between items-center mb-1">
                                <label class="text-[11px] text-zinc-400 group-hover:text-zinc-200 transition-colors">Border Alpha</label>
                                <span class="text-[10px] text-zinc-500 tabular-nums" id="val-border">0.18</span>
                            </div>
                            <input type="range" min="0" max="50" value="18" oninput="updateVar('--glass-border-alpha', this.value / 100, 'val-border')">
                        </div>
                        <div class="group">
                            <div class="flex justify-between items-center mb-1">
                                <label class="text-[11px] text-zinc-400 group-hover:text-zinc-200 transition-colors">Shadow Spread</label>
                                <span class="text-[10px] text-zinc-500 tabular-nums" id="val-shadow">60px</span>
                            </div>
                            <input type="range" min="10" max="120" value="60" oninput="updateVar('--glass-shadow-blur', this.value + 'px', 'val-shadow')">
                        </div>
                        <div class="group">
                            <div class="flex justify-between items-center mb-1">
                                <label class="text-[11px] text-zinc-400 group-hover:text-zinc-200 transition-colors">Corner Radius</label>
                                <span class="text-[10px] text-zinc-500 tabular-nums" id="val-radius">24px</span>
                            </div>
                            <input type="range" min="8" max="48" value="24" oninput="updateVar('--glass-radius', this.value + 'px', 'val-radius')">
                        </div>
                    </div>
                </div>

            </div>
        </aside>

        <!-- Center Canvas -->
        <div class="relative flex items-center justify-center overflow-hidden bg-[#09090b] z-0">
            <!-- Grid Background -->
            <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none"></div>
            
            <!-- Ambient Glows -->
            <div class="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div class="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-sky-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            <!-- Topbar Meta -->
            <div class="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-black/40 backdrop-blur-md z-10 shadow-lg">
                <div class="flex items-center gap-1.5">
                    <div class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                    <span class="text-[10px] font-mono text-zinc-300">Live Preview</span>
                </div>
                <div class="w-px h-3 bg-white/10"></div>
                <span class="text-[10px] text-zinc-400 font-mono flex items-center gap-1"><iconify-icon icon="solar:monitor-linear"></iconify-icon> Desktop</span>
                <div class="w-px h-3 bg-white/10"></div>
                <span class="text-[10px] text-zinc-400 font-mono" id="canvasModeLabel">Mode: Glass</span>
            </div>

            <!-- The Glass Hero Component -->
            <div class="relative w-full max-w-[480px] z-10 px-6 transition-transform duration-300" id="previewWrap">
                <div class="glass-hero group">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                            <iconify-icon icon="solar:magic-stick-linear" class="text-xs text-indigo-300"></iconify-icon>
                            <span class="text-[10px] tracking-wide uppercase text-zinc-200">Glass Engine</span>
                        </div>
                        <span class="text-[10px] text-zinc-500 font-mono">v2.0</span>
                    </div>

                    <h2 class="text-3xl tracking-tight font-normal text-white leading-[1.1] mb-3">
                        Build elegant UI without a framework.
                    </h2>
                    
                    <p class="text-sm font-light text-zinc-400 leading-relaxed mb-8 max-w-[90%]">
                        Token-driven components, live preview, exportable CSS and just enough JavaScript to keep the system reactive.
                    </p>

                    <div class="flex items-center gap-3">
                        <button class="h-10 px-5 rounded-[var(--r-md)] bg-white/10 border border-white/10 text-white text-xs font-normal tracking-wide hover:bg-white/15 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg backdrop-blur-md">
                            Get Started
                            <iconify-icon icon="solar:arrow-right-linear" class="text-sm"></iconify-icon>
                        </button>
                        <button class="h-10 px-5 rounded-[var(--r-md)] bg-transparent border border-white/5 text-zinc-300 text-xs font-normal tracking-wide hover:bg-white/5 transition-all">
                            View Documentation
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Panel: Inspector -->
        <aside class="hidden lg:flex flex-col border-l border-white/5 bg-zinc-950/40 backdrop-blur-xl relative z-20">
            <div class="h-10 flex items-center justify-between px-4 border-b border-white/[0.03]">
                <span class="text-[10px] font-medium tracking-[0.08em] uppercase text-zinc-500">Inspector</span>
                <div class="flex gap-1">
                    <button class="w-6 h-6 flex items-center justify-center rounded hover:bg-white/5 text-zinc-500 hover:text-zinc-200 transition-colors" onclick="copyCode()" id="copyBtn" title="Copy CSS">
                        <iconify-icon icon="solar:copy-linear" class="text-xs"></iconify-icon>
                    </button>
                </div>
            </div>

            <div class="p-2 border-b border-white/[0.03]">
                <div class="flex bg-black/40 p-0.5 rounded-[var(--r-sm)] border border-white/5">
                    <button class="flex-1 ui-btn active py-1.5 rounded-[var(--r-sm)] text-[10px] font-light">CSS Extract</button>
                    <button class="flex-1 ui-btn py-1.5 rounded-[var(--r-sm)] text-[10px] font-light">JSON Config</button>
                </div>
            </div>

            <div class="flex-1 bg-[#050505] overflow-y-auto p-4 relative">
                <pre class="font-mono text-[10px] leading-relaxed text-zinc-400 whitespace-pre-wrap break-all" id="cssOutput"><span class="text-purple-400">.glass-hero</span> {
  <span class="text-blue-300">backdrop-filter</span>: <span class="text-emerald-300">blur</span>(<span id="out-blur">24px</span>) <span class="text-emerald-300">saturate</span>(<span id="out-sat">1.3</span>);
  <span class="text-blue-300">background</span>: 
    <span class="text-emerald-300">linear-gradient</span>(...),
    <span class="text-emerald-300">rgba</span>(<span id="out-tint">255,255,255</span>, <span id="out-opacity">0.20</span>);
  <span class="text-blue-300">border-radius</span>: <span id="out-radius">24px</span>;
  <span class="text-blue-300">border</span>: 1px solid <span class="text-emerald-300">rgba</span>(255,255,255, <span id="out-border">0.18</span>);
  <span class="text-blue-300">box-shadow</span>: 
    0 <span id="out-sy">28px</span> <span id="out-sblur">60px</span> <span class="text-emerald-300">rgba</span>(0,0,0, 0.26),
    inset 0 1px 0 <span class="text-emerald-300">rgba</span>(255,255,255,0.28);
}</pre>
            </div>
            
            <div class="p-4 border-t border-white/5 bg-white/[0.01]">
                <span class="text-[10px] font-medium tracking-[0.08em] uppercase text-zinc-500 block mb-3">Live Feedback</span>
                <div class="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/5">
                    <span class="text-[11px] text-zinc-400 flex items-center gap-1.5">
                        <iconify-icon icon="solar:bolt-linear" class="text-amber-400"></iconify-icon> Performance
                    </span>
                    <span class="text-[10px] font-mono text-emerald-400">Optimal</span>
                </div>
            </div>
        </aside>

        <!-- Prompt Bar (Floating) -->
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[800px] z-30">
            <div class="relative rounded-[var(--r-lg)] group">
                <!-- Ambient glow -->
                <div class="absolute -inset-2 bg-indigo-500/5 blur-xl rounded-[2rem] opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <div class="relative bg-[var(--modal-bg)] backdrop-blur-2xl border border-[var(--border)] rounded-[var(--r-lg)] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-300" id="promptBar">
                    
                    <!-- Input Row -->
                    <div class="flex items-center gap-2 px-3 py-2">
                        <button class="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:border-white/40 hover:bg-white/5 transition-all flex-shrink-0" title="Upload Asset">
                            <iconify-icon icon="solar:gallery-add-linear" class="text-sm"></iconify-icon>
                        </button>
                        
                        <div class="w-px h-5 bg-white/10 flex-shrink-0 mx-1"></div>

                        <div class="flex items-center gap-1.5 px-2 py-1 rounded-[var(--r-sm)] bg-[var(--surface)] border border-[var(--border)] flex-shrink-0 cursor-default">
                            <span class="text-indigo-400 font-medium text-[11px]">@</span>
                            <span class="text-[11px] text-zinc-300 font-light">component</span>
                        </div>

                        <input type="text" id="promptInput" class="flex-1 bg-transparent border-none outline-none text-[13px] font-light text-zinc-100 placeholder:text-zinc-600 px-2 min-w-0" placeholder="Describe component changes or paste theme config...">

                        <button class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--r-sm)] bg-[var(--surface)] border border-[var(--border)] hover:bg-white/5 transition-colors flex-shrink-0 group/model">
                            <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                            <span class="text-[11px] text-zinc-400 group-hover/model:text-zinc-200 transition-colors font-light">Synth AI</span>
                            <iconify-icon icon="solar:alt-arrow-down-linear" class="text-[10px] text-zinc-600"></iconify-icon>
                        </button>

                        <button id="submitBtn" class="h-8 px-4 rounded-[var(--r-md)] bg-zinc-100 text-zinc-900 text-xs font-normal tracking-wide flex items-center gap-1.5 transition-all hover:bg-white hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none disabled:hover:scale-100" disabled="">
                            <span id="submitLabel">Generate</span>
                            <iconify-icon id="submitIcon" icon="solar:round-arrow-right-linear" class="text-sm"></iconify-icon>
                        </button>
                    </div>

                    <div class="h-px bg-white/[0.05] mx-3"></div>

                    <!-- Tools Row -->
                    <div class="flex items-center justify-between px-3 py-2">
                        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                            <button class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.02] text-[10px] text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200 transition-colors whitespace-nowrap">
                                <iconify-icon icon="solar:sun-linear" class="text-xs"></iconify-icon> Theme Tokens
                            </button>
                            <button class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-transparent bg-transparent text-[10px] text-zinc-500 hover:border-white/10 hover:text-zinc-300 transition-colors whitespace-nowrap">
                                <iconify-icon icon="solar:history-linear" class="text-xs"></iconify-icon> History
                            </button>
                        </div>
                        <span id="charCount" class="text-[10px] font-mono text-zinc-600 flex-shrink-0 ml-2">0 / 500</span>
                    </div>
                </div>
            </div>
        </div>
        
    </main>

    <!-- Toast Notification -->
    <div id="toastNotif" class="toast fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-[var(--r-md)] bg-[var(--modal-bg)] border border-[var(--border)] shadow-xl backdrop-blur-xl">
        <iconify-icon icon="solar:check-circle-linear" class="text-emerald-400 text-sm"></iconify-icon>
        <span class="text-xs text-zinc-200 font-light" id="toastMsg">Action completed</span>
    </div>

    <script>
        const root = document.documentElement;
        const body = document.body;
        
        // CSS Output mapping
        const outMap = {
            '--glass-blur': 'out-blur',
            '--glass-opacity': 'out-opacity',
            '--glass-saturation': 'out-sat',
            '--glass-border-alpha': 'out-border',
            '--glass-shadow-blur': 'out-sblur',
            '--glass-radius': 'out-radius'
        };

        function showToast(msg) {
            const t = document.getElementById('toastNotif');
            document.getElementById('toastMsg').textContent = msg;
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 2000);
        }

        function updateVar(cssVar, val, outId) {
            root.style.setProperty(cssVar, val);
            if(outId) document.getElementById(outId).textContent = val;
        }

        function setMode(mode, btn) {
            body.setAttribute('data-glass-mode', mode);
            document.getElementById('canvasModeLabel').innerHTML = `Mode: <span class="capitalize">${mode}</span>`;
            
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            if(btn) btn.classList.add('active');
            
            showToast(`${mode.charAt(0).toUpperCase() + mode.slice(1)} mode applied`);
        }

        function randomizeSettings() {
            const rand = (min, max, isFloat = false) => {
                const v = Math.random() * (max - min) + min;
                return isFloat ? v.toFixed(2) : Math.floor(v);
            };

            const updates = [
                { id: 'val-blur', css: '--glass-blur', val: rand(10, 40) + 'px', inputVal: parseInt },
                { id: 'val-opacity', css: '--glass-opacity', val: rand(0.05, 0.4, true), inputVal: v => v * 100 },
                { id: 'val-sat', css: '--glass-saturation', val: rand(1.0, 1.8, true), inputVal: v => v * 100 },
                { id: 'val-radius', css: '--glass-radius', val: rand(12, 36) + 'px', inputVal: parseInt },
                { id: 'val-border', css: '--glass-border-alpha', val: rand(0.05, 0.3, true), inputVal: v => v * 100 }
            ];

            updates.forEach(u => {
                updateVar(u.css, u.val, u.id);
                // Find corresponding input
                const span = document.getElementById(u.id);
                const input = span.parentElement.nextElementSibling;
                if(input) input.value = u.inputVal(parseFloat(u.val));
            });

            const modes = ['glass', 'liquid', 'clay', 'neu'];
            const randomMode = modes[Math.floor(Math.random() * modes.length)];
            const modeBtns = document.querySelectorAll('.mode-btn');
            modeBtns.forEach(b => {
                if(b.textContent.toLowerCase().includes(randomMode)) {
                    setMode(randomMode, b);
                }
            });
        }

        function copyCode() {
            const btn = document.getElementById('copyBtn');
            const icon = btn.querySelector('iconify-icon');
            icon.setAttribute('icon', 'solar:check-read-linear');
            btn.classList.add('text-emerald-400');
            showToast('CSS Copied to clipboard');
            
            setTimeout(() => {
                icon.setAttribute('icon', 'solar:copy-linear');
                btn.classList.remove('text-emerald-400');
            }, 1500);
        }

        // Prompt Bar Logic
        const promptInput = document.getElementById('promptInput');
        const promptBar = document.getElementById('promptBar');
        const charCount = document.getElementById('charCount');
        const submitBtn = document.getElementById('submitBtn');

        promptInput.addEventListener('focus', () => promptBar.classList.add('prompt-bar-focused'));
        promptInput.addEventListener('blur', () => promptBar.classList.remove('prompt-bar-focused'));

        promptInput.addEventListener('input', (e) => {
            const len = e.target.value.length;
            charCount.textContent = `${len} / 500`;
            submitBtn.disabled = len === 0;
            if (len > 450) charCount.classList.add('text-amber-500');
            else charCount.classList.remove('text-amber-500');
        });

        submitBtn.addEventListener('click', () => {
            const icon = document.getElementById('submitIcon');
            const label = document.getElementById('submitLabel');
            
            submitBtn.disabled = true;
            icon.setAttribute('icon', 'solar:hourglass-linear');
            icon.classList.add('animate-spin');
            label.textContent = 'Working';
            
            setTimeout(() => {
                randomizeSettings();
                icon.setAttribute('icon', 'solar:round-arrow-right-linear');
                icon.classList.remove('animate-spin');
                label.textContent = 'Generate';
                promptInput.value = '';
                promptInput.dispatchEvent(new Event('input'));
            }, 1000);
        });
        
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && document.activeElement === promptInput && !submitBtn.disabled) {
                submitBtn.click();
            }
        });

    </script>

</body></html>Összeállítottam neked azt a professzionális Fejlesztési Promptot, amelyet közvetlenül átadhatsz a fejlesztőknek. Ez a dokumentum strukturáltan, technikai nyelven, mégis érthetően foglalja össze az összes elvárásodat, a "Toolbox" és a "Laboratory" megközelítést is beleértve.

Fejlesztési Prompt: Design System Builder v3.0 (Ultimate Edition)
Projekt célja:
Egy framework-mentes (Vanilla JS, CSS Variables), böngészőben futó Design System építő alkalmazás létrehozása, amely egyesíti a korábbi "Base" (precíziós) és "Merged Upgrade" (kreatív) verziók összes funkcióját. A rendszernek egyszerre kell kiszolgálnia a mérnöki precizitást (Toolbox) és a kreatív kísérletezést (Laboratory).

1. Architektúra és Technikai Elvárások
CSS Struktúra: Használjanak @layer alapú felosztást (reset, theme, base, layout, components, utilities).

Token-alapú rendszer: Minden vizuális paramétert CSS Custom Properties (--var) vezéreljen.

Reaktivitás: A JS kódnak minimálisnak és gyorsnak kell lennie; az inputok változtatásakor a CSS változókat kell frissítenie a :root-on.

Kódmentes export: Dinamikus CSS, JSON és Token generálás, amely másolható és fájlként is letölthető.

2. Komponens Motorok és Vezérlés
A rendszer három fő pillérre épüljön, dedikált vezérlőpanelekkel:

A) Multi-Mode Glass Engine (5 üzemmód):

Üzemmódok: Glassmorphism (standard), Liquid Glass (glossy), Claymorphism (soft 3D), Neumorphism (embossed), Inner Glow (ambient).

Vezérlők: Blur, Saturation, Opacity, Radius, Border Alpha, Shadow (Y, Blur, Alpha), Tint (RGB), és az extra Refraction (fénytörés) valamint Depth (mélység) csúszkák.

B) Button Engine:

Vezérlők: Padding (X/Y), Radius, Font Size, BG/Border Alpha, Hover Lift effektus, Shadow Intensity és RGB Tint.

C) Card Engine:

Vezérlők: Density (Padding, Gap), Radius, Opacity, Border Alpha és komplex árnyékkezelés.

3. Speciális Funkciók (The Laboratory)
Az eszköznek tartalmaznia kell a kreatív munkafolyamatot támogató modulokat:

Randomizer: Egy kattintásra véletlenszerű, de esztétikus stílus generálása (szín, mód, blur).

Combinator (Mixer): Két meglévő preset tulajdonságainak intelligens ötvözése.

Gallery Snapshot System: A session során készített pillanatképek mentése a sidebarba, azonnali visszatöltési lehetőséggel.

Interaktív Preview: A fő komponens legyen "draggable" (húzható), hogy különböző háttérszínek/minták előtt is tesztelhető legyen a transzparencia.

Background Switcher: Legalább 4-5 különböző gradiens háttér közötti váltás lehetősége.

4. UI/UX és Workflow
Kettős Workflow támogatása:

Mérnöki mód: Gyors presetek (Frosted, Aurora, Pearl, Obsidian) és fix kód-export a gyors implementációhoz.

Kísérleti mód: Finomhangolt csúszkák, mód-váltók és vizuális effektek.

Preview Mode: "Dashboard" (összesített) és egyéni komponens fókuszú nézetek.

Vizuális visszajelzés: Toast értesítések minden sikeres akcióról (Mentés, Másolás, Reset).

Reszponzív felület: A buildernek asztali gépen és mobilon is kezelhetőnek kell maradnia.

5. Elvárt kimenet
Egyetlen, tiszta HTML fájl, amely tartalmazza a beágyazott CSS-t és JS-t.

Framework-mentes megvalósítás (nem kérünk React-ot vagy Tailwind-et, csak tiszta modern web-technológiát).

Magas szintű kommentelés a kódban a későbbi bővíthetőség érdekében.

Instrukció a fejlesztőnek:
"A cél egy olyan eszköz, ami banki szoftverek precíz gombjainak és kreatív ügynökségek extravagáns üveg-felületeinek tervezésére is alkalmas. A kód legyen moduláris és a CSS változókra épüljön."
