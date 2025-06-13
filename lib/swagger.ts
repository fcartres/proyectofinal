import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Furgón Seguro",
      version: "1.0.0",
      description: "Documentación de la API para la aplicación Furgón Seguro, que conecta conductores de transporte escolar con padres.",
    },
    servers: [
      {
        url: "http://localhost:3000/api", // Ajusta esto si tu API está en otra base URL
        description: "Servidor de Desarrollo Local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./app/api/**/*.ts", "./src/routes/*.js", "./src/middlewares/*.js"], // Rutas a tus archivos de API y middleware
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 