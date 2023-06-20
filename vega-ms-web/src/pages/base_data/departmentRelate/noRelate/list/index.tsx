import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ResizableTable';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { isEnabledStatusValueEnum } from '@/constants/dictionary';
import { exportData, getNoRelate } from '@/services/relateDept';
import { Button, Form } from 'antd';
import { cloneDeep } from 'lodash';
import { useRef, useState } from 'react';
import { useAccess } from 'umi';
import BindModal from './components/BindModal';

type NoRelateRecord = RelateDeptController.NoRelateRecord;

const NoRelateDep = () => {
	const access = useAccess();
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const [selectedKeys, setSelectedKeys] = useState<number[]>([]);
	const [selectedList, setSelectedList] = useState<NoRelateRecord[]>([]);
	const [isExportFile, setIsExportFile] = useState(false);
	// 选择
	const selectRow = (selectData: NoRelateRecord, status: boolean) => {
		let select = cloneDeep(selectedList);
		if (status) {
			select.push(selectData);
		} else {
			select.forEach((val, index) => {
				if (val.hisDeptId === selectData.hisDeptId) {
					select.splice(index, 1);
				}
			});
		}
		const selectedRow = select.map((item) => item.hisDeptId);
		setSelectedKeys(selectedRow);
		setSelectedList(select);
	};

	// 全选
	const onCheckAllChange = (
		selected: boolean,
		selectedRecords: number[],
		changeRecords: NoRelateRecord[],
	) => {
		let select = cloneDeep(selectedList);
		if (selected) {
			select = select.concat(changeRecords);
			select = select.reduce((item, next) => {
				if (!item.includes(next)) {
					return item.concat(next);
				} else {
					return item;
				}
			}, []);
		} else {
			changeRecords.forEach((item: { hisDeptId: number }) => {
				select = select.filter((el) => el.hisDeptId !== item.hisDeptId);
			});
		}
		const selectedRow: number[] = select.map((item) => item.hisDeptId);
		setSelectedKeys(selectedRow);
		setSelectedList(select);
	};

	// 单行点击选中
	const selectRowOfClick = (record: NoRelateRecord) => {
		if (selectedKeys.indexOf(record?.hisDeptId) >= 0) {
			selectRow(record, false);
		} else {
			selectRow(record, true);
		}
	};

	// 提交更新
	const resetData = () => {
		setSelectedKeys([]);
		setSelectedList([]);
		tableRef.current?.reload();
	};

	const searchColumns: ProFormColumns = [
		{
			title: 'HIS科室名称',
			dataIndex: 'hisDeptName',
		},
		{
			title: 'HIS科室编号',
			dataIndex: 'hisDeptCode',
		},
	];

	const columns: ProColumns<NoRelateRecord>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 'XXS',
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			width: 'XS',
			filters: false,
			title: 'HIS科室状态',
			dataIndex: 'isStopped',
			valueEnum: isEnabledStatusValueEnum,
		},
		{
			width: 'M',
			title: 'HIS科室编号',
			dataIndex: 'hisDeptCode',
		},
		{
			width: 'M',
			title: 'HIS科室名称',
			dataIndex: 'hisDeptName',
			ellipsis: true,
		},
		{
			width: 'XXS',
			title: '操作',
			dataIndex: 'option',
			render: (text, record) => {
				const bindData = {
					selectList: [record],
					update: resetData,
				};
				return (
					access.relate_department_bind && (
						<BindModal
							trigger={<a>绑定</a>}
							{...bindData}
						/>
					)
				);
			},
		},
	];

	const rowSelection = {
		selectedRowKeys: selectedKeys,
		onSelect: selectRow,
		onSelectAll: onCheckAllChange,
	};
	const bindMoreData = {
		selectList: selectedList,
		update: resetData,
	};
	return (
		<div>
			<ProTable<NoRelateRecord>
				columns={columns}
				rowKey='hisDeptId'
				tableInfoCode='relate_department_false_list'
				api={getNoRelate}
				loadConfig={{
					request: false,
				}}
				requestCompleted={(rows) => {
					setIsExportFile(rows.length > 0);
				}}
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				params={{ related: false }}
				tableRef={tableRef}
				toolBarRender={() => [
					access.relate_department_bind && (
						<BindModal
							{...bindMoreData}
							trigger={
								<Button
									type='primary'
									disabled={!selectedKeys.length}>
									对照
								</Button>
							}
						/>
					),
					access.relate_department_export && (
						<ExportFile
							data={{
								link: exportData(),
								filters: {
									...form.getFieldsValue(),
									related: false,
								},
							}}
							disabled={!isExportFile}
						/>
					),
				]}
				rowSelection={rowSelection as Record<string, any>}
				onRow={(record) => ({
					onClick: () => {
						if (!access.relate_department_bind) {
							return;
						}
						selectRowOfClick(record);
					},
				})}
				tableAlertOptionRender={
					<a
						onClick={() => {
							setSelectedKeys([]);
							setSelectedList([]);
						}}>
						取消选择
					</a>
				}
			/>
		</div>
	);
};

export default NoRelateDep;
