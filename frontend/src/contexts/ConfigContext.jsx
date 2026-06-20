// @refresh reset
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const ConfigContext = createContext(null);

const CONFIG_DEFECTO = {
  nombre_empresa: 'SIS-AGRO',
  nit: null,
  direccion: null,
  ciudad: null,
  telefono: null,
  correo: null,
  logo: null,
  plan_nombre: null,
};

export function ConfigProvider({ children }) {
  const { usuario } = useAuth();
  const [configuracion, setConfiguracion] = useState(CONFIG_DEFECTO);

  const recargarConfig = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const res = await api.get('/configuracion');
      setConfiguracion({ ...CONFIG_DEFECTO, ...res.data });
    } catch { /* silencioso — usa valores por defecto */ }
  }, []);

  // Se re-ejecuta al montar y cada vez que cambia la empresa del usuario logueado
  useEffect(() => { recargarConfig(); }, [usuario?.id_empresa, recargarConfig]);

  return (
    <ConfigContext.Provider value={{ configuracion, recargarConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}
