import { Character } from '../types/character';
import { User, Edit2, Trash2, MessageSquare } from 'lucide-react';

interface CharacterCardProps {
  character: Character;
  onEdit: (character: Character) => void;
  onDelete: (id: string) => void;
}

export function CharacterCard({ character, onEdit, onDelete }: CharacterCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* 头像 */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0">
          {character.avatar ? (
            <img 
              src={character.avatar} 
              alt={character.nickname} 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-white" />
          )}
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{character.nickname}</h3>
              <p className="text-sm text-gray-500">{character.identity}</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(character)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="编辑"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(character.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">性别:</span>
              <span className="text-gray-700">{character.gender}</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">年龄:</span>
              <span className="text-gray-700">{character.age}岁</span>
            </div>

            <div className="text-sm">
              <span className="text-gray-500">简介: </span>
              <span className="text-gray-700">{character.description}</span>
            </div>

            <div className="text-sm">
              <span className="text-gray-500">设定: </span>
              <p className="text-gray-700 mt-1 line-clamp-2">{character.setting}</p>
            </div>

            {character.dialogExamples && character.dialogExamples.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                <MessageSquare className="w-3 h-3" />
                <span>{character.dialogExamples.length} 条参考对话</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
