import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PagarConStripe from '../../../components/pagos/PagarConStripe';
import { FaArrowLeft, FaCreditCard } from 'react-icons/fa';

const PagoOrdenPage = () => {
  const { ordenId } = useParams();
  const navigate = useNavigate();
  const [mostrarPago, setMostrarPago] = useState(false);

  // Estos datos deberían venir de tu API al cargar la orden
  // Por ahora son de ejemplo
  const ordenData = {
    id: ordenId,
    numero: `OT-${ordenId}`,
    costo_total: 350.00,
    descripcion: 'Reparación de motor',
    cliente: 'Juan Pérez',
    vehiculo: 'Toyota Corolla 2020'
  };

  const handlePagoExitoso = (data) => {
    console.log('✅ Pago completado:', data);
    
    // Mostrar notificación de éxito
    alert(`¡Pago exitoso! ID: ${data.pagoId}`);
    
    // Redirigir a la página de la orden o a un resumen
    navigate(`/ordenes/${ordenId}`);
  };

  const handleCancelar = () => {
    setMostrarPago(false);
    // O regresar a la página anterior
    // navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Pagar Orden de Trabajo</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Resumen de la orden */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumen de la Orden</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Número de Orden:</span>
                <span className="font-semibold">{ordenData.numero}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-semibold">{ordenData.cliente}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Vehículo:</span>
                <span className="font-semibold">{ordenData.vehiculo}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Descripción:</span>
                <span className="font-semibold">{ordenData.descripcion}</span>
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <span className="text-lg font-semibold text-gray-700">Total a Pagar:</span>
                <span className="text-3xl font-bold text-blue-600">
                  Bs. {ordenData.costo_total.toFixed(2)}
                </span>
              </div>
            </div>

            {!mostrarPago && (
              <button
                onClick={() => setMostrarPago(true)}
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaCreditCard />
                Pagar con Tarjeta
              </button>
            )}
          </div>

          {/* Formulario de pago */}
          <div>
            {mostrarPago ? (
              <PagarConStripe
                ordenTrabajoId={ordenId}
                monto={ordenData.costo_total.toFixed(2)}
                ordenNumero={ordenData.numero}
                onSuccess={handlePagoExitoso}
                onCancel={handleCancelar}
              />
            ) : (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <FaCreditCard className="text-blue-600" />
                  Información de Pago
                </h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>✅ Pago 100% seguro con Stripe</li>
                  <li>✅ Modo de prueba activado</li>
                  <li>✅ Aceptamos tarjetas Visa, Mastercard y American Express</li>
                  <li>✅ No se almacenan datos de tu tarjeta</li>
                </ul>
                
                <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                  <p className="text-xs text-blue-800 font-semibold mb-2">
                    🧪 Tarjeta de Prueba:
                  </p>
                  <p className="font-mono text-sm text-blue-900">4242 4242 4242 4242</p>
                  <p className="text-xs text-blue-700 mt-1">CVV: 123 | Fecha: 12/25</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-800 mb-3">📝 Notas Importantes</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Este es un sistema de pago en <strong>modo de prueba</strong> para fines universitarios.</li>
            <li>• No se procesarán cargos reales a tu tarjeta.</li>
            <li>• Usa la tarjeta de prueba <code className="bg-gray-100 px-2 py-1 rounded">4242 4242 4242 4242</code> para simular pagos.</li>
            <li>• El pago se registrará en el sistema automáticamente.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PagoOrdenPage;
