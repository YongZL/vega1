import type { ProColumns } from '@/components/ProTable/typings';
export type rightColumnsType = { title: string; value: string };
export type descriptionsColumnsType = { label: string; key: string };
export type ModalMaxType = {
	tableData: T[]; //列表的数据
	columns: ProColumns<T>[];
	tableTitle: string; //表格标题
	detail: U; //上方左侧描述表单数据
	descriptionsColumns: descriptionsColumnsType[];
	rightColumns: rightColumnsType[]; //上方右侧描述数据
};
