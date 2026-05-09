import { Character } from '../types/character';

const STORAGE_KEY = 'ai_post_characters';

export function getCharacters(): Character[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load characters:', error);
    return [];
  }
}

export function saveCharacters(characters: Character[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  } catch (error) {
    console.error('Failed to save characters:', error);
  }
}

export function addCharacter(character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Character {
  const characters = getCharacters();

  // 去重检查：检查是否已存在同昵称角色
  const existingCharacter = characters.find(c => c.nickname === character.nickname);
  if (existingCharacter) {
    throw new Error(`角色 "${character.nickname}" 已存在，不能重复添加`);
  }

  const now = new Date().toISOString();
  const newCharacter: Character = {
    ...character,
    id: `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  characters.push(newCharacter);
  saveCharacters(characters);
  return newCharacter;
}

export function updateCharacter(id: string, updates: Partial<Character>): Character | null {
  const characters = getCharacters();
  const index = characters.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  const updatedCharacter: Character = {
    ...characters[index],
    ...updates,
    id: characters[index].id, // 确保ID不变
    createdAt: characters[index].createdAt, // 确保创建时间不变
    updatedAt: new Date().toISOString(),
  };
  
  characters[index] = updatedCharacter;
  saveCharacters(characters);
  return updatedCharacter;
}

export function deleteCharacter(id: string): boolean {
  const characters = getCharacters();
  const filtered = characters.filter(c => c.id !== id);
  if (filtered.length === characters.length) return false;
  saveCharacters(filtered);
  return true;
}

export function importCharactersFromJSON(jsonData: any[]): { success: number; errors: string[]; duplicates: string[] } {
  const errors: string[] = [];
  const duplicates: string[] = [];
  let success = 0;

  jsonData.forEach((data, index) => {
    try {
      // 验证必需字段
      if (!data.昵称 || !data.性别 || !data.年龄 || !data.身份 || !data.简介 || !data.设定) {
        errors.push(`第 ${index + 1} 条数据缺少必需字段`);
        return;
      }

      // 验证参考对话（必填且必须是数组）
      if (!data.参考对话 || !Array.isArray(data.参考对话) || data.参考对话.length === 0) {
        errors.push(`第 ${index + 1} 条数据缺少参考对话或格式不正确（需要非空数组）`);
        return;
      }

      // 生成头像（使用UI Avatars API，默认使用昵称）
      const avatar = data.头像 || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.昵称)}&background=random&size=200`;

      const character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'> = {
        nickname: data.昵称,
        gender: data.性别,
        age: data.年龄,
        identity: data.身份,
        description: data.简介,
        setting: data.设定,
        dialogExamples: data.参考对话,
        avatar,
      };

      addCharacter(character);
      success++;
    } catch (error) {
      if (error instanceof Error && error.message.includes('已存在')) {
        duplicates.push(data.昵称);
      } else {
        errors.push(`第 ${index + 1} 条数据导入失败: ${error}`);
      }
    }
  });

  return { success, errors, duplicates };
}
