import React from "react";
import Button from "../../components/button";
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaIdCard, FaUserTie } from "react-icons/fa";

const ProveedorDetails = ({ proveedor, onClose, onEdit }) => {
  if (!proveedor) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500">No hay información del proveedor</p>
        <Button variant="cancelar" onClick={onClose} className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Detalles del Proveedor</h2>
            <p className="text-blue-100 text-sm">ID: {proveedor.id}</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="editar" 
              onClick={onEdit}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Editar
            </Button>
            <Button 
              variant="cancelar" 
              onClick={onClose}
              className="bg-blue-700 text-white hover:bg-blue-800"
            >
              Volver
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
              Información Principal
            </h3>

            <div className="flex items-start space-x-3">
              <FaUser className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-semibold text-gray-800">{proveedor.nombre || 'No especificado'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaUserTie className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Persona de Contacto</p>
                <p className="font-semibold text-gray-800">{proveedor.contacto || 'No especificado'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaIdCard className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">NIT</p>
                <p className="font-semibold text-gray-800">{proveedor.nit || 'No especificado'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
              Información de Contacto
            </h3>

            <div className="flex items-start space-x-3">
              <FaPhone className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-semibold text-gray-800">{proveedor.telefono || 'No especificado'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaEnvelope className="w-5 h-5 text-red-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Correo Electrónico</p>
                <p className="font-semibold text-gray-800">{proveedor.correo || 'No especificado'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaMapMarkerAlt className="w-5 h-5 text-red-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Dirección</p>
                <p className="font-semibold text-gray-800">{proveedor.direccion || 'No especificado'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
        <Button variant="editar" onClick={onEdit}>
          Editar Proveedor
        </Button>
        <Button variant="cancelar" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};

export default ProveedorDetails;
