// common-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/common/1.0';

// GET/api/admin/common/1.0/autoCheckDepartmentReturnGoods autoCheckDepartmentReturnGoods

// GET/api/admin/common/1.0/autoGenerateHistoryInventory 自动生成历史库存

// GET/api/admin/common/1.0/autoGeneratePickPendingOrder 自动波次

// GET/api/admin/common/1.0/autoGenerateProcessingOrder 自动生成加工单

// GET/api/admin/common/1.0/autoGeneratePurchasePlan 测试触发生成计划

// GET/api/admin/common/1.0/autoGenerateStatement 自动生成结算单

// GET/api/admin/common/1.0/download 下载Excel
export const downloadUrl = `${PREFIX}/download`;

// GET/api/admin/common/1.0/loadMessageRecord 加载处理失败的消息

// POST/api/admin/common/1.0/redeliveryMessage 重新发送失败的消息
