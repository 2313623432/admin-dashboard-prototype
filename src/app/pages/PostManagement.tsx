import React, { useState, useEffect } from 'react';
import { PostManagementTable, PostData, Comment } from '../components/PostManagementTable';
import { GenerationConfigDialog, GenerationSettings } from '../components/GenerationConfigDialog';
import { CharacterManagementDialog } from '../components/CharacterManagementDialog';
import { ModerationPanel } from '../components/ModerationPanel';
import { UserPostsPanel, UserPost, UserComment } from '../components/UserPostsPanel';
import { ProductManagement, ConversationalProduct } from '../components/ProductManagement';
import { RegularProductManagement, RegularProduct } from '../components/RegularProductManagement';
import { LogisticsManagement } from '../components/LogisticsManagement';
import { getCharacters } from '../utils/characterStorage';
import { Sparkles, FileText, Shield, Users, ShoppingBag, Package, Truck, Loader2, CheckCircle, XCircle } from 'lucide-react';

// 标题模板
const TITLE_TEMPLATES = {
  '生活分享': [
    '今日小确幸',
    '生活随笔',
    '美好的一天',
    '周末时光',
    '简单的快乐',
  ],
  '知识分享': [
    '实用技巧分享',
    '今日所学',
    '读书笔记',
    '知识小课堂',
    '干货分享',
  ],
  '情感倾诉': [
    '心情随笔',
    '今日感悟',
    '内心独白',
    '情感小记',
    '心里话',
  ],
  '旅行游记': [
    '旅行日记',
    '周末出游',
    '风景打卡',
    '旅途见闻',
    '行走记录',
  ],
  '美食打卡': [
    '美食分享',
    '今日食记',
    '厨房实验',
    '美食推荐',
    '味蕾记忆',
  ],
  '工作日常': [
    '工作小记',
    '职场心得',
    '今日成就',
    '工作感悟',
    '项目记录',
  ],
};

// 内容模板
const CONTENT_TEMPLATES = {
  '生活分享': [
    '今天的阳光特别温暖，忍不住去公园走了一圈。生活中的小确幸就是这样简单又美好 ☀️',
    '周末在家整理了一下房间，看着干净整洁的空间，整个人都轻松了不少。断舍离真的很治愈～',
    '下班路上偶遇超美的晚霞，赶紧拍下来分享给你们！这样的天空太浪漫了 🌅',
  ],
  '知识分享': [
    '今天学到一个超实用的时间管理技巧：番茄工作法！25分钟专注+5分钟休息，效率提升了好多 📚',
    '分享一个理财小知识：先储蓄后消费！每月工资到账后先存下20%，剩下的再用于消费和日常开销 💰',
    '读书笔记：《刻意练习》告诉我们，真正的高手都是通过有目的的练习成长起来的。坚持很重要！',
  ],
  '情感倾诉': [
    '有时候觉得，能陪在身边的人，才是最重要的。珍惜眼前人吧 💕',
    '今天莫名有点emo，可能是太累了。给自己放个假，好好休息一下～',
    '突然意识到，成长就是慢慢学会与自己和解的过程。接纳不完美的自己 🌸',
  ],
  '旅行游记': [
    '周末去了趟古镇，古色古香的建筑、悠闲的生活节奏，暂时逃离城市的喧嚣真好 🏮',
    '海边日出太震撼了！早起完全值得，这一刻所有的疲惫都烟消云散 🌊',
    '第一次去爬山，虽然累但登顶那一刻真的超有成就感！风景绝美 ⛰️',
  ],
  '美食打卡': [
    '周末自己动手做了蛋糕，虽然卖相一般但味道不错！成就感满满 🎂',
    '发现了一家宝藏咖啡馆，拿铁做得超级好喝，环境也很舒服。已经决定常来了 ☕',
    '今天的晚餐：番茄炖牛腩！炖了两个小时，肉软烂入味，配米饭绝了 🍲',
  ],
  '工作日常': [
    '今天项目终于上线了！这段时间的加班都值了，看到成果的那一刻超有成就感 💼',
    '周会上分享了自己的工作经验，收到了leader的认可。继续加油！',
    '完成了一个挑战性很大的任务，虽然过程很难但收获了很多经验。成长就是这样一步步来的 📊',
  ],
};

// 评论模板
const COMMENT_TEMPLATES = [
  '说得太对了！深有同感 👍',
  '学到了，感谢分享！',
  '这个想法很棒，我也想试试',
  '哇，太赞了！',
  '好有道理啊',
  '确实是这样的',
  '我也有类似的经历',
  '感同身受',
];

const REPLY_TEMPLATES = [
  '哈哈，谢谢认可！',
  '一起加油！',
  '对的对的',
  '嗯嗯，是的',
  '可以试试看！',
  '谢谢支持～',
];

