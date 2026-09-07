/* Contenido académico del mapa. La redacción sigue visualmente la página 37. */
window.MAPA_CONTENIDO = {
  titulo: 'Planteamiento de proceso de producción',
  fuente: 'Gimnasio 2. Modelos de Programación Lineal, página 37',
  ejemplo: 'El guarapo se transforma sucesivamente en azúcar morena, azúcar blanca y azúcar glas.',
  caracteristicas: [
    {
      id: 'transformacion',
      texto: 'Transformación de productos',
      icono: 'transform',
      pista: 'Una entrada cambia de forma antes de convertirse en salida.',
      feedback: 'Correcto. El planteamiento contempla la transformación de productos.',
      ejemplo: true
    },
    {
      id: 'restricciones',
      texto: 'Se manejan dos rest. (materia prima y producto)',
      icono: 'constraints',
      pista: 'Observa los dos límites que acompañan al proceso.',
      feedback: 'Correcto. Se manejan dos rest.: materia prima y producto.'
    },
    {
      id: 'objetivo',
      texto: 'Función objetivo maximizada',
      icono: 'objective',
      pista: 'La meta del planteamiento apunta hacia arriba.',
      feedback: 'Correcto. La función objetivo aparece maximizada.'
    },
    {
      id: 'proceso',
      texto: 'Rest. Establecer el proceso de transformación',
      icono: 'process',
      pista: 'Sigue el recorrido entre las etapas conectadas.',
      feedback: 'Correcto. La restricción establece el proceso de transformación.'
    },
    {
      id: 'planeacion',
      texto: 'Caso particular de planeación de producción',
      icono: 'planning',
      pista: 'La fábrica necesita decidir qué producir.',
      feedback: 'Correcto. Es un caso particular de planeación de producción.'
    }
  ],
  distractores: [
    { id: 'd01', texto: 'Función objetivo minimizada' },
    { id: 'd02', texto: 'Método gráfico obligatorio' },
    { id: 'd03', texto: 'Región factible triangular' },
    { id: 'd04', texto: 'Una sola variable de decisión' },
    { id: 'd05', texto: 'Restricciones exclusivamente de demanda' },
    { id: 'd06', texto: 'Modelo de transporte' },
    { id: 'd07', texto: 'Método Simplex' },
    { id: 'd08', texto: 'Balance de inventario por periodos' },
    { id: 'd09', texto: 'Modelo matricial' },
    { id: 'd10', texto: 'Variables enteras y no negativas' },
    { id: 'd11', texto: 'Dos tipos de producto' },
    { id: 'd12', texto: 'Maximizar los costos de producción' }
  ]
};
