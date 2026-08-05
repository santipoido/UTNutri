# 🥗 UTNutri - Gestor de Pacientes para Nutricionistas

Un **gestor de pacientes** diseñado para nutricionistas, que permite administrar consultas, planes nutricionales, turnos y seguimiento de progreso de forma eficiente y visual.

---

## 📋 ¿Qué es UTNutri?

UTNutri es una aplicación construida con **Angular 20** que facilita la gestión de pacientes en consultorios nutricionales. El proyecto utiliza Springboot para generar el backend, y SQL como base de datos.

### Características principales:

✅ **Gestión de Pacientes**
- Crear, editar y eliminar pacientes
- Búsqueda en tiempo real por nombre, correo o teléfono
- Ficha detallada de cada paciente
- Listado responsive y adaptable

✅ **Historial de Consultas**
- Registrar consultas con peso, altura, porcentaje de grasa y masa muscular
- Tabla responsive con vista de tarjetas en móvil
- Gráficos para ver la evolución del paciente

✅ **Plan Nutricional**
- Crear y editar planes personalizados
- Organización por comidas: desayuno, almuerzo, merienda, cena
- Sección de snacks y notas personales
- Opción para exportar el plan en PDF

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
| **Springboot** | Latest | Backend |
| **SQL** | Latest | Base de datos |

---

## 📱 Características Responsivas

La aplicación es **100% responsive**:
- 🖥️ **Desktop**: Tabla completa con todas las columnas
- 📱 **Tablet**: Tabla scrollable horizontalmente
- 📱 **Mobile**: Tarjetas con datos alineados (sin perder funcionalidad)

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

## 🎯 Futuras Mejoras

- [ ] Notificaciones de turnos próximos
- [ ] Integración con calendarios (Google Calendar, Outlook)
- [ ] Modo oscuro
- [ ] Multiidioma

---

## 📄 Licencia

Proyecto de código abierto. 

---
