import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapa global para almacenar comandos
global.commands = new Map();

export async function loadCommands() {
  console.log('📦 Cargando comandos...');
  
  // Cargar comandos desde diferentes carpetas
  const commandFolders = [
    '../commands/economia',
    '../commands/gacha', 
    '../commands/downloads',
    '../commands/profile',
    '../commands/sockets',
    '../commands/utils',
    '../commands/grupo',
    '../commands/nsfw',
    '../commands/anime',
    '../commands/stickers',
    '../commands/owner'
  ];

  let totalCommands = 0;

  for (const folder of commandFolders) {
    const folderPath = path.join(__dirname, folder);
    
    if (!fs.existsSync(folderPath)) {
      console.log(`⚠️ Carpeta no encontrada: ${folder}`);
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
                isNSFW: command.isNSFW || false
              });
            }
            
            totalCommands++;
            console.log(`✅ Comando cargado: ${file} (${commands.join(', ')})`);
          }
        } catch (error) {
          console.error(`❌ Error cargando comando ${file}:`, error.message);
        }
      }
    } catch (error) {
      console.error(`❌ Error leyendo carpeta ${folder}:`, error.message);
    }
  }

  console.log(`🎉 ¡Se cargaron ${totalCommands} comandos exitosamente!`);
  console.log(`📊 Total de comandos disponibles: ${global.commands.size}`);
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
