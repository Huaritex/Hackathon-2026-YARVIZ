# 🤖 YARVIZ // Tu Primer Asistente de IA Físico
> **Ensambla, programa y personaliza tu propio robot asistente inteligente con interfaz holográfica y privacidad local.**

[![Licencia](https://img.shields.io/badge/license-MIT-6366f1.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-19.2.6-teal.svg)](https://react.dev)
[![Three.js](https://img.shields.io/badge/three.js-0.184.0-black.svg)](https://threejs.org)
[![Vite](https://img.shields.io/badge/vite-8.0.12-6366f1.svg)](https://vite.dev)
[![GSAP](https://img.shields.io/badge/gsap-3.15.0-green.svg)](https://gsap.com)
[![Vitest](https://img.shields.io/badge/vitest-passed-teal.svg)](https://vitest.dev)

---

## 📌 Tabla de Contenidos
1. [🚀 Visión General y Elevator Pitch](#-visión-general-y-elevator-pitch)
2. [🛑 El Problema en el Mercado](#-el-problema-en-el-mercado)
3. [✨ La Solución YARVIZ](#-la-solución-yarviz)
4. [🛠️ Arquitectura de Software y Hardware](#️-arquitectura-de-software-y-hardware)
5. [📈 Viabilidad Comercial y Sostenibilidad](#-viabilidad-comercial-y-sostenibilidad)
6. [💡 Focos de Evaluación (Criterios del Jurado)](#-focos-de-evaluación-criterios-del-jurado)
7. [📅 Hoja de Ruta (Roadmap)](#-hoja-de-ruta-roadmap)
8. [💻 Guía de Inicio Rápido](#-guía-de-inicio-rápido)

---

## 🚀 Visión General y Elevator Pitch

> *"Esto no es un juguete. Es tu primer asistente de inteligencia artificial físico. Lo ensamblas. Lo programas. Lo personalizas."*

**YARVIZ** es un ecosistema híbrido (hardware DIY + software en la nube) que democratiza el acceso a la robótica inteligente y la inteligencia artificial física. Mediante planos de impresión 3D optimizados, esquemas electrónicos de bajo costo basados en el chip **ESP32**, y un cerebro en la nube impulsado por modelos de lenguaje avanzados con síntesis de voz fotorrealista (**ElevenLabs**), YARVIZ permite a estudiantes, makers y profesionales construir su propio compañero de escritorio inteligente.

A diferencia de los altavoces inteligentes pasivos o los robots de consumo prohibitivamente caros, YARVIZ combina **educación STEM real**, una **interfaz holográfica de bajo costo** basada en un prisma reflector de acrílico y la garantía absoluta de **privacidad local**, donde las API keys y datos personales nunca salen del hardware del usuario.

---

## 🛑 El Problema en el Mercado

1. **La Brecha del Aprendizaje Físico**: Aprender robótica e IA hoy en día suele limitarse a simuladores en pantalla o a seguir tutoriales teóricos aburridos. Los kits físicos suelen ser costosos o carecer de un propósito práctico real, lo que genera una tasa de abandono escolar/maker del 70%.
2. **Altos Costos de la Robótica Inteligente**: Los asistentes robóticos comerciales actuales con capacidades de conversación natural cuestan desde $500 hasta $3,000 USD, excluyendo a la clase media y a las instituciones educativas públicas de la revolución de la IA.
3. **Pérdida Crítica de Privacidad**: Dispositivos comerciales como Amazon Alexa o Google Nest transmiten constantemente audio y metadatos personales a la nube de grandes corporaciones tecnológicas, despertando justificados temores sobre el manejo de la privacidad en el hogar.
4. **Falta de Adaptabilidad**: Los sistemas actuales son cajas cerradas. El usuario no puede modificar su personalidad, clonar su voz o rediseñar la estética visual de su asistente.

---

## ✨ La Solución YARVIZ

* **Aprender Haciendo (DIY Real)**: Desde la impresión de las piezas en 3D hasta la soldadura de la placa y la programación del código, el usuario domina todo el ciclo de diseño de un producto tecnológico.
* **Ecosistema Abierto e Integrado**:
  * **Inteligencia Adaptable**: Personalidad y directrices del asistente configurables mediante un panel web intuitivo.
  * **Voz Ultra-Realista**: Integración nativa con ElevenLabs para clonación de voz y modulación fluida en español nativo.
  * **Display Holográfico**: Un prisma semitransparente montado sobre una pantalla OLED/TFT crea la ilusión óptica de un avatar animado tridimensional flotando en el aire.
  * **Seguridad por Diseño**: Almacenamiento cifrado local en la memoria flash no volátil del ESP32 para tokens de API, credenciales de Wi-Fi y registros.

---

## 🛠️ Arquitectura de Software y Hardware

El proyecto está diseñado bajo un modelo de arquitectura desacoplada para garantizar que cada componente pueda escalar independientemente:

```mermaid
graph TD
    subgraph Frontend Web (Three.js + React)
        A[Landing Page & Simulador 3D] --> B[Visualizador de Ensamble y Animación]
    end
    subgraph Cerebro del Asistente (Nube)
        C[ElevenLabs API] --> D[Síntesis de Voz Realista]
        E[Modelos LLM] --> F[Procesamiento del Lenguaje y Conducta]
    end
    subgraph Hardware YARVIZ (Físico)
        G[ESP32 Microcontrolador] --> H[Pantalla OLED + Prisma Reflector]
        G --> I[Altavoz I2S / DAC de Audio]
        G --> J[Memoria Flash Local Cifrada]
    end
    F -->|Respuestas de Texto| G
    D -->|Audio Stream| I
    G -->|Configuración de Personalidad| E
```

### 💻 Stack Tecnológico
* **Frontend interactivo**: [React 19](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/package.json#L19), [Vite 8](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/package.json#L43), [Three.js (WebGL)](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/package.json#L21) para la carga y renderizado interactivo de los archivos STL de hardware ([cuerpo.stl](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/public/models/cuerpo.stl) y [tapa.stl](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/public/models/tapa.stl)), y [GSAP (GreenSock)](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/package.json#L17) para el control del scrollytelling físico.
* **Ajustes Estéticos Avanzados**: Shaders GLSL personalizados ([hero.frag.glsl](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/src/gl/shaders/hero.frag.glsl)) que simulan una rejilla de datos en perspectiva (vignette interactivo por scroll) y un campo de partículas reactivo al ratón.
* **Generador de Contenido Audiovisual**: Proyecto de marketing en [video/](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/video) basado en [Remotion](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/video/package.json) para generar anuncios promocionales en alta definición (1080p @ 60fps) mediante código en React.
* **Firmware del Dispositivo (ESP32)**: Configuración C++ optimizada para comunicación socket y procesamiento rápido de animaciones en la pantalla integrada.

---

## 📈 Viabilidad Comercial y Sostenibilidad

Un proyecto de Hackathon solo es exitoso si demuestra que puede sostenerse financieramente y crecer tras el evento. YARVIZ plantea una estrategia de negocio clara, escalable y con márgenes excepcionales.

### 💰 Bill of Materials (BOM) - Costos de Fabricación del Hardware
El hardware se basa en componentes estándar de mercado, lo que permite un costo total extremadamente bajo para el usuario final:

| Componente | Descripción | Costo Unitario Promedio (USD) |
| :--- | :--- | :---: |
| **ESP32 NodeMCU** | Microcontrolador Wi-Fi & Bluetooth con flash de 4MB | $4.00 |
| **Pantalla OLED 1.3"** | Pantalla de alta relación de contraste para el reflector | $4.50 |
| **Prisma Acrílico** | Corte láser de plástico semitransparente reflector | $2.00 |
| **Filamento PLA (Impresión 3D)** | Aprox. 120 gramos de filamento plástico para el chasis | $3.00 |
| **DAC de Audio I2S (PCM5102)** | Placa de decodificación de audio de alta fidelidad | $3.00 |
| **Altavoz de 3W** | Transductor de audio miniatura de 4 Ohmios | $1.50 |
| **Cables y Botones** | Cables de prototipado, resistencias y switch de encendido | $1.00 |
| **Total Costo de Hardware (BOM)** | **El costo para ensamblar un YARVIZ funcional** | **$19.00 USD** |

> [!NOTE]
> Comparado con asistentes robóticos de consumo cerrado ($200+), YARVIZ reduce el costo de adquisición de hardware en más de un **90%**, convirtiéndolo en una solución ideal para instituciones educativas de bajo presupuesto.

### 💵 Estructura del Modelo de Negocios
YARVIZ opera mediante un modelo de negocio de **Suscripción y Descarga Digital Directa**, con costo marginal de distribución de $0 USD:

```
                  ┌───────────────────────────────┐
                  │      YARVIZ Monetization      │
                  └───────────────┬───────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌─────────────────────────────────┐               ┌─────────────────────────────────┐
│     Licencia Individual         │               │      Licencia Educativa         │
├─────────────────────────────────┤               ├─────────────────────────────────┤
│ • Starter: $10 (Planos + BOM)   │               │ • Starter: $49 (Escuela)        │
│ • Pro Builder: $15 (+ Código)   │               │ • Pro Builder: $79 (+ Guías)    │
│ • Masterclass: $20 (+ Videos)   │               │ • Masterclass: $99 (+ Rúbricas) │
└─────────────────────────────────┘               └─────────────────────────────────┘
```

#### 1. Licencia de Auto-Construcción (Makers e Individuales)
* **Starter ($10 USD - Pago Único)**: Acceso a planos de impresión 3D optimizados (`.STL`) y guías detalladas con enlaces directos de compra para electrónica.
* **Pro Builder ($15 USD - Pago Único)**: Todo lo anterior + Código fuente documentado para ESP32 + Esquemas de circuito y archivos Gerber de diseño de PCB.
* **Masterclass ($20 USD - Pago Único)**: Todo lo anterior + Biblioteca de videotutoriales paso a paso de ensamblaje + Kit inicial de animaciones holográficas exclusivas + Acceso a la comunidad VIP en Discord.

#### 2. Licencia de Aula (Educadores y Colegios)
* **Starter Aula ($49 USD/Año)**: Licencia de impresión en masa para escuelas y listas de inventario optimizadas para compras al por mayor.
* **Pro Builder Aula ($79 USD/Año)**: Todo lo anterior + Diapositivas explicativas listas para el aula + Plan de lecciones estructurado (Plan curricular de 5 horas de robótica e IA).
* **Masterclass Aula ($99 USD/Año)**: Todo lo anterior + Biblioteca de videotutoriales para alumnos + Rúbricas de evaluación del profesor + Soporte técnico directo para educadores.

---

## 💡 Focos de Evaluación (Criterios del Jurado)

* **Interacción Inmersiva en la Landing**: La página principal implementa un sistema interactivo en 3D impulsado por [GLManager.ts](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/src/gl/GLManager.ts) y [HeroSection.tsx](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/src/components/sections/HeroSection.tsx). A medida que el usuario hace scroll, las piezas del robot ([cuerpo.stl](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/public/models/cuerpo.stl) y [tapa.stl](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/public/models/tapa.stl)) se ensamblan y escalan dinámicamente frente a sus ojos, vendiendo la idea visualmente de forma inmediata.
* **Arquitectura de Componentes de la Landing**:
  * [HeroSection.tsx](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/src/components/sections/HeroSection.tsx): Controla la entrada del robot y animación del chasis.
  * [ProblemSection.tsx](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/src/components/sections/ProblemSection.tsx): Narra el problema del aprendizaje tecnológico clásico de forma dinámica.
  * [EcosystemSection.tsx](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/src/components/sections/EcosystemSection.tsx): Muestra el bento-grid de integraciones tecnológicas de YARVIZ.
  * [PricingSection.tsx](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/src/components/sections/PricingSection.tsx): Gestiona el selector interactivo de licencias individuales/aulas.
  * [FooterSection.tsx](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/src/components/sections/FooterSection.tsx): Proporciona un call-to-action masivo final y enlaces del ecosistema.
* **Robustez de Software**: Arquitectura con tipado estático en TypeScript, cobertura de pruebas unitarias implementadas con Vitest y estilos modulares responsivos.
* **Motor de Marketing Integrado**: La subcarpeta [/video/](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/video) contiene un generador automático de anuncios publicitarios en Remotion configurado en [YarvizPromo.tsx](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/video/src/YarvizPromo.tsx). Al configurar una clave de ElevenLabs y ejecutar el script [generate-elevenlabs-voiceover.ts](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/video/scripts/generate-elevenlabs-voiceover.ts), el proyecto compila un video comercial personalizado con voz realista y gráficos sincronizados automáticamente mediante código, simplificando la distribución del producto.
* **Viabilidad de Mercado**: La baja barrera de costo ($19 USD de hardware) y el modelo SaaS/Descarga digital garantizan rentabilidad inmediata.

---

## 📅 Hoja de Ruta (Roadmap)

### Fase 1: Lanzamiento de Ecosistema Open-Source (Q3 2026)
* Liberación de planos 3D del chasis YARVIZ Pocket y Tapa Deslizable.
* Lanzamiento de la plataforma de documentación y foro comunitario.
* Integración básica con APIs públicas de LLMs comerciales.

### Fase 2: Alianzas Educativas STEM (Q4 2026)
* Desarrollo de la aplicación móvil de configuración Bluetooth.
* Programas piloto en 5 colegios secundarios locales utilizando las guías del plan de aula.
* Integración nativa de voces de marca personalizadas mediante ElevenLabs.

### Fase 3: Kits Físicos y Marketplace (Q2 2027)
* Lanzamiento del "YARVIZ Ready-to-Build Box" (envío físico de componentes electrónicos pre-soldados y chasis impreso en 3D).
* Marketplace de animaciones holográficas y skins de personalidad premium.

---

## 💻 Guía de Inicio Rápido

Sigue estos pasos para compilar, probar y ejecutar el ecosistema de Yarviz localmente.

### 📋 Requisitos Previos
* **Node.js**: Versión 18 o superior.
* **NPM** o **Yarn** instalado.

### 🌐 Ejecución de la Plataforma Web Interactiva
1. Clona el repositorio y navega a la raíz:
   ```bash
   git clone https://github.com/Huaritex/Hackathon-2026-YARVIZ.git
   cd Hackathon-2026-YARVIZ
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Ejecuta el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173) en tu navegador para ver la landing interactiva 3D con shaders.
4. Para ejecutar las pruebas unitarias y de rendering:
   ```bash
   npm run test
   ```

---

### 🎥 Configuración y Renderizado de Videos Promocionales (Remotion)
El proyecto incluye un generador de video automatizado en el directorio [/video](file:///home/huaritex/Desktop/Proyectos_Desarrollo/Hackthon_2026/video).

1. Navega a la subcarpeta de video:
   ```bash
   cd video
   npm install
   ```
2. *(Opcional)* Generar audio de locución realista con ElevenLabs:
   ```bash
   export ELEVENLABS_API_KEY=tu_clave_de_api
   npx ts-node scripts/generate-elevenlabs-voiceover.ts
   ```
3. Inicia la previsualización interactiva de Remotion Studio:
   ```bash
   npm start
   ```
   Se abrirá la consola de edición en [http://localhost:3000](http://localhost:3000) con la secuencia del video promocional sincronizado.
4. Renderiza y exporta la versión final del video publicitario en formato MP4:
   ```bash
   npm run render
   ```
   El video de salida se guardará en `video/out/yarviz-promo.mp4`.

---

## 👥 El Equipo Detrás de YARVIZ

Diseñado y construido con pasión tecnológica para la Hackathon 2026. 

* **Huaritex** - Arquitectura de Hardware, Programación de Firmware e Integración de IA.

---
*Este proyecto está protegido bajo la Licencia MIT. Siéntete libre de clonarlo, mejorarlo y hackear el futuro.*
