import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Upload, X, Wand2, Loader2 } from 'lucide-react';

interface ImageEditCellProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  postId: string;
  onGenerateImages?: (prompt: string) => Promise<string[]>;
}

export function ImageEditCell({
  images,
  onImagesChange,
  postId,
  onGenerateImages,
}: ImageEditCellProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleRemoveImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      onImagesChange([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImagesChange([...images, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImages = async () => {
    if (!aiPrompt.trim()) {
      alert('请输入图片描述');
      return;
    }

    if (!onGenerateImages) {
      alert('图片生成功能暂不可用');
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      const urls = await onGenerateImages(aiPrompt);
      setGeneratedImages(urls);
    } catch (error) {
      console.error('图片生成错误:', error);
      alert('图片生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectGeneratedImage = (url: string) => {
    onImagesChange([...images, url]);
    setGeneratedImages([]);
    setAiPrompt('');
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {images.map((img, idx) => (
          <div key={idx} className="relative w-12 h-12 group">
            <img src={img} alt="" className="w-full h-full object-cover rounded" />
            <button
              onClick={() => handleRemoveImage(idx)}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Upload className="w-3 h-3 mr-1" />
            添加图片
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加图片</DialogTitle>
            <DialogDescription>
              通过AI生成图片、输入URL或上传本地图片
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* AI生成图片 */}
            <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50/30">
              <div className="flex items-center gap-2 mb-3">
                <Wand2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">AI生成图片</h3>
              </div>
              <div className="space-y-3">
                <div className="mb-2 p-2 bg-blue-100 rounded text-xs text-blue-800">
                  💡 提示：输入英文关键词效果最佳，如 "herbs"、"wellness"、"healthy food" 等
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    输入图片描述
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="例如：herbs plants, wellness meditation, healthy food nutrition..."
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating}
                  />
                </div>
                <Button
                  onClick={handleGenerateImages}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      生成图片
                    </>
                  )}
                </Button>

                {/* 生成的图片结果 */}
                {generatedImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">选择一张图片添加：</p>
                    <div className="grid grid-cols-3 gap-2">
                      {generatedImages.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectGeneratedImage(imgUrl)}
                          className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all group"
                        >
                          <img
                            src={imgUrl}
                            alt={`生成的图片 ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                              选择
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-300"></div>
              <span className="text-xs text-gray-500">或</span>
              <div className="h-px flex-1 bg-gray-300"></div>
            </div>

            {/* 手动输入URL */}
            <div>
              <label className="block text-sm font-medium mb-2">图片URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="粘贴图片URL..."
                  className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={handleAddImage} disabled={!imageUrl.trim()}>
                  添加
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-300"></div>
              <span className="text-xs text-gray-500">或</span>
              <div className="h-px flex-1 bg-gray-300"></div>
            </div>

            {/* 本地上传 */}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id={`upload-${postId}`}
              />
              <label htmlFor={`upload-${postId}`}>
                <Button variant="outline" className="w-full" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    从本地上传图片
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