function generateRandomTitle(styleTypes: string[], customPrompt?: string): string {
  // 从多个风格中随机选择一个
  const selectedStyle = styleTypes[Math.floor(Math.random() * styleTypes.length)];

  if (selectedStyle === '自定义' && customPrompt) {
    return `${customPrompt}分享`;
  }
  const templates = TITLE_TEMPLATES[selectedStyle as keyof typeof TITLE_TEMPLATES] || TITLE_TEMPLATES['生活分享'];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateRandomContent(styleTypes: string[], customPrompt?: string): string {
  // 从多个风格中随机选择一个
  const selectedStyle = styleTypes[Math.floor(Math.random() * styleTypes.length)];

  if (selectedStyle === '自定义' && customPrompt) {
    return `分享一些关于${customPrompt}的心得体会，今天收获满满！`;
  }
  const templates = CONTENT_TEMPLATES[selectedStyle as keyof typeof CONTENT_TEMPLATES] || CONTENT_TEMPLATES['生活分享'];
  return templates[Math.floor(Math.random() * templates.length)];
}


function generateTimestamp(
  publishTime: string,
  scheduledTimeStart?: string,
  scheduledTimeEnd?: string
): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (publishTime === 'immediate') {
    const oneHourLater = new Date(now);
    oneHourLater.setHours(oneHourLater.getHours() + 1);
    return oneHourLater.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } else if (publishTime === 'scheduled' && scheduledTimeStart && scheduledTimeEnd) {
    const [startHour, startMinute] = scheduledTimeStart.split(':').map(Number);
    const [endHour, endMinute] = scheduledTimeEnd.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const randomMinutes =
      Math.floor(Math.random() * (endMinutes - startMinutes + 1)) + startMinutes;
    const hours = Math.floor(randomMinutes / 60);
    const minutes = randomMinutes % 60;
    tomorrow.setHours(hours, minutes, 0, 0);
    return tomorrow.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } else {
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    tomorrow.setHours(hours, minutes, 0, 0);
    return tomorrow.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

function generateComments(characters: any[], postTimestamp: string): Comment[] {
  const commentCount = Math.floor(Math.random() * 5) + 1; // 1-5条一级评论
  const comments: Comment[] = [];
  const shuffledChars = [...characters].sort(() => Math.random() - 0.5);

  for (let i = 0; i < Math.min(commentCount, shuffledChars.length); i++) {
    const char = shuffledChars[i];
    // 30% 概率生成用户评论
    const isUserComment = Math.random() < 0.3;

    const comment: Comment = {
      id: `comment-${Date.now()}-${i}`,
      authorName: isUserComment ? `用户${Math.floor(Math.random() * 1000)}` : char.nickname,
      authorAvatar: isUserComment
        ? `https://ui-avatars.com/api/?name=用户&background=FF6B6B&color=fff&size=200`
        : char.avatar,
      content: COMMENT_TEMPLATES[Math.floor(Math.random() * COMMENT_TEMPLATES.length)],
      timestamp: `${postTimestamp.split(' ')[0]} ${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      likeCount: Math.floor(Math.random() * 30),
      isUser: isUserComment,
      isAIBot: !isUserComment,
    };

    // 随机生成二级评论
    if (Math.random() > 0.5 && characters.length > 1) {
      const replyCount = Math.floor(Math.random() * 3) + 1; // 1-3条二级评论
      comment.replies = [];
      for (let j = 0; j < replyCount; j++) {
        const replyChar = characters[Math.floor(Math.random() * characters.length)];
        const isUserReply = Math.random() < 0.2; // 20% 概率是用户回复

        comment.replies.push({
          id: `reply-${Date.now()}-${i}-${j}`,
          authorName: isUserReply ? `用户${Math.floor(Math.random() * 1000)}` : replyChar.nickname,
          authorAvatar: isUserReply
            ? `https://ui-avatars.com/api/?name=用户&background=FF6B6B&color=fff&size=200`
            : replyChar.avatar,
          content: REPLY_TEMPLATES[Math.floor(Math.random() * REPLY_TEMPLATES.length)],
          timestamp: `${postTimestamp.split(' ')[0]} ${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          likeCount: Math.floor(Math.random() * 15),
          isUser: isUserReply,
          isAIBot: !isUserReply,
        });
      }
    }

    comments.push(comment);
  }

  return comments;
}

// 初始化示例角色
function initializeSampleCharacters() {
  const characters = getCharacters();
  if (characters.length === 0) {
    const sampleCharacters = [
      {
        nickname: '养生张',
        gender: '男',
        age: 45,
        identity: '中医养生专家',
        description: '从事中医养生20年，擅长食疗调理',
        setting: '从事中医养生20年，擅长食疗调理和传统养生理论',
        dialogExamples: [],
        avatar: 'https://ui-avatars.com/api/?name=养生张&background=4F46E5&color=fff&size=200',
      },
      {
        nickname: '本草李',
        gender: '女',
        age: 38,
        identity: '草本养生顾问',
        description: '精通各类草本植物养生',
        setting: '精通各类草本植物养生，倡导自然健康生活方式',
        dialogExamples: [],
        avatar: 'https://ui-avatars.com/api/?name=本草李&background=059669&color=fff&size=200',
      },
      {
        nickname: '经络王',
        gender: '男',
        age: 52,
        identity: '经络调养师',
        description: '30年经络按摩经验',
        setting: '30年经络按摩经验，擅长通过经络调理改善身体状况',
        dialogExamples: [],
        avatar: 'https://ui-avatars.com/api/?name=经络王&background=DC2626&color=fff&size=200',
      },
    ];

    sampleCharacters.forEach((char) => {
      const characters = getCharacters();
      const now = new Date().toISOString();
      const newCharacter = {
        ...char,
        id: `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
      };
      characters.push(newCharacter);
      localStorage.setItem('ai_post_characters', JSON.stringify(characters));
    });
  }
}

