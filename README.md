# 💙 HATSUNE MIKU TELEGRAM BOT 💙

Bot de Telegram completo con todas las funcionalidades del bot de WhatsApp Hatsune Miku, adaptado para la plataforma de Telegram con menús interactivos y comandos completos.

## 🌟 CARACTERÍSTICAS PRINCIPALES

### 📋 MENÚ INTERACTIVO
- ✅ Menú principal con botones inline
- ✅ Categorías organizadas
- ✅ Navegación intuitiva
- ✅ Imágenes y multimedia

### 💰 ECONOMÍA Y RPG
- ✅ Sistema de trabajo y ganancias
- ✅ Banco y billetera
- ✅ Tienda y objetos
- ✅ Niveles y experiencia
- ✅ Minijuegos de azar

### 🎯 GACHA Y WAIFUS
- ✅ Sistema de invocación
- ✅ Diferentes rarezas
- ✅ Colección de personajes
- ✅ Batallas PVP
- ✅ Galería interactiva

### 📥 DESCARGAS
- ✅ YouTube (música y video)
- ✅ TikTok (videos e imágenes)
- ✅ Instagram
- ✅ Facebook
- ✅ MediaFire
- ✅ Y muchas más plataformas

### 🎌 ANIME Y REACCIONES
- ✅ +50 reacciones diferentes
- ✅ GIFs animados
- ✅ Interacciones sociales
- ✅ Respuestas automáticas

### 🎨 STICKERS
- ✅ Creación de stickers
- ✅ Packs personalizados
- ✅ Stickers animados
- ✅ Gestión completa

### 👥 ADMINISTRACIÓN DE GRUPOS
- ✅ Sistema de bienvenida
- ✅ Anti-enlaces
- ✅ Sistema de warns
- ✅ Administración completa

### 🔞 CONTENIDO +18
- ✅ NSFW con verificación
- ✅ Múltiples categorías
- ✅ Juegos adultos
- ✅ Contenido exclusivo

## 🚀 INSTALACIÓN

### 1. CLONAR EL REPOSITORIO
```bash
git clone <repositorio>
cd telegram-bot
```

### 2. INSTALAR DEPENDENCIAS
```bash
npm install
```

### 3. CONFIGURAR VARIABLES DE ENTORNO
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus datos:
```env
BOT_TOKEN=TU_TOKEN_DE_BOT_AQUI
OWNER_ID=TU_ID_DE_TELEGRAM
BOT_NAME=💙HATSUNE MIKU💙
```

