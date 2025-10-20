// src/pages/presupuestos/PresupuestoList.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaEye, FaCar, FaCalendar, FaUser, FaDollarSign } from 'react-icons/fa';

const PresupuestoList = ({ presupuestos, onDelete, onRefresh }) => {
  const navigate = useNavigate();

  const handleViewDetail = (presupuesto) => {
    navigate(`/presupuestos/${presupuesto.id}`);
  };

  const handleEdit = (presupuesto) => {
    navigate(`/presupuestos/${presupuesto.id}/editar`);
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Bs. 0,00';
    return `Bs. ${parseFloat(amount).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (estado) => {
    const statusConfig = {
      'pendiente': { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      'aprobado': { color: 'bg-green-100 text-green-800', label: 'Aprobado' },
      'rechazado': { color: 'bg-red-100 text-red-800', label: 'Rechazado' },
      'cancelado': { color: 'bg-gray-100 text-gray-800', label: 'Cancelado' },
    };

    const config = statusConfig[estado?.toLowerCase()] || statusConfig['pendiente'];
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Presupuesto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vehículo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {presupuestos.map((presupuesto) => (
            <tr key={presupuesto.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-900">
                    {presupuesto.numero || `#${presupuesto.id}`}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <FaCalendar className="mr-1" />
                    {formatDate(presupuesto.fecha_creacion)}
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FaUser className="text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {presupuesto.cliente_nombre || 'Sin cliente'}
                    </div>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FaCar className="text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {presupuesto.vehiculo?.placa || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {presupuesto.vehiculo?.marca} {presupuesto.vehiculo?.modelo}
                    </div>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(presupuesto.estado)}
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(presupuesto.total)}
                    </span>
                  </div>
                  {presupuesto.total_descuentos > 0 && (
                    <div className="text-xs text-red-500">
                      Desc: -{formatCurrency(presupuesto.total_descuentos)}
                    </div>
                  )}
                  {presupuesto.monto_impuesto > 0 && (
                    <div className="text-xs text-blue-500">
                      IVA: {formatCurrency(presupuesto.monto_impuesto)}
                    </div>
                  )}
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleViewDetail(presupuesto)}
                    className="text-indigo-600 hover:text-indigo-900 transition-colors"
                    title="Ver detalle"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleEdit(presupuesto)}
                    className="text-yellow-600 hover:text-yellow-900 transition-colors"
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => onDelete(presupuesto.id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                    title="Eliminar"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PresupuestoList;