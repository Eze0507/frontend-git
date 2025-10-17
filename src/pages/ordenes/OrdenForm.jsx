import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllClientes, createCliente, toApiCliente } from "../../api/clientesApi.jsx";
import { fetchAllVehiculos, createVehiculo, toApiVehiculo, fetchAllMarcas, fetchAllModelos, fetchModelosByMarca } from "../../api/vehiculoApi.jsx";
import { createOrden } from "../../api/ordenesApi.jsx";
import Button from "../../components/button.jsx";

const OrdenForm = ({ onClose, onSave }) => {
  const navigate = useNavigate();
  
  // Estados principales del flujo - solo 2 pasos ahora
  const [currentStep, setCurrentStep] = useState(1); // 1: Cliente, 2: Vehículo
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);

  // Estados para datos
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [modelosFiltrados, setModelosFiltrados] = useState([]);

  // Estados para formularios
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [showVehiculoForm, setShowVehiculoForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados de formularios
  const [clienteForm, setClienteForm] = useState({
    nombre: "",
    apellido: "",
    nit: "",
    telefono: "",
    direccion: "",
    tipo_cliente: "NATURAL"
  });

  const [vehiculoForm, setVehiculoForm] = useState({
    numero_placa: "",
    marca: "",
    modelo: "",
    año: "",
    color: "",
    tipo: "",
    vin: "",
    numero_motor: "",
    cilindrada: "",
    tipo_combustible: "",
    cliente: null
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [clientesData, vehiculosData, marcasData, modelosData] = await Promise.all([
        fetchAllClientes(),
        fetchAllVehiculos(),
        fetchAllMarcas(),
        fetchAllModelos()
      ]);
      
      setClientes(clientesData);
      setVehiculos(vehiculosData);
      setMarcas(marcasData);
      setModelos(modelosData);
      
      console.log('🔍 Debug - Datos cargados:');
      console.log('  - Clientes:', clientesData);
      console.log('  - Vehículos:', vehiculosData);
      console.log('  - Primer vehículo:', vehiculosData[0]);
    } catch (error) {
      console.error("Error cargando datos:", error);
      alert("Error al cargar los datos necesarios");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar vehículos por cliente seleccionado
  const getVehiculosDelCliente = () => {
    if (!selectedCliente) return [];
    
    console.log('🔍 Debug - Cliente seleccionado:', selectedCliente);
    console.log('🔍 Debug - Todos los vehículos:', vehiculos);
    
    // Como la API no devuelve cliente_id, filtramos por nombre completo
    const nombreCompletoCliente = `${selectedCliente.nombre} ${selectedCliente.apellido}`.toLowerCase().trim();
    
    const vehiculosCliente = vehiculos.filter(vehiculo => {
      const nombreVehiculoCliente = vehiculo.cliente_nombre?.toLowerCase().trim() || '';
      const matches = nombreVehiculoCliente === nombreCompletoCliente;
      
      console.log(`🔍 Vehículo ${vehiculo.numero_placa}:`, {
        cliente_vehiculo: vehiculo.cliente_nombre,
        cliente_seleccionado: nombreCompletoCliente,
        matches: matches
      });
      
      return matches;
    });
    
    console.log('🔍 Debug - Vehículos del cliente encontrados:', vehiculosCliente);
    return vehiculosCliente;
  };

  // Manejo de cambio de marca para filtrar modelos
  const handleMarcaChange = async (marcaId) => {
    setVehiculoForm({ ...vehiculoForm, marca: marcaId, modelo: "" });
    
    try {
      const modelosPorMarca = await fetchModelosByMarca(marcaId);
      setModelosFiltrados(modelosPorMarca);
    } catch (error) {
      console.error("Error cargando modelos:", error);
      setModelosFiltrados([]);
    }
  };

  // Crear nuevo cliente
  const handleCreateCliente = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const nuevoCliente = await createCliente(toApiCliente(clienteForm));
      setSelectedCliente(nuevoCliente);
      setClientes([...clientes, nuevoCliente]);
      setShowClienteForm(false);
      setCurrentStep(2);
      
      // Limpiar formulario
      setClienteForm({
        nombre: "",
        apellido: "",
        nit: "",
        telefono: "",
        direccion: "",
        tipo_cliente: "NATURAL"
      });
    } catch (error) {
      console.error("Error creando cliente:", error);
      alert("Error al crear cliente: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo vehículo
  const handleCreateVehiculo = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const vehiculoData = {
        ...vehiculoForm,
        cliente: selectedCliente.id
      };
      const nuevoVehiculo = await createVehiculo(toApiVehiculo(vehiculoData));
      setSelectedVehiculo(nuevoVehiculo);
      setVehiculos([...vehiculos, nuevoVehiculo]);
      setShowVehiculoForm(false);
      
      // Crear orden inmediatamente después de crear el vehículo
      await createOrdenDirectly(nuevoVehiculo);
      
      // Limpiar formulario
      setVehiculoForm({
        numero_placa: "",
        marca: "",
        modelo: "",
        año: "",
        color: "",
        tipo: "",
        vin: "",
        numero_motor: "",
        cilindrada: "",
        tipo_combustible: "",
        cliente: null
      });
    } catch (error) {
      console.error("Error creando vehículo:", error);
      alert("Error al crear vehículo: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear orden de trabajo directamente (sin formulario adicional)
  const createOrdenDirectly = async (vehiculo = selectedVehiculo) => {
    try {
      console.log('🔍 Cliente seleccionado:', selectedCliente);
      console.log('🔍 Vehículo seleccionado:', vehiculo);
      
      const ordenData = {
        falloRequerimiento: "", // Campo vacío inicialmente
        observaciones: "",
        kilometraje: 0, // Valor por defecto
        nivelCombustible: 2, // 1/2 por defecto
        cliente: selectedCliente.id,
        vehiculo: vehiculo.id,
        estado: "pendiente",
        fecha_creacion: new Date().toISOString(),
        total: 0,
        subtotal: 0,
        impuesto: 0,
        descuento: 0,
        detalles: []
      };

      console.log('📤 Datos de orden a enviar:', ordenData);

      const nuevaOrden = await createOrden(ordenData);
      console.log('✅ Orden creada:', nuevaOrden);
      
      onSave && onSave(nuevaOrden);
      onClose && onClose();
      
      // No hacer navegación aquí, se hace desde OrdenPage
      
    } catch (error) {
      console.error("Error creando orden:", error);
      alert("Error al crear orden: " + error.message);
    }
  };

  // Función para cuando se selecciona un vehículo existente
  const handleSelectExistingVehiculo = async () => {
    if (!selectedVehiculo) {
      alert('Por favor selecciona un vehículo');
      return;
    }
    await createOrdenDirectly();
  };

  // Render del paso 1: Selección/Creación de Cliente
  const renderClienteStep = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Paso 1: Seleccionar Cliente</h3>
        <p className="text-gray-600">Elige un cliente existente o crea uno nuevo para la orden de trabajo</p>
      </div>
      
      {!showClienteForm ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Nuevo Cliente</h4>
                  <p className="text-sm text-gray-600">Registrar un cliente nuevo</p>
                </div>
              </div>
              <Button 
                variant="primario" 
                onClick={() => setShowClienteForm(true)}
                className="w-full"
              >
                Crear Nuevo Cliente
              </Button>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 hover:border-green-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Cliente Existente</h4>
                  <p className="text-sm text-gray-600">Seleccionar un cliente registrado</p>
                </div>
              </div>
              <Button 
                variant={selectedCliente ? "guardar" : "secundario"}
                onClick={() => setCurrentStep(2)}
                disabled={!selectedCliente}
                className="w-full"
              >
                {selectedCliente ? "Continuar" : "Seleccionar Cliente"}
              </Button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Seleccionar Cliente Existente:
            </label>
            <select
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 shadow-sm"
              value={selectedCliente?.id || ""}
              onChange={(e) => {
                const cliente = clientes.find(c => c.id === parseInt(e.target.value));
                setSelectedCliente(cliente);
              }}
            >
              <option value="">Seleccione un cliente...</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.apellido} - NIT: {cliente.nit}
                </option>
              ))}
            </select>
            {selectedCliente && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-900 mb-2">Cliente Seleccionado:</h5>
                <div className="text-sm text-blue-800">
                  <p><strong>Nombre:</strong> {selectedCliente.nombre} {selectedCliente.apellido}</p>
                  <p><strong>NIT:</strong> {selectedCliente.nit}</p>
                  <p><strong>Teléfono:</strong> {selectedCliente.telefono || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-gray-900">Nuevo Cliente</h4>
              <p className="text-sm text-gray-600">Completa la información del cliente</p>
            </div>
          </div>
          
          <form onSubmit={handleCreateCliente} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                  value={clienteForm.nombre}
                  onChange={(e) => setClienteForm({...clienteForm, nombre: e.target.value})}
                  placeholder="Ingrese el nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                  value={clienteForm.apellido}
                  onChange={(e) => setClienteForm({...clienteForm, apellido: e.target.value})}
                  placeholder="Ingrese el apellido"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  NIT *
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                  value={clienteForm.nit}
                  onChange={(e) => setClienteForm({...clienteForm, nit: e.target.value})}
                  placeholder="Ingrese el NIT"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Teléfono
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                  value={clienteForm.telefono}
                  onChange={(e) => setClienteForm({...clienteForm, telefono: e.target.value})}
                  placeholder="Ingrese el teléfono"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                  value={clienteForm.direccion}
                  onChange={(e) => setClienteForm({...clienteForm, direccion: e.target.value})}
                  placeholder="Ingrese la dirección"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tipo de Cliente
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                  value={clienteForm.tipo_cliente}
                  onChange={(e) => setClienteForm({...clienteForm, tipo_cliente: e.target.value})}
                >
                  <option value="NATURAL">Persona Natural</option>
                  <option value="EMPRESA">Empresa</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <Button type="submit" variant="guardar" disabled={loading} className="flex-1">
                {loading ? "Creando..." : "Crear Cliente"}
              </Button>
              <Button 
                type="button" 
                variant="cancelar" 
                onClick={() => setShowClienteForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  // Render del paso 2: Selección/Creación de Vehículo
  const renderVehiculoStep = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Paso 2: Seleccionar Vehículo</h3>
        <div className="flex items-center text-gray-600">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Cliente: <span className="font-medium ml-1">{selectedCliente?.nombre} {selectedCliente?.apellido}</span>
        </div>
      </div>

      {!showVehiculoForm ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200 hover:border-purple-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Nuevo Vehículo</h4>
                  <p className="text-sm text-gray-600">Registrar un vehículo nuevo</p>
                </div>
              </div>
              <Button 
                variant="primario" 
                onClick={() => setShowVehiculoForm(true)}
                className="w-full"
              >
                Crear Nuevo Vehículo
              </Button>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 hover:border-green-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Vehículo Existente</h4>
                  <p className="text-sm text-gray-600">Usar un vehículo registrado</p>
                </div>
              </div>
              <Button 
                variant={selectedVehiculo ? "guardar" : "secundario"}
                onClick={handleSelectExistingVehiculo}
                disabled={!selectedVehiculo || loading}
                className="w-full"
              >
                {loading ? "Creando Orden..." : selectedVehiculo ? "Crear Orden" : "Seleccionar Vehículo"}
              </Button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Vehículos del Cliente:
            </label>
            {getVehiculosDelCliente().length > 0 ? (
              <select
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 shadow-sm"
                value={selectedVehiculo?.id || ""}
                onChange={(e) => {
                  const vehiculo = vehiculos.find(v => v.id === parseInt(e.target.value));
                  setSelectedVehiculo(vehiculo);
                }}
              >
                <option value="">Seleccione un vehículo...</option>
                {getVehiculosDelCliente().map(vehiculo => (
                  <option key={vehiculo.id} value={vehiculo.id}>
                    {vehiculo.numero_placa} - {vehiculo.marca_nombre} {vehiculo.modelo_nombre}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0" />
                </svg>
                <p className="text-gray-500 text-sm">
                  Este cliente no tiene vehículos registrados. <br />
                  Debe crear un vehículo nuevo para continuar.
                </p>
              </div>
            )}
            {selectedVehiculo && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h5 className="font-medium text-green-900 mb-2">Vehículo Seleccionado:</h5>
                <div className="text-sm text-green-800">
                  <p><strong>Placa:</strong> {selectedVehiculo.numero_placa}</p>
                  <p><strong>Marca/Modelo:</strong> {selectedVehiculo.marca_nombre} {selectedVehiculo.modelo_nombre}</p>
                  <p><strong>Año:</strong> {selectedVehiculo.año || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-start">
            <Button 
              variant="secundario" 
              onClick={() => setCurrentStep(1)}
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al Paso 1
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateVehiculo} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Placa *
              </label>
              <input
                type="text"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={vehiculoForm.numero_placa}
                onChange={(e) => setVehiculoForm({...vehiculoForm, numero_placa: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca *
              </label>
              <select
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={vehiculoForm.marca}
                onChange={(e) => handleMarcaChange(e.target.value)}
              >
                <option value="">Seleccione una marca...</option>
                {marcas.map(marca => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modelo *
              </label>
              <select
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={vehiculoForm.modelo}
                onChange={(e) => setVehiculoForm({...vehiculoForm, modelo: e.target.value})}
                disabled={!vehiculoForm.marca}
              >
                <option value="">Seleccione un modelo...</option>
                {modelosFiltrados.map(modelo => (
                  <option key={modelo.id} value={modelo.id}>
                    {modelo.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año
              </label>
              <input
                type="number"
                min="1900"
                max="2030"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={vehiculoForm.año}
                onChange={(e) => setVehiculoForm({...vehiculoForm, año: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={vehiculoForm.color}
                onChange={(e) => setVehiculoForm({...vehiculoForm, color: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Vehículo
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={vehiculoForm.tipo}
                onChange={(e) => setVehiculoForm({...vehiculoForm, tipo: e.target.value})}
              >
                <option value="">Seleccione tipo...</option>
                <option value="CAMIONETA">Camioneta</option>
                <option value="DEPORTIVO">Deportivo</option>
                <option value="FURGON">Furgón</option>
                <option value="HATCHBACK">Hatchback</option>
                <option value="SEDAN">Sedán</option>
                <option value="SUV">SUV</option>
                <option value="CITYCAR">CityCar</option>
              </select>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button type="submit" variant="guardar" disabled={loading}>
              {loading ? "Creando..." : "Crear Vehículo"}
            </Button>
            <Button 
              type="button" 
              variant="cancelar" 
              onClick={() => setShowVehiculoForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="flex space-x-4">
        <Button 
          variant="secundario" 
          onClick={() => setCurrentStep(1)}
        >
          Volver
        </Button>
      </div>
    </div>
  );

  if (loading && currentStep === 1) {
    return (
      <div className="bg-white p-6 rounded-lg">
        <div className="text-center">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nueva Orden de Trabajo</h2>
          <p className="text-gray-600 mt-1">Crea una nueva orden siguiendo los pasos</p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Indicador de pasos mejorado */}
      <div className="flex items-center mb-10">
        <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
            currentStep >= 1 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            1
          </div>
          <span className="ml-3 font-medium">Cliente</span>
        </div>
        <div className={`flex-1 h-0.5 mx-6 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
            currentStep >= 2 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            2
          </div>
          <span className="ml-3 font-medium">Vehículo</span>
        </div>
      </div>

        {/* Contenido del paso actual */}
        {currentStep === 1 && renderClienteStep()}
        {currentStep === 2 && renderVehiculoStep()}
    </div>
  );
};

export default OrdenForm;