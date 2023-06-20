// gsp-controller
declare namespace GSPController {
	interface LicenseRemindListRecord {
		companyName: string;
		companyType: string;
		remainDay: number;
		gspType: string;
		licenseBeginTime: string;
		licenseEndTime: string;
	}

	interface RegisterRemindListRecord {
		goodsName: string;
		materialCode: string;
		licenseBeginTime: string;
		licenseEndTime: string;
		remainDay: number;
	}

	interface UdiCode {
		di: string; // DI
		lot?: string; //批号
		serialNumber?: string; // 序列号
		goodsName: string;
		manufactureDate: number; // 生产日期
		expirationDate: string; //失效日期
		codeType: string; // UDI code 类型
	}
}
