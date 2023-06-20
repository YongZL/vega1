import { optionsToValueEnum, optionsToTextMap } from '@/utils/dataUtil';

const systemType = sessionStorage.getItem('systemType');
const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');

const approvalStatus = [
  { value: 'withdraw', label: '撤回', color: CONFIG_LESS['@c_starus_disabled'] },
  { value: 'approval_pending', label: '待审核', color: CONFIG_LESS['@c_starus_await'] },
  { value: 'approval_failure', label: '审核不通过', color: CONFIG_LESS['@c_starus_warning'] },
  { value: 'approval_review_pending', label: '待复核', color: CONFIG_LESS['@c_starus_await'] },
  { value: 'approval_review_success', label: '复核通过', color: CONFIG_LESS['@c_starus_done'] },
  { value: 'approval_part_success', label: '部分通过', color: CONFIG_LESS['@c_starus_underway'] },
  {
    value: 'approval_review_failure',
    label: '复核不通过',
    color: CONFIG_LESS['@c_starus_warning'],
  },
  { value: 'purchasing', label: '采购中', color: CONFIG_LESS['@c_starus_underway'] },
  { value: 'in_delivery', label: '配送中', color: CONFIG_LESS['@c_starus_underway'] },
  { value: 'partial_delivery', label: '部分配送', color: CONFIG_LESS['@c_starus_underway'] },
  { value: 'all_accept', label: '全部验收', color: CONFIG_LESS['@c_starus_done'] },
  { value: 'partial_accept', label: '部分验收', color: CONFIG_LESS['@c_starus_underway'] },
];
// const approvalStatusValueEnum = optionsToValueEnum(approvalStatus);
const approvalStatusTextMap = optionsToTextMap(approvalStatus);
export { approvalStatus, approvalStatusTextMap };

// warehousing_apply
const warehousingApply = [
  { label: '待审核', value: 'approval_pending' },
  { label: '待复核', value: 'approval_review_pending' },
  { label: '审核不通过', value: 'approval_failure' },
  { label: '复核不通过', value: 'approval_review_failure' },
  { label: '撤回', value: 'withdraw' },
  { label: '采购中', value: 'purchasing' },
  { label: '配送中', value: 'in_delivery' },
  { label: '验收通过', value: 'accept_all_pass' },
  { label: '部分通过', value: 'partial_pass' },
  { label: '验收不通过', value: 'accept_reject' },
];
export { warehousingApply };

// shipping_order_status
const shippingOrderStatus = [
  { label: '配送中', value: 'delivering', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '确认送达', value: 'arrived', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '验收中', value: 'receiving', color: CONFIG_LESS['@c_starus_underway'] },
];
const shippingOrderStatus2 = [
  { label: '验收通过', value: 'all_pass', color: CONFIG_LESS['@c_starus_done'] },
  { label: '部分通过', value: 'partial_pass', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '验收不通过', value: 'all_reject', color: CONFIG_LESS['@c_starus_warning'] },
];
// shipping_order_status3
const shippingOrderStatus3 = [...shippingOrderStatus, ...shippingOrderStatus2];
const shippingOrderStatusValueEnum = optionsToValueEnum(shippingOrderStatus3);
const shippingOrderStatusTextMap = optionsToTextMap(shippingOrderStatus3);
export {
  shippingOrderStatus,
  shippingOrderStatus2,
  shippingOrderStatus3,
  shippingOrderStatusValueEnum,
  shippingOrderStatusTextMap,
};

// 配送单状态pending：
// shipping_order_status_pending
const shippingOrderStatusPending = [
  { label: '配送中', value: 'delivering' },
  { label: '确认送达', value: 'arrived' },
  { label: '验收中', value: 'receiving' },
];
// 配送单状态done：
// shipping_order_status_done
const shippingOrderStatusDone = [
  { label: '验收通过', value: 'all_pass' },
  { label: '部分通过', value: 'partial_pass' },
  { label: '验收不通过', value: 'all_reject' },
];
export { shippingOrderStatusPending, shippingOrderStatusDone };

// 配送单订单类型
// shipping_order_type
const shippingOrderType = [
  { label: '线上', value: 'online_order' },
  { label: '线下', value: 'offline_order' },
];
const shippingOrderTypeTextMap = optionsToTextMap(shippingOrderType);
export { shippingOrderType, shippingOrderTypeTextMap };

