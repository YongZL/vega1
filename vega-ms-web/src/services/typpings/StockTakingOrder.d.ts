//盘库 : StockTakingOrder Controller

declare namespace StockTakingOrderController {
  //查询盘库列表入参
  type GetListRuleParams = CommonPageParams & {
    createdFrom?: string;
    createdTo?: string;
    operator?: string;
    reviewer?: string;
    sortList?: [];
    sortableColumnName?: string;
    status?: string;
    warehouseIds?: number;
    warehouseName?: string;
    watcher?: string;
  };
  //查询盘库列表出参
  interface GetDetailRuleParams {
    code?: string;
    createdBy?: number;
    createdByName?: string;
    hospitalId?: number;
    id?: number;
    isDeleted?: boolean;
    modifiedBy?: string;
    operator?: string;
    reviewer?: string;
    status?: string;
    stockTakingOperator?: number;
    stockTakingReviewer?: number;
    stockTakingWatcher?: number;
    timeCreated?: string;
    timeEnd?: string;
    timeModified?: string;
    warehouseId?: number;
    warehouseName?: string;
    watcher?: string;
  }
  // 查看详情出参
  interface GetStockDetailParams {
    actualStockQuantity?: number;
    errorReason?: string;
    expirationDate?: number;
    goodsName?: string;
    id: number;
    lotNum?: string;
    manufacturerName?: string;
    materialCode?: number;
    model?: string;
    operationTime?: number;
    operator?: string;
    price?: number;
    specification?: string;
    systemStockQuantity: number;
    terminal?: string;
    unit?: string;
    barcodeControlled?: boolean;
  }
  // 生成盘库单入参
  interface GenerateStockTakingOrder {
    goodsIds: number[];
    storageAreaId: number
  }
  // 查询盘库单明细入参
  type GetStockDetails = {
    pageNum?: number;
    pageSize?: number;
    stockTakingOrderId?: string;
    materialCode?: string;
    type?: string;
  };
  // 查询盘库单明细出参
  interface GetStockQueryDetails {
    actualStockQuantity?: number;
    createdBy?: number;
    errorReason?: string;
    goodsId?: number;
    goodsName?: string;
    id?: string;
    isDeleted?: boolean;
    lotNum?: string;
    materialCode?: string;
    minGoodsUnit?: string;
    minGoodsUnitNum?: number;
    model?: string;
    modifiedBy?: string;
    packageBulkId?: number;
    packageBulkName?: string;
    packageBulkUnit?: string;
    packageBulkUnitNum?: string;
    packageSurgicalId?: number;
    packageSurgicalName?: string;
    purchaseGoodsUnit?: string;
    solutions?: string;
    specification?: string;
    stockTakingOrderId?: number;
    systemStockQuantity?: number;
    timeCreated?: string;
    timeModified?: string;
  }
  // 提交盘盈、盘亏原因和解决办法入参
  type SolvingStockError = {
    stockTakingOrderId?: string;
    items?: SolvingStockErrorItems[];
  };
  type SolvingStockErrorItems = {
    errorReason?: string;
    id?: number;
    solutions?: string;
  };
  // 盘库入参
  type StockTaking = {
    stockTakingOrderId: number;
    itemDtoList: {
      actualStockQuantity?: number,
      errorReason?: string,
      itemId: number,
    }[];
    status: 'finished' | 'stock_taking'; // 'finished'代表提交，'stock_taking'代表暂存
  };
  type WarehousesList = {
    createdBy?: number;
    deliveryGroupId?: number;
    deliveryGroupName?: string;
    departmentId?: string;
    departmentName?: string;
    hospitalId?: number;
    id?: number;
    isDeleted?: boolean;
    isVirtual?: boolean;
    level?: number;
    modifiedBy?: string;
    name?: string;
    nameAcronym?: string;
    priority?: string;
    timeCreated?: string;
  };


  type ReasonList = {
    createdBy: number;
    hospitalId: number;
    id: number;
    isDeleted: false;
    modifiedBy: null;
    reason: string;
    timeCreated: number;
    timeModified: number;
  }

  type GetStockTakingGoodsParams = CommonPageParams & {
    chargeNum?: string;
    goodsName?: string;
    materialCode?: string;
    nationalNo?: string;
    specificationOrModel?: string;
    storageAreaId?: string;
  };
}
