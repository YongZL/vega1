/**
 * 获取科室数据
 */
import { useState, useEffect } from 'react';
import request from '@/utils/request';
const PREFIX = '/api/admin/departments/1.0';
interface FormatDepartmentItem {
	id: number;
	name: string;
	nameAcronym: string;
}

interface DepartmentRecord {
	departmentId: number;
	departmentName: string;
	nameAcronym: string;
}

export const useDepartmentList = (params?: any) => {
	const [departmentList, setDepartmentList] = useState<FormatDepartmentItem[]>([]);

	useEffect(() => {
		request(`${PREFIX}/getSelections`, {
			params,
		}).then((res: Record<string, any>) => {
			if (res && res.data) {
				setDepartmentList(
					res.data.map((item: DepartmentRecord) => ({
						id: item.departmentId,
						nameAcronym: item.nameAcronym,
						name: item.departmentName,
					})),
				);
			}
		});
	}, []);

	return departmentList;
};

// 非一级科室的所有科室列表
export const useAllSubDepartmentList = () => {
	const [departmentList, setDepartmentList] = useState<Record<string, any>>([]);

	useEffect(() => {
		request(`${PREFIX}/getAllSubDepartment`).then((res: { data: DepartmentRecord[] }) => {
			if (res && res.data) {
				let result = res.data.map((item: DepartmentRecord) => ({
					label: item.departmentName,
					value: item.departmentId,
					key: item.nameAcronym + item.departmentName,
					name: item.departmentName,
				}));
				setDepartmentList(result);
			}
		});
	}, []);

	return departmentList;
};

export const useFinDepartmentList = (params?: any) => {
	const [finList, setFinList] = useState<FormatDepartmentItem[]>([]);

	useEffect(() => {
		request('/api/admin/relateFinDept/1.0/getWithFinPage', {
			params,
		}).then((res: Record<string, any>) => {
			if (res && res.data) {
				setFinList(
					res.data.rows.map((item: any) => ({
						id: item.finDeptId,
						name: item.finDeptName,
					})),
				);
			}
		});
	}, []);

	return finList;
};
