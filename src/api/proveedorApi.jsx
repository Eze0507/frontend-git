import axios from 'axios';

const proveedorApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

proveedorApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**@returns {Promise} */
export const getAllProveedor = async () =>{
    try{
        const response = await proveedorApi.get('proveedores/')
        return response.data;
    } catch (error) {
        console.error('Error al obtener los proveedores', error)
        throw error;
    }
};

/**@param {Object} proveedorData */
/**@returns {Promise} */
export const createProveedor = async (proveedorData) => {
    try{
        const response = await proveedorApi.post('proveedores/', proveedorData);
        return response.data;
    } catch (error) {
        console.error('Error al crear el producto', error);
        throw error;
    }
};

/**@param {Number} id */
/**@returns {Promise} */
export const deleteProveedor = async (id) => {
    try{
        const response = await proveedorApi.delete(`proveedores/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar el producto ${id}: `, error);
        throw error;
    }
};

/**@param {Number} id */
/**@param {Object} proveedorData */
/**@returns {Promise} */
export const updateProveedor = async (id, proveedorData) => {
    try{
        const response = await proveedorApi.put(`proveedores/${id}/`, proveedorData);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar el proveedor ${id}:`, error);
        throw error;
    }
};

/**@param {Number} id */
/**@returns {Promise} */
export const getProveedor = async (id) => {
    try {
        const response = await proveedorApi.get(`proveedores/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener el proveedor ${id}: `, error);
        throw error;
    }
};