### 4. OBTENER TOKEN DE BOT
1. Habla con [@BotFather](https://t.me/BotFather) en Telegram
2. Usa `/newbot`
3. Sigue las instrucciones
4. Copia el token que te proporciona

### 5. OBTENER TU ID DE TELEGRAM
1. Habla con [@userinfobot](https://t.me/userinfobot)
2. Tu ID aparecerá en el mensaje

### 6. INICIAR EL BOT
```bash
npm start
```

Para desarrollo:
```bash
npm run dev
```

## 📁 ESTRUCTURA DEL PROYECTO

```
telegram-bot/
├── index.js                 # Archivo principal
├── package.json            # Dependencias
├── .env.example            # Variables de entorno
├── README.md               # Este archivo
├── nucleo/                 # Núcleo del bot
│   ├── commands.js         # Menús y comandos
│   ├── menuConfig.js       # Configuración de menús
│   └── system/            # Sistema del bot
│       ├── initDB.js       # Base de datos
│       └── commandLoader.js # Cargador de comandos
└── commands/              # Comandos del bot
    ├── economia/          # Comandos de economía
    ├── gacha/            # Comandos de gacha
    ├── downloads/        # Comandos de descargas
    ├── profile/          # Comandos de perfil
    ├── sockets/         # Comandos de configuración
    ├── utils/           # Comandos de utilidades
    ├── grupo/           # Comandos de grupo
    ├── nsfw/            # Comandos +18
    ├── anime/           # Comandos de anime
    ├── stickers/        # Comandos de stickers
    └── owner/           # Comandos del owner
```

## 🎮 COMANDOS DISPONIBLES

### 📋 MENÚ PRINCIPAL
- `/start` - Iniciar el bot
- `/menu` - Menú principal
- `/help` - Ayuda general

### 💰 ECONOMÍA
- `/work` - Trabajar para ganar monedas
- `/balance` - Ver balance
- `/mine` - Minar recursos
- `/slots` - Máquina tragamonedas
- `/roulette` - Ruleta de apuestas

### 🎯 GACHA
- `/rw` - Invocar waifu aleatoria
- `/c` - Reclamar personaje
- `/v` - Vender personaje
- `/coleccion` - Ver colección

### 📥 DESCARGAS
- `/play` - Descargar de YouTube
- `/tiktok` - Descargar de TikTok
- `/instagram` - Descargar de Instagram

### 📝 PERFIL
- `/profile` - Ver perfil completo
- `/setgenre` - Establecer género
- `/setdesc` - Establecer descripción

### 🛠️ UTILIDADES
- `/translate` - Traducir texto
- `/calc` - Calculadora
- `/ssweb` - Screenshot de web

### 🎌 ANIME
- `/hug` - Dar abrazos
- `/kiss` - Dar besos
- `/pat` - Acariciar cabeza

### 👑 OWNER
- `/restart` - Reiniciar bot
- `/addcoins` - Agregar monedas
- `/ban` - Banear usuario

## 🔧 CONFIGURACIÓN AVANZADA

### BASE DE DATOS
El bot usa JSON para almacenar datos:
- `database.json` - Base de datos principal
- Guardado automático cada ciertos intervalos

### VARIABLES DE ENTORNO ADICIONALES
```env
# Configuración del bot
BOT_NAME=💙HATSUNE MIKU💙
BOT_CHANNEL=@hatsune_miku_channel
CURRENCY=🌱 Cebollines

# Configuración de economía
WORK_MIN=50
WORK_MAX=200
GACHA_COST=50

# Configuración de cooldowns
WORK_COOLDOWN=60000
GACHA_COOLDOWN=30000
```

## 🤝 CONTRIBUTOR

Si quieres contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Haz tus cambios
4. Sube los cambios: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📝 NOTAS IMPORTANTES

### 🔒 SEGURIDAD
- Mantén tu token de bot seguro
- No compartas tus credenciales
- Usa variables de entorno para datos sensibles

### ⚠️ REQUISITOS
- Node.js 16+ 
- NPM o Yarn
- Token de bot de Telegram válido
- ID de Telegram para owner

### 🌐 REDES SOPORTADAS
- YouTube (música y video)
- TikTok (todos los formatos)
- Instagram (posts y reels)
- Facebook (videos)
- Twitter/X (videos)
- Pinterest (videos e imágenes)
- MediaFire (archivos)
- Google Drive (archivos)

## 🐛 ERRORES COMUNES

### ❌ "Bot token is invalid"
- Verifica que el token sea correcto
- Asegúrate de copiarlo completo

### ❌ "Chat not found"
- El bot necesita ser agregado al grupo
- Verifica permisos del bot

### ❌ "Forbidden: bot was blocked by the user"
- El usuario bloqueó al bot
- El usuario debe desbloquearlo

## 📞 SOPORTE

Si necesitas ayuda:
- 📧 Contacta al desarrollador: @DEPOOL
- 🐛 Reporta errores en Issues
- 💡 Sugerencias en Discussions

## 📄 LICENCIA

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

💙 **Desarrollado con amor por DEPOOL** 💙  
🤖 **Bot de Telegram Hatsune Miku** 🤖  
🌟 **Todas las funcionalidades que amas, ahora en Telegram** 🌟
