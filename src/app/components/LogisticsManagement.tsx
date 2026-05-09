import React, { useState } from 'react';
import {
  Truck, Search, Download, Upload, Eye, Edit2, Trash2,
  AlertTriangle, CheckCircle, X, RefreshCw, AlertCircle, Package,
  FilePlus, XCircle, Ban,
} from 'lucide-react';

export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'abnormal' | 'cancelled';

interface LogisticsEvent {
  time: string;
  location: string;
  description: string;
}

interface Order {
  id: string;
  orderNo: string;
  userName: string;
  userPhone: string;
  address: string;
  productName: string;
  quantity: number;
  points: number;
  status: OrderStatus;
  courier?: string;
  trackingNo?: string;
  logisticsUpdatedAt?: string;
  createdAt: string;
  timeline?: LogisticsEvent[];
  abnormalReason?: string;
  cancelReason?: string;
}

interface OperationLog {
  id: string;
  time: string;
  operator: string;
  action: string;
  orderNo: string;
  pointsRefunded?: number;
  reason?: string;
}

interface FullOrderForm {
  orderNo: string;
  userName: string;
  userPhone: string;
  address: string;
  productName: string;
  quantity: string;
  points: string;
  status: OrderStatus;
  courier: string;
  trackingNo: string;
  abnormalReason: string;
  cancelReason: string;
}

const EMPTY_FORM: FullOrderForm = {
  orderNo: '', userName: '', userPhone: '', address: '',
  productName: '', quantity: '1', points: '', status: 'pending',
  courier: '', trackingNo: '', abnormalReason: '', cancelReason: '',
};

const COURIERS = ['顺丰速运', '中通快递', '韵达快递', '申通快递', '圆通速递', '极兔速递', '邮政EMS', '京东快递'];

const STATUS_CONFIG: Record<OrderStatus, { label: string; textColor: string; badgeCls: string }> = {
  pending:   { label: '待发货', textColor: 'text-amber-600',  badgeCls: 'bg-amber-50 border-amber-200 text-amber-600' },
  shipped:   { label: '已发货', textColor: 'text-blue-600',   badgeCls: 'bg-blue-50 border-blue-200 text-blue-600' },
  delivered: { label: '已完成', textColor: 'text-green-600',  badgeCls: 'bg-green-50 border-green-200 text-green-600' },
  abnormal:  { label: '异常',   textColor: 'text-red-600',    badgeCls: 'bg-red-50 border-red-200 text-red-600' },
  cancelled: { label: '已取消', textColor: 'text-gray-500',   badgeCls: 'bg-gray-50 border-gray-200 text-gray-500' },
};

const STATUS_DOT: Record<OrderStatus, string> = {
  pending:   'bg-amber-400',
  shipped:   'bg-blue-400',
  delivered: 'bg-green-400',
  abnormal:  'bg-red-400',
  cancelled: 'bg-gray-400',
};

