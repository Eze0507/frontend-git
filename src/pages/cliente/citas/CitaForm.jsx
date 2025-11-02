import React, { useState, useEffect } from "react";
import { FaTimes, FaCalendarAlt, FaClock } from "react-icons/fa";
import { toApiCita } from "../../../api/citasApi.jsx";

const CitaForm = ({
  onSubmit,
  onCancel,
  initialData,
  clientes = [],
  vehiculos = [],
  empleados = [],
  selectedDate = null,
}) => {
  const [userRole, setUserRole] = useState(null);
  const [form, setForm] = useState({
    cliente: "",
    vehiculo: "",
    empleado: "", // Agregar campo para seleccionar empleado
    fecha_dia: "", // Solo el día
    hora_inicio: "", // Solo la hora de inicio
    hora_fin: "", // Solo la hora de fin
    tipo_cita: "reparacion",
    estado: "pendiente",
    descripcion: "",
    nota: "",
  });

  const [vehiculosCliente, setVehiculosCliente] = useState([]);
  
  // Cargar el perfil del empleado actual al montar el componente
  useEffect(() => {
    // Obtener el rol del usuario
    const role = localStorage.getItem('userRole');
    setUserRole(role ? role.toLowerCase() : null);
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      const fechaDia = initialData.fecha_hora_inicio
        ? new Date(initialData.fecha_hora_inicio).toISOString().slice(0, 10)
        : "";
      const horaInicio = initialData.fecha_hora_inicio
        ? new Date(initialData.fecha_hora_inicio).toISOString().slice(11, 16)
        : "";
      const horaFin = initialData.fecha_hora_fin
        ? new Date(initialData.fecha_hora_fin).toISOString().slice(11, 16)
        : "";

      setForm({
        cliente: initialData.cliente || initialData.cliente_info?.id || "",
        vehiculo: initialData.vehiculo || initialData.vehiculo_info?.id || "",
        empleado: initialData.empleado || initialData.empleado_info?.id || "",
        fecha_dia: fechaDia,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        tipo_cita: initialData.tipo_cita || "reparacion",
        estado: initialData.estado || "pendiente",
        descripcion: initialData.descripcion || "",
        nota: initialData.nota || "",
      });
    } else if (selectedDate) {
      // Si se seleccionó una fecha, establecerla como fecha de inicio
      const date = new Date(selectedDate);
      const now = new Date();
      
      // Si la fecha seleccionada es hoy, usar la hora actual o la próxima hora redondeada
      let horaInicio = "09:00";
      if (date.toDateString() === now.toDateString()) {
        // Si es hoy, usar la hora actual redondeada a la siguiente hora completa
        const horaSiguiente = now.getHours() + 1;
        const horaInicioDate = new Date();
        horaInicioDate.setHours(horaSiguiente, 0, 0, 0);
        // Si la hora calculada aún es en el pasado o igual, usar la hora siguiente
        if (horaInicioDate <= now) {
          horaInicioDate.setHours(now.getHours() + 2, 0, 0, 0);
        }
        horaInicio = `${String(horaInicioDate.getHours()).padStart(2, '0')}:${String(horaInicioDate.getMinutes()).padStart(2, '0')}`;
      }
      
      // Establecer fin como 30 minutos después de la hora de inicio
      const horaInicioDate = new Date(`2000-01-01T${horaInicio}`);
      horaInicioDate.setMinutes(horaInicioDate.getMinutes() + 30);
      const horaFin = `${String(horaInicioDate.getHours()).padStart(2, '0')}:${String(horaInicioDate.getMinutes()).padStart(2, '0')}`;

      const fechaDia = date.toISOString().slice(0, 10);

      setForm((prev) => ({
        ...prev,
        fecha_dia: fechaDia,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
      }));
    }
  }, [initialData, selectedDate]);

  // Filtrar vehículos cuando se selecciona un cliente
  useEffect(() => {
    if (form.cliente) {
      const clienteId = Number(form.cliente);
      const clienteSeleccionado = clientes.find(c => c.id === clienteId);
      
      // Construir el nombre completo del cliente seleccionado
      const nombreCompletoCliente = clienteSeleccionado 
        ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido || ""}`.trim().toLowerCase()
        : "";
      
      const vehiculosFiltrados = vehiculos.filter((v) => {
        // Opción 1: Si tiene cliente como ID directo (número)
        if (v.cliente !== undefined && v.cliente !== null) {
          if (typeof v.cliente === 'number' && v.cliente === clienteId) {
            return true;
          }
          if (typeof v.cliente === 'object' && v.cliente.id === clienteId) {
            return true;
          }
          if (typeof v.cliente === 'string' && Number(v.cliente) === clienteId) {
            return true;
          }
        }
        // Opción 2: Si tiene cliente_info con id
        if (v.cliente_info && v.cliente_info.id === clienteId) {
          return true;
        }
        // Opción 3: Comparar por nombre completo (método principal para VehiculoListSerializer)
        // El serializer de lista solo devuelve cliente_nombre, no cliente.id
        if (nombreCompletoCliente && v.cliente_nombre) {
          const nombreVehiculo = v.cliente_nombre.trim().toLowerCase();
          // Comparación exacta
          if (nombreVehiculo === nombreCompletoCliente) {
            return true;
          }
          // También aceptar coincidencias parciales (por si hay espacios extras)
          const nombreVehiculoSinEspacios = nombreVehiculo.replace(/\s+/g, ' ');
          const nombreClienteSinEspacios = nombreCompletoCliente.replace(/\s+/g, ' ');
          if (nombreVehiculoSinEspacios === nombreClienteSinEspacios) {
            return true;
          }
        }
        return false;
      });
      
      console.log('🔍 Filtrado de vehículos:', {
        clienteId,
        nombreCompletoCliente,
        totalVehiculos: vehiculos.length,
        vehiculosFiltrados: vehiculosFiltrados.length,
        vehiculos: vehiculosFiltrados
      });
      
      setVehiculosCliente(vehiculosFiltrados);

      // Si solo hay un vehículo, seleccionarlo automáticamente
      if (vehiculosFiltrados.length === 1 && !form.vehiculo) {
        setForm((prev) => ({
          ...prev,
          vehiculo: vehiculosFiltrados[0].id || vehiculosFiltrados[0].pk || "",
        }));
      }
      
      // Limpiar vehículo seleccionado si ya no está en la lista filtrada
      if (form.vehiculo && !vehiculosFiltrados.find(v => (v.id || v.pk) === Number(form.vehiculo))) {
        setForm((prev) => ({ ...prev, vehiculo: "" }));
      }
    } else {
      setVehiculosCliente([]);
      if (form.vehiculo) {
        setForm((prev) => ({ ...prev, vehiculo: "" }));
      }
    }
  }, [form.cliente, vehiculos, clientes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Combinar fecha_dia con hora_inicio y hora_fin para crear fecha_hora_inicio y fecha_hora_fin
    if (!form.fecha_dia || !form.hora_inicio || !form.hora_fin) {
      alert("⚠️ Por favor completa todos los campos de fecha y hora.");
      return;
    }
    
    const fechaHoraInicio = `${form.fecha_dia}T${form.hora_inicio}`;
    const fechaHoraFin = `${form.fecha_dia}T${form.hora_fin}`;
    
    const formData = {
      ...form,
      fecha_hora_inicio: fechaHoraInicio,
      fecha_hora_fin: fechaHoraFin,
    };
    
    const apiData = toApiCita(formData);
    onSubmit(apiData);
  };

  const isEditing = !!initialData;

  return (
    <div className="bg-white rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          {isEditing ? "Editar Cita" : "Nueva Cita"}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Cliente <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <select
              name="cliente"
              value={form.cliente}
              onChange={handleChange}
              required
              className="flex-1 px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar cliente...</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.apellido} - {cliente.nit}
                </option>
              ))}
            </select>
            {form.cliente && (
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, cliente: "", vehiculo: "" }))}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Vehículo del cliente */}
        {form.cliente && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Seleccionar vehículo del cliente
            </label>
            <select
              name="vehiculo"
              value={form.vehiculo}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sin vehículo</option>
              {vehiculosCliente.map((vehiculo) => {
                const placa = vehiculo.numero_placa || "Sin placa";
                const marca = vehiculo.marca?.nombre || vehiculo.marca_nombre || "";
                const modelo = vehiculo.modelo?.nombre || vehiculo.modelo_nombre || "";
                const display = `${marca} ${modelo}`.trim() || "Vehículo";
                return (
                  <option key={vehiculo.id} value={vehiculo.id}>
                    {display} - {placa}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Fecha y horas de la cita - Simplificado */}
        <div className="space-y-3 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <label className="block text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-600" />
            <span>Fecha y Horario de la Cita</span>
            <span className="text-red-500">*</span>
          </label>
          
          {/* Solo una fecha para el día */}
          <div className="relative mb-4">
            <label className="block text-xs font-medium mb-1.5 text-gray-600">
              📅 Día de la cita
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="date"
                name="fecha_dia"
                value={form.fecha_dia}
                onChange={(e) => {
                  handleChange(e);
                  // Ajustar horas si es necesario
                  if (!form.hora_inicio) {
                    const now = new Date();
                    const fechaSeleccionada = new Date(e.target.value);
                    if (fechaSeleccionada.toDateString() === now.toDateString()) {
                      // Si es hoy, usar hora actual + 1
                      const horaSiguiente = now.getHours() + 1;
                      const horaInicioDate = new Date();
                      horaInicioDate.setHours(horaSiguiente, 0, 0, 0);
                      if (horaInicioDate <= now) {
                        horaInicioDate.setHours(now.getHours() + 2, 0, 0, 0);
                      }
                      const horaInicio = `${String(horaInicioDate.getHours()).padStart(2, '0')}:${String(horaInicioDate.getMinutes()).padStart(2, '0')}`;
                      const horaInicioDate2 = new Date(`2000-01-01T${horaInicio}`);
                      horaInicioDate2.setMinutes(horaInicioDate2.getMinutes() + 30);
                      const horaFin = `${String(horaInicioDate2.getHours()).padStart(2, '0')}:${String(horaInicioDate2.getMinutes()).padStart(2, '0')}`;
                      setForm(prev => ({ ...prev, hora_inicio: horaInicio, hora_fin: horaFin }));
                    } else {
                      // Si es futuro, usar 9:00 AM
                      setForm(prev => ({ ...prev, hora_inicio: "09:00", hora_fin: "09:30" }));
                    }
                  }
                }}
                required
                min={isEditing ? undefined : new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {!isEditing && form.fecha_dia && (() => {
              const fechaSeleccionada = new Date(form.fecha_dia);
              const hoy = new Date();
              hoy.setHours(0, 0, 0, 0);
              return fechaSeleccionada < hoy;
            })() && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                ⚠️ No se pueden agendar citas en el pasado
              </p>
            )}
          </div>

          {/* Horas de inicio y fin en una sola fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Hora de inicio */}
            <div className="relative">
              <label className="block text-xs font-medium mb-1.5 text-gray-600">
                🕐 Hora de inicio
              </label>
              <div className="relative">
                <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="time"
                  name="hora_inicio"
                  value={form.hora_inicio}
                  onChange={(e) => {
                    handleChange(e);
                    // Ajustar hora de fin si es necesario
                    if (form.hora_inicio && e.target.value) {
                      const horaInicio = new Date(`2000-01-01T${e.target.value}`);
                      const horaFinActual = form.hora_fin ? new Date(`2000-01-01T${form.hora_fin}`) : null;
                      
                      // Si la hora de fin es anterior o igual, ajustarla
                      if (!horaFinActual || horaFinActual <= horaInicio) {
                        const nuevaHoraFin = new Date(horaInicio);
                        nuevaHoraFin.setMinutes(nuevaHoraFin.getMinutes() + 30);
                        const horaFinStr = `${String(nuevaHoraFin.getHours()).padStart(2, '0')}:${String(nuevaHoraFin.getMinutes()).padStart(2, '0')}`;
                        setForm(prev => ({ ...prev, hora_fin: horaFinStr }));
                      }
                    }
                  }}
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Hora de fin */}
            <div className="relative">
              <label className="block text-xs font-medium mb-1.5 text-gray-600">
                🕐 Hora de fin
              </label>
              <div className="relative">
                <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="time"
                  name="hora_fin"
                  value={form.hora_fin}
                  onChange={(e) => {
                    const hora = e.target.value;
                    handleChange(e);
                    
                    // Validar que no exceda 2 horas desde la hora de inicio
                    if (form.hora_inicio && hora) {
                      const horaInicio = new Date(`2000-01-01T${form.hora_inicio}`);
                      const horaFin = new Date(`2000-01-01T${hora}`);
                      const duracionHoras = (horaFin - horaInicio) / (1000 * 60 * 60);
                      
                      if (duracionHoras > 2) {
                        alert('⚠️ La duración máxima de una cita es de 2 horas. Se ha ajustado automáticamente.');
                        // Ajustar a 2 horas desde el inicio
                        const nuevaHoraFin = new Date(horaInicio);
                        nuevaHoraFin.setHours(nuevaHoraFin.getHours() + 2);
                        const horaFinStr = `${String(nuevaHoraFin.getHours()).padStart(2, '0')}:${String(nuevaHoraFin.getMinutes()).padStart(2, '0')}`;
                        setForm(prev => ({ ...prev, hora_fin: horaFinStr }));
                      } else if (duracionHoras <= 0) {
                        alert('⚠️ La hora de fin debe ser posterior a la hora de inicio. Se ha ajustado automáticamente.');
                        const nuevaHoraFin = new Date(horaInicio);
                        nuevaHoraFin.setMinutes(nuevaHoraFin.getMinutes() + 30);
                        const horaFinStr = `${String(nuevaHoraFin.getHours()).padStart(2, '0')}:${String(nuevaHoraFin.getMinutes()).padStart(2, '0')}`;
                        setForm(prev => ({ ...prev, hora_fin: horaFinStr }));
                      }
                    }
                  }}
                  required
                  min={form.hora_inicio || undefined}
                  max={
                    form.hora_inicio
                      ? (() => {
                          const horaInicio = new Date(`2000-01-01T${form.hora_inicio}`);
                          horaInicio.setHours(horaInicio.getHours() + 2);
                          return `${String(horaInicio.getHours()).padStart(2, '0')}:${String(horaInicio.getMinutes()).padStart(2, '0')}`;
                        })()
                      : undefined
                  }
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Información de duración */}
          {form.hora_inicio && form.hora_fin && (
            (() => {
              const horaInicio = new Date(`2000-01-01T${form.hora_inicio}`);
              const horaFin = new Date(`2000-01-01T${form.hora_fin}`);
              const duracionMinutos = Math.round((horaFin - horaInicio) / (1000 * 60));
              const duracionHoras = duracionMinutos / 60;
              
              if (duracionHoras <= 0) {
                return (
                  <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    ⚠️ La hora de fin debe ser posterior a la hora de inicio
                  </p>
                );
              }
              
              if (duracionHoras > 2) {
                return (
                  <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    ⚠️ La duración máxima es de 2 horas
                  </p>
                );
              }
              
              return (
                <p className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                  ℹ️ Duración: {duracionMinutos} minutos ({duracionHoras.toFixed(1)} horas)
                </p>
              );
            })()
          )}
        </div>

        {/* Tipo de cita */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Tipo de Cita
          </label>
          <select
            name="tipo_cita"
            value={form.tipo_cita}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="reparacion">Reparación</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="diagnostico">Diagnóstico</option>
            <option value="entrega">Entrega</option>
          </select>
        </div>

        {/* Empleado asignado - Selección */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Empleado Asignado <span className="text-gray-500">(Opcional)</span>
          </label>
          <select
            name="empleado"
            value={form.empleado || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar empleado (opcional)</option>
            {empleados.filter(e => e.estado !== false).map((empleado) => (
              <option key={empleado.id} value={empleado.id}>
                {empleado.nombre} {empleado.apellido}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Estado
          </label>
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
            <option value="completada">Completada</option>
          </select>
        </div>

        {/* Nota */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Nota <span className="text-red-500">*</span>
          </label>
          <textarea
            name="nota"
            value={form.nota}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Descripción de la cita..."
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-medium transition-colors"
          >
            {isEditing ? "Guardar Cambios" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CitaForm;

