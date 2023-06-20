// 配送商业基础数据相关操作 distributor-authorization-controller
declare namespace DistributorAuthorizationController {
  interface GoodsListRecord {
    id: number;
    isDeleted: boolean;
    timeCreated: number;
    timeModified: number;
    createdBy: number;
    modifiedBy: number;
    hospitalId: number;
    name: string;
    manufacturerId: number;
    manufacturerName: string; // 生产厂家
    materialCode: string; // SPD物资编号
    specification: string; // 规格/型号
    model: string; // 型号
    brand: string;
    commonName: string;
    chargeNum: string;
    nationalNo: string;
    materialCategory: string;
    procurementPrice: number;
    nearExpirationDays: number;
    pmCode: string;
    minGoodsUnitId: number;
    minGoodsUnit: string; // minGoodsUnit
    purchaseGoodsUnitId: number;
    purchaseGoodsUnit: string;
    minGoodsNum: number;
    std2012GoodsCategoryId: number;
    std2018GoodsCategoryId: number;
    std95GoodsCategoryId: number;
    imageUrl: string; // 授权书
    isEnabled: boolean;
    isHighValue: boolean;
    isImplantation: boolean;
    isConsumableMaterial: boolean;
    isBarcodeControlled: boolean;
    custodianId: number;
    custodianName: string;
    diCode: string;
    antiEpidemic: string;
    registrationBeginDate: number;
    registrationEndDate: number;
    firstEnabledTime: number;
    registrationNum: string; // 注册证号
    stageType: boolean;
    largeBoxUnitId: number;
    largeBoxUnit: string;
    largeBoxNum: number; // 大包装
    goodsGroupType: string;
    imgUrl: string;
    description: string;
    limitType: number;
    limitPerMonth: number;
    registrationList: Record<string, any>[];
    goodsId: number; // 物资id
    invoiceSync: boolean;
    highValue: boolean;
    enabled: boolean;
    goodsName: string;
    minGoodsUnitNum: string;
    authorizationEndDate: number;
    authorizationStartDate: number;
    price: number;
    message: string;
    key?: number;
  }

  interface EnabledParams { }

  interface UpdateParams { }

  interface DetailData {
    id: number;
  }

  interface ListRecord {
    id: number;
    isDeleted: boolean;
    timeCreated: number;
    timeModified: number;
    createdBy: number;
    custodiaId: number;
    modifiedBy: number;
    distributorId: number;
    distributorName: string;
    authorizingDistributorId: number;
    authorizingDistributorName: string;
    authorizationBeginTime: number;
    authorizationEndTime: number;
    hospitalId: number;
    goodsId: number[];
    authorizationImg: string;
    remark: string;
    isEnabled: boolean;
    amount: number;
    lastModified: number;
    authorizingDistributorCreditCode: string;
    distributorCreditCode: string;
    distributorBeginTime: number;
    distributorEndTime: number;
    authorizingDistributorBeginTime: number;
    authorizingDistributorEndTime: number;
  }
  interface ListProps {
    id: number;
    passive: boolean;
    companyName: string;
  }

  interface GoodsListPropsType {
    visible: boolean;
    close: () => void;
    authId: any;
    isDetail?: boolean;
    type: string;
  }

  interface AuthDetailData {
    distributorName: string;
    authorizationBeginTime: number;
    authorizationEndTime: number;
    authorizationImg: string;
    remark: string;
    goodsId: number[];
    distributorId?: number;
  }

  interface RecordListRecord {
    id: number;
    isDeleted: boolean;
    timeCreated: number;
    timeModified: number;
    createdBy: number;
    custodiaId: number;
    modifiedBy: number;
    distributorId: number;
    distributorName: string;
    authorizingDistributorId: number;
    authorizingDistributorName: string;
    authorizationBeginTime: number;
    authorizationEndTime: number;
    hospitalId: number;
    goodsId: number[];
    authorizationImg: string;
    remark: string;
    isEnabled: boolean;
    amount: number;
    lastModified: number;
    authorizingDistributorCreditCode: string;
    distributorCreditCode: string;
    distributorBeginTime: number;
    distributorEndTime: number;
    authorizingDistributorBeginTime: number;
    authorizingDistributorEndTime: number;
  }

