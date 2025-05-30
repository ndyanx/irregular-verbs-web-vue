<template>
  <header class="header">
    <!-- Navbar para desktop -->
    <div class="navbar-desktop">
      <router-link to="/" class="logo-container">
        <div class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z"></path>
              <path d="M12 22V12"></path>
              <path d="M9 10l3-3 3 3"></path>
            </svg>
          </div>
          <span class="logo-text">ICPNX</span>
        </div>
      </router-link>

      <div class="quiz-button-container">
        <div class="dropdown" :class="{ open: dropdownOpen }">
          <button 
            id="quiz-button" 
            class="quiz-btn-with-text" 
            aria-label="Abrir juego de verbos"
            @click="toggleDropdown"
          >
            <span class="quiz-btn-text">Practicar</span>
            <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div v-if="dropdownOpen" class="dropdown-menu">
            <button @click="openQuiz('classic')">Juego Clásico</button>
            <button @click="openQuiz('match')">Emparejar Verbos</button>
            <button @click="openQuiz('race')">Carrera de Verbos</button>
          </div>
        </div>
      </div>

      <div class="controls-container">
        <button 
          id="toggle-sound" 
          class="vt-switch vt-switch-sound" 
          type="button" 
          role="switch" 
          aria-label="Alternar sonido"
          @click="toggleSound"
          :class="{ active: soundEnabled }"
        >
          <span class="vt-switch-check">
            <span class="vt-switch-icon">
              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" viewBox="0 0 24 24" class="vt-switch-sound-off">
                <path d="M3 12v4a2 2 0 0 0 2 2h3l5 4V5l-5 4H5a2 2 0 0 0-2 2z"></path>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" viewBox="0 0 24 24" class="vt-switch-sound-on">
                <path d="M3 12v4a2 2 0 0 0 2 2h3l5 4V5l-5 4H5a2 2 0 0 0-2 2z"></path>
              </svg>
            </span>
          </span>
        </button>

        <button 
          id="toggle-mode" 
          class="vt-switch vt-switch-appearance" 
          type="button" 
          role="switch" 
          aria-label="Alternar modo oscuro"
          @click="toggleDarkMode"
          :class="{ active: darkMode }"
        >
          <span class="vt-switch-check">
            <span class="vt-switch-icon">
              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" viewBox="0 0 24 24" class="vt-switch-appearance-sun">
                <path d="M12,18c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6S15.3,18,12,18zM12,8c-2.2,0-4,1.8-4,4c0,2.2,1.8,4,4,4c2.2,0,4-1.8,4-4C16,9.8,14.2,8,12,8z"></path>
                <path d="M12,4c-0.6,0-1-0.4-1-1V1c0-0.6,0.4-1,1-1s1,0.4,1,1v2C13,3.6,12.6,4,12,4z"></path>
                <path d="M12,24c-0.6,0-1-0.4-1-1v-2c0-0.6,0.4-1,1-1s1,0.4,1,1v2C13,23.6,12.6,24,12,24z"></path>
                <path d="M5.6,6.6c-0.3,0-0.5-0.1-0.7-0.3L3.5,4.9c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l1.4,1.4c0.4,0.4,0.4,1,0,1.4C6.2,6.5,5.9,6.6,5.6,6.6z"></path>
                <path d="M19.8,20.8c-0.3,0-0.5-0.1-0.7-0.3l-1.4-1.4c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l1.4,1.4c0.4,0.4,0.4,1,0,1.4C20.3,20.7,20,20.8,19.8,20.8z"></path>
                <path d="M3,13H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h2c0.6,0,1,0.4,1,1S3.6,13,3,13z"></path>
                <path d="M23,13h-2c-0.6,0-1-0.4-1-1s0.4-1,1-1h2c0.6,0,1,0.4,1,1S23.6,13,23,13z"></path>
                <path d="M4.2,20.8c-0.3,0-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l1.4-1.4c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-1.4,1.4C4.7,20.7,4.5,20.8,4.2,20.8z"></path>
                <path d="M18.4,6.6c-0.3,0-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l1.4-1.4c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-1.4,1.4C18.9,6.5,18.6,6.6,18.4,6.6z"></path>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" viewBox="0 0 24 24" class="vt-switch-appearance-moon">
                <path d="M12.1,22c-0.3,0-0.6,0-0.9,0c-5.5-0.5-9.5-5.4-9-10.9c0.4-4.8,4.2-8.6,9-9c0.4,0,0.8,0.2,1,0.5c0.2,0.3,0.2,0.8-0.1,1.1c-2,2.7-1.4,6.4,1.3,8.4c2.1,1.6,5,1.6,7.1,0c0.3-0.2,0.7-0.3,1.1-0.1c0.3,0.2,0.5,0.6,0.5,1c-0.2,2.7-1.5,5.1-3.6,6.8C16.6,21.2,14.4,22,12.1,22zM9.3,4.4c-2.9,1-5,3.6-5.2,6.8c-0.4,4.4,2.8,8.3,7.2,8.7c2.1,0.2,4.2-0.4,5.8-1.8c1.1-0.9,1.9-2.1,2.4-3.4c-2.5,0.9-5.3,0.5-7.5-1.1C9.2,11.4,8.1,7.7,9.3,4.4z"></path>
              </svg>
            </span>
          </span>
        </button>
      </div>
    </div>

    <!-- Navbar para móvil -->
    <div class="navbar-mobile">
      <a href="/" class="logo-container">
        <div class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z"></path>
              <path d="M12 22V12"></path>
              <path d="M9 10l3-3 3 3"></path>
            </svg>
          </div>
          <span class="logo-text">ICPNX</span>
        </div>
      </a>

      <div class="quiz-button-container">
        <div class="dropdown" :class="{ open: dropdownOpen }">
          <button 
            id="quiz-button" 
            class="quiz-btn-with-text" 
            aria-label="Abrir juego de verbos"
            @click="toggleDropdown"
          >
            <span class="quiz-btn-text">Practicar</span>
            <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div v-if="dropdownOpen" class="dropdown-menu">
            <button @click="openQuiz('classic')">Juego Clásico</button>
            <button @click="openQuiz('match')">Emparejar Verbos</button>
            <button @click="openQuiz('race')">Carrera de Verbos</button>
          </div>
        </div>
      </div>

      <button class="mobile-menu-toggle" @click="toggleMobileMenu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12h18"></path>
          <path d="M3 6h18"></path>
          <path d="M3 18h18"></path>
        </svg>
      </button>

      <!-- En la sección del template (navbar-mobile) - Agrega este botón de cierre -->
      <div class="mobile-menu" :class="{ open: mobileMenuOpen }">
        <button class="mobile-menu-close" @click="toggleMobileMenu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18"></path>
            <path d="M6 6l12 12"></path>
          </svg>
        </button>

        <div class="mobile-menu-content">
                  <div class="mobile-control-item">
          <span class="mobile-control-label">Sonido</span>
          <button 
            id="toggle-sound-mobile" 
            class="vt-switch vt-switch-sound" 
            type="button" 
            role="switch" 
            aria-label="Alternar sonido"
            @click="toggleSound"
            :class="{ active: soundEnabled }"
          >
            <span class="vt-switch-check">
              <span class="vt-switch-icon">
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" viewBox="0 0 24 24" class="vt-switch-sound-off">
                  <path d="M3 12v4a2 2 0 0 0 2 2h3l5 4V5l-5 4H5a2 2 0 0 0-2 2z"></path>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" viewBox="0 0 24 24" class="vt-switch-sound-on">
                  <path d="M3 12v4a2 2 0 0 0 2 2h3l5 4V5l-5 4H5a2 2 0 0 0-2 2z"></path>
                </svg>
              </span>
            </span>
          </button>
        </div>

        <div class="mobile-control-item">
          <span class="mobile-control-label">Apariencia</span>
          <button 
            id="toggle-mode-mobile" 
            class="vt-switch vt-switch-appearance" 
            type="button" 
            role="switch" 
            aria-label="Alternar modo oscuro"
            @click="toggleDarkMode"
            :class="{ active: darkMode }"
          >
            <span class="vt-switch-check">
              <span class="vt-switch-icon">
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" viewBox="0 0 24 24" class="vt-switch-appearance-sun">
                  <path d="M12,18c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6S15.3,18,12,18zM12,8c-2.2,0-4,1.8-4,4c0,2.2,1.8,4,4,4c2.2,0,4-1.8,4-4C16,9.8,14.2,8,12,8z"></path>
                  <path d="M12,4c-0.6,0-1-0.4-1-1V1c0-0.6,0.4-1,1-1s1,0.4,1,1v2C13,3.6,12.6,4,12,4z"></path>
                  <path d="M12,24c-0.6,0-1-0.4-1-1v-2c0-0.6,0.4-1,1-1s1,0.4,1,1v2C13,23.6,12.6,24,12,24z"></path>
                  <path d="M5.6,6.6c-0.3,0-0.5-0.1-0.7-0.3L3.5,4.9c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l1.4,1.4c0.4,0.4,0.4,1,0,1.4C6.2,6.5,5.9,6.6,5.6,6.6z"></path>
                  <path d="M19.8,20.8c-0.3,0-0.5-0.1-0.7-0.3l-1.4-1.4c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l1.4,1.4c0.4,0.4,0.4,1,0,1.4C20.3,20.7,20,20.8,19.8,20.8z"></path>
                  <path d="M3,13H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h2c0.6,0,1,0.4,1,1S3.6,13,3,13z"></path>
                  <path d="M23,13h-2c-0.6,0-1-0.4-1-1s0.4-1,1-1h2c0.6,0,1,0.4,1,1S23.6,13,23,13z"></path>
                  <path d="M4.2,20.8c-0.3,0-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l1.4-1.4c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-1.4,1.4C4.7,20.7,4.5,20.8,4.2,20.8z"></path>
                  <path d="M18.4,6.6c-0.3,0-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l1.4-1.4c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-1.4,1.4C18.9,6.5,18.6,6.6,18.4,6.6z"></path>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" viewBox="0 0 24 24" class="vt-switch-appearance-moon">
                  <path d="M12.1,22c-0.3,0-0.6,0-0.9,0c-5.5-0.5-9.5-5.4-9-10.9c0.4-4.8,4.2-8.6,9-9c0.4,0,0.8,0.2,1,0.5c0.2,0.3,0.2,0.8-0.1,1.1c-2,2.7-1.4,6.4,1.3,8.4c2.1,1.6,5,1.6,7.1,0c0.3-0.2,0.7-0.3,1.1-0.1c0.3,0.2,0.5,0.6,0.5,1c-0.2,2.7-1.5,5.1-3.6,6.8C16.6,21.2,14.4,22,12.1,22zM9.3,4.4c-2.9,1-5,3.6-5.2,6.8c-0.4,4.4,2.8,8.3,7.2,8.7c2.1,0.2,4.2-0.4,5.8-1.8c1.1-0.9,1.9-2.1,2.4-3.4c-2.5,0.9-5.3,0.5-7.5-1.1C9.2,11.4,8.1,7.7,9.3,4.4z"></path>
                </svg>
              </span>
            </span>
          </button>
        </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'NavBar',
  props: {
    soundEnabled: {
      type: Boolean,
      default: false
    },
    darkMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dropdownOpen: false,
      mobileMenuOpen: false
    }
  },
  methods: {
    toggleSound() {
      this.$emit('toggle-sound')
    },
    toggleDarkMode() {
      this.$emit('toggle-dark-mode')
    },
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen
    },
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
    },
    openQuiz(type) {
      this.dropdownOpen = false
      this.mobileMenuOpen = false
      this.$emit('open-quiz', type)
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.dropdownOpen = false
      }
    },
    closeMobileMenuOnResize() {
      if (window.innerWidth > 768) {
        this.mobileMenuOpen = false
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
    window.addEventListener('resize', this.closeMobileMenuOnResize)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    window.removeEventListener('resize', this.closeMobileMenuOnResize)
  }
}
</script>

