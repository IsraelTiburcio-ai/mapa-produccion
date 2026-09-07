# MAPA DE PRODUCCIÓN

Microjuego educativo web para completar las características del **Planteamiento de
proceso de producción**. Pertenece al **Gimnasio 2. Modelos de Programación Lineal**
de Optimización I.

## Objetivo

Que el alumno reconozca y recuerde las cinco ideas del esquema de la profesora para
poder llenar posteriormente el cuadro del material. La experiencia es teórica: no
resuelve Simplex, no pide cálculos largos y no desarrolla un modelo numérico completo.

## Fuente académica

Fuente principal: `GYM 2_251005_202412 (1).pdf`, página 37, revisada visualmente.

El juego conserva la redacción indicada para las cinco respuestas:

1. **Transformación de productos**
2. **Se manejan dos restricciones (materia prima y producto)**
3. **Función objetivo maximizada**
4. **Caso particular de planeación de producción**
5. **Restricciones: establecer el proceso de transformación**

Como apoyo breve de memoria se menciona el ejemplo de la página 37: el guarapo se
transforma sucesivamente en azúcar morena, blanca y glas. No se solicita resolverlo.

## Mecánica

- **Momento 1 - Reconocer:** banco de 5 tarjetas correctas y 4 distractores plausibles.
- **Momento 2 - Reconstruir:** se limpia el mapa y se vuelven a colocar las 5 tarjetas
  correctas, barajadas.
- En celular la mecánica principal es **tocar una tarjeta y tocar el espacio del mapa**.
  También funciona con teclado mediante foco, `Enter` o `Espacio`; `Escape` cancela la
  selección.
- Cada espacio tiene una pista visual propia, pero no muestra la respuesta antes de
  elegirla. La posición de los espacios y el orden de las tarjetas cambian por partida.
- La duración objetivo es de **45 a 90 segundos**.
- Incluye feedback inmediato, contador `5/5`, repaso del mapa completo, botón de replay,
  sonido sintetizado opcional y mute persistente.

## Banco de distractores

Se incluyen **12 distractores** plausibles de Programación Lineal y se eligen 4 en cada
partida. No se mezclan con las cinco características académicas en el segundo momento.

## Stack

HTML, CSS y JavaScript vanilla. SVG propio para la fábrica, flujo, conectores e iconos.
No hay backend, login, frameworks ni dependencias de ejecución.

## Uso local

Abrir directamente:

```sh
open index.html
```

O servir la carpeta:

```sh
python3 -m http.server 8000
```

Después visitar `http://localhost:8000`.

## Estructura

```text
index.html                 Pantallas, SVG e interfaz accesible
styles.css                 Diseño mobile-first y responsive
data.js                    Contenido académico separado de la lógica
script.js                  Estado, mecánica, audio y navegación
assets/favicon.svg         Favicon SVG propio
.github/workflows/pages.yml  Deploy automático a GitHub Pages
```

## Publicación

- **Repositorio:** `https://github.com/israeltiburcio-ai/mapa-produccion`
- **URL publicada:** `https://israeltiburcio-ai.github.io/mapa-produccion/`
- **Rama de publicación:** `main`
- El workflow de `.github/workflows/pages.yml` publica el sitio estático con GitHub
  Actions y GitHub Pages en cada push a `main`.

## Accesibilidad

Contraste alto, botones semánticos de al menos 44 px, foco visible, `aria-label`,
`aria-live`, estados `aria-pressed`, operación sin hover y soporte de
`prefers-reduced-motion`. Los aciertos y errores se comunican con texto e iconos,
no solo con color.
