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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Check, X, RefreshCw, ExternalLink, AlertCircle, History, Filter } from 'lucide-react';

interface ModerationItem {
  id: string;
  type: 'post' | 'comment';
  authorName: string;
  authorId: string;
  title?: string; // 标题（仅帖子）
  content: string;
  previewImage?: string;
  images?: string[]; // 所有图片
  submitTime: string;
  parentPostId?: string; // 评论关联的帖子ID
  commentLevel?: number; // 评论层级
  editNote?: string; // 编辑说明（重新提交审核时）
  rejectReasons?: string[]; // 之前的拦截原因（重新提交审核时）
}

interface EditHistory {
  editTime: string;
  originalContent: string;
  editedContent: string;
  editNote: string;
  title?: string; // 标题（仅帖子）
  images?: string[]; // 图片（仅帖子）
}

interface ModerationRecord extends ModerationItem {
  reviewTime: string; // 审核时间
  reviewResult: 'approved' | 'rejected'; // 审核结果
  rejectReasons?: string[]; // 拦截原因
  reviewer?: string; // 审核人
  editHistory?: EditHistory[]; // 编辑历史
}

interface ModerationPanelProps {
  type: 'post' | 'comment';
}

const REJECT_REASONS = [
  'A含有广告内容',
  'B含有色情内容',
  'C辱骂他人/引战',
  'D含有违法犯罪内容',
  'E欺诈风险',
  'F含有低俗内容',
  'G含有侵权内容',
  'H含有医疗违规内容',
  'I含有不良健康信息',
];

