// manufacturer-controller 生产厂家

declare namespace ManufacturerController {
	//营业执照
	interface BusinessLicense {
		companyType?: string; //企业类型
		licenseImgList?: string[]; //营业执照
		creditCode?: string; //统一社会信用代码
		legalPerson?: string; //法定代表人
		establishedTime?: number; //成立时间
		licenseBeginTime?: number; //有效日期开始
		productionAddress?: string; //生产地址
		std95CategoryIds?: number[]; //95版分类
		std2012CategoryIds?: number[]; //12版分类
		qualityManagerAddress?: string; //住所
		warehouseAddress?: string;
		licenseEndTime?: number; //有效日期截至
		licenseScope?: string;
		supplierId?: number;
		std2018CategoryIds?: number[]; //18版分类
		licenseNo?: string; //证照编号
		remark?: string; //备注
		registeredCurrency?: number;
		qualityManager?: string; //质量管理人
		registeredCapital?: number; //注册资金
	}
	//公司基本信息
	interface Manufacturer {
		address?: string; //具体地址
		bankAccount?: string; //开户银行账号
		companyEmail?: string; //公司邮箱
		companyFax?: string; //公司传真
		companyLegalPerson?: string; //企业法人
		companyName?: string; //企业名称
		companyNature?: string; //企业性质
		companyTelephone?: string; //公司电话
		companyType?: string; //企业类型
		contactDepartment?: string; //部门
		contactMobilePhone?: string; //手机
		contactName?: string; //联系人
		contactPosition?: string; //职务
		contactTelephone?: string; //联系电话
		country?: string; //所在国家
		depositBank?: string; //开户银行
		districtCode?: number;
		hasPermitLicense?: boolean; //是否有医疗器械生产许可证
		hasRecordLicense?: boolean; //是否有医疗器械第二类备案凭证
		nationality?: string; //企业国别
		postcode?: string;
		principalName?: string; //企业负责人
		registrant?: string; //企业登记人
		remark?: string; //备注
		shortName?: string; //简称
		website?: string; //公司网址
	}
	//生产许可证
	interface PermitLicense {
		legalPerson?: string; //法定代表人
		permitBeginTime?: number; //有效日期开始
		permitEndTime?: number; //有效日期截至
		permitImgList?: string[]; //生产许可证
		permitNo?: string; //许可证号
		permitScope?: string;
		principalName?: string; //企业负责人
		registeredAddress?: string; //注册地址
		remark?: string; ////备注
		std2012CategoryIds?: number[]; //12版分类
		std2018CategoryIds?: number[]; //18版分类
		supplierId?: number;
	}

	type AddData = {
		businessLicense?: BusinessLicense; //营业执照
		manufacturer?: Manufacturer; //公司基本信息
		permitLicense?: PermitLicense; //生产许可证
	};

	type GetPageListParams = Pager & {
		enabled?: boolean;
		licensePermitFrom?: number;
		licensePermitTo?: number;
		name?: string;
		distributorId?: number;
	};
	interface ManufacturerRecord {
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
		licenseManufacturerBusiness: {
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
	interface LicenseManufacturerBusiness {
		licenseImgList?: string[]; //营业执照
		creditCode?: string; //统一社会信用代码
		licenseNo?: string; //证照编号
		establishedTime?: number; //成立时间
		licenseBeginTime?: number; //有效日期开始
		licenseEndTime?: number; //有效日期截至
		legalPerson?: string; //法定代表人
		registeredCapital?: number; //注册资金
		registeredCurrencyName?: string; //币种
		companyType?: string; //企业类型
		qualityManager?: string; //质量管理人
		qualityManagerAddress?: string; //住所
		productionAddress?: string; //生产地址
		remark?: string; //备注
		std95CategoryText?: string[]; //非医疗器械经营范围
		categoryText?: string[]; //医疗器械经营范围
		std2012CategoryIds?: number[]; //12版分类
		std2018CategoryIds?: number[]; //18版分类
		std95CategoryIds?: number[]; //95版分类
		registeredCurrency?: number;
		warehouseAddress?: string;
		endTimeIsNull?: boolean;
	}
	interface LicenseManufacturerPermit {
		permitImgList?: string[]; //生产许可证
		permitNo?: string; //许可证号
		principalName?: string; //企业负责人
		legalPerson?: string; //法定代表人
		permitBeginTime?: number; //有效日期开始
		permitEndTime?: number; //有效日期截至
		registeredAddress?: string; //注册地址
		remark?: string; //备注
		categoryText?: string[]; //经营范围
		std2012CategoryIds?: number[]; //12版分类
		std2018CategoryIds?: number[]; //18版分类
		endTimeIsNull?: boolean;
	}
	interface DetailRecord {
		licenseManufacturerBusiness?: LicenseManufacturerBusiness;
		licenseManufacturerPermit?: LicenseManufacturerPermit;
		companyName?: string; //企业名称
		companyType?: string; //企业类型
		nationality?: string; //企业国别
		country?: string; //所在国家
		mergeName?: string; //地址
		address?: string; //具体地址
		companyLegalPerson?: string; //企业法人
		registrant?: string; //企业登记人
		principalName?: string; //企业负责人
		companyNature?: string; //企业性质
		depositBank?: string; //开户银行
		bankAccount?: string; //开户银行账号
		contactName?: string; //联系人
		contactTelephone?: string; //联系电话
		contactMobilePhone?: string; //手机
		contactDepartment?: string; //部门
		contactPosition?: string; //职务
		companyTelephone?: string; //公司电话
		companyEmail?: string; //公司邮箱
		companyFax?: string; //公司传真
		shortName?: string; //简称
		website?: string; //公司网址
		remark?: string; //备注
		hasPermitLicense?: boolean; //是否有医疗器械生产许可证
		districtCode?: string; //行政区/县
		provincePlatformCode?: number; //省平台编号
		postcode?: number; //企业邮编
		otherAttachments: Record<string, any>; //其它附件
	}
}
