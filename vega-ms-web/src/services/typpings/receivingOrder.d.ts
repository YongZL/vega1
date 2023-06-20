// 验收 : ReceivingOrder Controller
declare namespace ReceivingOrderController {
  interface ListRecord {
    id: number;
    isDeleted: boolean;
    timeCreated: number;
    timeModified: number;
    createdBy: number;
    modifiedBy: number;
    supplierName: string;
    supplierId: number;
    receivingCode: string;
    receivingId: number;
    shippingCode: string;
    shippingOrderId: number;
    inspectorName: string;
    inspectorId: number;
    deliveryUserName: string;
    expectDeliveryDate: number;
    status: string;
    actualAcceptanceDate: number;
    departmentName: string;
    departmentId: number;
    hospitalName: string;
    hospitalId: number;
    custodianId: number;
    custodianName: string;
    surgicalPackageRequestItemId: number;
    surgicalPackageRequestId: number;
    surgicalName: string;
    packageSurgicalId: number;
    packageSurgicalName: string;
    warehouseId: number;
    warehouseName: string;
    shippingOrderStatus: string;
    surgicalPackageSelected: boolean;
    combinedStatus: string;
    purchaseOrderId: number;
    invoiceSync: boolean;
    purchaseOrderType: string;
    distributorName: string;
    distributorId: number;
    storageAreaName: string;
    needPrint?: boolean;
    invoiceCode?: string;
    editInvoiceNo?: boolean; // 编辑发票编号
    ambivalentPlatformOrder?: boolean; // 初始化两定平台订单值
    invoiceNo?: string;
    invoiceAmount?: number;
    invoicingDate?: number;
    taxRate?: number;
  }

  type TableListPager = Pager & {
    actualAcceptanceFrom?: number;
    actualAcceptanceTo?: number;
    departmentIds?: number[];
    hospitalId?: number;
    invoiceSync?: boolean;
    purchaseOrderId?: number;
    purchaseOrderType?: string;
    receivingCode?: string;
    shippingCode?: string;
    statusList?: number[];
    supplierId?: number;
    surgicalRequest?: string;
  };

  interface DetailGoodsList {
    id: number;
    goodsItemId: number;
    keyItem: boolean;
    barcodeControlled: boolean;
    printed: boolean;
    isDeleted: boolean;
    needPrint: boolean;
    timeCreated: number;
    timeModified: number;
    createdBy: number;
    modifiedBy: number;
    shippingOrderId: number;
    goodsName: string;
    manufacturerName: string;
    specification: string;
    model: string;
    registrationNum: string;
    minUnitName: string;
    unitNum: number;
    purchaseUnitName: string;
    orderQuantity: number;
    highValue: boolean;
    goodsId: number;
    lotNum: string;
    productionDate: number;
    expirationDate: number;
    sterilizationDate: number;
    price: number;
    udiCode: string;
    gs1Code1: string;
    gs1Code2: string;
    gs1Code3: string;
    gs1DataMatrix: string;
    operatorBarcode: string;
    status: string;
    remark: string;
    quantityInMin: number;
    materialCode: string;
    pmCode: string;
    acceptanceConclusion: string;
    passedQuantity: string;
    serialNo: string;
    invoiceSync: boolean;
    distributionUnitQuantity: number;
    distributionUnitId: number;
    distributionUnitName: string;
    presenter: boolean;
    warehouseId: number;
    warehouseName: string;
    receivingReportId: number;
    nearExpirationDays: number;
    shippingOrderItemId: number;

    shippingCode: string;
    custodianId: number;
    largeBoxName: string;
    largeBoxNum: number;
    distributorId: number;
    authorizingDistributorId: number;
    diCode?: number;
  }

  interface DetailData {
    receiving: DetailGoodsList[];
    received: DetailGoodsList[];
  }

  interface OrderIdParams {
    receivingOrderId: number;
  }

  interface PassOrRejectParams {
    freeCode?: string;
    passedQuantity?: number;
    format?: number;
    reason?: string;
    shippingOrderCode?: string;
  }
  interface GoodsBeans {
    id?: number; //物资id
    name?: string; //物资名称
    materialCode?: string; //物资编号
    specification?: string; //规格
    model?: string; //型号
    isBarcodeControlled?: boolean;
  }
  interface BindShippingOrderItem {
    goodsName?: string; //物资名称
    lotNum?: string; //批号
    serialNo?: string; //序列号
    quantity?: number; //数量
    msg?: string; //验收成功返回的文字
  }
  interface ScanCodePassRecord {
    goodsBeans: GoodsBeans[]; //待绑定物资列表
    bindShippingOrderItem: BindShippingOrderItem; //被验收成功的配送单绑定物资
  }

  interface ScanCodePassData {
    // pda: boolean;
    receivingOrderId: number; //验收单id
    code: string;
    quantity: number; //数量
    receivingOrderItemId?: number; //验收单详情id（验收单单个物资详情验收时必传）
    goodsId?: number; //物资id（未绑定DI的物资，进行选择绑定时必传）
    passedQuantity?: number;
  }
  interface BatchPassParams {
    operatorCodes?: string[];
    item?: string;
    reason?: string;
    shippingOrderCode?: string;
    status?: string;
  }

  interface LoadCodeParams {
    goodsName?: string;
    lotNum?: string;
    materialCode?: string;
    receivingOrderId?: number;
    containPrinted?: boolean;
  }

  interface CountReceivingDetail {
    unBarcodeControlledCount: number;
    totalCount: number;
  }

  interface UpdateInvoiceCode {
    receivingOrderId?: number;
    invoiceCode?: string;
    invoiceNo?: string;
    invoiceAmount?: number | null;
    invoicingDate?: number | null;
    taxRate?: number;
  }

  interface UpdateAmbivalentPlatformOrder {
    receivingOrderId?: number;
    ambivalentPlatformOrder?: boolean;
  }
}
