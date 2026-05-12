let isNumber = (x) => typeof x === 'number' && !isNaN(x)

function initDB(ctx) {
  const userId = ctx.from?.id?.toString() || 'unknown'
  const chatId = ctx.chat?.id?.toString() || 'unknown'
  const isGroup = ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup'
  
  // Inicializar configuración del bot
  const settings = global.db.data.settings[chatId] ||= {}
  settings.self ??= false
  settings.prefix ??= ['/', '!', '.', '#']
  settings.commandsejecut ??= isNumber(settings.commandsejecut) ? settings.commandsejecut : 0
  settings.id ??= '@hatsune_miku_channel' // Canal de Telegram
  settings.nameid ??= '💙HATSUNE MIKU CHANNEL💙'
  settings.type ??= 'Owner'
  settings.link ??= 'https://t.me/hatsune_miku_channel'
  settings.banner ??= 'https://i.pinimg.com/736x/0c/1e/f8/0c1ef8e804983e634fbf13df1044a41f.jpg'
  settings.icon ??= 'https://i.pinimg.com/736x/0c/1e/f8/0c1ef8e804983e634fbf13df1044a41f.jpg'
  settings.currency ??= '🌱 Cebollines'
  settings.audios ??= false
  settings.namebot ??= '💙HATSUNE MIKU💙'
  settings.botname ??= '💙HATSUNE MIKU💙'  
  settings.owner ??= '(ㅎㅊDEPOOLㅊㅎ)'

  // Inicializar usuario
  const user = global.db.data.users[userId] ||= {}
  user.name ??= ctx.from?.first_name || ctx.from?.username || 'Usuario'
  user.username ??= ctx.from?.username || ''
  user.exp = isNumber(user.exp) ? user.exp : 0
  user.level = isNumber(user.level) ? user.level : 0
  user.usedcommands = isNumber(user.usedcommands) ? user.usedcommands : 0
  user.pasatiempo ??= ''
  user.description ??= ''
  user.marry ??= ''
  user.genre ??= ''
  user.birth ??= ''
  user.metadatos ??= null
  user.metadatos2 ??= null
  user.coins = isNumber(user.coins) ? user.coins : 0
  user.bank = isNumber(user.bank) ? user.bank : 0
  user.afk = isNumber(user.afk) ? user.afk : -1
  user.afkReason ??= ''
  user.characters = Array.isArray(user.characters) ? user.characters : []
  user.waifu = user.waifu || { characters: [], pending: null, cooldown: 0 }

  // Inicializar chat (solo para grupos)
  if (isGroup) {
    const chat = global.db.data.chats[chatId] ||= {}
    chat.users ||= {}
    chat.mutedUsers ??= {}
    chat.isBanned ??= false
    chat.welcome ??= false
    chat.goodbye ??= false
    chat.sWelcome ??= ''
    chat.sGoodbye ??= ''
    chat.nsfw ??= false
    chat.alerts ??= true
    chat.gacha ??= true
    chat.economy ??= true
    chat.audios ??= false
    chat.adminonly ??= false
    chat.primaryBot ??= null
    chat.antilinks ??= true

    chat.users[userId] ||= {}
    chat.users[userId].stats ||= {}
    chat.users[userId].usedTime ??= null
    chat.users[userId].lastCmd = isNumber(chat.users[userId].lastCmd) ? chat.users[userId].lastCmd : 0
    chat.users[userId].coins = isNumber(chat.users[userId].coins) ? chat.users[userId].coins : 0
    chat.users[userId].bank = isNumber(chat.users[userId].bank) ? chat.users[userId].bank : 0
    chat.users[userId].afk = isNumber(chat.users[userId].afk) ? chat.users[userId].afk : -1
    chat.users[userId].afkReason ??= ''
    chat.users[userId].characters = Array.isArray(chat.users[userId].characters) ? chat.users[userId].characters : []
  }

  // Guardar cambios periódicamente
  if (Math.random() < 0.1) { // 10% de probabilidad de guardar
    saveDatabase()
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync('./database.json', JSON.stringify(global.db.data, null, 2))
  } catch (error) {
    console.error('Error saving database:', error)
  }
}

function loadDatabase() {
  try {
    if (fs.existsSync('./database.json')) {
      const data = fs.readFileSync('./database.json', 'utf8')
      global.db.data = JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading database:', error)
    global.db.data = { users: {}, chats: {}, settings: {}, subbots: {} }
  }
}

// Cargar base de datos al iniciar
loadDatabase()

export default initDB;
