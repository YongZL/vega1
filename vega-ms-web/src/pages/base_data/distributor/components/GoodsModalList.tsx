import ProTable, { ProTableAction } from '@/components/ProTable';
import { ProFormColumns } from '@/components/SchemaForm/typings';
import { getWithoutPriceList } from '@/services/goodsTypes';
import { getManufacturerAuthList } from '@/services/manufacturerAuthorizations';
import { dealPackNum } from '@/utils/dataUtil';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { ProColumns } from '@ant-design/pro-table';
import { Modal } from 'antd';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';

const GoodsModalList = (props: Record<string, any>) => {
	const {
		data: { visible, type },
		searchId,
	} = props;
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const [idList, setIdList] = useState<number[]>([]);
	const [dataList, setDataList] = useState<GoodsTypesController.WithoutPriceListRecord[]>([]);
	const [dataListFan, setDataListFan] = useState<GoodsTypesController.WithoutPriceListRecord[]>([]);

	useEffect(() => {
		if (props.selectedItemList && props.selectedItemList.length > 0) {
			let newData = props.selectedItemList.map((item: Record<string, any>) => item.goodsId);
			setIdList(newData);
			setDataList(props.selectedItemList);
		}
	}, [props.selectedItemList, visible]);

	const selectRow = (data: GoodsTypesController.WithoutPriceListRecord, status: boolean) => {
		let newIdList: number[] = cloneDeep(idList);
		let newDataList: GoodsTypesController.WithoutPriceListRecord[] = cloneDeep(dataList);
		if (status) {
			newIdList.push(data.goodsId);
			newDataList.push(data);
		} else {
			newIdList = newIdList.filter((item) => item != data.goodsId);
			newDataList = newDataList.filter((item) => item.goodsId != data.goodsId);
			let array: GoodsTypesController.WithoutPriceListRecord[] = [...dataListFan];
			dataList.map((item: GoodsTypesController.WithoutPriceListRecord) => {
				if (item.goodsId == data.goodsId) array.push(item);
			});
			setDataListFan(array);
		}
		setIdList(newIdList);
		setDataList(newDataList);
	};

	const selectRowAll = (
		status: boolean,
		selectedRows: GoodsTypesController.WithoutPriceListRecord[],
		changeRows: GoodsTypesController.WithoutPriceListRecord[],
	) => {
		let newIdList: number[] = cloneDeep(idList);
		let newDataList: GoodsTypesController.WithoutPriceListRecord[] = cloneDeep(dataList);
		let newData = changeRows.filter((item) => !newIdList.includes(item.goodsId));
		if (status) {
			newDataList = [...newDataList, ...newData];
		} else {
			let array: GoodsTypesController.WithoutPriceListRecord[] = [];
			changeRows.map((itemChange) => {
				newDataList = newDataList.filter((item) => item.goodsId != itemChange.goodsId);
				dataList.map((item) => {
					if (item.goodsId == itemChange.goodsId) array.push(item);
				});
			});
			setDataListFan(array);
		}
		let ids = newDataList.map((item) => item.goodsId);
		setIdList(ids);
		setDataList(newDataList);
	};

	// 表格行是否可选择的配置项
	const rowSelection = {
		selectedRowKeys: idList,
		onSelect: selectRow,
		onSelectAll: selectRowAll,
	};

	const onCancel = () => props.close();

	// 点击选择
	const handleSelectItem = (record: GoodsTypesController.WithoutPriceListRecord) => {
		// 判断当前选择的item是否已经被选中
		const isSelected = !idList.includes(record.goodsId);
		selectRow(record, isSelected);
	};

	const searchColumns: ProFormColumns = [
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			fieldProps: {
				placeholder: `请输入${fields.goodsName}`,
			},
		},
		{
			title: '注册证号',
			dataIndex: 'registrationNum',
			fieldProps: {
				placeholder: '请输入注册证号',
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			fieldProps: {
				placeholder: '请输入生产厂家',
			},
		},
		{
			title: `SPD${fields.goodsCode}`,
			dataIndex: 'materialCode',
			fieldProps: {
				placeholder: `请输入SPD${fields.goodsCode}`,
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			fieldProps: {
				placeholder: '请输入本地医保编码',
			},
		},
	];

	let columns: ProColumns<GoodsTypesController.WithoutPriceListRecord>[] = [
		{
			title: fields.goodsName,
			width: 180,
			dataIndex: props.isManufacturerAuth ? 'name' : 'goodsName',
			key: props.isManufacturerAuth ? 'name' : 'goodsName',
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
			title: '大/中包装',
			width: 120,
			dataIndex: 'largeBoxNum',
			key: 'largeBoxNum',
			align: 'left',
			render: (largeBoxNum, record) =>
				dealPackNum(
					record.largeBoxNum,
					props.isManufacturerAuth ? record.minGoodsNum : record.minGoodsUnitNum,
				),
		},
		{
			title: '本地医保编码',
			width: 150,
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			ellipsis: true,
		},
		{
			title: '注册证号',
			width: 150,
			dataIndex: 'registrationNum',
			key: 'registrationNum',
			ellipsis: true,
		},
		{
			title: '生产厂家',
			width: 150,
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			ellipsis: true,
		},
		{
			title: `SPD${fields.goodsCode}`,
			width: 150,
			dataIndex: 'materialCode',
			key: 'materialCode',
		},
		{
			title: '单价(元)',
			width: 120,
			dataIndex: 'price',
			key: 'price',
			align: 'right',
			renderText: (text: number) => <span>{text ? convertPriceWithDecimal(text) : '-'}</span>,
		},
	];

	if (type == 'custodian') {
		columns.push({
			title: '厂家授权期限',
			width: 220,
			dataIndex: 'authorizationStartDate',
			key: 'authorizationStartDate',
			renderText: (text: number, record) => {
				return (
					text && (
						<span>
							{moment(text).format('YYYY/MM/DD')} ～
							{record.authorizationEndDate
								? moment(record.authorizationEndDate).format('YYYY/MM/DD')
								: '长期有效'}
						</span>
					)
				);
			},
		});
	}

	return (
		<Modal
			title={`选择${fields.baseGoods}`}
			okText='添加'
			width={'80%'}
			visible={visible}
			onCancel={onCancel}
			onOk={() => {
				props.submit({ dataList, dataListFan });
				onCancel();
			}}
			maskClosable={false}
			className='ant-detail-modal'>
			<ProTable<GoodsTypesController.WithoutPriceListRecord>
				columns={columns}
				rowKey='goodsId'
				params={{
					isCombined: false,
					...searchId,
				}}
				scroll={{ x: '100%', y: 300 }}
				api={type == 'manufacturer' ? getWithoutPriceList : getManufacturerAuthList}
				tableRef={tableRef}
				customStyle={false}
				searchConfig={{
					columns: searchColumns,
				}}
				rowSelection={rowSelection}
				onRow={(record) => ({
					onClick: (e) => {
						e.stopPropagation();
						handleSelectItem(record);
					},
				})}
				tableAlertOptionRender={
					<a
						onClick={() => {
							setIdList([]);
							setDataList([]);
						}}>
						取消选择
					</a>
				}
			/>
		</Modal>
	);
};

export default GoodsModalList;
