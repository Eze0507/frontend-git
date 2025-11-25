// Página para ver el detalle completo de un pago
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaMoneyBillWave, FaCreditCard, FaUniversity, 
  FaCheckCircle, FaExclamationCircle, FaSpinner,
  FaCalendar, FaUser, FaFileInvoice, FaDownload, FaFilePdf, FaFileExcel
} from 'react-icons/fa';
import { 
  fetchPagoById, 
  getEstadoColor, 
  getMetodoIcon, 
  formatMonto 
} from '../../api/pagosApi';
import { obtenerPerfilTaller } from '../../api/tallerApi';

const PagoDetalle = () => {
  const { pagoId } = useParams();
  const navigate = useNavigate();
  
  const [pago, setPago] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [descargando, setDescargando] = useState(false);
  const [tallerInfo, setTallerInfo] = useState(null);

  // Determinar el rol del usuario para navegación correcta
  const userRole = (localStorage.getItem('userRole') || '').toLowerCase();
  const isCliente = userRole === 'cliente';
  const listadoUrl = isCliente ? '/cliente/pagos' : '/pagos';

  useEffect(() => {
    // Solo cargar si pagoId es un número válido, no la cadena literal ':pagoId'
    if (pagoId && pagoId !== ':pagoId' && !pagoId.includes(':')) {
      loadPagoDetalle();
      loadTallerInfo();
    } else {
      // Si el pagoId no es válido, detener el loading y mostrar error
      setLoading(false);
      setError('ID de pago no válido');
    }
  }, [pagoId]);

  const loadTallerInfo = async () => {
    try {
      const taller = await obtenerPerfilTaller();
      setTallerInfo(taller);
    } catch (err) {
      console.log('No se pudo cargar info del taller, usando valores por defecto');
      setTallerInfo({
        nombre_taller: localStorage.getItem('nombre_taller') || 'AutoFix',
        direccion: 'Dirección no disponible',
        telefono: 'Teléfono no disponible',
        email: 'Email no disponible'
      });
    }
  };

  const loadPagoDetalle = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetchPagoById(pagoId);
      console.log('📄 Detalle de pago:', response);
      setPago(response);
    } catch (err) {
      console.error('❌ Error al cargar detalle:', err);
      setError('No se pudo cargar el detalle del pago.');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPDF = async () => {
    try {
      setDescargando(true);
      
      // Crear contenido HTML para el PDF
      const contenidoHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 0; }
    body { 
      font-family: Arial, sans-serif; 
      padding: 30px 40px; 
      max-width: 100%; 
      margin: 0 auto;
      font-size: 11px;
    }
    .taller-header { 
      text-align: center; 
      margin-bottom: 20px; 
      padding-bottom: 15px; 
      border-bottom: 2px solid #2563eb; 
    }
    .taller-header img { 
      max-width: 80px; 
      max-height: 80px; 
      margin-bottom: 8px; 
    }
    .taller-header h1 { 
      color: #1e40af; 
      margin: 8px 0; 
      font-size: 18px; 
    }
    .taller-info { 
      color: #6b7280; 
      font-size: 10px; 
      margin: 3px 0; 
    }
    .header { 
      text-align: center; 
      margin-bottom: 20px; 
    }
    .header h2 { 
      color: #1e40af; 
      margin: 8px 0; 
      font-size: 20px; 
    }
    .section { 
      margin-bottom: 15px; 
      background: #f9fafb; 
      padding: 12px; 
      border-radius: 6px; 
      page-break-inside: avoid;
    }
    .section h2 { 
      color: #1f2937; 
      font-size: 13px; 
      margin: 0 0 8px 0; 
      border-bottom: 1px solid #e5e7eb; 
      padding-bottom: 6px; 
    }
    .row { 
      display: flex; 
      justify-content: space-between; 
      padding: 5px 0; 
      border-bottom: 1px solid #e5e7eb; 
    }
    .row:last-child { border-bottom: none; }
    .label { color: #6b7280; font-weight: 500; font-size: 10px; }
    .value { color: #111827; font-weight: 600; font-size: 10px; text-align: right; }
    .badge { 
      display: inline-block; 
      padding: 4px 10px; 
      border-radius: 15px; 
      font-size: 10px; 
      font-weight: 600; 
    }
    .badge-completado { background: #d1fae5; color: #065f46; }
    .badge-procesando { background: #dbeafe; color: #1e40af; }
    .badge-pendiente { background: #fef3c7; color: #92400e; }
    .badge-fallido { background: #fee2e2; color: #991b1b; }
    .monto { 
      font-size: 24px; 
      color: #059669; 
      font-weight: bold; 
      text-align: center; 
      margin: 15px 0; 
      padding: 10px;
      background: #f0fdf4;
      border-radius: 8px;
    }
    .grid-2 { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 10px; 
    }
    .footer { 
      text-align: center; 
      margin-top: 20px; 
      padding-top: 15px; 
      border-top: 1px solid #e5e7eb; 
      color: #6b7280; 
      font-size: 9px; 
    }
  </style>
</head>
<body>
  ${tallerInfo ? `
  <div class="taller-header">
    ${tallerInfo.logo ? `<img src="${tallerInfo.logo}" alt="Logo" />` : ''}
    <h1>${tallerInfo.nombre_taller || 'AutoFix'}</h1>
    ${tallerInfo.direccion ? `<p class="taller-info">📍 ${tallerInfo.direccion}</p>` : ''}
    <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
      ${tallerInfo.telefono ? `<span class="taller-info">📞 ${tallerInfo.telefono}</span>` : ''}
      ${tallerInfo.email ? `<span class="taller-info">✉️ ${tallerInfo.email}</span>` : ''}
      ${tallerInfo.nit ? `<span class="taller-info">NIT: ${tallerInfo.nit}</span>` : ''}
    </div>
  </div>
  ` : ''}

  <div class="header">
    <h2>COMPROBANTE DE PAGO #${pago.id}</h2>
    <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 10px;">Orden de Trabajo: ${pago.orden_trabajo}</p>
  </div>

  <div class="monto">Bs. ${formatMonto(pago.monto)}</div>

  <div class="grid-2">
    <div class="section">
      <h2>📄 Información del Pago</h2>
      <div class="row">
        <span class="label">Método de Pago:</span>
        <span class="value">${pago.metodo_pago_display}</span>
      </div>
      <div class="row">
        <span class="label">Fecha de Pago:</span>
        <span class="value">${new Date(pago.fecha_pago).toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div class="row">
        <span class="label">Estado:</span>
        <span class="value">
          <span class="badge badge-${pago.estado}">${pago.estado_display}</span>
        </span>
      </div>
      <div class="row">
        <span class="label">Registrado por:</span>
        <span class="value">${pago.usuario_nombre || 'N/A'}</span>
      </div>
    </div>

    <div class="section">
      <h2>📋 Información de la Orden</h2>
      <div class="row">
        <span class="label">Cliente:</span>
        <span class="value">${pago.cliente_nombre || 'N/A'}</span>
      </div>
      <div class="row">
        <span class="label">Número de Orden:</span>
        <span class="value">${pago.orden_trabajo}</span>
      </div>
      ${pago.numero_referencia ? `
      <div class="row">
        <span class="label">N° Referencia:</span>
        <span class="value" style="font-size: 9px;">${pago.numero_referencia}</span>
      </div>` : ''}
    </div>
  </div>

  ${pago.descripcion ? `
  <div class="section">
    <h2>📝 Descripción</h2>
    <p style="margin: 0; font-size: 10px; color: #4b5563;">${pago.descripcion}</p>
  </div>` : ''}

  ${pago.metodo_pago === 'stripe' && pago.stripe_payment_intent_id ? `
  <div class="section">
    <h2>💳 Información de Stripe</h2>
    <div class="row">
      <span class="label">Payment Intent ID:</span>
      <span class="value" style="font-size: 8px; word-break: break-all;">${pago.stripe_payment_intent_id}</span>
    </div>
    ${pago.stripe_charge_id ? `
    <div class="row">
      <span class="label">Charge ID:</span>
      <span class="value" style="font-size: 8px; word-break: break-all;">${pago.stripe_charge_id}</span>
    </div>` : ''}
  </div>` : ''}

  <div class="footer">
    <p style="margin: 3px 0;">Documento generado el ${new Date().toLocaleString('es-BO')}</p>
    <p style="margin: 3px 0;">Este es un comprobante electrónico válido</p>
    ${tallerInfo ? `<p style="margin: 8px 0 0 0; font-weight: 600;">${tallerInfo.nombre_taller || 'AutoFix'}</p>` : ''}
  </div>
</body>
</html>
      `;

      // Crear el PDF usando el método de impresión del navegador
      const ventana = window.open('', '_blank');
      ventana.document.write(contenidoHTML);
      ventana.document.close();
      
      // Esperar a que se cargue el contenido
      setTimeout(() => {
        ventana.print();
      }, 250);
      
    } catch (err) {
      console.error('❌ Error al generar PDF:', err);
      alert('Error al generar el PDF');
    } finally {
      setDescargando(false);
    }
  };

  const handleDescargarExcel = async () => {
    try {
      setDescargando(true);

      // Crear datos para el CSV (compatible con Excel)
      const datos = [];
      
      // Encabezado del taller (centrado)
      if (tallerInfo) {
        datos.push(['', '', tallerInfo.nombre_taller || 'Forza Automotriz', '', '']);
        if (tallerInfo.direccion) {
          datos.push(['', '', `📍 ${tallerInfo.direccion}`, '', '']);
        }
        const infoItems = [];
        if (tallerInfo.telefono) infoItems.push(`📞 ${tallerInfo.telefono}`);
        if (tallerInfo.email) infoItems.push(`✉️ ${tallerInfo.email}`);
        if (tallerInfo.nit) infoItems.push(`NIT: ${tallerInfo.nit}`);
        if (infoItems.length > 0) {
          datos.push(['', '', infoItems.join('  |  '), '', '']);
        }
        datos.push(['════════════════════════════════════════════════════════════════', '', '', '', '']);
        datos.push(['']);
      }
      
      // Encabezado del comprobante
      datos.push(['', '', `COMPROBANTE DE PAGO #${pago.id}`, '', '']);
      datos.push(['', '', `Orden de Trabajo: ${pago.orden_trabajo}`, '', '']);
      datos.push(['']);
      
      // Monto destacado
      datos.push(['', '', `Bs. ${formatMonto(pago.monto)}`, '', '']);
      datos.push(['']);
      
      // Encabezados de las dos columnas
      datos.push(['📄 Información del Pago', '', '📋 Información de la Orden', '']);
      datos.push(['']);
      
      // Contenido en dos columnas
      datos.push([
        'Método de Pago:',
        pago.metodo_pago_display,
        'Cliente:',
        pago.cliente_nombre || 'N/A'
      ]);
      
      datos.push([
        'Fecha de Pago:',
        new Date(pago.fecha_pago).toLocaleString('es-BO', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        'Número de Orden:',
        pago.orden_trabajo
      ]);
      
      datos.push([
        'Estado:',
        pago.estado_display.toUpperCase(),
        pago.numero_referencia ? 'N° Referencia:' : '',
        pago.numero_referencia || ''
      ]);
      
      datos.push([
        'Registrado por:',
        pago.usuario_nombre || 'N/A',
        '',
        ''
      ]);
      
      datos.push(['']);
      
      // Descripción (si existe)
      if (pago.descripcion) {
        datos.push(['📝 Descripción']);
        datos.push([pago.descripcion]);
        datos.push(['']);
      }
      
      // Información de Stripe (si existe)
      if (pago.metodo_pago === 'stripe' && pago.stripe_payment_intent_id) {
        datos.push(['💳 Información de Stripe']);
        datos.push(['Payment Intent ID:', pago.stripe_payment_intent_id]);
        if (pago.stripe_charge_id) {
          datos.push(['Charge ID:', pago.stripe_charge_id]);
        }
        datos.push(['']);
      }
      
      // Footer
      datos.push(['════════════════════════════════════════════════════════════════']);
      datos.push([`Documento generado el ${new Date().toLocaleString('es-BO', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`]);
      datos.push(['Este es un comprobante electrónico válido']);
      datos.push(['']);
      datos.push([tallerInfo?.nombre_taller || localStorage.getItem('nombre_taller') || 'Forza Automotriz']);
      datos.push(['════════════════════════════════════════════════════════════════']);
      
      // Convertir a CSV con mejor formato
      const csv = '\ufeff' + datos.map(fila => fila.join(',')).join('\n');
      
      // Descargar
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Pago_${pago.id}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

    } catch (err) {
      console.error('❌ Error al generar Excel:', err);
      alert('Error al generar el archivo Excel');
    } finally {
      setDescargando(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando detalle del pago...</p>
        </div>
      </div>
    );
  }

  if (error || !pago) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <FaExclamationCircle className="text-red-600 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'No se encontró el pago'}</p>
          <button
            onClick={() => navigate(listadoUrl)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al Listado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(listadoUrl)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft />
            Volver al listado
          </button>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Detalle de Pago #{pago.id}
                </h1>
                <p className="text-gray-600">
                  Orden de Trabajo: <span className="font-semibold">{pago.orden_trabajo}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDescargarPDF}
                  disabled={descargando}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Descargar PDF"
                >
                  <FaFilePdf />
                  PDF
                </button>
                <button
                  onClick={handleDescargarExcel}
                  disabled={descargando}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Descargar Excel"
                >
                  <FaFileExcel />
                  Excel
                </button>
                <span className={`px-4 py-2 rounded-full font-semibold ${getEstadoColor(pago.estado)}`}>
                  {pago.estado_display}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Información principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Información del pago */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaMoneyBillWave className="text-green-600" />
              Información del Pago
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Monto:</span>
                <span className="text-2xl font-bold text-green-600">
                  Bs. {formatMonto(pago.monto)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Método de Pago:</span>
                <div className="flex items-center gap-2">
                  {getMetodoIcon(pago.metodo_pago)}
                  <span className="font-semibold">{pago.metodo_pago_display}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600 flex items-center gap-2">
                  <FaCalendar className="text-sm" />
                  Fecha de Pago:
                </span>
                <span className="font-semibold">
                  {new Date(pago.fecha_pago).toLocaleString('es-BO')}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600 flex items-center gap-2">
                  <FaUser className="text-sm" />
                  Registrado por:
                </span>
                <span className="font-semibold">{pago.usuario_nombre || 'N/A'}</span>
              </div>

              {pago.descripcion && (
                <div className="pt-2">
                  <span className="text-gray-600 block mb-2">Descripción:</span>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded">{pago.descripcion}</p>
                </div>
              )}
            </div>
          </div>

          {/* Información del cliente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaFileInvoice className="text-blue-600" />
              Información de la Orden
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-semibold">{pago.cliente_nombre || 'N/A'}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Número de Orden:</span>
                <span className="font-semibold">{pago.orden_trabajo}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Estado de Pago:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(pago.estado)}`}>
                  {pago.estado_display}
                </span>
              </div>

              {pago.numero_referencia && (
                <div className="pt-2">
                  <span className="text-gray-600 block mb-2">Número de Referencia:</span>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded font-mono">
                    {pago.numero_referencia}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información de Stripe (si aplica) */}
        {pago.metodo_pago === 'stripe' && (pago.stripe_payment_intent_id || pago.stripe_charge_id) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaCreditCard className="text-purple-600" />
              Información de Stripe
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pago.stripe_payment_intent_id && (
                <div>
                  <span className="text-gray-600 text-sm block mb-1">Payment Intent ID:</span>
                  <p className="text-gray-800 bg-gray-50 p-2 rounded font-mono text-sm break-all">
                    {pago.stripe_payment_intent_id}
                  </p>
                </div>
              )}

              {pago.stripe_charge_id && (
                <div>
                  <span className="text-gray-600 text-sm block mb-1">Charge ID:</span>
                  <p className="text-gray-800 bg-gray-50 p-2 rounded font-mono text-sm break-all">
                    {pago.stripe_charge_id}
                  </p>
                </div>
              )}

              {pago.stripe_customer_id && (
                <div>
                  <span className="text-gray-600 text-sm block mb-1">Customer ID:</span>
                  <p className="text-gray-800 bg-gray-50 p-2 rounded font-mono text-sm break-all">
                    {pago.stripe_customer_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default PagoDetalle;
