import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DetalleNominaList from './DetalleNominaList.jsx';
import { 
  fetchNominaById
} from '../../api/nominaApi.jsx';
import { 
  fetchDetallesNomina,
  recalcularDetalleNomina 
} from '../../api/detallenominaApi.jsx';
import Button from '../../components/button.jsx';

const DetalleNominaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nomina, setNomina] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNomina = async () => {
    try {
      const data = await fetchNominaById(id);
      setNomina(data);
    } catch (error) {
      console.error(error.message);
      alert('Error al cargar la nómina');
    }
  };

  const loadDetalles = async () => {
    setLoading(true);
    try {
      const data = await fetchDetallesNomina({ nomina: id });
      setDetalles(data);
    } catch (error) {
      console.error(error.message);
      alert('Error al cargar los detalles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadNomina();
      loadDetalles();
    }
  }, [id]);

  const handleRecalcularDetalle = async (detalleId) => {
    if (!window.confirm("¿Recalcular este detalle?")) return;
    try {
      await recalcularDetalleNomina(detalleId);
      alert('Detalle recalculado correctamente');
      loadDetalles();
      loadNomina();
    } catch (error) {
      console.error(error.message);
      alert('Error al recalcular el detalle');
    }
  };

  return (
    <div className="relative">
      {/* Encabezado con información de la nómina */}
      {nomina && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Nómina: {nomina.periodo || `${nomina.mes}/${new Date(nomina.fecha_inicio).getFullYear()}`}
              </h2>
              <p className="text-gray-600">
                Estado: <span className="font-semibold">{nomina.estado_display || nomina.estado}</span>
              </p>
            </div>
            <Button variant="primary" onClick={() => navigate('/admin/nominas')}>
              ← Volver a Nóminas
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Fecha Inicio</p>
              <p className="text-lg font-semibold">{nomina.fecha_inicio}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Fecha Corte</p>
              <p className="text-lg font-semibold">{nomina.fecha_corte}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Empleados</p>
              <p className="text-lg font-semibold">{nomina.cantidad_empleados || detalles.length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Nómina</p>
              <p className="text-lg font-semibold">Bs. {parseFloat(nomina.total_nomina || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de detalles */}
      <DetalleNominaList
        detalles={detalles}
        loading={loading}
        onRecalcular={handleRecalcularDetalle}
        estado={nomina?.estado}
      />
    </div>
  );
};

export default DetalleNominaPage;
