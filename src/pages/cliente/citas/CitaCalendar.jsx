import React, { useState, useMemo } from "react";
import { FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa";

const CitaCalendar = ({ citas, onNewCita, onViewCita }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("mes"); // 'mes', 'semana', 'dia'

  // Obtener el primer día del mes
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  // Días de la semana
  const daysOfWeek = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const monthNames = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  // Obtener el primer día de la semana del mes (domingo = 0)
  const startDay = firstDayOfMonth.getDay();

  // Generar días del mes
  const daysInMonth = lastDayOfMonth.getDate();

  // Obtener días del mes anterior para completar la primera semana
  const prevMonthDays = [];
  const prevMonthLastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  ).getDate();

  for (let i = startDay - 1; i >= 0; i--) {
    prevMonthDays.push(prevMonthLastDay - i);
  }

  // Función para verificar si una fecha tiene citas
  const getCitasForDate = (year, month, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return citas.filter((cita) => {
      const citaDate = new Date(cita.fecha_hora_inicio);
      const citaDateStr = `${citaDate.getFullYear()}-${String(
        citaDate.getMonth() + 1
      ).padStart(2, "0")}-${String(citaDate.getDate()).padStart(2, "0")}`;
      return citaDateStr === dateStr;
    });
  };

  // Función para obtener citas en un rango de fechas
  const getCitasInRange = (startDate, endDate) => {
    return citas.filter((cita) => {
      const citaDate = new Date(cita.fecha_hora_inicio);
      return citaDate >= startDate && citaDate <= endDate;
    });
  };

  // Función para obtener el primer día de la semana (domingo)
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Domingo = 0
    return new Date(d.setDate(diff));
  };

  // Función para formatear hora
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para formatear fecha corta
  const formatShortDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  // Función para formatear fecha como "YYYY-MM-DD HH:mm"
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Navegación
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToPrevious = () => {
    if (view === "mes") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      );
    } else if (view === "semana") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const goToNext = () => {
    if (view === "mes") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    } else if (view === "semana") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  const handleDayClick = (year, month, day) => {
    const clickedDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    clickedDate.setHours(0, 0, 0, 0);
    
    // Solo permitir crear citas en fechas futuras o hoy
    if (clickedDate < today) {
      alert("No se pueden agendar citas en el pasado");
      return;
    }
    
    const dateTimeString = formatDateTime(clickedDate.toISOString());
    onNewCita(dateTimeString);
  };

  const handleCitaClick = (e, cita) => {
    e.stopPropagation();
    onViewCita(cita);
  };

  // Renderizar calendario mensual
  const renderMonthView = () => {
    const days = [];
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Días del mes anterior (gris)
    prevMonthDays.forEach((day) => {
      days.push(
        <div
          key={`prev-${day}`}
          className="h-32 md:h-36 border border-gray-200 bg-gray-50 p-1 text-gray-400"
        >
          <div className="font-semibold text-xs">{day}</div>
        </div>
      );
    });

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const citasDelDia = getCitasForDate(currentYear, currentMonth, day);
      const isToday =
        day === new Date().getDate() &&
        currentMonth === new Date().getMonth() &&
        currentYear === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`h-32 md:h-36 border border-gray-200 p-1 flex flex-col ${
            isToday ? "bg-blue-50 border-blue-300" : "bg-white"
          }`}
        >
          {/* Número del día */}
          <div className="mb-0.5 flex-shrink-0">
            <span
              className={`font-semibold text-xs ${
                isToday ? "text-blue-600" : "text-gray-800"
              }`}
            >
              {day}
            </span>
          </div>
          
          {/* Lista de citas - diseño compacto en una sola línea */}
          <div className="flex-1 space-y-0.5 min-h-0">
            {citasDelDia.length > 0 ? (
              <>
                {citasDelDia.slice(0, 5).map((cita) => {
                  const horaInicio = new Date(cita.fecha_hora_inicio).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const nombreCita = cita.cliente_info?.nombre || "Cita";
                  const nombreEmpleado = cita.empleado_info?.nombre 
                    ? `${cita.empleado_info.nombre.substring(0, 4)}${cita.empleado_info.apellido?.substring(0, 1) || ""}` 
                    : "";
                  return (
                    <div
                      key={cita.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCitaClick(e, cita);
                      }}
                      className={`hover:opacity-90 text-gray-900 text-[9px] px-1 py-0.5 rounded cursor-pointer transition-colors shadow-sm leading-tight ${
                        nombreEmpleado 
                          ? "bg-yellow-400 border-l-4 border-yellow-700" 
                          : "bg-yellow-300 border-l-4 border-yellow-500"
                      }`}
                      title={`${horaInicio} - Cliente: ${nombreCita} ${cita.cliente_info?.apellido || ""}${nombreEmpleado ? ` | EMPLEADO: ${cita.empleado_info.nombre} ${cita.empleado_info.apellido || ""}` : " (Sin empleado)"} | Tipo: ${cita.tipo_cita}`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] opacity-90 flex-shrink-0 font-bold">
                          {horaInicio}
                        </span>
                        <span className="font-medium truncate flex-1 text-[9px]">
                          {nombreCita.substring(0, 5)}
                        </span>
                        {nombreEmpleado && (
                          <span 
                            className="text-[9px] font-extrabold bg-blue-600 text-white px-1.5 py-0.5 rounded-md flex-shrink-0 border border-blue-800 shadow-md" 
                            title={`👤 EMPLEADO: ${cita.empleado_info.nombre} ${cita.empleado_info.apellido || ""}`}
                          >
                            👤 {nombreEmpleado.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {citasDelDia.length > 5 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (citasDelDia.length > 5) {
                        handleCitaClick(e, citasDelDia[5]);
                      }
                    }}
                    className="w-full text-[8px] text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded px-1 py-0.5 font-medium transition-colors text-center"
                    title={`Ver ${citasDelDia.length - 5} citas adicionales. Click para ver la siguiente.`}
                  >
                    +{citasDelDia.length - 5} más
                  </button>
                )}
              </>
            ) : null}
          </div>
        </div>
      );
    }

    // Completar la última semana
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(
        <div
          key={`next-${day}`}
          className="h-32 md:h-36 border border-gray-200 bg-gray-50 p-1 text-gray-400"
        >
          <div className="font-semibold text-xs">{day}</div>
        </div>
      );
    }

    return days;
  };

  // Renderizar vista de semana
  const renderWeekView = () => {
    const startOfWeek = getStartOfWeek(currentDate);
    const weekDays = [];
    
    // Generar los 7 días de la semana
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    // Obtener citas de la semana
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59);
    
    const citasSemana = getCitasInRange(startOfWeek, endOfWeek);

    const isCurrentWeek = weekDays.some(day => {
      const today = new Date();
      return day.toDateString() === today.toDateString();
    });

    return (
      <div className="w-full">
        {/* Encabezado con días de la semana */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 overflow-x-auto min-w-[700px] md:min-w-0">
          {weekDays.map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const citasDelDia = getCitasForDate(
              day.getFullYear(),
              day.getMonth(),
              day.getDate()
            );
            
            return (
              <div
                key={index}
                className={`p-2 md:p-3 text-center border-r border-gray-200 ${
                  index === 6 ? "" : "border-r"
                } ${isToday ? "bg-blue-50" : ""}`}
              >
                <div className={`text-xs md:text-sm font-medium ${isToday ? "text-blue-600" : "text-gray-600"}`}>
                  {daysOfWeek[day.getDay()]}
                </div>
                <div className={`text-base md:text-xl font-bold mt-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                  {day.getDate()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatShortDate(day)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {citasDelDia.length} {citasDelDia.length === 1 ? "cita" : "citas"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contenido de la semana con citas */}
        <div className="min-h-[300px] md:min-h-[400px] p-2 overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 min-w-[700px] md:min-w-0">
            {weekDays.map((day, dayIndex) => {
              const citasDelDia = getCitasForDate(
                day.getFullYear(),
                day.getMonth(),
                day.getDate()
              ).sort((a, b) => 
                new Date(a.fecha_hora_inicio) - new Date(b.fecha_hora_inicio)
              );
              
              const isToday = day.toDateString() === new Date().toDateString();

              return (
                <div
                  key={dayIndex}
                  className={`min-h-[250px] md:min-h-[300px] p-1.5 border border-gray-200 rounded ${
                    isToday ? "bg-blue-50 border-blue-300" : "bg-white"
                  }`}
                >
                  <div className={`font-semibold mb-1.5 text-xs ${isToday ? "text-blue-700" : "text-gray-700"}`}>
                    {day.getDate()} {monthNames[day.getMonth()].substring(0, 3)}
                  </div>
                  <div className="space-y-1.5">
                    {citasDelDia.length === 0 ? (
                      <p className="text-[10px] text-gray-400 text-center py-2">
                        Sin citas
                      </p>
                    ) : (
                      citasDelDia.map((cita) => {
                        const horaInicio = formatTime(cita.fecha_hora_inicio);
                        const horaFin = formatTime(cita.fecha_hora_fin);
                        const nombreEmpleado = cita.empleado_info?.nombre 
                          ? `${cita.empleado_info.nombre.substring(0, 4)}${cita.empleado_info.apellido?.substring(0, 1) || ""}` 
                          : "";
                        return (
                          <div
                            key={cita.id}
                            onClick={(e) => handleCitaClick(e, cita)}
                            className={`p-1.5 rounded text-[10px] cursor-pointer hover:opacity-90 transition-colors border ${
                              nombreEmpleado 
                                ? "bg-yellow-400 border-yellow-700 text-gray-900" 
                                : "bg-yellow-300 border-yellow-500 text-gray-800"
                            }`}
                          >
                            <div className="font-semibold mb-0.5 flex items-center justify-between gap-1">
                              <span>{horaInicio} - {horaFin}</span>
                              {nombreEmpleado && (
                                <span className="text-[9px] font-extrabold bg-blue-600 text-white px-1.5 py-0.5 rounded-md border border-blue-800 shadow-md" title={`👤 EMPLEADO: ${cita.empleado_info.nombre} ${cita.empleado_info.apellido || ""}`}>
                                  👤 {nombreEmpleado.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="font-medium truncate text-[10px]">
                              {cita.cliente_info?.nombre || "Cliente"}
                            </div>
                            <div className="text-[10px] opacity-75 truncate">
                              {cita.tipo_cita}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <button
                      onClick={() => {
                        const dateTimeString = formatDateTime(day.toISOString());
                        onNewCita(dateTimeString);
                      }}
                      className="w-full mt-1.5 p-1 text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors border border-gray-300"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Renderizar vista de día
  const renderDayView = () => {
    const day = currentDate;
    const citasDelDia = getCitasForDate(
      day.getFullYear(),
      day.getMonth(),
      day.getDate()
    ).sort((a, b) => 
      new Date(a.fecha_hora_inicio) - new Date(b.fecha_hora_inicio)
    );

    const isToday = day.toDateString() === new Date().toDateString();

    // Horas del día (8 AM a 8 PM)
    const hours = [];
    for (let h = 8; h <= 20; h++) {
      hours.push(h);
    }

    return (
      <div className="w-full">
        {/* Encabezado del día */}
        <div className={`p-3 md:p-4 border-b border-gray-200 ${isToday ? "bg-blue-50" : "bg-gray-50"}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <h3 className={`text-lg md:text-xl font-bold ${isToday ? "text-blue-600" : "text-gray-800"}`}>
                {daysOfWeek[day.getDay()]}, {day.getDate()} de {monthNames[day.getMonth()]} de {day.getFullYear()}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                {citasDelDia.length} {citasDelDia.length === 1 ? "cita programada" : "citas programadas"}
              </p>
            </div>
            <button
              onClick={() => {
                const dateTimeString = formatDateTime(day.toISOString());
                onNewCita(dateTimeString);
              }}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-xs md:text-sm"
            >
              <FaPlus className="text-xs" /> Nueva Cita
            </button>
          </div>
        </div>

        {/* Horas del día con citas */}
        <div className="p-3 md:p-4">
          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            {hours.map((hour) => {
              // Citas en esta hora
              const citasHora = citasDelDia.filter((cita) => {
                const citaDate = new Date(cita.fecha_hora_inicio);
                return citaDate.getHours() === hour;
              });

              return (
                <div key={hour} className="border-b border-gray-200 pb-3">
                  <div className="flex gap-3">
                    {/* Columna de hora */}
                    <div className="w-16 md:w-20 flex-shrink-0">
                      <div className="text-xs md:text-sm font-semibold text-gray-700">
                        {String(hour).padStart(2, "0")}:00
                      </div>
                    </div>
                    
                    {/* Columna de citas */}
                    <div className="flex-1 space-y-1.5">
                      {citasHora.length === 0 ? (
                        <div 
                          onClick={() => {
                            const newDate = new Date(day);
                            newDate.setHours(hour, 0, 0);
                            const dateTimeString = formatDateTime(newDate.toISOString());
                            onNewCita(dateTimeString);
                          }}
                          className="text-gray-400 text-xs hover:text-gray-600 cursor-pointer py-1.5"
                        >
                          Sin citas - Click para agregar
                        </div>
                      ) : (
                        citasHora.map((cita) => {
                          const horaInicio = formatTime(cita.fecha_hora_inicio);
                          const horaFin = formatTime(cita.fecha_hora_fin);
                          const nombreEmpleado = cita.empleado_info?.nombre 
                            ? `${cita.empleado_info.nombre} ${cita.empleado_info.apellido || ""}` 
                            : "";
                          return (
                            <div
                              key={cita.id}
                              onClick={(e) => handleCitaClick(e, cita)}
                              className="bg-yellow-400 text-gray-900 p-2 md:p-2.5 rounded-lg cursor-pointer hover:bg-yellow-500 transition-colors border border-yellow-500 shadow-sm"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex-1">
                                  <div className="font-semibold text-xs md:text-sm mb-0.5">
                                    {cita.cliente_info?.nombre || "Cliente"} {cita.cliente_info?.apellido || ""}
                                  </div>
                                  <div className="text-[10px] md:text-xs text-gray-700">
                                    {horaInicio} - {horaFin}
                                  </div>
                                  {nombreEmpleado && (
                                    <div className="text-[9px] md:text-[10px] text-blue-600 mt-0.5 font-bold bg-blue-50 px-2 py-0.5 rounded inline-block border border-blue-200">
                                      👤 EMPLEADO: {nombreEmpleado}
                                    </div>
                                  )}
                                </div>
                                <span className="px-1.5 py-0.5 bg-gray-800 text-white text-[10px] rounded">
                                  {cita.tipo_cita}
                                </span>
                              </div>
                              {cita.vehiculo_info?.numero_placa && (
                                <div className="text-[10px] md:text-xs text-gray-700 mt-0.5">
                                  🚗 {cita.vehiculo_info.numero_placa}
                                </div>
                              )}
                              {cita.nota && (
                                <div className="text-[10px] md:text-xs text-gray-700 mt-1 line-clamp-2">
                                  {cita.nota}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Header del calendario */}
      <div className="mb-4 md:mb-6 space-y-4">
        {/* Título y botón Nueva Cita */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
            Calendario de Citas
          </h2>
          <button
            onClick={() => onNewCita(null)}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-4 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <FaPlus /> Nueva Cita!
          </button>
        </div>

        {/* Navegación */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={goToPrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaChevronLeft className="text-gray-700" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 md:px-4 md:py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={goToNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaChevronRight className="text-gray-700" />
            </button>
            <span className="text-base md:text-lg font-semibold text-gray-800">
              {view === "mes" && `${monthNames[currentDate.getMonth()]} de ${currentDate.getFullYear()}`}
              {view === "semana" && `Semana del ${getStartOfWeek(currentDate).getDate()} de ${monthNames[getStartOfWeek(currentDate).getMonth()]}`}
              {view === "dia" && `${daysOfWeek[currentDate.getDay()]}, ${currentDate.getDate()} de ${monthNames[currentDate.getMonth()]}`}
            </span>
          </div>

          {/* Selector de vista */}
          <div className="flex gap-2">
            <button
              onClick={() => setView("mes")}
              className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "mes"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setView("semana")}
              className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "semana"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setView("dia")}
              className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "dia"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Día
            </button>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {view === "mes" && (
          <>
            {/* Días de la semana */}
            <div className="grid grid-cols-7 border-b-2 border-gray-300 bg-gray-100">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center font-bold text-gray-700 text-xs md:text-sm uppercase"
                >
                  {day}
                </div>
              ))}
            </div>
            {/* Días del mes */}
            <div className="grid grid-cols-7">{renderMonthView()}</div>
          </>
        )}

        {view === "semana" && renderWeekView()}

        {view === "dia" && renderDayView()}
      </div>
    </div>
  );
};

export default CitaCalendar;

