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
      <button 
        id="quiz-button" 
        class="quiz-btn-with-text" 
        aria-label="Abrir juego de verbos"
        @click="$emit('open-quiz')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
        </svg>
        <span class="quiz-btn-text">Practicar</span>
      </button>
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
  methods: {
    toggleSound() {
      this.$emit('toggle-sound');
    },
    toggleDarkMode() {
      this.$emit('toggle-dark-mode');
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

/* Estilo base común */
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
  stroke: #f72585; /* Rojo cuando está inactivo */
  transition: all 0.3s ease;
}

.sound-btn .sound-wave {
  stroke: #f72585;
  opacity: 0;
  transition: all 0.3s ease;
}

/* Estado activo del sonido */
.sound-btn.active {
  background-color: rgba(67, 97, 238, 0.1);
}

.sound-btn.active .sound-icon {
  stroke: #2ecc71; /* Verde cuando está activo */
}

.sound-btn.active .sound-wave {
  stroke: #2ecc71;
  opacity: 1;
}

/* Efecto de onda al activar */
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

/* Botón de modo oscuro */
.mode-btn .moon-icon {
  stroke: var(--text);
  fill: none;
  transition: all 0.3s ease;
  transform-origin: center; /* Asegura que la rotación sea desde el centro */
}

/* Estado activo del modo oscuro */
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

/* Animación de pulsación */
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

/* Efecto hover para ambos botones */
.icon-btn:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.icon-btn:active {
  transform: translateY(0) scale(0.95);
}

/* Estilos para el contenedor del botón del quiz */
.quiz-button-container {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
}

/* Estilos para el botón con texto */
.quiz-btn-with-text {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 30px;
  background-color: var(--card);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  color: var(--text);
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
}

.quiz-btn-text {
  white-space: nowrap;
}

/* Efectos hover y active */
.quiz-btn-with-text:hover {
  background-color: var(--primary);
  color: white;
  transform: translateY(-2px);
}

.quiz-btn-with-text:active {
  transform: translateY(0) scale(0.98);
}

/* Ajustes responsive */
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
}
</style>