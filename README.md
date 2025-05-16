# Kalat - Muro Público

Kalat es una aplicación web construida con Next.js 15 que funciona como un muro público donde los usuarios pueden registrarse, iniciar sesión, publicar posts con imágenes y explorar el contenido publicado por otros usuarios.

## Características

- 🔐 Autenticación de usuarios con NextAuth
- 📝 Creación, visualización y gestión de posts
- 🖼️ Soporte para imágenes con Vercel Blob Storage
- 📱 Diseño responsive
- 🎨 Interfaz intuitiva y profesional

## Tecnologías utilizadas

- **Frontend**: Next.js 15, CSS puro (sin Tailwind)
- **Backend**: API Routes de Next.js
- **Base de datos**: MongoDB (Mongoose)
- **Autenticación**: NextAuth.js
- **Almacenamiento**: Vercel Blob para imágenes
- **Despliegue**: Vercel

## Requisitos previos

- Node.js 18.x o superior
- Cuenta en MongoDB Atlas
- Cuenta en Vercel (para despliegue y Blob Storage)

## Configuración local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tuusuario/kalat.git
   cd kalat
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:
   ```
   # MongoDB
   MONGODB_URI="tu_uri_de_mongodb"
   
   # NextAuth
   NEXTAUTH_SECRET="tu_clave_secreta_larga_y_compleja"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Vercel Blob
   BLOB_READ_WRITE_TOKEN="tu_token_de_vercel_blob"
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el panel de Vercel
3. Despliega la aplicación

## Estructura del proyecto

- `/app`: Contiene las rutas y componentes de la aplicación
- `/app/api`: API Routes para manejar operaciones del backend
- `/app/components`: Componentes reutilizables
- `/app/lib`: Utilitarios y configuraciones
- `/app/models`: Modelos de MongoDB

## Licencia

Este proyecto está bajo la licencia MIT.
