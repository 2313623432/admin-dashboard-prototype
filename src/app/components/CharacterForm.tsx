import { useState, useEffect } from 'react';
import { Character, DialogExample } from '../types/character';
import { X, Plus, Trash2 } from 'lucide-react';

interface CharacterFormProps {
  character?: Character | null;
  onSubmit: (data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function CharacterForm({ character, onSubmit, onCancel }: CharacterFormProps) {
  const [formData, setFormData] = useState({
    nickname: '',
    gender: '男' as '男' | '女' | '其他',
    age: 25,
    identity: '',
    description: '',
    setting: '',
    avatar: '',
    dialogExamples: [] as DialogExample[],
  });

  useEffect(() => {
    if (character) {
      setFormData({
        nickname: character.nickname,
        gender: character.gender,
        age: character.age,
        identity: character.identity,
        description: character.description,
        setting: character.setting,
        avatar: character.avatar,
        dialogExamples: character.dialogExamples || [],
      });
    }
  }, [character]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 如果没有头像，自动生成
    const avatar = formData.avatar || 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.nickname)}&background=random&size=200`;
    
    onSubmit({
      ...formData,
      avatar,
    });
  };

  const addDialogExample = () => {
    setFormData(prev => ({
      ...prev,
      dialogExamples: [
        ...prev.dialogExamples,
        { role: 'user', text: '' },
        { role: 'ai bot', text: '' },
      ],
    }));
  };

  const removeDialogPair = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dialogExamples: prev.dialogExamples.filter((_, i) => i !== index && i !== index + 1),
    }));
  };

  const updateDialog = (index: number, text: string) => {
    setFormData(prev => ({
      ...prev,
      dialogExamples: prev.dialogExamples.map((dialog, i) => 
        i === index ? { ...dialog, text } : dialog
      ),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {character ? '编辑角色' : '新建角色'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            {/* 基本信息 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                昵称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="角色昵称（头像将自动使用昵称生成）"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  性别 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="男">男</option>
                  <option value="女">女</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年龄 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                身份 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.identity}
                onChange={(e) => setFormData({ ...formData, identity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="角色的社会身份或职业"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                简介 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：从事中医养生20年，擅长食疗调理"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                头像URL
                <span className="text-xs text-gray-500 ml-2">（留空自动生成）</span>
              </label>
              <input
                type="text"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                设定 <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.setting}
                onChange={(e) => setFormData({ ...formData, setting: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={6}
                placeholder="详细描述角色的性格、说话风格、行为习惯等..."
              />
            </div>

            {/* 参考对话 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  参考对话
                  <span className="text-xs text-gray-500 ml-2">（可选）</span>
                </label>
                <button
                  type="button"
                  onClick={addDialogExample}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加对话
                </button>
              </div>

              {formData.dialogExamples.length > 0 && (
                <div className="space-y-3">
                  {formData.dialogExamples.reduce((acc, dialog, index) => {
                    if (dialog.role === 'user') {
                      acc.push(
                        <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-medium text-gray-500">对话 {Math.floor(index / 2) + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeDialogPair(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">用户:</label>
                              <input
                                type="text"
                                value={dialog.text}
                                onChange={(e) => updateDialog(index, e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="用户说的话..."
                              />
                            </div>
                            {formData.dialogExamples[index + 1] && (
                              <div>
                                <label className="text-xs text-gray-600 mb-1 block">AI回复:</label>
                                <input
                                  type="text"
                                  value={formData.dialogExamples[index + 1].text}
                                  onChange={(e) => updateDialog(index + 1, e.target.value)}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="AI角色的回复..."
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return acc;
                  }, [] as JSX.Element[])}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {character ? '保存修改' : '创建角色'}
          </button>
        </div>
      </div>
    </div>
  );
}
