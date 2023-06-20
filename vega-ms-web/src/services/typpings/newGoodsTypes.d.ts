// new-goodsTypes-controller 新基础物资
declare namespace NewGoodsTypesController {
  type PageListParams = Pager & {
    goodsName?: string; // 商品名称,长度最多为100位字符
    isEnabled?: boolean;
    highValue?: boolean; // 物资属性，true-高值 false-低值
    pmCode?: string; // 产品主码
    diCode?: string; // DI
    manufacturerIds?: number[]; // 生产厂家
    antiEpidemic?: string; // 是否是抗疫物资
    chargeNum?: string; // 本地医保编码
    specification?: string; // 规格/型号
    nationalNo?: string; // 国家医保编码
    isCombined?: boolean;
    keywords?: string;
    isCombinedDevelopment?: boolean;
    departmentId?: string;
    goodsId?: number;
    // barcodeControlled?: string;
    // categoryId?: string;
    // chargeCode?: string;
    // chargeName?: string;
    // commonName?: string; // 通用名,长度最多为100个字符
    // custodianIds?: string;
    // enabled?: string;
    // goodsId?: string;
    // id?: string;
    // isBarcodeControlled?: string;
    // manufacturerName?: string; // 生产厂家名称
    // materialCategory?: string; // 物资类别
    // materialCode?: string;
  };

  interface GoodsRecord {
    id: number;
    goodsName?: string; // 物资名称
    isEnabled?: boolean; // 状态
    combined?: string;
    highValue?: boolean; // 物资属性，true-高值 false-低值
    manufacturerIds?: number[]; // 生产厂家
    materialCode?: string; // 物资编号
    pmCode?: string; // 产品主码
    diCode?: string; // DI
    name?: string; // 物资名称
    manufacturerName?: string; // 生产厂家
    distributorName?: string; // 配送商业
    chargeNum?: string; // 本地医保编码
    nationalNo?: string; // 国家医保编码
    isHighValue?: boolean; // 物资属性
    materialCategory?: string; // 物资类别
    antiEpidemic?: boolean; // 是否是抗疫物资 true-抗疫物资 false-非抗疫物资
    specification?: string; // 规格
    model?: string; // 型号
    procurementPrice?: number; // 单价（元）
    minGoodsUnit?: string; // 计价单位
    largeBoxNum: number; // 大包装
    minGoodsNum: number; // 中包装
    timeModified?: number; // 操作时间
    boolConversion?: any;
    conversionRate?: string;
    conversionUnitName?: string;
    createdBy?: string;
    firstEnabledTime?: number;
    goodsGroupType?: string;
    goodsExtendedAttrMap?: Record<string, any>;
    storageAreaName?: string; // 所属库房
    storageAreaId?: number; // 所属库房id
    storageCabinetName?: string; // 所属货架
    storageCabinetId?: number; // 所属货架id
    storageLocBarcode?: string; // 货位号，可以通过这个字段来判断是否已经绑定库房
    storageLocationId?: number; // 所属货位id

    // 详情字段
    lowTemperature?: number; // 最低保存温度
    highTemperature?: number; // 最高保存温度
    imgUrl?: string; // 物资图片
    imgUrlList?: string[]; // 物资图片
    isConsumableMaterial?: boolean; // 是否医疗器械
    isBarcodeControlled?: boolean; // 是否条码管控"
    isImplantation?: boolean; // 是否植/介入物
    description?: string; // 其他信息
    brand?: string; // 品牌
    categoryText?: string; // 分类
    commonName?: string; // 通用名称
    custodianId?: number; // 配送商业id
    custodianName?: string; // 配送商业
    distributorList?: {
      defaultDistributor?: string;
      distributorName?: string;
    }[]; // 一级供应商
    departments?: string[]; // 科室
    distributors?: string[]; // 一级供应商
    imageUrl?: string;
    manufacturerId?: number; // 生产商id
    manufacturerName?: string; // 生产商
    registrationList: {
      registrationNum?: string; // 注册证照
      registrationImg?: string; // 注册证照图片
      registrationImgList?: string[]; // 注册证照图片
      registrationBeginDate?: number; // 注册有效期
      registrationEndDate?: number; // 注册有效期
      registrationDate?: boolean; // 是否是长效期
      endTimeIsNull?: boolean; // 区分有效期至和长期有效
      id?: number;
      goodsId?: number;
    }[];
    std95GoodsCategoryId?: number;
    std95GoodsCategoryIds?: number[];
    std2012GoodsCategoryId?: number;
    std2012GoodsCategoryIds?: number[];
    std2018GoodsCategoryId?: number;
    std2018GoodsCategoryIds?: number[];
    supplierList?: {
      supplierId?: number;
      supplierName?: string;
      defaultSupplier?: string;
    }[]; // 经销商

    // 编辑用到的字段
    commonNameAcronym?: string;
    height?: number;
    instrument?: string; // 仪器,长度最多为100个字符
    length?: number;
    limitPerMonth?: number;
    limitType?: string;
    materialActivationTime?: number; // 物料启用时间,时间戳类型13位
    minGoodsUnitId?: number | string;
    moreMinGoodsUnitId?: string;
    nameAcronym?: string;
    nearExpirationDays?: number;
    productNum?: string;
    purchaseGoodsUnit?: string;
    purchaseGoodsUnitId?: number | string;
    registrationBeginDate?: number;
    registrationEndDate?: number;
    registrationNum?: string;
    storagePlace?: string; // 存放地,长度最多为100个字符
    supplierName?: string;
    width?: number;
    stageType?: boolean;
    largeBoxUnitId?: number | string;
    quantity?: number;
    extendedAttrValues?: {
      extendedAttrId?: number;
      fieldDescribe?: string; // 字段名称
      fieldName?: string; // 字段
      fieldType?: 'Integer' | 'Float' | 'Long' | 'Double' | 'String' | 'Date' | 'Boolean'; // 字段类型
      fieldValue?: number | string | boolean;
      goodsId?: number;
      id?: number;
    }[];
    registrationDueDate?: number;
    otherAttachments: Record<string, any>;
    keyItem: boolean; // 是否重点品种，有原本的扩展字段改成了基础字段
    goodsSpecification?: string;
  }
  interface GetBubbleExpireCountRecord {
    expireCount: number;
    willExpireCount: number;
  }

  interface DepartmentPage extends Pager {
    goodsId?: number | string;
  }
}
