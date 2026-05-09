import { useState } from 'react';
import { PostCard, Post } from './PostCard';
import { CheckSquare, Square, Send, Trash2 } from 'lucide-react';

interface PrePublishListProps {
  posts: Post[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onPublish: () => void;
  onClear: () => void;
  onEdit: (id: string, content: string, images: string[]) => void;
}

export function PrePublishList({
  posts,
  onToggleSelect,
  onToggleSelectAll,
  onPublish,
  onClear,
  onEdit,
}: PrePublishListProps) {
  const selectedCount = posts.filter(p => p.selected).length;
  const allSelected = posts.length > 0 && selectedCount === posts.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 头部 */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">预发布内容</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              已生成 {posts.length} 条，已选 {selectedCount} 条
            </span>
          </div>
        </div>

        {/* 操作栏 */}
        {posts.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSelectAll}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {allSelected ? (
                <>
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <span>取消全选</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4" />
                  <span>全选</span>
                </>
              )}
            </button>

            <button
              onClick={onPublish}
              disabled={selectedCount === 0}
              className="flex items-center gap-2 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>一键发布 ({selectedCount})</span>
            </button>

            <button
              onClick={onClear}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              <span>清空列表</span>
            </button>
          </div>
        )}
      </div>

      {/* 帖子列表 */}
      <div className="p-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">暂无生成内容</p>
            <p className="text-sm text-gray-400 mt-1">请在左侧配置并生成内容</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onToggleSelect={onToggleSelect}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}