<style>
:root {
  --header-height: 70px;
  --bg: #ffffff;
  --text: #213547;
  --primary: #4361ee;
  --card: #ffffff;
  --border: rgba(60, 60, 67, 0.12);
  --neon-green: #39ff14;
  --control-item-bg: #f8f8f8;
}

.dark-mode {
  --bg: #1a1a1a;
  --text: rgba(255, 255, 255, 0.87);
  --card: #242424;
  --border: rgba(84, 84, 88, 0.48);
  --control-item-bg: #333333;
}

/* Estructura base */
.header {
  width: 100%;
  height: var(--header-height);
  background-color: var(--bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  position: relative;
}

.dark-mode .header {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Layouts de navegación */
.navbar-desktop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 24px;
  max-width: 1440px;
  margin: 0 auto;
}

.navbar-mobile {
  display: none;
  height: 100%;
  padding: 0 16px;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

/* Logo */
.logo-container {
  text-decoration: none;
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-right: 16px;
}

.logo:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.logo-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: white;
  padding: 6px;
}

.logo-icon svg {
  width: 20px;
  height: 20px;
}

.logo-text {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: var(--text);
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, #4361ee, #f72585);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Botón Practicar y dropdown */
.quiz-button-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.quiz-btn-with-text {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 30px;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  background: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.quiz-btn-with-text::before {
  content: '';
  position: absolute;
  inset: -1.5px;
  background: linear-gradient(270deg, #f72585, #7209b7, #3a0ca3, #4361ee, #4cc9f0, #4895ef);
  background-size: 400% 400%;
  border-radius: 33px;
  animation: gradientBorder 6s ease infinite;
  z-index: -1;
}

.quiz-btn-with-text::after {
  content: '';
  position: absolute;
  inset: 0;
  background: inherit;
  border-radius: 30px;
  z-index: -1;
}

.quiz-btn-with-text:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.quiz-btn-with-text .quiz-btn-text {
  background: linear-gradient(270deg, #f72585, #7209b7, #3a0ca3, #4361ee, #4cc9f0, #4895ef);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientBorder 6s ease infinite;
}

.quiz-btn-with-text svg {
  stroke: #f72585;
  fill: none;
}

.quiz-btn-with-text:active {
  transform: translateY(0) scale(0.98);
}

.dark-mode .quiz-btn-with-text {
  background: #000000;
}

.dark-mode .quiz-btn-with-text::after {
  background: #000000;
}

@keyframes gradientBorder {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.quiz-btn-text {
  white-space: nowrap;
}

.dropdown-arrow {
  margin-left: 6px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown.open .dropdown-arrow {
  transform: rotate(180deg);
}

/* Menú desplegable */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--card);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 110;
  width: 180px;
  overflow: hidden;
  margin-top: 8px;
  animation: dropdownSlide 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark-mode .dropdown-menu {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.dropdown-menu button {
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  position: relative;
}

.dropdown-menu button:focus {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

.dropdown-menu button::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: var(--primary);
  transform: scaleX(0);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-menu button:hover::before {
  transform: scaleX(1);
}

.dropdown-menu button:hover {
  background-color: rgba(67, 97, 238, 0.1);
  color: var(--primary);
  padding-left: 20px;
}

/* Controles (sonido y modo oscuro) */
.controls-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Switches */
.vt-switch {
  position: relative;
  border-radius: 11px;
  display: block;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
  border: 1px solid var(--border);
  transition: border-color 0.25s, background-color 0.25s;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.1);
}

.vt-switch:hover {
  border-color: #a7a4a4;
}

.vt-switch-check {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: transform 0.25s;
}

.vt-switch.active .vt-switch-check {
  transform: translateX(18px);
}

.vt-switch-icon {
  position: relative;
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  overflow: hidden;
}

.vt-switch-icon svg {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 12px;
  height: 12px;
  color: #666;
  fill: currentColor;
  transition: opacity 0.25s;
}

/* Modo oscuro para switches */
.dark-mode .vt-switch {
  background-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .vt-switch-check {
  background-color: black;
}

.dark-mode .vt-switch-icon svg {
  color: white;
}

/* Estados de iconos */
.vt-switch-sound-off,
.vt-switch-sound-on,
.vt-switch-appearance-sun,
.vt-switch-appearance-moon {
  transition: opacity 0.25s;
}

.vt-switch-sound-on,
.vt-switch-appearance-moon {
  opacity: 0;
}

.vt-switch.active .vt-switch-sound-off,
.vt-switch.active .vt-switch-appearance-sun {
  opacity: 0;
}

.vt-switch.active .vt-switch-sound-on,
.vt-switch.active .vt-switch-appearance-moon {
  opacity: 1;
}

.vt-switch-sound.active .vt-switch-sound-on {
  color: var(--neon-green);
}

/* Menú móvil */
.mobile-menu-toggle {
  background: none;
  border: none;
  color: var(--text);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.mobile-menu-toggle:hover {
  background-color: rgba(67, 97, 238, 0.1);
}

.mobile-menu-toggle svg {
  stroke: currentColor;
}

.mobile-menu {
  position: fixed;
  top: 5px;
  right: -100%;
  width: 220px;
  background-color: var(--card);
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  transition: right 0.3s ease;
  z-index: 999;
  padding: 20px;
  overflow-y: auto;
}

.mobile-menu.open {
  right: 0;
}

.mobile-menu-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: var(--text);
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.mobile-menu-close:hover {
  background-color: rgba(67, 97, 238, 0.1);
}

.mobile-menu-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 25px;
}

/* Elementos de control móvil - CON EL CAMBIO SOLICITADO */
.mobile-control-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: var(--control-item-bg);
  transition: all 0.3s ease;
}

.dark-mode .mobile-control-item {
  background-color: #444444;
}

.mobile-control-label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-desktop {
    display: none;
  }
  
  .navbar-mobile {
    display: flex;
  }
  
  .logo-icon {
    width: 32px;
    height: 32px;
  }
  
  .logo-text {
    font-size: 16px;
  }
  
  .quiz-btn-with-text {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .dropdown-menu {
    width: 160px;
  }
  
  .dropdown-menu button {
    padding: 10px 14px;
    font-size: 13px;
  }

  .mobile-menu {
    width: 200px;
    padding: 20px 15px;
  }
  
  .dropdown-menu button:hover {
    padding-left: 18px;
  }
}

@media (min-width: 769px) {
  .mobile-menu {
    display: none;
  }
}

/* Accesibilidad */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>