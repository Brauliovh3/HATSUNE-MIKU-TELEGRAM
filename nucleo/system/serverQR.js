import QRCode from 'qrcode';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

class ServerQRSystem {
  constructor() {
    this.serverSession = null;
    this.qrGenerated = false;
    this.linkedUsers = new Set();
  }

  generateServerQR(botInfo) {
    const sessionId = crypto.randomBytes(16).toString('hex').toUpperCase();
    
    const qrData = {
      type: 'TELEGRAM_SERVER_LINK',
      sessionId: sessionId,
      serverName: botInfo.serverName || 'Hatsune Miku Server',
      botName: botInfo.name || 'Hatsune Miku Bot',
      botUsername: botInfo.username || '@hatsune_miku_bot',
      botPhone: botInfo.phone || '+51953073477',
      serverIP: botInfo.serverIP || 'localhost',
      port: botInfo.port || 3000,
      timestamp: Date.now(),
      version: botInfo.version || '1.0.0'
    };

    this.serverSession = {
      sessionId: sessionId,
      botInfo: botInfo,
      createdAt: Date.now(),
      expiresAt: Date.now() + (10 * 60 * 1000), // 10 minutos
      scanned: false
    };

    return QRCode.toDataURL(JSON.stringify(qrData));
  }

  async saveQRToFile(qrData, sessionId) {
    const qrDir = './server_qr';
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    const qrPath = path.join(qrDir, `server_${sessionId}.png`);
    const base64Data = qrData.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    fs.writeFileSync(qrPath, buffer);
    return qrPath;
  }

  async displayQRInConsole(qrData, sessionId) {
    console.log('\n' + '='.repeat(60));
    console.log('🤖 HATSUNE MIKU BOT - TELEGRAM SERVER');
    console.log('='.repeat(60));
    console.log('\n📱 ESCANEA ESTE QR PARA VINCULAR CON TELEGRAM');
    console.log('\n🆔 CÓDIGO DE SESIÓN: ' + sessionId);
    console.log('\n⏰ VÁLIDO POR 10 MINUTOS');
    console.log('\n📋 INSTRUCCIONES:');
    console.log('1. Escanea este QR con tu cámara de Telegram');
    console.log('2. O envía el código al bot: /scanqr ' + sessionId);
    console.log('3. El bot se vinculará automáticamente');
    console.log('\n🌐 Bot: @hatsune_miku_bot');
    console.log('📞 Teléfono: +51953073477');
    console.log('\n' + '='.repeat(60) + '\n');

    // También mostrar QR en consola (texto)
    try {
      const qr = await import('qrcode-terminal');
      const qrText = qr.generate(JSON.stringify({
        type: 'TELEGRAM_SERVER_LINK',
        sessionId: sessionId,
        timestamp: Date.now()
      }), { small: true });
      
      console.log('📱 QR CODE (para escanear con teléfono):');
      console.log(qrText);
      console.log('\n');
    } catch (error) {
      console.log('📱 Para mostrar QR en consola, instala: npm install qrcode-terminal');
    }
  }

  scanServerQR(sessionId, telegramUserId, userInfo) {
    if (!this.serverSession) {
      return { success: false, error: 'No hay sesión activa en el servidor' };
    }

    if (this.serverSession.sessionId !== sessionId) {
      return { success: false, error: 'Código de sesión inválido' };
    }

    if (Date.now() > this.serverSession.expiresAt) {
      return { success: false, error: 'Sesión expirada' };
    }

    if (this.serverSession.scanned) {
      return { success: false, error: 'Sesión ya utilizada' };
    }

    // Vincular usuario
    this.linkedUsers.add(telegramUserId);
    this.serverSession.scanned = true;
    this.serverSession.telegramUserId = telegramUserId;
    this.serverSession.userInfo = userInfo;

    return { 
      success: true, 
      message: '¡Servidor vinculado exitosamente!',
      serverInfo: this.serverSession.botInfo
    };
  }

  isServerLinked() {
    return this.serverSession && this.serverSession.scanned;
  }

  getLinkedUsers() {
    return Array.from(this.linkedUsers);
  }

  isUserLinked(userId) {
    return this.linkedUsers.has(userId);
  }

  resetServer() {
    this.serverSession = null;
    this.qrGenerated = false;
    this.linkedUsers.clear();
  }

  getServerStatus() {
    return {
      hasSession: !!this.serverSession,
      isLinked: this.isServerLinked(),
      linkedUsers: this.getLinkedUsers().length,
      sessionId: this.serverSession?.sessionId || null,
      expiresAt: this.serverSession?.expiresAt || null,
      createdAt: this.serverSession?.createdAt || null
    };
  }
}

export default new ServerQRSystem();
