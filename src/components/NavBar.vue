<template>
    <header class="header">
        <div class="header-inner">
            <router-link to="/" class="logo-container">
                <span class="logo-icon" aria-hidden="true">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z"></path>
                        <path d="M12 22V12"></path>
                        <path d="M9 10l3-3 3 3"></path>
                    </svg>
                </span>
                <span class="logo-text">ICPNX</span>
            </router-link>

            <div
                class="quiz-button-container"
                v-if="!$route.path.startsWith('/text')"
            >
                <div class="dropdown" :class="{ open: dropdownOpen }">
                    <button
                        id="quiz-button"
                        class="quiz-btn"
                        aria-label="Abrir juego de verbos"
                        :aria-expanded="dropdownOpen"
                        @click="toggleDropdown"
                    >
                        <span>Practicar</span>
                        <svg
                            class="dropdown-arrow"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            aria-hidden="true"
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    <div v-if="dropdownOpen" class="dropdown-menu" role="menu">
                        <button role="menuitem" @click="openQuiz('classic')">
                            Juego clásico
                        </button>
                        <button role="menuitem" @click="openQuiz('match')">
                            Emparejar verbos
                        </button>
                        <button role="menuitem" @click="openQuiz('race')">
                            Carrera de verbos
                        </button>
                    </div>
                </div>
            </div>

            <div class="controls-container">
                <button
                    v-if="$route.path === '/verbs'"
                    id="toggle-sound"
                    class="vt-switch"
                    type="button"
                    role="switch"
                    :aria-checked="settingsStore.soundEnabled"
                    aria-label="Alternar sonido"
                    @click="toggleSound"
                    :class="{ active: settingsStore.soundEnabled }"
                >
                    <span class="vt-switch-check">
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            aria-hidden="true"
                        >
                            <path
                                d="M3 9v6a2 2 0 0 0 2 2h3l5 4V3l-5 4H5a2 2 0 0 0-2 2z"
                            ></path>
                            <path
                                v-if="settingsStore.soundEnabled"
                                d="M16 12a4.5 4.5 0 0 0-1.5-3.37"
                            ></path>
                            <path
                                v-if="settingsStore.soundEnabled"
                                d="M18.5 12a7 7 0 0 0-2.33-5.19"
                            ></path>
                            <line v-else x1="22" y1="2" x2="2" y2="22"></line>
                        </svg>
                    </span>
                </button>

                <button
                    class="mobile-menu-toggle"
                    @click="toggleMobileMenu"
                    aria-label="Abrir menú"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                    >
                        <path d="M3 12h18"></path>
                        <path d="M3 6h18"></path>
                        <path d="M3 18h18"></path>
                    </svg>
                </button>
            </div>
        </div>

        <div class="mobile-menu" :class="{ open: mobileMenuOpen }">
            <div class="mobile-menu-header">
                <span class="mobile-menu-title">Menú</span>
                <button
                    class="mobile-menu-close"
                    @click="toggleMobileMenu"
                    aria-label="Cerrar menú"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                    >
                        <path d="M18 6L6 18"></path>
                        <path d="M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <nav class="mobile-menu-links">
                <router-link to="/" @click="toggleMobileMenu"
                    >Inicio</router-link
                >
                <router-link to="/verbs" @click="toggleMobileMenu"
                    >Tabla de verbos</router-link
                >
                <router-link to="/word" @click="toggleMobileMenu"
                    >Buscar palabra</router-link
                >
                <router-link to="/text" @click="toggleMobileMenu"
                    >Texto interactivo</router-link
                >
            </nav>

            <div
                class="mobile-menu-section"
                v-if="!$route.path.startsWith('/text')"
            >
                <span class="mobile-menu-section-label">Practicar</span>
                <nav class="mobile-menu-links">
                    <button @click="openQuiz('classic')">Juego clásico</button>
                    <button @click="openQuiz('match')">Emparejar verbos</button>
                    <button @click="openQuiz('race')">Carrera de verbos</button>
                </nav>
            </div>

            <div class="mobile-control-item" v-if="$route.path === '/verbs'">
                <span class="mobile-control-label">Sonido</span>
                <button
                    class="vt-switch"
                    type="button"
                    role="switch"
                    :aria-checked="settingsStore.soundEnabled"
                    aria-label="Alternar sonido"
                    @click="toggleSound"
                    :class="{ active: settingsStore.soundEnabled }"
                >
                    <span class="vt-switch-check">
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            aria-hidden="true"
                        >
                            <path
                                d="M3 9v6a2 2 0 0 0 2 2h3l5 4V3l-5 4H5a2 2 0 0 0-2 2z"
                            ></path>
                            <line
                                v-if="!settingsStore.soundEnabled"
                                x1="22"
                                y1="2"
                                x2="2"
                                y2="22"
                            ></line>
                        </svg>
                    </span>
                </button>
            </div>
        </div>
        <div
            v-if="mobileMenuOpen"
            class="mobile-menu-backdrop"
            @click="toggleMobileMenu"
        ></div>
    </header>
</template>

<script>
import { useSettingsStore } from "@/stores/settings";

