// logic-stock-taking-order-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/logicStockTakingOrder/1.0';

// POST/api/admin/logicStockTakingOrder/1.0/add 新增逻辑库盘库单

// POST/api/admin/logicStockTakingOrder/1.0/approvalFailure 逻辑库盘库单审核不通过

// POST/api/admin/logicStockTakingOrder/1.0/approvalSuccess/{id} 逻辑库盘库单审核通过

// POST/api/admin/logicStockTakingOrder/1.0/delete/{orderId} 删除逻辑库盘库单

// GET/api/admin/logicStockTakingOrder/1.0/get/{id} 查询逻辑库盘库单

// GET/api/admin/logicStockTakingOrder/1.0/pageList 查询逻辑库盘库单列表

// GET/api/admin/logicStockTakingOrder/1.0/print/{id} 打印逻辑库盘库单

// POST/api/admin/logicStockTakingOrder/1.0/submit 提交逻辑库盘库单