function createSampleOrders(): Order[] {
  return [
    {
      id: 'ord-001',
      orderNo: 'ORD20260501001',
      userName: '张明华',
      userPhone: '138****8801',
      address: '北京市朝阳区建国路88号',
      productName: '养生茶包礼盒',
      quantity: 2,
      points: 500,
      status: 'delivered',
      courier: '顺丰速运',
      trackingNo: 'SF1234567890',
      logisticsUpdatedAt: '2026-05-05 14:23',
      createdAt: '2026-05-01 10:15',
      timeline: [
        { time: '2026-05-05 14:23', location: '北京市朝阳区', description: '快件已签收，签收人：本人' },
        { time: '2026-05-05 09:10', location: '北京市朝阳区建国路营业点', description: '派件中，快递员：李师傅，电话：136****0023' },
        { time: '2026-05-04 22:30', location: '北京转运中心', description: '快件到达北京转运中心' },
        { time: '2026-05-03 15:45', location: '上海浦东转运中心', description: '快件已从上海浦东转运中心发出' },
        { time: '2026-05-01 11:30', location: '上海市浦东新区', description: '快件已揽收' },
      ],
    },
    {
      id: 'ord-002',
      orderNo: 'ORD20260502008',
      userName: '李秀芬',
      userPhone: '139****6702',
      address: '上海市浦东新区张江高科园区',
      productName: '经络调理精油套装',
      quantity: 1,
      points: 880,
      status: 'shipped',
      courier: '中通快递',
      trackingNo: 'ZT9876543210',
      logisticsUpdatedAt: '2026-05-05 18:02',
      createdAt: '2026-05-02 14:30',
      timeline: [
        { time: '2026-05-05 18:02', location: '上海转运中心', description: '快件到达上海转运中心，正在分拣' },
        { time: '2026-05-04 08:15', location: '杭州转运中心', description: '快件已从杭州转运中心发出' },
        { time: '2026-05-03 20:40', location: '杭州市拱墅区', description: '快件已揽收' },
      ],
    },
    {
      id: 'ord-003',
      orderNo: 'ORD20260502015',
      userName: '王建国',
      userPhone: '155****3301',
      address: '广州市天河区珠江新城',
      productName: '本草养生礼盒',
      quantity: 3,
      points: 1200,
      status: 'shipped',
      courier: '韵达快递',
      trackingNo: 'YD2468135790',
      logisticsUpdatedAt: '2026-05-03 11:20',
      createdAt: '2026-05-02 09:00',
      timeline: [
        { time: '2026-05-03 11:20', location: '深圳宝安区揽收点', description: '快件已揽收，准备发往广州' },
      ],
    },
    {
      id: 'ord-004',
      orderNo: 'ORD20260503002',
      userName: '赵美玲',
      userPhone: '186****2208',
      address: '成都市锦江区春熙路',
      productName: '养生茶包年卡',
      quantity: 1,
      points: 2000,
      status: 'abnormal',
      courier: '申通快递',
      trackingNo: 'STO1357924680',
      logisticsUpdatedAt: '2026-05-04 16:45',
      createdAt: '2026-05-03 15:20',
      abnormalReason: '快递公司反馈地址不存在，需联系用户确认',
      timeline: [
        { time: '2026-05-04 16:45', location: '成都市锦江区', description: '地址无法识别，退回转运中心' },
        { time: '2026-05-04 10:30', location: '成都转运中心', description: '快件到达成都转运中心' },
        { time: '2026-05-03 16:00', location: '北京朝阳区揽收点', description: '快件已揽收' },
      ],
    },
    {
      id: 'ord-004b',
      orderNo: 'ORD20260503009',
      userName: '吴晓燕',
      userPhone: '182****4407',
      address: '深圳市南山区科技园',
      productName: '经络调理精油套装',
      quantity: 1,
      points: 880,
      status: 'delivered',
      courier: '顺丰速运',
      trackingNo: 'SF3344556677',
      logisticsUpdatedAt: '2026-05-05 16:10',
      createdAt: '2026-05-03 11:00',
      timeline: [
        { time: '2026-05-05 16:10', location: '深圳市南山区科技园', description: '快件已送达，放至前台，等待取件' },
        { time: '2026-05-05 09:45', location: '深圳南山区派送站', description: '派件中，快递员：王师傅，电话：159****0056' },
        { time: '2026-05-04 23:30', location: '深圳转运中心', description: '快件到达深圳转运中心' },
        { time: '2026-05-03 12:00', location: '上海市浦东新区', description: '快件已揽收' },
      ],
    },
    {
      id: 'ord-005',
      orderNo: 'ORD20260503018',
      userName: '陈志强',
      userPhone: '177****9904',
      address: '武汉市武昌区武汉大学旁',
      productName: '经络调理精油套装',
      quantity: 2,
      points: 1760,
      status: 'pending',
      createdAt: '2026-05-03 20:10',
    },
    {
      id: 'ord-006',
      orderNo: 'ORD20260504005',
      userName: '孙丽华',
      userPhone: '150****7703',
      address: '杭州市西湖区文三路',
      productName: '养生茶包礼盒',
      quantity: 1,
      points: 250,
      status: 'pending',
      createdAt: '2026-05-04 08:45',
    },
    {
      id: 'ord-007',
      orderNo: 'ORD20260504022',
      userName: '刘明远',
      userPhone: '134****1102',
      address: '西安市雁塔区大雁塔北广场',
      productName: '本草养生礼盒',
      quantity: 2,
      points: 800,
      status: 'shipped',
      courier: '圆通速递',
      trackingNo: 'YT8642097531',
      logisticsUpdatedAt: '2026-05-05 09:00',
      createdAt: '2026-05-04 13:30',
      timeline: [
        { time: '2026-05-05 09:00', location: '西安揽收点', description: '快件已揽收，准备发往西安市区' },
      ],
    },
    {
      id: 'ord-008',
      orderNo: 'ORD20260505001',
      userName: '周晓燕',
      userPhone: '189****5506',
      address: '南京市鼓楼区汉中路',
      productName: '养生茶包礼盒',
      quantity: 4,
      points: 1000,
      status: 'cancelled',
      createdAt: '2026-05-05 07:30',
      cancelReason: '用户主动申请取消，地址填写错误',
    },
  ];
}

type ImportStep = 'upload' | 'preview' | 'result';

