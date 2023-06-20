declare namespace RepositoryInBoundSummaryController {
	type QueryRuleParams = Pager & {
		antiEpidemic: boolean; //true:抗疫/false:非抗疫,如果为空,则返回全部
		deptId: string; //科室ID
		distributorId: string;
		materialCategoryList: string; //物资类别集合
		sortableColumnName: string;
		supplierId: string; //配送商业ID
		timeFrom: number; //开始日期(库存日志的操作时间)
		timeTo: number; //结束日期(库存日志的操作时间)
	};
	interface QueryRuleRecord {
		antiEpidemic: string;
		departmentName: string;
		distributorName: string;
		materialCategory: string;
		supplierName: string;
		timeFrom: number;
		timeTo: number;
		totalAmount: number;
	}
}
