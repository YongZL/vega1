// goodsTypes-controller 物资
declare namespace GoodsTypesController {
  interface BatchList {
    bind?: boolean;
    chargeCode?: number;
    chargeName?: string;
    chargeNum?: string;
    description?: string;
    detailGoodsMessage?: string;
    goodsId?: number;
    id?: number;
    manufacturerName?: string;
    materialCode?: string;
    menabled?: boolean;
    minGoodsUnit?: string;
    model?: string;
    name?: string;
    ordinaryCode?: number;
    packageBulkCode?: number;
    packageBulkId?: number;
    packageBulkName?: string;
    packageOrdinaryId?: number;
    packageOrdinaryName?: string;
    price?: string;
    purchaseGoodsUnit?: string;
    quantity?: string;
    specification?: string;
    unitNum?: number;
  }

  type TableListPager = Pager & {
    status?: string;
    name?: string;
    key?: number;
  };

  type WithoutPricePager = Pager & {
    antiEpidemic?: boolean; // 是否是抗疫物资
    categoryId?: number;
    commonName?: string; // 通用名,长度最多为100个字符
    custodianIds?: number[];
    diCode?: string;
    goodsId?: number;
    goodsName?: string; // 商品名称,长度最多为100位字符
    highValue?: string;
    id?: string;
    isBarcodeControlled?: boolean;
    isCombined?: boolean;
    isEnabled?: boolean;
    keywords?: string;
    manufacturerIds?: number[];
    manufacturerName?: string; // 生产商名称
    materialCategory?: string; // 物资类别
    materialCode?: string;
    pmCode?: string;
    registrationNum?: string;
  };

  interface WithoutPriceListRecord {
    id: number;
    goodsId: number;
    authorizationStartDate: number;
    authorizationEndDate: number;
    specification: string;
    model: string;
    largeBoxNum: number;
    minGoodsNum: string;
    minGoodsUnitNum: string;
    key?: number;
  }

  type queryGoodsTypeParams = Pager & {
    goodsTypeEnum?: 'package_ordinary' | 'goods'; //基础物资：goods；定数包：package_bulk；普耗包：package_ordinary
    goodsName?: number; //物资名
    materialCode?: number; //物资编码
    bind?: boolean; //是否绑定过
    enabled?: boolean; //状态
    pageNum?: number;
    pageSize?: number;
  };

  interface GoodsField {
    id?: number; // id
    hospitalId?: string; // 医院id
    displayFieldLabel?: string; // 物资属性label描述
    displayFieldKey?: string; // 物资属性key标识
    enabled?: boolean; // 是否启用
    required?: boolean; // 是否是必填
    listShow?: boolean; // 是否在列表展示
    lineShow?: boolean; // 扩展字段是否在一行显示
    displayFieldType?: 'Integer' | 'Float' | 'Long' | 'Double' | 'String' | 'Date' | 'Boolean'; // 物资属性类型
    sort: number;
    listSort: number;
  }
  interface GoodsByDepartmentRecord {
    stock?: number;
    minTotal?: number | string;
    antiEpidemic: boolean;
    boolConversion: boolean;
    chargeNum: string; //医保编码
    combined: boolean;
    commonName?: string; //通用名
    conversionRate: number; //转换比
    conversionUnitName: string; //请领单位
    createdBy?: number; //创建人id
    custodianId?: number;
    custodianName?: string;
    description: null;
    distributorName?: string; //配送商业
    firstEnabledTime?: number;
    goodsExtendedAttrMap?: Record<string, any>;
    goodsGroupType?: string;
    goodsId: number; //物资id
    hospitalId?: number; //所属医院id
    id: number;
    imgUrlList: string[]; //物资图片url
    imageUrl: string;
    isBarcodeControlled: boolean;
    isConsumableMaterial: boolean;
    isDeleted?: boolean;
    isEnabled?: boolean;
    isHighValue?: boolean;
    isImplantation: boolean;
    largeBoxNum: number; //大包装
    manufacturerId: number;
    manufacturerName: string;
    materialCategory: string;
    materialCode: string;
    minGoodsNum: number; //中包装
    minGoodsUnit?: string; //计价单位
    minGoodsUnitId: number;
    model?: string; //型号
    name?: string;
    nearExpirationDays?: number;
    price: number | string;
    procurementPrice: number; //单价
    purchaseGoodsUnit: string;
    purchaseGoodsUnitId: number;
    registrationBeginDate: number;
    registrationEndDate: number;
    registrationNum?: string;
    specification?: string;
    stageType?: boolean;
    std2018GoodsCategoryId: number;
    stocks: number; //库存量
    timeModified?: number;
    requestReason?: string;
    quantity?: number | string; //请领数量
    rowKeyId: number;
    goodsName?: string;
    isUrgent?: boolean;
    storageAreaId?: number;
    minGoodsUnitName: string;//计价单位
  }

  interface ReallocationRecord {
    id: number;
    materialCode: string; //物资编号
    goodsName: string; //物资名称
    operatorBarcode: string; //物资条码
    specification: string; //规格
    model: string; //型号
    manufacturerName: string; //生产商
    quantity: number; //调拨数量
    remarks: string; //调拨事由
    isBarcodeControlled?: boolean;
    printed?: boolean;
    udiCode?: string;
    allotNum: number;
  }

  type GoodsByDepartmentParams = Pager & {
    isEnabled?: boolean; // 是否禁用
    departmentAdd?: boolean; //是否为科室绑定
    departmentId?: number; //科室id
  };
}
