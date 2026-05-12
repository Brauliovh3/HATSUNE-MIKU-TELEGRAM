import dotenv from 'dotenv'
import { Telegraf } from 'telegraf'
import serverQR from './nucleo/system/serverQR.js'

dotenv.config()

const token = process.env.BOT_TOKEN

if (!token) {
  console.log('❌ Falta BOT_TOKEN en el archivo .env')
  process.exit(1)
}

const bot = new Telegraf(token)



const botInfo = {
  name: 'Hatsune Miku Bot',
  version: '1.0.0',
  platform: 'Telegram'
}

const qrData = await serverQR.generateServerQR(botInfo)

const sessionId = serverQR.serverSession.sessionId

await serverQR.saveQRToFile(qrData, sessionId)



bot.command('scanqr', async (ctx) => {
  try {
    const args = ctx.message.text.split(' ').slice(1)
    const code = args[0]

    if (!code) {
      return ctx.reply(
        `❌ Uso incorrecto\n\n📲 Ejemplo:\n/scanqr ${sessionId}`
      )
    }

    const result = serverQR.scanServerQR(
      code,
      ctx.from.id.toString(),
      {
        username: ctx.from.username || '',
        first_name: ctx.from.first_name || ''
      }
    )

    if (!result.success) {
      return ctx.reply(`❌ ${result.error || 'QR inválido'}`)
    }

    await ctx.reply(
      `✅ Sesión vinculada correctamente\n\n🤖 El bot ya puede operar`
    )

    console.log(
      `✅ Usuario vinculado: ${
        ctx.from.username || ctx.from.first_name
      }`
    )

  } catch (e) {
    console.log(e)
    ctx.reply('❌ Error al vincular sesión')
  }
})



bot.start(async (ctx) => {
  await ctx.reply(`
💙 Hatsune Miku Bot Activo

📲 Para vincular sesión:

/scanqr ${sessionId}
`)
})



bot.command('ping', async (ctx) => {
  const start = Date.now()

  const msg = await ctx.reply('🏓 Pong')

  const speed = Date.now() - start

  await ctx.telegram.editMessageText(
    msg.chat.id,
    msg.message_id,
    null,
    `🏓 Pong\n⚡ ${speed}ms`
  )
})



bot.catch((err) => {
  console.log('❌ Error Telegram:', err)
})



bot.launch()
  .then(() => {
    console.log('✅ Bot iniciado correctamente')
    console.log(`🤖 ${bot.botInfo.username}`)
    console.log(`🆔 Session ID: ${sessionId}`)
    console.log(`📁 QR generado: server_qr/server_${sessionId}.png`)
    console.log(`📲 Vincular usando:`)
    console.log(`/scanqr ${sessionId}`)
  })
  .catch((err) => {
    console.log('❌ Error al iniciar bot')
    console.log(err.message)
  })



process.once('SIGINT', () => {
  bot.stop('SIGINT')
  process.exit(0)
})

process.once('SIGTERM', () => {
  bot.stop('SIGTERM')
  process.exit(0)
})