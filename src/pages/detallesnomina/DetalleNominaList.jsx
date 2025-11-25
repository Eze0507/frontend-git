import React, { useMemo, useState } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";

const DetalleNominaList = ({ 
  detalles, 
  loading,
  onRecalcular,
  estado
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDetalles = useMemo(() => {
    if (!detalles || !Array.isArray(detalles)) return [];
    
    return detalles.filter((detalle) => {
      if (!searchTerm) return true;
      
      const empleadoNombre = detalle.empleado_nombre_completo || 
        `${detalle.empleado?.nombre || ''} ${detalle.empleado?.apellido || ''}`.trim();
      
      return empleadoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (detalle.empleado?.ci && detalle.empleado.ci.includes(searchTerm));
    });
  }, [searchTerm, detalles]);

  const columns = [
    "empleado_nombre",
    "ci",
    "sueldo",
    "horas_extras",
    "total_bruto",
    "total_descuento",
    "sueldo_neto"
  ];

  const tableData = filteredDetalles.map((detalle) => ({
    id: detalle.id,
    empleado_nombre: detalle.empleado_nombre_completo || 
      `${detalle.empleado?.nombre || ''} ${detalle.empleado?.apellido || ''}`.trim(),
    ci: detalle.empleado?.ci || '',
    sueldo: detalle.sueldo ? `Bs. ${parseFloat(detalle.sueldo).toFixed(2)}` : 'Bs. 0.00',
    horas_extras: detalle.horas_extras ? parseFloat(detalle.horas_extras).toFixed(2) : '0.00',
    total_bruto: detalle.total_bruto ? `Bs. ${parseFloat(detalle.total_bruto).toFixed(2)}` : 'Bs. 0.00',
    total_descuento: detalle.total_descuento ? `Bs. ${parseFloat(detalle.total_descuento).toFixed(2)}` : 'Bs. 0.00',
    sueldo_neto: detalle.sueldo_neto ? `Bs. ${parseFloat(detalle.sueldo_neto).toFixed(2)}` : 'Bs. 0.00',
  }));

  const renderActions = (detalle) => (
    <div className="flex gap-2">
      {estado === 'Pendiente' && (
        <Button
          variant="primary"
          onClick={() => onRecalcular(detalle.id)}
          title="Recalcular detalle"
        >
          🔄 Recalcular
        </Button>
      )}
    </div>
  );

  // Calcular totales
  const totales = useMemo(() => {
    if (!filteredDetalles || filteredDetalles.length === 0) {
      return {
        total_bruto: 0,
        total_descuento: 0,
        total_neto: 0,
        total_horas_extras: 0
      };
    }

    return filteredDetalles.reduce((acc, detalle) => ({
      total_bruto: acc.total_bruto + parseFloat(detalle.total_bruto || 0),
      total_descuento: acc.total_descuento + parseFloat(detalle.total_descuento || 0),
      total_neto: acc.total_neto + parseFloat(detalle.sueldo_neto || 0),
      total_horas_extras: acc.total_horas_extras + parseFloat(detalle.horas_extras || 0)
    }), {
      total_bruto: 0,
      total_descuento: 0,
      total_neto: 0,
      total_horas_extras: 0
    });
  }, [filteredDetalles]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Detalles de Nómina por Empleado
      </h2>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre o CI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-md px-3 py-2 bg-white text-gray-700 w-full max-w-md"
          />
        </div>
        <div className="text-sm text-gray-600">
          Total empleados: <span className="font-semibold">{filteredDetalles.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando detalles...</div>
      ) : (
        <>
          <CustomTable
            columns={columns}
            data={tableData}
            renderCustomActions={renderActions}
          />

          {/* Resumen de totales */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Resumen de Totales</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Total Bruto</p>
                <p className="text-xl font-semibold text-blue-600">
                  Bs. {totales.total_bruto.toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Total Descuentos</p>
                <p className="text-xl font-semibold text-red-600">
                  Bs. {totales.total_descuento.toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Total Neto</p>
                <p className="text-xl font-semibold text-green-600">
                  Bs. {totales.total_neto.toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Horas Extras Totales</p>
                <p className="text-xl font-semibold text-purple-600">
                  {totales.total_horas_extras.toFixed(2)} hrs
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DetalleNominaList;
