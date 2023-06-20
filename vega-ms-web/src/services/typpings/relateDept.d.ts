//科室 :relate-dept-controller

declare namespace RelateDeptController {
	//获取科室对照 未对照列表
	interface NoRelateRecord {
		contactName?: string; //联系人员
		contactPhone?: number; //联系电话
		deptCode?: string; //SPD科室编号
		deptId?: number; //SPD科室编号
		deptName?: string; //SPD科室名称
		hisDeptCode: string; //HIS科室编号
		hisDeptId: number; //HIS科室id
		hisDeptName: string; //HIS科室名称
		isStopped: boolean; //HIS科室状态
	}

	//科室对照 未对照 出参
	type NoRelateParams = Pager & {
		hisDeptName?: string; //HIS科室名称
		hisDeptCode?: string; //HIS科室编号
		related?: boolean;
	};

	//获取科室对照 已对照列表
	interface RelateRecord {
		contactName?: string; //联系人员
		contactPhone?: number; //联系电话
		deptCode?: string; //SPD科室编号
		deptId: number; //SPD科室编号
		deptName: string; //SPD科室名称
		hisDeptCode: string; //HIS科室编号
		hisDeptId: number; //HIS科室id
		hisDeptName: string; //HIS科室名称
		isStopped: boolean; //HIS科室状态
	}

	//科室对照 已对照 出参
	type RelateParams = Pager & {
		hisDeptName?: string; //HIS科室名称
		hisDeptCode?: string; //HIS科室编号
		deptName?: string; //SPD科室名称
		deptCode?: string; //SPD科室编号
		related: boolean;
		keyword?: string;
	};

	//绑定
	type BindDeptParams = {
		deptId: number;
		hisDeptId: number[];
	};
}
