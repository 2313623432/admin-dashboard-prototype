import { useState } from 'react';
import { GenerationConfig, GenerationSettings } from '../components/GenerationConfig';
import { PrePublishList } from '../components/PrePublishList';
import { Post } from '../components/PostCard';
import { getCharacters } from '../utils/characterStorage';
import { Sparkles } from 'lucide-react';

// 模拟图片池
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1758909894264-eae137ed71ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBtb3JuaW5nJTIwbGlmZXN0eWxlfGVufDF8fHx8MTc3NDkyMzI2MHww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1725362363874-f902c71ada55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBjaXR5c2NhcGUlMjB1cmJhbnxlbnwxfHx8fDE3NzQ5NDIwNjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1700451761281-fa705b64935d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc3BhY2UlMjBkZXNrJTIwY29tcHV0ZXJ8ZW58MXx8fHwxNzc0OTA5OTE0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1762898842219-ca8136061b76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZGVsaWNpb3VzJTIwbWVhbHxlbnwxfHx8fDE3NzQ4NTI4MjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBhZHZlbnR1cmUlMjBuYXR1cmV8ZW58MXx8fHwxNzc0ODUxMzkwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1751801562148-65779a7bf50d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFkaW5nJTIwYm9vayUyMHJlbGF4aW5nfGVufDF8fHx8MTc3NDk0MjA2Mnww&ixlib=rb-4.1.0&q=80&w=1080',
];

// 模拟内容模板
const CONTENT_TEMPLATES = {
  '生活分享': [
    '今天的阳光特别温暖，忍不住去公园走了一圈。生活中的小确幸就是这样简单又美好 ☀️',
    '周末在家整理了一下房间，看着干净整洁的空间，整个人都轻松了不少。断舍离真的很治愈～',
    '下班路上偶遇超美的晚霞，赶紧拍下来分享给你们！这样的天空太浪漫了 🌅',
    '入手了新的香薰蜡烛，整个房间都是清新的味道，心情都跟着好起来了 🕯️',
  ],
  '知识分享': [
    '今天学到一个超实用的时间管理技巧：番茄工作法！25分钟专注+5分钟休息，效率提升了好多 📚',
    '分享一个理财小知识：先储蓄后消费！每月工资到账后先存下20%，剩下的再用于消费和日常开销 💰',
    '读书笔记：《刻意练习》告诉我们，真正的高手都是通过有目的的练习成长起来的。坚持很重要！',
    '最近在学习PS，发现掌握快捷键能提升50%的工作效率！整理了一份常用快捷键清单 💻',
  ],
  '情感倾诉': [
    '有时候觉得，能陪在身边的人，才是最重要的。珍惜眼前人吧 💕',
    '今天莫名有点emo，可能是太累了。给自己放个假，好好休息一下～',
    '突然意识到，成长就是慢慢学会与自己和解的过程。接纳不完美的自己 🌸',
    '感谢那些在我低谷时期陪伴我的人，你们的温暖我都记得 ❤️',
  ],
  '旅行游记': [
    '周末去了趟古镇，古色古香的建筑、悠闲的生活节奏，暂时逃离城市的喧嚣真好 🏮',
    '海边日出太震撼了！早起完全值得，这一刻所有的疲惫都烟消云散 🌊',
    '第一次去爬山，虽然累但登顶那一刻真的超有成就感！风景绝美 ⛰️',
    '在这座城市的街头漫步，每个角落都充满了生活气息。旅行的意义就在于发现不同的美好 ✈️',
  ],
  '美食打卡': [
    '周末自己动手做了蛋糕，虽然卖相一般但味道不错！成就感满满 🎂',
    '发现了一家宝藏咖啡馆，拿铁做得超级好喝，环境也很舒服。已经决定常来了 ☕',
    '今天的晚餐：番茄炖牛腩！炖了两个小时，肉软烂入味，配米饭绝了 🍲',
    '朋友推荐的日料店真的绝！新鲜的三文鱼入口即化，环境也很日式 🍣',
  ],
  '工作日常': [
    '今天项目终于上线了！这段时间的加班都值了，看到成果的那一刻超有成就感 💼',
    '周会上分享了自己的工作经验，收到了leader的认可。继续加油！',
    '下午茶时间，和同事们一起聊天放松，工作氛围真的很重要 ☕',
    '完成了一个挑战性很大的任务，虽然过程很难但收获了很多经验。成长就是这样一步步来的 📊',
  ],
  '自定义': [
    '根据自定义风格生成的内容示例。实际使用时，这里会基于您的提示词生成相应内容。',
  ],
};

