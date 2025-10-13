import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";

const ItemTallerList = ({ items, onEdit, onDelete, onAddNew, onView, loading }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filtrado de ítems de taller según búsqueda
  const filteredItems = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    if (!searchTerm) return items;
    return items.filter(
      (item) =>
        item &&
        item.nombre &&
        item.descripcion &&
        (item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, items]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded-md w-1/3 mb-6"></div>
        <div className="flex justify-between items-center mb-6">
          <div className="h-10 bg-gray-200 rounded-md w-48"></div>
          <div className="h-10 bg-gray-200 rounded-md w-96"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4 p-4 border rounded-lg">
              <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Gestión de Ítems de Taller
      </h2>
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="guardar"
          onClick={onAddNew}
          className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Ítem de Taller
        </Button>
        <div className="flex justify-start flex-1 ml-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 bg-white text-gray-700 w-96 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 shadow-sm hover:shadow-md"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="text-center py-16">
        <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          {searchTerm ? 'No se encontraron ítems' : 'No hay ítems de taller registrados'}
        </h3>
        <p className="text-gray-500 mb-6">
          {searchTerm 
            ? `No se encontraron ítems que coincidan con "${searchTerm}"`
            : 'Comienza agregando tu primer ítem de taller al inventario'
          }
        </p>
        {!searchTerm && (
          <Button
            variant="guardar"
            onClick={onAddNew}
            className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Agregar Primer Ítem
          </Button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!items || items.length === 0 || filteredItems.length === 0) {
    return <EmptyState />;
  }

  const columns = [
    "codigo",
    "nombre",
    "descripcion",
    "fabricante",
    "imagen",
    "costo",
    "stock",
    "estado"
  ];
  const tableData = filteredItems.map((item) => ({
    codigo: (
      <div className="text-center font-medium text-gray-900">
        {item?.codigo || ''}
      </div>
    ),
    nombre: (
      <div className="text-left font-medium text-gray-900">
        {item?.nombre || ''}
      </div>
    ),
    descripcion: (
      <div className="text-left text-sm text-gray-600 max-w-xs">
        {item?.descripcion || ''}
      </div>
    ),
    fabricante: (
      <div className="text-center text-gray-800">
        {item?.fabricante || ''}
      </div>
    ),
    imagen: (
      <div className="flex justify-center items-center">
        {item?.imagen ? (
          <img 
            src={item.imagen} 
            alt={item.nombre || 'Imagen del ítem'} 
            className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center shadow-sm"
          style={{display: item?.imagen ? 'none' : 'flex'}}
        >
          <span className="text-gray-400 text-xs text-center">Sin imagen</span>
        </div>
      </div>
    ),
    costo: (
      <div className="text-center">
        <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold shadow-sm bg-gradient-to-r from-blue-400 to-blue-500 text-white">
          Bs {item?.costo ? parseFloat(item.costo).toFixed(2) : '0.00'}
        </span>
      </div>
    ),
    stock: (
      <div className="text-center">
        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold shadow-sm ${
          (item?.stock || 0) > 0 
            ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' 
            : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
        }`}>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          {item?.stock !== undefined ? item.stock : '0'}
        </span>
      </div>
    ),
    estado: (
      <div className="text-center">
        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold shadow-sm ${
          item?.estado === 'Disponible' 
            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white' 
            : 'bg-gradient-to-r from-orange-400 to-orange-500 text-white'
        }`}>
          {item?.estado === 'Disponible' ? (
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {item?.estado || 'No definido'}
        </span>
      </div>
    ),
    id: item?.id || '',
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Gestión de Ítems de Taller
      </h2>
      {/* Botón Nuevo y Buscador */}
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="guardar"
          onClick={onAddNew}
          className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Ítem de Taller
        </Button>
        <div className="flex justify-start flex-1 ml-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 bg-white text-gray-700 w-96 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 shadow-sm hover:shadow-md"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      <CustomTable
        title="Ítems de Taller"
        columns={columns}
        data={tableData}
        onView={(item) => onView(item)}
        onEdit={(item) => onEdit(item)}
        onDelete={onDelete}
      />
    </div>
  );
};

export default ItemTallerList;