// 初始化示例帖子
function createSamplePosts(): PostData[] {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const timestamp = tomorrow.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const seed1 = Date.now();
  const seed2 = seed1 + 1000;
  const seed3 = seed1 + 2000;

  return [
    {
      id: 'sample-1',
      characterName: '养生张',
      characterAvatar: 'https://ui-avatars.com/api/?name=养生张&background=4F46E5&color=fff&size=200',
      title: '春季养肝茶配方分享',
      content: '春季养生重在养肝，推荐大家多吃些绿色蔬菜。今天分享一个简单的养肝茶配方：枸杞10g、菊花5g、决明子8g，开水冲泡，清肝明目效果很好！',
      images: [
        `https://source.unsplash.com/800x600/?healthy-food,tea&sig=${seed1}`,
        `https://source.unsplash.com/800x600/?herbs,wellness&sig=${seed1 + 100}`,
      ],
      timestamp,
      status: 'pending',
      category: '养生智慧',
      styleType: '知识分享',
      likeCount: 45,
      comments: [
        {
          id: 'c1',
          authorName: '本草李',
          authorAvatar: 'https://ui-avatars.com/api/?name=本草李&background=059669&color=fff&size=200',
          content: '张医生说得对！我也经常推荐这个配方给学员，效果确实不错 👍',
          timestamp: `${timestamp.split(' ')[0]} 14:30`,
          likeCount: 12,
          isAIBot: true,
          replies: [
            {
              id: 'r1',
              authorName: '养生张',
              authorAvatar: 'https://ui-avatars.com/api/?name=养生张&background=4F46E5&color=fff&size=200',
              content: '谢谢李老师认可！我们可以互相交流养生心得',
              timestamp: `${timestamp.split(' ')[0]} 14:45`,
              likeCount: 8,
              isAIBot: true,
            },
          ],
        },
        {
          id: 'c2',
          authorName: '经络王',
          authorAvatar: 'https://ui-avatars.com/api/?name=经络王&background=DC2626&color=fff&size=200',
          content: '配合按摩肝经效果会更好，我给客户调理时都是这样做的',
          timestamp: `${timestamp.split(' ')[0]} 15:20`,
          likeCount: 15,
          isAIBot: true,
        },
      ],
    },
    {
      id: 'sample-2',
      characterName: '本草李',
      characterAvatar: 'https://ui-avatars.com/api/?name=本草李&background=059669&color=fff&size=200',
      title: '野生艾草采摘记',
      content: '今天在山里采到了新鲜的艾草，准备晒干后给大家做艾灸包。艾草有温经散寒的功效，特别适合春季调理身体 🌿',
      images: [`https://source.unsplash.com/800x600/?herbs,plants,nature&sig=${seed2}`],
      timestamp,
      status: 'published',
      category: '草本养生',
      styleType: '生活分享',
      likeCount: 67,
      comments: [
        {
          id: 'c3',
          authorName: '养生张',
          authorAvatar: 'https://ui-avatars.com/api/?name=养生张&background=4F46E5&color=fff&size=200',
          content: '李老师辛苦了！野生艾草药效确实更好',
          timestamp: `${timestamp.split(' ')[0]} 16:10`,
          likeCount: 6,
          isAIBot: true,
        },
        {
          id: 'c4',
          authorName: '健康用户123',
          authorAvatar: 'https://ui-avatars.com/api/?name=用户&background=FF6B6B&color=fff&size=200',
          content: '我也想要艾灸包，怎么购买呢？',
          timestamp: `${timestamp.split(' ')[0]} 17:20`,
          likeCount: 3,
          isUser: true,
          replies: [
            {
              id: 'r4',
              authorName: '本草李',
              authorAvatar: 'https://ui-avatars.com/api/?name=本草李&background=059669&color=fff&size=200',
              content: '已经私信您了，感谢支持！',
              timestamp: `${timestamp.split(' ')[0]} 17:35`,
              likeCount: 2,
              isAIBot: true,
            },
          ],
        },
      ],
    },
    {
      id: 'sample-3',
      characterName: '经络王',
      characterAvatar: 'https://ui-avatars.com/api/?name=经络王&background=DC2626&color=fff&size=200',
      title: '肩颈不适调理方法',
      content: '最近很多人问我肩颈不适怎么调理。其实每天按摩风池穴和肩井穴各5分钟，坚持一周就会有明显改善。大家可以试试看！',
      images: [`https://source.unsplash.com/800x600/?wellness,therapy,massage&sig=${seed3}`],
      timestamp,
      status: 'pending',
      category: '经络调养',
      styleType: '知识分享',
      likeCount: 38,
    },
  ];
}

