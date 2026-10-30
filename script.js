'use strict';

const contenido = window.MAPA_CONTENIDO;
const $ = (selector) => document.querySelector(selector);
const azar = (n) => Math.floor(Math.random() * n);
const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const iconos = {
  transform: '#i-transform',
  constraints: '#i-constraints',
  objective: '#i-objective',
  process: '#i-process',
  planning: '#i-planning'
};
const anchors = ['top', 'left', 'right', 'bottom-left', 'bottom-right'];

function barajar(lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = azar(i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function fmtTiempo(segundos) {
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`;
}

const estado = {
  momento: 1,
  tarjetas: [],
  espacios: [],
  seleccionTarjeta: null,
  seleccionEspacio: null,
  colocadas: 0,
  tiempoInicio: null,
  reloj: null,
  transicion: null,
  sonidoSilenciado: false
};

try { estado.sonidoSilenciado = localStorage.getItem('mapa-produccion-sonido') === 'off'; } catch (_) { /* almacenamiento opcional */ }

window.mapaEstado = estado;

const audio = {
  contexto: null,
  asegurar() {
    if (!this.contexto) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.contexto = new AudioContext();
    }
    if (this.contexto && this.contexto.state === 'suspended') this.contexto.resume();
    return this.contexto;
  },
  tono(frecuencia, duracion = 0.1, tipo = 'sine', volumen = 0.08, retraso = 0) {
    if (estado.sonidoSilenciado) return;
    const contexto = this.asegurar();
    if (!contexto) return;
    const inicio = contexto.currentTime + retraso;
    const oscilador = contexto.createOscillator();
    const ganancia = contexto.createGain();
    oscilador.type = tipo;
    oscilador.frequency.setValueAtTime(frecuencia, inicio);
    ganancia.gain.setValueAtTime(0.001, inicio);
    ganancia.gain.exponentialRampToValueAtTime(volumen, inicio + 0.012);
    ganancia.gain.exponentialRampToValueAtTime(0.001, inicio + duracion);
    oscilador.connect(ganancia).connect(contexto.destination);
    oscilador.start(inicio);
    oscilador.stop(inicio + duracion + 0.04);
  },
  tap() { this.tono(245, 0.05, 'square', 0.045); },
  correcto() {
    this.tono(540, 0.09, 'sine', 0.09);
    this.tono(760, 0.14, 'sine', 0.09, 0.08);
  },
  error() {
    this.tono(180, 0.12, 'triangle', 0.06);
    this.tono(135, 0.16, 'triangle', 0.05, 0.08);
  },
  completo() {
    this.tono(520, 0.1, 'sine', 0.08);
    this.tono(660, 0.1, 'sine', 0.08, 0.1);
    this.tono(820, 0.18, 'sine', 0.09, 0.2);
  }
};

function actualizarBotonesSonido() {
  const href = estado.sonidoSilenciado ? '#i-volume-off' : '#i-volume-on';
  const etiqueta = estado.sonidoSilenciado ? 'Activar sonido' : 'Silenciar sonido';
  document.querySelectorAll('.sound-button').forEach((boton) => {
    boton.setAttribute('aria-label', etiqueta);
    boton.setAttribute('aria-pressed', String(!estado.sonidoSilenciado));
    boton.querySelector('use').setAttribute('href', href);
  });
}

function alternarSonido() {
  estado.sonidoSilenciado = !estado.sonidoSilenciado;
  try { localStorage.setItem('mapa-produccion-sonido', estado.sonidoSilenciado ? 'off' : 'on'); } catch (_) { /* conservar preferencia de sesión */ }
  actualizarBotonesSonido();
  if (!estado.sonidoSilenciado) audio.tap();
}

function crearEspacios() {
  const posiciones = barajar(anchors);
  estado.espacios = barajar(contenido.caracteristicas).map((caracteristica, indice) => ({
    ...caracteristica,
    anchor: posiciones[indice],
    colocada: false
  }));
}

function tarjetaTexto(tarjeta) {
  return tarjeta.texto;
}

function prepararTarjetas() {
  if (estado.momento === 1) {
    const distractores = barajar(contenido.distractores).slice(0, 4);
    estado.tarjetas = barajar([...contenido.caracteristicas, ...distractores]).map((tarjeta) => ({
      ...tarjeta,
      correcta: Boolean(tarjeta.icono),
      colocada: false
    }));
  } else {
    estado.tarjetas = barajar(contenido.caracteristicas).map((tarjeta) => ({
      ...tarjeta,
      correcta: true,
      colocada: false
    }));
  }
}

function iniciarPartida() {
  window.clearTimeout(estado.transicion);
  window.clearInterval(estado.reloj);
  estado.momento = 1;
  estado.seleccionTarjeta = null;
  estado.seleccionEspacio = null;
  estado.colocadas = 0;
  crearEspacios();
  prepararTarjetas();
  cambiarPantalla('juego');
  estado.tiempoInicio = Date.now();
  estado.reloj = window.setInterval(actualizarReloj, 500);
  renderPartida();
  actualizarReloj();
}

function actualizarReloj() {
  if (!estado.tiempoInicio) return;
  $('#m-tiempo').textContent = fmtTiempo(Math.floor((Date.now() - estado.tiempoInicio) / 1000));
}

function renderPartida() {
  renderEncabezado();
  renderMapa();
  renderTarjetas();
  actualizarFeedback();
}

function renderEncabezado() {
  const reconstruir = estado.momento === 2;
  $('#stage-kicker').innerHTML = reconstruir ? 'MOMENTO 2 <span>/ 2</span>' : 'MOMENTO 1 <span>/ 2</span>';
  $('#game-title').textContent = reconstruir ? 'Reconstruir' : 'Reconocer';
  $('#game-instruction').textContent = reconstruir
    ? 'El banco quedó limpio. Vuelve a colocar las cinco tarjetas verdaderas.'
    : 'Encuentra una característica verdadera y colócala en el espacio que le corresponde.';
  $('#map-state').textContent = estado.colocadas === 5 ? 'MAPA COMPLETO' : 'MAPA INCOMPLETO';
  $('#m-contador').textContent = `${estado.colocadas}/5`;
  $('#bank-helper').textContent = reconstruir
    ? 'Solo quedan las cinco ideas del esquema. Reconstruye sin pistas de posición.'
    : 'Selecciona una tarjeta. Las distractoras también parecen de programación lineal.';
}

function renderMapa() {
  const contenedor = $('#slots');
  contenedor.innerHTML = '';
  estado.espacios.forEach((espacio) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = `map-slot anchor-${espacio.anchor}`;
    boton.dataset.id = espacio.id;
    boton.disabled = espacio.colocada;
    boton.setAttribute('aria-label', espacio.colocada ? `${espacio.texto}. Característica colocada.` : `Espacio de mapa. Pista: ${espacio.pista}`);
    boton.setAttribute('aria-pressed', String(estado.seleccionEspacio === espacio.id));
    boton.innerHTML = espacio.colocada
      ? `<span class="slot-icon slot-icon-filled"><svg class="icon"><use href="#i-check"></use></svg></span><span class="slot-text">${espacio.texto}</span>`
      : `<span class="slot-icon"><svg class="icon"><use href="${iconos[espacio.icono]}"></use></svg></span><span class="slot-text"><small>PISTA</small><b>toca para colocar</b></span>`;
    boton.addEventListener('click', () => pulsarEspacio(espacio.id));
    contenedor.appendChild(boton);
  });
}

function renderTarjetas() {
  const contenedor = $('#cards');
  contenedor.innerHTML = '';
  const visibles = estado.tarjetas.filter((tarjeta) => !tarjeta.colocada);
  visibles.forEach((tarjeta, indice) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = `game-card${tarjeta.correcta ? '' : ' distractor'}${estado.seleccionTarjeta === tarjeta.id ? ' is-selected' : ''}`;
    boton.dataset.id = tarjeta.id;
    boton.setAttribute('aria-pressed', String(estado.seleccionTarjeta === tarjeta.id));
    boton.setAttribute('aria-label', `Tarjeta ${indice + 1}: ${tarjetaTexto(tarjeta)}`);
    boton.innerHTML = `<span class="card-number">${String(indice + 1).padStart(2, '0')}</span><span class="card-text">${tarjetaTexto(tarjeta)}</span><span class="card-signal" aria-hidden="true"></span>`;
    boton.addEventListener('click', () => pulsarTarjeta(tarjeta.id));
    contenedor.appendChild(boton);
  });
  $('#bank-count').textContent = `${visibles.length} ${visibles.length === 1 ? 'activa' : 'activas'}`;
}

function pulsarTarjeta(id) {
  if (estado.momento === 0) return;
  const tarjeta = estado.tarjetas.find((item) => item.id === id);
  if (!tarjeta || tarjeta.colocada) return;
  audio.tap();
  if (estado.seleccionEspacio) {
    colocar(tarjeta, estado.seleccionEspacio);
    return;
  }
  estado.seleccionTarjeta = estado.seleccionTarjeta === id ? null : id;
  if (estado.seleccionTarjeta) {
    mostrarFeedback('Tarjeta seleccionada. Ahora toca la pista del mapa.', 'info');
  } else {
    mostrarFeedback('Selección cancelada. Elige una tarjeta para comenzar.', 'info');
  }
  renderTarjetas();
  renderMapa();
}

function pulsarEspacio(id) {
  const espacio = estado.espacios.find((item) => item.id === id);
  if (!espacio || espacio.colocada) return;
  audio.tap();
  if (estado.seleccionTarjeta) {
    const tarjeta = estado.tarjetas.find((item) => item.id === estado.seleccionTarjeta);
    colocar(tarjeta, id);
    return;
  }
  estado.seleccionEspacio = estado.seleccionEspacio === id ? null : id;
  if (estado.seleccionEspacio) {
    mostrarFeedback('Pista seleccionada. Ahora elige la tarjeta que conecta con ella.', 'info');
  } else {
    mostrarFeedback('Elige una tarjeta y luego un espacio del mapa.', 'info');
  }
  renderTarjetas();
  renderMapa();
}

function colocar(tarjeta, espacioId) {
  if (!tarjeta) return;
  const espacio = estado.espacios.find((item) => item.id === espacioId);
  if (!espacio || espacio.colocada) return;
  const esDistractor = !tarjeta.correcta;
  if (esDistractor) {
    estado.seleccionTarjeta = tarjeta.id;
    estado.seleccionEspacio = null;
    mostrarFeedback('No corresponde a una característica de este planteamiento. Intenta otra.', 'error');
    audio.error();
    renderTarjetas();
    renderMapa();
    return;
  }
  if (tarjeta.id !== espacio.id) {
    estado.seleccionTarjeta = tarjeta.id;
    estado.seleccionEspacio = null;
    mostrarFeedback('Sí pertenece al mapa, pero esta pista visual conecta con otra característica.', 'error');
    audio.error();
    renderTarjetas();
    renderMapa();
    return;
  }
  tarjeta.colocada = true;
  espacio.colocada = true;
  estado.seleccionTarjeta = null;
  estado.seleccionEspacio = null;
  estado.colocadas += 1;
  mostrarFeedback(espacio.feedback, 'success');
  audio.correcto();
  renderPartida();
  if (estado.colocadas === 5) completarMomento();
}

function mostrarFeedback(texto, tipo) {
  const feedback = $('#feedback');
  const icono = feedback.querySelector('use');
  feedback.hidden = false;
  feedback.classList.remove('success', 'error', 'info');
  feedback.classList.add(tipo);
  feedback.querySelector('#feedback-text').textContent = texto;
  icono.setAttribute('href', tipo === 'success' ? '#i-check' : (tipo === 'error' ? '#i-x' : '#i-info'));
}

function actualizarFeedback() {
  if (estado.seleccionTarjeta || estado.seleccionEspacio) return;
  if (estado.colocadas === 0) {
    mostrarFeedback('Elige una tarjeta para comenzar.', 'info');
  }
}

function completarMomento() {
  if (estado.momento === 1) {
    estado.momento = 0;
    estado.seleccionTarjeta = null;
    estado.seleccionEspacio = null;
    $('#stage-kicker').innerHTML = 'MOMENTO 1 <span>/ 2</span>';
    $('#game-title').textContent = 'Reconocimiento completo';
    $('#game-instruction').textContent = 'Muy bien. El mapa se limpia para que lo reconstruyas de memoria.';
    mostrarFeedback('Cinco de cinco. Prepárate para reconstruir el mapa.', 'success');
    window.clearTimeout(estado.transicion);
    estado.transicion = window.setTimeout(iniciarReconstruccion, motionReduced ? 350 : 1050);
  } else {
    window.clearInterval(estado.reloj);
    estado.momento = 0;
    audio.completo();
    mostrarResultado();
  }
}

function iniciarReconstruccion() {
  estado.momento = 2;
  estado.colocadas = 0;
  estado.seleccionTarjeta = null;
  estado.seleccionEspacio = null;
  crearEspacios();
  prepararTarjetas();
  renderPartida();
}

function renderMapaCompleto(contenedor, grande) {
  contenedor.innerHTML = `
    <svg class="review-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M50 46C50 34 50 23 50 6"/><path d="M40 52C28 45 17 36 5 33"/><path d="M60 52C72 45 83 36 95 33"/><path d="M42 63C28 72 17 81 5 91"/><path d="M58 63C72 72 83 81 95 91"/>
      <circle cx="50" cy="6" r="1.4"/><circle cx="5" cy="33" r="1.4"/><circle cx="95" cy="33" r="1.4"/><circle cx="5" cy="91" r="1.4"/><circle cx="95" cy="91" r="1.4"/>
    </svg>
    <div class="review-center"><span>CONCEPTO CENTRAL</span><h3>PLANTEAMIENTO DE<br>PROCESO DE<br>PRODUCCIÓN</h3><svg class="icon"><use href="#i-factory"></use></svg></div>
    <div class="review-slots"></div>`;
  const slots = contenedor.querySelector('.review-slots');
  const posiciones = ['top', 'left', 'right', 'bottom-left', 'bottom-right'];
  contenido.caracteristicas.forEach((caracteristica, indice) => {
    const item = document.createElement('div');
    item.className = `review-slot review-anchor-${posiciones[indice]} review-color-${indice + 1}`;
    item.innerHTML = `<span class="review-slot-icon"><svg class="icon"><use href="${iconos[caracteristica.icono]}"></use></svg></span><span>${caracteristica.texto}</span>`;
    slots.appendChild(item);
  });
  contenedor.classList.toggle('review-large', grande);
}

function mostrarResultado() {
  window.clearInterval(estado.reloj);
  $('#m-tiempo').textContent = fmtTiempo(Math.floor((Date.now() - estado.tiempoInicio) / 1000));
  renderMapaCompleto($('#result-map'), false);
  cambiarPantalla('resultado');
  window.setTimeout(() => $('#btn-view-map').focus(), motionReduced ? 0 : 400);
}

function cambiarPantalla(nombre) {
  const pantallas = ['inicio', 'juego', 'resultado', 'repaso'];
  pantallas.forEach((pantalla) => {
    $(`#pantalla-${pantalla}`).classList.toggle('is-hidden', pantalla !== nombre);
  });
  document.body.classList.toggle('is-playing', nombre === 'juego');
  window.scrollTo(0, 0);
}

function abrirRepaso() {
  renderMapaCompleto($('#full-map'), true);
  cambiarPantalla('repaso');
  $('#btn-back-result').focus();
}

document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape') {
    estado.seleccionTarjeta = null;
    estado.seleccionEspacio = null;
    if (!$('#pantalla-juego').classList.contains('is-hidden')) {
      mostrarFeedback('Selección cancelada. Elige una tarjeta para comenzar.', 'info');
      renderTarjetas();
      renderMapa();
    }
  }
});

$('#btn-comenzar').addEventListener('click', () => { audio.asegurar(); audio.tap(); iniciarPartida(); });
$('#btn-replay').addEventListener('click', () => { audio.tap(); iniciarPartida(); });
$('#btn-replay-review').addEventListener('click', () => { audio.tap(); iniciarPartida(); });
$('#btn-view-map').addEventListener('click', () => { audio.tap(); abrirRepaso(); });
$('#btn-back-result').addEventListener('click', () => { audio.tap(); cambiarPantalla('resultado'); });
document.querySelectorAll('.sound-button').forEach((boton) => boton.addEventListener('click', alternarSonido));

actualizarBotonesSonido();
