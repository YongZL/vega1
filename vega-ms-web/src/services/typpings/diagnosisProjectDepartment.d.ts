// diagnosis-project-department-controller
declare namespace DiagnosisProjectDepartmentContoller {
	type UnbindTypeParams = Pager & {
		partmentId?: number; //科室id
		ordinaryId?: number;
		bind?: boolean; //是否已经绑定科室
	};
}
