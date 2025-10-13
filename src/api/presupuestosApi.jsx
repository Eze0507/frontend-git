// API para gestión de presupuestos
const API_BASE_URL = 'http://localhost:8000/api';

// Datos de ejemplo para el prototipo
const presupuestosEjemplo = [
  {
    id: 1,
    numero: "#1",
    fecha: "3 Oct 2025",
    cliente: "carlos",
    marcaModelo: "Toyota 4runner",
    orden: true, // Indica si tiene orden asociada
    total: "Bs90",
    periodo: "Octubre 2025",
    estadoPresupuesto: "Pendiente",
    realizadoPor: "Juan Pérez",
    direccion: "calle esmeralda av Bolivia",
    ci: "1234567",
    telefono: "+59189456789",
    email: "carlos@gmail.com",
    servicios: [
      {
        id: 1,
        nombre: "aceite",
        cantidad: 1,
        precio: "Bs80,00",
        descuento: 0,
        total: "Bs80"
      }
    ],
    descuento: 0,
    subtotal: "Bs80",
    iva: "Bs10",
    totalFinal: "Bs90",
    vehiculo: {
      matricula: "JEJE201",
      marca: "Toyota",
      modelo: "4runner",
      color: "blanco",
      año: "2019",
      kilometraje: "",
      motivo: "",
      diagnostico: ""
    }
  }
];

// Funciones de la API (simuladas para el prototipo)
export const fetchAllPresupuestos = async () => {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 500));
  return presupuestosEjemplo;
};

export const fetchPresupuestoById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return presupuestosEjemplo.find(presupuesto => presupuesto.id === parseInt(id)) || null;
};

export const createPresupuesto = async (presupuestoData) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const nuevoPresupuesto = {
    id: presupuestosEjemplo.length + 1,
    numero: `#${presupuestosEjemplo.length + 1}`,
    ...presupuestoData,
    fecha: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
    estadoPresupuesto: "Pendiente"
  };
  presupuestosEjemplo.push(nuevoPresupuesto);
  return nuevoPresupuesto;
};

export const updatePresupuesto = async (id, presupuestoData) => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const index = presupuestosEjemplo.findIndex(presupuesto => presupuesto.id === parseInt(id));
  if (index !== -1) {
    presupuestosEjemplo[index] = { ...presupuestosEjemplo[index], ...presupuestoData };
    return presupuestosEjemplo[index];
  }
  throw new Error('Presupuesto no encontrado');
};

export const deletePresupuesto = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const index = presupuestosEjemplo.findIndex(presupuesto => presupuesto.id === parseInt(id));
  if (index !== -1) {
    presupuestosEjemplo.splice(index, 1);
    return true;
  }
  throw new Error('Presupuesto no encontrado');
};

// Funciones auxiliares
export const toApiPresupuesto = (formData) => {
  return {
    cliente: formData.cliente,
    direccion: formData.direccion,
    ci: formData.ci,
    telefono: formData.telefono,
    email: formData.email,
    servicios: formData.servicios,
    descuento: formData.descuento,
    subtotal: formData.subtotal,
    iva: formData.iva,
    totalFinal: formData.totalFinal,
    vehiculo: formData.vehiculo
  };
};

export const checkUserPermissions = () => {
  // Simular permisos de usuario
  return {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true
  };
};
