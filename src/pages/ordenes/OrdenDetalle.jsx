import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchOrdenById, fetchItemsCatalogo, deleteDetalleOrden, updateOrdenDescripcion, updateOrdenKilometraje, updateOrdenNivelCombustible, updateOrdenObservaciones, updateOrdenFechaFinalizacion, addDetalleOrden, updateOrdenEstado } from "../../api/ordenesApi.jsx";
import { updateVehiculo, toApiVehiculo, fetchAllMarcas, fetchAllModelos, fetchModelosByMarca, fetchAllClientes, fetchVehiculoById } from "../../api/vehiculoApi";
import Button from "../../components/button.jsx";
import VehiculoForm from "../vehiculos/VehiculoForm";
import NotasOrden from "../../components/NotasOrden.jsx";
import TareasOrden from "../../components/TareasOrden.jsx";
import InventarioVehiculo from "../../components/InventarioVehiculo.jsx";
import HistorialInspecciones from "../../components/HistorialInspecciones.jsx";
import HistorialPruebasRuta from "../../components/HistorialPruebasRuta.jsx";
import AsignacionesTecnicos from "../../components/AsignacionesTecnicos.jsx";
import ImagenesOrden from "../../components/ImagenesOrden.jsx";
import BotonPagarOrden from "../../components/pagos/BotonPagarOrden.jsx";

// Función para mapear los datos del vehículo al formato que espera VehiculoForm
function mapVehiculoApiToForm(vehiculoApi, ordenApi, marcasList = [], modelosList = []) {
  if (!vehiculoApi && !ordenApi) {
    return null;
  }
  
  // Buscar nombres de marca y modelo en las listas cargadas
  let marcaNombre = "";
  let modeloNombre = "";
  
  if (vehiculoApi?.marca) {
    const marcaEncontrada = marcasList.find(m => m.id === vehiculoApi.marca);
    marcaNombre = marcaEncontrada?.nombre || "";
  }
  
  if (vehiculoApi?.modelo) {
    const modeloEncontrado = modelosList.find(m => m.id === vehiculoApi.modelo);
    modeloNombre = modeloEncontrado?.nombre || "";
  }
  
  const mapped = {
    id: vehiculoApi?.id || ordenApi?.vehiculo || null,
    numero_placa: vehiculoApi?.numero_placa || vehiculoApi?.placa || ordenApi?.vehiculo_placa || "",
    vin: vehiculoApi?.vin || "",
    numero_motor: vehiculoApi?.numero_motor || "",
    tipo: vehiculoApi?.tipo || "",
    version: vehiculoApi?.version || "",
    color: vehiculoApi?.color || "",
    año: vehiculoApi?.año || vehiculoApi?.anio || "",
    cilindrada: vehiculoApi?.cilindrada || "",
    tipo_combustible: vehiculoApi?.tipo_combustible || "",
    cliente: (vehiculoApi?.cliente && typeof vehiculoApi.cliente === 'number') ? vehiculoApi.cliente : (vehiculoApi?.cliente?.id || ordenApi?.cliente || ""),
    cliente_obj: vehiculoApi?.cliente_obj || null,
    marca: (vehiculoApi?.marca && typeof vehiculoApi.marca === 'number') ? vehiculoApi.marca : (vehiculoApi?.marca?.id || ""),
    marca_obj: vehiculoApi?.marca_obj || null,
    modelo: (vehiculoApi?.modelo && typeof vehiculoApi.modelo === 'number') ? vehiculoApi.modelo : (vehiculoApi?.modelo?.id || ""),
    modelo_obj: vehiculoApi?.modelo_obj || null,
    // Agregar nombres para mostrar en la UI - usar múltiples fuentes
    marca_nombre: marcaNombre || vehiculoApi?.marca_obj?.nombre || vehiculoApi?.marca_nombre || ordenApi?.vehiculo_marca || "",
    modelo_nombre: modeloNombre || vehiculoApi?.modelo_obj?.nombre || vehiculoApi?.modelo_nombre || ordenApi?.vehiculo_modelo || "",
    placa: vehiculoApi?.numero_placa || vehiculoApi?.placa || ordenApi?.vehiculo_placa || ""
  };

  return mapped;
}

const OrdenDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Detectar si el usuario es cliente
  const rawRole = (localStorage.getItem("userRole") || '').toLowerCase();
  const userRole = rawRole === 'administrador' ? 'admin' : rawRole;
  const isCliente = userRole === 'cliente';
  
  const [orden, setOrden] = useState(null);
  const [vehiculo, setVehiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("vehiculo");
  const [showAddForm, setShowAddForm] = useState(false);
  const [itemsCatalogo, setItemsCatalogo] = useState([]);
  const [tipoItem, setTipoItem] = useState("catalogo"); // "catalogo" o "personalizado"
  const [descripcionLocal, setDescripcionLocal] = useState("");
  const [guardandoDescripcion, setGuardandoDescripcion] = useState(false);
  const [kilometrajeLocal, setKilometrajeLocal] = useState("");
  const [guardandoKilometraje, setGuardandoKilometraje] = useState(false);
  const [nivelCombustibleLocal, setNivelCombustibleLocal] = useState(null); // Cambiar a null para detectar no inicializado
  const [guardandoNivelCombustible, setGuardandoNivelCombustible] = useState(false);
  const [observacionesLocal, setObservacionesLocal] = useState("");
  const [guardandoObservaciones, setGuardandoObservaciones] = useState(false);
  const [fechaFinalizacionLocal, setFechaFinalizacionLocal] = useState("");
  const [guardandoFechaFinalizacion, setGuardandoFechaFinalizacion] = useState(false);
  const [showEstadoDropdown, setShowEstadoDropdown] = useState(false);
  const [showVehiculoForm, setShowVehiculoForm] = useState(false);
  const [showInventarioModal, setShowInventarioModal] = useState(false);
  const [showInspeccionesModal, setShowInspeccionesModal] = useState(false);
  const [showPruebaRutaModal, setShowPruebaRutaModal] = useState(false);
  const [reloadInventario, setReloadInventario] = useState(null);
  const [inventarioRefreshTrigger, setInventarioRefreshTrigger] = useState(0);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [modelosFiltrados, setModelosFiltrados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [newItem, setNewItem] = useState({
    item_id: null,
    item_personalizado: "",
    cantidad: "",
    precio_unitario: "",
    descuento_porcentaje: ""
  });

  useEffect(() => {
    loadOrdenData();
  }, [id]);

  // useEffect para cerrar el dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEstadoDropdown && !event.target.closest('.relative')) {
        setShowEstadoDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEstadoDropdown]);

  const loadOrdenData = async () => {
    try {
      setLoading(true);
      
      // Primero cargar la orden para obtener el ID del vehículo
      const ordenData = await fetchOrdenById(id);
      
      // Cargar datos adicionales en paralelo
      let vehiculoData = null;
      const [itemsData, marcasData, modelosData, clientesData] = await Promise.all([
        fetchItemsCatalogo(),
        fetchAllMarcas(),
        fetchAllModelos(),
        fetchAllClientes()
      ]);
      
      // Cargar vehículo por separado para mejor manejo de errores
      if (ordenData?.vehiculo) {
        try {
          vehiculoData = await fetchVehiculoById(ordenData.vehiculo);
        } catch (vehiculoError) {
          console.error('❌ Error cargando vehículo:', vehiculoError);
          // Intentar usar datos básicos de la orden como fallback
          vehiculoData = {
            id: ordenData.vehiculo,
            numero_placa: ordenData.vehiculo_placa || "",
            marca_nombre: ordenData.vehiculo_marca || "",
            modelo_nombre: ordenData.vehiculo_modelo || ""
          };
        }
      }
      
      // Mapear los datos del vehículo al formato que espera VehiculoForm
      const vehiculoMapeado = mapVehiculoApiToForm(vehiculoData, ordenData, marcasData, modelosData);
      
      setOrden(ordenData);
      setVehiculo(vehiculoMapeado);
      setItemsCatalogo(itemsData);
      setMarcas(marcasData);
      setModelos(modelosData);
      setClientes(clientesData);
      setDescripcionLocal(ordenData.falloRequerimiento || ordenData.descripcion || "");
      setKilometrajeLocal(ordenData.kilometraje || "");
      
      // Inicializar nivel de combustible usando el campo correcto del objeto transformado
      const nivelCombustible = ordenData.nivel_combustible !== undefined && ordenData.nivel_combustible !== null 
        ? parseInt(ordenData.nivel_combustible) 
        : 0;
      setNivelCombustibleLocal(nivelCombustible);
      
      setObservacionesLocal(ordenData.observaciones || "");
      
      // Inicializar fecha de finalización (convertir a formato YYYY-MM-DD para input date)
      const fechaFinalizacion = ordenData.fechaFinalizacion 
        ? new Date(ordenData.fechaFinalizacion).toISOString().split('T')[0]
        : "";
      setFechaFinalizacionLocal(fechaFinalizacion);
      
      // DEBUG: Verificar valores iniciales para auto-guardado
      console.log('🔧 VALORES INICIALES CARGADOS:', {
        descripcion: ordenData.falloRequerimiento || ordenData.descripcion || "",
        kilometraje: ordenData.kilometraje || "",
        nivel_combustible_crudo: ordenData.nivel_combustible,
        nivel_combustible_parseado: nivelCombustible,
        nivel_combustible_tipo: typeof ordenData.nivel_combustible,
        observaciones: ordenData.observaciones || ""
      });

    } catch (error) {
      console.error("Error cargando datos:", error);
      alert("Error al cargar los datos de la orden. Verifica que la orden existe.");
    } finally {
      setLoading(false);
    }
  };  const handleAddItem = () => {
    setShowAddForm(true);
  };

  // Imprimir orden (usa window.print por defecto, puede reemplazarse por función más específica)
  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error('Error al imprimir:', e);
      alert('No se pudo iniciar la impresión.');
    }
  };

  const handleSaveItem = async () => {
    // Validar según el tipo de item
    if (tipoItem === "catalogo" && !newItem.item_id) {
      alert("Por favor seleccione un item del catálogo");
      return;
    }
    
    if (tipoItem === "personalizado" && !newItem.item_personalizado.trim()) {
      alert("Por favor ingrese el nombre del item personalizado");
      return;
    }

    try {
      // Convertir valores a números para el cálculo
      const precio = parseFloat(newItem.precio_unitario || 0);
      const cantidad = parseInt(newItem.cantidad || 1); // Usar 1 como default si está vacío
      const descuento_porcentaje = parseFloat(newItem.descuento_porcentaje || 0);
      
      // Preparar el detalle para enviar al backend
      const detalleParaBackend = {
        orden_trabajo: orden.id,
        cantidad: cantidad,
        precio_unitario: precio,
        descuento: 0,
        descuento_porcentaje: descuento_porcentaje,
        // Enviar el item del catálogo O el item personalizado, pero no ambos
        ...(tipoItem === "catalogo" 
          ? { item: newItem.item_id, item_personalizado: null }
          : { item: null, item_personalizado: newItem.item_personalizado }
        )
      };

      // Guardar en el backend
      const detalleGuardado = await addDetalleOrden(orden.id, detalleParaBackend);
      
      // Obtener el nombre del item para mostrar en el frontend
      let nombre_item = "";
      if (tipoItem === "catalogo" && newItem.item_id) {
        const itemSeleccionado = itemsCatalogo.find(item => item.id === parseInt(newItem.item_id));
        nombre_item = itemSeleccionado?.nombre || "Item del catálogo";
      } else {
        nombre_item = newItem.item_personalizado;
      }

      // Preparar el item para el estado local (con datos del backend + nombre para mostrar)
      const itemParaEstado = {
        ...detalleGuardado,
        nombre_item: nombre_item
      };

      // Agregar el nuevo item al estado local
      setOrden(prevOrden => ({
        ...prevOrden,
        detalles: [...(prevOrden.detalles || []), itemParaEstado]
      }));

      // Resetear formulario
      setNewItem({
        item_id: null,
        item_personalizado: "",
        cantidad: "",
        precio_unitario: "",
        descuento_porcentaje: ""
      });
      setTipoItem("catalogo");
      setShowAddForm(false);
      
    } catch (error) {
      console.error('Error guardando detalle:', error);
      alert('Error al guardar el detalle. Por favor, intenta de nuevo.');
    }
  };

  const handleCancelAdd = () => {
    setNewItem({
      item_id: null,
      item_personalizado: "",
      cantidad: "",
      precio_unitario: "",
      descuento_porcentaje: ""
    });
    setTipoItem("catalogo");
    setShowAddForm(false);
  };

  const handleInputChange = (field, value) => {
    setNewItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar cambios en la descripción
  const handleDescripcionChange = (e) => {
    const nuevaDescripcion = e.target.value;
    setDescripcionLocal(nuevaDescripcion);
  };

  // Función para manejar cambio de estado
  const handleEstadoChange = async (nuevoEstado) => {
    try {
      const ordenActualizada = await updateOrdenEstado(orden.id, nuevoEstado);
      
      // Actualizar el estado local
      setOrden(prevOrden => ({
        ...prevOrden,
        estado: nuevoEstado
      }));
      
      setShowEstadoDropdown(false);
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado. Por favor, intenta de nuevo.');
    }
  };

  // Estados disponibles para la orden
  const estadosDisponibles = [
    { value: 'pendiente', label: 'Pendiente', color: 'bg-red-600 hover:bg-red-700' },
    { value: 'en_proceso', label: 'En Proceso', color: 'bg-yellow-600 hover:bg-yellow-700' },
    { value: 'finalizada', label: 'Finalizada', color: 'bg-blue-600 hover:bg-blue-700' },
    { value: 'entregada', label: 'Entregada', color: 'bg-green-600 hover:bg-green-700' },
    { value: 'cancelada', label: 'Cancelada', color: 'bg-gray-600 hover:bg-gray-700' }
  ];

  // Obtener el estado actual
  const estadoActual = estadosDisponibles.find(estado => estado.value === orden?.estado) || estadosDisponibles[0];

  // Funciones para manejo del vehículo
  const handleEditVehiculo = () => {
    setShowVehiculoForm(true);
  };

  const handleSaveVehiculo = async (vehiculoData) => {
    try {
      setLoading(true);
      
      await updateVehiculo(vehiculo.id, toApiVehiculo(vehiculoData));
      
      // Recargar los datos del vehículo desde la API del vehículo
      const vehiculoActualizado = await fetchVehiculoById(vehiculo.id);
      const vehiculoMapeado = mapVehiculoApiToForm(vehiculoActualizado, orden, marcas, modelos);
      setVehiculo(vehiculoMapeado);
      
      setShowVehiculoForm(false);
      alert("Vehículo actualizado correctamente");
    } catch (error) {
      console.error("Error actualizando vehículo:", error);
      alert("Error al actualizar el vehículo: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelVehiculo = () => {
    setShowVehiculoForm(false);
  };

  const handleOpenInventarioModal = () => {
    setShowInventarioModal(true);
    // Incrementar el trigger para forzar recarga
    setInventarioRefreshTrigger(prev => prev + 1);
  };

  const handleInventarioLoad = (reloadFunction) => {
    setReloadInventario(() => reloadFunction);
  };

  const handleOpenInspeccionesModal = () => {
    setShowInspeccionesModal(true);
  };

  const handleOpenPruebaRutaModal = () => {
    setShowPruebaRutaModal(true);
  };

  // useEffect para auto-guardar la descripción con debounce
  useEffect(() => {
    if (!orden || !orden.id) return;

    const timeoutId = setTimeout(async () => {
      const descripcionOriginal = orden.falloRequerimiento || orden.descripcion || "";
      
      // Solo guardar si la descripción ha cambiado
      if (descripcionLocal !== descripcionOriginal) {
        try {
          console.log('🔄 Guardando descripción automáticamente:', {
            ordenId: orden.id,
            descripcionLocal,
            descripcionOriginal
          });
          setGuardandoDescripcion(true);
          const response = await updateOrdenDescripcion(orden.id, descripcionLocal);
          console.log('✅ Descripción guardada exitosamente:', response);
          
          // Actualizar el estado local de la orden
          setOrden(prevOrden => ({
            ...prevOrden,
            descripcion: descripcionLocal,
            falloRequerimiento: descripcionLocal
          }));
        } catch (error) {
          console.error('❌ Error guardando descripción:', error);
        } finally {
          setGuardandoDescripcion(false);
        }
      }
    }, 1500); // Esperar 1.5 segundos después de que el usuario deje de escribir

    return () => clearTimeout(timeoutId);
  }, [descripcionLocal, orden]);

  // useEffect para auto-guardar el kilometraje con debounce
  useEffect(() => {
    if (!orden || !orden.id) return;

    const timeoutId = setTimeout(async () => {
      const kilometrajeOriginal = orden.kilometraje || "";
      
      // Solo guardar si el kilometraje ha cambiado
      if (kilometrajeLocal !== kilometrajeOriginal) {
        try {
          setGuardandoKilometraje(true);
          await updateOrdenKilometraje(orden.id, kilometrajeLocal);
          
          // Actualizar el estado local de la orden
          setOrden(prevOrden => ({
            ...prevOrden,
            kilometraje: kilometrajeLocal
          }));
        } catch (error) {
          console.error('Error guardando kilometraje:', error);
        } finally {
          setGuardandoKilometraje(false);
        }
      }
    }, 1500); // Esperar 1.5 segundos después de que el usuario deje de escribir

    return () => clearTimeout(timeoutId);
  }, [kilometrajeLocal, orden]);

  // useEffect para auto-guardar el nivel de combustible
  useEffect(() => {
    // No hacer nada si no está inicializado o no hay orden
    if (!orden || !orden.id || nivelCombustibleLocal === null) return;

    const timeoutId = setTimeout(async () => {
      const nivelOriginal = orden.nivel_combustible !== undefined && orden.nivel_combustible !== null 
        ? parseInt(orden.nivel_combustible) 
        : 0;
      
      // Solo guardar si el nivel de combustible ha cambiado
      if (nivelCombustibleLocal !== nivelOriginal) {
        try {
          setGuardandoNivelCombustible(true);
          await updateOrdenNivelCombustible(orden.id, nivelCombustibleLocal);
          
          // Actualizar el estado local de la orden
          setOrden(prevOrden => ({
            ...prevOrden,
            nivel_combustible: nivelCombustibleLocal
          }));
        } catch (error) {
          console.error('Error guardando nivel de combustible:', error);
        } finally {
          setGuardandoNivelCombustible(false);
        }
      }
    }, 1000); // Para el nivel de combustible, guardar más rápido (1 segundo)

    return () => clearTimeout(timeoutId);
  }, [nivelCombustibleLocal, orden]);

  // useEffect adicional para sincronizar el estado local cuando cambia la orden
  useEffect(() => {
    if (orden && orden.id && orden.nivel_combustible !== undefined && orden.nivel_combustible !== null) {
      const nivelFromOrden = parseInt(orden.nivel_combustible);
      
      console.log('🔄 SINCRONIZANDO NIVEL COMBUSTIBLE:', {
        desde_orden: orden.nivel_combustible,
        parseado: nivelFromOrden,
        estado_actual: nivelCombustibleLocal,
        necesita_sync: nivelFromOrden !== nivelCombustibleLocal
      });
      
      // Solo actualizar si es diferente
      if (nivelFromOrden !== nivelCombustibleLocal) {
        console.log('⚡ Sincronizando nivel de combustible a:', nivelFromOrden);
        setNivelCombustibleLocal(nivelFromOrden);
      }
    }
  }, [orden?.nivel_combustible, orden?.id]);

  // useEffect para auto-guardar las observaciones con debounce
  useEffect(() => {
    if (!orden || !orden.id) return;

    const timeoutId = setTimeout(async () => {
      const observacionesOriginal = orden.observaciones || "";
      
      // Solo guardar si las observaciones han cambiado
      if (observacionesLocal !== observacionesOriginal) {
        try {
          setGuardandoObservaciones(true);
          await updateOrdenObservaciones(orden.id, observacionesLocal);
          
          // Actualizar el estado local de la orden
          setOrden(prevOrden => ({
            ...prevOrden,
            observaciones: observacionesLocal
          }));
        } catch (error) {
          console.error('Error guardando observaciones:', error);
        } finally {
          setGuardandoObservaciones(false);
        }
      }
    }, 1500); // Esperar 1.5 segundos después de que el usuario deje de escribir

    return () => clearTimeout(timeoutId);
  }, [observacionesLocal, orden]);

  // useEffect para auto-guardar la fecha de finalización
  useEffect(() => {
    if (!orden || !orden.id) return;

    const timeoutId = setTimeout(async () => {
      const fechaOriginal = orden.fechaFinalizacion 
        ? new Date(orden.fechaFinalizacion).toISOString().split('T')[0]
        : "";
      
      // Solo guardar si la fecha de finalización ha cambiado
      if (fechaFinalizacionLocal !== fechaOriginal) {
        try {
          console.log('💾 Guardando fecha de finalización:', fechaFinalizacionLocal);
          setGuardandoFechaFinalizacion(true);
          await updateOrdenFechaFinalizacion(orden.id, fechaFinalizacionLocal);
          
          // Actualizar el estado local de la orden
          setOrden(prevOrden => ({
            ...prevOrden,
            fechaFinalizacion: fechaFinalizacionLocal
          }));
          console.log('✅ Fecha de finalización guardada exitosamente');
        } catch (error) {
          console.error('Error guardando fecha de finalización:', error);
        } finally {
          setGuardandoFechaFinalizacion(false);
        }
      }
    }, 1000); // Guardar después de 1 segundo

    return () => clearTimeout(timeoutId);
  }, [fechaFinalizacionLocal, orden]);

  const handleDeleteItem = async (index) => {
    try {
      console.log('Eliminando item en índice:', index);
      const detalleAEliminar = orden.detalles[index];
      
      // Si el detalle tiene ID, eliminarlo de la base de datos
      if (detalleAEliminar.id) {
        await deleteDetalleOrden(orden.id, detalleAEliminar.id);
        console.log('Detalle eliminado de la base de datos');
      }
      
      // Actualizar el estado local
      setOrden(prevOrden => ({
        ...prevOrden,
        detalles: prevOrden.detalles.filter((_, i) => i !== index)
      }));
      
      console.log('Detalle eliminado del estado local');
    } catch (error) {
      console.error('Error eliminando detalle:', error);
      alert('Error al eliminar el detalle. Por favor, intenta de nuevo.');
    }
  };

  const handleItemCatalogoChange = (itemId) => {
    const itemSeleccionado = itemsCatalogo.find(item => item.id === parseInt(itemId));
    if (itemSeleccionado) {
      const precio = parseFloat(itemSeleccionado.precio || 0);
      setNewItem(prev => ({
        ...prev,
        item_id: itemId,
        precio_unitario: precio
      }));
    }
  };

  // Función para calcular totales dinámicamente
  const calculateTotals = () => {
    if (!orden?.detalles || orden.detalles.length === 0) {
      return {
        subtotal: 0,
        descuentoTotal: 0,
        iva: 0,
        total: 0
      };
    }

    const subtotal = orden.detalles.reduce((sum, detalle) => {
      const itemTotal = (parseFloat(detalle.precio_unitario || 0) * parseInt(detalle.cantidad || 0));
      return sum + itemTotal;
    }, 0);

    const descuentoTotal = orden.detalles.reduce((sum, detalle) => {
      const subtotalDetalle = (parseFloat(detalle.precio_unitario || 0) * parseInt(detalle.cantidad || 0));
      const descuentoPorcentaje = subtotalDetalle * (parseFloat(detalle.descuento_porcentaje || 0) / 100);
      return sum + descuentoPorcentaje;
    }, 0);

    const subtotalConDescuento = subtotal - descuentoTotal;
    const iva = subtotalConDescuento * 0.13; // 13% IVA
    const total = subtotalConDescuento + iva;

    return {
      subtotal: subtotal,
      descuentoTotal: descuentoTotal,
      iva: iva,
      total: total
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!orden) {
    return (
      <div className="text-center py-8">
        <div className="text-lg text-gray-600">Orden no encontrada</div>
        <button
          onClick={() => navigate("/ordenes")}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  const tabs = [
    { id: "vehiculo", label: "Vehículo" },
    { id: "fotos", label: "Fotos" },
    { id: "notas", label: "Notas" },
    { id: "tareas", label: "Tareas" },
    { id: "tecnicos", label: "Técnicos" }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/ordenes")}
              className="p-2 hover:bg-gray-700 rounded"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold">{orden.numero}</span>
              <span className="text-sm text-gray-300">{orden.fecha}</span>
              <button className="p-1 hover:bg-gray-700 rounded">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Selector de fecha de finalización */}
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <input
                  type="date"
                  value={fechaFinalizacionLocal}
                  onChange={isCliente ? undefined : (e) => setFechaFinalizacionLocal(e.target.value)}
                  disabled={isCliente}
                  className={`bg-white/10 text-white text-sm border border-white/10 rounded px-2 py-1 outline-none ${
                    isCliente 
                      ? 'cursor-not-allowed opacity-50' 
                      : 'cursor-pointer hover:bg-white/15 focus:bg-white/20 focus:ring-2 focus:ring-white/25'
                  }`}
                  title="Fecha de finalización"
                />
                {guardandoFechaFinalizacion && (
                  <div className="w-3 h-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              
              <div className="w-4 h-4 bg-red-500 rounded"></div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Botón de pago - Para admin/empleado siempre, para clientes solo cuando esté finalizada o entregada */}
            {(!isCliente || (isCliente && (orden.estado === 'finalizada' || orden.estado === 'entregada'))) && (
              <BotonPagarOrden 
                ordenId={orden.id} 
                montoTotal={orden.monto_total}
                disabled={orden.estado === 'cancelada'}
                compact={true}
              />
            )}
            
            {/* Botón imprimir (móvil/compacto) colocado junto al dropdown de estado */}
            <div>
              <button
                onClick={handlePrint}
                title="Imprimir orden"
                className="w-9 h-9 bg-white rounded-md shadow-sm flex items-center justify-center hover:bg-gray-100 mr-1"
              >
                <svg className="w-4 h-4 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 2a2 2 0 00-2 2v3h2V4h8v3h2V4a2 2 0 00-2-2H6z" />
                  <path d="M4 9h12v5H4zM6 14v3h8v-3H6z" />
                </svg>
              </button>
            </div>

            {/* Dropdown de estado - Solo para admin/empleado */}
            {!isCliente && (
              <div className="relative">
                <button 
                  onClick={() => setShowEstadoDropdown(!showEstadoDropdown)}
                  className={`px-4 py-2 rounded text-sm font-medium ${estadoActual.color} text-white flex items-center space-x-2`}
                >
                  <span>{estadoActual.label}</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showEstadoDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-36 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {estadosDisponibles.map((estado) => (
                      <button
                        key={estado.value}
                        onClick={() => handleEstadoChange(estado.value)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 ${
                          estado.value === orden?.estado ? 'bg-gray-50 font-medium' : ''
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${estado.color.split(' ')[0]}`}></div>
                        <span className="text-gray-800">{estado.label}</span>
                        {estado.value === orden?.estado && (
                          <svg className="w-4 h-4 ml-auto text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Badge de estado para clientes (solo lectura) */}
            {isCliente && (
              <div className={`px-4 py-2 rounded text-sm font-medium ${estadoActual.color} text-white`}>
                {estadoActual.label}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Contenido principal */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Información del cliente */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium mb-2 text-gray-800">INFORMACIÓN DEL CLIENTE</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-sm">{orden.cliente}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="text-sm text-gray-600">{orden.clienteTelefono || "+59189456789"}</span>
                </div>
              </div>
            </div>
            
            {/* Fechas importantes */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Creación:</span>
                  <div className="font-medium text-xs">{new Date(orden.fechaCreacion).toLocaleDateString()}</div>
                </div>
                {orden.fechaInicio && (
                  <div>
                    <span className="text-gray-500">Inicio:</span>
                    <div className="font-medium text-xs">{new Date(orden.fechaInicio).toLocaleDateString()}</div>
                  </div>
                )}
                {orden.fechaFinalizacion && (
                  <div>
                    <span className="text-gray-500">Finalización:</span>
                    <div className="font-medium text-xs">{new Date(orden.fechaFinalizacion).toLocaleDateString()}</div>
                  </div>
                )}
                {orden.fechaEntrega && (
                  <div>
                    <span className="text-gray-500">Entrega:</span>
                    <div className="font-medium text-xs">{new Date(orden.fechaEntrega).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Falla o requerimiento */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2 text-gray-800 flex items-center">
              FALLA O REQUERIMIENTO
              {!isCliente && guardandoDescripcion && (
                <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  Guardando...
                </span>
              )}
            </h3>
            <div className="mb-2">
              <textarea
                placeholder={isCliente ? "" : "Agrega una descripción"}
                value={descripcionLocal}
                onChange={isCliente ? undefined : handleDescripcionChange}
                readOnly={isCliente}
                className={`w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none resize-none ${
                  isCliente ? 'bg-gray-50 cursor-default' : 'focus:ring-2 focus:ring-blue-500'
                }`}
                rows="3"
              />
            </div>
          </div>

          {/* Producto o servicio */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2 text-gray-800">PRODUCTOS Y SERVICIOS</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-1 border-b border-gray-200">
                <div className="grid gap-2 text-xs font-medium text-gray-600" style={{gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto"}}>
                  <div>ITEM</div>
                  <div>CANTIDAD</div>
                  <div>PRECIO</div>
                  <div>DESC %</div>
                  <div>TOTAL</div>
                  <div></div>
                </div>
              </div>
              
              {/* Mostrar detalles reales de la orden */}
              {orden.detalles && orden.detalles.length > 0 ? (
                orden.detalles.map((detalle, index) => (
                  <div key={index} className="p-2 border-b border-gray-100 last:border-b-0">
                    <div className="grid gap-2 items-center" style={{gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto"}}>
                      <div className="text-xs font-medium">
                        {detalle.nombre_item || detalle.item_personalizado || "Item sin nombre"}
                      </div>
                      <div className="text-xs">{detalle.cantidad}</div>
                      <div className="text-xs">Bs {parseFloat(detalle.precio_unitario).toFixed(2)}</div>
                      <div className="text-xs">
                        {detalle.descuento_porcentaje > 0 
                          ? `${parseFloat(detalle.descuento_porcentaje).toFixed(1)}%` 
                          : '-'
                        }
                      </div>
                      <div className="text-xs font-semibold">Bs{parseFloat(detalle.total).toFixed(2)}</div>
                      <div className="flex justify-center">
                        {!isCliente && (
                          <button
                            onClick={() => handleDeleteItem(index)}
                            className="text-red-500 hover:text-red-700 p-0 rounded hover:bg-red-50"
                            title="Eliminar item"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <div className="mb-1">No hay productos o servicios agregados</div>
                  <div className="text-xs">Haz clic en "Agregar nuevo producto o servicio" para empezar</div>
                </div>
              )}

              {/* Formulario para agregar nuevo item */}
              {showAddForm && (
                <div className="p-2 border-b border-gray-200 bg-blue-50">
                  {/* Selector de tipo de item */}
                  <div className="mb-2">
                    <div className="flex space-x-3 text-sm">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="tipoItem"
                          value="catalogo"
                          checked={tipoItem === "catalogo"}
                          onChange={(e) => setTipoItem(e.target.value)}
                          className="mr-2"
                        />
                        Item del catálogo
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="tipoItem"
                          value="personalizado"
                          checked={tipoItem === "personalizado"}
                          onChange={(e) => setTipoItem(e.target.value)}
                          className="mr-2"
                        />
                        Item personalizado
                      </label>
                    </div>
                  </div>

                  <div className="grid gap-2 items-center" style={{gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto"}}>
                    <div>
                      {tipoItem === "catalogo" ? (
                        <select
                          value={newItem.item_id || ""}
                          onChange={(e) => handleItemCatalogoChange(e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seleccionar item...</option>
                          {itemsCatalogo.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.nombre} - Bs {parseFloat(item.precio || 0).toFixed(2)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="Nombre del item personalizado"
                          value={newItem.item_personalizado}
                          onChange={(e) => handleInputChange('item_personalizado', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={newItem.cantidad || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleInputChange('cantidad', value === "" ? "" : parseInt(value) || "");
                        }}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={newItem.precio_unitario || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleInputChange('precio_unitario', value === "" ? 0 : parseFloat(value));
                        }}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="0.0"
                        value={newItem.descuento_porcentaje || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleInputChange('descuento_porcentaje', value === "" ? 0 : parseFloat(value));
                        }}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="text-xs font-medium text-blue-600">
                      Bs {(() => {
                        const precio = parseFloat(newItem.precio_unitario) || 0;
                        const cantidad = parseInt(newItem.cantidad) || 1;
                        const subtotal = precio * cantidad;
                        const porcentaje = parseFloat(newItem.descuento_porcentaje) || 0;
                        const descuento = subtotal * (porcentaje / 100);
                        return (subtotal - descuento).toFixed(2);
                      })()}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={handleSaveItem}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleCancelAdd}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs font-medium"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {!isCliente && (
              <div className="mt-2">
                <button 
                  onClick={handleAddItem}
                  disabled={showAddForm}
                  className={`flex items-center space-x-2 ${
                    showAddForm 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">Agregar nuevo producto o servicio</span>
                </button>
              </div>
            )}
          </div>

          {/* Totales */}
          <div className="flex justify-end space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">DESCUENTO</div>
              <div className="bg-gray-100 px-3 py-2 rounded-md text-sm">
                Bs {calculateTotals().descuentoTotal.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">SUBTOTAL</div>
              <div className="bg-gray-100 px-3 py-2 rounded-md text-sm font-semibold">
                Bs {calculateTotals().subtotal.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">IMPUESTO (13%)</div>
              <div className="bg-gray-100 px-3 py-2 rounded-md text-sm">
                Bs {calculateTotals().iva.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">TOTAL</div>
              <div className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-semibold">
                Bs {calculateTotals().total.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
  <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-2 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2 py-1 text-xs font-medium border-b-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contenido del tab activo */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTab === "vehiculo" && (
              <div className="space-y-3 text-sm">
                {/* Información del vehículo */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs font-bold">T</span>
                      </div>
                      <span className="text-sm font-medium">
                        {orden?.vehiculo_marca || vehiculo?.marca_nombre || "Sin marca"} {orden?.vehiculo_modelo || vehiculo?.modelo_nombre || "Sin modelo"}
                      </span>
                    </div>
                    {!isCliente && (
                      <div className="flex space-x-2">
                        <button 
                          onClick={handleEditVehiculo}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Editar
                        </button>
                        <button className="text-red-500 hover:text-red-700">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">
                    <div>{vehiculo?.placa || vehiculo?.numero_placa || orden?.vehiculo_placa || "Sin placa"}</div>
                    <div>{vehiculo?.año || "Sin año"} - {vehiculo?.color || "Sin color"}</div>
                  </div>
                </div>

                {/* Kilometraje */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kilometraje actual
                    {guardandoKilometraje && (
                      <span className="ml-2 text-xs text-blue-600">
                        Guardando...
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={kilometrajeLocal}
                    onChange={isCliente ? undefined : (e) => setKilometrajeLocal(e.target.value)}
                    placeholder="Ingrese el kilometraje actual"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isCliente ? 'bg-gray-50 cursor-default' : ''}`}
                    readOnly={isCliente}
                  />
                </div>

                {/* Nivel de combustible */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nivel de combustible o carga
                    {guardandoNivelCombustible && (
                      <span className="ml-2 text-xs text-blue-600">
                        Guardando...
                      </span>
                    )}
                  </label>
                  <div className="space-y-2">
                    {/* Indicador visual (más delgado) */}
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${nivelCombustibleLocal !== null ? (nivelCombustibleLocal / 4) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Controles de selección (más compactos, ancho fijo) */}
                    <div className="flex gap-2">
                      {[
                        { value: 0, label: 'E' },
                        { value: 1, label: '1/4' },
                        { value: 2, label: '1/2' },
                        { value: 3, label: '3/4' },
                        { value: 4, label: 'F' }
                      ].map((nivel) => (
                        <button
                          key={nivel.value}
                          onClick={isCliente ? undefined : () => setNivelCombustibleLocal(nivel.value)}
                          disabled={nivelCombustibleLocal === null || isCliente}
                          className={`w-12 h-8 flex items-center justify-center text-[12px] rounded-md border transition-colors ${
                            nivelCombustibleLocal === nivel.value
                              ? 'bg-blue-500 text-white border-blue-500'
                              : nivelCombustibleLocal === null || isCliente
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                          title={nivel.label}
                        >
                          {nivel.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botones de inspección */}
                <div className="space-y-2">
                  <button 
                    onClick={handleOpenInspeccionesModal}
                    className="w-full bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-800"
                  >
                    Inspecciones
                  </button>
                  <button 
                    onClick={handleOpenInventarioModal}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Inventario del vehículo</span>
                  </button>
                  <button 
                    onClick={handleOpenPruebaRutaModal}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                    </svg>
                    <span>Prueba de Ruta</span>
                  </button>
                </div>

                {/* Estado general del vehículo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado del vehículo
                    {!isCliente && guardandoObservaciones && (
                      <span className="ml-2 text-xs text-blue-600">
                        Guardando...
                      </span>
                    )}
                  </label>
                  <textarea
                    value={observacionesLocal}
                    onChange={isCliente ? undefined : (e) => setObservacionesLocal(e.target.value)}
                    rows={3}
                    placeholder={isCliente ? "" : "Describa el estado general del vehículo, daños visibles, condición de la carrocería, etc."}
                    readOnly={isCliente}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${
                      isCliente ? 'bg-gray-50 cursor-default' : 'focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                </div>

                {/* Print moved to header */}
              </div>
            )}

            {activeTab === "notas" && (
              <NotasOrden ordenId={id} readOnly={isCliente} />
            )}

            {activeTab === "tareas" && (
              <TareasOrden ordenId={id} readOnly={isCliente} />
            )}

            {activeTab === "inventario" && (
              <InventarioVehiculo ordenId={id} readOnly={isCliente} />
            )}

            {activeTab === "fotos" && (
              <ImagenesOrden ordenId={id} readOnly={isCliente} />
            )}

            {activeTab === "tecnicos" && (
              <AsignacionesTecnicos ordenId={id} readOnly={isCliente} />
            )}
          </div>
        </div>
      </div>

      {/* Modal para editar vehículo */}
      {showVehiculoForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <VehiculoForm
              initialData={vehiculo}
              clientes={clientes}
              marcas={marcas}
              modelos={modelos}
              onSubmit={handleSaveVehiculo}
              onCancel={handleCancelVehiculo}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Modal de Inventario */}
      {showInventarioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Inventario del Vehículo
              </h2>
              <button
                onClick={() => setShowInventarioModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              <InventarioVehiculo 
                ordenId={id} 
                onLoad={handleInventarioLoad} 
                refreshTrigger={inventarioRefreshTrigger}
                readOnly={isCliente}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Inspecciones */}
      {showInspeccionesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[85vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Historial de Inspecciones
              </h2>
              <button
                onClick={() => setShowInspeccionesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[75vh]">
              <HistorialInspecciones ordenId={id} readOnly={isCliente} />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Prueba de Ruta */}
      {showPruebaRutaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[85vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Historial de Pruebas de Ruta
              </h2>
              <button
                onClick={() => setShowPruebaRutaModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[75vh]">
              <HistorialPruebasRuta ordenId={id} readOnly={isCliente} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenDetalle;
