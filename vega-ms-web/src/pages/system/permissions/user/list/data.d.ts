export interface TableListItem {
	key: number;
	disabled?: boolean;
	href: string;
	avatar: string;
	name: string;
	title: string;
	owner: string;
	desc: string;
	callNo: number;
	status: number;
	updatedAt: Date;
	createdAt: Date;
	progress: number;
}

export interface UserRecord {
	id: number;
	email: string;
	name: string;
	type: string;
	system: boolean;
	contactIds: number;
	createdBy: number;
	departmentName: string;
	distributorName: string;
	initialPassword: string;
	isDeleted: boolean;
	isEnabled: boolean;
	isSystem: boolean;
	lastLoginTime: number;
	loginErrorCount: number;
	loginPassword: string;
	loginPhone: string;
	loginPwdUpdateTime: number;
	roles: Record<string, any>;
	supplierName: string;
	timeCreated: number;
	timeModified: number;
}

export interface TableListPagination {
	total: number;
	pageSize: number;
	current: number;
}

export interface TableListData {
	list: TableListItem[];
	pagination: Partial<TableListPagination>;
}

export interface TableListParams {
	sorter?: string;
	status?: string;
	name?: string;
	desc?: string;
	key?: number;
	pageSize?: number;
	pageNum?: number;
}
