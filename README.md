# 🥗 UTNutri - Gestor de Pacientes para Nutricionistas

Un **gestor integral de pacientes** diseñado para nutricionistas, que permite administrar consultas, planes nutricionales, turnos y seguimiento de progreso de forma eficiente y visual.

---

## 📋 ¿Qué es UTNutri?

UTNutri es una aplicación **frontend moderna** construida con **Angular 20** que facilita la gestión de pacientes en consultorios nutricionales. El proyecto utiliza **JSON Server** como simulador de base de datos local, lo que permite una experiencia completa sin necesidad de un backend real.

### Características principales:

✅ **Gestión de Pacientes**
- Crear, editar y eliminar pacientes
- Búsqueda en tiempo real por nombre, correo o teléfono
- Ficha detallada de cada paciente
- Listado responsive y adaptable

✅ **Historial de Consultas**
- Registrar consultas con peso, altura, porcentaje de grasa y masa muscular
- Visualización de evolución del paciente
- Tabla responsive con vista de tarjetas en móvil

✅ **Plan Nutricional**
- Crear y editar planes personalizados
- Organización por comidas: desayuno, almuerzo, merienda, cena
- Sección de snacks y notas personales

✅ **Sistema de Turnos**
- Agendar turnos con fecha y hora
- Editar turnos existentes ("Reprogramar")
- Validación automática de horarios (7:00 - 19:00)
- Estados: Pendiente, Realizado, Cancelado

✅ **Autenticación**
- Login seguro
- Protección de rutas con guards
- Redirección automática para usuarios no autenticados

---

## 🚀 Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Angular** | 20 | Framework frontend |
| **TypeScript** | Latest | Lenguaje tipado |
| **RxJS** | Latest | Manejo reactivo |
| **Angular Signals** | Latest | Estado reactivo moderno |
| **JSON Server** | Latest | Simulador de base de datos |
| **CSS Moderno** | - | Estilos responsive |

### Sin Backend:
- ❌ **No hay servidor Node.js/Express**
- ❌ **No hay base de datos real (SQL/MongoDB)**
- ✅ **JSON Server** simula la API REST
- ✅ Los datos se almacenan en `database/db.json`

---

## 📱 Características Responsivas

La aplicación es **100% responsive**:
- 🖥️ **Desktop**: Tabla completa con todas las columnas
- 📱 **Tablet**: Tabla scrollable horizontalmente
- 📱 **Mobile**: Tarjetas con datos alineados (sin perder funcionalidad)

---

## 📂 Estructura del Proyecto

```
src/
├── app/
│   ├── auth/                    # Autenticación y login
│   ├── paciente/
│   │   ├── lista-pacientes/     # Listado con búsqueda
│   │   ├── form-pacientes/      # Crear/editar paciente
│   │   ├── ficha-paciente/      # Detalle del paciente
│   │   └── paciente-client.ts   # Servicio HTTP
│   ├── consultas/
│   │   ├── form-consultas/      # Agregar consulta
│   │   ├── historial-consultas/ # Ver historial
│   │   └── cliente-turnos.ts    # Servicio HTTP
│   ├── plan-nutricional/        # Gestión del plan
│   ├── turnos/                  # Sistema de turnos
│   └── app.routes.ts            # Rutas de la app
├── styles.css                   # Estilos globales
└── index.html                   # HTML principal

database/
└── db.json                      # Base de datos (JSON Server)
```

---

## 🔧 Instalación y Ejecución

### Requisitos Previos
- **Node.js** (v18 o superior)
- **npm** o **yarn**

### Pasos para ejecutar:

1. **Clonar o descargar el repositorio**
   ```bash
   cd UTNutri
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar JSON Server (base de datos simulada)**
   ```bash
   npm run json-server
   ```
   Esto levantará la API en `http://localhost:3000`

4. **Iniciar la aplicación Angular**
   ```bash
   npm start
   ```
   La app se abrirá en `http://localhost:4200`

5. **Credenciales de Login**
   - Usuario: `admin`
   - Contraseña: `admin`

---

## 📊 Flujo de Uso

```
Login
  ↓
Dashboard / Turnos
  ↓
├─ Gestionar Pacientes
│  ├─ Crear paciente
│  ├─ Buscar paciente
│  └─ Ver ficha detallada
│     ├─ Historial de consultas
│     ├─ Plan nutricional
│     └─ Agendar turnos
│
├─ Registrar Consulta
│  └─ Guardar medidas y observaciones
│
└─ Sistema de Turnos
   ├─ Agendar nuevo turno
   ├─ Reprogramar turno
   └─ Cancelar turno
```

---

## 🎨 Interfaz y Diseño

- **Color primario**: Verde (#20DF6C) - transmite salud y bienestar
- **Diseño limpio**: Interfaz intuitiva y fácil de navegar
- **Dark mode ready**: Estructura CSS adaptable
- **Accesibilidad**: Botones claros, texto legible, contraste adecuado

---

## ✨ Funcionalidades Destacadas

### 🔍 Búsqueda en Tiempo Real
- Busca pacientes mientras escribes
- Filtra por nombre, correo o teléfono
- Muestra cantidad de resultados

### 📅 Validación de Turnos
- No permite agendar en el pasado
- Valida horario entre 7:00 y 19:00
- Actualiza automáticamente estados vencidos

### 📈 Seguimiento de Progreso
- Visualiza evolución de peso
- Controla porcentaje de grasa y masa muscular
- Historial completo de mediciones

### 📝 Planes Personalizados
- Crea planes por comida
- Añade snacks y notas especiales
- Edita según necesidad del paciente

---

## 🤔 Preguntas Frecuentes

**¿Dónde se guardan los datos?**
- En `database/db.json` (local). Los datos persisten mientras JSON Server esté activo.

**¿Puedo usar una base de datos real?**
- Sí, solo necesitarías reemplazar las URLs en los servicios HTTP (`paciente-client.ts`, `cliente-turnos.ts`) por las de tu backend real.

**¿Cómo agrego nuevos pacientes?**
- Haz click en "Agregar Paciente" en la lista de pacientes y completa el formulario.

**¿Qué pasa si pierdo la conexión a JSON Server?**
- Aparecerá un error. Asegúrate de que JSON Server esté corriendo en `http://localhost:3000`.

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| Puerto 4200 en uso | Usa `ng serve --port 4200 --disable-host-check` o cierra otras instancias |
| JSON Server no inicia | Verifica que `database/db.json` existe y tiene formato válido |
| Datos no se guardan | Asegúrate de que JSON Server esté en `http://localhost:3000` |

---

## 📝 Notas de Desarrollo

- El proyecto usa **Angular Signals** para manejo reactivo moderno
- Cada módulo tiene su propio servicio HTTP (`*-client.ts`)
- Las rutas están protegidas con **Guards de autenticación**
- CSS es **100% responsive** con media queries para móvil, tablet y desktop
- No hay necesidad de un servidor backend externo

---

## 🎯 Futuras Mejoras

- [ ] Gráficos de evolución del paciente
- [ ] Notificaciones de turnos próximos
- [ ] Integración con calendarios (Google Calendar, Outlook)
- [ ] Modo oscuro
- [ ] Multiidioma

---

## 📄 Licencia

Proyecto de código abierto. 

---

**Desarrollado con ❤️ para nutricionistas** | *UTNutri*
