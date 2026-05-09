import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Users, Plus, Edit2, Trash2, Save, X, Upload, FileText, MessageSquare, Bot, Search, Image } from 'lucide-react';
import { getCharacters, addCharacter, updateCharacter, deleteCharacter, importCharactersFromJSON } from '../utils/characterStorage';

interface DialogExample {
  role: 'user' | 'ai bot';
  text: string;
}

interface Character {
  id: string;
  nickname: string;
  gender: string;
  age: number;
  identity: string;
  setting: string;
  avatar: string;
  dialogExamples: DialogExample[];
}

export function CharacterManagementDialog() {
  const [open, setOpen] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Character>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [importResult, setImportResult] = useState<{ success: number; errors: string[]; duplicates?: string[] } | null>(null);

  useEffect(() => {
    if (open) {
      loadCharacters();
    }
  }, [open]);

  const loadCharacters = () => {
    setCharacters(getCharacters() as Character[]);
  };

  const handleStartEdit = (char: Character) => {
    setEditingId(char.id);
    setEditForm(char);
  };

  const handleSaveEdit = () => {
    if (editingId && editForm) {
      updateCharacter(editingId, editForm);
      loadCharacters();
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个角色吗？')) {
      deleteCharacter(id);
      loadCharacters();
    }
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditForm({
      nickname: '',
      gender: '男',
      age: 30,
      identity: '',
      description: '',
      setting: '',
      avatar: '',
      dialogExamples: [],
    });
  };

  const handleSaveAdd = () => {
    if (editForm.nickname && editForm.identity && editForm.description && editForm.setting) {
      const avatar = editForm.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(editForm.nickname || '')}&background=random&size=200`;
      addCharacter({
        ...editForm,
        avatar,
        dialogExamples: editForm.dialogExamples || [],
      } as any);
      loadCharacters();
      setIsAdding(false);
      setEditForm({});
    } else {
      alert('请填写所有必填字段');
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setEditForm({});
  };

  const handleStartImport = () => {
    setIsImporting(true);
    setJsonInput('');
    setImportResult(null);
  };

  const handleImportJSON = () => {
    try {
      const jsonData = JSON.parse(jsonInput);
      const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
      const result = importCharactersFromJSON(dataArray);
      setImportResult(result);
      loadCharacters();
      if (result.errors.length === 0) {
        setTimeout(() => {
          setIsImporting(false);
          setJsonInput('');
          setImportResult(null);
        }, 2000);
      }
    } catch (error) {
      setImportResult({
        success: 0,
        errors: ['JSON格式错误，请检查输入内容'],
      });
    }
  };

  const handleCancelImport = () => {
    setIsImporting(false);
    setJsonInput('');
    setImportResult(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsonInput(content);
      };
      reader.readAsText(file);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setEditForm({ ...editForm, avatar: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUserDialog = () => {
    const dialogs = editForm.dialogExamples || [];
    setEditForm({
      ...editForm,
      dialogExamples: [...dialogs, { role: 'user', text: '' }],
    });
  };

  const handleAddAIDialog = () => {
    const dialogs = editForm.dialogExamples || [];
    setEditForm({
      ...editForm,
      dialogExamples: [...dialogs, { role: 'ai bot', text: '' }],
    });
  };

  const handleUpdateDialog = (index: number, text: string) => {
    const dialogs = [...(editForm.dialogExamples || [])];
    dialogs[index] = { ...dialogs[index], text };
    setEditForm({ ...editForm, dialogExamples: dialogs });
  };

  const handleDeleteDialog = (index: number) => {
    const dialogs = [...(editForm.dialogExamples || [])];
    dialogs.splice(index, 1);
    setEditForm({ ...editForm, dialogExamples: dialogs });
  };

  const handleMoveDialogUp = (index: number) => {
    if (index === 0) return;
    const dialogs = [...(editForm.dialogExamples || [])];
    [dialogs[index - 1], dialogs[index]] = [dialogs[index], dialogs[index - 1]];
    setEditForm({ ...editForm, dialogExamples: dialogs });
  };

  const handleMoveDialogDown = (index: number) => {
    const dialogs = editForm.dialogExamples || [];
    if (index === dialogs.length - 1) return;
    const newDialogs = [...dialogs];
    [newDialogs[index], newDialogs[index + 1]] = [newDialogs[index + 1], newDialogs[index]];
    setEditForm({ ...editForm, dialogExamples: newDialogs });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="w-4 h-4 mr-2" />
          角色管理 ({characters.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>角色库管理</DialogTitle>
          <DialogDescription>
            管理帖子生成所需的角色信息
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleStartAdd} disabled={isAdding || isImporting}>
                <Plus className="w-4 h-4 mr-2" />
                添加新角色
              </Button>
              <Button onClick={handleStartImport} disabled={isAdding || isImporting} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                导入JSON
              </Button>
            </div>

            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索角色昵称、身份或简介..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 添加表单 */}
          {isAdding && (
            <div className="mb-4 p-4 border border-blue-300 rounded-lg bg-blue-50/50">
              <h4 className="font-medium mb-3">新增角色</h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">昵称 *</label>
                  <input
                    type="text"
                    value={editForm.nickname || ''}
                    onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="角色昵称（头像将自动使用昵称生成）"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">性别</label>
                  <select
                    value={editForm.gender || '男'}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">年龄</label>
                  <input
                    type="number"
                    value={editForm.age || 30}
                    onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">身份 *</label>
                  <input
                    type="text"
                    value={editForm.identity || ''}
                    onChange={(e) => setEditForm({ ...editForm, identity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="如：中医养生专家"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">头像</label>
                  <div className="flex items-center gap-2">
                    {editForm.avatar && (
                      <img
                        src={editForm.avatar}
                        alt="头像预览"
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                      />
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                        <Image className="w-4 h-4" />
                        <span>上传图片</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                    {editForm.avatar && (
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, avatar: '' })}
                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                      >
                        清除
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">未上传时将自动使用昵称生成头像</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">简介 *</label>
                  <input
                    type="text"
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="如：从事中医养生20年，擅长食疗调理"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">人设描述 *</label>
                  <textarea
                    value={editForm.setting || ''}
                    onChange={(e) => setEditForm({ ...editForm, setting: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                    rows={3}
                    placeholder="详细描述角色的性格、特点、专长等"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">参考对话</label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
                    {(editForm.dialogExamples || []).length === 0 ? (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        暂无对话，点击下方按钮添加
                      </div>
                    ) : (
                      (editForm.dialogExamples || []).map((dialog, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border-2 ${
                            dialog.role === 'user'
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-green-50 border-green-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {dialog.role === 'user' ? (
                                <MessageSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Bot className="w-4 h-4 text-green-600" />
                              )}
                              <span className="text-xs font-medium text-gray-700">
                                {dialog.role === 'user' ? '用户' : 'AI回复'}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveDialogUp(idx)}
                                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white rounded"
                                  title="上移"
                                >
                                  ↑
                                </button>
                              )}
                              {idx < (editForm.dialogExamples || []).length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveDialogDown(idx)}
                                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white rounded"
                                  title="下移"
                                >
                                  ↓
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteDialog(idx)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-white rounded"
                                title="删除"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <textarea
                            value={dialog.text}
                            onChange={(e) => handleUpdateDialog(idx, e.target.value)}
                            placeholder={dialog.role === 'user' ? '输入用户问题...' : '输入AI回复...'}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm resize-none bg-white"
                            rows={2}
                          />
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleAddUserDialog}
                      className="flex-1 py-2 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      添加用户对话
                    </button>
                    <button
                      type="button"
                      onClick={handleAddAIDialog}
                      className="flex-1 py-2 px-3 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm flex items-center justify-center gap-2"
                    >
                      <Bot className="w-4 h-4" />
                      添加AI回复
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveAdd} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </Button>
                <Button onClick={handleCancelAdd} variant="outline">
                  取消
                </Button>
              </div>
            </div>
          )}

          {/* 导入JSON表单 */}
          {isImporting && (
            <div className="mb-4 p-4 border border-green-300 rounded-lg bg-green-50/50">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                导入角色JSON数据
              </h4>

              {/* 文件上传 */}
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">上传JSON文件</label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>

              <div className="text-sm text-gray-600 mb-2">或粘贴JSON数据</div>

              {/* JSON输入框 */}
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={10}
                placeholder={`[
  {
    "昵称": "养生张",
    "性别": "男",
    "年龄": 45,
    "身份": "中医养生专家",
    "简介": "从事中医养生20年，擅长食疗调理",
    "设定": "性格温和，喜欢用通俗易懂的方式讲解养生知识",
    "头像": "https://example.com/avatar.jpg",
    "参考对话": [
      {"role": "user", "text": "用户问题示例"},
      {"role": "ai bot", "text": "AI回复示例"}
    ]
  }
]`}
              />

              {/* 导入结果 */}
              {importResult && (
                <div className={`mt-3 p-3 rounded-md ${importResult.success > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <div className="font-medium mb-1">
                    {importResult.success > 0 && `✓ 成功导入 ${importResult.success} 个角色`}
                  </div>
                  {importResult.duplicates && importResult.duplicates.length > 0 && (
                    <div className="text-sm mt-2 text-orange-800">
                      <div className="font-medium mb-1">⚠️ 重复角色（已跳过）：</div>
                      <div className="text-xs">{importResult.duplicates.join('、')}</div>
                    </div>
                  )}
                  {importResult.errors.length > 0 && (
                    <div className="text-sm mt-2">
                      <div className="font-medium mb-1">❌ 错误信息：</div>
                      <ul className="list-disc list-inside space-y-1">
                        {importResult.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 格式说明 */}
              <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                <div className="text-sm text-blue-900">
                  <div className="font-medium mb-1">📝 JSON格式说明：</div>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>必需字段：昵称、性别、年龄、身份、简介、设定、参考对话（数组格式）</li>
                    <li>可选字段：头像（URL）</li>
                    <li>支持单个对象或数组格式</li>
                    <li>头像未提供时将自动使用昵称生成</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Button onClick={handleImportJSON} className="flex-1" disabled={!jsonInput.trim()}>
                  <Upload className="w-4 h-4 mr-2" />
                  开始导入
                </Button>
                <Button onClick={handleCancelImport} variant="outline">
                  取消
                </Button>
              </div>
            </div>
          )}

          {/* 角色列表 */}
          <div className="space-y-3">
            {characters
              .filter((char) =>
                searchQuery === '' ||
                char.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                char.identity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                char.description.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((char) => (
              <div
                key={char.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                {editingId === char.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">昵称</label>
                        <input
                          type="text"
                          value={editForm.nickname || ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm, nickname: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">性别</label>
                        <select
                          value={editForm.gender || '男'}
                          onChange={(e) =>
                            setEditForm({ ...editForm, gender: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        >
                          <option value="男">男</option>
                          <option value="女">女</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">年龄</label>
                        <input
                          type="number"
                          value={editForm.age || 30}
                          onChange={(e) =>
                            setEditForm({ ...editForm, age: parseInt(e.target.value) })
                          }
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">身份</label>
                        <input
                          type="text"
                          value={editForm.identity || ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm, identity: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">头像</label>
                        <div className="flex items-center gap-2">
                          {editForm.avatar && (
                            <img
                              src={editForm.avatar}
                              alt="头像预览"
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                            />
                          )}
                          <label className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                              <Image className="w-4 h-4" />
                              <span>上传图片</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                            />
                          </label>
                          {editForm.avatar && (
                            <button
                              type="button"
                              onClick={() => setEditForm({ ...editForm, avatar: '' })}
                              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                            >
                              清除
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">简介</label>
                        <input
                          type="text"
                          value={editForm.description || ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm, description: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">人设描述</label>
                        <textarea
                          value={editForm.setting || ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm, setting: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                          rows={3}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-2">参考对话</label>
                        <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
                          {(editForm.dialogExamples || []).length === 0 ? (
                            <div className="text-center py-4 text-gray-400 text-sm">
                              暂无对话，点击下方按钮添加
                            </div>
                          ) : (
                            (editForm.dialogExamples || []).map((dialog, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg border-2 ${
                                  dialog.role === 'user'
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-green-50 border-green-200'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {dialog.role === 'user' ? (
                                      <MessageSquare className="w-4 h-4 text-blue-600" />
                                    ) : (
                                      <Bot className="w-4 h-4 text-green-600" />
                                    )}
                                    <span className="text-xs font-medium text-gray-700">
                                      {dialog.role === 'user' ? '用户' : 'AI回复'}
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    {idx > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => handleMoveDialogUp(idx)}
                                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white rounded"
                                        title="上移"
                                      >
                                        ↑
                                      </button>
                                    )}
                                    {idx < (editForm.dialogExamples || []).length - 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleMoveDialogDown(idx)}
                                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white rounded"
                                        title="下移"
                                      >
                                        ↓
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteDialog(idx)}
                                      className="p-1 text-red-500 hover:text-red-700 hover:bg-white rounded"
                                      title="删除"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                <textarea
                                  value={dialog.text}
                                  onChange={(e) => handleUpdateDialog(idx, e.target.value)}
                                  placeholder={dialog.role === 'user' ? '输入用户问题...' : '输入AI回复...'}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm resize-none bg-white"
                                  rows={2}
                                />
                              </div>
                            ))
                          )}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={handleAddUserDialog}
                            className="flex-1 py-2 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center justify-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            添加用户对话
                          </button>
                          <button
                            type="button"
                            onClick={handleAddAIDialog}
                            className="flex-1 py-2 px-3 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm flex items-center justify-center gap-2"
                          >
                            <Bot className="w-4 h-4" />
                            添加AI回复
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} size="sm" className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        保存
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" size="sm">
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={char.avatar}
                        alt={char.nickname}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-lg">
                            {char.nickname}
                          </div>
                          <div className="text-sm text-gray-600">
                            {char.gender} · {char.age}岁 · {char.identity}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStartEdit(char)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(char.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{char.description}</div>
                      <div className="text-sm text-gray-700 mb-2">{char.setting}</div>
                      {char.dialogExamples && char.dialogExamples.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs font-medium text-gray-600 mb-2">参考对话：</div>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {char.dialogExamples.map((dialog, idx) => (
                              <div key={idx} className={`text-xs p-2 rounded ${dialog.role === 'user' ? 'bg-blue-50 text-blue-900' : 'bg-green-50 text-green-900'}`}>
                                <span className="font-medium">{dialog.role === 'user' ? '用户' : 'AI'}：</span>
                                {dialog.text}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {characters.length === 0 && !isAdding && (
            <div className="text-center py-8 text-gray-500">
              暂无角色，请添加角色以开始生成帖子
            </div>
          )}

          {characters.length > 0 &&
            characters.filter((char) =>
              searchQuery === '' ||
              char.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
              char.identity.toLowerCase().includes(searchQuery.toLowerCase()) ||
              char.description.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              没有找到匹配的角色
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
