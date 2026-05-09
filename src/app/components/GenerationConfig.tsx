import { useState, useEffect } from 'react';
import { Wand2, Settings } from 'lucide-react';
import { getCharacters } from '../utils/characterStorage';

interface GenerationConfigProps {
  onGenerate: (config: GenerationSettings) => void;
  isGenerating: boolean;
}

export interface GenerationSettings {
  count: number;
  styleType: string;
  customStylePrompt?: string;
  character: string;
  publishTime: 'random' | 'immediate' | 'scheduled';
  scheduledTimeStart?: string;
  scheduledTimeEnd?: string;
  imageCount: 'random' | 'fixed';
  imageNumber?: number;
  imageMin?: number;
  imageMax?: number;
}

export function GenerationConfig({ onGenerate, isGenerating }: GenerationConfigProps) {
  const [characters, setCharacters] = useState<Array<{ id: string; nickname: string }>>([]);
  const [config, setConfig] = useState<GenerationSettings>({
    count: 5,
    styleType: '生活分享',
    character: '随机选择',
    publishTime: 'random',
    imageCount: 'random',
    imageMin: 1,
    imageMax: 4,
  });

  useEffect(() => {
    // 加载角色库
    const chars = getCharacters();
    setCharacters(chars.map(c => ({ id: c.id, nickname: c.nickname })));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(config);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">生成配置</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
            onChange={(e) => setConfig({ ...config, count: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 风格类型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            风格类型
          </label>
          <select
            value={config.styleType}
            onChange={(e) => setConfig({ ...config, styleType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="生活分享">生活分享</option>
            <option value="知识分享">知识分享</option>
            <option value="情感倾诉">情感倾诉</option>
            <option value="旅行游记">旅行游记</option>
            <option value="美食打卡">美食打卡</option>
            <option value="工作日常">工作日常</option>
            <option value="自定义">自定义风格</option>
          </select>
        </div>

        {/* 自定义风格提示 */}
        {config.styleType === '自定义' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自定义风格描述
              <span className="text-xs text-gray-500 ml-2">（描述你想要什么样类型的帖子）</span>
            </label>
            <textarea
              value={config.customStylePrompt || ''}
              onChange={(e) => setConfig({ ...config, customStylePrompt: e.target.value })}
              placeholder="例如：科技资讯分享、健身打卡、读书心得等..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        )}

        {/* 人物选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            人物角色
          </label>
          <select
            value={config.character}
            onChange={(e) => setConfig({ ...config, character: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="随机选择">从角色库随机选择</option>
            {characters.map((char) => (
              <option key={char.id} value={char.nickname}>
                {char.nickname}
              </option>
            ))}
          </select>
          {characters.length === 0 && (
            <p className="text-xs text-orange-600 mt-1">
              ⚠️ 角色库为空，请先添加角色
            </p>
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
                onChange={(e) => setConfig({ ...config, publishTime: e.target.value as any })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">一天中随机时间</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="immediate"
                checked={config.publishTime === 'immediate'}
                onChange={(e) => setConfig({ ...config, publishTime: e.target.value as any })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">立即发布</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="scheduled"
                checked={config.publishTime === 'scheduled'}
                onChange={(e) => setConfig({ ...config, publishTime: e.target.value as any })}
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setConfig({ ...config, scheduledTimeStart: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-16">结束:</span>
                  <input
                    type="time"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setConfig({ ...config, scheduledTimeEnd: e.target.value })}
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
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                value="random"
                checked={config.imageCount === 'random'}
                onChange={(e) => setConfig({ ...config, imageCount: e.target.value as any })}
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
                  onChange={(e) => setConfig({ ...config, imageMin: parseInt(e.target.value) })}
                  className="w-20 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                  placeholder="最小"
                />
                <span className="text-sm text-gray-500">至</span>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={config.imageMax}
                  onChange={(e) => setConfig({ ...config, imageMax: parseInt(e.target.value) })}
                  className="w-20 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                  placeholder="最大"
                />
                <span className="text-sm text-gray-500">张</span>
              </div>
            )}
            <label className="flex items-center">
              <input
                type="radio"
                value="fixed"
                checked={config.imageCount === 'fixed'}
                onChange={(e) => setConfig({ ...config, imageCount: e.target.value as any })}
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
                  onChange={(e) => setConfig({ ...config, imageNumber: parseInt(e.target.value) })}
                  className="w-24 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                  placeholder="数量"
                />
                <span className="text-sm text-gray-500 ml-2">张</span>
              </div>
            )}
          </div>
        </div>

        {/* 生成按钮 */}
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2.5 px-4 rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Wand2 className="w-4 h-4" />
          {isGenerating ? '生成中...' : '开始生成'}
        </button>
      </form>
    </div>
  );
}