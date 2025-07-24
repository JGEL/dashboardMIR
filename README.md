Creada con AI Studio app

Se trata de un Dashboard de Rendimiento del Examen MIR, una aplicación web interactiva y muy completa construida con React, TypeScript y TailwindCSS.

Su objetivo es permitir a los usuarios explorar y analizar en profundidad los datos históricos del examen MIR en España desde 2014 hasta 2025.

La aplicación es especialmente potente por sus dos modos de visualización principales:

* Modo Comparativo: Permite a los usuarios seleccionar un año específico y comparar hasta cinco universidades. Los datos se visualizan mediante gráficos de barras y una tabla detallada, facilitando la comparación de métricas clave como el número de admitidos, las plazas adjudicadas y los porcentajes de éxito.

* Modo de Evolución: Permite a los usuarios seleccionar varias universidades y métricas para visualizar su rendimiento a lo largo del tiempo. Gráficos de líneas muestran las tendencias anuales, lo que facilita la identificación de patrones de mejora, estancamiento o declive.
  
Una característica destacada es la integración con la IA de Google Gemini. Con solo un clic, los usuarios pueden generar un análisis de texto automático de los datos que han seleccionado. La IA interpreta los gráficos y tablas para ofrecer un resumen conciso con las conclusiones más importantes, ya sea comparando universidades en un año o analizando su evolución a lo largo del tiempo.

Técnicamente, la aplicación está bien estructurada, utilizando componentes de React reutilizables para los selectores, gráficos (con la librería recharts) y tablas. No requiere un backend, ya que todos los datos están convenientemente almacenados en el frontend, lo que la hace rápida y totalmente funcional sin conexión a internet una vez cargada.
