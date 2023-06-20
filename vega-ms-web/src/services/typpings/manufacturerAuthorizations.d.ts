// manufacturer-authorization-controller
declare namespace ManufacturerAuthorizationsController {
	type GoodsListPager = Pager & {
		id: number;
	};

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
		manufacturerName: string;
		materialCode: string;
		specification: string;
		model: string;
		brand: string;
		commonName: string;
		chargeNum: string;
		nationalNo: string;
		materialCategory: string;
		procurementPrice: number;
		nearExpirationDays: number;
		pmCode: string;
		minGoodsUnitId: number;
		minGoodsUnit: string;
		purchaseGoodsUnitId: number;
		purchaseGoodsUnit: string;
		minGoodsNum: number;
		std2012GoodsCategoryId: number;
		std2018GoodsCategoryId: number;
		std95GoodsCategoryId: number;
		imageUrl: string;
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
		registrationNum: string;
		stageType: boolean;
		largeBoxUnitId: number;
		largeBoxUnit: string;
		largeBoxNum: number;
		goodsGroupType: string;
		imgUrl: string;
		description: string;
		limitType: number;
		limitPerMonth: number;
		registrationList: Record<string, any>[];
	}

	type AuthListPager = Pager & {
		id?: number;
		chargeNum?: string;
		distributorIdnumber?: string;
		enabled?: boolean;
		goodsName?: string;
		id?: number;
		invoiceSync?: string;
		manufacturerIds?: number[];
		materialCode?: string;
		registrationNum?: string;
	};

	interface AuthListRecord {
		goodsId: number;
		authorizationStartDate: number;
		authorizationEndDate: number;
	}

	interface ListRecord {
		id: number;
		isDeleted: boolean;
		timeCreated: number;
		timeModified: number;
		createdBy: number;
		custodiaId: number;
		modifiedBy: number;
		manufacturerId: number;
		manufacturerName: string;
		supplierId: number;
		supplierName: string;
		distributorId: number;
		distributorName: string;
		authorizationBeginTime: number;
		authorizationEndTime: number;
		goodsId: number[];
		remark: string;
		isEnabled: boolean;
		amount: number;
		lastModified: number;
		manufactureCreditCode: string;
		authorizingDistributorCreditCode: string;
		supplierCreditCode: number;
		supplierBeginTime: number;
		supplierEndTime: number;
		distributorCreditCode: string;
		distributorBeginTime: number;
		distributorEndTime: number;
		manufacturerBeginTime: number;
		manufacturerEndTime: number;
		enabled: boolean;
	}

	interface RecordListRecord {
		id: number;
		isDeleted: boolean;
		timeCreated: number;
		timeModified: number;
		createdBy: number;
		custodiaId: number;
		modifiedBy: number;
		manufacturerId: number;
		manufacturerName: string;
		supplierId: number;
		supplierName: string;
		distributorId: number;
		distributorName: string;
		authorizationBeginTime: number;
		authorizationEndTime: number;
		goodsId: number[];
		remark: string;
		isEnabled: boolean;
		amount: number;
		lastModified: number;
		manufactureCreditCode: string;
		authorizingDistributorCreditCode: string;
		supplierCreditCode: number;
		supplierBeginTime: number;
		supplierEndTime: number;
		distributorCreditCode: string;
		distributorBeginTime: number;
		distributorEndTime: number;
		manufacturerBeginTime: number;
		manufacturerEndTime: number;
		enabled: boolean;
	}

	interface DetailData {
		id?: number;
	}

	interface EnabledParams {
		id: number;
	}

	interface AddOrEditManufacturerParams {
		test?: string;
	}
	interface GetManufacturer {
		address?: string;
		bankAccount?: string;
		companyEmail?: string;
		companyEstablishedTime?: string;
		companyFax?: string;
		companyLegalPerson?: string;
		companyName?: string;
		companyNameAcronym?: string;
		companyNature?: string;
		companyTelephone?: number;
		companyType?: string;
		contactDepartment?: string;
		contactMobilePhone?: number;
		contactName?: string;
		contactPosition?: string;
		contactTelephone?: number;
		country?: string;
		createdBy?: number;
		depositBank?: string;
		districtCode?: null;
		hasPermitLicense?: boolean;
		hasRecordLicense?: string;
		hospitalId?: number;
		id?: number;
		isDeleted?: boolean;
		isEnabled?: boolean;
		licenseManufacturerBusiness?: string;
		licenseManufacturerPermit?: string;
		manufactureRecordVoucher?: string;
		mergeName?: string;
		modifiedBy?: string;
		nationality?: string;
		postcode?: number;
		principalEmail?: string;
		principalName?: string;
		principalPhone?: number;
		registrant?: string;
		remark?: string;
		shortName?: string;
		timeCreated?: number;
		timeModified?: number;
		type?: string;
		website?: string;
	}

	type TableListPager = Pager & {
		status?: string;
		name?: string;
		key?: number;
	};

	interface ListProps {
		id: number;
		companyName: string;
	}
}