// 配送单详情每个基础物资状态 'pending', 'passed', 'rejected', 'partial_pass'
// shipping_order_detail_item_status
const shippingOrderDetailItemStatus = [
  { label: '待验收', value: 'pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '通过', value: 'passed', color: CONFIG_LESS['@c_starus_done'] },
  { label: '部分通过', value: 'partial_pass', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '拒绝', value: 'all_reject', color: CONFIG_LESS['@c_starus_warning'] },
];
const shippingOrderDetailItemStatusValueEnum = optionsToValueEnum(shippingOrderDetailItemStatus);
const shippingOrderDetailItemStatusTextMap = optionsToTextMap(shippingOrderDetailItemStatus);
export {
  shippingOrderDetailItemStatus,
  shippingOrderDetailItemStatusValueEnum,
  shippingOrderDetailItemStatusTextMap,
};

// 验收单状态
// receiving_report_status
const receivingReportStatus = [
  { label: '待验收', value: 'pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '验收中', value: 'receiving', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '验收通过', value: 'all_pass', color: CONFIG_LESS['@c_starus_done'] },
  { label: '验收不通过', value: 'all_reject', color: CONFIG_LESS['@c_starus_warning'] },
  { label: '部分通过', value: 'partial_pass', color: CONFIG_LESS['@c_starus_underway'] },
];
const receivingReportStatusValueEnum = optionsToValueEnum(receivingReportStatus);
const receivingReportStatusTextMap = optionsToTextMap(receivingReportStatus);
export { receivingReportStatus, receivingReportStatusValueEnum, receivingReportStatusTextMap };

// 验收单明细状态
// receiving_report_detail_status
const receivingReportDetailStatus = [
  { label: '未验收', value: null, color: CONFIG_LESS['@c_starus_await'] },
  { label: '部分通过', value: 'partial_pass', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '验收通过', value: 'passed', color: CONFIG_LESS['@c_starus_done'] },
  { label: '验收不通过', value: 'rejected', color: CONFIG_LESS['@c_starus_warning'] },
];
const receivingReportDetailStatusValueEnum = optionsToValueEnum(receivingReportDetailStatus);
const receivingReportDetailStatusTextMap = optionsToTextMap(receivingReportDetailStatus);
export {
  receivingReportDetailStatus,
  receivingReportDetailStatusValueEnum,
  receivingReportDetailStatusTextMap,
};

// 验收单详细状态
// receiving_report_status_pending
const receivingReportStatusPending = [
  { label: '待验收', value: 'pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '验收中', value: 'receiving', color: CONFIG_LESS['@c_starus_underway'] },
];
export { receivingReportStatusPending };

// 配送单详细状态：
// receiving_report_status_done
const receivingReportStatusDone = [
  { label: '部分通过', value: 'partial_pass', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '验收通过', value: 'all_pass', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '验收不通过', value: 'all_reject', color: CONFIG_LESS['@c_starus_done'] },
];
export { receivingReportStatusDone };

// approve_status_num
const approvalStatusNum = [
  { label: '待审核', value: 'approval_pending' },
  { label: '审核通过', value: 'approval_success' },
  { label: '审核不通过', value: 'approval_failure' },
];
export { approvalStatusNum };

// 结算单状态
// statement_status
const statementStatus = [
  { label: '未提交', value: 'commit_pending', color: CONFIG_LESS['@c_starus_disabled'] },
  { label: '待审核', value: 'approval_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '审核通过', value: 'approval_success', color: CONFIG_LESS['@c_starus_done'] },
  { label: '审核不通过', value: 'approval_failure', color: CONFIG_LESS['@c_starus_warning'] },
];
const statementStatusValueEnum = optionsToValueEnum(statementStatus);
const statementStatusTextMap = optionsToTextMap(statementStatus);
export { statementStatus, statementStatusValueEnum, statementStatusTextMap };

// goods_request_status_value
const goodsRequestStatusValue = [
  { label: '待审核', value: 'approval_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '待复核', value: 'approval_review_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '审核不通过', value: 'approval_failure', color: CONFIG_LESS['@c_starus_warning'] },
  {
    label: '复核不通过',
    value: 'approval_review_failure',
    color: CONFIG_LESS['@c_starus_warning'],
  },
  { label: '撤回', value: 'withdraw', color: CONFIG_LESS['@c_starus_disabled'] },
  { label: '采购中', value: 'purchasing', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '配送中', value: 'in_delivery', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '已验收', value: 'accepted', color: CONFIG_LESS['@c_starus_done'] },
];
export { goodsRequestStatusValue };

// surgical_package_request_status_pending
const surgicalPackageRequestStatusPending = [
  { label: '待请领', value: 'surgical_request_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '待审核', value: 'approval_pending', color: CONFIG_LESS['@c_starus_await'] },
];
// surgical_package_request_status_done
const surgicalPackageRequestStatusDone = [
  { label: '审核通过', value: 'approval_review_success', color: CONFIG_LESS['@c_starus_done'] },
  {
    label: '审核不通过',
    value: 'approval_review_failure',
    color: CONFIG_LESS['@c_starus_warning'],
  },
];
// surgical_package_request_status
const surgicalPackageRequestStatus = [
  ...surgicalPackageRequestStatusPending,
  ...surgicalPackageRequestStatusDone,
  { label: '待复核', value: 'approval_review_pending', color: CONFIG_LESS['@c_starus_await'] },
];
const surgicalPackageRequestStatusTextMap = optionsToTextMap(surgicalPackageRequestStatus);
export {
  surgicalPackageRequestStatusPending,
  surgicalPackageRequestStatusDone,
  surgicalPackageRequestStatus,
  surgicalPackageRequestStatusTextMap,
};

// purchase_plan_status_commit2
const purchasePlanStatusCommit2 = [
  { label: '待提交', value: 'commit_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '待审核', value: 'approval_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '审核通过', value: 'approval_success', color: CONFIG_LESS['@c_starus_done'] },
];
const purchasePlanStatusCommit3 = [
  { label: '已转订单', value: 'finished', color: CONFIG_LESS['@c_starus_disabled'] },
  { label: '审核不通过', value: 'approval_failure', color: CONFIG_LESS['@c_starus_warning'] },
  { label: '已作废', value: 'canceled', color: CONFIG_LESS['@c_starus_disabled'] },
];
// purchase_plan_status_commit
const purchasePlanStatusCommit = [
  { label: '待提交', value: 'commit_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '待审核', value: 'approval_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '审核通过', value: 'approval_success', color: CONFIG_LESS['@c_starus_done'] },
  { label: '已转订单', value: 'finished', color: CONFIG_LESS['@c_starus_disabled'] },
  { label: '审核不通过', value: 'approval_failure', color: CONFIG_LESS['@c_starus_warning'] },
  { label: '已作废', value: 'canceled', color: CONFIG_LESS['@c_starus_disabled'] },
];
const purchasePlanStatusCommitTextMap = optionsToTextMap(purchasePlanStatusCommit);
export {
  purchasePlanStatusCommit2,
  purchasePlanStatusCommit3,
  purchasePlanStatusCommit,
  purchasePlanStatusCommitTextMap,
};

// purchase_plan_status_pending
const purchasePlanStatusPending = [
  { label: '审核通过', value: 'approval_success', color: CONFIG_LESS['@c_starus_done'] },
  { label: '待审核', value: 'approval_pending', color: CONFIG_LESS['@c_starus_await'] },
];
// purchase_plan_status_done
const purchasePlanStatusDone = [
  { label: '审核通过', value: 'approval_success', color: CONFIG_LESS['@c_starus_done'] },
  { label: '审核不通过', value: 'approval_failure', color: CONFIG_LESS['@c_starus_warning'] },
  { label: '已作废', value: 'canceled', color: CONFIG_LESS['@c_starus_disabled'] },
];
// purchase_plan_status
const purchasePlanStatus = [
  { label: '待提交', value: 'commit_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '待审核', value: 'approval_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '审核通过', value: 'approval_success', color: CONFIG_LESS['@c_starus_done'] },
  { label: '已转订单', value: 'finished', color: CONFIG_LESS['@c_starus_disabled'] },
  { label: '审核不通过', value: 'approval_failure', color: CONFIG_LESS['@c_starus_warning'] },
  { label: '已作废', value: 'canceled', color: CONFIG_LESS['@c_starus_disabled'] },
];

const purchasePlanStatusValueEnum = optionsToValueEnum(purchasePlanStatus);
// purchase_plan_status2
export {
  purchasePlanStatusPending,
  purchasePlanStatusDone,
  purchasePlanStatus,
  purchasePlanStatusValueEnum,
};

// order_status
const orderStatus = [
  { label: '待接收', value: 'receive_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '已接收', value: 'received', color: CONFIG_LESS['@c_starus_done'] },
  { label: '待配送', value: 'deliver_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '配送中', value: 'delivering', color: CONFIG_LESS['@c_starus_underway'] },
];
const orderStatusValueEnum = optionsToValueEnum(orderStatus);

// order_status2
const orderStatus2 = [
  { label: '已拒绝', value: 'refused', color: CONFIG_LESS['@c_starus_warning'] },
  { label: '已完成', value: 'finish', color: CONFIG_LESS['@c_starus_done'] },
  { label: '已关闭', value: 'closed', color: CONFIG_LESS['@c_starus_disabled'] },
];

// order_status3
const orderStatus3 = [...orderStatus, ...orderStatus2];

// orderQueryStatus
const orderQueryStatus = [
  { label: '已接收', value: 'received', color: CONFIG_LESS['@c_starus_done'] },
  { label: '已拒绝', value: 'refused', color: CONFIG_LESS['@c_starus_warning'] },
  { label: '已完成', value: 'finish', color: CONFIG_LESS['@c_starus_done'] },
  { label: '已关闭', value: 'closed', color: CONFIG_LESS['@c_starus_disabled'] },
];
const orderStatusTextMap = optionsToTextMap(orderStatus3);
const orderQueryStatusValueEnum = optionsToValueEnum(orderQueryStatus);
export {
  orderStatus,
  orderStatus2,
  orderStatus3,
  orderQueryStatus,
  orderStatusTextMap,
  orderStatusValueEnum,
  orderQueryStatusValueEnum,
};

// 推送单状态
// delivery_status_pending
const deliveryStatusPending = [
  { label: '待复核', value: 'check_pending', color: CONFIG_LESS['@c_starus_await'] },
];
// delivery_status_done
const deliveryStatusDone = [
  { label: '部分通过', value: 'partial_pass', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '复核通过', value: 'all_pass', color: CONFIG_LESS['@c_starus_done'] },
  { label: '复核不通过', value: 'all_reject', color: CONFIG_LESS['@c_starus_warning'] },
];
// delivery_status
const deliveryStatus = [...deliveryStatusPending, ...deliveryStatusDone];
const deliveryStatusTextMap = optionsToTextMap(deliveryStatus);
const deliveryStatusValueEnum = optionsToValueEnum(deliveryStatus);
export {
  deliveryStatusPending,
  deliveryStatusDone,
  deliveryStatus,
  deliveryStatusTextMap,
  deliveryStatusValueEnum,
};

// delivery_goods_status
const deliveryGoodsStatus = [
  { label: '待复核', value: 'review_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '复核通过', value: 'pass', color: CONFIG_LESS['@c_starus_done'] },
  { label: '复核不通过', value: 'reject', color: CONFIG_LESS['@c_starus_warning'] },
];
export { deliveryGoodsStatus };

// pick_order_status_pending
const pickOrderStatusPending = [
  { label: '待配货', value: 'pick_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '配货中', value: 'picking', color: CONFIG_LESS['@c_starus_underway'] },
];
// pick_order_status_done
const pickOrderStatusDone = [
  { label: '已完成', value: 'pick_finish', color: CONFIG_LESS['@c_starus_done'] },
  { label: '已取消', value: 'cancel', color: CONFIG_LESS['@c_starus_disabled'] },
];
// pick_order_status
const pickOrderStatus = [...pickOrderStatusPending, ...pickOrderStatusDone];
const pickOrderStatusTextMap = optionsToTextMap(pickOrderStatus);
const pickOrderStatusAllValueEnum = optionsToValueEnum(pickOrderStatus);
const deliveryGoodsStatusValueEnum = optionsToValueEnum(deliveryGoodsStatus);
export {
  pickOrderStatusPending,
  pickOrderStatusDone,
  pickOrderStatus,
  pickOrderStatusTextMap,
  pickOrderStatusAllValueEnum,
  deliveryGoodsStatusValueEnum,
};

// goods_item_status
const goodsItemStatus = [
  { label: '待上架', value: 'put_on_shelf_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '已上架', value: 'put_on_shelf', color: CONFIG_LESS['@c_starus_done'] },
  { label: '已下架', value: 'put_off_shelf', color: CONFIG_LESS['@c_starus_disabled'] },
  { label: '已退货', value: 'return_goods', color: CONFIG_LESS['@c_starus_disabled'] },
  { label: '推送中', value: 'delivering', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '已消耗', value: 'consumed', color: CONFIG_LESS['@c_starus_disabled'] },
  { label: '退货中', value: 'return_goods_pending', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '调拨中', value: 'reallocate_pending', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '已占用', value: 'occupied', color: CONFIG_LESS['@c_starus_disabled'] }, // 手术套包占用
  { label: '已拆包', value: 'unpacked', color: CONFIG_LESS['@c_starus_done'] },
  { label: '已配货', value: 'picked', color: CONFIG_LESS['@c_starus_done'] },
];
const goodsItemStatusTextMap = optionsToTextMap(goodsItemStatus);
export { goodsItemStatus, goodsItemStatusTextMap };

// 待配货类型
// picking_pending_source
const pickingPendingSource = [
  { label: '普通请领', value: 'goods_request' },
  { label: '自动补货', value: 'automatic_resupply' },
];
const pickingPendingSourceTextMap = optionsToTextMap(pickingPendingSource);
export { pickingPendingSource, pickingPendingSourceTextMap };

// 待配货状态
// picking_pending_status
const pickingPendingStatus = [
  { label: '未完成', value: 'generate_pick_order_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '已取消', value: 'canceled', color: CONFIG_LESS['@c_starus_disabled'] },
];
const pickingPendingStatusTextMap = optionsToTextMap(pickingPendingStatus);
const pickingPendingStatusAllValueEnum = optionsToValueEnum(pickingPendingStatus);
export { pickingPendingStatus, pickingPendingStatusTextMap, pickingPendingStatusAllValueEnum };

// stock_goods_status
const stockGoodsStatus = [
  { label: '待上架', value: 'put_on_shelf_pending' },
  { label: '已上架', value: 'put_on_shelf' },
  { label: '已下架', value: 'put_off_shelf' },
  { label: '操作中', value: 'operate_pending' },
];
export { stockGoodsStatus };

// stock_goods_status_all
const stockGoodsStatusAll = [
  { label: '待上架', value: 'put_on_shelf_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '已上架', value: 'put_on_shelf', color: CONFIG_LESS['@c_starus_done'] },
  { label: '已下架', value: 'put_off_shelf', color: CONFIG_LESS['@c_starus_disabled'] },
  { label: '待退货', value: 'return_goods_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '推送中', value: 'delivering', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '调拨中', value: 'reallocate_pending', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '已配货', value: 'picked', color: CONFIG_LESS['@c_starus_done'] },
];

const stockGoodsStatusAllTextMap = optionsToTextMap(stockGoodsStatusAll);
const stockGoodsStatusAllValueEnum = optionsToValueEnum(stockGoodsStatusAll);
export { stockGoodsStatusAll, stockGoodsStatusAllTextMap, stockGoodsStatusAllValueEnum };

// audit_type
const auditType = [
  { label: '创建', value: 'create' },
  { label: '编辑', value: 'modify' },
  { label: '审核', value: 'workflow' },
  { label: '删除', value: 'remove' },
  { label: '安全', value: 'security' },
];
export { auditType };

export const enabledEnum = {
  ['']: { text: '全部', status: '' },
  true: { text: '已启用', status: 'true' },
  false: { text: '已禁用', status: 'false' },
};

export const highValueEnum = {
  ['']: { text: '全部', status: '' },
  true: { text: '高值', status: 'true' },
  false: { text: '低值', status: 'false' },
};

// role_status
const roleStatus = [
  { label: '已启用', value: true },
  { label: '已禁用', value: false },
];
export { roleStatus };

// enabled_status
const enabledStatus = [
  { label: '已启用', value: true, color: CONFIG_LESS['@c_starus_await'] },
  { label: '已禁用', value: false, color: CONFIG_LESS['@c_starus_disabled'] },
];
const enabledPlatformMatching = [
  { label: '未匹配', value: true, color: 'red' },
  { label: '-', value: false },
];
const enabledPlatformMatchingValueEnum = optionsToValueEnum(enabledPlatformMatching);

const enabledStatusTextMap = optionsToTextMap(enabledStatus);
const enabledStatusValueEnum = optionsToValueEnum(enabledStatus);
export {
  enabledStatus,
  enabledStatusTextMap,
  enabledStatusValueEnum,
  enabledPlatformMatchingValueEnum,
};

const boo = {
  true: true,
  false: false,
};
export const isHighValueStatus = {
  true: '高值',
  false: '低值',
  ['false,true']: '低值、高值',
  ['true,false']: '低值、高值',
  ['']: '-',
};

const equipmentEnabledStatus = [
  { label: '已启用', value: 1, color: CONFIG_LESS['@c_starus_await'] },
  { label: '已禁用', value: 0, color: CONFIG_LESS['@c_starus_disabled'] },
];
const equipmentEnabledStatusValueEnum = optionsToValueEnum(equipmentEnabledStatus);
export { equipmentEnabledStatus, equipmentEnabledStatusValueEnum, boo };

export const consumeEnum = {
  [`${['push', 'scanCode']}`]: { text: '全部', status: ['push', 'scanCode'] },
  push: { text: '推送消耗', status: 'push' },
  scanCode: { text: '扫码消耗', status: 'scanCode' },
};

// consume_way
const consumeWay = [
  { label: '推送消耗', value: 'push' },
  { label: '扫码消耗', value: 'scanCode' },
];
// 消耗记录type
// consume_type
const consumeType = [
  { value: 'scan_consume', label: '扫码消耗' },
  { value: 'push_consume', label: '推送消耗' },
  ...(systemType !== 'Insight_RS' ? [{ value: 'following_consume', label: '跟台消耗' }] : []),
];
const consumeTypeTextMap = optionsToTextMap(consumeType);
export { consumeWay, consumeType, consumeTypeTextMap };

// 采购计划
// purchase_plan_type
const purchasePlanType = [
  { label: '科室采购', value: 'goods_request' },
  { label: '自动采购', value: 'automatic_resupply' },
  // { label: '手术套包请领', value: 'surgical_package_request' },
  { label: '系统取整', value: 'auto_ceil' },
  { label: '普通采购', value: 'manual_make' },
  { label: '医嘱采购', value: 'medical_advice_purchase' },
];
const purchasePlanTypeTextMap = optionsToTextMap(purchasePlanType);
export { purchasePlanType, purchasePlanTypeTextMap };

// 订单
// yes_or_no
const yesOrNo = [
  { label: '是', value: true },
  { label: '否', value: false },
];
const yesOrNoTextMap = optionsToTextMap(yesOrNo);
export { yesOrNo, yesOrNoTextMap };

// is_hight_value
const isHightValue = [
  { label: '高值', value: true },
  { label: '低值', value: false },
];
const isHightValueTextMap = optionsToTextMap(isHightValue);
export { isHightValue, isHightValueTextMap };

// return_type
const returnType = [
  { label: '质量问题', value: 'quality_problem' },
  { label: '耗材停用', value: 'discontinue_use' },
  { label: '价格不符', value: 'price_out_of_line' },
  { label: '近效期', value: 'to_expire' },
  { label: '过效期', value: 'has_expired' },
  { label: '产品召回', value: 'product_recall' },
  { label: '非质量问题', value: 'non_quality_problem' },
];
const returnTypeTextMap = optionsToTextMap(returnType);
const returnTypeValueEnum = optionsToValueEnum(returnType);
export { returnType, returnTypeTextMap, returnTypeValueEnum };

// 退货
// return_status
const returnStatus = [
  { label: '待审核', value: 'pending_approve', color: CONFIG_LESS['@c_starus_await'] },
  { label: '审核不通过', value: 'approve_failure', color: CONFIG_LESS['@c_starus_warning'] },
  { label: '等待退货', value: 'pending_return', color: CONFIG_LESS['@c_starus_await'] },
  { label: '退货完成', value: 'return_finished', color: CONFIG_LESS['@c_starus_done'] },
];
const returnStatusValueEnum = optionsToValueEnum(returnStatus);
export { returnStatus, returnStatusValueEnum };

// 请领查询
// pleaseGet_inquirezt
const pleaseGetInquirezt = [
  { label: '未验收', value: 'no_pass', color: CONFIG_LESS['@c_starus_await'] },
  { label: '已验收', value: 'all_pass', color: CONFIG_LESS['@c_starus_done'] },
  { label: '部分验收', value: 'partial_pass', color: CONFIG_LESS['@c_starus_underway'] },
];
const pleaseGetInquireztValueEnum = optionsToValueEnum(pleaseGetInquirezt);
export { pleaseGetInquirezt, pleaseGetInquireztValueEnum };

// 科室退货
// department_return_status
const departmentReturnStatus = [
  { label: '待审核', value: 'pending_approve', color: CONFIG_LESS['@c_starus_await'] },
  { label: '审核不通过', value: 'approve_failure', color: CONFIG_LESS['@c_starus_warning'] },
  { label: '待确认', value: 'pending_confirm', color: CONFIG_LESS['@c_starus_await'] },
  { label: '确认不通过', value: 'confirm_failure', color: CONFIG_LESS['@c_starus_warning'] },
  { label: '等待退货', value: 'pending_return', color: CONFIG_LESS['@c_starus_await'] },
  { label: '退货完成', value: 'return_finished', color: CONFIG_LESS['@c_starus_done'] },
];
const departmentReturnStatusValueEnum = optionsToValueEnum(departmentReturnStatus);
export { departmentReturnStatus, departmentReturnStatusValueEnum };

// return_status_pending
const returnStatusPending = [
  { label: '待审核', value: 'pending_approve' },
  // { label: '待确认', value: 'pending_confirm' },
  { label: '等待退货', value: 'pending_return' },
];
// return_status_done
const returnStatusDone = [
  { label: '审核不通过', value: 'approve_failure' },
  // { label: '确认不通过', value: 'confirm_failure' },
  { label: '退货完成', value: 'return_finished' },
];
export { returnStatusPending, returnStatusDone };

// repostory_return_status
const repostoryReturnStatus = [
  { label: '待退货', value: 'unfinished' },
  { label: '已退货', value: 'finished' },
];
export { repostoryReturnStatus };

// goods_ticket_status
const goodsTicketStatus = [
  { label: '已绑定', value: true },
  { label: '未绑定', value: false },
];
const goodsTicketStatusTextMap = optionsToTextMap(goodsTicketStatus);
export { goodsTicketStatus, goodsTicketStatusTextMap };

// 可退货物资状态
// returnable_status
const returnableStatus = [
  { label: '推送消耗', value: 'push_consume', color: CONFIG_LESS['@c_starus_disabled'] },
  { label: '扫码消耗', value: 'scan_consume', color: CONFIG_LESS['@c_starus_disabled'] },
  { label: '已上架', value: 'put_on_shelf', color: CONFIG_LESS['@c_starus_done'] },
  { label: '待上架', value: 'put_on_shelf_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '已下架', value: 'put_off_shelf', color: CONFIG_LESS['@c_starus_disabled'] },
];
const returnableStatusTextMap = optionsToTextMap(returnableStatus);
const returnableStatusValueEnum = optionsToValueEnum(returnableStatus);
export { returnableStatus, returnableStatusTextMap, returnableStatusValueEnum };

// 仓库类型
// warehouse_type
const warehouseType = [
  { label: '中心仓库', value: 0 },
  { label: '二级仓库', value: 1 },
];
export { warehouseType };

// 库房类型
// storage_area_type
const storageAreaType = [
  { label: '验收区', value: 'receiving_area' },
  { label: '配货区', value: 'pick_area' },
  { label: '退货区', value: 'return_goods_area' },
  { label: '已上架区', value: 'on_shelf_area' },
];
export { storageAreaType };

// 盘库状态
// stock_taking_status
const stockTakingStatus = [
  { label: '待盘库', value: 'stock_taking_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '盘库中', value: 'stock_taking', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '已完成', value: 'finished', color: CONFIG_LESS['@c_starus_done'] },
  { label: '已终止', value: 'stock_taking_stop', color: CONFIG_LESS['@c_starus_disabled'] },
];
const stockTakingStatusTextMap = optionsToTextMap(stockTakingStatus);
const stockTakingStatusValueEnum = optionsToValueEnum(stockTakingStatus);
export { stockTakingStatus, stockTakingStatusTextMap, stockTakingStatusValueEnum };

// 盘点处理状态
// stock__deal_taking_status
const stockDealTakingStatus = [
  { label: '待盘库', value: 'stock_taking_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '盘库中', value: 'stock_taking', color: CONFIG_LESS['@c_starus_underway'] },
];
export { stockDealTakingStatus };

// 盘点查询状态
// stock_query_taking_status
const stockQueryTakingStatus = [
  { label: '已完成', value: 'finished', color: CONFIG_LESS['@c_starus_done'] },
  { label: '已终止', value: 'stock_taking_stop', color: CONFIG_LESS['@c_starus_disabled'] },
];
export { stockQueryTakingStatus };

// 仓库角色
// report_from_warehouse_roles
const reportFromWarehouseRoles = [
  { value: 'receiver', label: '验收人员' },
  { value: 'saleMember', label: '上架员' },
  { value: 'picker', label: '配货员' },
  { value: 'processor', label: '复核加工' },
  { value: 'pusher', label: '推送员' },
];
export { reportFromWarehouseRoles };

// 操作日志type
// activity_type
const activityType = [
  { label: '创建', value: 'create' },
  { label: '编辑', value: 'modify' },
  { label: '审核', value: 'workflow' },
  { label: '删除', value: 'remove' },
  { label: '安全', value: 'security' },
];
export { activityType };

// 推送单状态
// wms_push_order_status
const wmsPushOrderStatus = [
  { label: '待推送', value: 'push_pending' },
  { label: '已完成', value: 'push_success' },
];
export { wmsPushOrderStatus };

// 套包所属类别
// surgical_package_type
const surgicalPackageType = [
  { value: '160', label: '关节镜类' },
  { value: '161', label: '脊柱类' },
  { value: '162', label: '关节类' },
  { value: '163', label: '创伤类' },
];
export { surgicalPackageType };

// 加工单状态
// process_list_status
const processListStatus = [
  { value: 'operate_pending', label: '待操作', color: CONFIG_LESS['@c_starus_await'] },
  { value: 'pick_pending', label: '待配货', color: CONFIG_LESS['@c_starus_await'] },
  { value: 'process_pending', label: '待加工', color: CONFIG_LESS['@c_starus_await'] },
  { value: 'process_done', label: '加工完成', color: CONFIG_LESS['@c_starus_done'] },
];
const processListStatusTextMap = optionsToTextMap(processListStatus);
const processListStatusValueEnum = optionsToValueEnum(processListStatus);
export { processListStatus, processListStatusTextMap, processListStatusValueEnum };

// 加工单状态
// process_list_type
const processListType = [
  { value: 'system', label: '系统生成' },
  { value: 'manual', label: '手工制作' },
];
const processListTypeTextMap = optionsToTextMap(processListType);
export { processListType, processListTypeTextMap };

// 物品过期枚举
// goods_expiry_date
const goodsExpiryDate = [
  { value: 'expired', label: '已过期' },
  // { value: 'nearExpiration', label: '近效期' },
  // { value: 'unexpired', label: '有效期内' },
  { value: 'less_than_30', label: '30天以内' },
  { value: 'less_than_60', label: '31-60天以内' },
  { value: 'less_than_90', label: '61-90天以内' },
  { value: 'more_than_90', label: '大于90天' },
];
export { goodsExpiryDate };

// 调拨状态枚举
// reallocation_status
const reallocationStatus = [
  { value: 'approve_pending', label: '待审核', color: CONFIG_LESS['@c_starus_await'] },
  { value: 'approve_denied', label: '审核不通过', color: CONFIG_LESS['@c_starus_warning'] },
  { value: 'accept_pending', label: '待验收', color: CONFIG_LESS['@c_starus_await'] },
  { value: 'accepting', label: '验收中', color: CONFIG_LESS['@c_starus_underway'] },
  { value: 'all_pass', label: '验收通过', color: CONFIG_LESS['@c_starus_done'] },
  { value: 'partial_pass', label: '部分通过', color: CONFIG_LESS['@c_starus_underway'] },
  { value: 'all_reject', label: '验收不通过', color: CONFIG_LESS['@c_starus_warning'] },
];
const reallocationStatusTextMap = optionsToTextMap(reallocationStatus);
const reallocationStatusValueEnum = optionsToValueEnum(reallocationStatus);
export { reallocationStatus, reallocationStatusTextMap, reallocationStatusValueEnum };

// reallocation_order_status
const reallocationOrderStatus = [
  { value: 'passed', label: '通过', color: CONFIG_LESS['@c_starus_done'] },
  { value: 'rejected', label: '拒绝', color: CONFIG_LESS['@c_starus_warning'] },
  { value: null, label: '待验收', color: CONFIG_LESS['@c_starus_await'] },
];
const reallocationOrderStatusValueEnum = optionsToValueEnum(reallocationOrderStatus);
export { reallocationOrderStatus, reallocationOrderStatusValueEnum };

// 企业类型
// company_type
const companyType = [
  { value: '生产企业', label: '生产企业' },
  { value: '经营企业', label: '经营企业' },
];
export { companyType };

// 国别
const nationality = [
  { value: '国内企业', label: '国内企业' },
  { value: '国外企业', label: '国外企业' },
];
export { nationality };

// 企业性质
// company_nature
const companyNature = [
  { value: '报关企业', label: '报关企业' },
  { value: '独资企业', label: '独资企业' },
  { value: '股份公司', label: '股份公司' },
  { value: '国有企业', label: '国有企业' },
  { value: '合资企业', label: '合资企业' },
  { value: '合作企业', label: '合作企业' },
  { value: '集体企业', label: '集体企业' },
  { value: '私营企业', label: '私营企业' },
  { value: '外国公司', label: '外国公司' },
  { value: '一人有限责任公司', label: '一人有限责任公司' },
  { value: '有限责任公司', label: '有限责任公司' },
  { value: '其他企业', label: '其他企业' },
  { value: '无', label: '无' },
];
export { companyNature };

// 医嘱收费
// his_status
const hisStatus = [
  { value: 'un_charged', label: '待收费' },
  { value: 'charged', label: '已收费' },
  { value: 'charge_reverted', label: '已退费' },
];
export { hisStatus };

// 库存日志
// stock_operation_type
const stockOperationType = [
  { value: 'receive', label: '中心库验收' },
  { value: 'surgical_receive', label: '定制耗材验收' },
  { value: 'putOnShelf', label: '上架' },
  { value: 'putOffShelf', label: '下架' },
  { value: 'process', label: '加工' },
  { value: 'acceptance', label: '科室接收' },
  { value: 'reallocate', label: '调拨' },
  { value: 'consume', label: '消耗' },
  { value: 'unconsume', label: '反消耗' },
  { value: 'return_goods', label: '退货' },
  { value: 'unpack', label: '拆包' },
];
const stockOperationTypeTextMap = optionsToTextMap(stockOperationType);
export { stockOperationType, stockOperationTypeTextMap };

// 逻辑库库存日志
// logic_stock_operation_type
const logicStockOperationType = [
  { value: 'push_consume_in', label: '推送消耗入库' },
  { value: 'scan_consume_in', label: '扫码消耗入库' },
  { value: 'unconsume_out', label: '反消耗出库' },
  { value: 'return_out', label: '退货出库' },
  { value: 'his_charge_out', label: 'HIS增加收费项出库' },
  { value: 'his_charge_in', label: 'HIS移除收费项入库' },
  { value: 'inventory_profit_in', label: '盘盈入库' },
  { value: 'inventory_loss_out', label: '盘亏出库' },
];
const logicStockOperationTypeTextMap = optionsToTextMap(logicStockOperationType);
export { logicStockOperationType, logicStockOperationTypeTextMap };

// success_or_no
const successOrNo = [
  { label: '成功', value: true },
  { label: '失败', value: false },
];
export { successOrNo };

// 实例明细查询
// goods_life_status
const goodsLifeStatus = [
  { value: 'receive', label: '中心库验收' },
  { value: 'surgical_receive', label: '定制耗材验收' },
  { value: 'putOnShelf', label: '上架' },
  { value: 'putOffShelf', label: '下架' },
  { value: 'process', label: '加工' },
  { value: 'acceptance', label: '科室接收' },
  { value: 'reallocate', label: '调拨' },
  { value: 'consume', label: '消耗' },
  { value: 'unconsume', label: '反消耗' },
  { value: 'return_goods', label: '退货' },
  { value: 'unpack', label: '拆包' },
  { value: 'return_goods_pending', label: '退货中' },
  { value: 'delivering', label: '推送中' },
  { value: 'reallocate_pending', label: '调拨中' },
  { value: 'picked', label: '已配货' },
];
const goodsLifeStatusValueEnum = optionsToValueEnum(goodsLifeStatus);
const goodsLifeStatusTextMap = optionsToTextMap(goodsLifeStatus);
export { goodsLifeStatus, goodsLifeStatusValueEnum, goodsLifeStatusTextMap };

// limit_type
const limitType = [
  { value: 'warning', label: '警告' },
  { value: 'forbid', label: '限制使用' },
];
const limitTypeTextMap = optionsToTextMap(limitType);
export { limitType, limitTypeTextMap };

// 消息类型
// message_type
const messageType = [
  { value: 'goods_request', label: '普通请领' },
  { value: 'purchase_plan', label: '采购计划' },
  { value: 'purchase_order', label: '采购订单' },
  // { value: 'shipping_order', label: '配送通知' }, // 后端已不再推送这种类型的消息
  { value: 'surgical_package_request', label: '手术请领' },
  { value: 'wms_pick_order', label: '配货通知' },
  { value: 'wms_acceptance_order', label: '验收通知' },
  { value: 'wms_return_goods', label: '退货申请' },
  { value: 'wms_stock_taking', label: '盘库通知' },
  { value: 'goods_stock', label: '库存通知' },
  { value: 'GSP', label: '证照消息通知' },
];
export { messageType };

// scan_consume_type
const scanConsumeType = [
  { value: 'adviceNo', label: '收费序号' },
  { value: 'patientNo', label: '病人号' },
  { value: 'hospitalizationNum', label: '住院号' },
];
const scanConsumeTypeTextMap = optionsToTextMap(scanConsumeType);
export { scanConsumeType, scanConsumeTypeTextMap };

// charge_status
// const chargeStatus = [
//   { value: 'un_charged', label: '未收费', color: CONFIG_LESS['@c_starus_disabled'] },
//   { value: 'charged', label: '已收费', color: CONFIG_LESS['@c_starus_done'] },
//   { value: 'charge_reverted', label: '退费', color: CONFIG_LESS['@c_starus_disabled'] },
// ];
// export { chargeStatus };

// 医嘱状态
// medical_advice_status
// const medicalAdviceStatus = [
//   { value: 'fresh', label: '未使用', color: CONFIG_LESS['@c_starus_disabled'] },
//   { value: 'inuse', label: '使用中', color: '#3D66FF' },
//   { value: 'locked', label: '已锁定', color: '#333' },
//   { value: 'unlocked', label: '已解锁', color: '#3D66FF' },
//   { value: 'finished', label: '已完成', color: CONFIG_LESS['@c_starus_done'] },
//   { value: 'cancelled', label: '已取消', color: CONFIG_LESS['@c_starus_disabled'] },
// ];
// export { medicalAdviceStatus };

// charge_status
const chargeStatus = [
  { value: 'not_consumed', label: '未消耗', color: CONFIG_LESS['@c_starus_disabled'] },
  { value: 'consumed', label: '已消耗', color: CONFIG_LESS['@c_starus_done'] },
  { value: 'not_returned', label: '未退货', color: CONFIG_LESS['@c_starus_disabled'] },
  { value: 'returned', label: '已退货', color: CONFIG_LESS['@c_starus_done'] },
];
const chargeStatusValueEnum = optionsToValueEnum(chargeStatus);
const chargeStatusTextMap = optionsToTextMap(chargeStatus);
export { chargeStatus, chargeStatusValueEnum, chargeStatusTextMap };

// medical_advice_status
const medicalAdviceStatus = [
  { value: 'not_consumed', label: '未消耗', color: CONFIG_LESS['@c_starus_disabled'] },
  { value: 'consuming', label: '消耗中', color: CONFIG_LESS['@c_starus_underway'] },
  { value: 'consumption_failed', label: '消耗失败', color: CONFIG_LESS['@c_starus_warning'] },
  { value: 'partly_consumed', label: '部分消耗', color: CONFIG_LESS['@c_starus_underway'] },
  { value: 'all_consumed', label: '全部消耗', color: CONFIG_LESS['@c_starus_done'] },
  { value: 'not_returned', label: '未退货', color: CONFIG_LESS['@c_starus_disabled'] },
  { value: 'returned', label: '已退货', color: CONFIG_LESS['@c_starus_done'] },
];
const medicalAdviceHandleStatus = [
  { value: 'not_consumed', label: '未消耗', color: CONFIG_LESS['@c_starus_disabled'] },
  { value: 'consuming', label: '消耗中', color: CONFIG_LESS['@c_starus_underway'] },
  { value: 'consumption_failed', label: '消耗失败', color: CONFIG_LESS['@c_starus_warning'] },
  { value: 'partly_consumed', label: '部分消耗', color: CONFIG_LESS['@c_starus_underway'] },
  { value: 'not_returned', label: '未退货', color: CONFIG_LESS['@c_starus_disabled'] },
];

const medicalAdviceQueryStatus = [
  { value: 'all_consumed', label: '全部消耗', color: CONFIG_LESS['@c_starus_done'] },
  { value: 'returned', label: '已退货', color: CONFIG_LESS['@c_starus_done'] },
];
const medicalAdviceStatusValueEnum = optionsToValueEnum(medicalAdviceStatus);
const medicalAdviceStatusTextMap = optionsToTextMap(medicalAdviceStatus);

export { medicalAdviceHandleStatus, medicalAdviceQueryStatus, medicalAdviceStatus, medicalAdviceStatusValueEnum, medicalAdviceStatusTextMap };

// 组包/拆包
// pack_type
const packType = [
  { value: 'process', label: '组包' },
  { value: 'unpack', label: '拆包' },
];
export { packType };

// 逻辑库库存盘点
// logic_stock_taking_order_status
const logicStockTakingOrderStatus = [
  { label: '待盘库', value: 'logic_stock_taking_pending', color: CONFIG_LESS['@c_starus_await'] },
  {
    label: '待审核',
    value: 'logic_stock_taking_approval_pending',
    color: CONFIG_LESS['@c_starus_await'],
  },
  {
    label: '审核通过',
    value: 'logic_stock_taking_approval_success',
    color: CONFIG_LESS['@c_starus_done'],
  },
  {
    label: '审核不通过',
    value: 'logic_stock_taking_approval_failed',
    color: CONFIG_LESS['@c_starus_warning'],
  },
];
const logicStockTakingOrderStatusValueEnum = optionsToValueEnum(logicStockTakingOrderStatus);
const logicStockTakingOrderStatusTextMap = optionsToTextMap(logicStockTakingOrderStatus);
export {
  logicStockTakingOrderStatus,
  logicStockTakingOrderStatusValueEnum,
  logicStockTakingOrderStatusTextMap,
};

// 结算单配送商业审核状态
// settlement_supllier_review
const settlementSupllierReview = [
  { value: null, label: '-', color: CONFIG_LESS['@c_starus_await'] },
  { value: 'review_pending', label: '待复核', color: CONFIG_LESS['@c_starus_await'] },
  { value: 'review_success', label: '复核成功', color: CONFIG_LESS['@c_starus_done'] },
  { value: 'review_failure', label: '复核失败', color: CONFIG_LESS['@c_starus_warning'] },
];
const settlementSupllierReviewValueEnum = optionsToValueEnum(settlementSupllierReview);
const settlementSupllierReviewTextMap = optionsToTextMap(settlementSupllierReview);
export {
  settlementSupllierReview,
  settlementSupllierReviewValueEnum,
  settlementSupllierReviewTextMap,
};

// department_receiving_status
const departmentReceivingStatus = [
  { label: '待验收', value: 'pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '验收中', value: 'receiving', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '部分通过', value: 'partial_pass', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '验收通过', value: 'all_pass', color: CONFIG_LESS['@c_starus_done'] },
  { label: '验收不通过', value: 'all_reject', color: CONFIG_LESS['@c_starus_warning'] },
];
export { departmentReceivingStatus };

// 开票方式
// make_invoice_type
const makeInvoiceType = [
  { value: 'electronic_invoice', label: '电子发票' },
  { value: 'manual_invoice', label: '手工发票' },
];
const makeInvoiceTypeTextMap = optionsToTextMap(makeInvoiceType);
export { makeInvoiceType, makeInvoiceTypeTextMap };

// 税率
// tax_rate
const taxRate = [
  { value: 0, label: '0%' },
  { value: 100, label: '1%' },
  { value: 300, label: '3%' },
  { value: 1300, label: '13%' },
];
const taxRateTextMap = optionsToTextMap(taxRate);
export { taxRate, taxRateTextMap };

// 发票类型
// invoice_type
const invoiceType = [
  { value: 'value_added_tax_invoice', label: '增值税普通发票' },
  { value: 'value_added_tax_special_invoice', label: '增值税专用发票' },
];
const invoiceTypeTextMap = optionsToTextMap(invoiceType);
export { invoiceType, invoiceTypeTextMap };

// 转账类型
// pay_type
const payType = [
  { value: 'bank_draft', label: '银行汇票' },
  { value: 'bank_acceptance_bill', label: '银行承兑汇票' },
  { value: 'collection_with_acceptance', label: '托收承付' },
  { value: 'cheque', label: '支票' },
  { value: 'other', label: '其他' },
];
const payTypeTextMap = optionsToTextMap(payType);
export { payType, payTypeTextMap };

// 是否红冲票
// is_reverse
const isReverse = [
  { label: '是', value: 'reverse' },
  { label: '否', value: 'normal' },
];
const isReverseTextMap = optionsToTextMap(isReverse);
export { isReverse, isReverseTextMap };

// 是否抗疫物资/药品
// anti_epidemic_type
const antiEpidemicType = [
  { label: fields.antiEpidemic, value: true },
  { label: `非${fields.antiEpidemic}`, value: false },
];
const antiEpidemicTypeTextMap = optionsToTextMap(antiEpidemicType);
export { antiEpidemicType, antiEpidemicTypeTextMap };

// advice_type
const adviceType = [
  { label: '医嘱', value: 0 },
  { label: '补记帐', value: 1 },
];
const adviceTypeTextMap = optionsToTextMap(adviceType);
export { adviceType, adviceTypeTextMap };

const presenterOptions = [
  { label: '不包含赠送', value: 'false' },
  { label: '包含赠送', value: 'all' },
  { label: '仅显示赠送', value: 'true' },
];
export { presenterOptions };

const materialType = [
  { value: 'goods', label: fields.baseGoods },
  { value: 'ordinaryBulk', label: '医耗套包' },
];
export { materialType };

const allocationType = [
  { value: '1', label: fields.baseGoods },
  { value: '2', label: '医耗套包' },
];
export { allocationType };

// 调拨业务
const allocationHandleStatusType = [
  { value: 1, label: '待出库', color: CONFIG_LESS['@c_starus_await'] },
  { value: 2, label: '出库中', color: CONFIG_LESS['@c_starus_underway'] },
  { value: 3, label: '待入库', color: CONFIG_LESS['@c_starus_await'] },
  { value: 4, label: '待上架', color: CONFIG_LESS['@c_starus_await'] },
];
const allocationQueryStatusType = [
  { value: 5, label: '已完成', color: CONFIG_LESS['@c_starus_done'] },
  { value: 6, label: '已终止', color: CONFIG_LESS['@c_starus_warning'] },
];
const allocationStatusType = [...allocationHandleStatusType, ...allocationQueryStatusType];
const allocationStatusTypeTextMap = optionsToTextMap(allocationStatusType);
const allocationStatusTypeValueEnum = optionsToValueEnum(allocationStatusType);
export {
  allocationHandleStatusType,
  allocationQueryStatusType,
  allocationStatusType,
  allocationStatusTypeTextMap,
  allocationStatusTypeValueEnum,
};

const allocationGoodsType = [
  { value: 1, label: fields.baseGoods },
  ...(systemType !== 'Insight_RS' ? [{ value: 2, label: '医耗套包' }] : []),
];
const allocationGoodsTypeValueEnum = optionsToValueEnum(allocationGoodsType);
export { allocationGoodsType, allocationGoodsTypeValueEnum };

const allocationApplyType = [
  { value: 1, label: '手动申请' },
  { value: 2, label: '自动申请' },
];
const allocationApplyTypeValueEnum = optionsToValueEnum(allocationApplyType);
const allocationApplyTypeTextMap = optionsToTextMap(allocationApplyType);
export { allocationApplyType, allocationApplyTypeValueEnum, allocationApplyTypeTextMap };

const doneStatus = [
  { label: '验收通过', value: 'all_pass', color: CONFIG_LESS['@c_starus_done'] },
  { label: '验收不通过', value: 'all_reject', color: CONFIG_LESS['@c_starus_warning'] },
  { label: '部分通过', value: 'partial_pass', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '已转订单', value: 'finished', color: CONFIG_LESS['@c_starus_disabled'] },
  { label: '审核不通过', value: 'approval_failure', color: CONFIG_LESS['@c_starus_warning'] },
  { label: '已作废', value: 'canceled', color: CONFIG_LESS['@c_starus_disabled'] },
  { label: '已拒绝', value: 'refused', color: CONFIG_LESS['@c_starus_warning'] },
  { label: '已完成', value: 'finish', color: CONFIG_LESS['@c_starus_done'] },
  { label: '已关闭', value: 'closed', color: CONFIG_LESS['@c_starus_disabled'] },
  { label: '审核不通过', value: CONFIG_LESS['@c_starus_warning'] },
  { label: '退货完成', value: CONFIG_LESS['@c_starus_done'] },
  { label: '已完成', value: 'finished', color: CONFIG_LESS['@c_starus_done'] },
  { label: '已完成', value: 'pick_finish', color: CONFIG_LESS['@c_starus_done'] },
  { label: '已取消', value: 'cancel', color: CONFIG_LESS['@c_starus_disabled'] },
];
export { doneStatus };

const pendingStatus = [
  { label: '待验收', value: 'pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '验收中', value: 'receiving', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '待提交', value: 'commit_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '待审核', value: 'approval_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '审核通过', value: 'approval_success', color: CONFIG_LESS['@c_starus_done'] },
  { label: '待接收', value: 'receive_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '已接收', value: 'received', color: CONFIG_LESS['@c_starus_done'] },
  { label: '待配送', value: 'deliver_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '配送中', value: 'delivering', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '待审核', value: 'pending_approve' },
  { label: '等待退货', value: 'pending_return' },
  { label: '待盘库', value: 'stock_taking_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '盘库中', value: 'stock_taking', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '待配货', value: 'pick_pending', color: CONFIG_LESS['@c_starus_await'] },
  { label: '配货中', value: 'picking', color: CONFIG_LESS['@c_starus_underway'] },
  { label: '待复核', value: 'check_pending', color: CONFIG_LESS['@c_starus_await'] },
];
export { pendingStatus };

export const goodsCategoryTypes = [
  { label: '12版', value: '12' },
  { label: '18版', value: '18' },
];

export const approvaStatus = {
  withdraw: { text: '撤回', color: CONFIG_LESS['@c_starus_disabled'] },
  approval_pending: { text: '待审核', color: CONFIG_LESS['@c_starus_await'] },
  approval_failure: { text: '审核不通过', color: CONFIG_LESS['@c_starus_warning'] },
  approval_review_pending: { text: '待复核', color: CONFIG_LESS['@c_starus_await'] },
  approval_review_success: { text: '复核通过', color: CONFIG_LESS['@c_starus_done'] },
  approval_part_success: { text: '部分通过', color: CONFIG_LESS['@c_starus_underway'] },
  approval_review_failure: { text: '复核不通过', color: CONFIG_LESS['@c_starus_warning'] },
  purchasing: { text: '采购中', color: CONFIG_LESS['@c_starus_underway'] },
  in_delivery: { text: '配送中', color: CONFIG_LESS['@c_starus_underway'] },
  partial_delivery: { text: '部分配送', color: CONFIG_LESS['@c_starus_underway'] },
  all_accept: { text: '验收通过', color: CONFIG_LESS['@c_starus_done'] },
  partial_accept: { text: '部分通过', color: CONFIG_LESS['@c_starus_underway'] },
  accept_all_pass: { text: '验收通过', color: CONFIG_LESS['@c_starus_done'] },
  accept_pending: { text: '待验收', color: CONFIG_LESS['@c_starus_await'] },
  approve_pending: { text: '待审核', color: CONFIG_LESS['@c_starus_await'] },
  approve_denied: { text: '审核不通过', color: CONFIG_LESS['@c_starus_warning'] },
  accepting: { text: '验收中', color: CONFIG_LESS['@c_starus_underway'] },
  partial_pass: { text: '部分通过', color: CONFIG_LESS['@c_starus_underway'] },
  all_reject: { text: '验收不通过', color: CONFIG_LESS['@c_starus_warning'] },
  all_pass: { text: '验收通过', color: CONFIG_LESS['@c_starus_done'] },
};

const isEnabledStatus = [
  { label: '已启用', value: false, color: CONFIG_LESS['@c_starus_await'] },
  { label: '已禁用', value: true, color: CONFIG_LESS['@c_starus_disabled'] },
];
const isEnabledStatusValueEnum = optionsToValueEnum(isEnabledStatus);
export { isEnabledStatus, isEnabledStatusValueEnum };

const isReadStatus = [
  { label: '已读', value: true, color: CONFIG_LESS['@c_starus_disabled'] },
  { label: '未读', value: false, color: CONFIG_LESS['@c_starus_await'] },
];
const isReadStatusValueEnum = optionsToValueEnum(isReadStatus);
export { isReadStatus, isReadStatusValueEnum };

export const payWayEnum = {
  ['cash']: { text: '现金', status: 'cash' },
  ['cheque']: { text: '支票', status: 'cheque' },
  ['clientPayment']: { text: '付委', status: 'clientPayment' },
};

// 发票状态
export const invoiceStatusEnum = {
  ['']: { text: '全部', status: '' },
  true: { text: '已登记', status: 'true' },
  false: { text: '未登记', status: 'false' },
};

//基础物资 条码管控
export const isBarcodeController = {
  ['']: { text: '全部', status: null },
  true: { text: '是', status: true },
  false: { text: '否', status: false },
};

export const listIsBarcodeController = {
  ['']: '全部',
  true: '是',
  false: '否',
};

export const stockCountGoodsStatus = {
  'true': { label: '有流转', color: CONFIG_LESS['@c_starus_underway'] },
  'false': { label: '无流转', color: CONFIG_LESS['@bd_B0B2BC'] }
};

const implementStatus = [
  { value: '', label: '全部', color: CONFIG_LESS['@c_starus_done'] },
  { value: true, label: '未执行', color: CONFIG_LESS['@c_starus_warning'] },
  { value: false, label: '已执行', color: CONFIG_LESS['@c_starus_done'] },
];
const implementStatusValueEnum = optionsToValueEnum(implementStatus);
const implementStatusTextMap = optionsToTextMap(implementStatus);
export { implementStatus, implementStatusValueEnum, implementStatusTextMap };


// 科室类型
export const departmentType = [
  { label: '手术科室', value: 'operating_room' },
  { label: '非手术科室', value: 'non-surgical_department' },
  { label: '行政科室', value: 'administration' },
  { label: '医技科室', value: 'Medical_technology' }
]