function generateRandomContent(styleType: string, customPrompt?: string): string {
  if (styleType === '自定义' && customPrompt) {
    const customTemplates = [
      `分享一些关于${customPrompt}的心得体会，今天收获满满！`,
      `最近在尝试${customPrompt}，感觉很有趣，期待更多进展～`,
      `关于${customPrompt}的一些想法：保持热情，持续学习，才能不断进步。`,
      `今天继续坚持${customPrompt}，虽然过程有点挑战，但很享受这个过程！`,
    ];
    return customTemplates[Math.floor(Math.random() * customTemplates.length)];
  }
  
  const templates = CONTENT_TEMPLATES[styleType as keyof typeof CONTENT_TEMPLATES] || CONTENT_TEMPLATES['生活分享'];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateRandomImages(config: GenerationSettings): string[] {
  let count: number;
  
  if (config.imageCount === 'fixed') {
    count = config.imageNumber || 1;
  } else {
    const min = config.imageMin || 1;
    const max = config.imageMax || 4;
    count = Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  const shuffled = [...SAMPLE_IMAGES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateTimestamp(publishTime: string, scheduledTimeStart?: string, scheduledTimeEnd?: string): string {
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
    const randomMinutes = Math.floor(Math.random() * (endMinutes - startMinutes + 1)) + startMinutes;
    
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
    // 随机时间（明天）
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

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (config: GenerationSettings) => {
    setIsGenerating(true);
    
    // 获取角色库
    const characters = getCharacters();
    
    if (characters.length === 0) {
      alert('角色库为空！请先在角色库中添加角色。');
      setIsGenerating(false);
      return;
    }

    // 根据人物选择规则分配角色
    const selectedCharacters = [];
    
    if (config.character === '随机选择') {
      // 随机选择规则
      if (characters.length >= config.count) {
        // 角色数量 >= 需要生成数：随机选择不同角色
        const shuffled = [...characters].sort(() => Math.random() - 0.5);
        selectedCharacters.push(...shuffled.slice(0, config.count));
      } else if (characters.length === config.count) {
        // 角色数量 = 需要数量：每个角色分配一条
        selectedCharacters.push(...characters);
      } else {
        // 角色数量 < 需要数量
        // 每个角色先保证有一条
        selectedCharacters.push(...characters);
        
        const remaining = config.count - characters.length;
        const maxPerCharacter = 3;
        const characterUsageCount = new Map(characters.map(c => [c.id, 1]));
        
        for (let i = 0; i < remaining; i++) {
          // 找到使用次数最少的角色
          const availableChars = characters.filter(c => 
            (characterUsageCount.get(c.id) || 0) < maxPerCharacter
          );
          
          if (availableChars.length === 0) {
            alert(`当前帖子数量过多，请加入更多角色或降低帖子数量。\n\n当前角色数：${characters.length}\n请求生成数：${config.count}\n每个角色最多一天发${maxPerCharacter}条`);
            setIsGenerating(false);
            return;
          }
          
          const randomChar = availableChars[Math.floor(Math.random() * availableChars.length)];
          selectedCharacters.push(randomChar);
          characterUsageCount.set(randomChar.id, (characterUsageCount.get(randomChar.id) || 0) + 1);
        }
      }
    } else {
      // 指定角色
      const specificChar = characters.find(c => c.nickname === config.character);
      if (specificChar) {
        for (let i = 0; i < config.count; i++) {
          selectedCharacters.push(specificChar);
        }
      } else {
        alert('未找到指定角色，请检查角色库');
        setIsGenerating(false);
        return;
      }
    }

    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newPosts: Post[] = [];
    
    for (let i = 0; i < config.count; i++) {
      const character = selectedCharacters[i];
      
      const post: Post = {
        id: `post-${Date.now()}-${i}`,
        characterName: character.nickname,
        characterAvatar: character.avatar,
        content: generateRandomContent(config.styleType, config.customStylePrompt),
        images: generateRandomImages(config),
        timestamp: generateTimestamp(config.publishTime, config.scheduledTimeStart, config.scheduledTimeEnd),
        selected: false,
      };
      
      newPosts.push(post);
    }
    
    setPosts(prev => [...prev, ...newPosts]);
    setIsGenerating(false);
  };

  const handleToggleSelect = (id: string) => {
    setPosts(prev => prev.map(post => 
      post.id === id ? { ...post, selected: !post.selected } : post
    ));
  };

  const handleToggleSelectAll = () => {
    const allSelected = posts.every(p => p.selected);
    setPosts(prev => prev.map(post => ({ ...post, selected: !allSelected })));
  };

  const handleEdit = (id: string, content: string, images: string[]) => {
    setPosts(prev => prev.map(post => 
      post.id === id ? { ...post, content, images } : post
    ));
  };

  const handlePublish = () => {
    const selectedPosts = posts.filter(p => p.selected);
    if (selectedPosts.length === 0) {
      alert('请至少选择一条帖子');
      return;
    }
    
    alert(`成功发布 ${selectedPosts.length} 条帖子！\n\n这些帖子将按照时间戳同步到社区。`);
    
    // 移除已发布的帖子
    setPosts(prev => prev.filter(p => !p.selected));
  };

  const handleClear = () => {
    if (confirm('确定要清空所有预发布内容吗？')) {
      setPosts([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI帖子生成管理后台</h1>
          </div>
          <p className="text-gray-600">配置参数，生成帖子，审核发布</p>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：生成配置 */}
          <div className="lg:col-span-1">
            <GenerationConfig
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>

          {/* 右侧：预发布列表 */}
          <div className="lg:col-span-2">
            <PrePublishList
              posts={posts}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onPublish={handlePublish}
              onClear={handleClear}
              onEdit={handleEdit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
