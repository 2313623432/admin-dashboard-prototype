import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Plus,
  Edit2,
  Trash2,
  Send,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  User,
  MessageCircle,
  Wand2,
  Upload,
  Search,
  Filter,
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { ImageEditCell } from './ImageEditCell';
import { getCharacters } from '../utils/characterStorage';

const CATEGORIES = [
  '养生智慧',
  '食养调理',
  '草本养生',
  '经络调养',
  '传统文化',
];

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  images?: string[];
  timestamp: string;
  replies?: Comment[];
  isUser?: boolean;
  isAIBot?: boolean;
  likeCount?: number;
}

export interface PostData {
  id: string;
  characterName: string;
  characterAvatar: string;
  title?: string;
  content: string;
  images: string[];
  timestamp: string;
  status: 'pending' | 'published' | 'scheduled';
  category: string;
  styleType?: string;
  comments?: Comment[];
  likeCount?: number;
}

interface PostManagementTableProps {
  posts: PostData[];
  onEdit: (id: string, content: string, images: string[]) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  onRevoke: (id: string) => void;
  onBatchPublish: (ids: string[]) => void;
  onBatchDelete: (ids: string[]) => void;
  addButton?: React.ReactNode;
  onGenerateImages?: (prompt: string) => Promise<string[]>;
  generationProgress?: {
    total: number;
    generating: number;
    success: number;
    failed: number;
  };
  showProgress?: boolean;
}

