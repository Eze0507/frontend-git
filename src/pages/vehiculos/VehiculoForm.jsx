import React, { useEffect, useState, useMemo } from "react";
import StyledForm from "../../components/form";      
import Button from "../../components/button";
import { FaSearch, FaTimes } from "react-icons/fa";
import { fetchModelosByMarca } from "../../api/vehiculoApi.jsx";        

const VehiculoForm = ({ onSubmit, onCancel, initialData, clientes = [], marcas = [], modelos = [], loading }) => {
  const [form, setForm] = useState({
    id: null,
    numero_placa: "",
    vin: "",
    numero_motor: "",
    tipo: "",
    version: "",
    color: "",
    año: "",
    cilindrada: "",
    tipo_combustible: "",
    cliente: "",
    marca: "",
    modelo: "",
  });

  // Estados para búsqueda de clientes
  const [clienteSearch, setClienteSearch] = useState("");
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);

  // Estados para modelos filtrados por marca
  const [modelosFiltrados, setModelosFiltrados] = useState([]);
  const [cargandoModelos, setCargandoModelos] = useState(false);

  // Filtrar clientes basado en la búsqueda
  const filteredClientes = useMemo(() => {
    if (!clienteSearch.trim()) return clientes.slice(0, 10); // Mostrar solo los primeros 10 si no hay búsqueda
    
    const searchTerm = clienteSearch.toLowerCase();
    return clientes.filter(cliente => {
      const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
      const nit = cliente.nit?.toLowerCase() || '';
      return nombreCompleto.includes(searchTerm) || nit.includes(searchTerm);
    }).slice(0, 10); // Limitar a 10 resultados
  }, [clientes, clienteSearch]);

  // Función para cargar modelos por marca
  const cargarModelosPorMarca = async (marcaId) => {
    if (!marcaId) {
      setModelosFiltrados([]);
      return;
    }

    setCargandoModelos(true);
    try {
      const modelos = await fetchModelosByMarca(marcaId);
      setModelosFiltrados(modelos);
      console.log(`📋 Modelos cargados para marca ${marcaId}:`, modelos);
    } catch (error) {
      console.error('❌ Error al cargar modelos por marca:', error);
      setModelosFiltrados([]);
    } finally {
      setCargandoModelos(false);
    }
  };

  useEffect(() => {
    console.log('📋 Datos iniciales recibidos:', initialData);
    
    setForm({
      id: initialData?.id || null,
      numero_placa: initialData?.numero_placa || "",
      vin: initialData?.vin || "",
      numero_motor: initialData?.numero_motor || "",
      tipo: initialData?.tipo || "",
      version: initialData?.version || "",
      color: initialData?.color || "",
      año: initialData?.año || "",
      cilindrada: initialData?.cilindrada || "",
      tipo_combustible: initialData?.tipo_combustible || "",
      // Manejo de relaciones
      cliente: initialData?.cliente?.id || initialData?.cliente_obj?.id || initialData?.cliente || "",
      marca: initialData?.marca?.id || initialData?.marca_obj?.id || initialData?.marca || "",
      modelo: initialData?.modelo?.id || initialData?.modelo_obj?.id || initialData?.modelo || "",
    });

    // Configurar cliente seleccionado si existe
    if (initialData?.cliente || initialData?.cliente_obj) {
      const clienteId = initialData.cliente?.id || initialData.cliente_obj?.id || initialData.cliente;
      const cliente = clientes.find(c => c.id === clienteId);
      if (cliente) {
        setSelectedCliente(cliente);
        setClienteSearch(`${cliente.nombre} ${cliente.apellido} - ${cliente.nit}`);
      }
    }
    
    console.log('📝 Formulario inicializado con:', {
      id: initialData?.id,
      numero_placa: initialData?.numero_placa,
      cliente: initialData?.cliente?.id || initialData?.cliente_obj?.id || initialData?.cliente,
      marca: initialData?.marca?.id || initialData?.marca_obj?.id || initialData?.marca,
      modelo: initialData?.modelo?.id || initialData?.modelo_obj?.id || initialData?.modelo,
    });

    // Cargar modelos si hay una marca seleccionada
    const marcaId = initialData?.marca?.id || initialData?.marca_obj?.id || initialData?.marca;
    if (marcaId) {
      cargarModelosPorMarca(marcaId);
    }
  }, [initialData, clientes]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showClienteDropdown && !event.target.closest('.cliente-search-container')) {
        setShowClienteDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showClienteDropdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si se cambia la marca, cargar modelos correspondientes y reiniciar modelo
    if (name === 'marca') {
      setForm((f) => ({ ...f, [name]: value, modelo: "" })); // Reiniciar modelo
      cargarModelosPorMarca(value);
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Funciones para búsqueda de clientes
  const handleClienteSearch = (e) => {
    const value = e.target.value;
    setClienteSearch(value);
    setShowClienteDropdown(true);
    
    // Si se borra la búsqueda, limpiar selección
    if (!value.trim()) {
      setSelectedCliente(null);
      setForm(f => ({ ...f, cliente: "" }));
    }
  };

  const handleClienteSelect = (cliente) => {
    setSelectedCliente(cliente);
    setClienteSearch(`${cliente.nombre} ${cliente.apellido} - ${cliente.nit}`);
    setForm(f => ({ ...f, cliente: cliente.id }));
    setShowClienteDropdown(false);
  };

  const handleClienteClear = () => {
    setSelectedCliente(null);
    setClienteSearch("");
    setForm(f => ({ ...f, cliente: "" }));
    setShowClienteDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form); // mapping final se hace en la Page
  };

  const isEditing = !!initialData;

  return (
    <StyledForm title={isEditing ? "Editar Vehículo" : "Registrar Vehículo"} onSubmit={handleSubmit} className="max-w-4xl w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Número de Placa */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Número de Placa *</label>
          <input
            name="numero_placa" 
            value={form.numero_placa} 
            onChange={handleChange} 
            required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ej: ABC-123"
          />
          <p className="text-xs text-gray-500 mt-1">
            El número de placa debe ser único en el sistema
          </p>
        </div>

        {/* VIN */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">VIN</label>
          <input
            name="vin" 
            value={form.vin} 
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Número de identificación del vehículo"
          />
        </div>

        {/* Número de Motor */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Número de Motor</label>
          <input
            name="numero_motor" 
            value={form.numero_motor} 
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Número de motor del vehículo"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Tipo</label>
          <select
            name="tipo" 
            value={form.tipo} 
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Seleccionar tipo</option>
            <option value="CAMIONETA">Camioneta</option>
            <option value="DEPORTIVO">Deportivo</option>
            <option value="FURGON">Furgón</option>
            <option value="HATCHBACK">Hatchback</option>
            <option value="SEDAN">Sedán</option>
            <option value="SUV">SUV</option>
            <option value="CITYCAR">CityCar</option>
          </select>
        </div>

        {/* Versión */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Versión</label>
          <input
            name="version" 
            value={form.version} 
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Versión del modelo"
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Color</label>
          <input
            name="color" 
            value={form.color} 
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Color del vehículo"
          />
        </div>

        {/* Año */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Año</label>
          <input
            name="año" 
            type="number"
            value={form.año} 
            onChange={handleChange}
            min="1950"
            max="2100"
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Año del vehículo"
          />
        </div>

        {/* Cilindrada */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Cilindrada (cc)</label>
          <input
            name="cilindrada" 
            type="number"
            value={form.cilindrada} 
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Cilindrada en centímetros cúbicos"
          />
        </div>
      </div>

      {/* Tipo de Combustible */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Tipo de Combustible</label>
        <select
          name="tipo_combustible" 
          value={form.tipo_combustible} 
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
        >
          <option value="">Seleccionar combustible</option>
          <option value="Gasolina">Gasolina</option>
          <option value="Diésel">Diésel</option>
          <option value="Gas Natural">Gas Natural</option>
          <option value="Eléctrico">Eléctrico</option>
          <option value="Híbrido">Híbrido</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cliente con búsqueda */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Cliente/Propietario</label>
          <div className="relative cliente-search-container">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre o CI del cliente..."
                value={clienteSearch}
                onChange={handleClienteSearch}
                onFocus={() => setShowClienteDropdown(true)}
                className="w-full pl-10 pr-10 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {selectedCliente && (
                <button
                  type="button"
                  onClick={handleClienteClear}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Dropdown de resultados */}
            {showClienteDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredClientes.length > 0 ? (
                  filteredClientes.map(cliente => (
                    <div
                      key={cliente.id}
                      onClick={() => handleClienteSelect(cliente)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-800">
                        {cliente.nombre} {cliente.apellido}
                      </div>
                      <div className="text-sm text-gray-500">
                        CI: {cliente.nit} | {cliente.tipo_cliente === 'EMPRESA' ? 'Empresa' : 'Natural'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-sm">
                    {clienteSearch.trim() ? 'No se encontraron clientes' : 'Escriba para buscar clientes...'}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Escriba el nombre o CI del cliente para buscar
          </p>
        </div>

        {/* Marca */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Marca</label>
          <select
            name="marca"
            value={form.marca}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Seleccionar marca</option>
            {marcas.map(m => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Modelo */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Modelo</label>
          <select
            name="modelo"
            value={form.modelo}
            onChange={handleChange}
            disabled={!form.marca || cargandoModelos}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {!form.marca 
                ? "Seleccione una marca primero" 
                : cargandoModelos 
                  ? "Cargando modelos..." 
                  : "Seleccionar modelo"
              }
            </option>
            {modelosFiltrados.map(m => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
          {!form.marca && (
            <p className="text-xs text-gray-500 mt-1">
              Seleccione una marca para ver los modelos disponibles
            </p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 mt-6">
        {onCancel && (
          <Button variant="cancelar" onClick={onCancel} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md border">
            Cancelar
          </Button>
        )}
        <Button variant="guardar" type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">
          {isEditing ? "Guardar Cambios" : "Guardar"}
        </Button>
      </div>
    </StyledForm>
  );
};

export default VehiculoForm;