interface ImportPreview {
  success: Array<{ orderNo: string; courier: string; trackingNo: string }>;
  failed: Array<{ row: number; orderNo: string; reason: string }>;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function orderToForm(o: Order): FullOrderForm {
  return {
    orderNo: o.orderNo,
    userName: o.userName,
    userPhone: o.userPhone,
    address: o.address,
    productName: o.productName,
    quantity: String(o.quantity),
    points: String(o.points),
    status: o.status,
    courier: o.courier ?? '',
    trackingNo: o.trackingNo ?? '',
    abnormalReason: o.abnormalReason ?? '',
    cancelReason: o.cancelReason ?? '',
  };
}

function nowString() {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed';

const ALL_STATUSES: OrderStatus[] = ['pending', 'shipped', 'delivered', 'abnormal', 'cancelled'];

// ── component ─────────────────────────────────────────────────────────────────

export function LogisticsManagement() {
  const [orders, setOrders] = useState<Order[]>(() => createSampleOrders());
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'points' | 'createdAt' | 'quantity' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // Full order form modal (create or edit-all)
  const [fullModal, setFullModal] = useState<{ mode: 'create' | 'edit'; orderId?: string } | null>(null);
  const [fullForm, setFullForm] = useState<FullOrderForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FullOrderForm, string>>>({});

  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState(false);

  // Cancel order modal
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonError, setCancelReasonError] = useState('');

  // Import state
  const [importStep, setImportStep] = useState<ImportStep>('upload');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importParsing, setImportParsing] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);

  const filteredOrders = orders
    .filter(order => {
      const matchSearch =
        !searchText ||
        order.orderNo.includes(searchText) ||
        order.userName.includes(searchText) ||
        (order.trackingNo && order.trackingNo.includes(searchText));
      const matchStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortField === 'points') return sortDir === 'asc' ? a.points - b.points : b.points - a.points;
      if (sortField === 'quantity') return sortDir === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity;
      if (sortField === 'createdAt') return sortDir === 'asc' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt);
      return b.createdAt.localeCompare(a.createdAt);
    });

  const allSelected =
    filteredOrders.length > 0 && filteredOrders.every(o => selectedIds.includes(o.id));

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(filteredOrders.map(o => o.id));
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
  };

  const handleSort = (field: 'points' | 'createdAt' | 'quantity') => {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIndicator = ({ field }: { field: 'points' | 'createdAt' | 'quantity' }) => {
    if (sortField !== field) return <span className="text-gray-300 ml-0.5 text-xs">↕</span>;
    return <span className="text-blue-500 ml-0.5 text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  // ── view order detail ────────────────────────────────────────────────────

  const handleViewDetail = async (order: Order) => {
    setViewOrder(order);
    setTimelineError(false);
    if (order.trackingNo && (!order.timeline || order.timeline.length === 0)) {
      setTimelineLoading(true);
      await new Promise(r => setTimeout(r, 1500));
      if (Math.random() < 0.1) setTimelineError(true);
      setTimelineLoading(false);
    }
  };

  // ── full order form ───────────────────────────────────────────────────────

  const openCreate = () => {
    setFullForm(EMPTY_FORM);
    setFormErrors({});
    setFullModal({ mode: 'create' });
  };

  const openEdit = (order: Order) => {
    setFullForm(orderToForm(order));
    setFormErrors({});
    setFullModal({ mode: 'edit', orderId: order.id });
  };

  const setField = (key: keyof FullOrderForm, value: string) => {
    setFullForm(prev => ({ ...prev, [key]: value }));
    setFormErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validateForm = (): boolean => {
    const errs: Partial<Record<keyof FullOrderForm, string>> = {};
    if (!fullForm.orderNo.trim()) errs.orderNo = '请填写订单号';
    if (!fullForm.userName.trim()) errs.userName = '请填写用户姓名';
    if (!fullForm.userPhone.trim()) errs.userPhone = '请填写手机号';
    if (!fullForm.address.trim()) errs.address = '请填写收货地址';
    if (!fullForm.productName.trim()) errs.productName = '请填写商品名称';
    if (!fullForm.quantity || Number(fullForm.quantity) < 1) errs.quantity = '数量须≥1';
    if (!fullForm.points || Number(fullForm.points) < 0) errs.points = '请填写积分';
    if (fullForm.status === 'abnormal' && !fullForm.abnormalReason.trim()) {
      errs.abnormalReason = '状态为异常时必须填写异常原因';
    }
    if (fullForm.status === 'cancelled' && !fullForm.cancelReason.trim()) {
      errs.cancelReason = '状态为已取消时必须填写取消原因';
    }
    if (fullForm.trackingNo && (fullForm.trackingNo.length < 8 || fullForm.trackingNo.length > 30)) {
      errs.trackingNo = '快递单号长度须为8-30字符';
    }
    if (fullForm.trackingNo && !fullForm.courier) errs.courier = '填写快递单号时快递公司必填';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveFullOrder = () => {
    if (!validateForm()) return;

    const hasLogistics = !!(fullForm.courier && fullForm.trackingNo);

    if (fullModal?.mode === 'create') {
      if (orders.some(o => o.orderNo === fullForm.orderNo.trim())) {
        setFormErrors(prev => ({ ...prev, orderNo: '订单号已存在' }));
        return;
      }
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNo: fullForm.orderNo.trim(),
        userName: fullForm.userName.trim(),
        userPhone: fullForm.userPhone.trim(),
        address: fullForm.address.trim(),
        productName: fullForm.productName.trim(),
        quantity: Number(fullForm.quantity),
        points: Number(fullForm.points),
        status: fullForm.status,
        courier: fullForm.courier || undefined,
        trackingNo: fullForm.trackingNo || undefined,
        logisticsUpdatedAt: hasLogistics ? nowString() : undefined,
        createdAt: nowString(),
        abnormalReason: fullForm.status === 'abnormal' ? fullForm.abnormalReason.trim() : undefined,
        cancelReason: fullForm.status === 'cancelled' ? fullForm.cancelReason.trim() : undefined,
      };
      setOrders(prev => [newOrder, ...prev]);
    } else if (fullModal?.mode === 'edit' && fullModal.orderId) {
      setOrders(prev =>
        prev.map(o => {
          if (o.id !== fullModal.orderId) return o;
          const orderNoChanged = o.orderNo !== fullForm.orderNo.trim();
          if (orderNoChanged && orders.some(x => x.id !== o.id && x.orderNo === fullForm.orderNo.trim())) {
            setFormErrors(prev2 => ({ ...prev2, orderNo: '订单号已存在' }));
            return o;
          }
          return {
            ...o,
            orderNo: fullForm.orderNo.trim(),
            userName: fullForm.userName.trim(),
            userPhone: fullForm.userPhone.trim(),
            address: fullForm.address.trim(),
            productName: fullForm.productName.trim(),
            quantity: Number(fullForm.quantity),
            points: Number(fullForm.points),
            status: fullForm.status,
            courier: fullForm.courier || undefined,
            trackingNo: fullForm.trackingNo || undefined,
            logisticsUpdatedAt: hasLogistics ? nowString() : o.logisticsUpdatedAt,
            timeline: (fullForm.courier !== o.courier || fullForm.trackingNo !== o.trackingNo)
              ? undefined
              : o.timeline,
            abnormalReason: fullForm.status === 'abnormal' ? fullForm.abnormalReason.trim() : undefined,
            cancelReason: fullForm.status === 'cancelled' ? fullForm.cancelReason.trim() : undefined,
          };
        })
      );
    }
    setFullModal(null);
  };

  // ── cancel order ──────────────────────────────────────────────────────────

  const openCancelDialog = (order: Order) => {
    setCancelTarget(order);
    setCancelReason('');
    setCancelReasonError('');
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    if (!cancelReason.trim()) {
      setCancelReasonError('请填写取消原因');
      return;
    }
    setOrders(prev =>
      prev.map(o =>
        o.id === cancelTarget.id
          ? { ...o, status: 'cancelled' as OrderStatus, cancelReason: cancelReason.trim() }
          : o
      )
    );
    setOperationLogs(prev => [
      {
        id: `log-${Date.now()}`,
        time: nowString(),
        operator: '管理员',
        action: '取消订单并退分',
        orderNo: cancelTarget.orderNo,
        pointsRefunded: cancelTarget.points,
        reason: cancelReason.trim(),
      },
      ...prev,
    ]);
    setCancelTarget(null);
    setCancelReason('');
    setCancelReasonError('');
  };

  // ── export ────────────────────────────────────────────────────────────────

  const handleExport = () => {
    if (filteredOrders.length > 5000) {
      alert('导出数据量过大，请缩小筛选范围后重试');
      return;
    }
    alert(`已导出 ${filteredOrders.length} 条订单数据（含完整物流信息）`);
  };

  // ── import ────────────────────────────────────────────────────────────────

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('请上传 .xlsx 或 .xls 格式文件');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小超过限制，请拆分后分批导入');
      return;
    }
    setImportFile(file);
    setImportParsing(true);
    setTimeout(() => {
      setImportParsing(false);
      setImportPreview({
        success: [
          { orderNo: 'ORD20260505001', courier: '顺丰速运', trackingNo: 'SF9988776655' },
          { orderNo: 'ORD20260503018', courier: '中通快递', trackingNo: 'ZT1122334455' },
          { orderNo: 'ORD20260504005', courier: '韵达快递', trackingNo: 'YD9876543210' },
        ],
        failed: [
          { row: 4, orderNo: 'ORD99999999', reason: '订单号不存在' },
          { row: 5, orderNo: 'ORD20260501001', reason: '该订单已发货，非待发货状态' },
          { row: 6, orderNo: 'ORD20260502015', reason: '快递单号格式不合法（长度不足8位）' },
        ],
      });
      setImportStep('preview');
    }, 900);
  };

  const handleConfirmImport = () => {
    if (!importPreview) return;
    setOrders(prev =>
      prev.map(o => {
        const match = importPreview.success.find(s => s.orderNo === o.orderNo);
        if (!match) return o;
        return {
          ...o,
          status: 'shipped' as OrderStatus,
          courier: match.courier,
          trackingNo: match.trackingNo,
          logisticsUpdatedAt: nowString(),
        };
      })
    );
    setImportStep('result');
  };

  const handleCloseImport = () => {
    setShowImport(false);
    setImportStep('upload');
    setImportFile(null);
    setImportPreview(null);
    setImportParsing(false);
  };

  const handleDownloadTemplate = () => {
    alert('模板下载成功！\n\n字段说明（均为必填）：\n• 订单号\n• 快递公司\n• 快递单号（8-30字符）\n\n模板格式固定，请勿修改表头。');
  };

  const displayStatuses: OrderStatus[] = ['pending', 'shipped', 'delivered', 'abnormal'];

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="搜索订单号、用户名、快递单号..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              {ALL_STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              导入物流单号
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              导出全部
            </button>
            <button
              onClick={() => setShowLogs(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative"
            >
              <AlertCircle className="w-4 h-4" />
              操作日志
              {operationLogs.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {operationLogs.length > 9 ? '9+' : operationLogs.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Summary bar */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span>共 <strong className="text-gray-800 text-sm">{filteredOrders.length}</strong> 条订单</span>
          {selectedIds.length > 0 && <span className="text-blue-600 font-medium">已选 {selectedIds.length} 条</span>}
          <div className="ml-auto flex flex-wrap items-center gap-3">
            {ALL_STATUSES.map(s => (
              <span key={s} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[s]}`} />
                {STATUS_CONFIG[s].label}: {orders.filter(o => o.status === s).length}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3 px-4 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="rounded border-gray-300" />
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-600 whitespace-nowrap">订单号</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600 whitespace-nowrap">用户信息</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600 whitespace-nowrap">商品</th>
                <th
                  className="py-3 px-4 text-left font-medium text-gray-600 whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('quantity')}
                >兑换数量<SortIndicator field="quantity" /></th>
                <th
                  className="py-3 px-4 text-left font-medium text-gray-600 whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('points')}
                >积分<SortIndicator field="points" /></th>
                <th className="py-3 px-4 text-left font-medium text-gray-600 whitespace-nowrap">状态</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600 whitespace-nowrap">快递信息</th>
                <th
                  className="py-3 px-4 text-left font-medium text-gray-600 whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('createdAt')}
                >下单时间<SortIndicator field="createdAt" /></th>
                <th className="py-3 px-4 text-left font-medium text-gray-600 whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr
                  key={order.id}
                  className="border-b border-gray-50 transition-colors hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(order.id)}
                      onChange={e => toggleSelect(order.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {/* */}
                      <span className="font-mono text-xs text-gray-700 whitespace-nowrap">{order.orderNo}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{order.userName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{order.userPhone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-700 whitespace-nowrap">{order.productName}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-gray-700 font-medium">{order.quantity}</span>
                    <span className="text-gray-400 text-xs ml-0.5">件</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-amber-600 font-medium">{order.points.toLocaleString()}</span>
                    <span className="text-gray-400 text-xs ml-0.5">积分</span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${STATUS_CONFIG[order.status].badgeCls}`}>
                        {STATUS_CONFIG[order.status].label}
                      </span>
                      {order.status === 'abnormal' && order.abnormalReason && (
                        <p className="text-xs text-red-500 mt-1 max-w-[140px] leading-snug">{order.abnormalReason}</p>
                      )}
                      {order.status === 'cancelled' && order.cancelReason && (
                        <p className="text-xs text-gray-400 mt-1 max-w-[140px] leading-snug">{order.cancelReason}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {order.trackingNo ? (
                      <div>
                        <div className="text-gray-700 text-xs">{order.courier}</div>
                        <div className="font-mono text-xs text-gray-400 mt-0.5">{order.trackingNo}</div>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{order.createdAt}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        onClick={() => handleViewDetail(order)}
                        className="px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors whitespace-nowrap"
                      >
                        详情
                      </button>
                      <button
                        onClick={() => openEdit(order)}
                        className="px-2 py-0.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded transition-colors whitespace-nowrap"
                      >
                        编辑
                      </button>
                      {order.status !== 'cancelled' && (
                        <button
                          onClick={() => openCancelDialog(order)}
                          className="px-2 py-0.5 text-xs text-orange-600 hover:bg-orange-50 rounded transition-colors whitespace-nowrap"
                        >
                          取消
                        </button>
                      )}

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">暂无匹配的订单</p>
          </div>
        )}
      </div>

      {/* ── Full Order Form Modal (create / edit-all) ── */}
      {fullModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {fullModal.mode === 'create' ? '手动录入订单' : '编辑订单信息'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {fullModal.mode === 'edit' ? '订单号、商品、数量、积分不可修改' : '所有字段均可编辑'}
                </p>
              </div>
              <button onClick={() => setFullModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Section: 订单基本信息 */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">订单信息</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Field label="订单号" required>
                      <input
                        type="text"
                        value={fullForm.orderNo}
                        onChange={e => setField('orderNo', e.target.value)}
                         disabled={fullModal?.mode === 'edit'}
                        placeholder="如 ORD20260506001"
                        className={`${inputCls} font-mono ${formErrors.orderNo ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                      />
                      {formErrors.orderNo && <p className="text-xs text-red-500 mt-1">{formErrors.orderNo}</p>}
                    </Field>
                  </div>
                  <Field label="商品名称" required>
                    <input
                      type="text"
                      value={fullForm.productName}
                      onChange={e => setField('productName', e.target.value)}
                       disabled={fullModal?.mode === 'edit'}
                      placeholder="如 养生茶包礼盒"
                      className={`${inputCls} ${formErrors.productName ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                    />
                    {formErrors.productName && <p className="text-xs text-red-500 mt-1">{formErrors.productName}</p>}
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="数量" required>
                      <input
                        type="number"
                        min="1"
                        value={fullForm.quantity}
                        onChange={e => setField('quantity', e.target.value)}
                         disabled={fullModal?.mode === 'edit'}
                        className={`${inputCls} ${formErrors.quantity ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                      />
                      {formErrors.quantity && <p className="text-xs text-red-500 mt-1">{formErrors.quantity}</p>}
                    </Field>
                    <Field label="积分" required>
                      <input
                        type="number"
                        min="0"
                        value={fullForm.points}
                        onChange={e => setField('points', e.target.value)}
                         disabled={fullModal?.mode === 'edit'}
                        placeholder="0"
                        className={`${inputCls} ${formErrors.points ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                      />
                      {formErrors.points && <p className="text-xs text-red-500 mt-1">{formErrors.points}</p>}
                    </Field>
                  </div>
                  <div className="col-span-2">
                    <Field label="订单状态" required>
                      <select
                        value={fullForm.status}
                        onChange={e => setField('status', e.target.value)}
                        className={inputCls}
                      >
                        {ALL_STATUSES.map(s => (
                          <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  {/* Abnormal reason — required when status is abnormal */}
                  {fullForm.status === 'abnormal' && (
                    <div className="col-span-2">
                      <Field label="异常原因" required>
                        <textarea
                          rows={3}
                          value={fullForm.abnormalReason}
                          onChange={e => setField('abnormalReason', e.target.value)}
                          placeholder="请详细描述异常情况，便于后续跟进处理..."
                          className={`${inputCls} resize-none ${formErrors.abnormalReason ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                        ></textarea>
                        {formErrors.abnormalReason && <p className="text-xs text-red-500 mt-1">{formErrors.abnormalReason}</p>}
                      </Field>
                    </div>
                  )}
                  {fullForm.status === 'cancelled' && (
                    <div className="col-span-2">
                      <Field label="取消原因" required>
                        <textarea
                          rows={3}
                          value={fullForm.cancelReason}
                          onChange={e => setField('cancelReason', e.target.value)}
                          placeholder="请填写取消原因，将同步退还用户积分..."
                          className={`${inputCls} resize-none ${formErrors.cancelReason ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                        ></textarea>
                        {formErrors.cancelReason && <p className="text-xs text-red-500 mt-1">{formErrors.cancelReason}</p>}
                      </Field>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: 用户信息 */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">用户信息</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="用户姓名" required>
                    <input
                      type="text"
                      value={fullForm.userName}
                      onChange={e => setField('userName', e.target.value)}
                      placeholder="如 张明华"
                      className={`${inputCls} ${formErrors.userName ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                    />
                    {formErrors.userName && <p className="text-xs text-red-500 mt-1">{formErrors.userName}</p>}
                  </Field>
                  <Field label="手机号" required>
                    <input
                      type="text"
                      value={fullForm.userPhone}
                      onChange={e => setField('userPhone', e.target.value)}
                      placeholder="如 138****8801"
                      className={`${inputCls} ${formErrors.userPhone ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                    />
                    {formErrors.userPhone && <p className="text-xs text-red-500 mt-1">{formErrors.userPhone}</p>}
                  </Field>
                  <div className="col-span-2">
                    <Field label="收货地址" required>
                      <input
                        type="text"
                        value={fullForm.address}
                        onChange={e => setField('address', e.target.value)}
                        placeholder="如 北京市朝阳区建国路88号"
                        className={`${inputCls} ${formErrors.address ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                      />
                      {formErrors.address && <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>}
                    </Field>
                  </div>
                </div>
              </div>

              {/* Section: 物流信息 */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">物流信息 <span className="text-gray-300 font-normal normal-case">（选填）</span></p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="快递公司">
                    <select
                      value={fullForm.courier}
                      onChange={e => setField('courier', e.target.value)}
                      className={`${inputCls} ${formErrors.courier ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                    >
                      <option value="">请选择快递公司</option>
                      {COURIERS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {formErrors.courier && <p className="text-xs text-red-500 mt-1">{formErrors.courier}</p>}
                  </Field>
                  <Field label="快递单号">
                    <input
                      type="text"
                      value={fullForm.trackingNo}
                      onChange={e => setField('trackingNo', e.target.value)}
                      placeholder="8-30字符"
                      className={`${inputCls} font-mono ${formErrors.trackingNo ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                    />
                    {formErrors.trackingNo && <p className="text-xs text-red-500 mt-1">{formErrors.trackingNo}</p>}
                  </Field>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-4 justify-end border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setFullModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">取消</button>
              <button
                onClick={handleSaveFullOrder}
                className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {fullModal.mode === 'create' ? '确认录入' : '保存修改'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Order Detail Modal ── */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">订单详情</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{viewOrder.orderNo}</p>
              </div>
              <button onClick={() => { setViewOrder(null); setTimelineLoading(false); setTimelineError(false); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Order info summary */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">用户姓名</p>
                  <p className="font-medium text-gray-900">{viewOrder.userName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">手机号</p>
                  <p className="font-medium text-gray-900">{viewOrder.userPhone}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                  <p className="text-xs text-gray-400 mb-0.5">收货地址</p>
                  <p className="font-medium text-gray-900">{viewOrder.address}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">商品</p>
                  <p className="font-medium text-gray-900">{viewOrder.productName} ×{viewOrder.quantity}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">消耗积分</p>
                  <p className="font-medium text-amber-600">{viewOrder.points.toLocaleString()} 积分</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">下单时间</p>
                  <p className="font-medium text-gray-900">{viewOrder.createdAt}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">订单状态</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_CONFIG[viewOrder.status].badgeCls}`}>
                    {STATUS_CONFIG[viewOrder.status].label}
                  </span>
                </div>
                {viewOrder.status === 'abnormal' && viewOrder.abnormalReason && (
                  <div className="col-span-2 bg-red-50 border border-red-100 rounded-lg p-3">
                    <p className="text-xs text-red-500 mb-0.5">异常原因</p>
                    <p className="text-sm text-red-700">{viewOrder.abnormalReason}</p>
                  </div>
                )}
                {viewOrder.status === 'cancelled' && viewOrder.cancelReason && (
                  <div className="col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-0.5">取消原因</p>
                    <p className="text-sm text-gray-600">{viewOrder.cancelReason}</p>
                  </div>
                )}
              </div>

              {/* Logistics section */}
              {viewOrder.trackingNo ? (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">物流轨迹</p>
                  <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <Truck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{viewOrder.courier}</div>
                      <div className="font-mono text-xs text-gray-500 mt-0.5">{viewOrder.trackingNo}</div>
                    </div>
                  </div>
                  {timelineLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-400">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span className="text-sm">正在实时拉取物流轨迹...</span>
                    </div>
                  ) : timelineError ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                      <p className="text-sm text-gray-500">获取失败，请稍后重试</p>
                      <button
                        onClick={() => { setTimelineError(false); setTimelineLoading(true); setTimeout(() => setTimelineLoading(false), 1500); }}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        重新获取
                      </button>
                    </div>
                  ) : (
                    <div className="relative pl-8">
                      <div className="absolute left-3 top-3 bottom-3 w-px bg-gray-200" />
                      <div className="space-y-5">
                        {(viewOrder.timeline || []).map((event, idx) => (
                          <div key={idx} className="relative">
                            <div className={`absolute -left-5 w-6 h-6 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-blue-500' : 'bg-gray-100 border border-gray-200'}`}>
                              <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-white' : 'bg-gray-400'}`} />
                            </div>
                            <p className={`text-sm leading-snug ${idx === 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{event.description}</p>
                            <p className="text-xs text-gray-400 mt-1">{event.time} · {event.location}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-300">
                  <Truck className="w-8 h-8 mb-2" />
                  <p className="text-sm">暂无物流信息</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Order Modal ── */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">取消订单并退分</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    取消后将自动退还 <span className="font-medium text-amber-600">{cancelTarget.points.toLocaleString()} 积分</span> 至用户账户，此操作不可撤销。
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 mb-5 space-y-1">
                <div>订单号：<span className="font-mono font-medium">{cancelTarget.orderNo}</span></div>
                <div>用户：{cancelTarget.userName} · {cancelTarget.productName} ×{cancelTarget.quantity}</div>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  取消原因 <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={e => { setCancelReason(e.target.value); if (e.target.value.trim()) setCancelReasonError(''); }}
                  placeholder="请填写取消原因（必填），将记录在操作日志中..."
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none ${cancelReasonError ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200'}`}
                />
                {cancelReasonError && <p className="text-xs text-red-500 mt-1">{cancelReasonError}</p>}
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setCancelTarget(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">返回</button>
                <button onClick={handleConfirmCancel} className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
                  确认取消并退分
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Operation Log Modal ── */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="font-semibold text-gray-900">操作日志</h3>
                <p className="text-xs text-gray-400 mt-0.5">所有取消退分操作的永久记录</p>
              </div>
              <button onClick={() => setShowLogs(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {operationLogs.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">暂无操作记录</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium text-gray-600 whitespace-nowrap">操作时间</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-600 whitespace-nowrap">操作人</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-600 whitespace-nowrap">订单号</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-600 whitespace-nowrap">操作内容</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-600 whitespace-nowrap">取消原因</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-600 whitespace-nowrap">退还积分</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operationLogs.map(log => (
                      <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{log.time}</td>
                        <td className="py-3 px-4 text-gray-700">{log.operator}</td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-700 whitespace-nowrap">{log.orderNo}</td>
                        <td className="py-3 px-4 text-gray-700">
                          <span className={log.action.includes('失败') ? 'text-red-600' : ''}>{log.action}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs max-w-[180px]">{log.reason ?? '—'}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {log.pointsRefunded != null && (
                            <span className="text-amber-600 font-medium">+{log.pointsRefunded.toLocaleString()}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Import Modal ── */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="font-semibold text-gray-900">导入物流单号</h3>
                <div className="flex items-center gap-2 mt-2">
                  {(['upload', 'preview', 'result'] as ImportStep[]).map((step, idx) => (
                    <React.Fragment key={step}>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        importStep === step ? 'bg-blue-600 text-white' :
                        (['upload','preview','result'].indexOf(importStep) > idx) ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {step === 'upload' ? '① 上传文件' : step === 'preview' ? '② 校验预览' : '③ 导入完成'}
                      </span>
                      {idx < 2 && <div className="w-8 h-px bg-gray-200" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <button onClick={handleCloseImport} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {importStep === 'upload' && (
                <div className="space-y-5">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1.5">导入须知</p>
                      <ul className="space-y-1 text-xs leading-relaxed">
                        <li>• 仅超级管理员和物流运营人员可操作，权限不足将返回 403</li>
                        <li>• 单次导入上限 2000 条，文件大小 ≤ 10MB</li>
                        <li>• 支持 .xlsx / .xls 格式，请使用标准模板，不可修改表头</li>
                        <li>• 必填字段：订单号、快递公司、快递单号（8-30字符）</li>
                      </ul>
                    </div>
                  </div>
                  <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4" />
                    下载导入模板
                  </button>
                  <label className="block border-2 border-dashed border-gray-200 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-colors">
                    {importParsing ? (
                      <div className="flex flex-col items-center gap-3 text-blue-500">
                        <RefreshCw className="w-10 h-10 animate-spin" />
                        <p className="text-sm">正在解析文件...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm text-gray-600 mb-1">点击上传或拖拽文件至此处</p>
                        <p className="text-xs text-gray-400">.xlsx / .xls，最大 10MB，单次最多 2000 条</p>
                      </>
                    )}
                    <input type="file" accept=".xlsx,.xls" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ''; }} />
                  </label>
                  {importFile && !importParsing && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-green-700 font-medium">{importFile.name}</span>
                    </div>
                  )}
                </div>
              )}

              {importStep === 'preview' && importPreview && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">{importPreview.success.length}</div>
                      <div className="text-sm text-green-700">校验成功，将更新</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                      <div className="text-3xl font-bold text-red-600 mb-1">{importPreview.failed.length}</div>
                      <div className="text-sm text-red-700">校验失败，将跳过</div>
                    </div>
                  </div>
                  {importPreview.success.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />成功行
                      </h4>
                      <div className="border border-gray-100 rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50"><tr>
                            <th className="py-2 px-3 text-left text-gray-500 font-medium">订单号</th>
                            <th className="py-2 px-3 text-left text-gray-500 font-medium">快递公司</th>
                            <th className="py-2 px-3 text-left text-gray-500 font-medium">快递单号</th>
                          </tr></thead>
                          <tbody>{importPreview.success.map((row, i) => (
                            <tr key={i} className="border-t border-gray-50">
                              <td className="py-2 px-3 font-mono">{row.orderNo}</td>
                              <td className="py-2 px-3">{row.courier}</td>
                              <td className="py-2 px-3 font-mono">{row.trackingNo}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {importPreview.failed.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />失败行
                      </h4>
                      <div className="border border-red-100 rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-red-50"><tr>
                            <th className="py-2 px-3 text-left text-gray-500 font-medium">行号</th>
                            <th className="py-2 px-3 text-left text-gray-500 font-medium">订单号</th>
                            <th className="py-2 px-3 text-left text-gray-500 font-medium">失败原因</th>
                          </tr></thead>
                          <tbody>{importPreview.failed.map((row, i) => (
                            <tr key={i} className="border-t border-red-50 bg-red-50/30">
                              <td className="py-2 px-3 text-gray-400">第 {row.row} 行</td>
                              <td className="py-2 px-3 font-mono text-gray-600">{row.orderNo}</td>
                              <td className="py-2 px-3 text-red-600">{row.reason}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {importStep === 'result' && importPreview && (
                <div className="text-center py-10">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">导入完成</h4>
                  <p className="text-sm text-gray-500">{importPreview.success.length} 条导入成功，{importPreview.failed.length} 条导入失败</p>
                  {importPreview.failed.length > 0 && <p className="text-xs text-gray-400 mt-1">失败条目已跳过，未作任何变更</p>}
                  <p className="text-xs text-gray-400 mt-1">用户端推送通知已触发</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 justify-end border-t border-gray-100 flex-shrink-0">
              {importStep === 'upload' && <button onClick={handleCloseImport} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">取消</button>}
              {importStep === 'preview' && importPreview && (
                <>
                  <button onClick={() => { setImportStep('upload'); setImportFile(null); setImportPreview(null); }} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">重新上传</button>
                  <button onClick={handleConfirmImport} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">确认导入（{importPreview.success.length} 条）</button>
                </>
              )}
              {importStep === 'result' && <button onClick={handleCloseImport} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">完成</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
