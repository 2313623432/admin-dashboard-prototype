import { Check, Clock, User, Edit2, Save, X, Trash2, Plus, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

export interface Post {
  id: string;
  characterName: string;
  characterAvatar: string;
  content: string;
  images: string[];
  timestamp: string;
  selected: boolean;
}

interface PostCardProps {
  post: Post;
  onToggleSelect: (id: string) => void;
  onEdit: (id: string, content: string, images: string[]) => void;
}

export function PostCard({ post, onToggleSelect, onEdit }: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [editedImages, setEditedImages] = useState<string[]>(post.images);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleSave = () => {
    onEdit(post.id, editedContent, editedImages);
    setIsEditing(false);
    setShowImageInput(false);
    setImageUrl('');
  };

  const handleCancel = () => {
    setEditedContent(post.content);
    setEditedImages(post.images);
    setIsEditing(false);
    setShowImageInput(false);
    setImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setEditedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddImageUrl = () => {
    if (imageUrl.trim()) {
      setEditedImages(prev => [...prev, imageUrl.trim()]);
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setEditedImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* 选择框和编辑按钮 */}
      <div className="flex items-start gap-3 mb-3">
        <button
          onClick={() => onToggleSelect(post.id)}
          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            post.selected
              ? 'bg-blue-600 border-blue-600'
              : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          {post.selected && <Check className="w-3.5 h-3.5 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          {/* 用户信息 */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
              {post.characterAvatar ? (
                <img src={post.characterAvatar} alt={post.characterName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900">{post.characterName}</div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{post.timestamp}</span>
              </div>
            </div>
            
            {/* 编辑按钮 */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="编辑内容"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-1">
                <button
                  onClick={handleSave}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="保存"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="取消"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* 帖子内容 */}
          {!isEditing ? (
            <div className="text-sm text-gray-700 mb-3 leading-relaxed">
              {post.content}
            </div>
          ) : (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full text-sm text-gray-700 mb-3 leading-relaxed border border-blue-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              placeholder="编辑帖子内容..."
            />
          )}

          {/* 图片展示 */}
          {(isEditing ? editedImages : post.images).length > 0 && (
            <div className={`grid gap-2 ${
              (isEditing ? editedImages : post.images).length === 1 ? 'grid-cols-1' :
              (isEditing ? editedImages : post.images).length === 2 ? 'grid-cols-2' :
              (isEditing ? editedImages : post.images).length === 4 ? 'grid-cols-2' :
              'grid-cols-3'
            }`}>
              {(isEditing ? editedImages : post.images).map((img, index) => (
                <div
                  key={index}
                  className={`relative bg-gray-100 rounded-lg overflow-hidden ${
                    (isEditing ? editedImages : post.images).length === 1 ? 'aspect-[4/3]' : 'aspect-square'
                  }`}
                >
                  <img
                    src={img}
                    alt={`图片 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                      title="删除图片"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 添加图片 */}
          {isEditing && (
            <div className="mt-3">
              {!showImageInput ? (
                <button
                  onClick={() => setShowImageInput(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 border border-blue-300 border-dashed rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>添加图片</span>
                </button>
              ) : (
                <div className="border border-blue-300 rounded-lg p-3 bg-blue-50/50">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        图片URL
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddImageUrl()}
                          className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="粘贴图片URL地址..."
                        />
                        <button
                          onClick={handleAddImageUrl}
                          disabled={!imageUrl.trim()}
                          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          添加
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-gray-300"></div>
                    <span className="text-xs text-gray-500">或</span>
                    <div className="h-px flex-1 bg-gray-300"></div>
                  </div>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id={`image-upload-${post.id}`}
                    />
                    <label
                      htmlFor={`image-upload-${post.id}`}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>从本地上传图片</span>
                    </label>
                  </div>
                  <button
                    onClick={() => {
                      setShowImageInput(false);
                      setImageUrl('');
                    }}
                    className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    取消添加
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}