// ordinary-department-controller 医耗套包绑定仓库
declare namespace OrdinaryDepartmentController {
	interface BindGoodsParams {
		departmentId?: number; //科室id
		settings?: number;
		ordinaryId?: number;
	}
	interface UnbindTypeParams {
		departmentId: number;
		ordinaryIds: number[];
	}
}
