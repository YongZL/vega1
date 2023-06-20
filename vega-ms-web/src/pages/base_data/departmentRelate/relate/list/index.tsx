import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ResizableTable';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { isEnabledStatusValueEnum } from '@/constants/dictionary';
import { exportData, getRelate, unbindDept } from '@/services/relateDept';
import { notification } from '@/utils/ui';
import { Form } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useAccess } from 'umi';

const RelateDep = () => {
	const access = useAccess();
	const tableRef = useRef<ProTableAction>();
	const [isExportFile, setIsExportFile] = useState(false);
	const [form] = Form.useForm();

	// 解绑
	const unBind = async (record: RelateDeptController.RelateRecord) => {
		const params = {
			hisDeptId: record.hisDeptId,
			deptId: record.deptId,
		};
		const res = await unbindDept(params);
		if (res && res.code === 0) {
			notification.success('操作成功！');
			tableRef.current?.reload();
		}
	};

	useEffect(() => {
		tableRef.current?.reload();
	}, []);

	const searchColumn: ProFormColumns = [
		{
			title: 'HIS科室名称',
			dataIndex: 'hisDeptName',
		},
		{
			title: 'HIS科室编号',
			dataIndex: 'hisDeptCode',
		},
		{
			title: 'SPD科室名称',
			dataIndex: 'deptName',
		},
		{
			title: 'SPD科室编号',
			dataIndex: 'deptCode',
		},
	];

	const columns: ProColumns<RelateDeptController.RelateRecord>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 'XXS',
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			filters: false,
			title: 'HIS科室状态',
			dataIndex: 'isStopped',
			valueEnum: isEnabledStatusValueEnum,
			width: 'XS',
		},
		{
			title: 'HIS科室编号',
			dataIndex: 'hisDeptCode',
			key: 'hisDeptCode',
			width: 'L',
		},
		{
			title: 'HIS科室名称',
			dataIndex: 'hisDeptName',
			key: 'hisDeptName',
			width: 'L',
			ellipsis: true,
		},
		{
			title: 'SPD科室编号',
			dataIndex: 'deptId',
			key: 'deptId',
			width: 'L',
		},
		{
			title: 'SPD科室名称',
			dataIndex: 'deptName',
			key: 'deptName',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '联系人员',
			dataIndex: 'contactName',
			key: 'contactName',
			width: 'XS',
		},
		{
			title: '联系电话',
			dataIndex: 'contactPhone',
			key: 'contactPhone',
			width: 'M',
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 'XXS',
			render: (text, record) => {
				return access.relate_department_unbind ? (
					<span
						className='handleLink'
						onClick={() => unBind(record)}>
						解绑
					</span>
				) : null;
			},
		},
	];

	return (
		<div>
			<ProTable
				columns={columns}
				tableInfoCode='relate_department_true_list'
				rowKey='hisDeptId'
				api={getRelate}
				loadConfig={{
					request: false,
				}}
				requestCompleted={(rows) => {
					setIsExportFile(rows.length > 0);
				}}
				searchConfig={{
					form,
					columns: searchColumn,
				}}
				// tableInfoId='202'
				params={{ related: true }}
				tableRef={tableRef}
				toolBarRender={() => [
					<div>
						{access.relate_department_export && (
							<ExportFile
								className='ml2'
								data={{
									link: exportData(),
									filters: {
										...form.getFieldsValue(),
										related: true,
									},
								}}
								disabled={!isExportFile}
							/>
						)}
					</div>,
				]}
			/>
		</div>
	);
};

export default RelateDep;
