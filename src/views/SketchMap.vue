<template>
  <div class="app">
    <div class="left-panel">
      <button @click="generarCroquis" class="generate-btn">Generar Croquis</button>
      
      <div class="controls">
        <div class="control-group">
          <label>Tamaño del croquis:</label>
          <input type="range" min="80" max="150" v-model="tamanoBase" @input="actualizarTamano">
          <span>{{ tamanoBase }}%</span>
        </div>
        
        <div class="control-group">
          <label>Lugares por bloque:</label>
          <input type="number" min="1" max="9" v-model="lugaresPorBloque">
        </div>
      </div>
      
      <div class="leyenda">
        <h3>Leyenda de Pistas:</h3>
        <div v-for="(pista, index) in todasLasPistas" :key="'leyenda'+index" class="leyenda-item">
          <div class="leyenda-color" :style="{backgroundColor: pista.color}"></div>
          <span>{{ pista.nombre }}</span>
        </div>
      </div>
    </div>
    
    <div class="right-panel">
      <div class="croquis-wrapper" :style="{'--tamano-base': tamanoBase + '%'}">
        <div class="croquis-container">
          <!-- Pista superior exterior (nombre siempre visible) -->
          <div class="pista-exterior pista-superior" :style="{backgroundColor: pistasExteriores.superior.color}">
            <div class="pista-nombre-fijo">{{ pistasExteriores.superior.nombre }}</div>
          </div>
          
          <!-- Pista izquierda exterior (nombre siempre visible) -->
          <div class="pista-exterior pista-izquierda" :style="{backgroundColor: pistasExteriores.izquierda.color}">
            <div class="pista-nombre-fijo vertical">{{ pistasExteriores.izquierda.nombre }}</div>
          </div>
          
          <!-- Pista derecha exterior (nombre siempre visible) -->
          <div class="pista-exterior pista-derecha" :style="{backgroundColor: pistasExteriores.derecha.color}">
            <div class="pista-nombre-fijo vertical">{{ pistasExteriores.derecha.nombre }}</div>
          </div>
          
          <!-- Pista inferior exterior (nombre siempre visible) -->
          <div class="pista-exterior pista-inferior" :style="{backgroundColor: pistasExteriores.inferior.color}">
            <div class="pista-nombre-fijo">{{ pistasExteriores.inferior.nombre }}</div>
          </div>
          
          <!-- Contenido principal -->
          <div class="main-content">
            <!-- Grid principal -->
            <div class="grid-container">
              <div v-for="(fila, filaIndex) in grid" :key="filaIndex" class="fila">
                <div v-for="(bloque, bloqueIndex) in fila" :key="bloqueIndex" 
                     class="bloque" :class="{'bloque-derecha': bloqueIndex < fila.length - 1}">
                  <div class="sub-grid">
                    <div v-for="(celda, celdaIndex) in bloque" :key="celdaIndex" class="celda">
                      {{ celda }}
                    </div>
                  </div>
                  
                  <!-- Pista vertical interna (con hover) -->
                  <div class="pista-vertical" 
                       :style="{backgroundColor: pistasVerticales[bloqueIndex]?.color}"
                       @mouseover="mostrarNombrePista(pistasVerticales[bloqueIndex])"
                       @mouseleave="ocultarNombrePista"
                       v-if="bloqueIndex < fila.length - 1">
                    <div class="pista-nombre-hover" v-if="pistaHover === pistasVerticales[bloqueIndex]">
                      {{ pistasVerticales[bloqueIndex]?.nombre }}
                    </div>
                  </div>
                </div>
                
                <!-- Pista horizontal interna (con hover) -->
                <div class="pista-horizontal" 
                     :style="{backgroundColor: pistasHorizontales[filaIndex]?.color}"
                     @mouseover="mostrarNombrePista(pistasHorizontales[filaIndex])"
                     @mouseleave="ocultarNombrePista"
                     v-if="filaIndex < grid.length - 1">
                  <div class="pista-nombre-hover" v-if="pistaHover === pistasHorizontales[filaIndex]">
                    {{ pistasHorizontales[filaIndex]?.nombre }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      lugares: [
        '🏥 Hospital', '🏫 Escuela', '🏪 Tienda', '🏟️ Estadio', '🏨 Hotel', 
        '🏛️ Museo', '🍔 Restaurante', '🏦 Banco', '🎭 Teatro', '🛒 Supermercado',
        '⛪ Iglesia', '🏢 Oficinas', '🌳 Parque', '🏭 Fábrica', '🚉 Estación',
        '🏬 Centro Comercial', '🚦 Cruce', '🏣 Correos', '🏤 Alcaldía', '🏧 Cajero',
        '📚 Biblioteca', '🎨 Galería', '🍻 Bar', '☕ Cafetería', '🏊 Piscina',
        '🏋️ Gimnasio', '💈 Peluquería', '🚗 Lavadero', '🔧 Taller', '🛏️ Hostal'
      ],
      pistasHorizontales: [],
      pistasVerticales: [],
      pistasExteriores: {
        superior: { nombre: '', color: '' },
        inferior: { nombre: '', color: '' },
        izquierda: { nombre: '', color: '' },
        derecha: { nombre: '', color: '' }
      },
      todasLasPistas: [],
      grid: Array(3).fill().map(() => 
        Array(5).fill().map(() => 
          Array(9).fill('')
        )
      ),
      tamanoBase: 100,
      lugaresPorBloque: 3,
      pistaHover: null
    }
  },
  methods: {
    generarNombresPistas() {
      const nombresCalles = [
        "Av. Principal", "Calle Norte", "Calle Sur", "Av. Central", 
        "Calle Este", "Calle Oeste", "Av. Comercial", "Calle Peatonal",
        "Av. Cultural", "Calle Residencial", "Av. Deportiva", "Calle Jardín",
        "Bulevar Este", "Av. Circunvalación", "Callejón Los Pinos", "Av. Ribereña",
        "Callejón San Martín", "Av. Universitaria", "Calle Mercado", "Pasaje Primavera"
      ];
      
      const colores = [
        "#FF5252", "#FFD740", "#64FFDA", "#448AFF", 
        "#B388FF", "#FF80AB", "#69F0AE", "#FF8A80",
        "#82B1FF", "#EA80FC", "#B9F6CA", "#FFE57F",
        "#A7FFEB", "#C8E6C9", "#F8BBD0", "#D1C4E9",
        "#B2EBF2", "#B2DFDB", "#FFCCBC", "#D7CCC8"
      ];
      
      // Mezclar nombres y colores
      const mezclados = nombresCalles
        .map((nombre, i) => ({nombre, color: colores[i % colores.length]}))
        .sort(() => Math.random() - 0.5);
      
      // Pistas exteriores (4)
      this.pistasExteriores = {
        superior: mezclados[0],
        derecha: mezclados[1],
        inferior: mezclados[2],
        izquierda: mezclados[3]
      };
      
      // 3 filas = 2 pistas horizontales internas
      this.pistasHorizontales = mezclados.slice(4, 6);
      // 5 columnas = 4 pistas verticales internas
      this.pistasVerticales = mezclados.slice(6, 10);
      
      this.todasLasPistas = [
        this.pistasExteriores.superior,
        this.pistasExteriores.derecha,
        this.pistasExteriores.inferior,
        this.pistasExteriores.izquierda,
        ...this.pistasVerticales,
        ...this.pistasHorizontales
      ];
    },
    generarCroquis() {
      this.grid = Array(3).fill().map(() => 
        Array(5).fill().map(() => 
          Array(9).fill('')
        )
      );
      
      this.generarNombresPistas();
      
      const lugaresMezclados = [...this.lugares].sort(() => Math.random() - 0.5);
      let lugarIndex = 0;
      
      for (let fila = 0; fila < 3 && lugarIndex < lugaresMezclados.length; fila++) {
        for (let bloque = 0; bloque < 5 && lugarIndex < lugaresMezclados.length; bloque++) {
          const celdasDisponibles = [...Array(9).keys()];
          for (let i = 0; i < Math.min(this.lugaresPorBloque, 9) && lugarIndex < lugaresMezclados.length; i++) {
            const randomIndex = Math.floor(Math.random() * celdasDisponibles.length);
            const celdaAleatoria = celdasDisponibles.splice(randomIndex, 1)[0];
            this.grid[fila][bloque][celdaAleatoria] = lugaresMezclados[lugarIndex];
            lugarIndex++;
          }
        }
      }
    },
    actualizarTamano() {
      console.log("Tamaño actualizado a:", this.tamanoBase + '%');
    },
    mostrarNombrePista(pista) {
      this.pistaHover = pista;
    },
    ocultarNombrePista() {
      this.pistaHover = null;
    }
  },
  watch: {
    lugaresPorBloque() {
      this.generarCroquis();
    }
  },
  created() {
    // this.soundEnabled = localStorage.getItem('soundEnabled') === 'false';
    // this.darkMode = localStorage.getItem('darkMode') === 'false';
    //document.body.classList.toggle('dark-mode', this.darkMode);
    document.body.classList.add('theme-loaded');
    this.generarNombresPistas();
    this.generarCroquis();
  }
}
</script>

