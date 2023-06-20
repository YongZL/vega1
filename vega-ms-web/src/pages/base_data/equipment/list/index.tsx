// import type { ColumnsState } from '@ant-design/pro-table';
import type { ProColumns, ProTableAction } from '@/components/ProTable';
import type { ProFormColumns } from '@/components/SchemaForm';

import Breadcrumb from '@/components/Breadcrumb';
import ThermalPrinter from '@/components/print/ThermalPrinter';
import ProTable from '@/components/ResizableTable';
import { getDay, retryPrintBarcode } from '@/utils';
import { convertPriceWithDecimal } from '@/utils/format';
import { notification } from '@/utils/ui';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Popconfirm } from 'antd';
import moment from 'moment';
import React, { useRef, useState } from 'react';
import { history, useAccess } from 'umi';

import { getList, printEquipment, updateEnabled } from '@/services/equipment';
// import { getByUserIdAndType, updateTableHeader } from '@/services/tableHeader';
import { equipmentEnabledStatusValueEnum } from '@/constants/dictionary';

const TableList: React.FC = () => {
	const access = useAccess();
	// const [columnsStateMap, setColumnsStateMap] = useState<Record<string, ColumnsState>>();
	// const [isSave, setIsSave] = useState(false);
	// const [saveLoading, setSaveLoading] = useState<boolean>(false);
	const [statusLoadingMap, setStatusLoadingMap] = useState<Record<string, boolean>>({});
	const thermalPrinter = useRef<Record<string, any>>();
	const tableRef = useRef<ProTableAction>();

	// // 获取表头数据
	// const getTableHeaderData = async () => {
	//   let res = await getByUserIdAndType({ headerType: 'scanCountReport' });
	//   if (res && res.code === 0) {
	//     let result = res.data;
	//     if (result) {
	//       let headerInfo = JSON.parse(result.headerInfo);
	//       if (headerInfo) {
	//         setColumnsStateMap(headerInfo);
	//       }
	//     }
	//   }
	// };

	// useEffect(() => {
	//   getTableHeaderData();
	// }, []);

	// 更新设备状态
	const updateStatus = async (status: number, id: number) => {
		setStatusLoadingMap({ ...statusLoadingMap, [id]: true });
		try {
			const res = await updateEnabled({ status: status === 0 ? 1 : 0, equipmentId: id });
			if (res && res.code === 0) {
				notification.success('操作成功！');
				tableRef.current?.reload();
			}
		} finally {
			setStatusLoadingMap({ ...statusLoadingMap, [id]: false });
		}
	};

	// 打印
	const printBarCode = (record: Record<string, any>) => {
		if (!Object.keys(thermalPrinter.current?.state.selected_device).length) {
			notification.warning('请先选择打印机');
			return;
		}

		printEquipment({ equipmentId: record.id }).then((res) => {
			if (res && res.code === 0) {
				const printResult = thermalPrinter.current?.print(res.data);
				printResult.xhr.onreadystatechange = async function () {
					// 当打印结果为500时，修改当前打印条目状态为打印失败
					if (printResult.xhr.readyState === 4 && printResult.xhr.status >= 500) {
						// 当打印失败时重试，默认重试三次
						const result = await retryPrintBarcode(thermalPrinter.current, res.data);
						if (result === 'error') {
							record.printed = false;
						} else if (result === 'success') {
							record.printed = true;
						}
					} else if (printResult.xhr.readyState === 4 && printResult.xhr.status === 200) {
						record.printed = true;
					}
				};
			}
		});
	};

	// // 保存表头数据
	// const saveData = async () => {
	//   setSaveLoading(true);
	//   try {
	//     const res = await updateTableHeader({
	//       headerType: 'equipment',
	//       headerInfo: JSON.stringify(columnsStateMap),
	//     });

	//     if (res && res.code == 0) {
	//       notification.success('保存成功');
	//       setIsSave(false);
	//     }
	//   } finally {
	//     setSaveLoading(false);
	//   }
	// };

	const editData = (record: any) => {
		history.push({
			pathname: '/base_data/equipment/edit',
			state: record,
		});
	};

	const searchColumns: ProFormColumns = [
		{
			title: '设备名称',
			dataIndex: 'equipmentName',
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '卡片编号',
			dataIndex: 'equipmentCode',
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '设备存放地点',
			dataIndex: 'equipmentStoragePlace',
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '设备编码',
			dataIndex: 'materialCode',
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '资产分类',
			dataIndex: 'assetClassification',
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '所属部门',
			dataIndex: 'departmentName',
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '取得时间',
			dataIndex: 'getTime',
			valueType: 'datePicker',
			fieldProps: {
				format: 'YYYY/MM/DD',
				style: { width: '100%' },
				placeholder: '请选择取得时间',
			},
		},
	];

	const columns: ProColumns<Record<string, any>>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 'XXS',
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'status',
			key: 'status',
			width: 'M',
			filters: false,
			valueEnum: equipmentEnabledStatusValueEnum,
		},

		{
			title: '设备名称',
			width: 'S',
			dataIndex: 'equipmentName',
			key: 'equipmentName',
			renderText: (text) => {
				return (
					<span
						title={text}
						style={{ width: 120 }}>
						{text}
					</span>
				);
			},
		},
		{
			title: '卡片编号',
			width: 'S',
			dataIndex: 'equipmentCode',
			key: 'equipmentCode',
			renderText: (text) => {
				return (
					<span
						title={text}
						style={{ width: 120 }}>
						{text}
					</span>
				);
			},
		},
		{
			title: '设备编码',
			width: 'S',
			dataIndex: 'materialCode',
			key: 'materialCode',
			renderText: (text) => {
				return (
					<span
						title={text}
						style={{ width: 120 }}>
						{text}
					</span>
				);
			},
		},
		{
			title: '资产分类',
			width: 'S',
			dataIndex: 'assetClassification',
			key: 'assetClassification',
		},
		{
			title: '所属部门',
			width: 'S',
			dataIndex: 'departmentName',
			key: 'departmentName',
			renderText: (text) => {
				return (
					<span
						title={text}
						style={{ width: 120 }}>
						{text}
					</span>
				);
			},
		},
		{
			title: '设备存放地点',
			width: 'XL',
			dataIndex: 'equipmentStoragePlace',
			key: 'equipmentStoragePlace',
			renderText: (text) => {
				return (
					<span
						title={text}
						style={{ width: 120 }}>
						{text}
					</span>
				);
			},
		},
		{
			title: '取得时间',
			dataIndex: 'getTime',
			key: 'getTime',
			width: 'L',
			renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD') : ''),
		},
		{
			title: '原始价值(元)',
			dataIndex: 'price',
			key: 'price',
			width: 'S',
			align: 'right',
			renderText: (text: number) => (text ? convertPriceWithDecimal(text) : '-'),
		},
	];

	if (access.equipment_edit || access.equipment_enable || access.equipment_print) {
		columns.push({
			title: '操作',
			dataIndex: 'option',
			key: 'option ',
			fixed: 'right',
			width: 'M',
			render: (_text, record) => {
				return (
					<div className='operation'>
						{access.equipment_edit && (
							<span
								className='handleLink'
								onClick={() => editData(record)}>
								编辑
							</span>
						)}
						{access.equipment_enable && access.equipment_edit && <Divider type='vertical' />}
						{access.equipment_enable && (
							<Popconfirm
								placement='left'
								title={`确定${record.status ? '禁用' : '启用'}该设备吗？`}
								onCancel={(e) => {
									e?.stopPropagation();
								}}
								onConfirm={(e) => {
									e?.stopPropagation();
									updateStatus(record.status, record.id);
								}}
								okButtonProps={{
									loading: statusLoadingMap[record.id],
								}}
								// @ts-ignore
								onClick={(e) => {
									e.stopPropagation();
								}}>
								<span className='handleLink'>{record.status ? '禁用' : '启用'}</span>
							</Popconfirm>
						)}
						{access.equipment_enable && access.equipment_print && <Divider type='vertical' />}
						{access.equipment_print && (
							<span
								className='handleLink'
								onClick={() => printBarCode(record)}>
								打印
							</span>
						)}
					</div>
				);
			},
		});
	}

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<Card bordered={false}>
				<ProTable<Record<string, any>>
					tableInfoCode='equipment_list'
					api={getList}
					searchConfig={{
						columns: searchColumns,
					}}
					tableRef={tableRef}
					// tableInfoId="227"
					toolBarRender={() => [
						<div>
							<label style={{ color: CONFIG_LESS['@c_starus_disabled'] }}>*</label>
							<span style={{ paddingRight: 5 }}>选择打印设备 :</span>
							{/* @ts-ignore */}
							<ThermalPrinter
								ref={thermalPrinter}
								style={{ height: 30 }}
							/>
						</div>,
						access.equipment_add && (
							<Button
								icon={<PlusOutlined />}
								type='primary'
								style={{ margin: '0 20px 0 8px' }}
								onClick={() => {
									history.push('/base_data/equipment/add');
								}}
								className='iconButton'>
								{' '}
								新增
							</Button>
						),
						// isSave && (
						//   <Button type="primary" loading={saveLoading} onClick={saveData}>
						//     保存
						//   </Button>
						// ),
					]}
					beforeSearch={(values) => {
						if (values.getTime) {
							values.getTime = getDay(values.getTime);
						}
						return { ...values };
					}}
					rowKey='id'
					columns={columns}
					// columnsStateMap={columnsStateMap}
					// onColumnsStateChange={(value) => {
					//   // setIsSave(true);
					//   setColumnsStateMap(value);
					// }}
				/>
			</Card>
		</div>
	);
};

export default TableList;