export default {
    name: "NavBar",
    setup() {
        const settingsStore = useSettingsStore();
        return { settingsStore };
    },
    data() {
        return {
            dropdownOpen: false,
            mobileMenuOpen: false,
        };
    },
    methods: {
        toggleSound() {
            this.settingsStore.toggleSound();
        },
        toggleDropdown() {
            this.dropdownOpen = !this.dropdownOpen;
        },
        toggleMobileMenu() {
            this.mobileMenuOpen = !this.mobileMenuOpen;
        },
        openQuiz(type) {
            this.dropdownOpen = false;
            this.mobileMenuOpen = false;
            this.$emit("open-quiz", type);
        },
        handleClickOutside(event) {
            if (!this.$el.contains(event.target)) {
                this.dropdownOpen = false;
            }
        },
        closeMobileMenuOnResize() {
            if (window.innerWidth > 768) {
                this.mobileMenuOpen = false;
            }
        },
    },
    mounted() {
        document.addEventListener("click", this.handleClickOutside);
        window.addEventListener("resize", this.closeMobileMenuOnResize);
    },
    beforeUnmount() {
        document.removeEventListener("click", this.handleClickOutside);
        window.removeEventListener("resize", this.closeMobileMenuOnResize);
    },
};
</script>

<style>
/* Variables globales en assets/styles.css */

.header {
    width: 100%;
    height: var(--header-height);
    background-color: var(--surface);
    border-bottom: 1px solid var(--line);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.header-inner {
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 16px;
}

.logo-container {
    grid-column: 1;
    justify-self: start;
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: var(--ink);
}

.logo-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    background: var(--accent-soft);
    color: var(--accent);
}

.logo-icon svg {
    width: 18px;
    height: 18px;
}

.logo-text {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 17px;
    letter-spacing: 0.02em;
    color: var(--ink);
}

/* Dropdown "Practicar" */
.quiz-button-container {
    grid-column: 2;
    justify-self: center;
    position: relative;
}

.quiz-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 9px 16px;
    border-radius: 999px;
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--ink);
    font-family: var(--font-body);
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: var(--transition);
}

.quiz-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
}

.dropdown.open .dropdown-arrow {
    transform: rotate(180deg);
}

.dropdown-arrow {
    transition: transform 0.2s ease;
}

.dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 6px;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    z-index: 1100;
}

.dropdown-menu button {
    text-align: left;
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    border: none;
    background: none;
    color: var(--ink);
    font-family: var(--font-body);
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.15s ease;
}

.dropdown-menu button:hover {
    background: var(--accent-soft);
    color: var(--accent-dark);
}

/* Controles */
.controls-container {
    grid-column: 3;
    justify-self: end;
    display: flex;
    align-items: center;
    gap: 10px;
}

.vt-switch {
    position: relative;
    width: 44px;
    height: 24px;
    border-radius: 999px;
    border: none;
    background: var(--line);
    cursor: pointer;
    transition: background-color 0.2s ease;
    flex-shrink: 0;
}

.vt-switch.active {
    background: var(--accent);
}

.vt-switch-check {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--surface);
    box-shadow: var(--shadow-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ink-soft);
    transition: transform 0.2s ease;
}

.vt-switch.active .vt-switch-check {
    transform: translateX(20px);
    color: var(--accent);
}

.mobile-menu-toggle {
    display: none;
    background: none;
    border: none;
    color: var(--ink);
    width: 38px;
    height: 38px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: var(--radius-sm);
}

.mobile-menu-toggle:hover {
    background-color: var(--accent-soft);
}

/* Menú móvil: un solo bloque de markup, mostrado por CSS */
.mobile-menu-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(28, 29, 31, 0.35);
    z-index: 998;
}

.mobile-menu {
    position: fixed;
    top: 0;
    right: -280px;
    width: 260px;
    height: 100%;
    background-color: var(--surface);
    box-shadow: var(--shadow-lg);
    transition: right 0.25s ease;
    z-index: 999;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.mobile-menu.open {
    right: 0;
}

.mobile-menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.mobile-menu-title {
    font-family: var(--font-display);
    font-weight: 600;
    color: var(--ink);
}

.mobile-menu-close {
    background: none;
    border: none;
    color: var(--ink-soft);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 50%;
}

.mobile-menu-close:hover {
    background-color: var(--accent-soft);
    color: var(--accent);
}

.mobile-menu-links {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.mobile-menu-links a,
.mobile-menu-links button {
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    color: var(--ink);
    text-decoration: none;
    font-weight: 500;
    font-size: 15px;
    background: none;
    border: none;
    text-align: left;
    font-family: var(--font-body);
    cursor: pointer;
    width: 100%;
}

.mobile-menu-links a:hover,
.mobile-menu-links a.router-link-active,
.mobile-menu-links button:hover {
    background: var(--accent-soft);
    color: var(--accent-dark);
}

.mobile-menu-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid var(--line);
}

.mobile-menu-section-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--ink-faint);
    padding: 0 12px;
}

.mobile-control-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-radius: var(--radius-sm);
    background-color: var(--paper);
    border: 1px solid var(--line);
}

.mobile-control-label {
    font-size: 14px;
    color: var(--ink);
    font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
    .quiz-button-container {
        display: none;
    }

    .mobile-menu-toggle {
        display: flex;
    }
}

@media (min-width: 769px) {
    .mobile-menu,
    .mobile-menu-backdrop {
        display: none;
    }
}
</style>
