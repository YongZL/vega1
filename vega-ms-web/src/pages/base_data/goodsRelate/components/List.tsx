import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ResizableTable';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import {
	isEnabledStatusValueEnum,
	isHightValueTextMap,
	yesOrNoTextMap,
} from '@/constants/dictionary';
import type { GlobalModelState } from '@/models/global';
import type { ModelStateType } from '@/models/relateGoods';
import { exportApi, queryRelateGoods } from '@/services/relateGoods';
import { calColumnsWidth } from '@/utils';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Form, Popconfirm } from 'antd';
import { unionBy } from 'lodash';
import { useRef, useState } from 'react';
import { connect, Dispatch, useAccess, useModel } from 'umi';
import DetailModal from './Detail';

type RelateGoodsType = {
	dispatch: Dispatch;
	relateGoods: ModelStateType;
	pageType: boolean;
};

const RelateGoods = ({ dispatch, relateGoods, ...props }: RelateGoodsType) => {
	const { fields } = useModel('fieldsMapping');
	const [systemType] = useState<string | null>(sessionStorage.getItem('systemType'));
	const tableRef = useRef<ProTableAction>();
	const access = useAccess();
	const [modalVisible, setModalVisible] = useState(false);
	let [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	let [selectedRowKeysIdHisId, setselectedRowKeysIdHisId] = useState<number[]>([]);
	let [selectList, setSelectList] = useState<RelateGoodsController.QueryRelateGoodsRecord[]>([]);
	const [selectType, setSelectType] = useState('');
	const [isExportFile, setIsExportFile] = useState(false);
	const [form] = Form.useForm();
	const { pageType } = props;

	const fetchList = () => {
		tableRef.current?.reload();
	};
	console.log(selectList, 'selectListselectListselectListselectList');

	// 选择
	const selectRow = (selectData: RelateGoodsController.QueryRelateGoodsRecord, status: boolean) => {
		if (status) {
			setSelectType(selectData.type);
			selectList.push(selectData);
		} else {
			selectList.forEach((val, index) => {
				if (val.idHisid === selectData.idHisid) {
					selectList.splice(index, 1);
				}
			});
			if (selectList.length <= 0) {
				setSelectType('');
			}
		}
		selectedRowKeys = selectList.map((item) => item.goodsId);
		setSelectList([...selectList]);
		setSelectedRowKeys([...selectedRowKeys]);
		let idHisidArr = selectList.map((item) => item.idHisid);
		setselectedRowKeysIdHisId([...idHisidArr]);
	};

	// 全选过滤
	const selectRowAll = (
		status: boolean,
		selectedRows: RelateGoodsController.QueryRelateGoodsRecord[],
		changeRows: RelateGoodsController.QueryRelateGoodsRecord[],
	) => {
		if (status) {
			// 有无选中项
			if (selectType) {
				selectedRows = selectedRows.filter((item) => item.type == selectType);
			} else {
				selectedRows = selectedRows.filter((item) => item.type !== 'diagnosis_project');
			}
			selectList = unionBy(selectList.concat(selectedRows), 'idHisid');
			setSelectType('');
		} else {
			selectList = selectList.filter((item) => {
				return item && !changeRows.map((item) => item.idHisid).includes(item.idHisid);
			});
		}
		if (selectList.length <= 0) {
			setSelectType('');
		} else {
			setSelectType(selectList[0].type);
		}
		selectList = selectList.filter((item) => item);
		selectedRowKeys = selectList.map((item) => item.goodsId);
		setSelectedRowKeys([...selectedRowKeys]);
		setSelectList([...selectList]);
		let idHisidArr = selectList.map((item) => item.idHisid);
		setselectedRowKeysIdHisId([...idHisidArr]);
	};

	const unbindGoods = (record: RelateGoodsController.QueryRelateGoodsRecord) => {
		let params = {
			goodsId: record.goodsId,
			// compositeGoodsId: record.relateGoodsId,
			hisChargeId: record.hisChargeId,
		};
		dispatch({
			type: 'relateGoods/unbindGoods',
			payload: params,
			callback: (res) => {
				if (res && res.code === 0) {
					notification.success('解绑成功');
					tableRef.current?.reload();
				}
			},
		});
	};

	// 单行点击选中
	const selectRowOfClick = (record: RelateGoodsController.QueryRelateGoodsRecord) => {
		if (
			selectType &&
			((selectType === 'diagnosis_project' && record.idHisid !== selectedRowKeysIdHisId[0]) ||
				(selectType !== 'diagnosis_project' && record.type === 'diagnosis_project'))
		) {
			return;
		}
		let index = selectedRowKeysIdHisId.indexOf(record.idHisid);
		if (index >= 0) {
			selectRow(record, false);
		} else {
			selectRow(record, true);
		}
	};

	// 对照modal
	const addModal = () => {
		setModalVisible(true);
		// dispatch({
		// 	type: 'relateGoods/queryHisGoods',
		// 	payload: {
		// 		pageNum: detailPageNum,
		// 		pageSize: detailPageSize,
		// 		filterGoodsIds: pageType ? [...selectedRowKeys] : undefined,
		// 		type: 'HIS',
		// 	},
		// });
	};
	const statusOption = [
		{ label: '是', value: true },
		{ label: '否', value: false },
	];
	const statusOptionGood = [
		{ label: '高值', value: true },
		{ label: '低值', value: false },
	];

	const searchColumnsPending: ProFormColumns = [
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		...(systemType !== 'Insight_RS'
			? ([
					{
						title: '植/介入物',
						dataIndex: 'isImplantation',
						valueType: 'select',
						fieldProps: {
							placeholder: '请选择',
							options: statusOption,
						},
					},
			  ] as ProFormColumns)
			: []),
		{
			title: fields.goodsProperty,
			dataIndex: 'isHighValue',
			valueType: 'select',
			fieldProps: {
				placeholder: '请选择',
				options: statusOptionGood,
			},
		},
	];
	const searchColumnSend: ProFormColumns = [
		{
			title: '收费项编号',
			dataIndex: 'chargeCode',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '收费项名称',
			dataIndex: 'chargeName',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		...(systemType !== 'Insight_RS'
			? ([
					{
						title: '植/介入物',
						dataIndex: 'isImplantation',
						valueType: 'select',
						fieldProps: {
							placeholder: '请选择',
							options: statusOption,
						},
					},
			  ] as ProFormColumns)
			: []),
		{
			title: fields.goodsProperty,
			dataIndex: 'isHighValue',
			valueType: 'select',
			fieldProps: {
				placeholder: '请选择',
				options: statusOptionGood,
			},
		},
	];
	const columnNotRelate: ProColumns<RelateGoodsController.QueryRelateGoodsRecord>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 60,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 100,
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			key: 'name',
			width: 100,
			ellipsis: true,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 100,
			ellipsis: true,
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			key: 'nationalNo',
			width: 100,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 120,
			ellipsis: true,
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 120,
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'procurementPrice',
			key: 'procurementPrice',
			width: 80,
			align: 'right',
			renderText: (text) => {
				return convertPriceWithDecimal(text);
			},
		},
		...(systemType !== 'Insight_RS'
			? [
					{
						title: '植/介入物',
						dataIndex: 'isImplantation',
						key: 'isImplantation',
						width: 80,
						renderText: (text: boolean) => {
							return yesOrNoTextMap[`${text}`];
						},
					},
			  ]
			: []),
		{
			title: fields.goodsProperty,
			dataIndex: 'isHighValue',
			key: 'isHighValue',
			width: 80,
			renderText: (text) => {
				return isHightValueTextMap[text] || '-';
			},
		},
	];
	const columnRelated: ProColumns<RelateGoodsController.QueryRelateGoodsRecord>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 60,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: '收费项状态',
			dataIndex: 'stopped',
			key: 'stopped',
			width: 80,
			filters: false,
			valueEnum: isEnabledStatusValueEnum,
		},
		{
			title: '收费项编号',
			dataIndex: 'chargeCode',
			key: 'chargeCode',
			width: 100,
		},
		{
			title: '收费项名称',
			dataIndex: 'chargeName',
			key: 'chargeName',
			width: 100,
			ellipsis: true,
		},
		{
			title: '收费项单价',
			dataIndex: 'chargePrice',
			key: 'chargePrice',
			align: 'right',
			width: 80,
			renderText: (text) => convertPriceWithDecimal(text),
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 130,
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			key: 'name',
			width: 100,
			ellipsis: true,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 100,
			ellipsis: true,
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			key: 'nationalNo',
			width: 100,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 100,
			ellipsis: true,
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 100,
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'procurementPrice',
			key: 'procurementPrice',
			width: 100,
			align: 'right',
			renderText: (text) => {
				return convertPriceWithDecimal(text);
			},
		},
		...(systemType !== 'Insight_RS'
			? [
					{
						title: '植/介入物',
						dataIndex: 'isImplantation',
						key: 'isImplantation',
						width: 80,
						renderText: (text: boolean) => yesOrNoTextMap[`${text}`],
					},
			  ]
			: []),
		{
			title: fields.goodsProperty,
			dataIndex: 'isHighValue',
			key: 'isHighValue',
			width: 70,
			renderText: (text) => isHightValueTextMap[text] || '-',
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 100,
			render: (id, record) => {
				return (
					<div className='operation'>
						{access['unbind_relate_goods'] ? (
							<Popconfirm
								placement='left'
								title={`确定解绑？`}
								onConfirm={(e) => {
									e?.stopPropagation();
									unbindGoods(record);
								}}
								onCancel={(e) => e?.stopPropagation()}>
								<span
									className='handleLink'
									onClick={(event) => event.stopPropagation()}>
									解绑
								</span>
							</Popconfirm>
						) : null}
					</div>
				);
			},
		},
	];

	const rowSelection = {
		selectedRowKeys: selectedRowKeysIdHisId,
		onSelect: selectRow,
		onSelectAll: selectRowAll,
		width: '50px',
		getCheckboxProps: (record: RelateGoodsController.QueryRelateGoodsRecord) => ({
			disabled: selectType
				? selectType === 'diagnosis_project'
					? record.idHisid !== selectedRowKeysIdHisId[0]
					: record.type === 'diagnosis_project'
				: false,
		}),
	};
	const tableColumns = !pageType ? columnNotRelate : columnRelated;
	return (
		<>
			<ProTable<RelateGoodsController.QueryRelateGoodsRecord>
				columns={calColumnsWidth(tableColumns, false)}
				rowKey='idHisid'
				tableInfoCode={pageType ? 'goodsRelate_true' : 'goodsRelate_false'}
				api={queryRelateGoods}
				setRows={(res) => {
					const data = res.data || {};
					return {
						...data,
						rows: (data.rows || []).map((item: any) => ({
							...item,
							idHisid: Number(item.goodsId + '' + (item.hisChargeId ? item.hisChargeId : '')),
						})),
					};
				}}
				params={{ related: !pageType ? false : true }}
				requestCompleted={(rows) => {
					setIsExportFile(rows.length > 0);
				}}
				tableRef={tableRef}
				toolBarRender={() => [
					access['bind_relate_goods'] && (
						<Button
							type='primary'
							className='btnOperator'
							onClick={() => addModal()}
							disabled={selectList.length === 0}
							style={{ width: 72, padding: 0 }}>
							对照
						</Button>
					),
					access['export_relate_goods'] && (
						<span>
							<ExportFile
								data={{
									filters: {
										...form.getFieldsValue(),
										related: pageType,
									},
									link: exportApi,
									getForm: () => {
										return { ...form.getFieldsValue() };
									},
								}}
								disabled={!isExportFile}
							/>
						</span>
					),
				]}
				rowSelection={rowSelection}
				onRow={(record) => ({
					onClick: (e) => {
						e.stopPropagation();
						selectRowOfClick(record);
					},
				})}
				tableAlertOptionRender={
					<a
						onClick={() => {
							setSelectType('');
							setSelectedRowKeys([]);
							setselectedRowKeysIdHisId([]);
							setSelectList([]);
						}}>
						取消选择
					</a>
				}
				searchConfig={{
					form,
					columns: !pageType ? searchColumnsPending : searchColumnSend,
				}}
				loadConfig={{
					request: false,
				}}
			/>
			<DetailModal
				selectType={selectType}
				modalVisible={modalVisible}
				setModalVisible={setModalVisible}
				goodsIds={selectedRowKeys}
				fetchList={fetchList}
				pageType={pageType}
				resetParentList={() => {
					setSelectType('');
					setSelectList([]);
					setSelectedRowKeys([]);
					setselectedRowKeysIdHisId([]);
				}}
			/>
		</>
	);
};

export default connect(
	({
		loading,
		relateGoods,
		global,
	}: {
		loading: any;
		relateGoods: ModelStateType;
		global: GlobalModelState;
	}) => ({
		loading: loading.effects['relateGoods/queryRelateGoods'],
		relateGoods,
		global,
	}),
)(RelateGoods);