export function ModerationPanel({ type }: ModerationPanelProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'approved' | 'rejected'>('all');
  const [records, setRecords] = useState<ModerationRecord[]>(() => {
    // 初始化一些编辑记录示例
    if (type === 'post') {
      return [
        {
          id: 'edit-post-1',
          type: 'post',
          authorName: '养生爱好者',
          authorId: 'user-201',
          title: '春季养生小贴士分享',
          content: '春季养生小贴士：多喝水、早睡早起、适量运动。欢迎大家一起交流健康养生经验！',
          images: ['https://source.unsplash.com/400x300/?spring,health&sig=e1'],
          submitTime: '2026-04-12 10:15',
          reviewTime: '2026-04-12 14:20',
          reviewResult: 'rejected',
          reviewer: '审核员A',
          rejectReasons: ['A含有广告内容'],
          editHistory: [
            {
              editTime: '2026-04-12 14:20',
              originalContent: '春季养生小贴士：多喝水、早睡早起、适量运动。需要养生产品的加我微信XXX。',
              editedContent: '春季养生小贴士：多喝水、早睡早起、适量运动。欢迎大家一起交流健康养生经验！',
              editNote: '用户删除了广告内容后重新提交',
              title: '春季养生小贴士分享',
              images: ['https://source.unsplash.com/400x300/?spring,health&sig=e1'],
            },
          ],
        },
        {
          id: 'edit-post-2',
          type: 'post',
          authorName: '中医学徒',
          authorId: 'user-202',
          title: '山药薏米粥的食疗功效',
          content: '分享一个食疗方子：山药薏米粥，健脾养胃。做法很简单，适合日常食用。',
          images: [
            'https://source.unsplash.com/400x300/?food,healthy&sig=e2',
            'https://source.unsplash.com/400x300/?porridge&sig=e3',
          ],
          submitTime: '2026-04-11 16:30',
          reviewTime: '2026-04-11 20:45',
          reviewResult: 'rejected',
          reviewer: '审核员B',
          rejectReasons: ['H含有医疗违规内容'],
          editHistory: [
            {
              editTime: '2026-04-11 20:45',
              originalContent: '分享一个食疗方子：山药薏米粥，健脾养胃，包治百病！',
              editedContent: '分享一个食疗方子：山药薏米粥，健脾养胃。做法很简单，适合日常食用。',
              editNote: '用户修改了"包治百病"等夸大宣传内容',
              title: '山药薏米粥的食疗功效',
              images: [
                'https://source.unsplash.com/400x300/?food,healthy&sig=e2',
                'https://source.unsplash.com/400x300/?porridge&sig=e3',
              ],
            },
          ],
        },
        {
          id: 'edit-post-3',
          type: 'post',
          authorName: '健康博主',
          authorId: 'user-203',
          title: '夏季消暑良方推荐',
          content: '夏季消暑良方：绿豆汤。简单易做，清热解暑，推荐给大家。',
          images: ['https://source.unsplash.com/400x300/?drink,green&sig=e4'],
          submitTime: '2026-04-10 09:20',
          reviewTime: '2026-04-10 11:50',
          reviewResult: 'rejected',
          reviewer: '审核员C',
          rejectReasons: ['C辱骂他人/引战'],
          editHistory: [
            {
              editTime: '2026-04-10 11:50',
              originalContent: '夏季消暑良方：绿豆汤。那些说绿豆汤没用的人根本不懂养生！',
              editedContent: '夏季消暑良方：绿豆汤。简单易做，清热解暑，推荐给大家。',
              editNote: '用户删除了引战内容',
              title: '夏季消暑良方推荐',
              images: ['https://source.unsplash.com/400x300/?drink,green&sig=e4'],
            },
          ],
        },
        {
          id: 'edit-post-4',
          type: 'post',
          authorName: '养生达人小王',
          authorId: 'user-204',
          title: '每天快走30分钟的运动心得',
          content: '分享我的运动心得：每天坚持快走30分钟，对身体很有帮助。',
          images: [
            'https://source.unsplash.com/400x300/?walking,exercise&sig=e5',
            'https://source.unsplash.com/400x300/?park,outdoor&sig=e6',
          ],
          submitTime: '2026-04-09 15:40',
          reviewTime: '2026-04-09 18:30',
          reviewResult: 'rejected',
          reviewer: '审核员A',
          rejectReasons: ['A含有广告内容'],
          editHistory: [
            {
              editTime: '2026-04-09 18:30',
              originalContent: '分享我的运动心得：每天坚持快走30分钟。我用的XX品牌运动鞋特别好，推荐购买链接在这里...',
              editedContent: '分享我的运动心得：每天坚持快走30分钟，配合合理饮食效果更佳。',
              editNote: '用户删除了产品推广链接',
              title: '每天快走30分钟的运动心得',
              images: [
                'https://source.unsplash.com/400x300/?walking,exercise&sig=e5',
                'https://source.unsplash.com/400x300/?park,outdoor&sig=e6',
              ],
            },
            {
              editTime: '2026-04-09 19:15',
              originalContent: '分享我的运动心得：每天坚持快走30分钟，配合合理饮食效果更佳。',
              editedContent: '分享我的运动心得：每天坚持快走30分钟，对身体很有帮助。',
              editNote: '用户进一步精简内容',
              title: '每天快走30分钟的运动心得',
              images: [
                'https://source.unsplash.com/400x300/?walking,exercise&sig=e5',
                'https://source.unsplash.com/400x300/?park,outdoor&sig=e6',
              ],
            },
          ],
        },
        {
          id: 'edit-post-5',
          type: 'post',
          authorName: '传统医学爱好者',
          authorId: 'user-205',
          title: '合谷穴按摩缓解头痛的方法',
          content: '荐一个穴位按摩方法：按压合谷穴可以缓解头痛，每次3-5分钟即可。',
          images: ['https://source.unsplash.com/400x300/?hands,massage&sig=e7'],
          submitTime: '2026-04-08 13:25',
          reviewTime: '2026-04-08 16:40',
          reviewResult: 'rejected',
          reviewer: '审核员B',
          rejectReasons: ['H含有医疗违规内容'],
          editHistory: [
            {
              editTime: '2026-04-08 16:40',
              originalContent: '独家秘方！按压合谷穴可治愈所有头痛，立即见效！还能治疗高血压、糖尿病等各种疾病！',
              editedContent: '推荐一个穴位按摩方法：按压合谷穴可以缓解头痛，每次3-5分钟即可。',
              editNote: '用户修改了夸大疗效的描述',
              title: '合谷穴按摩缓解头痛的方法',
              images: ['https://source.unsplash.com/400x300/?hands,massage&sig=e7'],
            },
          ],
        },
        {
          id: 'edit-post-6',
          type: 'post',
          authorName: '养生博主小李',
          authorId: 'user-206',
          title: '红枣枸杞茶的养生功效',
          content: '分享一个简单的食疗方：红枣枸杞茶，补气养血，适合日常饮用。',
          images: [
            'https://source.unsplash.com/400x300/?tea,health&sig=e8',
            'https://source.unsplash.com/400x300/?reddate&sig=e9',
          ],
          submitTime: '2026-04-07 10:30',
          reviewTime: '2026-04-07 14:15',
          reviewResult: 'rejected',
          reviewer: '审核员C',
          rejectReasons: ['A含有广告内容', 'H含有医疗违规内容'],
          editHistory: [
            {
              editTime: '2026-04-07 14:15',
              originalContent: '独家养生秘方！红枣枸杞茶包治百病，美白养颜抗衰老！购买链接：XXX旗舰店，现在下单立减50元！',
              editedContent: '分享一个食疗方：红枣枸杞茶，能治疗贫血、失眠等问题，美白养颜抗衰老！',
              editNote: '用户删除了广告链接',
              title: '红枣枸杞茶的养生功效',
              images: [
                'https://source.unsplash.com/400x300/?tea,health&sig=e8',
                'https://source.unsplash.com/400x300/?reddate&sig=e9',
              ],
            },
            {
              editTime: '2026-04-07 16:20',
              originalContent: '分享一个食疗方：红枣枸杞茶，能治疗贫血、失眠等问题，美白养颜抗衰老！',
              editedContent: '分享一个食疗方：红枣枸杞茶，补气养血，改善气色，适合日常饮用。',
              editNote: '用户修改了"包治百病"等夸大描述',
              title: '红枣枸杞茶的养生功效',
              images: [
                'https://source.unsplash.com/400x300/?tea,health&sig=e8',
                'https://source.unsplash.com/400x300/?reddate&sig=e9',
              ],
            },
            {
              editTime: '2026-04-07 18:45',
              originalContent: '分享一个食疗方：红枣枸杞茶，补气养血，改善气色，适合日常饮用。',
              editedContent: '分享一个简单的食疗方：红枣枸杞茶，补气养血，适合日常饮用。',
              editNote: '用户进一步精简表述',
              title: '红枣枸杞茶的养生功效',
              images: [
                'https://source.unsplash.com/400x300/?tea,health&sig=e8',
                'https://source.unsplash.com/400x300/?reddate&sig=e9',
              ],
            },
          ],
        },
      ];
    } else {
      return [
        {
          id: 'edit-comment-1',
          type: 'comment',
          authorName: '健康追求者',
          authorId: 'user-301',
          content: '这个方法我试过，确实有效果！感谢分享',
          submitTime: '2026-04-12 11:20',
          reviewTime: '2026-04-12 15:30',
          reviewResult: 'rejected',
          reviewer: '审核员A',
          parentPostId: 'post-888',
          commentLevel: 1,
          rejectReasons: ['A含有广告内容'],
          editHistory: [
            {
              editTime: '2026-04-12 15:30',
              originalContent: '这个方法我试过，确实有效果！想了解更多可以加我V信',
              editedContent: '这个方法我试过，确实有效果！感谢分享',
              editNote: '用户删除了联系方式后重新提交',
            },
          ],
        },
        {
          id: 'edit-comment-2',
          type: 'comment',
          authorName: '养生小白',
          authorId: 'user-302',
          content: '很实用的方法，我也要试试看！',
          submitTime: '2026-04-11 14:15',
          reviewTime: '2026-04-11 17:20',
          reviewResult: 'rejected',
          reviewer: '审核员B',
          parentPostId: 'post-889',
          commentLevel: 1,
          rejectReasons: ['A含有广告内容'],
          editHistory: [
            {
              editTime: '2026-04-11 17:20',
              originalContent: '很实用的方法！我买了XX品牌的养生产品配合使用，效果更好，需要的私信我',
              editedContent: '很实用的方法，我也要试试看！',
              editNote: '用户删除了产品推广内容',
            },
          ],
        },
        {
          id: 'edit-comment-3',
          type: 'comment',
          authorName: '中医粉丝',
          authorId: 'user-303',
          content: '学习了，感谢楼主分享经验',
          submitTime: '2026-04-10 10:30',
          reviewTime: '2026-04-10 13:45',
          reviewResult: 'rejected',
          reviewer: '审核员C',
          parentPostId: 'post-890',
          commentLevel: 2,
          rejectReasons: ['C辱骂他人/引战'],
          editHistory: [
            {
              editTime: '2026-04-10 13:45',
              originalContent: '楼主说得对！那些质疑中医的人都是无知的',
              editedContent: '学习了，感谢楼主分享经验',
              editNote: '用户修改了攻击性言论',
            },
          ],
        },
        {
          id: 'edit-comment-4',
          type: 'comment',
          authorName: '新手学习中',
          authorId: 'user-304',
          content: '请问具体应该怎么操作呢？',
          submitTime: '2026-04-09 16:50',
          reviewTime: '2026-04-09 19:25',
          reviewResult: 'rejected',
          reviewer: '审核员A',
          parentPostId: 'post-891',
          commentLevel: 1,
          rejectReasons: ['A含有广告内容'],
          editHistory: [
            {
              editTime: '2026-04-09 19:25',
              originalContent: '请问具体应该怎么操作呢？我这里有详细教程，关注我的公众号XXX可以获取',
              editedContent: '请问具体应该怎么操作呢？',
              editNote: '用户删除了公众号引流信息',
            },
          ],
        },
        {
          id: 'edit-comment-5',
          type: 'comment',
          authorName: '认真学习',
          authorId: 'user-305',
          content: '非常有帮助，已收藏！期待更多分享',
          submitTime: '2026-04-08 12:10',
          reviewTime: '2026-04-08 14:55',
          reviewResult: 'rejected',
          reviewer: '审核员B',
          parentPostId: 'post-892',
          commentLevel: 2,
          rejectReasons: ['H含有医疗违规内容'],
          editHistory: [
            {
              editTime: '2026-04-08 14:55',
              originalContent: '太好了！我妈妈的癌症用这个方法治好了，比化疗强一万倍！',
              editedContent: '非常有帮助，已收藏！',
              editNote: '用户删除了虚假医疗宣传',
            },
            {
              editTime: '2026-04-08 15:30',
              originalContent: '非常有帮助，已收藏！',
              editedContent: '非常有帮助，已收藏！期待更多分享',
              editNote: '用户补充了感谢内容',
            },
          ],
        },
      ];
    }
  });

  // 根据类型生成不同的示例数据
  const [items, setItems] = useState<ModerationItem[]>(() => {
    if (type === 'post') {
      return [
        {
          id: 'mod-post-1',
          type: 'post',
          authorName: '健康小白',
          authorId: 'user-001',
          title: '养生产品推荐',
          content: '大家好，我最近发现一个特别好的养生产品，价格实惠效果好，有兴趣的可以加我微信了解详情...',
          images: [
            'https://source.unsplash.com/400x300/?product&sig=1',
            'https://source.unsplash.com/400x300/?supplement&sig=11',
            'https://source.unsplash.com/400x300/?bottle&sig=12',
          ],
          submitTime: '2026-04-13 14:30',
        },
        {
          id: 'mod-post-2',
          type: 'post',
          authorName: '养生达人',
          authorId: 'user-002',
          title: '春季养生心得分享',
          content: '春季养生要注意保暖，多喝温水，适当运动。今天分享一些我的养生心得，希望对大家有帮助。早睡早起身体好...',
          images: [
            'https://source.unsplash.com/400x300/?health&sig=2',
            'https://source.unsplash.com/400x300/?wellness&sig=21',
          ],
          submitTime: '2026-04-13 15:10',
        },
        {
          id: 'mod-post-3',
          type: 'post',
          authorName: '中医爱好者',
          authorId: 'user-003',
          title: '民间偏方包治百病',
          content: '分享一个民间偏方，包治百病！糖尿病、高血压、癌症都能治，纯天然无副作用，需要的联系我...',
          images: [
            'https://source.unsplash.com/400x300/?medicine&sig=3',
            'https://source.unsplash.com/400x300/?herbs&sig=31',
            'https://source.unsplash.com/400x300/?pills&sig=32',
            'https://source.unsplash.com/400x300/?treatment&sig=33',
          ],
          submitTime: '2026-04-13 16:20',
        },
        {
          id: 'mod-post-4',
          type: 'post',
          authorName: '养生博主小张',
          authorId: 'user-007',
          title: '红枣枸杞茶的功效',
          content: '分享红枣枸杞茶的做法，补气养血，改善气色，适合日常饮用。',
          images: [
            'https://source.unsplash.com/400x300/?tea,health&sig=7',
          ],
          submitTime: '2026-04-13 17:30',
          rejectReasons: ['A含有广告内容', 'H含有医疗违规内容'],
          editNote: '第1次编辑：删除了购买链接和"包治百病"等夸大描述',
        },
        {
          id: 'mod-post-5',
          type: 'post',
          authorName: '健康生活家',
          authorId: 'user-008',
          title: '运动养生经验分享',
          content: '每天坚持快走30分钟，配合合理饮食，对身体很有帮助。',
          images: [
            'https://source.unsplash.com/400x300/?walking&sig=8',
            'https://source.unsplash.com/400x300/?exercise&sig=9',
          ],
          submitTime: '2026-04-13 18:15',
          rejectReasons: ['A含有广告内容'],
          editNote: '第2次编辑：进一步删除了运动鞋品牌推广内容',
        },
        {
          id: 'mod-post-6',
          type: 'post',
          authorName: '中医学习者',
          authorId: 'user-009',
          title: '穴位按摩缓解头痛',
          content: '推荐按压合谷穴缓解头痛，每次3-5分钟，仅供参考，严重不适请就医。',
          images: [
            'https://source.unsplash.com/400x300/?massage&sig=10',
          ],
          submitTime: '2026-04-13 19:00',
          rejectReasons: ['H含有医疗违规内容'],
          editNote: '第1次编辑：删除了"治愈所有头痛""包治百病"等夸大宣传',
        },
      ];
    } else {
      return [
        {
          id: 'mod-comment-1',
          type: 'comment',
          authorName: '好奇宝宝',
          authorId: 'user-101',
          content: '楼主说得对，我也试过这个方法，效果确实不错！',
          submitTime: '2026-04-13 14:35',
          parentPostId: 'post-123',
          commentLevel: 1,
        },
        {
          id: 'mod-comment-2',
          type: 'comment',
          authorName: '推广小号',
          authorId: 'user-102',
          content: '想了解更多养生知识，关注我的公众号：养生大全，每天分享养生小技巧',
          submitTime: '2026-04-13 15:45',
          parentPostId: 'post-456',
          commentLevel: 1,
        },
        {
          id: 'mod-comment-3',
          type: 'comment',
          authorName: '热心网友',
          authorId: 'user-103',
          content: '谢谢分享，学到了！',
          submitTime: '2026-04-13 16:50',
          parentPostId: 'post-789',
          commentLevel: 2,
        },
        {
          id: 'mod-comment-4',
          type: 'comment',
          authorName: '水军账号',
          authorId: 'user-104',
          content: '我刚用了你说的方法，效果真的很好！太感谢了！',
          submitTime: '2026-04-13 17:20',
          parentPostId: 'post-456',
          commentLevel: 2,
        },
      ];
    }
  });

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [currentRejectId, setCurrentRejectId] = useState<string | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [customReason, setCustomReason] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ModerationRecord | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [editNote, setEditNote] = useState('');
  const [historyDetailOpen, setHistoryDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<ModerationRecord | null>(null);
  const [pendingHistoryOpen, setPendingHistoryOpen] = useState(false);
  const [pendingHistoryItem, setPendingHistoryItem] = useState<ModerationItem | null>(null);

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const handleApprove = (id: string) => {
    const item = items.find((item) => item.id === id);
    if (item) {
      // 添加到审核记录
      const record: ModerationRecord = {
        ...item,
        reviewTime: new Date().toLocaleString('zh-CN'),
        reviewResult: 'approved',
        reviewer: '当前审核员',
      };
      setRecords([record, ...records]);
    }
    // 通过审核，移除该项
    setItems(items.filter((item) => item.id !== id));
    alert('内容已通过审核，已发布至社区');
  };

  const handleBatchApprove = () => {
    if (selectedItems.size === 0) {
      alert('请先选择要通过的内容');
      return;
    }
    const count = selectedItems.size;
    // 添加到审核记录
    const newRecords = items
      .filter((item) => selectedItems.has(item.id))
      .map((item) => ({
        ...item,
        reviewTime: new Date().toLocaleString('zh-CN'),
        reviewResult: 'approved' as const,
        reviewer: '当前审核员',
      }));
    setRecords([...newRecords, ...records]);
    setItems(items.filter((item) => !selectedItems.has(item.id)));
    setSelectedItems(new Set());
    alert(`已批量通过 ${count} 条内容`);
  };

  const handleRejectClick = (id: string) => {
    setCurrentRejectId(id);
    setSelectedReasons([]);
    setCustomReason('');
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (currentRejectId) {
      const reasons = [...selectedReasons];
      if (customReason.trim()) {
        reasons.push(customReason.trim());
      }

      const item = items.find((item) => item.id === currentRejectId);
      if (item) {
        // 添加到审核记录
        const record: ModerationRecord = {
          ...item,
          reviewTime: new Date().toLocaleString('zh-CN'),
          reviewResult: 'rejected',
          rejectReasons: reasons,
          reviewer: '当前审核员',
        };
        setRecords([record, ...records]);
      }

      // 拦截内容，移除该项并记录原因
      setItems(items.filter((item) => item.id !== currentRejectId));
      console.log('拦截原因:', reasons);
      alert(`内容已拦截，原因：${reasons.join('、') || '未填写'}`);

      setRejectDialogOpen(false);
      setCurrentRejectId(null);
    }
  };

  const handleBatchReject = () => {
    if (selectedItems.size === 0) {
      alert('请先选择要拦截的内容');
      return;
    }
    if (confirm(`确定要批量拦截 ${selectedItems.size} 条内容吗？`)) {
      const count = selectedItems.size;
      // 添加到审核记录
      const newRecords = items
        .filter((item) => selectedItems.has(item.id))
        .map((item) => ({
          ...item,
          reviewTime: new Date().toLocaleString('zh-CN'),
          reviewResult: 'rejected' as const,
          rejectReasons: ['批量拦截'],
          reviewer: '当前审核员',
        }));
      setRecords([...newRecords, ...records]);
      setItems(items.filter((item) => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
      alert('批量拦截成功');
    }
  };

  const handleRefresh = () => {
    alert('队列已刷新');
  };

  const toggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleEditClick = (record: ModerationRecord) => {
    setEditingItem(record);
    setEditedContent(record.content);
    setEditNote('');
    setEditDialogOpen(true);
  };

  const handleConfirmEdit = () => {
    if (!editingItem || !editedContent.trim() || !editNote.trim()) {
      alert('请填写修改后的内容和编辑说明');
      return;
    }

    // 创建编辑历史记录
    const newEditHistory: EditHistory = {
      editTime: new Date().toLocaleString('zh-CN'),
      originalContent: editingItem.content,
      editedContent: editedContent,
      editNote: editNote,
      title: type === 'post' ? editingItem.title : undefined,
      images: type === 'post' ? editingItem.images : undefined,
    };

    // 更新审核记录（只添加编辑历史，状态保持为 rejected）
    setRecords((prev) =>
      prev.map((record) => {
        if (record.id === editingItem.id && record.reviewResult === 'rejected') {
          return {
            ...record,
            editHistory: [...(record.editHistory || []), newEditHistory],
          };
        }
        return record;
      })
    );

    // 将编辑后的内容重新加入待审核队列
    const newItem: ModerationItem = {
      ...editingItem,
      content: editedContent,
      submitTime: new Date().toLocaleString('zh-CN'),
      editNote: editNote,
      rejectReasons: editingItem.rejectReasons,
    };
    setItems([newItem, ...items]);

    setEditDialogOpen(false);
    setEditingItem(null);
    setEditedContent('');
    setEditNote('');

    alert('内容已编辑并返回待审核队列！');
  };


  const handleShowDetail = (record: ModerationRecord) => {
    setDetailRecord(record);
    setHistoryDetailOpen(true);
  };

  const handleShowPendingHistory = (item: ModerationItem) => {
    setPendingHistoryItem(item);
    setPendingHistoryOpen(true);
  };

  // 过滤审核记录
  const filteredRecords = records.filter((record) => {
    if (historyFilter === 'all') return true;
    return record.reviewResult === historyFilter;
  });

  return (
    <div className="space-y-4">
      {/* 标签页切换 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 inline-flex">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          待审核队列
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <History className="w-4 h-4" />
          审核记录 ({records.length})
        </button>
      </div>

      {activeTab === 'pending' ? (
        <>
          {/* 工具栏 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBatchApprove}
              disabled={selectedItems.size === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              批量通过 {selectedItems.size > 0 && `(${selectedItems.size})`}
            </Button>
            <Button
              onClick={handleBatchReject}
              disabled={selectedItems.size === 0}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              批量拦截
            </Button>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新队列
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            待审核：{items.length} 条 · 已选中：{selectedItems.size} 条
          </div>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <strong>审核说明：</strong>
          {type === 'post' && '此处仅审核用户自主发布的主贴，AI生成的帖子会直接跳过审核。'}
          {type === 'comment' && '此处仅审核用户发布的一级评论和二级评论，AI回复会直接跳过审核。'}
        </div>
      </div>

      {/* 审核列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={items.length > 0 && selectedItems.size === items.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </TableHead>
                <TableHead className="w-32">内容ID</TableHead>
                <TableHead className="w-40">发布者</TableHead>
                {type === 'post' && <TableHead className="w-48">标题</TableHead>}
                {type === 'comment' && <TableHead className="w-24">评论层级</TableHead>}
                <TableHead className="min-w-[300px]">内容预览</TableHead>
                <TableHead className="min-w-[200px]">图片</TableHead>
                <TableHead className="w-40">提交时间</TableHead>
                {type === 'post' && <TableHead className="w-32">拦截原因</TableHead>}
                {type === 'post' && <TableHead className="w-40">操作</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={type === 'post' ? 9 : 7} className="h-32 text-center text-gray-500">
                    暂无待审核内容
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-600">
                      {item.id}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{item.authorName}</div>
                        <div className="text-xs text-gray-500">{item.authorId}</div>
                      </div>
                    </TableCell>
                    {type === 'post' && (
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.title || '无标题'}
                        </div>
                      </TableCell>
                    )}
                    {type === 'comment' && (
                      <TableCell>
                        <span className="text-sm">
                          {item.commentLevel === 1 ? '一级评论' : '二级回复'}
                        </span>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="text-sm text-gray-700 line-clamp-2">
                        {type === 'post'
                          ? item.content.substring(0, 80)
                          : item.content.substring(0, 50)}
                        {item.content.length > (type === 'post' ? 80 : 50) && '...'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {type === 'post' && item.images && item.images.length > 0 ? (
                        <div className="flex flex-wrap gap-2 max-w-md">
                          {item.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt=""
                              className="w-20 h-20 object-cover rounded border border-gray-200"
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-700">{item.submitTime}</div>
                    </TableCell>
                    {type === 'post' && (
                      <>
                        <TableCell>
                          {item.rejectReasons && item.rejectReasons.length > 0 ? (
                            <button
                              onClick={() => handleShowPendingHistory(item)}
                              className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                              查看编辑历史
                            </button>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApprove(item.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              通过
                            </Button>
                            <Button
                              onClick={() => handleRejectClick(item.id)}
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              拦截
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 拦截理由对话框 */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拦截内容</DialogTitle>
            <DialogDescription>
              请选择或填写拦截原因
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">选择拦截原因（可多选）</label>
              <div className="space-y-2">
                {REJECT_REASONS.map((reason) => (
                  <label key={reason} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedReasons.includes(reason)}
                      onChange={() => toggleReason(reason)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">其他原因（可选）</label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="输入其他拦截原因..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleConfirmReject}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                确认拦截
              </Button>
              <Button
                onClick={() => setRejectDialogOpen(false)}
                variant="outline"
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑内容</DialogTitle>
            <DialogDescription>
              修改被拦截的内容，填写编辑说明后将返回待审核队列进行二次审核
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">原内容（已拦截）</label>
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-gray-700">
                {editingItem?.content}
              </div>
              {editingItem?.rejectReasons && editingItem.rejectReasons.length > 0 && (
                <div className="mt-2 text-xs text-red-600">
                  拦截原因：{editingItem.rejectReasons.join('、')}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">修改后的内容 *</label>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="输入修改后的内容..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">编辑说明 *</label>
              <input
                type="text"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="例如：删除了广告内容、修改了夸大宣传..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleConfirmEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                确认编辑并提交审核
              </Button>
              <Button
                onClick={() => {
                  setEditDialogOpen(false);
                  setEditingItem(null);
                  setEditedContent('');
                  setEditNote('');
                }}
                variant="outline"
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
        </>
      ) : (
        <>
          {/* 审核记录 */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">筛选：</span>
                <div className="inline-flex rounded-md border border-gray-300">
                  <button
                    onClick={() => setHistoryFilter('all')}
                    className={`px-3 py-1.5 text-sm ${
                      historyFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => setHistoryFilter('approved')}
                    className={`px-3 py-1.5 text-sm border-l border-gray-300 ${
                      historyFilter === 'approved'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    已通过
                  </button>
                  <button
                    onClick={() => setHistoryFilter('rejected')}
                    className={`px-3 py-1.5 text-sm border-l border-gray-300 ${
                      historyFilter === 'rejected'
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    已拦截
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                共 {records.length} 条审核记录 · 当前显示 {filteredRecords.length} 条
              </div>
            </div>
          </div>

          {/* 审核记录表格 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">内容ID</TableHead>
                    <TableHead className="w-40">发布者</TableHead>
                    {type === 'post' && <TableHead className="w-48">标题</TableHead>}
                    {type === 'comment' && <TableHead className="w-24">评论层级</TableHead>}
                    <TableHead className="min-w-[300px]">内容预览</TableHead>
                    <TableHead className="min-w-[200px]">图片</TableHead>
                    <TableHead className="w-32">提交时间</TableHead>
                    <TableHead className="w-32">审核时间</TableHead>
                    <TableHead className="w-24">审核结果</TableHead>
                    <TableHead className="w-32">拦截原因</TableHead>
                    {type === 'post' && <TableHead className="w-24">操作</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={type === 'post' ? 10 : 9} className="h-32 text-center text-gray-500">
                        暂无审核记录
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-xs text-gray-600">
                          {record.id}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{record.authorName}</div>
                            <div className="text-xs text-gray-500">{record.authorId}</div>
                          </div>
                        </TableCell>
                        {type === 'post' && (
                          <TableCell>
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">
                              {record.title || '无标题'}
                            </div>
                          </TableCell>
                        )}
                        {type === 'comment' && (
                          <TableCell>
                            <span className="text-sm">
                              {record.commentLevel === 1 ? '一级评论' : '二级回复'}
                            </span>
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="text-sm text-gray-700 line-clamp-2">
                            {type === 'post'
                              ? record.content.substring(0, 80)
                              : record.content.substring(0, 50)}
                            {record.content.length > (type === 'post' ? 80 : 50) && '...'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {type === 'post' && record.images && record.images.length > 0 ? (
                            <div className="flex flex-wrap gap-2 max-w-md">
                              {record.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt=""
                                  className="w-20 h-20 object-cover rounded border border-gray-200"
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-700">{record.submitTime}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-700">{record.reviewTime}</div>
                        </TableCell>
                        <TableCell>
                          {record.reviewResult === 'approved' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              <Check className="w-3 h-3" />
                              已通过
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                              <X className="w-3 h-3" />
                              已拦截
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.reviewResult === 'rejected' && record.rejectReasons && record.rejectReasons.length > 0 ? (
                            type === 'post' ? (
                              <button
                                onClick={() => handleShowDetail(record)}
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                              >
                                查看详情
                                {record.editHistory && record.editHistory.length > 0 && (
                                  <span className="ml-1">({record.editHistory.length}次编辑)</span>
                                )}
                              </button>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {record.rejectReasons.map((reason, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium"
                                  >
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            )
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </TableCell>
                        {type === 'post' && (
                          <TableCell>
                            {record.reviewResult === 'rejected' && (
                              <button
                                onClick={() => handleEditClick(record)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                              >
                                编辑后重审
                              </button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}

      {/* 待审核队列的编辑历史对话框 */}
      <Dialog open={pendingHistoryOpen} onOpenChange={setPendingHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑历史</DialogTitle>
          </DialogHeader>
          {pendingHistoryItem && (
            <div className="mt-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">编辑次数</TableHead>
                      {type === 'post' && <TableHead className="w-48">标题</TableHead>}
                      <TableHead className="min-w-[300px]">内容预览</TableHead>
                      {type === 'post' && <TableHead className="min-w-[200px]">图片</TableHead>}
                      <TableHead className="w-40">编辑时间</TableHead>
                      <TableHead className="min-w-[200px]">编辑说明</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell>
                        <span className="inline-flex items-center justify-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          第1次
                        </span>
                      </TableCell>
                      {type === 'post' && (
                        <TableCell>
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">
                            {pendingHistoryItem.title || '无标题'}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="text-sm text-gray-700 line-clamp-2">
                          {pendingHistoryItem.content.substring(0, 80)}
                          {pendingHistoryItem.content.length > 80 && '...'}
                        </div>
                      </TableCell>
                      {type === 'post' && (
                        <TableCell>
                          {pendingHistoryItem.images && pendingHistoryItem.images.length > 0 ? (
                            <div className="flex flex-wrap gap-2 max-w-md">
                              {pendingHistoryItem.images.map((img, imgIdx) => (
                                <img
                                  key={imgIdx}
                                  src={img}
                                  alt=""
                                  className="w-20 h-20 object-cover rounded border border-gray-200"
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="text-sm text-gray-700">{pendingHistoryItem.submitTime}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-700">
                          {pendingHistoryItem.editNote || '-'}
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 审核历史详情对话框 */}
      <Dialog open={historyDetailOpen} onOpenChange={setHistoryDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑历史</DialogTitle>
          </DialogHeader>
          {detailRecord && detailRecord.editHistory && detailRecord.editHistory.length > 0 && (
            <div className="mt-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">编辑次数</TableHead>
                      {type === 'post' && <TableHead className="w-48">标题</TableHead>}
                      <TableHead className="min-w-[300px]">内容预览</TableHead>
                      {type === 'post' && <TableHead className="min-w-[200px]">图片</TableHead>}
                      <TableHead className="w-40">编辑时间</TableHead>
                      <TableHead className="min-w-[200px]">编辑说明</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailRecord.editHistory.map((edit, idx) => (
                      <TableRow key={idx} className="hover:bg-gray-50">
                        <TableCell>
                          <span className="inline-flex items-center justify-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            第{idx + 1}次
                          </span>
                        </TableCell>
                        {type === 'post' && (
                          <TableCell>
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">
                              {edit.title || '无标题'}
                            </div>
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="text-sm text-gray-700 line-clamp-2">
                            {edit.editedContent.substring(0, 80)}
                            {edit.editedContent.length > 80 && '...'}
                          </div>
                        </TableCell>
                        {type === 'post' && (
                          <TableCell>
                            {edit.images && edit.images.length > 0 ? (
                              <div className="flex flex-wrap gap-2 max-w-md">
                                {edit.images.map((img, imgIdx) => (
                                  <img
                                    key={imgIdx}
                                    src={img}
                                    alt=""
                                    className="w-20 h-20 object-cover rounded border border-gray-200"
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="text-sm text-gray-700">{edit.editTime}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-700">
                            {edit.editNote}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}