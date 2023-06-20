// distributor-controller 配送商业
declare namespace DistributorController {
	interface DistributorsRecord {
		companyName: string;
		id: number;
		isEnabled: boolean;
		isTop?: boolean;
		distributorId?: number;
	}
	interface ListRecord {
		id: number;
		isDeleted: boolean;
		timeCreated: number;
		timeModified: number;
		createdBy: number;
		modifiedBy: string;
		statusUserId: number;
		companyName: string; //配送商业名称
		companyNameAcronym: string;
		companyEstablishedTime: number;
		companyLegalPerson: string;
		principalName: string;
		principalPhone: string;
		principalEmail: string;
		operationType: number;
		secondRecordImg: string;
		isEnabled: boolean; //状态
		type: number;
		depositBank: string;
		bankAccount: string;
		companyType: number;
		nationality: string;
		country: string;
		districtCode: number;
		registrant: string;
		companyNature: string;
		address: string;
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
		hasPermitLicense: boolean;
		hasRecordLicense: boolean;
		autoOrderTaking: string;
		mergeName: string;
		medicalInstruSubject: string;
		accountPeriod: number;
		provincePlatformCode: string;
		distributorAddressList: Record<string, any>[];
		licenseDistributorBusiness: Record<string, any>;
		licenseDistributorPermit: {
			id: number;
			isDeleted: boolean;
			timeCreated: number;
			timeModified: number;
			createdBy: number;
			modifiedBy: string;
			distributorId: number;
			permitImg: string;
			permitNo: string; //许可证号
			permitBeginTime: number;
			permitEndTime: number;
			permitScope: string;
			principalName: string;
			legalPerson: string;
			registeredAddress: string;
			warehouseAddress: string;
			remark: string;
			std2012CategoryIds: Record<string, any>[];
			std2018CategoryIds: Record<string, any>[];
		};
		licenseDistributorInstru: string;
		distributorRecordVoucher: string;
		status: number;
		enabled: boolean;
	}

	interface DetailParams {
		id: number;
	}

	interface LicenseBusiness {
		id: number;
		isDeleted: boolean;
		timeCreated: number;
		timeModified: number;
		createdBy: number;
		modifiedBy: string;
		distributorId: number;
		isUnionLicense: string;
		licenseImg: string; //营业执照
		licenseNo: string; // 证照编号
		licenseBeginTime: number; // 有效日期
		licenseEndTime: number; // 有效日期
		licenseScope: string;
		establishedTime: number; // 成立时间
		legalPerson: string; // 企业法人
		registeredCapital: number; // 注册资金
		registeredCurrency: number; // 币种
		registeredCurrencyName: string; // 币种名字
		companyType: string; // 企业类型
		qualityManager: string; // 质量管理人
		qualityManagerAddress: string; // 住所
		productionAddress: string; // 生产地址
		warehouseAddress: string; // 仓库地址
		remark: string; // 备注
		creditCode: string; //统一社会信用代码
		std95CategoryText: string[];
		categoryText: string[];
		std2012CategoryIds: number[];
		std2018CategoryIds: number[];
		std95CategoryIds: number[];
		endTimeIsNull: boolean;
	}

