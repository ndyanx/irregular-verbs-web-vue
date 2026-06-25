import { useAudioStore } from '@/stores/audio';

/**
 * Antes WordView y TextView repetían el mismo try/catch alrededor de
 * audioStore.fetchWordData: si fallaba, lo único que hacían era loguear
 * el error y tratar el resultado como "sin datos". Esa parte sí era
 * idéntica en ambas vistas, así que vive acá.
 *
 * El resto de la lógica (el contador anti-race-condition de WordView,
 * el caché por palabra de TextView) es distinto en cada vista a propósito
 * — responden a interacciones distintas — y se queda en cada componente.
 */
export function useWordFetch() {
  const audioStore = useAudioStore();

  async function fetchWord(word) {
    try {
      return await audioStore.fetchWordData(word);
    } catch (error) {
      console.error(
        `[useWordFetch] No se pudo obtener datos de "${word}":`,
        error?.message || error,
      );
      return null;
    }
  }

  return { fetchWord };
}
