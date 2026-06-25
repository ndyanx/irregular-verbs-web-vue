import { ref } from "vue";
import confetti from "canvas-confetti";

/**
 * Encapsula el lanzamiento de confetti sobre un <canvas>.
 *
 * Antes este mismo bloque (crear instancia + disparar partículas)
 * estaba copiado y pegado de forma idéntica en GameQuizModal,
 * GameMatchModal y GameRaceModal. Cualquier ajuste (cantidad de
 * partículas, spread, etc.) había que repetirlo a mano en los tres.
 *
 * Uso en un componente:
 *   const { confettiCanvas, launchConfetti } = useConfetti();
 *   // en el template: <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>
 *   // al acertar: launchConfetti();
 */
export function useConfetti() {
  const confettiCanvas = ref(null);

  function launchConfetti(options = {}) {
    if (!confettiCanvas.value) return;

    const myConfetti = confetti.create(confettiCanvas.value, {
      resize: true,
      useWorker: true,
    });

    myConfetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      ...options,
    });
  }

  return { confettiCanvas, launchConfetti };
}
