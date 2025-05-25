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
        aria-label="Toggle participle column"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <span>{{ showParticiple ? 'Participio' : 'Mostrar Participio' }}</span>
      </button>
      <select 
        v-model="currentSort"
        class="sort-selector"
        @change="resetPagination"
      >
        <option value="default">Orden: A-Z</option>
        <option value="identical">Formas idénticas</option>
        <option value="easy">Más fáciles</option>
        <option value="common">Más comunes</option>
      </select>
    </div>
    
    <div class="table-container">
      <table>
        <thead class="rainbow-header">
          <tr>
            <th>Presente</th>
            <th>Pasado</th>
            <th v-show="showParticiple">Participio</th>
            <th>s. Presente</th>
            <th>s. Pasado</th>
            <th v-show="showParticiple">s. Participio</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(verbData, verbKey) in paginatedData" :key="verbKey">
            <td class="present-cell" @click="speakWord(verbData.present)">
              {{ verbData.present }}<br><small>{{ verbData.phonetics.present }}</small>
            </td>
            <td class="past-cell" @click="speakWord(verbData.past)">
              {{ verbData.past }}<br><small>{{ verbData.phonetics.past }}</small>
            </td>
            <td 
              class="participle-cell"
              @click="speakWord(verbData.participle)"
              v-show="showParticiple"
            >
              {{ verbData.participle }}<br><small>{{ verbData.phonetics.participle }}</small>
            </td>
            <td class="present-meaning-cell">
              {{ joinMeanings(verbData.meanings, 'present') }}
            </td>
            <td class="past-meaning-cell">
              {{ joinMeanings(verbData.meanings, 'past') }}
            </td>
            <td 
              class="participle-meaning-cell"
              v-show="showParticiple"
            >
              {{ joinMeanings(verbData.meanings, 'participle') }}
            </td>
            <td class="note-cell">
              <div v-for="(meaning, index) in verbData.meanings" :key="`${verbKey}-note-${index}`">
                {{ meaning.note }}
                <hr v-if="index < verbData.meanings.length - 1">
              </div>
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
        aria-label="Página anterior"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Anterior
      </button>
      <span class="page-info">{{ pageInfo }}</span>
      <button 
        class="pagination-btn"
        @click="nextPage"
        :disabled="currentPage === totalPages"
        aria-label="Página siguiente"
      >
        Siguiente
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
      <select 
        v-model="rowsPerPage"
        @change="resetPagination"
        aria-label="Filas por página"
      >
        <option value="10">10</option>
        <option value="25" selected>25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  </div>
</template>

<script>
const COMMON_VERBS = ["be", "have", "do", "say", "go", "get", "make", "take", "come", "see"];
const SORT_NAMES = {
  default: 'A-Z',
  identical: 'Formas Idénticas',
  easy: 'Más Fáciles',
  common: 'Más Comunes'
};

export default {
  name: 'VerbTable',
  props: {
    verbs: {
      type: Object,
      required: true,
      validator: value => Object.keys(value).length > 0
    },
    soundEnabled: Boolean,
    showParticiple: Boolean
  },
  data() {
    return {
      searchQuery: '',
      currentSort: 'default',
      currentPage: 1,
      rowsPerPage: 25
    };
  },
  computed: {
    filteredData() {
      if (!this.searchQuery) return this.verbs;
      
      const query = this.searchQuery.toLowerCase();
      return Object.fromEntries(
        Object.entries(this.verbs).filter(([verbKey, verbData]) => {
          const searchFields = [
            verbKey,
            verbData.present,
            verbData.past,
            verbData.participle,
            ...Object.values(verbData.phonetics),
            ...verbData.meanings.flatMap(meaning => Object.values(meaning))
          ];
          
          return searchFields.some(field => 
            String(field).toLowerCase().includes(query)
          );
        })
      );
    },
    sortedData() {
      const data = Object.entries(this.filteredData);
      
      const sortStrategies = {
        identical: ([, a], [, b]) => {
          const aIdentical = (a.present === a.past && a.past === a.participle) ? 0 : 1;
          const bIdentical = (b.present === b.past && b.past === b.participle) ? 0 : 1;
          return aIdentical - bIdentical || a.present.localeCompare(b.present);
        },
        easy: ([aKey, a], [bKey, b]) => {
          const scoreA = this.calculateDifficultyScore(aKey, a);
          const scoreB = this.calculateDifficultyScore(bKey, b);
          return scoreA - scoreB || a.present.localeCompare(b.present);
        },
        common: ([aKey], [bKey]) => {
          const aIndex = COMMON_VERBS.indexOf(aKey);
          const bIndex = COMMON_VERBS.indexOf(bKey);
          return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        },
        default: ([, a], [, b]) => a.present.localeCompare(b.present)
      };

      return Object.fromEntries(data.sort(sortStrategies[this.currentSort]));
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.rowsPerPage;
      const end = start + this.rowsPerPage;
      return Object.fromEntries(
        Object.entries(this.sortedData).slice(start, end)
      );
    },
    totalPages() {
      return Math.ceil(Object.keys(this.sortedData).length / this.rowsPerPage);
    },
    pageInfo() {
      return `Página ${this.currentPage} de ${this.totalPages} | ${SORT_NAMES[this.currentSort]}`;
    }
  },
  methods: {
    toggleParticiple() {
      this.$emit('toggle-participle');
    },
    prevPage() {
      this.currentPage = Math.max(1, this.currentPage - 1);
    },
    nextPage() {
      this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
    },
    resetPagination() {
      this.currentPage = 1;
    },
    joinMeanings(meanings, field) {
      return meanings.map(meaning => meaning[field]).join(" - ");
    },
    speakWord(word) {
      if (this.soundEnabled) {
        this.$emit('speak-word', word);
      }
    },
    calculateDifficultyScore(verbKey, verbData) {
      const isIdentical = verbData.present === verbData.past && 
                         verbData.past === verbData.participle;
      const isCommon = COMMON_VERBS.includes(verbKey);
      
      return verbData.present.length + 
             (isIdentical ? 0 : 5) + 
             (isCommon ? -10 : 0);
    }
  },
  watch: {
    searchQuery() {
      this.resetPagination();
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
  animation: gradientText 6s ease infinite;
}

@keyframes gradientText {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
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
  transition: all 0.3s ease;
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
  transition: all 0.3s ease;
  color: var(--text);
  font-weight: 500;
}

.icon-btn-text:hover {
  background: var(--primary);
  color: white;
}

.icon-btn-text svg {
  transition: all 0.3s ease;
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
  text-align: left;
  border-bottom: 1px solid var(--border);
}

th {
  white-space: nowrap;
  text-align: center;
}

td {
  background: var(--card);
  text-align: center;
}

td:nth-child(4) {
  text-align: left;
  white-space: normal;
}

tbody tr:hover td {
  background: rgba(67, 97, 238, 0.05);
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
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.pagination-btn:hover {
  background: var(--primary);
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: 500;
  color: var(--text-light);
}

.pagination-controls select {
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
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

@media (max-width: 768px) {
  .content-wrapper {
    padding: 70px 15px 15px;
  }
  
  .search-container {
    flex-direction: column;
  }
  
  .search-input, .sort-selector, .icon-btn-text {
    width: 100%;
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
}
</style>