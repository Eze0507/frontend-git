# 📊 Guía de Testing - Módulo de Reportes

## ✅ Archivos Creados

### Frontend
```
src/
├── api/
│   └── reportesApi.jsx                          ✅ Servicio API completo
└── pages/
    └── reportes/
        ├── ReportesPage.jsx                     ✅ Página principal con tabs
        ├── ReportesEstaticos.jsx                ✅ UI para reportes estáticos (Fase 1)
        ├── ReportesPersonalizados.jsx           ✅ UI para reportes personalizados (Fase 2)
        └── components/
            ├── SelectorEntidad.jsx              ✅ Grilla de entidades
            ├── SelectorCampos.jsx               ✅ Checkboxes para campos
            └── FiltrosDinamicos.jsx             ✅ Inputs dinámicos por tipo
```

### Configuración
- ✅ Ruta agregada en `AppRouter.jsx`: `/admin/finanzas/reportes` (solo admin)
- ✅ Link ya existente en `sidebar.jsx`

---

## 🧪 Plan de Pruebas

### 1. Reportes Estáticos (Fase 1)

#### Test 1.1: Lista de Reportes Disponibles
1. Navegar a `/admin/finanzas/reportes`
2. Verificar que se muestran **2 tabs**: "Estáticos" y "Personalizados"
3. En tab "Estáticos", verificar dropdown con **5 opciones**:
   - ✅ Órdenes por Estado
   - ✅ Órdenes Pendientes  
   - ✅ Órdenes Completadas (Mes Actual)
   - ✅ Ingresos Mensuales
   - ✅ Items Críticos en Inventario

#### Test 1.2: Generar Reporte PDF
1. Seleccionar "Ingresos Mensuales"
2. Seleccionar formato **PDF** (botón azul)
3. Mantener fechas por defecto (último mes)
4. Click en "Generar Reporte"
5. Verificar:
   - ✅ Spinner de carga
   - ✅ Descarga automática de archivo PDF
   - ✅ PDF contiene tabla con datos

#### Test 1.3: Generar Reporte Excel
1. Seleccionar "Items Críticos en Inventario"
2. Seleccionar formato **XLSX** (botón verde)
3. Click en "Generar Reporte"
4. Verificar:
   - ✅ Descarga automática de archivo XLSX
   - ✅ Excel contiene hoja con datos formateados

#### Test 1.4: Filtros de Fecha
1. Seleccionar "Órdenes Completadas (Mes Actual)"
2. Cambiar fecha_desde a `2024-01-01`
3. Cambiar fecha_hasta a `2024-12-31`
4. Generar reporte
5. Verificar que los datos respetan el rango de fechas

---

### 2. Reportes Personalizados (Fase 2)

#### Test 2.1: Flujo Completo - Órdenes de Trabajo

**Paso 1: Selección de Entidad**
1. Click en tab "Personalizados"
2. Verificar que se muestran **4 tarjetas**:
   - 🔷 Órdenes de Trabajo (18 campos, 9 filtros)
   - 🟢 Clientes (10 campos, 6 filtros)
   - 🟣 Vehículos (12 campos, 6 filtros)
   - 🟠 Items de Inventario (8 campos, 5 filtros)
3. Click en tarjeta "Órdenes de Trabajo"
4. Verificar que avanza a **Paso 2**

**Paso 2: Selección de Campos**
1. Verificar que aparece lista de **18 campos** con checkboxes
2. Click en "Seleccionar Todos"
3. Verificar que todos se marcan (fondo azul)
4. Deseleccionar algunos campos manualmente
5. Verificar contador: "X de 18 campos seleccionados"
6. Asegurar que al menos 1 campo está seleccionado
7. Click en "Siguiente"
8. Verificar que avanza a **Paso 3**

**Paso 3: Configurar Filtros (Opcional)**
1. Verificar sección "Filtros (Opcional)"
2. Click en "Agregar Filtro"
3. Seleccionar filtro "Estado"
4. Verificar que aparece dropdown con opciones:
   - PENDIENTE, EN_PROGRESO, COMPLETADO, CANCELADO
5. Seleccionar "EN_PROGRESO"
6. Agregar otro filtro "Fecha de Inicio (desde)"
7. Seleccionar una fecha (input tipo date)
8. Verificar que se puede eliminar filtro con botón de basura

**Paso 4: Generar Reporte**
1. Seleccionar formato PDF o XLSX
2. Click en "Generar Reporte Personalizado"
3. Verificar:
   - ✅ Descarga automática
   - ✅ Archivo contiene solo los campos seleccionados
   - ✅ Datos están filtrados correctamente

#### Test 2.2: Flujo con Clientes

1. Click en tarjeta "Clientes"
2. Seleccionar campos:
   - ✅ Nombre
   - ✅ Email
   - ✅ Teléfono
   - ✅ Fecha de Registro
3. Agregar filtro "Ciudad" (tipo text)
4. Escribir "Santo Domingo"
5. Generar reporte
6. Verificar que solo aparecen clientes con "Santo Domingo" en la ciudad

#### Test 2.3: Flujo con Vehículos

