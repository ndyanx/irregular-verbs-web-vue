<template>
  <header class="header">
    <div class="fixed-controls">
      <button 
        id="toggle-sound" 
        class="icon-btn sound-btn" 
        aria-label="Alternar sonido"
        @click="toggleSound"
        :class="{ active: soundEnabled }"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2">
          <path class="sound-icon" d="M3 12v4a2 2 0 0 0 2 2h3l5 4V5l-5 4H5a2 2 0 0 0-2 2z"></path>
          <path class="sound-wave wave-1" d="M15 18a4 4 0 0 0 0-8"></path>
          <path class="sound-wave wave-2" d="M15 22a8 8 0 0 0 0-16"></path>
        </svg>
      </button>
      <button 
        id="toggle-mode" 
        class="icon-btn mode-btn" 
        aria-label="Alternar modo oscuro"
        @click="toggleDarkMode"
        :class="{ active: darkMode }"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2">
          <path class="moon-icon" d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"></path>
        </svg>
      </button>
    </div>
    <div class="quiz-button-container">
      <div class="dropdown" :class="{ open: dropdownOpen }">
        <button 
          id="quiz-button" 
          class="quiz-btn-with-text" 
          aria-label="Abrir juego de verbos"
          @click="toggleDropdown"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
          </svg>
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
  </header>
</template>

<script>
export default {
  name: 'NavBar',
  props: {
    soundEnabled: Boolean,
    darkMode: Boolean
  },
  data() {
    return {
      dropdownOpen: false
    }
  },
  methods: {
    toggleSound() {
      this.$emit('toggle-sound');
    },
    toggleDarkMode() {
      this.$emit('toggle-dark-mode');
    },
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },
    openQuiz(type) {
      this.dropdownOpen = false;
      this.$emit('open-quiz', type);
    }
  }
}
</script>

<style scoped>
/* ============ CONTROLES FIJOS MEJORADOS ============ */
.fixed-controls {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
  z-index: 100;
}

.icon-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  background-color: var(--card);
}

/* Botón de sonido */
.sound-btn .sound-icon {
  stroke: #f72585;
  transition: all 0.3s ease;
}

.sound-btn .sound-wave {
  stroke: #f72585;
  opacity: 0;
  transition: all 0.3s ease;
}

.sound-btn.active {
  background-color: rgba(67, 97, 238, 0.1);
}

.sound-btn.active .sound-icon {
  stroke: #2ecc71;
}

.sound-btn.active .sound-wave {
  stroke: #2ecc71;
  opacity: 1;
}

.sound-btn.active::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(46, 204, 113, 0.2);
  animation: pulse 1.5s ease-out infinite;
  z-index: -1;
}

/* Botón modo oscuro */
.mode-btn .moon-icon {
  stroke: var(--text);
  fill: none;
  transition: all 0.3s ease;
  transform-origin: center;
}

.mode-btn.active {
  background-color: rgba(67, 97, 238, 0.1);
}

.mode-btn.active .moon-icon {
  stroke: white;
  fill: white;
  animation: moonRotate 0.5s ease-out forwards;
}

.icon-btn svg {
  display: block;
  margin: auto;
}

@keyframes moonRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(25deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.7;
  }
  70% {
    transform: scale(1.3);
    opacity: 0;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

/* ============ BOTÓN PRACTICAR ============ */
.quiz-button-container {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
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
  font-weight: 500;
  font-size: 14px;
  color: var(--bg);
  background: var(--card);
  z-index: 0;
  overflow: hidden;
  transition: transform 0.2s ease, color 0.3s ease, background 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.quiz-btn-with-text::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  z-index: -1;
  background: linear-gradient(270deg, #f72585, #7209b7, #3a0ca3, #4361ee, #4cc9f0, #4895ef, #f72585);
  background-size: 400% 400%;
  border-radius: 40px;
  animation: gradientBorder 6s ease infinite;
  transition: opacity 0.3s ease;
  opacity: 0.7;
}

.quiz-btn-with-text:hover::before {
  opacity: 1;
}

.quiz-btn-with-text:hover {
  background-color: var(--primary);
  color: white;
  transform: translateY(-2px);
}

.quiz-btn-with-text:active {
  transform: translateY(0) scale(0.98);
}

@keyframes gradientBorder {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.quiz-btn-text {
  white-space: nowrap;
}

.dark-mode .quiz-btn-with-text {
  color: white;
}

.dropdown-arrow {
  margin-left: 6px;
  transition: transform 0.3s ease;
}

.dropdown.open .dropdown-arrow {
  transform: rotate(180deg);
}

/* ============ MENÚ DESPLEGABLE ============ */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: var(--card);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 110;
  width: 180px;
  overflow: hidden;
  margin-top: 8px;
}

.dropdown-menu button {
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

.dropdown-menu button:hover {
  background-color: var(--primary);
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .fixed-controls {
    top: 10px;
    right: 10px;
  }

  .quiz-button-container {
    top: 10px;
    left: 10px;
  }

  .quiz-btn-with-text {
    padding: 6px 12px;
    font-size: 13px;
  }

  .icon-btn {
    width: 38px;
    height: 38px;
  }

  .dropdown-menu {
    width: 160px;
  }

  .dropdown-menu button {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>
