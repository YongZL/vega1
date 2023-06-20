import type { ProColumns } from '@/components/ProTable';
import type { ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import { Tips } from '@/components/GetNotification';
import ProTable from '@/components/ResizableTable';
import { enabledStatus, enabledStatusValueEnum, isHightValue } from '@/constants/dictionary';
import { goodsResupplyList, removeGoodsResupplyById } from '@/services/resupply';
import { sortListByLevel } from '@/services/storageAreas';
import { notification } from '@/utils/ui';
import { Card, Divider, Form } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { useAccess, useModel } from 'umi';
import SettingModal from './SettingModal';
import { formatStrConnect } from '@/utils/format';

type GoodRecord = Omit<ResupplyController.GoodsResupplyRecord, 'goodsId' | 'resupplySettingId'> & {
	goodsId: number;
	resupplySettingId: number;
};

const ResupplySetting: React.FC = () => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
	const tableRef = useRef<ProTableAction>();
	const [list, setList] = useState([]);
	const [form] = Form.useForm();

	const handleClear = async (record: GoodRecord) => {
		setLoadingMap({ ...loadingMap, [record.resupplySettingId]: true });
		try {
			const res = await removeGoodsResupplyById(record.resupplySettingId);
			if (res && res.code == 0) {
				notification.success('操作成功');
				tableRef.current?.reload();
			}
		} finally {
			setLoadingMap({ ...loadingMap, [record.resupplySettingId]: false });
		}
	};

	useEffect(() => {
		const getList = async () => {
			try {
				let res = await sortListByLevel({ isCurrentUser: true });
				setList([...res.data]);
				if (res && res.code === 0) {
					if (res.data.length === 1) {
						form.setFieldsValue({ storageAreaId: res.data[0].id });
					}
				}
			} finally {
			}
		};
		WEB_PLATFORM === 'DS' && getList();
	}, []);
	const columns: ProColumns<GoodRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			width: 'XXS',
			align: 'center',
			renderText: (text, record, index) => index + 1,
		},
		{
			title: `${fields.goods}状态`,
			dataIndex: 'status',
			width: 'S',
			filters: false,
			valueEnum: enabledStatusValueEnum,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			width: 'L',
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			width: 'L',
			ellipsis: true,
			renderText: (text, record) => {
				return formatStrConnect(record, ['specification', 'model']);
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '包装规格',
			dataIndex: 'minUnitNum',
			width: 'XS',
			renderText: (text, record) => text + record.minUnitName + '/' + record.purchaseUnitName,
		},
		{
			title: fields.goodsProperty,
			dataIndex: 'highValue',
			width: 'S',
			renderText: (text: boolean) => (typeof text === 'boolean' ? (text ? '高值' : '低值') : '-'),
		},
		{
			title: '上限',
			dataIndex: 'upperLimit',
			width: 'XXS',
		},
		{
			title: '下限',
			dataIndex: 'lowerLimit',
			width: 'XXS',
		},
		{
			title: '操作',
			dataIndex: 'option',
			width: 'XS',
			fixed: 'right',
			render: (id, record) => {
				return (
					<div className='operation'>
						{access.resupply_setting_set && (
							<SettingModal
								trigger={<a>设置</a>}
								detail={record}
								onFinish={() => tableRef.current?.reload()}
							/>
						)}
						{(record.upperLimit || record.lowerLimit) && (
							<>
								<Divider type='vertical' />
								<span
									className='handleDanger'
									onClick={() => handleClear(record)}>
									清空
								</span>
							</>
						)}
					</div>
				);
			},
		},
	];

	const searchColumns: ProFormColumns = [
		{
			title: '所属库房',
			dataIndex: 'storageAreaId',
			valueType: 'select',
			hideInForm: WEB_PLATFORM !== 'DS',
			fieldProps: {
				showSearch: true,
				allowClear: false,
				options: list,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
				fieldNames: {
					label: 'name',
					value: 'id',
				},
			},
			formItemProps: {
				rules: [{ required: true, message: '请选所属库房' }],
			},
		},
		{
			title: `${fields.goods}状态`,
			dataIndex: 'enabled',
			valueType: 'select',
			fieldProps: {
				options: enabledStatus,
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
		},
		{
			title: fields.goodsProperty,
			dataIndex: 'highValue',
			valueType: 'select',
			fieldProps: {
				options: isHightValue,
			},
		},
	];

	return (
		<ProTable
			columns={columns}
			tableInfoCode='resupply_setting_list'
			api={goodsResupplyList}
			tableRef={tableRef}
			searchConfig={{
				form,
				columns: searchColumns,
			}}
			onReset={() => WEB_PLATFORM === 'DS' && tableRef.current?.setDataSource([])}
			loadConfig={{
				request: false,
				reset: WEB_PLATFORM === 'DS' ? false : true,
			}}
			rowKey='goodsId'
			// extraHeight={62}
		/>
	);
};

export default ResupplySetting;
