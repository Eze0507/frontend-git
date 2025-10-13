// src/components/CustomTable.jsx
import React from "react";
import Button from "./button"; // tu componente de botones

const CustomTable = ({ title = "Lista", columns = [], data = [], onEdit, onDelete, onView }) => {
  return (
    <div className="w-full">
      <div className="relative flex flex-col w-full h-full text-slate-700 bg-white shadow-lg rounded-2xl border border-gray-100 bg-clip-border overflow-hidden">
        <div className="relative mx-6 mt-6 overflow-hidden text-slate-700 bg-white rounded-none bg-clip-border">
          <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {title}
          </h3>
          <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full mt-6 text-left table-auto">
            <thead>
              <tr className="border-b border-slate-200">
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className={`p-5 bg-gradient-to-r from-slate-50 to-slate-100 text-sm font-bold text-slate-700 uppercase tracking-wider ${
                      col === 'imagen' || col === 'codigo' || col === 'stock' || col === 'estado' 
                        ? 'text-center' 
                        : 'text-left'
                    } first:rounded-tl-xl last:rounded-tr-xl`}
                  >
                    {col}
                  </th>
                ))}
                <th className="p-5 bg-gradient-to-r from-slate-50 to-slate-100 text-sm font-bold text-slate-700 uppercase tracking-wider text-center rounded-tr-xl">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50 transition-all duration-200 border-b border-slate-100 group">
                  {columns.map((col, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`p-5 ${
                        col === 'imagen' || col === 'codigo' || col === 'stock' || col === 'estado' 
                          ? 'text-center' 
                          : 'text-left'
                      } ${col === 'descripcion' ? 'max-w-xs' : ''} group-hover:bg-white transition-all duration-200`}
                    >
                      {row[col]}
                    </td>
                  ))}

                  <td className="p-5 text-center group-hover:bg-white transition-all duration-200">
                    <div className="flex gap-2 justify-center">
                      {onView && (
                        <button
                          onClick={() => {
                            console.log('👁️ Botón Ver clickeado para fila:', row);
                            onView(row);
                          }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg group/btn"
                          title="Ver detalles"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          console.log('🔧 Botón Editar clickeado para fila:', row);
                          onEdit(row);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg group/btn"
                        title="Editar elemento"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => {
                          console.log('🗑️ Botón Eliminar clickeado para ID:', row.id);
                          if (!row.id || row.id === "" || row.id === null) {
                            console.error('❌ ID inválido para eliminar:', row.id);
                            alert('Error: No se puede eliminar este elemento porque no tiene un ID válido');
                            return;
                          }
                          onDelete(row.id);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg group/btn"
                        title="Eliminar elemento"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomTable;
