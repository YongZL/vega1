import configLess from '@/../config/configLess';
import Breadcrumb from '@/components/Breadcrumb';
import DistributorChannelModel from '@/components/DistributorChannelModel';
import FooterToolbar from '@/components/FooterToolbar';
import { ProColumns } from '@/components/ProTable/typings';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import type { StateType } from '@/models/purchasePlan';
import { getAllDistributors } from '@/services/distributor';
import { pageList } from '@/services/newGoodsTypes';
import { applyDetail } from '@/services/purchasenew';
import { dealPackNum } from '@/utils/dataUtil';
import {
	convertPriceWithDecimal,
	formatPackageQuantity,
	formatStrConnect,
	formatUnitNum,
} from '@/utils/format';
import { notification } from '@/utils/ui';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Checkbox, Form, InputNumber } from 'antd';
import { cloneDeep } from 'lodash';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { connect, Dispatch, history, useAccess, useModel } from 'umi';
import styles from './index.less';
interface AddPlanProps {
	dispatch: Dispatch;
	submitting: boolean;
	loading: boolean;
	purchasePlan: StateType;
}
type GoodsByDepartmentRecord = GoodsTypesController.GoodsByDepartmentRecord;

const AddPurchasePlan: FC<AddPlanProps> = ({ submitting, loading, purchasePlan, dispatch }) => {
	const { pageNum, pageSize } = purchasePlan;
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	const [selectList, setSelectList] = useState<GoodsByDepartmentRecord[]>([]);
	const [distributorChannelVisible, setDistributorChannelVisible] = useState(false);
	const [distributorList, setDistributorList] = useState<
		DistributorController.DistributorsRecord[]
	>([]);
	const [selectedRowKeyList, setSelectedRowKeyList] = useState<number[]>([]);
	const { pageType = 'add', planId } = history.location.state as {
		pageType: string;
		planId: number;
	};
	const access = useAccess();
	const getApplyDetail = async () => {
		try {
			let res = await applyDetail({ planId });
			if (res && res.code === 0) {
				let result = [res.data || {}];
				setSelectList(result as GoodsByDepartmentRecord[]);
			}
		} finally {
		}
	};
	const getDistributorList = async () => {
		const res = await getAllDistributors();
		if (res.code === 0) {
			setDistributorList(res.data);
		}
	};
	useEffect(() => {
		if (pageType === 'edit') {
			getApplyDetail();
		} else {
			fetchGoodsList();
		}
		// 无过供货渠道操作权限时
		access.goods_supply_channel && getDistributorList();
	}, []);

	const fetchGoodsList = async (params = {}) => {
		dispatch({
			type: 'purchasePlan/getGoodsList',
			payload: { pageNum, pageSize, isCombined: false, isEnabled: true, ...params },
		});
	};

	const columns: ProColumns<NewGoodsTypesController.GoodsRecord>[] = [
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 150,
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			key: 'name',
			width: 150,
			ellipsis: true,
		},
		{
			title: '通用名称',
			dataIndex: 'commonName',
			key: 'commonName',
			width: 150,
			hideInSearch: true,
			ellipsis: true,
			renderText: (text: string) => <span>{text || '-'}</span>,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			hideInSearch: true,
			render: (_text, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 150,
			ellipsis: true,
			hideInSearch: true,
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorName',
			key: 'distributorName',
			width: 150,
			ellipsis: true,
			hideInSearch: true,
		},
		{
			title: '配货库房',
			dataIndex: 'storageAreaName',
			key: 'storageAreaName',
			width: 150,
			ellipsis: true,
			hideInSearch: true,
			className: WEB_PLATFORM !== 'DS' ? styles.hideen : '',
		},
		{
			title: '大/中包装',
			dataIndex: 'minGoodsNum',
			key: 'minGoodsNum',
			width: 100,
			hideInSearch: true,
			render: (_text, record) =>
				formatUnitNum(record.largeBoxNum ? record.largeBoxNum : '', record.minGoodsNum),
		},
		{
			title: '可用库存',
			dataIndex: 'stock',
			key: 'stock',
			width: 150,
			ellipsis: true,
			hideInSearch: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'procurementPrice',
			key: 'procurementPrice',
			width: 120,
			align: 'right',
			render: (_text, record) => {
				return convertPriceWithDecimal(record.procurementPrice);
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 120,
			ellipsis: true,
			hideInSearch: true,
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			key: 'nationalNo',
			width: 120,
			ellipsis: true,
			hideInSearch: true,
		},
	];
	const searchColumn: ProFormColumns = [
		{
			title: `${fields.goodsCode}/名称`,
			valueType: 'selectTable',
			dataIndex: 'goodsNameOrCode',
			fieldProps: {
				selectRowKeys: selectedRowKeys,
				showArrow: false,
				api: pageList,
				searchKey: 'goodsNameOrCode',
				labelKey: 'name',
				valueKey: 'id',
				filterData: (res: ResponseList<NewGoodsTypesController.GoodsRecord[]>) => {
					return res.data.rows;
				},
				onChange: (value: number, option: GoodsByDepartmentRecord) => {
					if (value && !selectedRowKeys.includes(value)) {
						selectedRowKeys.push(value);
						selectList.push(option);
						setSelectedRowKeys([...selectedRowKeys]);
						setSelectList([...selectList]);
					}
				},
				params: {
					pageNum: 0,
					pageSize: 50,
					isPurchase: true,
					isCombined: false,
					isEnabled: true,
				},
				tableProps: {
					rowKey: 'id',
					columns: columns,
				},
			},
		},
	];

	const dealStock = (text: string, record?: number) => (
		<label style={{ color: !record ? configLess['@c_starus_warning'] : undefined }}>{text}</label>
	);

	const columnsModalSelect: ProColumns<GoodsByDepartmentRecord>[] = [
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 150,
			hideInSearch: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			key: 'name',
			width: 150,
			renderText: (text, record) => dealStock(text, record.stock),
		},
		{
			title: '通用名称',
			dataIndex: 'commonName',
			key: 'commonName',
			width: 150,
			hideInSearch: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			hideInSearch: true,
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 150,
			ellipsis: true,
			hideInSearch: true,
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorName',
			key: 'distributorName',
			width: 150,
			ellipsis: true,
			hideInSearch: true,
		},
		{
			title: '配货库房',
			dataIndex: 'storageAreaName',
			key: 'storageAreaName',
			width: 150,
			ellipsis: true,
			hideInSearch: true,
			hideInTable: WEB_PLATFORM !== 'DS',
		},
		{
			title: '大/中包装',
			dataIndex: 'minGoodsNum',
			key: 'minGoodsNum',
			width: 100,
			renderText: (text: string, record) => dealPackNum(record.largeBoxNum, text),
		},
		{
			title: '可用库存',
			dataIndex: 'stock',
			key: 'stock',
			width: 150,
			ellipsis: true,
			hideInSearch: true,
			renderText: (text, record) => dealStock(text, record.stock),
		},
		{
			title: '单价(元)',
			dataIndex: 'procurementPrice',
			key: 'procurementPrice',
			width: 120,
			ellipsis: true,
			hideInSearch: true,
			align: 'right',
			renderText: (text, record) => convertPriceWithDecimal(text),
		},
		{
			title: '申请数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 180,
			renderText: (text: string, record, index: number) => {
				return (
					<div style={{ display: 'flex' }}>
						<InputNumber
							autoFocus={true}
							min={1}
							max={9999999}
							style={{ width: '100px' }}
							key={record.id}
							value={text ? Number(text) : undefined}
							onChange={(value) => numChange(record.id, value)}
						/>
						<div
							style={{
								marginLeft: '7px',
								display: 'flex',
								justifyContent: 'center',
								flexDirection: 'column-reverse',
							}}>
							{record.minGoodsUnit}
						</div>
					</div>
				);
			},
		},
		{
			title: '总价(元)',
			dataIndex: 'sumPrice',
			key: 'sumPrice',
			width: 120,
			ellipsis: true,
			hideInSearch: true,
			align: 'right',
			render: (text, record) =>
				convertPriceWithDecimal(Number(record.quantity) * record.procurementPrice),
		},
		{
			title: '大/中/散',
			dataIndex: 'minGoodsNum',
			key: 'minGoodsNum',
			width: 100,
			render: (text, record) => (
				<span>{record.quantity ? formatPackageQuantity({ goods: record }) : '0/0/0'}</span>
			),
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 120,
			ellipsis: true,
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			key: 'nationalNo',
			width: 120,
			ellipsis: true,
		},
		{
			title: '是否加急',
			dataIndex: 'isUrgent',
			key: 'isUrgent',
			width: 100,
			render: (text, record) => {
				return (
					<Checkbox
						defaultChecked={record.isUrgent}
						onChange={(e) => {
							const value = e.target.checked;
							const data: any = selectList.forEach((item) => {
								if (item.id === record.id) item.isUrgent = value;
							});
							setSelectList([...data]);
						}}
					/>
				);
			},
		},
		{
			title: '操作',
			dataIndex: 'operation',
			key: 'operation',
			width: 62,
			hideInTable: pageType === 'edit',
			renderText: (text: string, record) => (
				<span
					className='handleLink handleDanger'
					onClick={() => selectDelete(record.id)}>
					删除
				</span>
			),
		},
	];
	const numChange = (id: number, val: any) => {
		const data = selectList.map((item) =>
			item.id === id ? { ...item, quantity: val ? Math.floor(parseInt(val)) : '' } : { ...item },
		);
		setSelectList([...data] as GoodsByDepartmentRecord[]);
	};

	const selectDelete = (id: number) => {
		const index = selectedRowKeys.findIndex((item) => item === id);
		const rowKeys = cloneDeep(selectedRowKeys);
		const rows = cloneDeep(selectList);
		rowKeys.splice(index, 1);
		rows.splice(index, 1);
		setSelectedRowKeys(rowKeys);
		setSelectList(rows);
	};

	const submit = async () => {
		let selectListData = [];
		for (let index in selectList) {
			const i = Number(index) + 1;
			const quantity = selectList[index].quantity;
			if (!quantity) {
				notification.warning('采购列表  第 ' + i + ' 行请输入申请数量');
				selectListData = [];
				return false;
			}
			selectListData.push({
				goodsId: selectList[index].id,
				isUrgent: selectList[index].isUrgent || false,
				quantity: quantity,
				storageAreaId: WEB_PLATFORM === 'DS' ? selectList[index].storageAreaId : undefined,
			});
		}
		let url = pageType === 'add' ? 'addPurchasePlan' : 'planUpdate';
		await dispatch({
			type: `purchasePlan/${url}`,
			payload: {
				...(pageType === 'edit'
					? { planId, quantity: selectList[0]?.quantity, isUrgent: selectList[0]?.isUrgent }
					: {}),
				...(pageType === 'add' ? { goodsList: selectListData } : {}),
			},
		});
	};

	// 点击行
	const selectRowOfClick = (selectedRecord: GoodsByDepartmentRecord) => {
		const index = selectedRowKeyList.indexOf(selectedRecord.id);
		onSelect(selectedRecord, !(index >= 0));
	};
	const onSelect = (record: GoodsByDepartmentRecord, selected: boolean) => {
		if (selected) {
			setSelectedRowKeyList([record.id]);
		}
	};
	const handleSubmit = async () => {
		const newSelectList = selectList;
		const goodsId = selectedRowKeyList[0];
		const res = await pageList({
			pageNum: 0,
			pageSize: 50,
			goodsId,
		});
		if (res && res.code === 0) {
			const row = res.data.rows[0];
			if (row) {
				newSelectList.forEach((item) => {
					if (item.id === goodsId) {
						item.distributorName = row.distributorName;
					}
				});
			}
			setSelectList([...newSelectList]);
		}
	};
	return (
		<div className='main-page'>
			<Breadcrumb config={['', ['', '/purchase/handle'], ['', '/purchase/handle'], '']} />
			<ProTable<GoodsByDepartmentRecord>
				rowKey='id'
				tableInfoCode='handled_add_purchase_plan'
				extraHeight={56} // 因为底部提交栏，所以需要修正高度
				api={undefined}
				loadConfig={{
					loadText: '暂无数据',
					request: false,
				}}
				headerTitle={
					<div className='flex flex-between flex-middle'>
						采购列表
						<div className='tableTitle'>
							<span
								className='tableAlert'
								style={{
									backgroundColor: CONFIG_LESS['@bgc_search'],
									borderRadius: '5px',
									marginLeft: '10px',
								}}>
								<ExclamationCircleFilled
									style={{
										color: CONFIG_LESS['@c_starus_await'],
										marginRight: '8px',
										fontSize: '12px',
									}}
								/>
								<span
									className='consumeCount'
									style={{ border: 0 }}>
									采购总价：￥
									<span className='titlecollect'>
										{convertPriceWithDecimal(
											selectList.reduce(
												(acc, cur) => acc + Number(cur.quantity) * Number(cur.price),
												0,
											),
										)}
									</span>
								</span>
							</span>
						</div>
					</div>
				}
				searchConfig={
					pageType === 'add'
						? {
								form,
								submitter: false,
								columns: searchColumn,
						  }
						: undefined
				}
				rowSelection={{
					selectedRowKeys: selectedRowKeyList,
					onSelect,
					type: 'radio',
				}}
				onRow={(record) => ({
					onClick: () => {
						selectRowOfClick(record);
					},
				})}
				dataSource={selectList}
				columns={columnsModalSelect}
				toolBarRender={() => [
					access.purchase_supply_channel_editing && (
						<Button
							type='primary'
							style={{ width: 150 }}
							onClick={() => {
								setDistributorChannelVisible(true);
							}}
							className='iconButton'
							disabled={selectedRowKeyList.length === 0}>
							供货渠道编辑
						</Button>
					),
					pageType === 'add' && (
						<Button
							type='primary'
							onClick={() => {
								setSelectList([]);
								setSelectedRowKeys([]);
							}}
							className='iconButton'
							disabled={!selectedRowKeys.length}>
							全部删除
						</Button>
					),
				]}
			/>
			{distributorChannelVisible && (
				<DistributorChannelModel
					visible={distributorChannelVisible}
					handleVisible={() => {
						setDistributorChannelVisible(false);
					}}
					allDistributorList={distributorList}
					goodsId={selectedRowKeyList[0]}
					handleSubmit={handleSubmit}
				/>
			)}
			<FooterToolbar className={styles.submit}>
				<Button
					onClick={() => history.push('/purchase/handle')}
					className='returnButton'>
					返回
				</Button>
				<Button
					type='primary'
					onClick={submit}
					loading={submitting}
					disabled={!selectedRowKeys.length && pageType !== 'edit'}
					className='verifyButton'>
					确认操作
				</Button>
			</FooterToolbar>
		</div>
	);
};

export default connect(
	({
		loading,
		purchasePlan,
	}: {
		purchasePlan: StateType;
		loading: { effects: { [key: string]: boolean } };
	}) => ({
		purchasePlan,
		submitting: loading.effects['purchasePlan/addPurchasePlan'],
		loading: loading.effects['purchasePlan/getGoodsList'],
	}),
)(AddPurchasePlan);
