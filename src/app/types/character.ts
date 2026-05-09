export interface DialogExample {
  role: 'user' | 'ai bot';
  text: string;
}

export interface Character {
  id: string;
  nickname: string; // 昵称
  gender: '男' | '女' | '其他';
  age: number;
  identity: string; // 身份
  description: string; // 简介
  setting: string; // 设定
  dialogExamples: DialogExample[]; // 参考对话
  avatar: string; // 头像URL（默认使用昵称生成）
  createdAt: string;
  updatedAt: string;
}

export type CharacterFormData = Omit<Character, 'id' | 'createdAt' | 'updatedAt'>;
