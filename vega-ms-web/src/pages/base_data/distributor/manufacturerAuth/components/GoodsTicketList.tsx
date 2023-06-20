import { ProTableAction } from '@/components/ProTable';
import ProTable from '@/components/ResizableTable';

import { ProFormColumns } from '@/components/SchemaForm/typings';
import { goodsTicketStatus, roleStatus } from '@/constants/dictionary';
import { getGoodsList, setInvoiceSync } from '@/services/distributorGoods';
import { formatStrConnect } from '@/utils/format';
import { ApiOutlined, LinkOutlined } from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-table';
import { Badge, Button, Popconfirm } from 'antd';

import { useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';

// 基础物资货票同行结算设置
const GoodsTicketList = ({ id }: { id: number }) => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const [bindLoading, setBindLoading] = useState<boolean>(false);
	const [batchStartLoading, setBatchStartLoading] = useState<boolean>(false);
	const [batchStopLoading, setBatchStopLoading] = useState<boolean>(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	const [selectedRows, setSelectedRows] = useState<
		DistributorAuthorizationController.GoodsListRecord[]
	>([]);
	const [currSelectedItemFlag, setCurrSelectedItemFlag] = useState(0);

	const startUsingAction = () => {
		setBatchStartLoading(true);
		updateGoodsEnabled(true, selectedRowKeys);
	};

	const forbiddenAction = () => {
		setBatchStopLoading(true);
		updateGoodsEnabled(false, selectedRowKeys);
	};

	const clear = () => {
		setSelectedRows([]);
		setSelectedRowKeys([]);
		setCurrSelectedItemFlag(0);
	};

	const onSelectAll = (
		selected: boolean,
		selectedRecords: DistributorAuthorizationController.GoodsListRecord[],
	) => {
		let selectedRows1: DistributorAuthorizationController.GoodsListRecord[] = [...selectedRows];
		let currSelectedItemFlag1 = currSelectedItemFlag;
		if (selected) {
			if (currSelectedItemFlag === 0) {
				// 未选择，优先启用可选，其次禁用可先
				selectedRows1 = selectedRecords.filter(
					(item: DistributorAuthorizationController.GoodsListRecord) => item.invoiceSync === false,
				);
				if (selectedRows1.length > 0) {
					currSelectedItemFlag1 = 1;
				} else {
					currSelectedItemFlag1 = 2;
					selectedRows1 = selectedRecords.filter(
						(item: DistributorAuthorizationController.GoodsListRecord) => item.invoiceSync === true,
					);
				}
			} else if (currSelectedItemFlag1 === 1) {
				// 选择了已禁用的，启用可选
				selectedRows1 = selectedRecords.filter(
					(item: DistributorAuthorizationController.GoodsListRecord) => item.invoiceSync === false,
				);
				currSelectedItemFlag1 = 1;
			} else if (currSelectedItemFlag1 === 2) {
				// 选择了已启用的，禁用可选
				selectedRows1 = selectedRecords.filter(
					(item: DistributorAuthorizationController.GoodsListRecord) => item.invoiceSync === true,
				);
				currSelectedItemFlag1 = 2;
			}
		} else {
			// 取消选中
			selectedRows1 = [];
			currSelectedItemFlag1 = 0;
		}
		let selectedRowKeys1: number[] = selectedRows1.map((item) => item.id);
		setSelectedRows(selectedRows1);
		setSelectedRowKeys(selectedRowKeys1);
		setCurrSelectedItemFlag(currSelectedItemFlag1);
	};

	const onSelectChange = (
		selectedRowKeys: number[],
		selectedRows: DistributorAuthorizationController.GoodsListRecord[],
	) => {
		let newSad = selectedRows.length === 0 ? 0 : selectedRows[0].invoiceSync ? 2 : 1;
		setSelectedRows(selectedRows);
		setSelectedRowKeys(selectedRowKeys);
		setCurrSelectedItemFlag(newSad);
	};

	// 点击行的操作
	const onRowClick = (row: DistributorAuthorizationController.GoodsListRecord) => {
		let newSelectedRowKeys = [...selectedRowKeys];
		let newSelectRows = [...selectedRows];
		// 判断行不可点
		if (
			(currSelectedItemFlag == 1 && row.invoiceSync) ||
			(currSelectedItemFlag == 2 && !row.invoiceSync)
		) {
			return;
		}
		let key = row.id;
		let index = newSelectedRowKeys.indexOf(key);
		let enableFlag = 0;
		if (index > -1) {
			newSelectedRowKeys.splice(index, 1);
			newSelectRows.splice(index, 1);
			enableFlag = newSelectRows.length > 0 ? (row.invoiceSync ? 2 : 1) : 0;
		} else {
			newSelectedRowKeys.push(key);
			newSelectRows.push(row);
			enableFlag = row.invoiceSync ? 2 : 1;
		}
		setSelectedRows(newSelectRows);
		setSelectedRowKeys(newSelectedRowKeys);
		setCurrSelectedItemFlag(enableFlag);
	};

	/**
	 * 点击启用或禁用基础物资
	 * @param status 启用禁用状态
	 * @param id 基础物资id
	 */
	const updateGoodsEnabled = async (
		invoiceSync: boolean,
		distributorGoodsIds: number[],
		options?: DistributorAuthorizationController.GoodsListRecord,
	) => {
		setBindLoading(true);
		let params = {
			invoiceSync,
			distributorGoodsIds,
		};
		let res = await setInvoiceSync(params);
		if (res && res.code == 0) {
			clear();
			tableRef.current?.reload();
		}
		setBatchStartLoading(false);
		setBatchStopLoading(false);
		setBindLoading(false);
	};

	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'invoiceSync',
			valueType: 'tagSelect',
			fieldProps: {
				options: goodsTicketStatus,
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			fieldProps: {
				placeholder: `请输入${fields.goodsCode}`,
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			fieldProps: {
				placeholder: `请输入${fields.goodsName}`,
			},
		},
		{
			title: fields.baseGoods + '状态',
			dataIndex: 'enabled',
			valueType: 'select',
			fieldProps: {
				placeholder: '请选择',
				options: roleStatus,
			},
		},
	];

	const columns: ProColumns<DistributorAuthorizationController.GoodsListRecord>[] = [
		{
			title: '货票同行状态',
			width: 150,
			dataIndex: 'invoiceSync',
			key: 'invoiceSync',
			render: (text: any, record: any) => {
				let textShow = '',
					type = 1;
				switch (record.invoiceSync) {
					case true:
						textShow = '已绑定';
						type = 1;
						break;
					case false:
						textShow = '未绑定';
						type = 2;
						break;
					default:
						break;
				}
				return (
					<div>
						<span>{type == 2 ? <ApiOutlined /> : <LinkOutlined />}</span>
						<span style={{ marginLeft: '3px' }}>{textShow}</span>
					</div>
				);
			},
		},
		{
			title: fields.goodsCode,
			width: 200,
			dataIndex: 'materialCode',
			key: 'materialCode',
		},
		{
			title: fields.goodsName,
			width: 200,
			dataIndex: 'goodsName',
			key: 'goodsName',
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			ellipsis: true,
			render: (text, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: fields.goodsProperty,
			dataIndex: 'highValue',
			width: 110,
			renderText: (text: boolean) => (typeof text === 'boolean' ? (text ? '高值' : '低值') : '-'),
		},
		{
			title: '状态',
			dataIndex: 'enabled',
			width: 120,
			renderText: (text: string, record: any) => {
				let textShow = '',
					color = '';
				switch (record.enabled) {
					case true:
						textShow = '已启用';
						color = CONFIG_LESS['@c_starus_await'];

						break;
					case false:
						textShow = '已禁用';
						color = CONFIG_LESS['@c_starus_disabled'];
						break;
					default:
						break;
				}

				return (
					<Badge
						color={color}
						text={textShow}
					/>
				);
			},
		},
		{
			title: '操作',
			width: 74,
			dataIndex: 'option',
			key: 'option',
			fixed: 'right',
			render: (text, record) => {
				return (
					<div className='operation'>
						{access['set_manufacturer_authorization_enabled'] && (
							<Popconfirm
								placement='left'
								title={`确定${!record.invoiceSync ? '绑定' : '解除绑定'}该${fields.baseGoods}吗？`}
								okText='确定'
								cancelText='取消'
								onConfirm={(e) => updateGoodsEnabled(!record.invoiceSync, [record.id], record)}
								okButtonProps={{ loading: bindLoading }}
								disabled={bindLoading}>
								<span className='handleLink'>{!record.invoiceSync ? '绑定' : '解除绑定'}</span>
							</Popconfirm>
						)}
					</div>
				);
			},
		},
	];

	const rowSelection = {
		selectedRowKeys,
		onChange: onSelectChange,
		onSelectAll: onSelectAll,
		getCheckboxProps: (record: DistributorAuthorizationController.GoodsListRecord) => ({
			disabled:
				selectedRowKeys && selectedRowKeys.length > 0
					? currSelectedItemFlag === 1
						? record.invoiceSync
						: !record.invoiceSync
					: false,
		}),
	};

	const beforeSearch = (params: Record<string, any>) => {
		const values = {
			...params,
			invoiceSync:
				params.invoiceSync && params.invoiceSync === 'true,false' ? undefined : params.invoiceSync,
			materialCode: params.materialCode || undefined,
			goodsName: params.goodsName || undefined,
			enabled: params.enabled,
		};
		return values;
	};

	return (
		<>
			<ProTable<DistributorAuthorizationController.GoodsListRecord>
				headerTitle={`厂家已授权${fields.baseGoods}列表`}
				columns={columns}
				tableInfoCode='manufacturer_authorization_list_right'
				rowKey='id'
				beforeSearch={beforeSearch}
				params={{ distributorId: id }}
				api={getGoodsList}
				tableRef={tableRef}
				rowSelection={rowSelection as Record<string, any>}
				onRow={(record) => ({
					onClick: () => {
						onRowClick(record);
					},
				})}
				tableAlertOptionRender={
					<a
						onClick={() => {
							setSelectedRowKeys([]);
							setSelectedRows([]);
						}}>
						取消选择
					</a>
				}
				toolBarRender={() => [
					<Button
						type='primary'
						disabled={currSelectedItemFlag != 1}
						onClick={startUsingAction}
						loading={batchStartLoading}
						className='btnOperator'>
						批量绑定
					</Button>,
					<Button
						type='primary'
						disabled={currSelectedItemFlag != 2}
						onClick={forbiddenAction}
						loading={batchStopLoading}
						className='btnOperator'>
						批量解绑
					</Button>,
				]}
				searchConfig={{
					columns: searchColumns,
				}}
			/>
		</>
	);
};

export default GoodsTicketList;
