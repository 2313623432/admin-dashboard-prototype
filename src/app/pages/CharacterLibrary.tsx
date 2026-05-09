import { useState, useEffect } from 'react';
import { Character } from '../types/character';
import { CharacterCard } from '../components/CharacterCard';
import { CharacterForm } from '../components/CharacterForm';
import { 
  getCharacters, 
  addCharacter, 
  updateCharacter, 
  deleteCharacter,
  importCharactersFromJSON 
} from '../utils/characterStorage';
import { Plus, Upload, Search, Users } from 'lucide-react';

export function CharacterLibrary() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = () => {
    setCharacters(getCharacters());
  };

  const handleAdd = (data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => {
    addCharacter(data);
    loadCharacters();
    setShowForm(false);
  };

  const handleEdit = (data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCharacter) {
      updateCharacter(editingCharacter.id, data);
      loadCharacters();
      setEditingCharacter(null);
      setShowForm(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个角色吗？')) {
      deleteCharacter(id);
      loadCharacters();
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
          const result = importCharactersFromJSON(dataArray);
          
          alert(`导入完成！\n成功: ${result.success} 条\n失败: ${result.errors.length} 条\n${result.errors.length > 0 ? '\n错误信息:\n' + result.errors.join('\n') : ''}`);
          loadCharacters();
        } catch (error) {
          alert('JSON格式错误，请检查文件内容');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const filteredCharacters = characters.filter(char =>
    char.nickname.includes(searchQuery) ||
    char.identity.includes(searchQuery) ||
    char.description.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">角色库</h1>
              <p className="text-gray-600">管理AI帖子生成的角色信息</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleImport}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                导入JSON
              </button>
              <button
                onClick={() => {
                  setEditingCharacter(null);
                  setShowForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                新建角色
              </button>
            </div>
          </div>

          {/* 搜索和统计 */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索角色昵称、身份或简介..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                共 <span className="font-semibold text-gray-900">{characters.length}</span> 个角色
              </span>
            </div>
          </div>
        </div>

        {/* 角色列表 */}
        {filteredCharacters.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? '没有找到匹配的角色' : '还没有角色'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? '尝试使用其他关键词搜索' : '点击"新建角色"或"导入JSON"开始添加角色'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                新建第一个角色
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onEdit={(char) => {
                  setEditingCharacter(char);
                  setShowForm(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* 表单弹窗 */}
        {showForm && (
          <CharacterForm
            character={editingCharacter}
            onSubmit={editingCharacter ? handleEdit : handleAdd}
            onCancel={() => {
              setShowForm(false);
              setEditingCharacter(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