<style scoped>

.app {
  font-family: Arial, sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  gap: 30px;
}

.left-panel {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.right-panel {
  flex-grow: 1;
  overflow: auto;
}

.generate-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 12px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
  width: 100%;
}

.generate-btn:hover {
  background-color: #45a049;
}

.controls {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 5px;
}

.control-group {
  margin-bottom: 15px;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 14px;
}

.control-group input[type="range"] {
  width: 100%;
}

.control-group input[type="number"] {
  width: 60px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

.croquis-wrapper {
  margin-top: 10px;
  transform: scale(100%);
  transform-origin: left top;
  width: calc(100% / 100% * 100);
  height: calc(100% / 100% * 100);
}

/* Contenedor principal que incluye las pistas exteriores */
.croquis-container {
  position: relative;
  padding: 30px;
  display: inline-block;
}

.main-content {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  position: relative;
  z-index: 1;
}

/* Pistas exteriores - ahora están completamente fuera */
.pista-exterior {
  position: absolute;
  z-index: 0;
}

.pista-superior {
  top: 0;
  left: 0;
  right: 0;
  height: 30px;
}

.pista-inferior {
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
}

.pista-izquierda {
  top: 0;
  bottom: 0;
  left: 0;
  width: 30px;
}

.pista-derecha {
  top: 0;
  bottom: 0;
  right: 0;
  width: 30px;
}

/* Nombres fijos en pistas exteriores */
.pista-nombre-fijo {
  position: absolute;
  background-color: rgba(255,255,255,0.9);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  white-space: nowrap;
  z-index: 2;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.pista-superior .pista-nombre-fijo,
.pista-inferior .pista-nombre-fijo {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.pista-izquierda .pista-nombre-fijo,
.pista-derecha .pista-nombre-fijo {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
  transform-origin: center;
}

/* Grid principal */
.grid-container {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  flex-grow: 1;
}

.fila {
  display: flex;
  position: relative;
}

.bloque {
  flex: 1;
  aspect-ratio: 1;
  padding: 5px;
  position: relative;
  background-color: #f9f9f9;
}

.bloque-derecha {
  border-right: none;
}

.sub-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  height: 100%;
  gap: 2px;
}

.celda {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  font-size: 12px;
  text-align: center;
  word-break: break-word;
  padding: 2px;
  overflow: hidden;
  transition: all 0.2s;
}

.celda:hover {
  background-color: #e0e0e0;
  transform: scale(1.05);
  z-index: 2;
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
}

/* Pistas internas con hover */
.pista-vertical, .pista-horizontal {
  position: absolute;
  z-index: 2;
  transition: all 0.2s;
}

.pista-vertical:hover, .pista-horizontal:hover {
  filter: brightness(1.2);
  box-shadow: 0 0 5px rgba(0,0,0,0.3);
}

.pista-vertical {
  right: -3px;
  top: 0;
  width: 3px;
  height: 100%;
}

.pista-horizontal {
  bottom: -3px;
  left: 0;
  height: 3px;
  width: 100%;
}

/* Nombre de pista en hover (solo internas) */
.pista-nombre-hover {
  position: absolute;
  background-color: rgba(255,255,255,0.9);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  white-space: nowrap;
  z-index: 3;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.pista-vertical .pista-nombre-hover {
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.pista-horizontal .pista-nombre-hover {
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
}

/* Leyenda */
.leyenda {
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 5px;
  text-align: left;
}

.leyenda h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
}

.leyenda-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}

.leyenda-color {
  width: 20px;
  height: 12px;
  margin-right: 10px;
  border: 1px solid #ddd;
}

@media (max-width: 1000px) {
  .app {
    flex-direction: column;
  }
  
  .left-panel {
    width: 100%;
    order: 1;
  }
  
  .right-panel {
    order: 2;
  }
  
  .croquis-wrapper {
    transform: scale(1);
    width: 100%;
    height: auto;
  }
  
  .pista-nombre-fijo.vertical {
    font-size: 10px;
  }
}

@media (max-width: 600px) {
  :root {
    --ancho-pista-exterior: 20px;
  }
  
  .celda {
    font-size: 10px;
  }
  
  .pista-nombre-fijo {
    font-size: 9px;
  }
  
  .leyenda h3 {
    font-size: 14px;
  }
  
  .leyenda-item {
    font-size: 12px;
  }
}
</style>