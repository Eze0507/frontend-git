import React from "react";
import { FaTimes, FaEdit, FaTrash, FaWhatsapp } from "react-icons/fa";

const CitaDetail = ({ cita, onEdit, onDelete, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "No especificado";
    const date = new Date(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("es-ES", options);
  };

  const getEstadoColor = (estado) => {
    const colors = {
      pendiente: "bg-yellow-100 text-yellow-800",
      confirmada: "bg-green-100 text-green-800",
      cancelada: "bg-red-100 text-red-800",
      completada: "bg-blue-100 text-blue-800",
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  const getTipoCitaLabel = (tipo) => {
    const tipos = {
      reparacion: "Reparación",
      mantenimiento: "Mantenimiento",
      diagnostico: "Diagnóstico",
      entrega: "Entrega",
    };
    return tipos[tipo] || tipo;
  };

  const getEstadoLabel = (estado) => {
    const estados = {
      pendiente: "Pendiente",
      confirmada: "Confirmada",
      cancelada: "Cancelada",
      completada: "Completada",
    };
    return estados[estado] || estado;
  };

  const clienteInfo = cita.cliente_info || {};
  const vehiculoInfo = cita.vehiculo_info || {};
  const empleadoInfo = cita.empleado_info || {};

  // Función para formatear fecha para WhatsApp
  const formatDateForWhatsApp = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const weekdays = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    
    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    const ampm = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    const minutesStr = minutes.toString().padStart(2, '0');
    
    return `${weekday}, ${day} de ${month} a las ${hours12}:${minutesStr} ${ampm}`;
  };

  // Función para obtener y formatear el teléfono
  const getFormattedPhone = () => {
    if (!clienteInfo.telefono) return null;
    // Eliminar espacios, guiones y paréntesis
    let phone = clienteInfo.telefono.replace(/[\s\-\(\)]/g, '');
    // Si no empieza con código de país (591), agregarlo
    if (!phone.startsWith('591')) {
      phone = '591' + phone;
    }
    return phone;
  };

  // Función para generar el mensaje de WhatsApp
  const generateWhatsAppMessage = () => {
    const nombreCliente = `${clienteInfo.nombre || ""} ${clienteInfo.apellido || ""}`.trim() || "Cliente";
    const fechaFormateada = formatDateForWhatsApp(cita.fecha_hora_inicio);
    const observaciones = cita.nota || cita.descripcion || "Sin observaciones";
    
    const mensaje = `Hola *${nombreCliente}*, queremos recordarte que tienes una cita en AUTOFIX el día ${fechaFormateada}. Te estaremos esperando, hasta pronto 🤚🏻 - Observaciones: ${observaciones}`;
    
    return encodeURIComponent(mensaje);
  };

  // Función para abrir WhatsApp
  const handleWhatsApp = () => {
    const phone = getFormattedPhone();
    if (!phone) {
      alert("⚠️ El cliente no tiene un número de teléfono registrado.");
      return;
    }
    
    const message = generateWhatsAppMessage();
    const whatsappUrl = `whatsapp://send?phone=${phone}&text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-gray-800 text-white rounded-lg flex flex-col max-h-[90vh] md:max-h-[85vh]">
      {/* Header fijo */}
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-700 flex-shrink-0 sticky top-0 bg-gray-800 z-10">
        <h2 className="text-xl md:text-2xl font-bold">Cita</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700"
          aria-label="Cerrar"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      {/* Contenido con scroll */}
      <div className="p-5 md:p-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
        {/* Header con nombre y empleado */}
        <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b-2 border-gray-700">
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl md:text-3xl font-bold mb-2 break-words text-white">
              {clienteInfo.nombre || "Cliente"} {clienteInfo.apellido || ""}
            </h3>
            <p className="text-gray-300 text-sm font-medium">
              📅 {formatDate(cita.fecha_hora_inicio)} -{" "}
              {cita.fecha_hora_fin
                ? new Date(cita.fecha_hora_fin).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </p>
          </div>
          {/* Badge de empleado */}
          {empleadoInfo.nombre && (
            <div className="bg-blue-600 text-white px-4 py-2 rounded-xl border-2 border-blue-400 shadow-lg flex items-center gap-2 flex-shrink-0">
              <span className="text-xl">👤</span>
              <div className="text-left">
                <div className="text-[10px] font-semibold opacity-90 uppercase">Empleado</div>
                <div className="text-sm font-bold">
                  {empleadoInfo.nombre.substring(0, 10)}{empleadoInfo.apellido ? ` ${empleadoInfo.apellido.substring(0, 8)}` : ""}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contenido en columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Columna izquierda */}
          <div className="space-y-5">
            {/* Cliente - Card */}
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <h4 className="font-bold text-base mb-3 text-blue-400 flex items-center gap-2">
                <span>👤</span> Cliente
              </h4>
              <div className="space-y-2">
                <p className="text-white font-medium break-words">
                  {clienteInfo.nombre || ""} {clienteInfo.apellido || ""}
                </p>
                {clienteInfo.telefono && (
                  <p className="text-gray-300 text-sm break-words flex items-center gap-2">
                    <span>📞</span> {clienteInfo.telefono}
                  </p>
                )}
              </div>
            </div>

            {/* Vehículo - Card */}
            {vehiculoInfo.numero_placa && (
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <h4 className="font-bold text-base mb-3 text-yellow-400 flex items-center gap-2">
                  <span>🚗</span> Vehículo
                </h4>
                <div className="space-y-2">
                  <p className="text-white font-medium break-words">
                    {vehiculoInfo.marca || ""} {vehiculoInfo.modelo || ""}
                  </p>
                  <p className="text-gray-300 text-sm break-words">
                    <span className="font-medium">Placa:</span> {vehiculoInfo.numero_placa}
                  </p>
                  {vehiculoInfo.color && (
                    <p className="text-gray-300 text-sm break-words">
                      <span className="font-medium">Color:</span> {vehiculoInfo.color}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Empleado asignado - Card */}
            {empleadoInfo.nombre && (
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <h4 className="font-bold text-base mb-3 text-green-400 flex items-center gap-2">
                  <span>⚙️</span> Empleado Asignado
                </h4>
                <div className="space-y-2">
                  <p className="text-white font-medium break-words">
                    {empleadoInfo.nombre} {empleadoInfo.apellido}
                  </p>
                  {empleadoInfo.telefono && (
                    <p className="text-gray-300 text-sm break-words flex items-center gap-2">
                      <span>📞</span> {empleadoInfo.telefono}
                    </p>
                  )}
                  {empleadoInfo.ci && (
                    <p className="text-gray-300 text-sm break-words flex items-center gap-2">
                      <span>🪪</span> CI: {empleadoInfo.ci}
                    </p>
                  )}
                </div>
              </div>
            )}
            {!empleadoInfo.nombre && (
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <h4 className="font-bold text-base mb-3 text-green-400 flex items-center gap-2">
                  <span>⚙️</span> Empleado Asignado
                </h4>
                <p className="text-gray-400 text-sm italic">
                  Sin empleado asignado
                </p>
              </div>
            )}
          </div>

          {/* Columna derecha */}
          <div className="space-y-5">
            {/* Tipo y Estado - Card */}
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <h4 className="font-bold text-base mb-3 text-purple-400 flex items-center gap-2">
                <span>ℹ️</span> Información
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Tipo de Cita</span>
                  <p className="text-white mt-1 font-medium">{getTipoCitaLabel(cita.tipo_cita)}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Estado</span>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-3 py-1.5 rounded-md text-sm font-semibold ${getEstadoColor(
                        cita.estado
                      )}`}
                    >
                      {getEstadoLabel(cita.estado)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción - Card */}
            {cita.descripcion && (
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <h4 className="font-bold text-base mb-3 text-cyan-400 flex items-center gap-2">
                  <span>📝</span> Descripción
                </h4>
                <p className="text-gray-200 text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {cita.descripcion}
                </p>
              </div>
            )}

            {/* Nota - Card */}
            {cita.nota && (
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <h4 className="font-bold text-base mb-3 text-orange-400 flex items-center gap-2">
                  <span>📌</span> Nota
                </h4>
                <p className="text-gray-200 text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {cita.nota}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Botones de acción fijos */}
      <div className="border-t border-gray-700 p-4 md:p-6 flex flex-col gap-3 flex-shrink-0 bg-gray-800 sticky bottom-0">
        {/* Botón de WhatsApp */}
        {clienteInfo.telefono && (
          <button
            onClick={handleWhatsApp}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <FaWhatsapp className="text-xl" />
            <span>Notificar por WhatsApp</span>
          </button>
        )}
        {/* Botones de acción principales */}
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FaEdit /> Editar
          </button>
          <button
            onClick={onDelete}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FaTrash /> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitaDetail;

