// MedicalAdvice Controller 出库业务-医嘱管理
declare namespace MedicalAdviceController {
  interface ListRecord {
    id: number;
    adviceId: number;
    adviceNo: string; // 收费序号（原医嘱序号）
    hisDeptCode: string; // his科室编号
    hisDeptName: string; // his科室名称
    hisDeptId: number; // his科室id
    spdDeptName: string; // spd科室名称
    spdDeptId: number; // spd科室id
    content: string; // 医嘱内容
    status: string; // 医嘱状态
    chargeCode: string; // 收费项编号
    chargeName: string; // 收费项名称
    doctorCode: string; // 医生编号
    doctorId: number; // 医生id
    doctorName: string; // 医生名字
    doctorTitle: string; // 医生职称
    patientName: string; // 病人名称
    patientNo: string; // 病人编号
    patientId: number;
    gender: string;
    birth: number;
    hospitalizationNum: string; // 住院号
    bedNo: string; // 床位号
    timeCreated: number; // 创建时间
    currentVersion: string;
    timeLocked: number; // 消耗时间（原确认时间）
    lockedBy: number; // 消耗人id（原确认人）
    lockedByName: string; //消耗人名称
    timeUnlocked: string;
    adviceType: string; // 医嘱类型(0:医嘱;1:病区补记账;2.手术补记账)
    isBarcodeControlled: boolean; // 是否条码管控：true是 false否
    type: string;
    implantSerialNumber: string;
    stageType: string;
    hisId: number;
    untreated: boolean;//执行状态
  }

  type TableListPager = Pager & {
    adviceNo?: string;
    departmentIds?: number;
    doctorCode?: string;
    doctorName?: string;
    hospitalizationNum?: string;
    lockedBy?: string;
    patientName?: string;
    patientNo?: string;
    statuses?: string;
    timeCreatedFrom?: number;
    timeCreatedTo?: number;
    timeLockedFrom?: number;
    timeLockedTo?: number;
    chargeCode?: string;
    chargeName?: string;
    adviceType?: number;
    implantSerialNumber?: string;
  };

  interface DetailParams {
    adviceNo?: string;
    adviceId?: number;
  }

  interface DetailListRecord {
    medicalChargeId: string; // 医嘱收费id
    dataVersion: string; // 收费版本
    field_9hospitalId: number; // 医院id
    adviceId: number;
    chargeCode: string; // 收费项编码
    chargeName: string; // 收费项名称
    chargeNum: string; // 医保编号
    chargeId: string; // 收费项id
    status: string; // 状态
    timeCreated: string;
    operatorBarcode: string; // 物资条码
    materialName: string;
    model: string; // 规格
    specification: string; // 型号
    manufacturerName: string; // 产商
    timeConsumed: number; // 消耗时间
    consumedByName: string; // 消耗人名字
    consumedBy: number; // 消耗人id
    consumedDepartmentName: string; // 消耗科室
    consumedDepartmentId: number; // 消耗科室id
    deleted: boolean;
    name: string;
    goodsName: string;
    distributorName?: string;
    distributorBeans?: Record<string, any>[];
    distributorId?: string;
    isScan?: boolean;
    materialCode: string;
    udiCode: string;
    barcodeControlled: boolean;
    keyItem: boolean;
    printed: boolean;
    productionDate?: number;
    sterilizationDate?: number;
    expirationDate?: number;
    lotNum?: string;
    isLotNum?: boolean;
    isProductionDate?: boolean;
    serialNum: string;
    isBarcodeControlled?: boolean;
    isBatchConsume?: boolean;
    isExpirationDate?: boolean;
    newOperatorBarcode?: string;
  }

  interface LockGoodsParams {
    adviceNo?: string; // 医嘱编号
    consumeId?: number; // 医嘱消耗id
    barcode?: string; // 物资实例编码
  }

  interface UnConsumeParams {
    adviceChargeId: number;
  }

  interface ScanUdiParams {
    udiCode: string;
  }

  interface ScanUdiData {
    id: number;
    goodsName: string; // 物资名称
    specification: string; // 规格
    model: string; // 型号
    materialCode: string; // 物资编码
    udiCode: string;
    manufacturerName: string;
    distributorBeans?: Record<string, any>[];
    distributorName?: string;
    distributorId?: string;
    lotNum?: string;
    expirationDate?: number;
    productionDate?: number;
    isBatchConsume?: boolean;
  }

  interface DetailProps {
    setIsOpen: (value: boolean) => void;
    isOpen: boolean;
    handleType: string;
    orderInfo: Partial<MedicalAdviceController.ListRecord>;
    getFormList: () => void;
  }

  interface MedicalAdviceParams {
    adviceNo?: string;
    hospitalizationNum?: string;
    patientNo?: string;
    pageNum?: number; // 访问页码,最小为0
    pageSize?: number; //分页大小,最小为0
  }

  interface MedicalAdvice {
    page: any;
    patient: ConsumeController.Patient;
  }

  interface GoodsListParams {
    adviceId?: number;
    goodsName?: string;
    manufacturerName?: string;
    pageNum?: number; // 访问页码,最小为0
    pageSize?: number; //分页大小,最小为0
  }
}
