<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <span class="error-code">404</span>
      <h1 class="error-title">Esta página no existe</h1>
      <p class="error-message">
        Puede que el enlace esté roto o la página se haya movido.
      </p>
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
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 72px);
  background: var(--paper);
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 3rem 2.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  max-width: 420px;
  width: 100%;
}

.error-code {
  display: block;
  font-family: var(--font-display);
  font-size: 4.5rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  margin-bottom: 0.75rem;
}

.error-title {
  font-size: 1.375rem;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 0.75rem;
}

.error-message {
  font-size: 1rem;
  color: var(--text-light);
  margin-bottom: 1.75rem;
}

.btn {
  padding: 0.75rem 1.75rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: var(--transition);
}

.btn.primary {
  background: var(--accent);
  color: white;
}

.btn.primary:hover {
  background: var(--accent-dark);
}

@media (max-width: 480px) {
  .not-found-content {
    padding: 2.25rem 1.5rem;
  }

  .error-code {
    font-size: 3.5rem;
  }
}
</style>
