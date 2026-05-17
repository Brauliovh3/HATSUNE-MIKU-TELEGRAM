import fs from 'fs';
import defaultSettings from '../../settings.js';

let isNumber = (x) => typeof x === 'number' && !isNaN(x)

function initDB(ctx) {
  const userId = ctx.from?.id?.toString() || 'unknown'
  const chatId = ctx.chat?.id?.toString() || 'unknown'
  const isGroup = ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup'
  
 
  const settings = global.db.data.settings[chatId] ||= {}
  settings.self ??= false
  settings.prefix ??= defaultSettings.prefix
  settings.commandsejecut ??= isNumber(settings.commandsejecut) ? settings.commandsejecut : 0
  settings.id ??= defaultSettings.link
  settings.nameid ??= '💙HATSUNE MIKU CHANNEL💙'
  settings.type ??= 'Owner'
  settings.link ??= defaultSettings.link
  settings.banner ??= defaultSettings.banner
  settings.icon ??= defaultSettings.icon
  settings.currency ??= defaultSettings.currency
  settings.audios ??= defaultSettings.audios
  settings.namebot ??= defaultSettings.namebot
  settings.botname ??= defaultSettings.botname
  settings.owner ??= defaultSettings.owner

  
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

  
  if (Math.random() < 0.1) { 
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
   
    if (!global.db) {
      global.db = {};
    }
    
    if (fs.existsSync('./database.json')) {
      const data = fs.readFileSync('./database.json', 'utf8')
      global.db.data = JSON.parse(data)
    } else {
      global.db.data = { users: {}, chats: {}, settings: {}, subbots: {} }
    }
  } catch (error) {
    console.error('Error loading database:', error)
    if (!global.db) {
      global.db = {};
    }
    global.db.data = { users: {}, chats: {}, settings: {}, subbots: {} }
  }
}


loadDatabase()

export { initDB, loadDatabase };
