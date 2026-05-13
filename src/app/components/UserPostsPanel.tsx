import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from './ui/button';
import {
  Search,
  X,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  RefreshCw,
  MessageCircle,
  ThumbsUp,
} from 'lucide-react';

export interface UserPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  content: string;
  images?: string[];
  publishTime: string;
  likeCount: number;
  commentCount: number;
  comments: UserComment[];
  isDeleted?: boolean;
}

export interface UserComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  images?: string[];
  publishTime: string;
  likeCount: number;
  isAI: boolean;
  isRealUser: boolean;
}

interface UserPostsPanelProps {
  posts: UserPost[];
}

export function UserPostsPanel({ posts }: UserPostsPanelProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchKeyword, setSearchKeyword] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');
  const [showRealUserCommentsOnly, setShowRealUserCommentsOnly] = useState<{ [postId: string]: boolean }>({});

  // 切换展开/折叠
  const handleToggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // 切换真人评论筛选
  const toggleRealUserComments = (postId: string) => {
    setShowRealUserCommentsOnly({
      ...showRealUserCommentsOnly,
      [postId]: !showRealUserCommentsOnly[postId],
    });
  };

  // 高亮关键词
  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === keyword.toLowerCase() ? (
            <mark key={index} className="bg-yellow-200 px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // 筛选帖子
  const filteredPosts = posts.filter((post) => {
    // 关键词搜索（仅搜索帖子内容）
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      if (!post.content.toLowerCase().includes(keyword)) return false;
    }

    // 用户ID筛选
    if (userIdFilter.trim()) {
      if (!post.userId.toLowerCase().includes(userIdFilter.toLowerCase())) return false;
    }

    // 时间范围筛选
    if (dateFilterStart) {
      if (post.publishTime < dateFilterStart) return false;
    }
    if (dateFilterEnd) {
      if (post.publishTime > dateFilterEnd) return false;
    }

    return true;
  });

  // 重置筛选
  const handleReset = () => {
    setSearchKeyword('');
    setUserIdFilter('');
    setDateFilterStart('');
    setDateFilterEnd('');
    setShowRealUserCommentsOnly({});
  };

  // 获取帖子的可见评论
  const getVisibleComments = (post: UserPost) => {
    if (showRealUserCommentsOnly[post.id]) {
      return post.comments.filter((c) => c.isRealUser);
    }
    return post.comments;
  };

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
        {/* 搜索和筛选行 */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* 搜索帖子内容 */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索帖子内容(1-20个字符)"
              maxLength={20}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
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
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <Button onClick={handleReset} variant="outline" size="sm">
            <RefreshCw className="w-3 h-3 mr-1" />
            重置
          </Button>
        </div>

        {/* 搜索结果统计 */}
        {searchKeyword.trim() && (
          <div className="text-sm text-gray-600">
            共找到 {filteredPosts.length} 个帖子
          </div>
        )}
      </div>

      {/* 帖子列表表格 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-32">帖子ID</TableHead>
                  <TableHead className="w-24">用户</TableHead>
                  <TableHead className="w-48">标题</TableHead>
                  <TableHead className="min-w-[300px]">帖子内容</TableHead>
                  <TableHead className="w-24">图片</TableHead>
                  <TableHead className="w-32">发布时间</TableHead>
                  <TableHead className="w-20">点赞数</TableHead>
                  <TableHead className="w-20">评论数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-gray-500">
                      {searchKeyword.trim() || userIdFilter.trim() || dateFilterStart || dateFilterEnd
                        ? '当前筛选条件下无匹配结果，请调整筛选条件'
                        : '暂无用户帖子'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map((post) => {
                    const visibleComments = getVisibleComments(post);
                    return (
                      <React.Fragment key={post.id}>
                        <TableRow className="hover:bg-gray-50">
                          {/* 展开按钮 */}
                          <TableCell>
                            {post.comments.length > 0 && (
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

                          {/* 帖子ID */}
                          <TableCell>
                            <div className="text-xs text-gray-600 font-mono">{post.id}</div>
                          </TableCell>

                          {/* 用户信息 */}
                          <TableCell>
                            <button className="flex items-center gap-2 hover:bg-blue-50 rounded px-2 py-1 transition-colors">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {post.userAvatar ? (
                                  <img
                                    src={post.userAvatar}
                                    alt={post.userName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div className="text-xs text-left">
                                <div className="font-medium text-gray-900">{post.userName}</div>
                                <div className="text-gray-500 font-mono">{post.userId}</div>
                              </div>
                            </button>
                          </TableCell>

                          {/* 标题 */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900">
                                {post.title}
                              </div>
                              {post.isDeleted && (
                                <span className="text-xs text-red-500">已删除</span>
                              )}
                            </div>
                          </TableCell>

                          {/* 帖子内容 */}
                          <TableCell>
                            <div className="text-sm text-gray-700">
                              {searchKeyword.trim()
                                ? highlightKeyword(
                                    post.content.length > 100
                                      ? post.content.substring(0, 100) + '...'
                                      : post.content,
                                    searchKeyword
                                  )
                                : post.content.length > 100
                                ? post.content.substring(0, 100) + '...'
                                : post.content}
                            </div>
                          </TableCell>

                          {/* 图片 */}
                          <TableCell>
                            {post.images && post.images.length > 0 ? (
                              <div className="flex gap-1 flex-wrap">
                                {post.images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`图片${idx + 1}`}
                                    className="w-12 h-12 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(img, '_blank')}
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </TableCell>

                          {/* 发布时间 */}
                          <TableCell>
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {post.publishTime}
                            </div>
                          </TableCell>

                          {/* 点赞数 */}
                          <TableCell>
                            <div className="text-sm text-gray-700 font-medium flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {post.likeCount}
                            </div>
                          </TableCell>

                          {/* 评论数 */}
                          <TableCell>
                            <div className="text-sm text-gray-700 font-medium flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {post.commentCount}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* 展开的评论区域 */}
                        {expandedRows.has(post.id) && post.comments.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-gray-50">
                              <div className="py-4 px-8 space-y-3">
                                {/* 评论筛选控制 */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <MessageCircle className="w-4 h-4" />
                                    评论 (
                                    {showRealUserCommentsOnly[post.id]
                                      ? `真人 ${visibleComments.length}`
                                      : `全部 ${post.comments.length}`}
                                    )
                                  </div>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={showRealUserCommentsOnly[post.id] || false}
                                      onChange={() => toggleRealUserComments(post.id)}
                                      className="w-4 h-4 rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-600">仅显示真人评论</span>
                                  </label>
                                </div>

                                {/* 评论列表 */}
                                {visibleComments.length === 0 ? (
                                  <div className="text-center py-6 text-sm text-gray-500">
                                    暂无真人评论
                                  </div>
                                ) : (
                                  visibleComments.map((comment) => (
                                    <div
                                      key={comment.id}
                                      className="flex gap-3 bg-white p-3 rounded-lg border border-gray-200"
                                    >
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {comment.userAvatar ? (
                                          <img
                                            src={comment.userAvatar}
                                            alt={comment.userName}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <User className="w-4 h-4 text-white" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-sm font-medium">
                                            {comment.userName}
                                          </span>
                                          <span className="text-xs text-gray-500 font-mono">
                                            {comment.userId}
                                          </span>
                                          {comment.isAI ? (
                                            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                                              AI
                                            </span>
                                          ) : (
                                            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                              真人
                                            </span>
                                          )}
                                          <span className="text-xs text-gray-500">
                                            {comment.publishTime}
                                          </span>
                                        </div>
                                        <div className="text-sm text-gray-700 mb-1">
                                          {searchKeyword.trim()
                                            ? highlightKeyword(comment.content, searchKeyword)
                                            : comment.content}
                                        </div>
                                        {comment.images && comment.images.length > 0 && (
                                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                            {comment.images.map((img, idx) => (
                                              <img
                                                key={idx}
                                                src={img}
                                                alt={`评论图片${idx + 1}`}
                                                className="w-14 h-14 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() => window.open(img, '_blank')}
                                              />
                                            ))}
                                          </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                          <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <ThumbsUp className="w-3 h-3" />
                                            {comment.likeCount} 赞
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
    </div>
  );
}