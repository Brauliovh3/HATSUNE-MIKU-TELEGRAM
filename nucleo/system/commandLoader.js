import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import settings from '../../settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


global.commands = new Map();


const middlewares = {
  isOwner: (ctx, cmd) => {
    if (cmd.isOwner && String(ctx.senderId).trim() !== String(settings.ownerId).trim()) {
      ctx.reply({ message: '❌ Este comando solo puede usarlo el owner.' });
      return false;
    }
    return true;
  },
  
  isAdmin: async (ctx, cmd) => {
    if (cmd.isAdmin && !await checkAdmin(ctx)) {
      ctx.reply({ message: '❌ Este comando requiere permisos de administrador.' });
      return false;
    }
    return true;
  },
  
  isNSFW: (ctx, cmd) => {
    if (cmd.isNSFW && !isNSFWAllowed(ctx)) {
      ctx.reply({ message: '❌ Este comando solo está disponible en chats NSFW.' });
      return false;
    }
    return true;
  }
};

async function checkAdmin(ctx) {
  try {
    const chat = await ctx.client.getEntity(ctx.chatId);
    return chat.participants?.participants?.find(p => p.userId.toString() === ctx.senderId && p.admin) || false;
  } catch {
    return false;
  }
}

function isNSFWAllowed(ctx) {
  
  return true; 
}

export async function loadCommands() {

  const commandFolders = [
    '../../commands/main',
    '../../commands/economia',
    '../../commands/gacha', 
    '../../commands/downloads',
    '../../commands/profile',
    '../../commands/sockets',
    '../../commands/utils',
    '../../commands/grupo',
    '../../commands/nsfw',
    '../../commands/anime',
    '../../commands/stickers',
    '../../commands/owner'
  ];

  let totalCommands = 0;

  for (const folder of commandFolders) {
    const folderPath = path.join(__dirname, folder);
    
    if (!fs.existsSync(folderPath)) {
      continue;
    }

    try {
      const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
      
      for (const file of files) {
        try {
          const commandPath = path.join(folderPath, file);
          const { default: command } = await import(`file://${commandPath}`);
          
          if (command && command.command) {
            const commands = Array.isArray(command.command) ? command.command : [command.command];
            
            for (const cmd of commands) {
              global.commands.set(cmd.toLowerCase(), {
                ...command,
                category: command.category || 'misc',
                isOwner: command.isOwner || false,
                isAdmin: command.isAdmin || false,
                isNSFW: command.isNSFW || false,
                middlewares: command.middlewares || [],
                cooldown: command.cooldown || 0
              });
            }
            
            totalCommands++;
          }
        } catch (error) {
          console.error(`❌ Error cargando comando ${file}:`, error.message);
        }
      }
    } catch (error) {
      console.error(`❌ Error leyendo carpeta ${folder}:`, error.message);
    }
  }

}

export async function executeCommand(ctx, commandName, args) {
  const cmd = global.commands.get(commandName.toLowerCase());
  
  if (!cmd) {
    return { success: false, error: 'Comando no encontrado' };
  }

  try {
 
    
    const activeMiddlewares = [...(cmd.middlewares || [])];
    if (cmd.isOwner && !activeMiddlewares.includes('isOwner')) activeMiddlewares.push('isOwner');
    if (cmd.isAdmin && !activeMiddlewares.includes('isAdmin')) activeMiddlewares.push('isAdmin');
    if (cmd.isNSFW && !activeMiddlewares.includes('isNSFW')) activeMiddlewares.push('isNSFW');

    for (const middlewareName of activeMiddlewares) {
      const middleware = middlewares[middlewareName];
      if (middleware && !(await middleware(ctx, cmd))) {
        return { success: false, error: 'Middleware rechazó el comando' };
      }
    }

    
    const cooldownKey = `cooldown_${commandName}_${ctx.senderId}`;
    const lastUsed = global.db.data?.cooldowns?.[cooldownKey] || 0;
    if (Date.now() - lastUsed < cmd.cooldown * 1000) {
      const remaining = Math.ceil((cmd.cooldown * 1000 - (Date.now() - lastUsed)) / 1000);
      await ctx.reply({ message: `⏱️ Espera ${remaining}s antes de usar este comando nuevamente.` });
      return { success: false, error: 'En cooldown' };
    }

   
    const result = await cmd.run(ctx, args);
    
 
    if (cmd.cooldown > 0) {
      if (!global.db.data) global.db.data = {};
      if (!global.db.data.cooldowns) global.db.data.cooldowns = {};
      global.db.data.cooldowns[cooldownKey] = Date.now();
    }

    return { success: true, result };
    
  } catch (error) {
    console.error(`❌ Error ejecutando comando ${commandName}:`, error);
    await ctx.reply({ message: '❌ Ocurrió un error al ejecutar el comando.' });
    return { success: false, error: error.message };
  }
}

export function getCommand(commandName) {
  return global.commands.get(commandName.toLowerCase());
}

export function getAllCommands() {
  return Array.from(global.commands.entries());
}

export function getCommandsByCategory(category) {
  return Array.from(global.commands.entries()).filter(([_, cmd]) => cmd.category === category);
}
