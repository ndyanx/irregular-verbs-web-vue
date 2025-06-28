<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="error-code gradient-text">404</h1>
      <p class="error-message">Ups, parece que esta página no existe.</p>
      <router-link to="/" class="btn primary">Volver al inicio</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView',
  created() {
    document.body.classList.add('theme-loaded');
  }
}
</script>

<style scoped>
/* Fondo de la página */
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  font-family: 'Roboto', sans-serif;
  margin: 0;
}

/* Contenedor del error */
.not-found-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.8);
  padding: 3rem 2rem;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  backdrop-filter: blur(10px); /* Efecto de desenfoque en el fondo */
}

/* Error 404 con gradiente */
.error-code {
  font-size: 120px;
  font-weight: bold;
  margin-bottom: 1rem;
  color: transparent;
  background-image: linear-gradient(270deg, #f72585, #7209b7, #3a0ca3, #4361ee, #4cc9f0);
  background-clip: text;
  -webkit-background-clip: text;
  animation: gradientText 6s ease infinite;
}

@keyframes gradientText {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Mensaje de error */
.error-message {
  font-size: 1.25rem;
  color: #555;
  margin-bottom: 1.5rem;
}

/* Botón principal con estilo de gradiente */
.btn {
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
}

.btn.primary {
  background: linear-gradient(90deg, #41d1ff 0%, #7367ff 100%);
  color: white;
  border: none;
}

.btn.primary:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(65, 209, 255, 0.3);
}

/* Estilo para móviles */
@media (max-width: 768px) {
  .not-found-content {
    padding: 2rem 1.5rem;
  }
  .error-code {
    font-size: 100px;
  }
  .error-message {
    font-size: 1rem;
  }
}
</style>
