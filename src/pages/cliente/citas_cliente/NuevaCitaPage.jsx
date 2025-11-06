import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { createCitaCliente, fetchCalendarioEmpleado, toApiCitaCliente, fetchVehiculosCliente, reprogramarCitaCliente, cancelarCitaClienteAction } from "../../../api/citasClienteApi";
import { fetchAllEmpleados } from "../../../api/empleadosApi";

const NuevaCitaPage = ({ onClose, mode = "create", initialCita = null }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    empleado: "",
    vehiculo: "",
    fecha_dia: "",
    hora_inicio: "",
    hora_fin: "",
    tipo_cita: "reparacion",
    nota: "",
  });
  
  const [empleados, setEmpleados] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCalendario, setLoadingCalendario] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Prefill when editing
  useEffect(() => {
    if (mode === 'edit' && initialCita) {
      const inicio = initialCita.fecha_hora_inicio ? new Date(initialCita.fecha_hora_inicio) : null;
      const fin = initialCita.fecha_hora_fin ? new Date(initialCita.fecha_hora_fin) : null;
      const toLocalDate = (d) => {
        if (!d) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };
      const toLocalTime = (d) => {
        if (!d) return '';
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
      };
      setForm(prev => ({
        ...prev,
        empleado: initialCita.empleado_info ? (initialCita.empleado_info.id || prev.empleado) : prev.empleado,
        vehiculo: initialCita.vehiculo_info ? (initialCita.vehiculo_info.id || prev.vehiculo) : prev.vehiculo,
        fecha_dia: toLocalDate(inicio) || prev.fecha_dia,
        hora_inicio: toLocalTime(inicio) || prev.hora_inicio,
        hora_fin: toLocalTime(fin) || prev.hora_fin,
        tipo_cita: initialCita.tipo_cita || prev.tipo_cita,
        nota: (initialCita.nota || initialCita.descripcion || prev.nota),
        estado: initialCita.estado || 'confirmada',
      }));
    }
  }, [mode, initialCita]);

  useEffect(() => {
    if (form.empleado && form.fecha_dia) {
      loadCalendarioEmpleado();
    } else {
      setHorariosOcupados([]);
    }
  }, [form.empleado, form.fecha_dia]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [empleadosData, vehiculosData] = await Promise.all([
        fetchAllEmpleados(),
        fetchVehiculosCliente()
      ]);
      setEmpleados(empleadosData.filter(e => e.estado !== false));
      setVehiculos(vehiculosData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar los datos. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const loadCalendarioEmpleado = async () => {
    if (!form.empleado || !form.fecha_dia) {
      setHorariosOcupados([]);
      return;
    }
    
    try {
      setLoadingCalendario(true);
      
      // Validar fecha
      if (!form.fecha_dia || !form.fecha_dia.match(/^\d{4}-\d{2}-\d{2}$/)) {
        setHorariosOcupados([]);
        return;
      }
      
      // Obtener citas del empleado para el día seleccionado
      const calendario = await fetchCalendarioEmpleado(form.empleado, form.fecha_dia);
      const horarios = calendario.horarios_ocupados || [];
      
      // Filtrar por solapamiento con el rango del día seleccionado (en UTC para evitar desfases)
      const dayStartLocal = new Date(`${form.fecha_dia}T00:00:00`);
      const dayEndLocal = new Date(`${form.fecha_dia}T23:59:59`);
      const dayStartUTCms = dayStartLocal.getTime();
      const dayEndUTCms = dayEndLocal.getTime();

      const horariosDelDia = horarios.filter(horario => {
        try {
          const inicioMs = new Date(horario.fecha_hora_inicio).getTime();
          const finMs = new Date(horario.fecha_hora_fin).getTime();
          const overlap = inicioMs <= dayEndUTCms && finMs >= dayStartUTCms;
          return overlap;
        } catch (e) {
          return false;
        }
      });
      
      setHorariosOcupados(horariosDelDia);
    } catch (error) {
      setHorariosOcupados([]);
    } finally {
      setLoadingCalendario(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const isHorarioOcupado = (hora) => {
    if (!form.fecha_dia || !horariosOcupados.length) return false;
    
    // Crear fecha/hora de inicio de la cita que se quiere agendar (en hora local)
    // Luego convertir a UTC para comparar con las fechas del backend que vienen en UTC
    const fechaHoraInicioLocal = new Date(`${form.fecha_dia}T${hora}:00`);
    const fechaHoraFinLocal = form.hora_fin ? new Date(`${form.fecha_dia}T${form.hora_fin}:00`) : null;
    
    // Convertir a UTC para comparar con las fechas del backend
    const fechaHoraInicioUTC = fechaHoraInicioLocal.getTime();
    const fechaHoraFinUTC = fechaHoraFinLocal ? fechaHoraFinLocal.getTime() : null;
    
    return horariosOcupados.some(horario => {
      const inicioOcupadoUTC = new Date(horario.fecha_hora_inicio).getTime();
      const finOcupadoUTC = new Date(horario.fecha_hora_fin).getTime();
      
      // Verificar solapamiento: la nueva cita se solapa si:
      // - Comienza antes de que termine la ocupada (inicio < fin_ocupado)
      // - Y termina después de que comience la ocupada (fin > inicio_ocupado)
      if (fechaHoraFinUTC) {
        return fechaHoraInicioUTC < finOcupadoUTC && fechaHoraFinUTC > inicioOcupadoUTC;
      } else {
        // Si no hay hora_fin, solo verificar si la hora_inicio está dentro del rango ocupado
        return fechaHoraInicioUTC >= inicioOcupadoUTC && fechaHoraInicioUTC < finOcupadoUTC;
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.empleado) {
      setError("Debes seleccionar un empleado");
      return;
    }
    
    if (!form.fecha_dia || !form.hora_inicio || !form.hora_fin) {
      setError("Debes completar la fecha y hora de la cita");
      return;
    }

    // Validar que no esté ocupado
    if (isHorarioOcupado(form.hora_inicio)) {
      setError("El horario seleccionado ya está ocupado. Por favor, elige otro.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // IMPORTANTE: Crear fechas interpretando la hora como hora LOCAL del día seleccionado
      // Luego convertir a UTC para enviar al backend
      // Esto asegura que 09:00 hora local se convierta correctamente a UTC
      const fechaHoraInicioLocal = new Date(`${form.fecha_dia}T${form.hora_inicio}:00`);
      const fechaHoraFinLocal = new Date(`${form.fecha_dia}T${form.hora_fin}:00`);
      
      // Convertir a UTC para enviar al backend
      const fechaInicioISO = fechaHoraInicioLocal.toISOString();
      const fechaFinISO = fechaHoraFinLocal.toISOString();

      if (mode === 'edit' && initialCita) {
        const payload = {
          fecha_hora_inicio: fechaInicioISO,
          fecha_hora_fin: fechaFinISO,
        };
        // Estado opcional en edición
        if (form.estado) payload.estado = form.estado;
        await reprogramarCitaCliente(initialCita.id, payload);
        alert("✅ Cita actualizada correctamente");
      } else {
        const citaData = toApiCitaCliente({
          ...form,
          fecha_hora_inicio: fechaInicioISO,
          fecha_hora_fin: fechaFinISO,
        });
        await createCitaCliente(citaData);
        alert("✅ Cita agendada correctamente");
      }
      if (typeof onClose === 'function') {
        onClose();
      } else {
        navigate('/mis-citas');
      }
    } catch (error) {
      console.error("Error al crear cita:", error);
      setError(error.message || "Error al crear la cita. Por favor, intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const empleadoSeleccionado = empleados.find(e => e.id === Number(form.empleado));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    // Modal flotante con overlay (estilo consistente con el calendario de administración)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              {mode === 'edit' ? 'Reprogramar Cita' : 'Nueva Cita'}
            </h2>
            <button
              onClick={() => (typeof onClose === 'function' ? onClose() : navigate('/mis-citas'))}
              className="text-gray-500 hover:text-gray-700 transition-colors px-3 py-1 rounded hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Empleado (oculto en edición, requerido en creación) */}
            {mode !== 'edit' ? (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Empleado <span className="text-red-500">*</span>
                </label>
                <select
                  name="empleado"
                  value={form.empleado}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar empleado...</option>
                  {empleados.map(empleado => (
                    <option key={empleado.id} value={empleado.id}>
                      {empleado.nombre} {empleado.apellido}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {/* Calendario del empleado */}
            {form.empleado && form.fecha_dia && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  📅 Calendario de {empleadoSeleccionado?.nombre} {empleadoSeleccionado?.apellido}
                </h4>
                {loadingCalendario ? (
                  <p className="text-xs text-gray-600">⏳ Cargando horarios ocupados...</p>
                ) : (
                  <div>
                    <p className="text-xs text-gray-600 mb-3">
                      Horarios ocupados para el {new Date(form.fecha_dia + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    {horariosOcupados.length > 0 ? (
                      <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {horariosOcupados.map((horario, idx) => {
                            // Convertir las fechas del backend a hora local para mostrar
                            const inicio = new Date(horario.fecha_hora_inicio);
                            const fin = new Date(horario.fecha_hora_fin);
                            const inicioStr = inicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                            const finStr = fin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                            
                            return (
                              <span
                                key={idx}
                                className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-red-100 text-red-800 border-2 border-red-300"
                                title={`Ocupado de ${inicioStr} a ${finStr}`}
                              >
                                🚫 {inicioStr} - {finStr}
                              </span>
                            );
                          })}
                        </div>
                        <p className="text-xs text-red-600 font-medium mt-2">
                          ⚠️ Estos horarios están ocupados. No puedes agendar en estos rangos.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                          <span className="text-base">✓</span> No hay horarios ocupados en este día. Puedes agendar libremente.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Vehículo del cliente (solo creación) */}
            {mode !== 'edit' ? (
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
                  {vehiculos.map((vehiculo) => {
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
            ) : null}

            {/* Fecha y horas de la cita */}
            <div className="space-y-3 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <label className="block text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-600" />
                <span>Fecha y Horario de la Cita</span>
                <span className="text-red-500">*</span>
              </label>
              
              {/* Día de la cita */}
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
                      // Establecer horas por defecto al seleccionar fecha si no hay hora definida
                      if (!form.hora_inicio) {
                        const now = new Date();
                        const fechaSeleccionada = new Date(e.target.value);
                        if (fechaSeleccionada.toDateString() === now.toDateString()) {
                          // Si es hoy: hora actual + 1h, fin +30m
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
                          // Si es día futuro: usar 09:00–09:30 por defecto
                          setForm(prev => ({ ...prev, hora_inicio: "09:00", hora_fin: "09:30" }));
                        }
                      }
                    }}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Horas de inicio y fin */}
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
                        const nuevaHoraInicio = e.target.value;
                        // Actualizar hora de inicio
                        setForm(prev => ({ ...prev, hora_inicio: nuevaHoraInicio }));
                        
                        // SIEMPRE ajustar hora de fin a +30 minutos cuando cambia la hora de inicio
                        if (nuevaHoraInicio) {
                          const horaInicio = new Date(`2000-01-01T${nuevaHoraInicio}`);
                          const nuevaHoraFin = new Date(horaInicio);
                          nuevaHoraFin.setMinutes(nuevaHoraFin.getMinutes() + 30);
                          const horaFinStr = `${String(nuevaHoraFin.getHours()).padStart(2, '0')}:${String(nuevaHoraFin.getMinutes()).padStart(2, '0')}`;
                          setForm(prev => ({ ...prev, hora_fin: horaFinStr }));
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

            {/* Tipo de cita (solo creación) */}
            {mode !== 'edit' ? (
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
                </select>
              </div>
            ) : null}

            {/* Nota (solo creación) */}
            {mode !== 'edit' ? (
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
            ) : null}

            {/* Botones */}
            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200">
              {mode === 'edit' && initialCita ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('¿Cancelar esta cita?')) {
                      try {
                        await cancelarCitaClienteAction(initialCita.id);
                        alert('Cita cancelada');
                        if (typeof onClose === 'function') onClose(); else navigate('/mis-citas');
                      } catch (e) {
                        alert(e.message || 'No se pudo cancelar la cita');
                      }
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancelar cita
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => (typeof onClose === 'function' ? onClose() : navigate('/mis-citas'))}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (mode === 'edit' ? 'Reprogramando...' : 'Guardando...') : (mode === 'edit' ? 'Reprogramar' : 'Guardar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NuevaCitaPage;
