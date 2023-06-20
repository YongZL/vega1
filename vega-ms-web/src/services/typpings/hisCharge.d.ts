// his-charge-controller
declare namespace HisChargeController {
	interface HisChargeRecord {
		adviceNo?: number;
		barcode?: boolean; //条码管控
		chargeName?: string; // 收费项名称
		chargeNum?: string; // 收费项编号
		chargeType?: number; // 计费分类
		createdTime?: number;
		deptName?: string;
		doctorCode?: number;
		hisChargeListVo?: string;
		id?: number;
		materialCode?: string;
		medicareNum?: string; //本地医保编码
		name?: string;
		operatorBarcode?: string;
		patientDeptName?: string;
		patientName?: string;
		patientNo?: string;
		price?: number; //单价(元)
		quantity?: number; //数量
		unit?: string; //单位
	}

	type HisChargeParams = Pager & {
		chargeType?: number; //计费分类
		deptId?: number; //执行科室
		chargeNum?: string; //收费项编号
		chargeName?: string; //收费项名称
		barcode?: boolean; //条码管控
		startTime?: number; // 开始时间
		endTime?: number; // 结束时间
	};

	interface GetHisDeptList {
		departmentId?: numbet; //执行科室
		departmentName?: string;
		nameAcronym?: string;
	}

	interface HisChargeDetailList {
		adviceNo?: string; //收费序号
		barcode?: string; // 条码
		chargeName?: string; //收费项名称
		chargeNum?: string; //收费项编号
		chargeType?: number; //计费分类
		createdTime?: string; //记账时间
		deptName?: string; //开单科室
		doctorCode?: string; //开单医生
		hisChargeListVo?: string;
		id?: number;
		materialCode?: string; //物资编号/条码
		medicareNum?: string; //本地医保编码
		name?: string; //物资名称
		operatorBarcode?: string; //物资编号
		patientDeptName?: string;
		patientName?: string; //病人姓名
		patientNo?: string; //病人编号
		price?: number; //单价(元)
		quantity?: number; //数量
		unit?: string; //单位
	}

	type HisChargeDetailParams = Pager & {
		startTime?: number; //开始时间
		endTime?: number; //结束时间
		deptId?: number;
		chargeType?: number; //计费分类
	};

	interface SummaryData {
		totalPrice?: number;
		totalNum?: number;
	}
}
