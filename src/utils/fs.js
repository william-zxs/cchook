import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export class FileSystemUtils {
  static getCchookConfigDir() {
    return path.join(os.homedir(), '.cchook');
  }

  static getClaudeConfigDir() {
    return path.join(os.homedir(), '.claude');
  }

  static getCchookConfigPath() {
    return path.join(this.getCchookConfigDir(), 'config.json');
  }

  static getClaudeSettingsPath() {
    return path.join(this.getClaudeConfigDir(), 'settings.json');
  }

  static async ensureDir(dirPath) {
    try {
      await fs.ensureDir(dirPath);
      return true;
    } catch (error) {
      console.error(`Failed to create directory ${dirPath}:`, error);
      return false;
    }
  }

  static async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static async readJsonFile(filePath) {
    try {
      if (await this.fileExists(filePath)) {
        const content = await fs.readFile(filePath, 'utf8');
        return JSON.parse(content);
      }
      return null;
    } catch (error) {
      console.error(`Failed to read JSON file ${filePath}:`, error);
      return null;
    }
  }

  static async writeJsonFile(filePath, data) {
    try {
      await this.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error(`Failed to write JSON file ${filePath}:`, error);
      return false;
    }
  }

  static async backupFile(filePath) {
    if (await this.fileExists(filePath)) {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      try {
        await fs.copy(filePath, backupPath);
        return backupPath;
      } catch (error) {
        console.error(`Failed to backup file ${filePath}:`, error);
        return null;
      }
    }
    return null;
  }
}