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
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Paso 1: Cliente</h3>
      
      {!showClienteForm ? (
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Button 
              variant="secundario" 
              onClick={() => setShowClienteForm(true)}
            >
              Crear Nuevo Cliente
            </Button>
            <Button 
              variant="primario" 
              onClick={() => setCurrentStep(2)}
              disabled={!selectedCliente}
            >
              Continuar con Cliente Existente
            </Button>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Cliente Existente:
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateCliente} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={clienteForm.nombre}
                onChange={(e) => setClienteForm({...clienteForm, nombre: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={clienteForm.apellido}
                onChange={(e) => setClienteForm({...clienteForm, apellido: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIT *
              </label>
              <input
                type="text"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={clienteForm.nit}
                onChange={(e) => setClienteForm({...clienteForm, nit: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={clienteForm.telefono}
                onChange={(e) => setClienteForm({...clienteForm, telefono: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={clienteForm.direccion}
                onChange={(e) => setClienteForm({...clienteForm, direccion: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Cliente
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={clienteForm.tipo_cliente}
                onChange={(e) => setClienteForm({...clienteForm, tipo_cliente: e.target.value})}
              >
                <option value="NATURAL">Persona Natural</option>
                <option value="EMPRESA">Empresa</option>
              </select>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button type="submit" variant="guardar" disabled={loading}>
              {loading ? "Creando..." : "Crear Cliente"}
            </Button>
            <Button 
              type="button" 
              variant="cancelar" 
              onClick={() => setShowClienteForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );

  // Render del paso 2: Selección/Creación de Vehículo
  const renderVehiculoStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Paso 2: Vehículo</h3>
        <div className="text-sm text-gray-600">
          Cliente: {selectedCliente?.nombre} {selectedCliente?.apellido}
        </div>
      </div>

      {!showVehiculoForm ? (
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Button 
              variant="secundario" 
              onClick={() => setShowVehiculoForm(true)}
            >
              Crear Nuevo Vehículo
            </Button>
            <Button 
              variant="primario" 
              onClick={handleSelectExistingVehiculo}
              disabled={!selectedVehiculo || loading}
            >
              {loading ? "Creando Orden..." : "Crear Orden con Vehículo Existente"}
            </Button>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehículos del Cliente:
            </label>
            {getVehiculosDelCliente().length > 0 ? (
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <p className="text-gray-500 italic">
                Este cliente no tiene vehículos registrados. Cree uno nuevo.
              </p>
            )}
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
                <option value="SEDAN">Sedán</option>
                <option value="SUV">SUV</option>
                <option value="HATCHBACK">Hatchback</option>
                <option value="PICKUP">Pickup</option>
                <option value="COUPE">Coupe</option>
                <option value="CONVERTIBLE">Convertible</option>
                <option value="WAGON">Wagon</option>
                <option value="MINIVAN">Minivan</option>
                <option value="TRUCK">Camión</option>
                <option value="MOTORCYCLE">Motocicleta</option>
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="text-center">Cargando datos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Nueva Orden de Trabajo</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center mb-8">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2">Cliente</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2">Vehículo</span>
          </div>
        </div>

        {/* Contenido del paso actual */}
        {currentStep === 1 && renderClienteStep()}
        {currentStep === 2 && renderVehiculoStep()}
      </div>
    </div>
  );
};

export default OrdenForm;