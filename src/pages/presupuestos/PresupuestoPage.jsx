// src/pages/presupuestos/PresupuestoPage.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet";
import { 
  fetchAllPresupuestos, 
  deletePresupuesto 
} from '../../api/presupuestosApi';

import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import PresupuestoList from './PresupuestoList';
import { Link } from 'react-router-dom';

const PresupuestoPage = () => {
  const [presupuestos, setPresupuestos] = useState([]);
  const [filteredPresupuestos, setFilteredPresupuestos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Estados para filtros
  const [filters, setFilters] = useState({
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
    cliente: '',
    vehiculo: ''
  });

  useEffect(() => {
    loadPresupuestos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [presupuestos, searchTerm, filters]);

  const loadPresupuestos = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllPresupuestos();
      setPresupuestos(data);
      setError('');
    } catch (error) {
      console.error('Error loading presupuestos:', error);
      setError('Error al cargar los presupuestos: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...presupuestos];

    // Filtro de búsqueda por texto
    if (searchTerm) {
      filtered = filtered.filter(presupuesto =>
        presupuesto.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        presupuesto.id?.toString().includes(searchTerm) ||
        presupuesto.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        presupuesto.vehiculo?.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        presupuesto.vehiculo?.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        presupuesto.vehiculo?.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (filters.estado) {
      filtered = filtered.filter(presupuesto => 
        presupuesto.estado?.toLowerCase() === filters.estado.toLowerCase()
      );
    }

    // Filtro por cliente
    if (filters.cliente) {
      filtered = filtered.filter(presupuesto =>
        presupuesto.cliente_nombre?.toLowerCase().includes(filters.cliente.toLowerCase())
      );
    }

    // Filtro por vehículo
    if (filters.vehiculo) {
      filtered = filtered.filter(presupuesto =>
        presupuesto.vehiculo?.placa?.toLowerCase().includes(filters.vehiculo.toLowerCase()) ||
        presupuesto.vehiculo?.marca?.toLowerCase().includes(filters.vehiculo.toLowerCase()) ||
        presupuesto.vehiculo?.modelo?.toLowerCase().includes(filters.vehiculo.toLowerCase())
      );
    }

    // Filtro por fecha desde
    if (filters.fechaDesde) {
      filtered = filtered.filter(presupuesto => {
        const fechaPresupuesto = presupuesto.fecha_inicio || presupuesto.fecha_creacion;
        return fechaPresupuesto && new Date(fechaPresupuesto) >= new Date(filters.fechaDesde);
      });
    }

    // Filtro por fecha hasta
    if (filters.fechaHasta) {
      filtered = filtered.filter(presupuesto => {
        const fechaPresupuesto = presupuesto.fecha_inicio || presupuesto.fecha_creacion;
        return fechaPresupuesto && new Date(fechaPresupuesto) <= new Date(filters.fechaHasta);
      });
    }

    setFilteredPresupuestos(filtered);
  };

  const handleDelete = async (id) => {
    if (!id || id === "" || id === null || id === "undefined") {
      console.error('❌ ID inválido recibido:', id);
      alert('Error: No se puede eliminar este presupuesto porque no tiene un ID válido');
      return;
    }

    if (window.confirm('¿Está seguro de que desea eliminar este presupuesto?')) {
      try {
        await deletePresupuesto(id);
        await loadPresupuestos(); // Recargar la lista
      } catch (error) {
        setError('Error al eliminar el presupuesto');
        console.error('Error deleting presupuesto:', error);
      }
    }
  };

  const clearFilters = () => {
    setFilters({
      estado: '',
      fechaDesde: '',
      fechaHasta: '',
      cliente: '',
      vehiculo: ''
    });
    setSearchTerm('');
  };

  return (
    <>
      <Helmet>
        <title>Presupuestos - Sistema de Taller</title>
      </Helmet>
      
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Presupuestos</h1>
            <Link
              to="/presupuestos/nuevo"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaPlus className="text-sm" />
              Nuevo Presupuesto
            </Link>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por número, cliente, placa o vehículo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-blue-50 text-blue-600 border-blue-300' 
                    : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <FaFilter />
                Filtros
              </button>

              {(Object.values(filters).some(v => v) || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
                >
                  Limpiar
                </button>
              )}
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <select
                    value={filters.estado}
                    onChange={(e) => setFilters(prev => ({...prev, estado: e.target.value}))}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Cliente..."
                    value={filters.cliente}
                    onChange={(e) => setFilters(prev => ({...prev, cliente: e.target.value}))}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <input
                    type="text"
                    placeholder="Vehículo..."
                    value={filters.vehiculo}
                    onChange={(e) => setFilters(prev => ({...prev, vehiculo: e.target.value}))}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={filters.fechaDesde}
                      onChange={(e) => setFilters(prev => ({...prev, fechaDesde: e.target.value}))}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Desde"
                    />
                    <input
                      type="date"
                      value={filters.fechaHasta}
                      onChange={(e) => setFilters(prev => ({...prev, fechaHasta: e.target.value}))}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Hasta"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Lista de presupuestos */}
        <div className="bg-white rounded-lg shadow-md">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando presupuestos...</p>
            </div>
          ) : filteredPresupuestos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg mb-2">No se encontraron presupuestos</p>
              <p className="text-sm">
                {presupuestos.length === 0 
                  ? 'Comience creando su primer presupuesto'
                  : 'Intente ajustar los filtros de búsqueda'
                }
              </p>
            </div>
          ) : (
            <PresupuestoList 
              presupuestos={filteredPresupuestos}
              onDelete={handleDelete}
              onRefresh={loadPresupuestos}
            />
          )}
        </div>

        {/* Información de resultados */}
        {!isLoading && filteredPresupuestos.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Mostrando {filteredPresupuestos.length} de {presupuestos.length} presupuestos
          </div>
        )}
      </div>
    </>
  );
};

export default PresupuestoPage;
