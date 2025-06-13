'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

function SwaggerDoc() {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSwaggerSpec() {
      try {
        const response = await fetch('/api/swagger');
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        setSpec(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSwaggerSpec();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando documentación...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>Error al cargar la documentación: {error}</div>;
  }

  return <SwaggerUI spec={spec} />;
}

export default SwaggerDoc; 