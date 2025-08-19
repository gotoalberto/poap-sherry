# POAP Sherry - Twitter Mini App

Mini aplicación de Twitter para distribuir POAPs usando Sherry Social SDK. Esta app permite a los usuarios reclamar POAPs directamente desde Twitter completando ciertos requisitos como seguir una cuenta y retuitear.

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/yourusername/poap-sherry.git
cd poap-sherry
```

2. Instala las dependencias:
```bash
npm install --legacy-peer-deps
```

3. Copia el archivo de configuración:
```bash
cp .env.example .env
```

4. Configura las variables de entorno en `.env`:
```env
# POAP API Configuration
POAP_CLIENT_ID=tu_poap_client_id
POAP_CLIENT_SECRET=tu_poap_client_secret
POAP_API_KEY=tu_poap_api_key
POAP_EVENT_ID=191758
POAP_SECRET_CODE=902096

# Twitter API Configuration
TWITTER_BEARER_TOKEN=tu_twitter_bearer_token

# Follow Gate Configuration
NEXT_PUBLIC_REQUIRED_FOLLOW_USERNAME=gotoalberto
```

5. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🐦 Cómo insertar la miniapp en un post de Twitter

### Método 1: Usando Sherry Links (Recomendado)

1. **Instala la extensión Sherry Links**:
   - Ve a [Chrome Web Store](https://chromewebstore.google.com/detail/sherry-links/cpmcpmfnblpkjlipgkhfjocoohjnmfhd)
   - Instala la extensión "Sherry Links"

2. **Despliega tu app**:
   - Despliega tu app en Vercel, Netlify o cualquier servicio de hosting
   - Obtén la URL pública (ej: `https://tu-poap-app.vercel.app`)

3. **Crea el enlace de Sherry**:
   - Ve a https://sherry.social/links
   - Pega la URL de tu app
   - Sherry generará un enlace especial que se convertirá en una miniapp

4. **Comparte en Twitter**:
   - Crea un nuevo tweet
   - Incluye el enlace de Sherry en tu tweet
   - Los usuarios con la extensión Sherry verán tu miniapp embebida directamente en el tweet

### Método 2: URL Directa con Metadata

1. **Configura los metadatos de tu app**:
   - La app ya incluye los metadatos necesarios en `/api/metadata`
   - Asegúrate de que tu app esté accesible públicamente

2. **Comparte el enlace**:
   ```
   🎉 Reclama tu POAP exclusivo!
   
   Sigue estos pasos:
   1. Instala Sherry Links
   2. Sigue a @gotoalberto
   3. Retuitea este post
   4. Reclama tu POAP aquí: https://tu-app.vercel.app
   
   #POAP #Web3
   ```

### Método 3: Integración con Twitter Cards (Futuro)

Cuando Twitter habilite oficialmente las mini-apps:

1. **Configura Twitter Card metadata**:
   ```html
   <meta name="twitter:card" content="app">
   <meta name="twitter:app:url" content="https://tu-app.vercel.app">
   ```

2. **Registra tu app en Twitter Developer Portal**

## 📱 Experiencia del Usuario

1. **Usuario ve el tweet** con el enlace a la miniapp
2. **Con Sherry instalado**, la miniapp se carga directamente en el tweet
3. **Completa los requisitos**:
   - Sigue la cuenta requerida
   - Retuitea el post
4. **Conecta su wallet** o ingresa dirección
5. **Reclama el POAP**

## 🔧 Personalización

### Cambiar el POAP Event
Modifica en `.env`:
```env
POAP_EVENT_ID=tu_event_id
POAP_SECRET_CODE=tu_secret_code
```

### Cambiar requisitos
Modifica en `.env`:
```env
NEXT_PUBLIC_REQUIRED_FOLLOW_USERNAME=tu_username
```

### Personalizar diseño
Los estilos están en los componentes usando CSS-in-JS. Modifica:
- `/src/components/POAPMinter.tsx`
- `/src/components/FollowGate.tsx`
- `/src/components/POAPSuccess.tsx`

## 🚀 Despliegue en Producción

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Variables de entorno en producción
Configura las mismas variables del `.env` en tu servicio de hosting.

## 📝 Notas Importantes

- Los usuarios necesitan tener instalada la extensión Sherry Links para ver la miniapp embebida
- Sin la extensión, verán un enlace normal que los llevará a la app
- La app funciona tanto embebida como standalone
- Los POAPs se mintean en la blockchain de Gnosis (xDai)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.