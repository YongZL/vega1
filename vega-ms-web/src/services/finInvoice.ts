// fin-invoice-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/fin/invoice/1.0';

// POST/api/admin/fin/invoice/1.0/approve 发票审核

// POST/api/admin/fin/invoice/1.0/check 发票验收

// POST/api/admin/fin/invoice/1.0/doCommitInvoiceFinState 销后结算发票上传

// POST/api/admin/fin/invoice/1.0/doCommitInvoiceManual 手工红冲发票上传

// POST/api/admin/fin/invoice/1.0/doCommitInvoiceSync 货票同行发票上传

// POST/api/admin/fin/invoice/1.0/electronicReverse 电子发票红冲

// GET/api/admin/fin/invoice/1.0/exportApprovePending 待审核导出

// GET/api/admin/fin/invoice/1.0/exportCheckPending 待验收导出

// GET/api/admin/fin/invoice/1.0/exportPayFinished 支付完成导出

// GET/api/admin/fin/invoice/1.0/exportPayPending 待支付导出

// GET/api/admin/fin/invoice/1.0/exportRejected 驳回导出

// GET/api/admin/fin/invoice/1.0/getEnterpriseList 获取所有开票企业

// GET/api/admin/fin/invoice/1.0/getInvoiceDetailByInvoiceId 根据发票查询发票明细

// GET/api/admin/fin/invoice/1.0/getInvoiceFinStateDetail 销后结算待修改详情

// GET/api/admin/fin/invoice/1.0/getInvoiceSummary 查询发票汇总信息

// GET/api/admin/fin/invoice/1.0/getInvoiceSyncDetail 货票同行原票待修改详情

// GET/api/admin/fin/invoice/1.0/getNormalInvoiceBySerialNumber 根据发票号码查询蓝票

// GET/api/admin/fin/invoice/1.0/getPaymentDetail 查看转账凭证

// GET/api/admin/fin/invoice/1.0/invoiceFinStatesPageList 分页获取销后结算开票列表

// GET/api/admin/fin/invoice/1.0/invoiceSyncPageList 分页获取货票同行开票列表

// GET/api/admin/fin/invoice/1.0/pageListApprovePending 列表查询-待审核

// GET/api/admin/fin/invoice/1.0/pageListCheckPending 列表查询-待验收

// GET/api/admin/fin/invoice/1.0/pageListPayFinished 列表查询-支付完成

// GET/api/admin/fin/invoice/1.0/pageListPayPending 列表查询-待支付

// GET/api/admin/fin/invoice/1.0/pageListRejected 列表查询-驳回

// POST/api/admin/fin/invoice/1.0/pay 发票支付

// POST/api/admin/fin/invoice/1.0/remove 发票作废

// POST/api/admin/fin/invoice/1.0/updateElectronicInvoice 修改电子发票

// POST/api/admin/fin/invoice/1.0/updateInvoiceFinState 销后结算修改

// POST/api/admin/fin/invoice/1.0/updateInvoiceSync 货票同行原票修改

// POST/api/admin/fin/invoice/1.0/updateManualReverseInvoice 修改手工红冲发票