	interface RecordVoucher {
		id: number;
		isDeleted: boolean;
		timeCreated: number;
		timeModified: number;
		createdBy: string;
		modifiedBy: string;
		distributorId: number;
		recordNum: string;
		principalName: string;
		legalPerson: string;
		recordVoucherImg: string;
		recordTime: number;
		operationType: string;
		residence: string;
		businessAddress: string;
		warehouseAddress: string;
		businessScope: string;
		remark: string;
		std2012CategoryIds: number[];
		std2018CategoryIds: number[];
		std2012CategoryTree: CategoryController.TypeData[];
		std2018CategoryTree: CategoryController.TypeData[];
		endTimeIsNull: boolean;
	}
	interface LicensePermit {
		id: number;
		isDeleted: boolean;
		timeCreated: number;
		timeModified: number;
		createdBy: number;
		modifiedBy: string;
		distributorId: number;
		permitImg: string; // 经营许可证
		permitNo: string; // 许可证号
		permitBeginTime: number; // 有效日期
		permitEndTime: number; //有效日期
		permitScope: string;
		principalName: string; // 企业负责人
		legalPerson: string; // 企业法人
		registeredAddress: string; // 注册地址
		warehouseAddress: string; // 仓库地址
		remark: string; // 备注
		categoryText: string[];
		std2012CategoryIds: number[];
		std2018CategoryIds: number[];
		licenseDistributorInstru: string;
		distributorRecordVoucher: RecordVoucher;
		status: number; // 状态
		enabled: boolean;
	}

	interface DetailData {
		id: number;
		isDeleted: boolean;
		timeCreated: number;
		timeModified: number;
		createdBy: number;
		modifiedBy: string;
		statusUserId: number;
		companyName: string; // 企业名称
		companyNameAcronym: string;
		companyEstablishedTime: number;
		companyLegalPerson: string; // 企业法人
		principalName: string; // 企业负责人
		principalPhone: string;
		principalEmail: string;
		operationType: string; // 经营方式
		secondRecordImg: string;
		isEnabled: boolean;
		type: string;
		depositBank: string; // 开户银行
		bankAccount: string; // 开户银行账号
		companyType: string; // 企业类型
		nationality: string; // 企业国别
		country: string; // 所在国家
		districtCode: number;
		registrant: string; // 企业登记人
		companyNature: string; // 企业性质
		address: string; // 具体地址
		contactName: string; // 联系人
		contactTelephone: string; // 联系电话
		contactMobilePhone: string; // 手机
		contactPosition: string; // 职务
		contactDepartment: string; // 部门
		companyTelephone: string; // 公司电话
		companyEmail: string; // 公司邮箱
		companyFax: string; // 公司传真
		shortName: string; // 简称
		remark: string; // 备注
		website: string; // 公司网址
		postcode: string;
		hasPermitLicense: boolean;
		hasRecordLicense: boolean;
		autoOrderTaking: string;
		mergeName: string; // 地址
		medicalInstruSubject: string;
		accountPeriod: string; //账期
		provincePlatformCode: string; // 省平台编号
		distributorAddressList: [];
		licenseDistributorBusiness: LicenseBusiness;
		licenseDistributorPermit: LicensePermit;
		distributorRecordVoucher: RecordVoucher;
	}

	interface NearExpireData {
		expired: number;
		nearExpire: number;
	}

	interface AddOrEditDistributorParams {
		test?: string;
	}

	interface EnableParams {
		id: number;
		type: number;
	}
	interface OperateDistributorByGoodsId {
		goodsId: number;
		topId?: number;
		distributorIds: number[];
	}

	interface BatchEnableParams {
		ids: (string | number)[];
	}

	interface AccountPeriodParams {
		accountPeriod: number;
		distributorId?: number;
		distributorIds?: number[];
	}

	interface SureApproveModalProps {
		visible?: boolean;
		info: ListRecord;
		type: string;
		isBatch: boolean;
		handleSetAccountPeriodBatch: (value: T) => void;
		upDataTableList: () => void;
		handleCancel: () => void;
	}

	interface GoodsList {
		specification: string;
		model: string;
		minGoodsNum: string;
		distributorName: string;
	}

	type TableListPager = Pager & {
		status?: string;
		name?: string;
		key?: number;
	};

	interface InvoiceSyncParams {
		invoiceSync?: boolean;
		type?: boolean;
	}
	interface InvoiceSyncRecord {
		id: number;
		companyName: string;
	}

	interface DistributorFiled {
		id?: number; // id
		isDeleted?: boolean;
		timeCreated?: number;
		timeModified?: number;
		createdBy?: number;
		modifiedBy?: number;
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
}
