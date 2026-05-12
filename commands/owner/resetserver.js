import serverQR from '../../nucleo/system/serverQR.js';

export default {
  command: ['resetserver', 'reiniciarservidor'],
  category: 'owner',
  description: 'Reiniciar la vinculación del servidor',
  async run(ctx, args) {
    const userId = ctx.from.id.toString();
    
    // Verificar si es owner
    if (!global.owner.includes(userId)) {
      return ctx.reply('❌ Solo el owner puede usar este comando.');
    }

    try {
      // Resetear servidor
      serverQR.resetServer();
      
      console.log('\n🔄 SERVIDOR REINICIADO');
      console.log('🆔 Sesión anterior eliminada');
      console.log('👥 Usuarios vinculados eliminados');
      console.log('🔄 Generando nueva sesión...\n');

      // Generar nuevo QR
      const botInfo = {
        serverName: 'Hatsune Miku Server',
        name: 'Hatsune Miku Bot',
        username: '@hatsune_miku_bot',
        phone: '+51953073477',
        serverIP: process.env.SERVER_IP || 'localhost',
        port: process.env.PORT || 3000,
        version: '1.0.0'
      };

      const qrData = await serverQR.generateServerQR(botInfo);
      const qrPath = await serverQR.saveQRToFile(qrData, serverQR.serverSession.sessionId);
      await serverQR.displayQRInConsole(qrData, serverQR.serverSession.sessionId);

      await ctx.reply(`🔄 *SERVIDOR REINICIADO* 🔄\n\n` +
        `✅ *Sesión anterior eliminada*\n` +
        `🆔 *Nueva sesión generada*\n` +
        `📱 *QR mostrado en consola*\n\n` +
        `💡 *Los usuarios deben volver a vincularse*\n` +
        `📋 *Usa /serverstatus para verificar estado*`);

    } catch (error) {
      console.error('Error en resetserver:', error);
      await ctx.reply('❌ Error al reiniciar servidor.');
    }
  }
};
