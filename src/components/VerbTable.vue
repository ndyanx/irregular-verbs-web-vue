<template>
  <div :style="{ maxWidth: showParticiple ? '1300px' : '1000px' }" class="content-wrapper">
    <h1>Verbos Irregulares en Inglés</h1>
    
    <div class="search-container">
      <input 
        type="text" 
        v-model.trim="searchQuery"
        placeholder="Buscar verbos..."
        class="search-input"
        @keyup.enter="resetPagination"
      >
      <button 
        class="icon-btn-text"
        @click="toggleParticiple"
        :class="{ active: showParticiple }"
        :aria-label="`${showParticiple ? 'Ocultar' : 'Mostrar'} columna de participio`"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <span>{{ showParticiple ? 'Ocultar Participio' : 'Mostrar Participio' }}</span>
      </button>
      <select 
        v-model="currentSort"
        class="sort-selector"
        @change="resetPagination"
        aria-label="Seleccionar orden de clasificación"
      >
        <option 
          v-for="(label, key) in SORT_NAMES" 
          :key="key" 
          :value="key"
        >
          Orden: {{ label }}
        </option>
      </select>
    </div>
    
    <div class="table-container">
      <table role="table" aria-label="Tabla de verbos irregulares">
        <thead class="rainbow-header">
          <tr role="row">
            <th scope="col">Presente</th>
            <th scope="col">Pasado</th>
            <th v-show="showParticiple" scope="col">Participio</th>
            <th scope="col">s. Presente</th>
            <th scope="col">s. Pasado</th>
            <th v-show="showParticiple" scope="col">s. Participio</th>
            <th scope="col">Notas</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(verbData, verbKey) in paginatedData" 
            :key="verbKey"
            role="row"
          >
            <td 
              class="present-cell clickable-cell" 
              @click="speakWord(verbData.present)"
              :tabindex="soundEnabled ? 0 : -1"
              @keyup.enter="speakWord(verbData.present)"
              role="button"
              :aria-label="`Pronunciar ${verbData.present}`"
            >
              {{ verbData.present }}<br>
              <small class="phonetic">{{ verbData.phonetics.present }}</small>
            </td>
            <td 
              class="past-cell clickable-cell" 
              @click="speakWord(verbData.past)"
              :tabindex="soundEnabled ? 0 : -1"
              @keyup.enter="speakWord(verbData.past)"
              role="button"
              :aria-label="`Pronunciar ${verbData.past}`"
            >
              {{ verbData.past }}<br>
              <small class="phonetic">{{ verbData.phonetics.past }}</small>
            </td>
            <td 
              v-show="showParticiple"
              class="participle-cell clickable-cell"
              @click="speakWord(verbData.participle)"
              :tabindex="soundEnabled ? 0 : -1"
              @keyup.enter="speakWord(verbData.participle)"
              role="button"
              :aria-label="`Pronunciar ${verbData.participle}`"
            >
              {{ verbData.participle }}<br>
              <small class="phonetic">{{ verbData.phonetics.participle }}</small>
            </td>
            <td class="present-meaning-cell">
              {{ getMeaningsText(verbData.meanings, 'present') }}
            </td>
            <td class="past-meaning-cell">
              {{ getMeaningsText(verbData.meanings, 'past') }}
            </td>
            <td 
              v-show="showParticiple"
              class="participle-meaning-cell"
            >
              {{ getMeaningsText(verbData.meanings, 'participle') }}
            </td>
            <td class="note-cell">
              <template v-for="(meaning, index) in verbData.meanings" :key="`${verbKey}-note-${index}`">
                {{ meaning.note }}
                <hr v-if="index < verbData.meanings.length - 1" class="note-separator">
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-controls">
      <button 
        class="pagination-btn"
        @click="prevPage"
        :disabled="currentPage === 1"
        aria-label="Ir a página anterior"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Anterior
      </button>
      
      <span class="page-info" aria-live="polite">
        {{ pageInfoText }}
      </span>
      
      <button 
        class="pagination-btn"
        @click="nextPage"
        :disabled="currentPage === totalPages"
        aria-label="Ir a página siguiente"
      >
        Siguiente
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
      
      <select 
        v-model.number="rowsPerPage"
        @change="resetPagination"
        aria-label="Seleccionar número de filas por página"
        class="rows-selector"
      >
        <option 
          v-for="option in rowsPerPageOptions" 
          :key="option" 
          :value="option"
        >
          {{ option }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
// Constantes movidas fuera del componente para mejor rendimiento
const COMMON_VERBS = Object.freeze(["be", "have", "do", "say", "go", "get", "make", "take", "come", "see"]);
const SORT_NAMES = Object.freeze({
  default: 'A-Z',
  identical: 'Formas Idénticas',
  easy: 'Más Fáciles',
  common: 'Más Comunes'
});

const ROWS_PER_PAGE_OPTIONS = Object.freeze([10, 25, 50, 100]);

export default {
  name: 'VerbTable',
  props: {
    verbs: {
      type: Object,
      required: true,
      validator: value => value && typeof value === 'object' && Object.keys(value).length > 0
    },
    soundEnabled: {
      type: Boolean,
      default: false
    },
    showParticiple: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['toggle-participle', 'speak-word'],
  
  data() {
    return {
      searchQuery: '',
      currentSort: 'default',
      currentPage: 1,
      rowsPerPage: 25,
      // Constantes expuestas para el template
      SORT_NAMES,
      rowsPerPageOptions: ROWS_PER_PAGE_OPTIONS
    };
  },
  
  computed: {
    filteredData() {
      if (!this.searchQuery) return this.verbs;
      
      const query = this.searchQuery.toLowerCase();
      const filteredEntries = Object.entries(this.verbs).filter(([verbKey, verbData]) => {
        // Optimización: crear array de campos de búsqueda más eficientemente
        const searchableText = [
          verbKey,
          verbData.present,
          verbData.past,
          verbData.participle,
          verbData.phonetics.present,
          verbData.phonetics.past,
          verbData.phonetics.participle,
          ...verbData.meanings.flatMap(meaning => [
            meaning.present,
            meaning.past,
            meaning.participle,
            meaning.note
          ])
        ].join(' ').toLowerCase();
        
        return searchableText.includes(query);
      });
      
      return Object.fromEntries(filteredEntries);
    },
    
    sortedData() {
      const entries = Object.entries(this.filteredData);
      
      const sortFunctions = {
        identical: ([, a], [, b]) => {
          const aScore = this.getIdenticalScore(a);
          const bScore = this.getIdenticalScore(b);
          return aScore - bScore || a.present.localeCompare(b.present);
        },
        
        easy: ([aKey, a], [bKey, b]) => {
          const scoreA = this.calculateDifficultyScore(aKey, a);
          const scoreB = this.calculateDifficultyScore(bKey, b);
          return scoreA - scoreB || a.present.localeCompare(b.present);
        },
        
        common: ([aKey], [bKey]) => {
          const aIndex = COMMON_VERBS.indexOf(aKey);
          const bIndex = COMMON_VERBS.indexOf(bKey);
          const aPos = aIndex === -1 ? Infinity : aIndex;
          const bPos = bIndex === -1 ? Infinity : bIndex;
          return aPos - bPos;
        },
        
        default: ([, a], [, b]) => a.present.localeCompare(b.present)
      };

      const sortFn = sortFunctions[this.currentSort] || sortFunctions.default;
      return Object.fromEntries(entries.sort(sortFn));
    },
    
    paginatedData() {
      const entries = Object.entries(this.sortedData);
      const startIndex = (this.currentPage - 1) * this.rowsPerPage;
      const endIndex = startIndex + this.rowsPerPage;
      
      return Object.fromEntries(entries.slice(startIndex, endIndex));
    },
    
    totalPages() {
      return Math.ceil(Object.keys(this.sortedData).length / this.rowsPerPage);
    },
    
    pageInfoText() {
      const totalItems = Object.keys(this.sortedData).length;
      const startItem = Math.min((this.currentPage - 1) * this.rowsPerPage + 1, totalItems);
      const endItem = Math.min(this.currentPage * this.rowsPerPage, totalItems);
      
      return `${startItem}-${endItem} de ${totalItems} | ${SORT_NAMES[this.currentSort]}`;
    }
  },
  
  methods: {
    toggleParticiple() {
      this.$emit('toggle-participle');
    },
    
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    
    resetPagination() {
      this.currentPage = 1;
    },
    
    // Método optimizado para obtener significados
    getMeaningsText(meanings, field) {
      return meanings.map(meaning => meaning[field]).filter(Boolean).join(" - ");
    },
    
    speakWord(word) {
      if (this.soundEnabled && word) {
        this.$emit('speak-word', word);
      }
    },
    
    // Método auxiliar para el ordenamiento por formas idénticas
    getIdenticalScore(verbData) {
      return (verbData.present === verbData.past && verbData.past === verbData.participle) ? 0 : 1;
    },
    
    // Método optimizado para calcular dificultad
    calculateDifficultyScore(verbKey, verbData) {
      const lengthScore = verbData.present.length;
      const identicalBonus = this.getIdenticalScore(verbData) === 0 ? 0 : 5;
      const commonBonus = COMMON_VERBS.includes(verbKey) ? -10 : 0;
      
      return lengthScore + identicalBonus + commonBonus;
    }
  },
  
  watch: {
    searchQuery: {
      handler() {
        this.resetPagination();
      },
      immediate: false
    },
    
    // Validar que la página actual no exceda el total cuando cambian los datos
    totalPages: {
      handler(newTotal) {
        if (this.currentPage > newTotal && newTotal > 0) {
          this.currentPage = newTotal;
        }
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.content-wrapper {
  margin: 0 auto;
  padding: 80px 20px 20px;
  width: 100%;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.2rem;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  background: linear-gradient(
    270deg,
    #f72585,
    #7209b7,
    #3a0ca3,
    #4361ee,
    #4cc9f0,
    #4895ef,
    #f72585
  );
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientText 6s ease infinite;
}

@keyframes gradientText {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.search-container {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 12px 20px;
  font-size: 16px;
  border: 2px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  color: var(--text);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

.icon-btn-text {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 30px;
  background: var(--card);
  border: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
  color: var(--text);
  font-weight: 500;
}

.icon-btn-text:hover {
  transform: translateY(-1px);
}

.icon-btn-text:active {
  transform: translateY(0);
}

.sort-selector {
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid var(--border);
  background: var(--card) url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") no-repeat right 12px center;
  background-size: 16px;
  color: var(--text);
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
  min-width: 180px;
}

.rows-selector {
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.3s ease;
  /* appearance: none; */
}

.sort-selector:focus,
.rows-selector:focus {
  outline: none;
  border-color: var(--primary);
}

.table-container {
  background: var(--card);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  margin-bottom: 24px;
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

th, td {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid var(--border);
}

th {
  white-space: nowrap;
  font-weight: 600;
}

td {
  background: var(--card);
  transition: background-color 0.2s ease;
}

/* Alineación específica para columnas de significado */
.present-meaning-cell,
.past-meaning-cell,
.participle-meaning-cell,
.note-cell {
  text-align: left;
  white-space: normal;
}

.clickable-cell {
  cursor: pointer;
  user-select: none;
}

.clickable-cell:hover {
  background: rgba(67, 97, 238, 0.1) !important;
}

.clickable-cell:focus {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

tbody tr:hover td {
  background: rgba(67, 97, 238, 0.05);
}

.phonetic {
  color: var(--text-light);
  font-style: italic;
}

.note-separator {
  margin: 8px 0;
  border: none;
  border-top: 1px solid var(--border);
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 24px;
}

.pagination-btn {
  padding: 10px 16px;
  background: var(--card);
  color: var(--text);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  font-weight: 500;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--primary);
  color: white;
  transform: translateY(-1px);
}

.pagination-btn:active:not(:disabled) {
  transform: translateY(0);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.page-info {
  font-weight: 500;
  color: var(--text-light);
  text-align: center;
  min-width: 120px;
}

.rainbow-header {
  position: relative;
  z-index: 0;
}

.rainbow-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(270deg, #f72585, #7209b7, #3a0ca3, #4361ee, #4cc9f0, #4895ef, #f72585);
  background-size: 400% 400%;
  animation: rainbowBG 6s linear infinite;
  z-index: -1;
}

.rainbow-header th {
  position: relative;
  background: transparent;
  color: white;
  font-weight: bold;
  z-index: 1;
}

@keyframes rainbowBG {
  0% { background-position: 0% 50%; }
  100% { background-position: 400% 50%; }
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 70px 15px 15px;
  }
  
  .search-container {
    flex-direction: column;
  }
  
  .search-input, 
  .sort-selector, 
  .icon-btn-text {
    width: 100%;
    min-width: auto;
  }
  
  .pagination-controls {
    gap: 8px;
  }
  
  .pagination-btn {
    padding: 8px 12px;
    font-size: 14px;
  }

  .table-container {
    border-radius: 0;
    box-shadow: none;
  }

  table {
    min-width: 100%;
  }

  th, td {
    padding: 12px 8px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  th, td {
    padding: 8px 4px;
    font-size: 13px;
  }
  
  .page-info {
    font-size: 12px;
    min-width: auto;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Modo de alto contraste */
@media (prefers-contrast: high) {
  .search-input:focus,
  .sort-selector:focus,
  .rows-selector:focus {
    box-shadow: 0 0 0 3px black;
  }
  
  .clickable-cell:focus {
    outline: 3px solid black;
  }
}
</style>