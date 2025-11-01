// Componente de integración para agregar botón de pago en OrdenDetalle
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard } from 'react-icons/fa';

const BotonPagarOrden = ({ ordenId, montoTotal, disabled = false, compact = false }) => {
  const navigate = useNavigate();

  const handlePagar = () => {
    navigate(`/pagos/checkout/${ordenId}`);
  };

  // Versión compacta para el header de OrdenDetalle
  if (compact) {
    return (
      <button
        onClick={handlePagar}
        disabled={disabled}
        title={disabled ? 'No se puede pagar esta orden' : `Pagar orden - Bs. ${montoTotal}`}
        className={`w-9 h-9 rounded-md shadow-sm flex items-center justify-center mr-1 ${
          disabled
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        <FaCreditCard className="w-4 h-4" />
      </button>
    );
  }

  // Versión completa para otros usos
  return (
    <button
      onClick={handlePagar}
      disabled={disabled}
      className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors flex items-center gap-2 ${
        disabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-green-600 hover:bg-green-700'
      }`}
      title={disabled ? 'No se puede pagar esta orden' : 'Realizar pago de la orden'}
    >
      <FaCreditCard />
      <span>Pagar Orden</span>
      {montoTotal && (
        <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded">
          Bs. {montoTotal}
        </span>
      )}
    </button>
  );
};

export default BotonPagarOrden;
