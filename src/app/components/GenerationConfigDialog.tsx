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
import { Wand2, Search, X } from 'lucide-react';
import { getCharacters } from '../utils/characterStorage';

export interface GenerationSettings {
  count: number;
  styleTypes: string[];
  customStylePrompt?: string;
  category: string;
  character: string;
  selectedCharacters?: string[]; // 多选角色
  useRandomCharacter?: boolean; // 是否使用随机选择
  publishTime: 'random' | 'immediate' | 'scheduled';
  scheduledTimeStart?: string;
  scheduledTimeEnd?: string;
  imageCount: 'random' | 'fixed';
  imageNumber?: number;
  imageMin?: number;
  imageMax?: number;
}

interface GenerationConfigDialogProps {
  onGenerate: (config: GenerationSettings) => void;
  isGenerating: boolean;
  children?: React.ReactNode;
}

const CATEGORIES = [
  '养生智慧',
  '食养调理',
  '草本养生',
  '经络调养',
  '传统文化',
];

const STYLE_TYPES = [
  '生活分享',
  '知识分享',
  '情感倾诉',
  '旅行游记',
  '美食打卡',
  '工作日常',
  '自定义',
];

export function GenerationConfigDialog({
  onGenerate,
  isGenerating,
  children,
}: GenerationConfigDialogProps) {
  const [open, setOpen] = useState(false);
  const [characters, setCharacters] = useState<Array<{
    id: string;
    nickname: string;
    identity: string;
    description: string;
    avatar: string;
  }>>([]);
  const [characterSearch, setCharacterSearch] = useState('');
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  const [useRandomCharacter, setUseRandomCharacter] = useState(true);
  const [config, setConfig] = useState<GenerationSettings>({
    count: 5,
    styleTypes: [],
    category: '养生智慧',
    character: '随机选择',
    publishTime: 'random',
    imageCount: 'random',
    imageMin: 1,
    imageMax: 4,
  });

  useEffect(() => {
    if (open) {
      const chars = getCharacters();
      setCharacters(
        chars.map((c) => ({
          id: c.id,
          nickname: c.nickname,
          identity: c.identity,
          description: c.description,
          avatar: c.avatar,
        }))
      );
      // 重置选择状态
      setCharacterSearch('');
      setSelectedCharacterIds([]);
      setUseRandomCharacter(true);
    }
  }, [open]);

  // 过滤角色列表 - 支持搜索昵称、简介、身份
  const filteredCharacters = characters.filter((char) => {
    const searchLower = characterSearch.toLowerCase();
    return (
      char.nickname.toLowerCase().includes(searchLower) ||
      char.identity.toLowerCase().includes(searchLower) ||
      char.description.toLowerCase().includes(searchLower)
    );
  });

  // 获取已选中的角色信息
  const selectedCharacters = characters.filter((char) =>
    selectedCharacterIds.includes(char.id)
  );

  // 切换风格类型选择
  const toggleStyleType = (style: string) => {
    if (config.styleTypes.includes(style)) {
      // 至少保留一个风格
      if (config.styleTypes.length > 1) {
        setConfig({
          ...config,
          styleTypes: config.styleTypes.filter((s) => s !== style),
        });
      }
    } else {
      setConfig({
        ...config,
        styleTypes: [...config.styleTypes, style],
      });
    }
  };

  // 切换角色选择
  const toggleCharacter = (charId: string) => {
    if (selectedCharacterIds.includes(charId)) {
      setSelectedCharacterIds(selectedCharacterIds.filter((id) => id !== charId));
    } else {
      setSelectedCharacterIds([...selectedCharacterIds, charId]);
    }
  };

  // 移除角色
  const removeCharacter = (charId: string) => {
    setSelectedCharacterIds(selectedCharacterIds.filter((id) => id !== charId));
  };

  // 切换随机选择
  const toggleRandomCharacter = () => {
    const newValue = !useRandomCharacter;
    setUseRandomCharacter(newValue);
    if (newValue) {
      // 如果选中随机，清空已选角色
      setSelectedCharacterIds([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (config.styleTypes.length === 0) {
      alert('请至少选择一个风格类型');
      return;
    }
    if (!useRandomCharacter && selectedCharacterIds.length === 0) {
      alert('请至少选择一个角色，或勾选"从角色库随机选择"');
      return;
    }

    // 构建最终配置
    const finalConfig: GenerationSettings = {
      ...config,
      useRandomCharacter,
      selectedCharacters: useRandomCharacter
        ? undefined
        : selectedCharacters.map((c) => c.nickname),
      character: useRandomCharacter ? '随机选择' : selectedCharacters[0]?.nickname || '',
    };

    onGenerate(finalConfig);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Wand2 className="w-4 h-4 mr-2" />
            生成新帖子
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>生成配置</DialogTitle>
          <DialogDescription>
            配置帖子生成参数，系统将自动生成符合要求的帖子内容
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* 生成数量 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              生成数量
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={config.count}
              onChange={(e) =>
                setConfig({ ...config, count: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 风格类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              风格类型
              <span className="ml-2 text-xs text-gray-500 font-normal">
                （多选，已选 {config.styleTypes.length} 个）
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 p-3 border border-gray-300 rounded-md bg-gray-50">
              {STYLE_TYPES.map((style) => (
                <label
                  key={style}
                  className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors ${
                    config.styleTypes.includes(style)
                      ? 'bg-blue-100 border border-blue-300'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={config.styleTypes.includes(style)}
                    onChange={() => toggleStyleType(style)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{style}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 自定义风格 */}
          {config.styleTypes.includes('自定义') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自定义风格描述
              </label>
              <textarea
                value={config.customStylePrompt || ''}
                onChange={(e) =>
                  setConfig({ ...config, customStylePrompt: e.target.value })
                }
                placeholder="例如：科技资讯分享、健身打卡、读书心得等..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}

          {/* 所属分区 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              所属分区
            </label>
            <select
              value={config.category}
              onChange={(e) => setConfig({ ...config, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 人物选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              人物角色
              <span className="ml-2 text-xs text-gray-500 font-normal">
                （共 {characters.length} 个角色）
              </span>
            </label>

            {/* 随机选择选项 - 移到搜索框上方 */}
            <label
              className={`flex items-center gap-3 p-3 mb-3 cursor-pointer rounded-lg border-2 transition-colors ${
                useRandomCharacter
                  ? 'bg-purple-50 border-purple-300'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={useRandomCharacter}
                onChange={toggleRandomCharacter}
                className="w-5 h-5"
              />
              <div className="flex items-center gap-2 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                  随机
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">从角色库随机选择</div>
                  <div className="text-xs text-gray-500">系统将自动分配角色</div>
                </div>
              </div>
            </label>

            {characters.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50 text-center">
                <p className="text-sm text-orange-700 font-medium">⚠️ 角色库为空</p>
                <p className="text-xs text-orange-600 mt-1">请先在角色管理中添加角色</p>
              </div>
            ) : (
              <>
                {/* 搜索框 */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={characterSearch}
                    onChange={(e) => setCharacterSearch(e.target.value)}
                    placeholder="搜索角色昵称、身份或简介..."
                    disabled={useRandomCharacter}
                    className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      useRandomCharacter ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                {/* 已选中的角色标签 */}
                {!useRandomCharacter && selectedCharacters.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md mb-2">
                    {selectedCharacters.map((char) => (
                      <div
                        key={char.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-blue-300 rounded-full text-sm"
                      >
                        <img
                          src={char.avatar}
                          alt={char.nickname}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="text-gray-900 font-medium">{char.nickname}</span>
                        <button
                          onClick={() => removeCharacter(char.id)}
                          className="ml-1 text-gray-500 hover:text-red-600 transition-colors"
                          type="button"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 角色列表 */}
                <div
                  className={`border border-gray-300 rounded-md max-h-80 overflow-y-auto ${
                    useRandomCharacter ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  {filteredCharacters.length > 0 ? (
                    filteredCharacters.map((char) => (
                      <label
                        key={char.id}
                        className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-200 last:border-b-0 ${
                          selectedCharacterIds.includes(char.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCharacterIds.includes(char.id)}
                          onChange={() => toggleCharacter(char.id)}
                          className="w-4 h-4 mt-1"
                        />
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={char.avatar}
                            alt={char.nickname}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">{char.nickname}</div>
                          <div className="text-xs text-blue-600 mt-0.5">{char.identity}</div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {char.description}
                          </div>
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-500">
                        未找到匹配"<span className="font-medium text-gray-700">{characterSearch}</span>"的角色
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        尝试搜索角色的昵称、身份或简介
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* 发布时间 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              发布时间
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="random"
                  checked={config.publishTime === 'random'}
                  onChange={(e) =>
                    setConfig({ ...config, publishTime: e.target.value as any })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">一天中随机时间</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="immediate"
                  checked={config.publishTime === 'immediate'}
                  onChange={(e) =>
                    setConfig({ ...config, publishTime: e.target.value as any })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">立即发布</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="scheduled"
                  checked={config.publishTime === 'scheduled'}
                  onChange={(e) =>
                    setConfig({ ...config, publishTime: e.target.value as any })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">指定时间段</span>
              </label>
              {config.publishTime === 'scheduled' && (
                <div className="ml-6 mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-16">开始:</span>
                    <input
                      type="time"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      onChange={(e) =>
                        setConfig({ ...config, scheduledTimeStart: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-16">结束:</span>
                    <input
                      type="time"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      onChange={(e) =>
                        setConfig({ ...config, scheduledTimeEnd: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 图片数量 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              图片数量
              <span className="ml-2 text-xs text-blue-600 font-normal">
                ✨ 系统将根据风格和分区自动生成相关图片
              </span>
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="random"
                  checked={config.imageCount === 'random'}
                  onChange={(e) =>
                    setConfig({ ...config, imageCount: e.target.value as any })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">指定范围内随机</span>
              </label>
              {config.imageCount === 'random' && (
                <div className="ml-6 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="9"
                    value={config.imageMin}
                    onChange={(e) =>
                      setConfig({ ...config, imageMin: parseInt(e.target.value) })
                    }
                    className="w-20 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                  />
                  <span className="text-sm text-gray-500">至</span>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={config.imageMax}
                    onChange={(e) =>
                      setConfig({ ...config, imageMax: parseInt(e.target.value) })
                    }
                    className="w-20 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                  />
                  <span className="text-sm text-gray-500">张</span>
                </div>
              )}
              <label className="flex items-center">
                <input
                  type="radio"
                  value="fixed"
                  checked={config.imageCount === 'fixed'}
                  onChange={(e) =>
                    setConfig({ ...config, imageCount: e.target.value as any })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">明确数量</span>
              </label>
              {config.imageCount === 'fixed' && (
                <div className="ml-6">
                  <input
                    type="number"
                    min="0"
                    max="9"
                    value={config.imageNumber}
                    onChange={(e) =>
                      setConfig({ ...config, imageNumber: parseInt(e.target.value) })
                    }
                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                  />
                  <span className="text-sm text-gray-500 ml-2">张</span>
                </div>
              )}
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isGenerating}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {isGenerating ? '生成中...' : '开始生成'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isGenerating}
            >
              取消
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
