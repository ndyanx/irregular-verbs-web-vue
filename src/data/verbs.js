import verbsData from '@/assets/data/verbs.json';

/**
 * Antes `verbs` era un store de Pinia (`useVerbsStore`) que solo envolvía
 * estos mismos datos estáticos. En ningún lugar del código se mutan
 * `allVerbs` ni `commonVerbs`, así que Pinia no aportaba reactividad real:
 * solo agregaba la ceremonia de llamar a un hook de store para leer un JSON.
 *
 * Ahora es un módulo plano. Cualquier vista que necesite los verbos los
 * importa directo:
 *   import { allVerbs, commonVerbs } from '@/data/verbs';
 */
export const allVerbs = verbsData;

export const commonVerbs = [
  'be', 'have', 'do', 'say', 'go', 'get', 'make', 'take', 'come', 'see',
];
