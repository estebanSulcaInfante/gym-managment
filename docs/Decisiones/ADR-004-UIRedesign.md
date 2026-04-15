# ADR 004 - Rediseño UI/UX y Sistema "Templo del Hierro"

## Contexto

El sistema de gestión de gimnasios contaba con interfaces funcionales pero carentes de identidad de marca propia, usando componentes predeterminados grises sin una paleta de colores cohesiva. Además, su usabilidad en entornos físicos (tales como recepciones de gimnasios, con condiciones de poca iluminación o reflejos de luz natural desde la calle) requería consideración.

## Decisiones

1. **Rechazo al "Full Dark Mode" absoluto**
   - Aunque un Modo Oscuro total encaja con la temática de gimnasio agresivo, las pantallas modernas en un entorno con baja o mediana luz ambiental pueden volverse "espejos" que reflejan al usuario si tienen fondos puramente `#000000`. 
   - **Solución:** Se implementó una arquitectura híbrida ("Anclaje oscuro y Superficie clara"). El Sidebar y el Login tienen un branding oscuro fuerte con texturas inversas, mientras que el área principal de trabajo (Dashboard) utiliza superficies blancas (`bg-white` a `slate-50`) asegurando un ratio de contraste adecuado para la lectura de datos sin forzar la vista por reflejos.

2. **Paleta de Marca: "Amarillo Corporativo" (#FACC15)**
   - Reemplazamos los tonos preestablecidos (azules/verdes) por el _Amarillo_ (`#FACC15`) de alto impacto. 
   - El amarillo sirve como ancla atencional para los CTA (Call to Action). Los botones de "Completar Conciliación" u opciones activas aplican brillo o un salto al presionar (`active:scale`).

3. **Arquitectura de Empatía en el Dashboard**
   - **Tono Empático:** En lugar del seco y robótico "Dashboard - Panel Central", se saluda dinámicamente según la hora del reloj del sistema. ("Buenos días, Administrador").
   - **Desensibilización de Alarmas:** Se remueven los fondos excesivamente rojos que generaban alerta en transacciones diarias pendientes. Ahora, las conciliaciones pendientes viven bajo un bloque "Actionable" neutro (oscuro u amarillo), reservando el color rojo solo para emergencias genuinas.

4. **Incorporación de Vectores y Patrones Visibles**
   - Se aplicó una textura visual en el fondo (un `bg-gym-pattern` de puntos de malla base64) para elevar la calidad percibida de "B2B SaaS genérico" a un "Software de Marca Premium".
   - El uso de un recurso visual rico en un logo `.svg` reemplaza los títulos que se formaban en texto plano, mejorando la marca.

## Consecuencias
- Al usar transiciones sin montar (`HeadlessUI Transition.Root` de `@headlessui/react`) evitamos recortes repentinos, el software reacciona suavemente.
- Hay mayor motivación en el personal receptor debido al *feel* premium y moderno.
