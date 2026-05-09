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
  ArrowUp,
  ArrowDown,
  Search,
  X,
  RefreshCw,
  ImageOff,
  Calendar,
  Package,
  Edit3,
  Trash2,
} from 'lucide-react';

export interface RegularProduct {
  id: string;
  name: string;
  image: string;
  type: 'virtual' | 'physical';
  points: number;
  stock: number;
  status: 'online' | 'offline' | 'archived';
  exchangeLimit: number; // 0为不限
  exchangedCount?: number; // 已兑换数量
  description?: string;
  createdAt: string;
  isPinned?: boolean;
}

interface RegularProductManagementProps {
  products: RegularProduct[];
  onAdd: (product: Omit<RegularProduct, 'id' | 'createdAt'>) => void;
  onEdit: (id: string, product: Partial<RegularProduct>) => void;
  onToggleStatus: (id: string) => void;
  onBatchToggleStatus: (ids: string[], status: 'online' | 'offline') => void;
  onUpdateStock: (id: string, stock: number) => void;
  onDelete: (id: string) => void;
  onBatchDelete: (ids: string[]) => void;
  onTogglePin: (id: string) => void;
}

export function RegularProductManagement({
  products,
  onAdd,
  onEdit,
  onToggleStatus,
  onBatchToggleStatus,
  onUpdateStock,
  onDelete,
  onBatchDelete,
  onTogglePin,
}: RegularProductManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'virtual' | 'physical'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editingProduct, setEditingProduct] = useState<RegularProduct | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<RegularProduct | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingStock, setEditingStock] = useState<{ id: string; stock: number } | null>(null);
  const [sortField, setSortField] = useState<'points' | 'stock' | 'createdAt' | 'exchangedCount' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // 产品表单状态
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    type: 'virtual' as 'virtual' | 'physical',
    points: '',
    stock: '',
    exchangeLimit: '0',
    description: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [imageError, setImageError] = useState<{ [id: string]: boolean }>({});

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        alert('请上传JPG或PNG格式的图片');
        return;
      }

      // 验证文件大小（2MB）
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过2MB');
        return;
      }

      // 创建预览URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setFormData({ ...formData, image: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  // 筛选商品
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || product.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (sortField === 'points') return sortDir === 'asc' ? a.points - b.points : b.points - a.points;
      if (sortField === 'stock') return sortDir === 'asc' ? a.stock - b.stock : b.stock - a.stock;
      if (sortField === 'exchangedCount') return sortDir === 'asc' ? (a.exchangedCount ?? 0) - (b.exchangedCount ?? 0) : (b.exchangedCount ?? 0) - (a.exchangedCount ?? 0);
      if (sortField === 'createdAt') return sortDir === 'asc' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt);
      return b.createdAt.localeCompare(a.createdAt);
    });

  const handleSort = (field: 'points' | 'stock' | 'createdAt' | 'exchangedCount') => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIndicator = ({ field }: { field: 'points' | 'stock' | 'createdAt' | 'exchangedCount' }) => {
    if (sortField !== field) return <span className="text-gray-300 ml-0.5 text-xs">↕</span>;
    return <span className="text-blue-500 ml-0.5 text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  // 选择行
  const handleSelectAll = () => {
    if (selectedRows.size === filteredProducts.filter(p => p.status !== 'archived').length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredProducts.filter(p => p.status !== 'archived').map((p) => p.id)));
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

  // 打开添加对话框
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      image: '',
      type: 'virtual',
      points: '',
      stock: '999999',
      exchangeLimit: '',
      description: '',
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  // 打开编辑对话框
  const handleOpenEdit = (product: RegularProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      image: product.image,
      type: product.type,
      points: product.points.toString(),
      stock: product.stock.toString(),
      exchangeLimit: product.exchangeLimit === 0 ? '' : product.exchangeLimit.toString(),
      description: product.description || '',
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
    } else if (formData.name.length > 30) {
      errors.name = '商品名称不能超过30个字符';
    } else {
      // 检查名称重复
      const duplicate = products.find(
        (p) => p.name === formData.name && p.id !== editingProduct?.id
      );
      if (duplicate) {
        errors.name = '已存在同名商品，请修改';
      }
    }

    // 所需积分
    const points = parseInt(formData.points);
    if (!formData.points || isNaN(points)) {
      errors.points = '请输入所需积分';
    } else if (points <= 0) {
      errors.points = '积分必须大于0';
    }

    // 库存
    const stock = parseInt(formData.stock);
    if (formData.stock === '' || isNaN(stock)) {
      errors.stock = '请输入库存';
    } else if (stock < 0) {
      errors.stock = '库存不能小于0';
    }

    // 兑换限制（可选，空值视为不限）
    if (formData.exchangeLimit !== '' && formData.exchangeLimit !== null) {
      const exchangeLimit = parseInt(formData.exchangeLimit);
      if (isNaN(exchangeLimit) || exchangeLimit < 0) {
        errors.exchangeLimit = '兑换限制须为非负整数';
      }
    }

    // 头图
    if (!formData.image.trim()) {
      errors.image = '请上传商品头图';
    }

    // 描述摘要
    if (!formData.description.trim()) {
      errors.description = '请输入描述摘要';
    } else if (formData.description.length > 50) {
      errors.description = '描述摘要不能超过50个字符';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 提交表单
  const handleSubmit = () => {
    if (!validateForm()) return;

    const productData = {
      name: formData.name,
      image: formData.image,
      type: formData.type,
      points: parseInt(formData.points),
      stock: parseInt(formData.stock),
      exchangeLimit: formData.exchangeLimit === '' ? 0 : parseInt(formData.exchangeLimit),
      description: formData.description || undefined,
      status: 'offline' as const,
    };

    if (editingProduct) {
      onEdit(editingProduct.id, productData);
    } else {
      onAdd(productData);
    }

    setIsDialogOpen(false);
  };

  // 批量上下架
  const handleBatchToggle = (status: 'online' | 'offline') => {
    if (selectedRows.size === 0) {
      alert('请先选择商品');
      return;
    }

    if (selectedRows.size > 50) {
      alert('批量操作单次上限50条');
      return;
    }

    const action = status === 'online' ? '上架' : '下架';
    if (confirm(`确定要批量${action} ${selectedRows.size} 个商品吗？`)) {
      onBatchToggleStatus(Array.from(selectedRows), status);
      setSelectedRows(new Set());
    }
  };

  // 重置筛选
  const handleReset = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    setSelectedRows(new Set());
  };

  // 打开预览
  const handlePreview = (product: RegularProduct) => {
    setPreviewProduct(product);
    setShowPreview(true);
  };

  // 处理图片加载错误
  const handleImageError = (productId: string) => {
    setImageError({ ...imageError, [productId]: true });
  };

  // 打开库存编辑
  const handleOpenStockEdit = (product: RegularProduct) => {
    setEditingStock({ id: product.id, stock: product.stock });
  };

  // 保存库存修改
  const handleSaveStock = () => {
    if (!editingStock) return;

    if (editingStock.stock < 0) {
      alert('库存不能小于0');
      return;
    }

    onUpdateStock(editingStock.id, editingStock.stock);
    setEditingStock(null);
  };

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  新增商品
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? '编辑商品' : '新增商品'}
                  </DialogTitle>
                  <DialogDescription>
                    普通商品将在积分商城中展示，用户可通过积分兑换
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
                      placeholder="请输入商品名称（最多30字）"
                      maxLength={30}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  {/* 商品类型 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      商品类型 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="virtual"
                          checked={formData.type === 'virtual'}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              type: e.target.value as any,
                              stock: e.target.value === 'virtual' ? '999999' : formData.stock
                            });
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">虚拟商品</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="physical"
                          checked={formData.type === 'physical'}
                          onChange={(e) =>
                            setFormData({ ...formData, type: e.target.value as any })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm">实体商品</span>
                      </label>
                    </div>
                  </div>

                  {/* 所需积分 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      所需积分 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                      placeholder="请输入所需积分（正整数）"
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
                      placeholder={
                        formData.type === 'virtual'
                          ? '虚拟商品默认999999'
                          : '请输入库存数量'
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.stock ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.stock && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.stock}</p>
                    )}
                  </div>

                  {/* 兑换限制 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      兑换限制
                      <span className="text-gray-400 font-normal ml-1">（不填则不限）</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.exchangeLimit}
                      onChange={(e) => setFormData({ ...formData, exchangeLimit: e.target.value })}
                      placeholder="不填表示不限次数"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.exchangeLimit ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.exchangeLimit && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.exchangeLimit}</p>
                    )}
                  </div>

                  {/* 商品头图 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      商品头图 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageUpload}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.image ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.image && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.image}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">支持JPG/PNG格式，大小不超过2MB</p>
                    {formData.image && (
                      <div className="mt-2">
                        <img
                          src={formData.image}
                          alt="预览"
                          className="w-40 h-40 object-cover rounded border border-gray-300"
                        />
                      </div>
                    )}
                  </div>

                  {/* 描述摘要 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      描述摘要 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="请输入商品描述（最多50字）"
                      maxLength={50}
                      rows={2}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                        formErrors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.description && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      {formData.description.length}/50
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

            {selectedRows.size > 0 && (
              <>
                <Button
                  onClick={() => handleBatchToggle('online')}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  批量上架 ({selectedRows.size})
                </Button>
                <Button
                  onClick={() => handleBatchToggle('offline')}
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                >
                  <ArrowDown className="w-4 h-4 mr-2" />
                  批量下架
                </Button>
                <Button
                  onClick={() => {
                    if (selectedRows.size > 50) {
                      alert('批量删除单次上限50条');
                      return;
                    }
                    if (confirm(`确定要删除选中的 ${selectedRows.size} 个商品吗？删除后无法恢复。`)) {
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
            共 {products.length} 个商品 · 上架{' '}
            {products.filter((p) => p.status === 'online').length} 个 · 下架{' '}
            {products.filter((p) => p.status === 'offline').length} 个
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
              placeholder="搜索商品名称（1-20个字符）"
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

          {/* 类型筛选 */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部类型</option>
            <option value="virtual">虚拟商品</option>
            <option value="physical">实体商品</option>
          </select>

          {/* 状态筛选 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部状态</option>
            <option value="online">已上架</option>
            <option value="offline">已下架</option>
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
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={filteredProducts.filter(p => p.status !== 'archived').length > 0 && selectedRows.size === filteredProducts.filter(p => p.status !== 'archived').length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </TableHead>
                <TableHead className="w-32">商品ID</TableHead>
                <TableHead className="w-12">头图</TableHead>
                <TableHead className="w-48">商品名称</TableHead>
                <TableHead className="w-24">商品类型</TableHead>
                <TableHead
                  className="w-24 cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('points')}
                >所需积分<SortIndicator field="points" /></TableHead>
                <TableHead
                  className="w-24 cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('stock')}
                >库存<SortIndicator field="stock" /></TableHead>
                <TableHead
                  className="w-24 cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('exchangedCount')}
                >已兑换<SortIndicator field="exchangedCount" /></TableHead>
                <TableHead className="w-20">状态</TableHead>
                <TableHead
                  className="w-32 cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >创建时间<SortIndicator field="createdAt" /></TableHead>
                <TableHead className="w-52">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-32 text-center text-gray-500">
                    {products.length === 0
                      ? '暂无商品，点击"新增商品"开始创建'
                      : '没有符合筛选条件的商品'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className={`hover:bg-gray-50 ${product.isPinned ? 'bg-yellow-50/40' : ''}`}>
                    {/* 选择框 */}
                    <TableCell>
                      {product.status !== 'archived' && (
                        <input
                          type="checkbox"
                          checked={selectedRows.has(product.id)}
                          onChange={() => handleSelectRow(product.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      )}
                    </TableCell>

                    {/* 商品ID */}
                    <TableCell>
                      <div className="text-xs text-gray-600 font-mono">{product.id}</div>
                    </TableCell>

                    {/* 头图 */}
                    <TableCell>
                      {imageError[product.id] ? (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <ImageOff className="w-5 h-5 text-gray-400" />
                        </div>
                      ) : (
                        <img
                          src={product.image}
                          alt={product.name}
                          onError={() => handleImageError(product.id)}
                          className="w-10 h-10 object-cover rounded border border-gray-300"
                        />
                      )}
                    </TableCell>

                    {/* 商品名称 */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {product.isPinned && <span className="text-yellow-500 text-xs">📌</span>}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* 商品类型 */}
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          product.type === 'virtual'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        <Package className="w-3 h-3 mr-1" />
                        {product.type === 'virtual' ? '虚拟' : '实体'}
                      </span>
                    </TableCell>

                    {/* 所需积分 */}
                    <TableCell>
                      <div className="text-sm font-medium text-orange-600">{product.points}</div>
                    </TableCell>

                    {/* 库存 */}
                    <TableCell>
                      {editingStock?.id === product.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={editingStock.stock}
                            onChange={(e) =>
                              setEditingStock({
                                ...editingStock,
                                stock: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-16 px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={handleSaveStock}
                            className="text-green-600 hover:text-green-700"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditingStock(null)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenStockEdit(product)}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 flex items-center gap-1"
                        >
                          {product.stock}
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                      {product.stock === 0 && (
                        <div className="text-xs text-red-500 mt-0.5">缺货</div>
                      )}
                    </TableCell>

                    {/* 已兑换数量 */}
                    <TableCell>
                      <div className="text-sm font-medium text-gray-700">{product.exchangedCount ?? 0}</div>
                    </TableCell>

                    {/* 状态 */}
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 'online'
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'archived'
                            ? 'bg-gray-300 text-gray-600'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.status === 'online'
                          ? '上架'
                          : product.status === 'archived'
                          ? '已归档'
                          : '下架'}
                      </span>
                    </TableCell>

                    {/* 创建时间 */}
                    <TableCell>
                      <div className="text-xs text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {product.createdAt}
                      </div>
                    </TableCell>

                    {/* 操作 */}
                    <TableCell>
                      {product.status !== 'archived' ? (
                        <div className="flex items-center gap-1 flex-wrap">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => onToggleStatus(product.id)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              product.status === 'online'
                                ? 'text-orange-600 hover:bg-orange-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {product.status === 'online' ? '下架' : '上架'}
                          </button>
                          <button
                            onClick={() => handlePreview(product)}
                            className="px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          >
                            预览
                          </button>
                          <button
                            onClick={() => onTogglePin(product.id)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${product.isPinned ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-50'}`}
                          >
                            {product.isPinned ? '取消置顶' : '置顶'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`确定要删除商品"${product.name}"吗？删除后无法恢复。`)) {
                                onDelete(product.id);
                              }
                            }}
                            className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            删除
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">已归档</span>
                      )}
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>商品预览</DialogTitle>
              <DialogDescription>积分商城前端展示效果</DialogDescription>
            </DialogHeader>

            <div className="border-2 border-blue-200 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50">
              {/* 头图 */}
              <div className="mb-4">
                {imageError[previewProduct.id] ? (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <ImageOff className="w-16 h-16 text-gray-400" />
                  </div>
                ) : (
                  <img
                    src={previewProduct.image}
                    alt={previewProduct.name}
                    onError={() => handleImageError(previewProduct.id)}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
              </div>

              {/* 商品信息 */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{previewProduct.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      {previewProduct.points} 积分
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      库存: {previewProduct.stock}
                    </div>
                  </div>
                </div>

                {previewProduct.description && (
                  <p className="text-sm text-gray-600">{previewProduct.description}</p>
                )}

                <button
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    previewProduct.status === 'online' && previewProduct.stock > 0
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                  disabled={previewProduct.status !== 'online' || previewProduct.stock === 0}
                >
                  {previewProduct.status !== 'online'
                    ? '商品已下架'
                    : previewProduct.stock === 0
                    ? '库存不足'
                    : '立即兑换'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}