1. Click en tarjeta "Vehículos"
2. Seleccionar campos:
   - ✅ Placa
   - ✅ Marca
   - ✅ Modelo
   - ✅ Año
3. Agregar filtro "Año (mayor o igual que)"
4. Escribir "2020"
5. Generar reporte
6. Verificar que solo aparecen vehículos del 2020 en adelante

#### Test 2.4: Validaciones

**Validación: Campos Vacíos**
1. Entrar a Paso 2
2. Deseleccionar todos los campos
3. Intentar hacer click en "Siguiente"
4. Verificar mensaje de advertencia: ⚠️ "Debes seleccionar al menos un campo"

**Validación: Filtros Inválidos**
1. Agregar filtro de número
2. Dejar el valor vacío
3. Intentar generar reporte
4. Verificar que el backend retorna error 400

---

## 🔧 Comandos de Testing

### Verificar Backend (desde backend-git/)
```powershell
# Activar entorno virtual
.\env\Scripts\Activate.ps1

# Verificar migraciones
python manage.py showmigrations servicios_IA

# Ejecutar tests automatizados
python test_reportes_personalizados.py

# Verificar entidades disponibles
python manage.py shell
>>> from servicios_IA.utils.whitelist import ENTIDADES_DISPONIBLES
>>> list(ENTIDADES_DISPONIBLES.keys())
['ordenes', 'clientes', 'vehiculos', 'items']
```

### Verificar Frontend (desde frontend-git/)
```powershell
# Instalar dependencias (si no están)
npm install

# Iniciar dev server
npm run dev

# Compilar para producción
npm run build
```

---

## 📝 Checklist de Integración

### Backend
- [x] Modelo `Reporte` creado y migrado
- [x] 4 serializers funcionando
- [x] 6 endpoints configurados
- [x] Whitelist con 4 entidades configuradas
- [x] Generadores PDF y Excel
- [x] Tests automatizados pasando

### Frontend
- [x] API service con 7 funciones
- [x] ReportesPage con navegación por tabs
- [x] ReportesEstaticos con formulario completo
- [x] ReportesPersonalizados con wizard de 3 pasos
- [x] SelectorEntidad con grilla de tarjetas
- [x] SelectorCampos con checkboxes
- [x] FiltrosDinamicos con inputs según tipo
- [x] Ruta `/admin/finanzas/reportes` configurada
- [x] Link en sidebar existente

### Pendiente
- [ ] Probar generación de reportes estáticos
- [ ] Probar generación de reportes personalizados
- [ ] Verificar descarga de archivos
- [ ] Revisar estilos en diferentes resoluciones
- [ ] Agregar mensajes de error más descriptivos (opcional)

---

## 🎯 Casos de Uso Reales

### Caso 1: Informe Mensual para Gerencia
- **Reporte**: Ingresos Mensuales
- **Formato**: PDF
- **Frecuencia**: Fin de mes
- **Filtros**: Mes actual

### Caso 2: Seguimiento de Órdenes Activas
- **Entidad**: Órdenes de Trabajo
- **Campos**: Cliente, Vehículo, Estado, Fecha Inicio, Monto Total
- **Filtros**: Estado = EN_PROGRESO
- **Formato**: Excel (para análisis en hojas de cálculo)

### Caso 3: Base de Datos de Clientes
- **Entidad**: Clientes
- **Campos**: Nombre, Email, Teléfono, Ciudad, Fecha de Registro
- **Filtros**: Ninguno (todos los clientes)
- **Formato**: Excel (para campañas de marketing)

### Caso 4: Inventario Crítico
- **Reporte**: Items Críticos en Inventario
- **Formato**: PDF
- **Uso**: Alertas semanales de reabastecimiento

---

## 🚀 Próximos Pasos (Fase 3 - Opcional)

### Reportes en Lenguaje Natural
- [ ] Crear input de texto/voz
- [ ] Integrar `dateparser` para fechas
- [ ] Parsear intenciones con GPT-4 o similar
- [ ] Mapear a configuración de reporte personalizado
- [ ] Ejecutar y descargar

### Mejoras Adicionales
- [ ] Historial de reportes generados (endpoint ya existe)
- [ ] Programar reportes automáticos
- [ ] Enviar por email
- [ ] Dashboard de métricas en tiempo real

---

## ⚠️ Troubleshooting

### Error: "ENTIDADES_DISPONIBLES no definido"
- Verificar que `servicios_IA/utils/whitelist.py` existe
- Reiniciar el servidor Django

### Error: "Cannot read properties of undefined (reading 'campos_disponibles')"
- Verificar que `obtenerEntidades()` retorna datos correctos
- Revisar en Network tab del navegador la respuesta del backend

### Descarga no funciona
- Verificar que `Content-Disposition` header está presente
- Comprobar que el archivo se guarda en `media/reportes/`
- Revisar permisos del directorio `media/`

### Estilos rotos
- Ejecutar `npm install` para asegurar que Tailwind está instalado
- Verificar que `tailwind.config.js` incluye `./src/**/*.{js,jsx}`

---

¡Todo el frontend de la Fase 1 y Fase 2 está listo para testing! 🎉
