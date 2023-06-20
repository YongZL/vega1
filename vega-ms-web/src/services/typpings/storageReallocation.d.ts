// 库房调拨单接口 Storage Reallocate Controller

declare namespace StorageReallocateController {
  interface ReallocateRecord {
    code: string; // 调拨编号
    createdBy: number;
    createdByName: string; // 申请人
    expectedTime: number; // 预计时间
    goodsType: 1 | 2; // 物资类型 1-基础物资 2-医耗套包
    hospitalId: number; // 医院id
    id: number;
    inStorageBy: number; // 入库操作人
    inStorageTime: number; // 入库时间
    // isDeleted: boolean;
    modifiedBy: number;
    outStorageBy: number; // 出库操作人
    outStorageTime: number; // 出库时间
    sourceStorageAreaId: number; // 供货库房id
    sourceStorageAreaName: string; // 供货库房名称
    status: number; // 状态 1-待出库 2-出库中 3-待入库 4-待上架 5-已完成 6-已终止
    targetStorageAreaId: number; // 到货库房id
    targetStorageAreaName: string; // 到货库房名称
    timeCreated: number;
    timeModified: number;
    type: number; // 调拨类型 1-手动申请 2-自动申请
  }

  type PageListParams = Pager & {
    applicant?: string; // 申请人员
    code?: string; // 申请单号
    endTime?: string; // 申请结束时间
    goodsType?: number; // 物资类型
    sourceStorageAreaId?: number; // 供货库房
    startTime?: number; // 申请开始时间
    targetStorageAreaId?: number; // 到货库房
    type?: number; // 调拨类型
  };

  type GetApplyGoodsListParams = Pager & {
    chargeCode?: string; // 收费编码
    chargeNum?: string; // 本地医保编号
    commonName?: string; // 通用名称
    goodsName?: string; // 基础物资名称
    keyword?: string; // 套包编号/名称
    materialCode?: string; // 基础物资编码
    goodsType?: number; // 物资类型 1-基础物资 2-医耗套包
    sourceStorageAreaId?: number; // 供货库房id
    targetStorageAreaId?: number; // 到货库房id
  };
  interface GetApplyGoodsListRecord {
    chargeCode?: string; //收费项编码
    chargeName?: string; //收费项
    chargeNum?: string; //本地医保编码
    code?: string; //基础物资/医耗套包编号
    commonName?: string; //通用名称
    id: number; //基础物资/医耗套包id
    manufacturerName?: string; //生产厂家
    model?: string; //型号
    name?: string; //基础物资/医耗套包名称
    ordinaryDescription?: string; //医耗套包说明
    procurementPrice?: number; //单价(元)
    remainStock?: number; //可用库存
    specification?: string; //规格
    goodsType?: string;
    goodsId?: number;
    minTotal?: string;
    conversionRate?: string;
    Type?: string;
    Id?: number;
    quantity?: number | '';
    reason?: string;
  }

  type createData = {
    type: number; // 物资类型
    items: {
      id: number; // 基础物资/医耗套包id
      quantity: number; // 申请数量
      reason: string; // 申请事由
    }[]; // 基础物资/医耗套包数据集合
    sourceStorageAreaId: number; // 供货库房id
    targetStorageAreaId: number; // 到货库房id
  };

  interface AreaRecord {
    id: number;
    name: string;
  }

  interface ReallocateDetailRecord {
    reallocateQuantity: number;//数量
    price: number;//单价
    expirationDate: number;//有效期至
    productionDate: number;//生产日期
    lotNum: string; 批号
    applyQuantity: number; // 申请数量
    applyReason?: string; // 申请事由
    barcodeControlled?: boolean;
    commonName?: string; // 通用名称
    createdBy?: number;
    goodsType?: number; // 物资类型 1-基础物资 2-医耗套包
    id: number;
    goodsId: number;
    isDeleted?: boolean;
    manufacturerName?: string; // 生产厂家
    modifiedBy?: number;
    relationId?: number;
    relationItemIds?: number[];
    relationName?: string; // 关联物资类型名称
    specification?: string; // 规格/型号
    storageReallocateId?: number;
    timeCreated?: string;
    timeModified?: string;
    ordinaryDescription?: string;
    model?: string; //型号
  }

  interface DetailItemParams {
    id: number;
    goodsId: number;
    lotNum: string;
    productionDate: number;
    expirationDate: number;
  }
}