// 初始化示例用户帖子
function createSampleUserPosts(): UserPost[] {
  return [
    {
      id: 'user-post-001',
      userId: 'U10001',
      userName: '健康达人小李',
      userAvatar: 'https://ui-avatars.com/api/?name=小李&background=FF6B6B&color=fff&size=200',
      title: '晨跑一个月的改变',
      content: '最近发现早起晨跑对身体真的很有帮助，坚持了一个月，感觉精神状态好多了！推荐大家试试，早睡早起身体好 🏃‍♂️',
      images: [
        'https://images.unsplash.com/photo-1773681823208-7f3657c0688f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      ],
      publishTime: '2026-04-29 08:30',
      likeCount: 156,
      commentCount: 8,
      comments: [
        {
          id: 'uc-001-1',
          postId: 'user-post-001',
          userId: 'U10023',
          userName: '晨练爱好者',
          userAvatar: 'https://ui-avatars.com/api/?name=晨练&background=4CAF50&color=fff&size=200',
          content: '我也是！早起跑步已经成为习惯了，一天不跑都觉得不舒服',
          publishTime: '2026-04-29 09:15',
          likeCount: 23,
          isAI: false,
          isRealUser: true,
        },
        {
          id: 'uc-001-2',
          postId: 'user-post-001',
          userId: 'AI-BOT-001',
          userName: '养生张',
          userAvatar: 'https://ui-avatars.com/api/?name=养生张&background=4F46E5&color=fff&size=200',
          content: '说得对！晨跑确实是很好的养生习惯。建议跑前做好热身，跑后记得拉伸哦 💪',
          publishTime: '2026-04-29 09:30',
          likeCount: 45,
          isAI: true,
          isRealUser: false,
        },
        {
          id: 'uc-001-3',
          postId: 'user-post-001',
          userId: 'U10045',
          userName: '上班族小王',
          userAvatar: 'https://ui-avatars.com/api/?name=小王&background=2196F3&color=fff&size=200',
          content: '好想试试，但是早上真的起不来啊😭',
          publishTime: '2026-04-29 10:20',
          likeCount: 12,
          isAI: false,
          isRealUser: true,
        },
        {
          id: 'uc-001-4',
          postId: 'user-post-001',
          userId: 'AI-BOT-002',
          userName: '经络王',
          userAvatar: 'https://ui-avatars.com/api/?name=经络王&background=DC2626&color=fff&size=200',
          content: '可以试试睡前按摩涌泉穴，有助于早起。配合晨跑效果更好！',
          publishTime: '2026-04-29 11:05',
          likeCount: 34,
          isAI: true,
          isRealUser: false,
        },
      ],
    },
    {
      id: 'user-post-002',
      userId: 'U10012',
      userName: '养生小白',
      userAvatar: 'https://ui-avatars.com/api/?name=小白&background=9C27B0&color=fff&size=200',
      title: '菊花茶降火效果如何？',
      content: '请问大家喝菊花茶真的能降火吗？我最近上火很严重，想试试看',
      images: [
        'https://images.unsplash.com/photo-1504382103100-db7e92322d39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      ],
      publishTime: '2026-04-29 14:20',
      likeCount: 89,
      commentCount: 12,
      comments: [
        {
          id: 'uc-002-1',
          postId: 'user-post-002',
          userId: 'AI-BOT-003',
          userName: '本草李',
          userAvatar: 'https://ui-avatars.com/api/?name=本草李&background=059669&color=fff&size=200',
          content: '菊花茶确实有清热降火的功效！建议加点枸杞一起泡，效果更好。每天1-2杯即可，不要过量哦 🌼',
          publishTime: '2026-04-29 14:35',
          likeCount: 67,
          isAI: true,
          isRealUser: false,
        },
        {
          id: 'uc-002-2',
          postId: 'user-post-002',
          userId: 'U10034',
          userName: '茶艺师小陈',
          userAvatar: 'https://ui-avatars.com/api/?name=小陈&background=FF9800&color=fff&size=200',
          content: '可以的！我经常喝，效果不错。记得选杭白菊或者贡菊',
          publishTime: '2026-04-29 14:50',
          likeCount: 28,
          isAI: false,
          isRealUser: true,
        },
        {
          id: 'uc-002-3',
          postId: 'user-post-002',
          userId: 'U10056',
          userName: '健康生活家',
          userAvatar: 'https://ui-avatars.com/api/?name=健康&background=00BCD4&color=fff&size=200',
          content: '我也在喝！配合多吃蔬菜水果，少吃辛辣，效果会更明显',
          publishTime: '2026-04-29 15:10',
          likeCount: 19,
          isAI: false,
          isRealUser: true,
        },
      ],
    },
    {
      id: 'user-post-003',
      userId: 'U10078',
      userName: '养生达人刘姐',
      userAvatar: 'https://ui-avatars.com/api/?name=刘姐&background=E91E63&color=fff&size=200',
      title: '红枣银耳汤食疗方分享',
      content: '分享一个我自己的食疗方子：红枣银耳汤，养颜又润肺！做法很简单：银耳泡发后撕小块，加红枣、冰糖，炖1小时就好了。女生一定要多喝！',
      images: [
        'https://images.unsplash.com/photo-1615444432044-413ff198ba73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      ],
      publishTime: '2026-04-28 19:45',
      likeCount: 234,
      commentCount: 15,
      isDeleted: true,
      comments: [
        {
          id: 'uc-003-1',
          postId: 'user-post-003',
          userId: 'U10089',
          userName: '美食爱好者',
          userAvatar: 'https://ui-avatars.com/api/?name=美食&background=795548&color=fff&size=200',
          content: '马克！明天就试试，感谢分享 ❤️',
          images: [
            'https://images.unsplash.com/photo-1504382103100-db7e92322d39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300',
          ],
          publishTime: '2026-04-28 20:10',
          likeCount: 45,
          isAI: false,
          isRealUser: true,
        },
        {
          id: 'uc-003-2',
          postId: 'user-post-003',
          userId: 'AI-BOT-001',
          userName: '养生张',
          userAvatar: 'https://ui-avatars.com/api/?name=养生张&background=4F46E5&color=fff&size=200',
          content: '很好的食疗方！银耳富含胶质，红枣补气血，这个组合特别适合秋冬季节。也可以加点莲子，效果更佳 👍',
          publishTime: '2026-04-28 20:30',
          likeCount: 78,
          isAI: true,
          isRealUser: false,
        },
      ],
    },
    {
      id: 'user-post-004',
      userId: 'U10123',
      userName: '办公室白领小张',
      userAvatar: 'https://ui-avatars.com/api/?name=小张&background=607D8B&color=fff&size=200',
      title: '久坐族颈椎保护攻略',
      content: '久坐族必看！我发现每天下午3点左右做10分钟颈椎操，真的能缓解脖子酸痛。大家一定要重视颈椎健康啊！',
      images: [
        'https://images.unsplash.com/photo-1713947505684-25b9bf8d544f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      ],
      publishTime: '2026-04-28 16:20',
      likeCount: 178,
      commentCount: 10,
      comments: [
        {
          id: 'uc-004-1',
          postId: 'user-post-004',
          userId: 'U10134',
          userName: '程序员小李',
          userAvatar: 'https://ui-avatars.com/api/?name=程序员&background=3F51B5&color=fff&size=200',
          content: '太需要了！每天对着电脑，脖子僵硬得不行',
          publishTime: '2026-04-28 16:45',
          likeCount: 34,
          isAI: false,
          isRealUser: true,
        },
        {
          id: 'uc-004-2',
          postId: 'user-post-004',
          userId: 'AI-BOT-002',
          userName: '经络王',
          userAvatar: 'https://ui-avatars.com/api/?name=经络王&background=DC2626&color=fff&size=200',
          content: '说得好！建议配合按摩风池穴和肩井穴，每次按5分钟，效果会更明显。长期坚持能有效预防颈椎病 💪',
          publishTime: '2026-04-28 17:00',
          likeCount: 89,
          isAI: true,
          isRealUser: false,
        },
        {
          id: 'uc-004-3',
          postId: 'user-post-004',
          userId: 'U10167',
          userName: '瑜伽老师Amy',
          userAvatar: 'https://ui-avatars.com/api/?name=Amy&background=8BC34A&color=fff&size=200',
          content: '可以试试猫式伸展，对缓解颈椎也很有帮助！',
          publishTime: '2026-04-28 17:30',
          likeCount: 23,
          isAI: false,
          isRealUser: true,
        },
      ],
    },
    {
      id: 'user-post-005',
      userId: 'U10198',
      userName: '中医爱好者老王',
      userAvatar: 'https://ui-avatars.com/api/?name=老王&background=FF5722&color=fff&size=200',
      title: '拔罐学习心得分享',
      content: '今天去学习了拔罐，原来拔罐也有这么多讲究！不同位置对应不同的调理效果，受益匪浅。有机会大家可以去正规的地方体验一下。',
      publishTime: '2026-04-27 21:15',
      likeCount: 145,
      commentCount: 7,
      comments: [
        {
          id: 'uc-005-1',
          postId: 'user-post-005',
          userId: 'U10201',
          userName: '养生新手',
          userAvatar: 'https://ui-avatars.com/api/?name=新手&background=CDDC39&color=333&size=200',
          content: '拔罐会不会很痛啊？一直想试但有点怕',
          publishTime: '2026-04-27 21:40',
          likeCount: 15,
          isAI: false,
          isRealUser: true,
        },
        {
          id: 'uc-005-2',
          postId: 'user-post-005',
          userId: 'AI-BOT-002',
          userName: '经络王',
          userAvatar: 'https://ui-avatars.com/api/?name=经络王&background=DC2626&color=fff&size=200',
          content: '拔罐一般不会很痛，就是有点紧绷感。建议第一次找专业的中医师操作，他们会根据你的体质调整力度 😊',
          publishTime: '2026-04-27 22:00',
          likeCount: 56,
          isAI: true,
          isRealUser: false,
        },
      ],
    },
  ];
}

// 初始化示例商品
function createSampleProducts(): ConversationalProduct[] {
  const seed1 = Date.now();
  return [
    {
      id: 'product-001',
      name: '养生茶礼盒',
      keywords: ['养生', '茶', '健康', '调理'],
      image: `https://source.unsplash.com/400x400/?tea,herbal&sig=${seed1}`,
      description: '天然草本配方，调理身心健康',
      jumpType: 'link',
      jumpLink: 'https://example.com/products/tea-gift-box',
      jumpSceneDescription: '跳转到养生茶礼盒商品详情页',
      points: 1000,
      stock: 100,
      status: 'enabled',
      createdAt: '2026-04-25 10:30',
      stats: {
        impressions: 1256,
        clicks: 89,
        negativeFeedback: 5,
      },
    },
    {
      id: 'product-002',
      name: '经络按摩仪',
      keywords: ['按摩', '经络', '理疗', '肩颈'],
      image: `https://source.unsplash.com/400x400/?massage,therapy&sig=${seed1 + 1000}`,
      description: '模拟真人按摩手法，缓解肌肉疲劳',
      jumpType: 'qrcode',
      qrcodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://example.com/massage`,
      jumpSceneDescription: '扫码查看经络按摩仪使用教程',
      points: 2000,
      stock: 50,
      status: 'enabled',
      createdAt: '2026-04-24 14:20',
      stats: {
        impressions: 2134,
        clicks: 156,
        negativeFeedback: 12,
      },
    },
    {
      id: 'product-003',
      name: '艾灸养生套装',
      keywords: ['艾灸', '养生', '中医', '艾草'],
      image: `https://source.unsplash.com/400x400/?herbs,wellness&sig=${seed1 + 2000}`,
      description: '传统艾灸疗法，温经散寒效果好',
      jumpType: 'link',
      jumpLink: 'https://example.com/products/moxa-set',
      jumpSceneDescription: '跳转到艾灸套装详情页',
      points: 800,
      stock: 30,
      status: 'disabled',
      createdAt: '2026-04-23 09:15',
      stats: {
        impressions: 456,
        clicks: 23,
        negativeFeedback: 2,
      },
    },
    {
      id: 'product-004',
      name: '养生食疗手册',
      keywords: ['食疗', '营养', '健康饮食', '调理'],
      image: `https://source.unsplash.com/400x400/?healthy-food,nutrition&sig=${seed1 + 3000}`,
      description: '专业营养师编写，四季食养指南',
      jumpType: 'none',
      points: 500,
      stock: 999999,
      status: 'enabled',
      createdAt: '2026-04-22 16:45',
      stats: {
        impressions: 3421,
        clicks: 234,
        negativeFeedback: 8,
      },
    },
    {
      id: 'product-005',
      name: '中医体质检测',
      keywords: ['体质', '中医', '检测', '诊断'],
      image: `https://source.unsplash.com/400x400/?health,medical&sig=${seed1 + 4000}`,
      description: '在线体质评估，获取个性化调理方案',
      jumpType: 'qrcode',
      qrcodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://example.com/health-check`,
      jumpSceneDescription: '扫码进行中医体质在线检测',
      points: 0,
      stock: 999999,
      status: 'enabled',
      createdAt: '2026-04-21 11:30',
      stats: {
        impressions: 5678,
        clicks: 467,
        negativeFeedback: 15,
      },
    },
  ];
}

// 初始化示例普通商品
function createSampleRegularProducts(): RegularProduct[] {
  const seed = Date.now();
  return [
    {
      id: 'regular-001',
      name: '养生礼盒套装',
      image: `https://source.unsplash.com/400x400/?gift,health&sig=${seed}`,
      type: 'physical',
      points: 1000,
      stock: 50,
      status: 'online',
      exchangeLimit: 2,
      exchangedCount: 38,
      isPinned: true,
      description: '精选五谷杂粮、滋补品礼盒，送礼自用两相宜',
      createdAt: '2026-04-20 10:00',
    },
    {
      id: 'regular-002',
      name: '电子养生课程',
      image: `https://source.unsplash.com/400x400/?online,learning&sig=${seed + 1000}`,
      type: 'virtual',
      points: 500,
      stock: 999999,
      status: 'online',
      exchangeLimit: 1,
      exchangedCount: 127,
      description: '专业中医养生课程，包含四季养生、经络调理等内容',
      createdAt: '2026-04-19 14:30',
    },
    {
      id: 'regular-003',
      name: '按摩垫',
      image: `https://source.unsplash.com/400x400/?massage,pad&sig=${seed + 2000}`,
      type: 'physical',
      points: 800,
      stock: 0,
      status: 'offline',
      exchangeLimit: 0,
      exchangedCount: 12,
      description: '多功能按摩垫，缓解腰背疼痛',
      createdAt: '2026-04-18 09:15',
    },
    {
      id: 'regular-004',
      name: '养生茶包年卡',
      image: `https://source.unsplash.com/400x400/?tea,premium&sig=${seed + 3000}`,
      type: 'virtual',
      points: 2000,
      stock: 999999,
      status: 'online',
      exchangeLimit: 1,
      exchangedCount: 54,
      description: '每月配送养生茶包，全年12次',
      createdAt: '2026-04-17 16:20',
    },
  ];
}

export default function PostManagement() {
  const [posts, setPosts] = useState<PostData[]>(() => createSamplePosts());
  const [userPosts, setUserPosts] = useState<UserPost[]>(() => createSampleUserPosts());
  const [products, setProducts] = useState<ConversationalProduct[]>(() => createSampleProducts());
  const [regularProducts, setRegularProducts] = useState<RegularProduct[]>(() => createSampleRegularProducts());
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'moderation-posts' | 'moderation-comments' | 'user-posts' | 'products' | 'regular-products' | 'logistics'>('posts');
  const [productSubTab, setProductSubTab] = useState<'regular' | 'conversational'>('regular');
  const [generationProgress, setGenerationProgress] = useState({
    total: 10,
    generating: 0,
    success: 7,
    failed: 3,
  });
  const [showProgress, setShowProgress] = useState(true);

  // 初始化示例角色
  useEffect(() => {
    initializeSampleCharacters();
  }, []);

  // 生成图片的辅助函数 - 使用Unsplash Source API
  const generateImagesForContent = (
    styleTypes: string[],
    category: string,
    count: number
  ): string[] => {
    // 从多个风格中随机选择一个
    const selectedStyle = styleTypes[Math.floor(Math.random() * styleTypes.length)];

    // 根据风格类型生成搜索关键词
    const keywords: Record<string, string> = {
      '生活分享': 'lifestyle,wellness',
      '知识分享': 'books,learning',
      '情感倾诉': 'nature,peaceful',
      '旅行游记': 'travel,landscape',
      '美食打卡': 'food,cuisine',
      '工作日常': 'workspace,office',
      '养生智慧': 'meditation,health',
      '食养调理': 'healthy-food,nutrition',
      '草本养生': 'herbs,plants',
      '经络调养': 'wellness,therapy',
      '传统文化': 'culture,traditional',
    };

    // 优先使用分区对应的关键词，如果没有则使用风格关键词
    const keyword = keywords[category] || keywords[selectedStyle] || 'lifestyle';
    const images: string[] = [];

    // 使用Unsplash Source API生成不同的图片
    for (let i = 0; i < count; i++) {
      // 添加随机参数确保每次获取不同的图片
      const randomSeed = Date.now() + i + Math.random();
      images.push(`https://source.unsplash.com/800x600/?${keyword}&sig=${randomSeed}`);
    }

    return images;
  };

  // 处理编辑时的AI图片生成
  const handleGenerateImages = async (prompt: string): Promise<string[]> => {
    // 使用Unsplash Source API生成图片
    const images: string[] = [];
    for (let i = 0; i < 6; i++) {
      const randomSeed = Date.now() + i + Math.random();
      images.push(`https://source.unsplash.com/800x600/?${encodeURIComponent(prompt)}&sig=${randomSeed}`);
    }
    // 模拟API调用延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return images;
  };

  const handleGenerate = async (config: GenerationSettings) => {
    setIsGenerating(true);
    setShowProgress(true);
    setGenerationProgress({
      total: config.count,
      generating: config.count,
      success: 0,
      failed: 0,
    });

    const characters = getCharacters();
    if (characters.length === 0) {
      alert('角色库为空！请先在角色库中添加角色。');
      setIsGenerating(false);
      setShowProgress(false);
      return;
    }

    // 角色分配逻辑
    const selectedCharacters = [];

    // 判断是使用随机选择还是指定角色
    if (config.useRandomCharacter) {
      // 从角色库随机选择
      if (characters.length >= config.count) {
        const shuffled = [...characters].sort(() => Math.random() - 0.5);
        selectedCharacters.push(...shuffled.slice(0, config.count));
      } else if (characters.length === config.count) {
        selectedCharacters.push(...characters);
      } else {
        selectedCharacters.push(...characters);
        const remaining = config.count - characters.length;
        const maxPerCharacter = 3;
        const characterUsageCount = new Map(characters.map((c) => [c.id, 1]));

        for (let i = 0; i < remaining; i++) {
          const availableChars = characters.filter(
            (c) => (characterUsageCount.get(c.id) || 0) < maxPerCharacter
          );

          if (availableChars.length === 0) {
            alert(
              `当前帖子数量过多，请加入更多角色或降低帖子数量。\n\n当前角色数：${characters.length}\n请求生成数：${config.count}\n每个角色最多一天发${maxPerCharacter}条`
            );
            setIsGenerating(false);
            setShowProgress(false);
            return;
          }

          const randomChar =
            availableChars[Math.floor(Math.random() * availableChars.length)];
          selectedCharacters.push(randomChar);
          characterUsageCount.set(
            randomChar.id,
            (characterUsageCount.get(randomChar.id) || 0) + 1
          );
        }
      }
    } else if (config.selectedCharacters && config.selectedCharacters.length > 0) {
      // 从指定的多个角色中选择
      const selectedChars = characters.filter((c) =>
        config.selectedCharacters!.includes(c.nickname)
      );

      if (selectedChars.length === 0) {
        alert('未找到选中的角色');
        setIsGenerating(false);
        setShowProgress(false);
        return;
      }

      // 分配角色到帖子
      if (selectedChars.length >= config.count) {
        // 角色数量 >= 生成数量：随机选择不重复的角色
        const shuffled = [...selectedChars].sort(() => Math.random() - 0.5);
        selectedCharacters.push(...shuffled.slice(0, config.count));
      } else {
        // 角色数量 < 生成数量：循环使用角色，最多每个角色发3条
        const maxPerCharacter = 3;
        const characterUsageCount = new Map(selectedChars.map((c) => [c.id, 0]));

        for (let i = 0; i < config.count; i++) {
          const availableChars = selectedChars.filter(
            (c) => (characterUsageCount.get(c.id) || 0) < maxPerCharacter
          );

          if (availableChars.length === 0) {
            alert(
              `当前帖子数量过多，请选择更多角色或降低帖子数量。\n\n已选角色数：${selectedChars.length}\n请求生成数：${config.count}\n每个角色最多一天发${maxPerCharacter}条`
            );
            setIsGenerating(false);
            setShowProgress(false);
            return;
          }

          const randomChar =
            availableChars[Math.floor(Math.random() * availableChars.length)];
          selectedCharacters.push(randomChar);
          characterUsageCount.set(
            randomChar.id,
            (characterUsageCount.get(randomChar.id) || 0) + 1
          );
        }
      }
    } else {
      // 兼容旧的单选逻辑
      const specificChar = characters.find((c) => c.nickname === config.character);
      if (specificChar) {
        for (let i = 0; i < config.count; i++) {
          selectedCharacters.push(specificChar);
        }
      } else {
        alert('未找到指定角色');
        setIsGenerating(false);
        setShowProgress(false);
        return;
      }
    }

    const newPosts: PostData[] = [];
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < config.count; i++) {
      try {
        const character = selectedCharacters[i];
        const timestamp = generateTimestamp(
          config.publishTime,
          config.scheduledTimeStart,
          config.scheduledTimeEnd
        );

        // 确定图片数量
        let imageCount: number;
        if (config.imageCount === 'fixed') {
          imageCount = config.imageNumber || 1;
        } else {
          const min = config.imageMin || 1;
          const max = config.imageMax || 4;
          imageCount = Math.floor(Math.random() * (max - min + 1)) + min;
        }

        // 模拟生成延迟
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

        // 模拟 5% 的失败率（偶尔失败）
        if (Math.random() < 0.05) {
          throw new Error('生成失败');
        }

        // 从配置的风格类型中随机选择一个
        const selectedStyleType = config.styleTypes[Math.floor(Math.random() * config.styleTypes.length)];

        const post: PostData = {
          id: `post-${Date.now()}-${i}`,
          characterName: character.nickname,
          characterAvatar: character.avatar,
          title: generateRandomTitle(config.styleTypes, config.customStylePrompt),
          content: generateRandomContent(config.styleTypes, config.customStylePrompt),
          images: generateImagesForContent(config.styleTypes, config.category, imageCount),
          timestamp,
          status: 'pending',
          category: config.category,
          styleType: selectedStyleType === '自定义' ? (config.customStylePrompt || '自定义') : selectedStyleType,
          likeCount: Math.floor(Math.random() * 100),
          comments: generateComments(characters, timestamp),
        };

        newPosts.push(post);
        successCount++;

        // 更新进度
        setGenerationProgress({
          total: config.count,
          generating: config.count - (successCount + failedCount),
          success: successCount,
          failed: failedCount,
        });
      } catch (error) {
        failedCount++;
        // 静默处理失败，不输出到控制台（这是模拟的失败情况）

        // 更新进度
        setGenerationProgress({
          total: config.count,
          generating: config.count - (successCount + failedCount),
          success: successCount,
          failed: failedCount,
        });
      }
    }

    setPosts((prev) => [...newPosts, ...prev]);
    setIsGenerating(false);
  };

  const handleEdit = (id: string, content: string, images: string[]) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, content, images } : post))
    );
  };

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const handlePublish = (id: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === id) {
          // 解析时间戳，判断是否为未来时间
          const now = new Date();
          const postDate = parseTimestamp(post.timestamp);

          if (postDate > now) {
            // 未来时间，标记为已定时发布
            return { ...post, status: 'scheduled' as const };
          } else {
            // 当前或过去时间，标记为已发布
            return { ...post, status: 'published' as const };
          }
        }
        return post;
      })
    );
  };

  // 解析时间戳的辅助函数
  const parseTimestamp = (timestamp: string): Date => {
    // 时间戳格式: "04/13 14:30" 或类似格式
    const [datePart, timePart] = timestamp.split(' ');
    const [month, day] = datePart.split('/').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    const currentYear = new Date().getFullYear();
    const date = new Date(currentYear, month - 1, day, hour, minute);

    return date;
  };

  const handleRevoke = (id: string) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, status: 'pending' } : post))
    );
  };

  const handleBatchPublish = (ids: string[]) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (ids.includes(post.id)) {
          // 解析时间戳，判断是否为未来时间
          const now = new Date();
          const postDate = parseTimestamp(post.timestamp);

          if (postDate > now) {
            return { ...post, status: 'scheduled' as const };
          } else {
            return { ...post, status: 'published' as const };
          }
        }
        return post;
      })
    );
  };

  const handleBatchDelete = (ids: string[]) => {
    setPosts((prev) => prev.filter((post) => !ids.includes(post.id)));
  };

  // 商品管理处理函数
  const handleAddProduct = (product: Omit<ConversationalProduct, 'id' | 'createdAt' | 'stats'>) => {
    const newProduct: ConversationalProduct = {
      ...product,
      id: `product-${Date.now()}`,
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      stats: {
        impressions: 0,
        clicks: 0,
        negativeFeedback: 0,
      },
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleEditProduct = (id: string, updates: Partial<ConversationalProduct>) => {
    setProducts((prev) =>
      prev.map((product) => (product.id === id ? { ...product, ...updates } : product))
    );
  };

  const handleToggleProductStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === id) {
          // 检查启用条件
          if (product.status === 'disabled') {
            // 启用前验证
            if (!product.name || !product.image || !product.description) {
              alert('启用失败：必填字段不完整');
              return product;
            }
            if (product.keywords.length === 0) {
              alert('启用失败：至少需要1个关联提示词');
              return product;
            }
          }
          return {
            ...product,
            status: product.status === 'enabled' ? ('disabled' as const) : ('enabled' as const),
          };
        }
        return product;
      })
    );
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  // 普通商品管理处理函数
  const handleAddRegularProduct = (product: Omit<RegularProduct, 'id' | 'createdAt'>) => {
    const newProduct: RegularProduct = {
      ...product,
      id: `regular-${Date.now()}`,
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setRegularProducts((prev) => [newProduct, ...prev]);
  };

  const handleEditRegularProduct = (id: string, updates: Partial<RegularProduct>) => {
    setRegularProducts((prev) =>
      prev.map((product) => (product.id === id ? { ...product, ...updates } : product))
    );
  };

  const handleToggleRegularProductStatus = (id: string) => {
    setRegularProducts((prev) =>
      prev.map((product) => {
        if (product.id === id) {
          // 检查上架条件
          if (product.status === 'offline') {
            // 上架前验证
            if (!product.name || !product.image) {
              alert('上架失败：必填字段不完整');
              return product;
            }
            if (product.type === 'physical' && product.stock <= 0) {
              alert('上架失败：实体商品库存为0无法上架');
              return product;
            }
          }
          return {
            ...product,
            status: product.status === 'online' ? ('offline' as const) : ('online' as const),
          };
        }
        return product;
      })
    );
  };

  const handleBatchToggleRegularProductStatus = (ids: string[], status: 'online' | 'offline') => {
    setRegularProducts((prev) =>
      prev.map((product) => {
        if (ids.includes(product.id)) {
          // 如果是上架操作，需要验证
          if (status === 'online') {
            if (!product.name || !product.image) {
              return product; // 跳过验证失败的商品
            }
            if (product.type === 'physical' && product.stock <= 0) {
              return product; // 跳过库存为0的实体商品
            }
          }
          return { ...product, status };
        }
        return product;
      })
    );
  };

  const handleUpdateRegularProductStock = (id: string, stock: number) => {
    setRegularProducts((prev) =>
      prev.map((product) => {
        if (product.id === id) {
          // 如果库存变为0，实体商品自动下架
          const newStatus =
            product.type === 'physical' && stock === 0 && product.status === 'online'
              ? 'offline'
              : product.status;
          return { ...product, stock, status: newStatus };
        }
        return product;
      })
    );
  };

  const handleDeleteRegularProduct = (id: string) => {
    setRegularProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const handleBatchDeleteRegularProducts = (ids: string[]) => {
    setRegularProducts((prev) => prev.filter((product) => !ids.includes(product.id)));
  };

  const handleTogglePinRegularProduct = (id: string) => {
    setRegularProducts((prev) =>
      prev.map((product) => (product.id === id ? { ...product, isPinned: !product.isPinned } : product))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* 页面标题 */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">暖伴后台管理系统</h1>
              </div>
              <p className="text-gray-600">AI帖子生成与发布 · 商品管理 · 物流管理</p>
            </div>
            <CharacterManagementDialog />
          </div>

          {/* 标签页导航 — 三组分隔 */}
          <div className="flex items-center gap-2">
            {/* 内容管理 */}
            <div className="bg-white border border-gray-200 rounded-lg p-1 flex gap-1">
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'posts' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Sparkles className="w-4 h-4" />AI帖子
              </button>
              <button
                onClick={() => setActiveTab('user-posts')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'user-posts' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Users className="w-4 h-4" />用户帖子
              </button>
              <button
                onClick={() => setActiveTab('moderation-posts')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'moderation-posts' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Shield className="w-4 h-4" />帖子审核
              </button>
              <button
                onClick={() => setActiveTab('moderation-comments')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'moderation-comments' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Shield className="w-4 h-4" />评论审核
              </button>
            </div>

            {/* 商品管理 */}
            <div className="bg-white border border-gray-200 rounded-lg p-1 flex gap-1">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <ShoppingBag className="w-4 h-4" />商品管理
              </button>
            </div>

            {/* 物流管理 */}
            <div className="bg-white border border-gray-200 rounded-lg p-1 flex gap-1">
              <button
                onClick={() => setActiveTab('logistics')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'logistics' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Truck className="w-4 h-4" />物流管理
              </button>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        {activeTab === 'posts' && (
          <PostManagementTable
            posts={posts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPublish={handlePublish}
            onRevoke={handleRevoke}
            onBatchPublish={handleBatchPublish}
            onBatchDelete={handleBatchDelete}
            onGenerateImages={handleGenerateImages}
            generationProgress={generationProgress}
            showProgress={showProgress}
            addButton={
              <GenerationConfigDialog
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            }
          />
        )}

        {activeTab === 'user-posts' && (
          <UserPostsPanel posts={userPosts} />
        )}

        {activeTab === 'products' && (
          <RegularProductManagement
            products={regularProducts}
            onAdd={handleAddRegularProduct}
            onEdit={handleEditRegularProduct}
            onToggleStatus={handleToggleRegularProductStatus}
            onBatchToggleStatus={handleBatchToggleRegularProductStatus}
            onUpdateStock={handleUpdateRegularProductStock}
            onDelete={handleDeleteRegularProduct}
            onBatchDelete={handleBatchDeleteRegularProducts}
            onTogglePin={handleTogglePinRegularProduct}
          />
        )}

        {activeTab === 'moderation-posts' && (
          <ModerationPanel type="post" />
        )}

        {activeTab === 'moderation-comments' && (
          <ModerationPanel type="comment" />
        )}

        {activeTab === 'logistics' && (
          <LogisticsManagement />
        )}
      </div>
    </div>
  );
}