  interface AddOrEditManufacturerParams {
    test: string;
  }

  type TableListPager = Pager & {
    status?: string;
    name?: string;
    key?: number;
  };

  type GoodsListPager = Pager & {
    chargeNum?: string;
    distributorId?: number;
    enabled?: boolean;
    goodsName?: string;
    hospitalId?: number;
    id?: string;
    invoiceSync?: string;
    manufacturerIds?: number[];
    materialCode?: string;
    registrationNum?: string;
  };

  interface DistributorListRecord {
    id: number;
    isDeleted: boolean;
    timeCreated: number;
    timeModified: number;
    createdBy: number;
    modifiedBy: number;
    mergeName: number;
    companyName: string;
    companyNameAcronym: string;
    companyEstablishedTime: string;
    companyLegalPerson: string;
    principalName: string;
    principalPhone: string;
    principalEmail: string;
    districtCode: number;
    address: string;
    isEnabled: boolean;
    type: string;
    depositBank: string;
    bankAccount: number;
    companyType: string;
    nationality: string;
    country: string;
    registrant: string;
    companyNature: string;
    contactName: string;
    contactTelephone: string;
    contactMobilePhone: string;
    contactPosition: string;
    contactDepartment: string;
    companyTelephone: string;
    companyEmail: string;
    companyFax: string;
    shortName: string;
    remark: string;
    website: string;
    postcode: string;
    hospitalId: number;
    hasPermitLicense: string;
    hasRecordLicense: string;
    licenseDistributorBusiness: {
      id: number;
      isDeleted: boolean;
      timeCreated: number;
      timeModified: number;
      createdBy: number;
      modifiedBy: number;
      manufacturerId: number;
      isUnionLicense: string;
      licenseImg: string;
      licenseNo: string;
      licenseBeginTime: number;
      licenseEndTime: number;
      licenseScope: string;
      establishedTime: number;
      legalPerson: string;
      registeredCapital: string;
      registeredCurrency: string;
      registeredCurrencyName: string;
      companyType: string;
      qualityManager: string;
      qualityManagerAddress: string;
      productionAddress: string;
      warehouseAddress: string;
      remark: string;
      creditCode: string;
      std2012CategoryIds: number[];
      std2018CategoryIds: number[];
      std95CategoryIds: number[];
    };
    licenseManufacturerPermit: {
      id: number;
      isDeleted: boolean;
      timeCreated: number;
      timeModified: number;
      createdBy: number;
      modifiedBy: number;
      manufacturerId: number;
      permitImg: string;
      permitNo: string;
      permitBeginTime: number;
      permitEndTime: number;
      permitScope: string;
      principalName: string;
      legalPerson: string;
      registeredAddress: string;
      remark: string;
      std2012CategoryIds: number[];
      std2018CategoryIds: number[];
    };
    manufactureRecordVoucher: string;
    text?: string;
    value?: number;
  }

  interface CheckGoodsParams {
    id: number;
    goodsId: number[];
  }

  interface GetEnabledAuthorizingDistributorRes {
    amount: number;
    authorizationBeginTime: string;
    authorizationEndTime: string;
    authorizationImg: string;
    authorizationImgList: string[];
    authorizingDistributorBeginTime: string;
    authorizingDistributorCreditCode: string;
    authorizingDistributorEndTime: string;
    authorizingDistributorId: number;
    authorizingDistributorName: string;
    authorizingDistributorNameList: string[];
    createdBy: number;
    distributorBeginTime: string;
    distributorCreditCode: string;
    distributorEndTime: string;
    distributorId: number;
    distributorName: string;
    goodsId: number[];
    hospitalId: number;
    id: number;
    isDeleted: boolean;
    isEnabled: boolean;
    lastModified: number;
    modifiedBy: number;
    remark: string;
    timeCreated: string;
    timeModified: string;
  }
}