export function PostManagementTable({
  posts,
  onEdit,
  onDelete,
  onPublish,
  onRevoke,
  onBatchPublish,
  onBatchDelete,
  addButton,
  onGenerateImages,
  generationProgress,
  showProgress,
}: PostManagementTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [nicknameFilter, setNicknameFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('全部');
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [editCommentImages, setEditCommentImages] = useState<string[]>([]);

  const handleSelectAll = () => {
    if (selectedRows.size === filteredPosts.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredPosts.map((p) => p.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };

  const handleToggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleStartEdit = (post: PostData) => {
    setEditingRow(post.id);
    setEditContent(post.content);
    setEditImages(post.images);
  };

  const handleSaveEdit = (id: string) => {
    onEdit(id, editContent, editImages);
    setEditingRow(null);
    setEditContent('');
    setEditImages([]);
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditContent('');
    setEditImages([]);
  };

  const handleStartEditComment = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditCommentContent(comment.content);
    setEditCommentImages(comment.images || []);
  };

  const handleSaveEditComment = (postId: string, commentId: string) => {
    // 这里只在前端更新，实际项目中应该调用API
    // 暂时不做持久化，仅作UI演示
    setEditingComment(null);
    setEditCommentContent('');
    // TODO: 实际需要回调函数来更新posts数据
  };

  const handleCancelEditComment = () => {
    setEditingComment(null);
    setEditCommentContent('');
    setEditCommentImages([]);
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    if (confirm('确定要删除这条评论吗？')) {
      // 这里只在前端更新，实际项目中应该调用API
      // TODO: 实际需要回调函数来更新posts数据
    }
  };

  // 筛选帖子
  const filteredPosts = posts.filter((post) => {
    // 搜索帖子内容
    const matchesSearch =
      searchQuery === '' ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());

    // 搜索昵称
    const matchesNickname =
      nicknameFilter === '' ||
      post.characterName.toLowerCase().includes(nicknameFilter.toLowerCase());

    // 搜索用户ID
    const matchesUserId =
      userIdFilter === '';

    // 日期筛选
    let matchesDate = true;
    if (dateFilterStart || dateFilterEnd) {
      const postDateStr = post.timestamp.split(' ')[0]; // "05/09"
      const [month, day] = postDateStr.split('/').map(Number);
      const currentYear = new Date().getFullYear();
      const postDate = new Date(currentYear, month - 1, day);

      if (dateFilterStart) {
        const startDate = new Date(dateFilterStart);
        if (postDate < startDate) matchesDate = false;
      }
      if (dateFilterEnd) {
        const endDate = new Date(dateFilterEnd);
        endDate.setHours(23, 59, 59);
        if (postDate > endDate) matchesDate = false;
      }
    }

    // 分区筛选
    const matchesCategory =
      categoryFilter === '全部' || post.category === categoryFilter;

    // 状态筛选
    const matchesStatus =
      statusFilter === '全部' ||
      (statusFilter === '待发布' && post.status === 'pending') ||
      (statusFilter === '已发布' && post.status === 'published') ||
      (statusFilter === '已定时发布' && post.status === 'scheduled');

    return matchesSearch && matchesNickname && matchesUserId && matchesDate && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
        {/* 第一行：操作按钮和统计 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            {addButton || (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                生成新帖子
              </Button>
            )}

            {/* 生成进度显示 */}
            {showProgress && generationProgress && generationProgress.total > 0 && (
              <div className="flex items-center gap-2">
                {/* 正在生成 */}
                {generationProgress.generating > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-sm text-blue-700 font-medium">
                      生成中 {generationProgress.generating}
                    </span>
                  </div>
                )}

                {/* 生成成功 */}
                {generationProgress.success > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      成功 {generationProgress.success}
                    </span>
                  </div>
                )}

                {/* 生成失败 */}
                {generationProgress.failed > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-md">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700 font-medium">
                      失败 {generationProgress.failed}
                    </span>
                  </div>
                )}
              </div>
            )}

            {selectedRows.size > 0 && (
              <>
                <Button
                  onClick={() => onBatchPublish(Array.from(selectedRows))}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  批量发布 ({selectedRows.size})
                </Button>
                <Button
                  onClick={() => {
                    if (confirm(`确定要删除选中的 ${selectedRows.size} 条帖子吗？`)) {
                      onBatchDelete(Array.from(selectedRows));
                      setSelectedRows(new Set());
                    }
                  }}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  批量删除
                </Button>
              </>
            )}
          </div>
          <div className="text-sm text-gray-600">
            共 {posts.length} 条帖子 · 已发布{' '}
            {posts.filter((p) => p.status === 'published').length} 条 · 已定时发布{' '}
            {posts.filter((p) => p.status === 'scheduled').length} 条 · 待发布{' '}
            {posts.filter((p) => p.status === 'pending').length} 条
            {filteredPosts.length < posts.length && (
              <span className="ml-2 text-blue-600 font-medium">
                · 筛选后 {filteredPosts.length} 条
              </span>
            )}
          </div>
        </div>

        {/* 第二行：搜索和筛选 */}
        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 flex-wrap">
          {/* 搜索帖子内容 */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索帖子内容(1-20个字符)"
              maxLength={20}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 搜索昵称 */}
          <div className="relative flex-1 min-w-[160px] max-w-[220px]">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={nicknameFilter}
              onChange={(e) => setNicknameFilter(e.target.value)}
              placeholder="搜索昵称"
              maxLength={20}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* 搜索用户ID */}
          <div className="relative flex-1 min-w-[160px] max-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              placeholder="搜索用户ID"
              maxLength={20}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* 日期筛选 */}
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={dateFilterStart}
              onChange={(e) => setDateFilterStart(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-[140px]"
              placeholder="开始日期"
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="date"
              value={dateFilterEnd}
              onChange={(e) => setDateFilterEnd(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-[140px]"
              placeholder="结束日期"
            />
          </div>

          {/* 重置按钮 */}
          <Button
            onClick={() => {
              setSearchQuery('');
              setNicknameFilter('');
              setUserIdFilter('');
              setDateFilterStart('');
              setDateFilterEnd('');
              setCategoryFilter('全部');
              setStatusFilter('全部');
              setSelectedRows(new Set());
            }}
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            重置
          </Button>
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={filteredPosts.length > 0 && selectedRows.size === filteredPosts.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-24">角色</TableHead>
                <TableHead className="w-48">标题</TableHead>
                <TableHead className="min-w-[300px]">帖子内容</TableHead>
                <TableHead className="w-32">图片</TableHead>
                <TableHead className="w-28">所属分区</TableHead>
                <TableHead className="w-28">风格类型</TableHead>
                <TableHead className="w-32">发布时间</TableHead>
                <TableHead className="w-20">点赞数</TableHead>
                <TableHead className="w-24">状态</TableHead>
                <TableHead className="w-40">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-32 text-center text-gray-500">
                    {posts.length === 0
                      ? '暂无帖子，点击"生成新帖子"开始创建'
                      : '没有符合筛选条件的帖子'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post) => (
                  <React.Fragment key={post.id}>
                    <TableRow className="hover:bg-gray-50">
                      {/* 选择框 */}
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(post.id)}
                          onChange={() => handleSelectRow(post.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </TableCell>

                      {/* 展开按钮 */}
                      <TableCell>
                        {post.comments && post.comments.length > 0 && (
                          <button
                            onClick={() => handleToggleExpand(post.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {expandedRows.has(post.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </TableCell>

                      {/* 角色 */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {post.characterAvatar ? (
                              <img
                                src={post.characterAvatar}
                                alt={post.characterName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {post.characterName}
                          </div>
                        </div>
                      </TableCell>

                      {/* 标题 */}
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                          {post.title || '无标题'}
                        </div>
                      </TableCell>

                      {/* 帖子内容 */}
                      <TableCell>
                        {editingRow === post.id ? (
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                            rows={3}
                          />
                        ) : (
                          <div className="text-sm text-gray-700 line-clamp-3">
                            {post.content}
                          </div>
                        )}
                      </TableCell>

                      {/* 图片 */}
                      <TableCell>
                        {editingRow === post.id ? (
                          <ImageEditCell
                            images={editImages}
                            onImagesChange={setEditImages}
                            postId={post.id}
                            onGenerateImages={onGenerateImages}
                          />
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {post.images.slice(0, 3).map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt=""
                                className="w-12 h-12 object-cover rounded"
                              />
                            ))}
                            {post.images.length > 3 && (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600">
                                +{post.images.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>

                      {/* 所属分区 */}
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.category === '养生智慧'
                              ? 'bg-blue-100 text-blue-800'
                              : post.category === '食养调理'
                              ? 'bg-green-100 text-green-800'
                              : post.category === '草本养生'
                              ? 'bg-emerald-100 text-emerald-800'
                              : post.category === '经络调养'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {post.category}
                        </span>
                      </TableCell>

                      {/* 风格类型 */}
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.styleType === '生活分享'
                              ? 'bg-pink-100 text-pink-800'
                              : post.styleType === '知识分享'
                              ? 'bg-indigo-100 text-indigo-800'
                              : post.styleType === '情感倾诉'
                              ? 'bg-rose-100 text-rose-800'
                              : post.styleType === '旅行游记'
                              ? 'bg-cyan-100 text-cyan-800'
                              : post.styleType === '美食打卡'
                              ? 'bg-amber-100 text-amber-800'
                              : post.styleType === '工作日常'
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {post.styleType || '未分类'}
                        </span>
                      </TableCell>

                      {/* 发布时间 */}
                      <TableCell>
                        <div className="text-sm text-gray-700">{post.timestamp}</div>
                      </TableCell>

                      {/* 点赞数 */}
                      <TableCell>
                        <div className="text-sm text-gray-700 font-medium">
                          {post.likeCount || 0}
                        </div>
                      </TableCell>

                      {/* 状态 */}
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : post.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {post.status === 'published' ? '已发布' : post.status === 'scheduled' ? '已定时发布' : '待发布'}
                        </span>
                      </TableCell>

                      {/* 操作 */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {editingRow === post.id ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(post.id)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                title="保存"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                                title="取消"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStartEdit(post)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="编辑"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {post.status === 'pending' ? (
                                <button
                                  onClick={() => onPublish(post.id)}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                  title="发布"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              ) : (post.status === 'published' || post.status === 'scheduled') ? (
                                <button
                                  onClick={() => {
                                    if (confirm('确定要撤回这条帖子吗？撤回后将变为待发布状态')) {
                                      onRevoke(post.id);
                                    }
                                  }}
                                  className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
                                  title="撤回"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              ) : null}
                              <button
                                onClick={() => {
                                  if (confirm('确定要删除这条帖子吗？')) {
                                    onDelete(post.id);
                                  }
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                title="删除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* 展开的评论区域 */}
                    {expandedRows.has(post.id) && post.comments && (
                      <TableRow>
                        <TableCell colSpan={10} className="bg-gray-50">
                          <div className="py-4 px-8 space-y-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                              <MessageCircle className="w-4 h-4" />
                              评论 ({post.comments.length})
                            </div>
                            {post.comments.map((comment) => (
                              <div key={comment.id} className="space-y-2">
                                {/* 一级评论 */}
                                <div className="flex gap-3 bg-white p-3 rounded-lg">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {comment.authorAvatar ? (
                                      <img
                                        src={comment.authorAvatar}
                                        alt={comment.authorName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <User className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium">
                                        {comment.authorName}
                                      </span>
                                      {comment.isUser && (
                                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                          用户
                                        </span>
                                      )}
                                      {comment.isAIBot && (
                                        <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                                          AI
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-500">
                                        {comment.timestamp}
                                      </span>
                                    </div>
                                    {editingComment === comment.id ? (
                                      <div className="space-y-2">
                                        <textarea
                                          value={editCommentContent}
                                          onChange={(e) => setEditCommentContent(e.target.value)}
                                          className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                                          rows={2}
                                        />
                                        <ImageEditCell
                                          images={editCommentImages}
                                          onImagesChange={setEditCommentImages}
                                          postId={comment.id}
                                        />
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => handleSaveEditComment(post.id, comment.id)}
                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                            title="保存"
                                          >
                                            <Check className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={handleCancelEditComment}
                                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                                            title="取消"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="text-sm text-gray-700 mb-1">
                                          {comment.content}
                                        </div>
                                        {comment.images && comment.images.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mb-2">
                                            {comment.images.slice(0, 3).map((img, idx) => (
                                              <img
                                                key={idx}
                                                src={img}
                                                alt=""
                                                className="w-16 h-16 object-cover rounded"
                                              />
                                            ))}
                                            {comment.images.length > 3 && (
                                              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600">
                                                +{comment.images.length - 3}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                          <span className="text-xs text-gray-500">
                                            👍 {comment.likeCount || 0} 赞
                                          </span>
                                          {comment.isAIBot && (
                                            <button
                                              onClick={() => handleStartEditComment(comment)}
                                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                              title="编辑"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                              编辑
                                            </button>
                                          )}
                                          <button
                                            onClick={() => handleDeleteComment(post.id, comment.id)}
                                            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                                            title="删除"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                            删除
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* 二级评论 */}
                                {comment.replies && comment.replies.length > 0 && (
                                  <div className="ml-11 space-y-2">
                                    {comment.replies.map((reply) => (
                                      <div
                                        key={reply.id}
                                        className="flex gap-3 bg-white p-3 rounded-lg border-l-2 border-blue-200"
                                      >
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                                          {reply.authorAvatar ? (
                                            <img
                                              src={reply.authorAvatar}
                                              alt={reply.authorName}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <User className="w-3.5 h-3.5 text-white" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium">
                                              {reply.authorName}
                                            </span>
                                            {reply.isUser && (
                                              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                                用户
                                              </span>
                                            )}
                                            {reply.isAIBot && (
                                              <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                                                AI
                                              </span>
                                            )}
                                            <span className="text-xs text-gray-500">
                                              {reply.timestamp}
                                            </span>
                                          </div>
                                          {editingComment === reply.id ? (
                                            <div className="space-y-2">
                                              <textarea
                                                value={editCommentContent}
                                                onChange={(e) => setEditCommentContent(e.target.value)}
                                                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                                                rows={2}
                                              />
                                              <div className="flex items-center gap-2">
                                                <button
                                                  onClick={() => handleSaveEditComment(post.id, reply.id)}
                                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                                  title="保存"
                                                >
                                                  <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                  onClick={handleCancelEditComment}
                                                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                                                  title="取消"
                                                >
                                                  <X className="w-4 h-4" />
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <>
                                              <div className="text-sm text-gray-700 mb-1">
                                                {reply.content}
                                              </div>
                                              <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-500">
                                                  👍 {reply.likeCount || 0} 赞
                                                </span>
                                                {reply.isAIBot && (
                                                  <button
                                                    onClick={() => handleStartEditComment(reply)}
                                                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                    title="编辑"
                                                  >
                                                    <Edit2 className="w-3 h-3" />
                                                    编辑
                                                  </button>
                                                )}
                                                <button
                                                  onClick={() => handleDeleteComment(post.id, reply.id)}
                                                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                                                  title="删除"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                  删除
                                                </button>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
