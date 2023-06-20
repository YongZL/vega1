import ProTable, { ProColumns } from '@/components/ProTable';
import { returnableStatusTextMap } from '@/constants/dictionary';
import { getScrollX, judgeBarCodeOrUDI } from '@/utils';
import { formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import '@ant-design/compatible/assets/index.css';
import { Modal } from 'antd';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
export interface UpdateProps {
	setIsOpen: (value: boolean) => void;
	isOpen: boolean;
	allList: DepartmentRecord;
	selectList: DepartmentRecord;
	submitList: (value: any) => void;
	submitKey: (value: any) => void;
}

type DepartmentRecord = ReturnGoodsController.ListDepartmentRecord[];
type ListDepartmentRecord = ReturnGoodsController.ListDepartmentRecord;

const AddMoreModal: React.FC<UpdateProps> = (props) => {
	const { fields } = useModel('fieldsMapping');
	const [list, setList] = useState<DepartmentRecord>([]);
	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
	const [selectedList, setSelectedList] = useState<DepartmentRecord>([]);
	const { setIsOpen, isOpen, allList, selectList, submitList, submitKey } = props;

	const initSelect = () => {
		const keys = selectList.map((item: ListDepartmentRecord) => item.key);
		const selected = allList.filter((item: ListDepartmentRecord) => keys.includes(item.key));
		const selectedKey = selected.map((item) => item.key);
		setList(allList);
		setSelectedList(selected);
		setSelectedKeys(selectedKey);
	};

	// 关闭弹窗
	const modalCancel = () => {
		setList([]);
		setSelectedKeys([]);
		setSelectedList([]);
		setIsOpen(false);
	};

	// 选择
	const selectRow = (selectData: ListDepartmentRecord, status: boolean) => {
		let select: DepartmentRecord = cloneDeep(selectedList);
		if (status) {
			select.push(selectData);
		} else {
			select.map((val, index) => {
				if (val.key === selectData.key) {
					select.splice(index, 1);
				}
			});
		}
		const selectedRowKeys = select.map((item) => item.key);
		setSelectedKeys(selectedRowKeys);
		setSelectedList(select);
	};

	// 全选
	const onSelectAll = (selected: boolean, selectedRecords: DepartmentRecord) => {
		let select: DepartmentRecord = [];
		if (selected) {
			select = selectedRecords;
		}
		const selectedRowKeys = select.map((item) => item.key);
		setSelectedKeys(selectedRowKeys);
		setSelectedList(select);
	};

	// 单行点击选中
	const selectRowOfClick = (record: ListDepartmentRecord) => {
		const index = selectedKeys.indexOf(record.key);
		if (index >= 0) {
			selectRow(record, false);
		} else {
			selectRow(record, true);
		}
	};

	const rowSelection = {
		selectedRowKeys: selectedKeys,
		onSelect: selectRow,
		onSelectAll: onSelectAll,
	};

	// 提交弹窗选择
	const modalSubmit = async () => {
		if (selectedKeys.length <= 0) {
			notification.error(`请选择${fields.baseGoods}`);
			return;
		}

		let oldSelected = cloneDeep(selectList);
		const allListKeys = allList.map((goods) => goods.key);
		const list = oldSelected.filter((item) => !allListKeys.includes(item.key));
		selectedList.forEach((item) => {
			if (list.filter((child) => child.key === item.key).length <= 0) {
				list.push(item);
			}
		});
		const selectedRowKeys = list.map((item) => item.key);
		submitKey(selectedRowKeys);
		submitList(list);
		modalCancel();
	};

	useEffect(() => {
		if (isOpen && props) {
			initSelect();
		}
	}, [isOpen, props]);

	const columns: ProColumns<ListDepartmentRecord>[] = [
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 150,
		},
		{
			title: `${fields.goods}条码/UDI`,
			dataIndex: 'goodsOperatorBarcode',
			key: 'goodsOperatorBarcode',
			width: 150,
			renderText: (text, record) => judgeBarCodeOrUDI(record),
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 150,
			ellipsis: true,
			renderText: (text: string, record) => (
				<span>{`${text || '-'}/${record.serialNum || '-'}`}</span>
			),
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 120,
			renderText: (text, record) => text + record.minUnitName,
		},
		{
			title: '状态',
			dataIndex: 'status',
			key: 'status',
			width: 100,
			renderText: (text) => returnableStatusTextMap[text],
		},
		{
			title: '科室',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '仓库',
			dataIndex: 'warehouseName',
			key: 'warehouseName',
			width: 150,
			ellipsis: true,
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorName',
			key: 'distributorName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '所属包',
			dataIndex: 'packageName',
			key: 'packageName',
			width: 150,
			ellipsis: true,
			render: (text, record) => {
				return text ? text : record.surgicalName ? record.surgicalName : '-';
			},
		},
		{
			title: '消耗时间',
			dataIndex: 'consumedTime',
			key: 'consumedTime',
			width: 120,
			render: (text) => {
				return <span>{text ? moment(Number(text)).format('YYYY/MM/DD') : ''}</span>;
			},
		},
	];
	return (
		<Modal
			width='80%'
			destroyOnClose
			maskClosable={false}
			visible={isOpen}
			title='更多'
			onCancel={() => modalCancel()}
			onOk={modalSubmit}>
			<ProTable
				rowSelection={rowSelection}
				columns={columns}
				rowKey='key'
				dataSource={list}
				scroll={{
					y: 300,
					x: getScrollX(columns, true),
				}}
				pagination={false}
				size='small'
				onRow={(record) => ({
					onClick: () => {
						selectRowOfClick(record);
					},
				})}
			/>
		</Modal>
	);
};

export default AddMoreModal;
