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
  DialogTrigger,
} from './ui/dialog';
import {
  Plus,
  Edit2,
  Eye,
  Power,
  PowerOff,
  Search,
  X,
  RefreshCw,
  ExternalLink,
  QrCode,
  TrendingUp,
  ImageOff,
  Calendar,
  Trash2,
} from 'lucide-react';

export interface ConversationalProduct {
  id: string;
  name: string;
  keywords: string[]; // 关联提示词
  image: string;
  description: string; // 功能描述引导语
  jumpType: 'link' | 'qrcode' | 'none';
  jumpLink?: string;
  jumpSceneDescription?: string; // 跳转场景说明
  qrcodeImage?: string;
  points?: number; // 所需积分
  stock?: number;
  status: 'enabled' | 'disabled';
  createdAt: string;
  stats: {
    impressions: number;
    clicks: number;
    negativeFeedback: number;
  };
}

interface ProductManagementProps {
  products: ConversationalProduct[];
  onAdd: (product: Omit<ConversationalProduct, 'id' | 'createdAt' | 'stats'>) => void;
  onEdit: (id: string, product: Partial<ConversationalProduct>) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProductManagement({
  products,
  onAdd,
  onEdit,
  onToggleStatus,
  onDelete,
}: ProductManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [editingProduct, setEditingProduct] = useState<ConversationalProduct | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<ConversationalProduct | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // 产品表单状态
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    image: '',
    description: '',
    jumpType: 'none' as 'link' | 'qrcode' | 'none',
    jumpLink: '',
    jumpSceneDescription: '',
    qrcodeImage: '',
    points: '',
    stock: '999999',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [imageError, setImageError] = useState<{ [id: string]: boolean }>({});

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'qrcodeImage') => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        alert('请上传JPG或PNG格式的图片');
        return;
      }

      // 验证文件大小
      const maxSize = field === 'image' ? 1024 * 1024 : 500 * 1024; // 商品图1MB，二维码500KB
      if (file.size > maxSize) {
        alert(`图片大小不能超过${field === 'image' ? '1MB' : '500KB'}`);
        return;
      }

      // 创建预览URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setFormData({ ...formData, [field]: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  // 筛选商品
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'enabled' && product.status === 'enabled') ||
      (statusFilter === 'disabled' && product.status === 'disabled');

    return matchesSearch && matchesStatus;
  });

  // 打开添加对话框
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      keywords: '',
      image: '',
      description: '',
      jumpType: 'none',
      jumpLink: '',
      jumpSceneDescription: '',
      qrcodeImage: '',
      points: '',
      stock: '999999',
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  // 打开编辑对话框
  const handleOpenEdit = (product: ConversationalProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      keywords: product.keywords.join(', '),
      image: product.image,
      description: product.description,
      jumpType: product.jumpType,
      jumpLink: product.jumpLink || '',
      jumpSceneDescription: product.jumpSceneDescription || '',
      qrcodeImage: product.qrcodeImage || '',
      points: product.points ? product.points.toString() : '',
      stock: product.stock ? product.stock.toString() : '999999',
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  // 验证表单
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // 商品名称
    if (!formData.name.trim()) {
      errors.name = '请输入商品名称';
    } else if (formData.name.length > 20) {
      errors.name = '商品名称不能超过20个字符';
    }

    // 关联提示词
    const keywordList = formData.keywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k);
    if (keywordList.length === 0) {
      errors.keywords = '请至少输入1个关联提示词';
    } else if (keywordList.length > 10) {
      errors.keywords = '关联提示词不能超过10个';
    } else {
      const invalidKeyword = keywordList.find((k) => k.length > 10);
      if (invalidKeyword) {
        errors.keywords = `提示词"${invalidKeyword}"超过10个字符`;
      }
    }

    // 检查提示词重复
    const duplicateProducts = products.filter(
      (p) =>
        p.id !== editingProduct?.id &&
        p.keywords.some((k) => keywordList.includes(k))
    );
    if (duplicateProducts.length > 0) {
      const dupProduct = duplicateProducts[0];
      const dupKeyword = dupProduct.keywords.find((k) => keywordList.includes(k));
      if (!confirm(`提示词"${dupKeyword}"已被商品"${dupProduct.name}"占用，是否继续？`)) {
        errors.keywords = '请修改重复的提示词';
      }
    }

    // 商品图
    if (!formData.image.trim()) {
      errors.image = '请上传商品图';
    }

    // 引导语
    if (!formData.description.trim()) {
      errors.description = '请输入功能描述引导语';
    } else if (formData.description.length > 30) {
      errors.description = '引导语不能超过30个字符';
    }

    // 跳转链接
    if (formData.jumpType === 'link' && formData.jumpLink.trim()) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(formData.jumpLink)) {
        errors.jumpLink = '请输入正确的链接（需以http://或https://开头）';
      }
    }

    // 二维码
    if (formData.jumpType === 'qrcode' && !formData.qrcodeImage.trim()) {
      errors.qrcodeImage = '请上传跳转二维码';
    }

    // 所需积分
    if (formData.points.trim()) {
      const points = parseInt(formData.points);
      if (isNaN(points) || points <= 0) {
        errors.points = '积分必须大于0';
      } else if (!Number.isInteger(parseFloat(formData.points))) {
        errors.points = '积分必须为整数';
      }
    }

    // 库存
    const stock = parseInt(formData.stock);
    if (formData.stock === '' || isNaN(stock)) {
      errors.stock = '请输入库存';
    } else if (stock < 0) {
      errors.stock = '库存不能小于0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 提交表单
  const handleSubmit = () => {
    if (!validateForm()) return;

    const keywordList = formData.keywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k);

    const productData = {
      name: formData.name,
      keywords: keywordList,
      image: formData.image,
      description: formData.description,
      jumpType: formData.jumpType,
      jumpLink: formData.jumpType === 'link' ? formData.jumpLink : undefined,
      jumpSceneDescription: formData.jumpSceneDescription || undefined,
      qrcodeImage: formData.jumpType === 'qrcode' ? formData.qrcodeImage : undefined,
      points: formData.points ? parseInt(formData.points) : undefined,
      stock: parseInt(formData.stock),
      status: 'disabled' as const,
    };

    if (editingProduct) {
      onEdit(editingProduct.id, productData);
    } else {
      onAdd(productData);
    }

    setIsDialogOpen(false);
  };

  // 重置筛选
  const handleReset = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  // 打开预览
  const handlePreview = (product: ConversationalProduct) => {
    setPreviewProduct(product);
    setShowPreview(true);
  };

  // 处理图片加载错误
  const handleImageError = (productId: string) => {
    setImageError({ ...imageError, [productId]: true });
  };

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                新增对话商品
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? '编辑对话商品' : '新增对话商品'}
                </DialogTitle>
                <DialogDescription>
                  对话商品不在积分商城中显示，仅供对话流广告使用
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* 商品名称 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    商品名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="请输入商品名称（最多20字）"
                    maxLength={20}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* 关联提示词 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    关联提示词 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="多个词以逗号分隔，如：健康,养生,调理（最多10个，每个≤10字）"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.keywords ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.keywords && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.keywords}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    当前已输入：
                    {formData.keywords.split(',').filter((k) => k.trim()).length} 个提示词
                  </p>
                </div>

                {/* 商品图 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    商品图 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleImageUpload(e, 'image')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.image ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.image && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.image}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">支持JPG/PNG格式，大小不超过1MB</p>
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="预览"
                        className="w-32 h-32 object-cover rounded border border-gray-300"
                      />
                    </div>
                  )}
                </div>

                {/* 功能描述引导语 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    功能描述引导语 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="请输入引导语（最多30字，展示在卡片上）"
                    maxLength={30}
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    {formData.description.length}/30
                  </p>
                </div>

                {/* 跳转类型 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    跳转类型
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="none"
                        checked={formData.jumpType === 'none'}
                        onChange={(e) =>
                          setFormData({ ...formData, jumpType: e.target.value as any })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">无跳转</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="link"
                        checked={formData.jumpType === 'link'}
                        onChange={(e) =>
                          setFormData({ ...formData, jumpType: e.target.value as any })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">跳转链接</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="qrcode"
                        checked={formData.jumpType === 'qrcode'}
                        onChange={(e) =>
                          setFormData({ ...formData, jumpType: e.target.value as any })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">跳转二维码</span>
                    </label>
                  </div>
                </div>

                {/* 跳转链接 */}
                {formData.jumpType === 'link' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      跳转链接
                    </label>
                    <input
                      type="text"
                      value={formData.jumpLink}
                      onChange={(e) => setFormData({ ...formData, jumpLink: e.target.value })}
                      placeholder="请输入完整的http/https地址"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.jumpLink ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.jumpLink && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.jumpLink}</p>
                    )}
                  </div>
                )}

                {/* 跳转场景说明 */}
                {(formData.jumpType === 'link' || formData.jumpType === 'qrcode') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      跳转场景说明（选填）
                    </label>
                    <textarea
                      value={formData.jumpSceneDescription}
                      onChange={(e) => setFormData({ ...formData, jumpSceneDescription: e.target.value })}
                      placeholder="例如：跳转到商品详情页、跳转到活动页面等"
                      maxLength={50}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      {formData.jumpSceneDescription.length}/50
                    </p>
                  </div>
                )}

                {/* 跳转二维码 */}
                {formData.jumpType === 'qrcode' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      跳转二维码
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => handleImageUpload(e, 'qrcodeImage')}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.qrcodeImage ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.qrcodeImage && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.qrcodeImage}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">支持JPG/PNG格式，大小不超过500KB</p>
                    {formData.qrcodeImage && (
                      <div className="mt-2">
                        <img
                          src={formData.qrcodeImage}
                          alt="二维码预览"
                          className="w-32 h-32 object-cover rounded border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* 所需积分 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">所需积分（选填）</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                    placeholder="选填，正整数"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.points ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.points && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.points}</p>
                  )}
                </div>

                {/* 库存 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    库存 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="请输入库存数量（默认999999）"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.stock ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.stock && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.stock}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    对话商品默认库存999999，可根据需要调整
                  </p>
                </div>

                {/* 按钮 */}
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {editingProduct ? '保存修改' : '添加商品'}
                  </Button>
                  <Button
                    onClick={() => setIsDialogOpen(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    取消
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="text-sm text-gray-600">
            共 {products.length} 个商品 · 启用 {products.filter((p) => p.status === 'enabled').length} 个 · 停用{' '}
            {products.filter((p) => p.status === 'disabled').length} 个
            {filteredProducts.length < products.length && (
              <span className="ml-2 text-blue-600 font-medium">
                · 筛选后 {filteredProducts.length} 个
              </span>
            )}
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex items-center gap-3">
          {/* 搜索框 */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索商品名称或关联提示词（1-20个字符）"
              maxLength={20}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* 状态筛选 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部状态</option>
            <option value="enabled">已启用</option>
            <option value="disabled">已停用</option>
          </select>

          {/* 重置按钮 */}
          <Button onClick={handleReset} variant="outline" size="sm">
            <RefreshCw className="w-3 h-3 mr-1" />
            重置
          </Button>
        </div>
      </div>

      {/* 商品列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">商品ID</TableHead>
                <TableHead className="w-40">商品名称</TableHead>
                <TableHead className="w-48">关联提示词</TableHead>
                <TableHead className="w-24">商品图</TableHead>
                <TableHead className="w-48">引导语</TableHead>
                <TableHead className="w-24">跳转类型</TableHead>
                <TableHead className="w-24">库存</TableHead>
                <TableHead className="w-20">状态</TableHead>
                <TableHead className="w-32">创建时间</TableHead>
                <TableHead className="w-48">数据统计</TableHead>
                <TableHead className="w-48">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-32 text-center text-gray-500">
                    {products.length === 0
                      ? '暂无商品，点击"新增对话商品"开始创建'
                      : '没有符合筛选条件的商品'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    {/* 商品ID */}
                    <TableCell>
                      <div className="text-xs text-gray-600 font-mono">{product.id}</div>
                    </TableCell>

                    {/* 商品名称 */}
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      {product.points && (
                        <div className="text-xs text-orange-600 font-medium mt-0.5">
                          {product.points} 积分
                        </div>
                      )}
                    </TableCell>

                    {/* 关联提示词 */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.keywords.map((keyword, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    {/* 商品图 */}
                    <TableCell>
                      {imageError[product.id] ? (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <ImageOff className="w-6 h-6 text-gray-400" />
                        </div>
                      ) : (
                        <img
                          src={product.image}
                          alt={product.name}
                          onError={() => handleImageError(product.id)}
                          className="w-16 h-16 object-cover rounded border border-gray-300"
                        />
                      )}
                    </TableCell>

                    {/* 引导语 */}
                    <TableCell>
                      <div className="text-sm text-gray-700">
                        {product.description.length > 20
                          ? product.description.substring(0, 20) + '...'
                          : product.description}
                      </div>
                    </TableCell>

                    {/* 跳转类型 */}
                    <TableCell>
                      {product.jumpType === 'link' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          链接
                        </span>
                      )}
                      {product.jumpType === 'qrcode' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <QrCode className="w-3 h-3 mr-1" />
                          二维码
                        </span>
                      )}
                      {product.jumpType === 'none' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          无
                        </span>
                      )}
                    </TableCell>

                    {/* 库存 */}
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">
                        {product.stock || 999999}
                      </div>
                      {(product.stock || 999999) === 0 && (
                        <div className="text-xs text-red-500 mt-0.5">缺货</div>
                      )}
                    </TableCell>

                    {/* 状态 */}
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 'enabled'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.status === 'enabled' ? '启用' : '停用'}
                      </span>
                    </TableCell>

                    {/* 创建时间 */}
                    <TableCell>
                      <div className="text-xs text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {product.createdAt}
                      </div>
                    </TableCell>

                    {/* 数据统计 */}
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1 text-blue-600">
                          <TrendingUp className="w-3 h-3" />
                          曝光: {product.stats.impressions}
                        </div>
                        <div className="text-green-600">点击: {product.stats.clicks}</div>
                        <div className="text-red-600">
                          负反馈: {product.stats.negativeFeedback}
                        </div>
                      </div>
                    </TableCell>

                    {/* 操作 */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleStatus(product.id)}
                          className={`p-1.5 rounded ${
                            product.status === 'enabled'
                              ? 'text-orange-600 hover:bg-orange-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={product.status === 'enabled' ? '停用' : '启用'}
                        >
                          {product.status === 'enabled' ? (
                            <PowerOff className="w-4 h-4" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handlePreview(product)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                          title="预览卡片"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`确定要删除商品"${product.name}"吗？删除后无法恢复。`)) {
                              onDelete(product.id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 预览对话框 */}
      {previewProduct && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>卡片预览</DialogTitle>
              <DialogDescription>模拟对话流中的广告卡片展示效果</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* AI回答气泡 */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-sm">AI</span>
                </div>
                <div className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-sm text-gray-800">
                    根据您的需求，为您推荐以下产品，希望对您有帮助！
                  </p>
                </div>
              </div>

              {/* 广告卡片 */}
              <div className="border-2 border-orange-300 rounded-lg p-4 bg-gradient-to-br from-orange-50 to-yellow-50">
                <div className="flex gap-4">
                  {/* 商品图 */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                    {imageError[previewProduct.id] ? (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <ImageOff className="w-8 h-8 text-gray-400" />
                      </div>
                    ) : (
                      <img
                        src={previewProduct.image}
                        alt={previewProduct.name}
                        onError={() => handleImageError(previewProduct.id)}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* 商品信息 */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {previewProduct.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 flex-1">
                      {previewProduct.description}
                    </p>
                    {previewProduct.points && (
                      <div className="text-orange-600 font-bold mb-2 text-lg">
                        {previewProduct.points} 积分
                      </div>
                    )}

                    {/* 跳转场景说明 */}
                    {previewProduct.jumpSceneDescription && (
                      <div className="text-xs text-gray-500 mb-2 bg-blue-50 px-2 py-1 rounded">
                        💡 {previewProduct.jumpSceneDescription}
                      </div>
                    )}

                    {/* 按钮 */}
                    {previewProduct.jumpType === 'link' && previewProduct.jumpLink ? (
                      <a
                        href={previewProduct.jumpLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        了解详情
                      </a>
                    ) : previewProduct.jumpType === 'qrcode' && previewProduct.qrcodeImage ? (
                      <button
                        onClick={() => alert('点击可放大查看二维码')}
                        className="inline-flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm font-medium"
                      >
                        <QrCode className="w-4 h-4 mr-1" />
                        扫码查看
                      </button>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center justify-center px-4 py-2 bg-gray-300 text-gray-600 rounded-md cursor-not-allowed text-sm font-medium"
                      >
                        仅展示
                      </button>
                    )}
                  </div>
                </div>

                {/* 二维码预览 */}
                {previewProduct.jumpType === 'qrcode' && previewProduct.qrcodeImage && (
                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <p className="text-xs text-gray-600 mb-2 text-center">扫描二维码</p>
                    <div className="flex justify-center">
                      <img
                        src={previewProduct.qrcodeImage}
                        alt="二维码"
                        className="w-32 h-32 object-cover rounded border border-gray-300"
                      />
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 text-center">
                * 预览时按钮点击不走真实埋点，跳转链接在新标签页打开
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
