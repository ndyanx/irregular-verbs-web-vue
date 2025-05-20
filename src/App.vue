<template>
  <div :class="['app', { 'dark-mode': darkMode }]">
    <NavBar 
      :soundEnabled="soundEnabled" 
      :darkMode="darkMode"
      @toggle-sound="toggleSound"
      @toggle-dark-mode="toggleDarkMode"
      @open-quiz="showQuiz = true"
    />
    
    <VerbTable 
      :verbs="verbs" 
      :soundEnabled="soundEnabled"
      @speak-word="speakWord"
    />
    
    <QuizModal 
      :show="showQuiz" 
      :verbs="verbs"
      :showParticiple="true"
      @close="showQuiz = false"
    />
    
    <Footer />
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';
import VerbTable from './components/VerbTable.vue';
import QuizModal from './components/QuizModal.vue';
import Footer from './components/Footer.vue';

export default {
  name: 'App',
  components: {
    NavBar,
    VerbTable,
    QuizModal,
    Footer
  },
  data() {
    return {
      verbs: [
  ["arise", "arose", "arisen", "surgir (problema/situación) - surgió - surgido", "aráis", "aróus", "arísn", {}],
  ["awake", "awoke", "awoken", "despertar(se) - despertó - despertado", "awéik", "awóuk", "awóuken", {}],
  ["am / are / is", "was / were", "been", "ser/estar - fue/estuvo - sido/estado", "em / ar / is", "wós / wér", "bín", { 
    gameRules: {
      baseToPast: {
        "am": ["was"],
        "is": ["was"],
        "are": ["were"]
      },
      pastToBase: {
        "was": ["am", "is"],
        "were": ["are"]
      }
    }
  }],
  ["bear", "bore", "borne / born*", "soportar (*born=nacer) - soportó - soportado/nacido*", "ber", "bor", "born / born*", {}],
  ["beat", "beat", "beaten", "golpear/vencer - golpeó/venció - golpeado/vencido", "bít", "bít", "bíten", {}],
  ["become", "became", "become", "convertirse - se convirtió - convertido", "bikám", "bikéim", "bikám", {}],
  ["begin", "began", "begun", "empezar - empezó - empezado", "bigín", "bigán", "bigán", {}],
  ["bend", "bent", "bent", "doblar(se) - dobló - doblado", "bend", "bent", "bent", {}],
  ["bet", "bet", "bet", "apostar - apostó - apostado", "bet", "bet", "bet", {}],
  ["bind", "bound", "bound", "atar/unir - ató/unió - atado/unido", "báind", "báund", "báund", {}],
  ["bite", "bit", "bitten", "morder - mordió - mordido", "báit", "bít", "bíten", {}],
  ["bleed", "bled", "bled", "sangrar - sangró - sangrado", "blíd", "bled", "bled", {}],
  ["blow", "blew", "blown", "soplar - sopló - soplado", "blóu", "blú", "blóun", {}],
  ["break", "broke", "broken", "romper - rompió - roto", "bréik", "bróuk", "bróuken", {}],
  ["bring", "brought", "brought", "traer - trajo - traído", "bring", "brot", "brot", {}],
  ["build", "built", "built", "construir - construyó - construido", "bild", "bilt", "bilt", {}],
  ["burn", "burned / burnt", "burned / burnt**", "quemar(se) - quemó - quemado", "bern", "bernd / bernt", "bernd / bernt", {}],
  ["burst", "burst", "burst", "explotar - explotó - explotado", "berst", "berst", "berst", {}],
  ["buy", "bought", "bought", "comprar - compró - comprado", "bái", "bot", "bot", {}],
  ["catch", "caught", "caught", "atrapar - atrapó - atrapado", "kach", "kot", "kot", {}],
  ["choose", "chose", "chosen", "elegir - eligió - elegido", "chus", "chóus", "chóusen", {}],
  ["come", "came", "come", "venir - vino - venido", "kam", "kéim", "kam", {}],
  ["cost", "cost", "cost", "costar - costó - costado", "kost", "kost", "kost", {}],
  ["cut", "cut", "cut", "cortar - cortó - cortado", "kat", "kat", "kat", {}],
  ["deal", "dealt", "dealt", "tratar (con algo) - trató - tratado", "díl", "delt", "delt", {}],
  ["dig", "dug", "dug", "cavar - cavó - cavado", "dig", "dag", "dag", {}],
  ["do", "did", "done", "hacer - hizo - hecho", "du", "did", "dan", {}],
  ["draw", "drew", "drawn", "dibujar - dibujó - dibujado", "dro", "dru", "dron", {}],
  ["dream", "dreamed / dreamt", "dreamed / dreamt**", "soñar - soñó - soñado", "drím", "drímt / drámt", "drímt / drámt", {}],
  ["drink", "drank", "drunk", "beber - bebió - bebido", "drink", "drank", "drank", {}],
  ["drive", "drove", "driven", "conducir - condujo - conducido", "dráiv", "dróuv", "dríven", {}],
  ["eat", "ate", "eaten", "comer - comió - comido", "ít", "éit", "íten", {}],
  ["fall", "fell", "fallen", "caer(se) - cayó - caído", "fol", "fel", "fólen", {}],
  ["feed", "fed", "fed", "alimentar - alimentó - alimentado", "fíd", "fed", "fed", {}],
  ["feel", "felt", "felt", "sentir - sintió - sentido", "fíl", "felt", "felt", {}],
  ["fight", "fought", "fought", "pelear - peleó - peleado", "fáit", "fot", "fot", {}],
  ["find", "found", "found", "encontrar - encontró - encontrado", "fáind", "fáund", "fáund", {}],
  ["fly", "flew", "flown", "volar - voló - volado", "flái", "flú", "flóun", {}],
  ["forget", "forgot", "forgotten", "olvidar - olvidó - olvidado", "forguét", "forgót", "forgóten", {}],
  ["forgive", "forgave", "forgiven", "perdonar - perdonó - perdonado", "forguív", "forguéiv", "forguíven", {}],
  ["freeze", "froze", "frozen", "congelar(se) - congeló - congelado", "frís", "fróus", "fróusen", {}],
  ["get", "got", "gotten", "obtener - obtuvo - obtenido", "guét", "got", "góten", {}],
  ["give", "gave", "given", "dar - dio - dado", "guív", "guéiv", "guíven", {}],
  ["go", "went", "gone", "ir - fue - ido", "góu", "wént", "gón", {}],
  ["grind", "ground", "ground", "moler - molió - molido", "gráind", "gráund", "gráund", {}],
  ["grow", "grew", "grown", "crecer - creció - crecido", "gróu", "grú", "gróun", {}],
  ["hang", "hung", "hung", "colgar - colgó - colgado", "hang", "hang", "hang", {}],
  ["have / has", "had", "had", "tener - tuvo - tenido", "hav / has", "had", "had", {}],
  ["hear", "heard", "heard", "oír - oyó - oído", "jír", "jerd", "jerd", {}],
  ["hide", "hid", "hidden", "esconder(se) - escondió - escondido", "jáid", "jid", "jíden", {}],
  ["hit", "hit", "hit", "golpear/impactar - golpeó - golpeado", "jit", "jit", "jit", {}],
  ["hold", "held", "held", "sostener - sostuvo - sostenido", "jóuld", "jeld", "jeld", {}],
  ["hurt", "hurt", "hurt", "herir/doler - hirió/dolió - herido/dolido", "jert", "jert", "jert", {}],
  ["keep", "kept", "kept", "guardar - guardó - guardado", "kíp", "kept", "kept", {}],
  ["know", "knew", "known", "saber/conocer - supo/conoció - sabido/conocido", "nóu", "niú", "nóun", {}],
  ["lay", "laid", "laid", "poner (objeto) - puso - puesto", "léi", "léid", "léid", {}],
  ["lead", "led", "led", "guiar - guió - guiado", "líd", "led", "led", {}],
  ["learn", "learned / learnt", "learned / learnt**", "aprender - aprendió - aprendido", "lern", "lernd / lernt", "lernd / lernt", {}],
  ["leave", "left", "left", "dejar/irse - dejó/se fue - dejado/ido", "lív", "left", "left", {}],
  ["lend", "lent", "lent", "prestar - prestó - prestado", "lend", "lent", "lent", {}],
  ["let", "let", "let", "permitir - permitió - permitido", "let", "let", "let", {}],
  ["lie", "lay / lied", "lain / lied*", "mentir - mintio - mentido", "lái", "léi / láid", "léin / láid", {}],
  ["light", "lit", "lit", "encender - encendió - encendido", "láit", "lit", "lit", {}],
  ["lose", "lost", "lost", "perder - perdió - perdido", "lús", "lost", "lost", {}],
  ["make", "made", "made", "hacer - hizo - hecho", "méik", "méid", "méid", {}],
  ["mean", "meant", "meant", "significar - significó - significado", "mín", "ment", "ment", {}],
  ["meet", "met", "met", "conocer(se) - conoció - conocido", "mít", "met", "met", {}],
  ["pay", "paid", "paid", "pagar - pagó - pagado", "péi", "péid", "péid", {}],
  ["put", "put", "put", "poner - puso - puesto", "put", "put", "put", {}],
  ["quit", "quit", "quit", "dejar (actividad) - dejó - dejado", "kuít", "kuít", "kuít", {}],
  ["read", "read", "read", "leer - leyó - leído", "ríd", "red", "red", {}],
  ["ride", "rode", "ridden", "montar - montó - montado", "ráid", "róud", "ríden", {}],
  ["ring", "rang", "rung", "sonar - sonó - sonado", "ring", "rang", "rang", {}],
  ["rise", "rose", "risen", "levantarse - se levantó - levantado", "ráis", "róus", "rísn", {}],
  ["run", "ran", "run", "correr - corrió - corrido", "ran", "ran", "ran", {}],
  ["say", "said", "said", "decir - dijo - dicho", "séi", "sed", "sed", {}],
  ["see", "saw", "seen", "ver - vio - visto", "sí", "so", "sín", {}],
  ["seek", "sought", "sought", "buscar - buscó - buscado", "sík", "sot", "sot", {}],
  ["shake", "shook", "shaken", "sacudir - sacudió - sacudido", "shéik", "shuk", "shéiken", {}],
  ["shine", "shone / shined", "shone / shined*", "brillar(lustrar) - brilló/lustró - brillado/lustrado", "sháin", "shón / sháind", "shón / sháind", {}],
  ["shoot", "shot", "shot", "disparar - disparó - disparado", "shút", "shot", "shot", {}],
  ["show", "showed", "shown", "mostrar - mostró - mostrado", "shóu", "shóud", "shóun", {}],
  ["shrink", "shrank", "shrunk", "encoger(se) - encogió - encogido", "shrink", "shrank", "shrank", {}],
  ["shut", "shut", "shut", "cerrar - cerró - cerrado", "shat", "shat", "shat", {}],
  ["sing", "sang", "sung", "cantar - cantó - cantado", "sing", "sang", "sang", {}],
  ["sink", "sank", "sunk", "hundir(se) - se hundió - hundido", "sink", "sank", "sank", {}],
  ["sit", "sat", "sat", "sentar(se) - se sentó - sentado", "sit", "sat", "sat", {}],
  ["sleep", "slept", "slept", "dormir - durmió - dormido", "slíp", "slept", "slept", {}],
  ["slide", "slid", "slid", "deslizar(se) - deslizó - deslizado", "sláid", "slid", "slid", {}],
  ["speak", "spoke", "spoken", "hablar - habló - hablado", "spík", "spóuk", "spóuken", {}],
  ["speed", "sped", "sped", "acelerar - aceleró - acelerado", "spíd", "sped", "sped", {}],
  ["spend", "spent", "spent", "gastar - gastó - gastado", "spend", "spent", "spent", {}],
  ["split", "split", "split", "dividir(se) - dividió - dividido", "split", "split", "split", {}],
  ["spread", "spread", "spread", "extender(se) - extendió - extendido", "spred", "spred", "spred", {}],
  ["stand", "stood", "stood", "estar de pie - estuvo de pie - estado de pie", "stand", "stud", "stud", {}],
  ["steal", "stole", "stolen", "robar - robó - robado", "stíl", "stól", "stólen", {}],
  ["stick", "stuck", "stuck", "pegar(se) - pegó - pegado", "stik", "stak", "stak", {}],
  ["sting", "stung", "stung", "picar (insecto) - picó - picado", "sting", "stang", "stang", {}],
  ["stink", "stank", "stunk", "apestar - apestó - apestado", "stink", "stank", "stank", {}],
  ["strike", "struck", "struck", "golpear con fuerza - golpeó - golpeado", "stráik", "strak", "strak", {}],
  ["swear", "swore", "sworn", "jurar - juró - jurado", "swer", "swor", "sworn", {}],
  ["sweep", "swept", "swept", "barrer - barrió - barrido", "swíp", "swept", "swept", {}],
  ["swim", "swam", "swum", "nadar - nadó - nadado", "swim", "swam", "swam", {}],
  ["take", "took", "taken", "tomar - tomó - tomado", "téik", "tuk", "téiken", {}],
  ["teach", "taught", "taught", "enseñar - enseñó - enseñado", "tích", "tot", "tot", {}],
  ["tear", "tore", "torn", "romper/rasgar - rompió/rasgó - roto/rasgado", "ter", "tor", "torn", {}],
  ["tell", "told", "told", "decir - dijo - dicho", "tel", "told", "told", {}],
  ["think", "thought", "thought", "pensar - pensó - pensado", "zink", "zot", "zot", {}],
  ["throw", "threw", "thrown", "lanzar - lanzó - lanzado", "zróu", "zru", "zróun", {}],
  ["understand", "understood", "understood", "entender - entendió - entendido", "anderstánd", "anderstúd", "anderstúd", {}],
  ["wake", "woke / waked", "woken / waked / woke**", "despertar(se) - despertó - despertado", "wéik", "wóuk / wéikt", "wóuken / wéikt / wóuk", {}],
  ["wear", "wore", "worn", "usar (ropa) - usó - usado", "wer", "wor", "worn", {}],
  ["wed", "wedded / wed", "wedded / wed**", "casar(se) - se casó - casado", "wed", "wédid / wed", "wédid / wed", {}],
  ["weep", "wept", "wept", "llorar - lloró - llorado", "wíp", "wept", "wept", {}],
  ["wet", "wet / wetted", "wet / wetted**", "mojar - mojó - mojado", "wet", "wet / wétid", "wet / wétid", {}],
  ["win", "won", "won", "ganar - ganó - ganado", "win", "won", "won", {}],
  ["wind", "wound", "wound", "enrollar - enrolló - enrollado", "wáind", "wáund", "wáund", {}],
  ["write", "wrote", "written", "escribir - escribió - escrito", "ráit", "róut", "ríten"]
],
      soundEnabled: false,
      darkMode: false,
      showQuiz: false
    }
  },
  methods: {
    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      localStorage.setItem('soundEnabled', this.soundEnabled);
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem('darkMode', this.darkMode);
      document.body.classList.toggle('dark-mode', this.darkMode);
    },
    speakWord(text, lang = 'en-US') {
      if (!this.soundEnabled || !text) return;
      
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        
        const parts = text.replace('*', '').split('/');
        
        parts.forEach((part, index) => {
          if (part) {
            const utterance = new SpeechSynthesisUtterance(part.trim());
            utterance.lang = lang;
            utterance.rate = 0.9;
            speechSynthesis.speak(utterance);
          }
          if (index < parts.length - 1) {
            const pause = new SpeechSynthesisUtterance('');
            pause.lang = lang;
            pause.rate = 0.1;
            speechSynthesis.speak(pause);
          }
        });
      }
    }
  },
  created() {
    // Cargar preferencias del usuario
    this.soundEnabled = localStorage.getItem('soundEnabled') === 'true';
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', this.darkMode);
  }
}
</script>

<style>
/* ============ VARIABLES & RESET ============ */
:root {
  --primary: #4361ee;
  --primary-light: #4895ef;
  --text: #2b2d42;
  --text-light: #8d99ae;
  --bg: #f8f9fa;
  --card: #ffffff;
  --border: #e9ecef;
  --success: #4cc9f0;
  --danger: #f72585;
  --warning: #f8961e;
  --radius: 12px;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

.dark-mode {
  --primary: #4895ef;
  --primary-light: #4361ee;
  --text: #f8f9fa;
  --text-light: #adb5bd;
  --bg: #121212;
  --card: #1e1e1e;
  --border: #2d2d2d;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--text);
  line-height: 1.6;
  transition: var(--transition);
  padding-bottom: 60px;
}

.app {
  min-height: 100vh;
  transition: var(--transition);
}
</style>