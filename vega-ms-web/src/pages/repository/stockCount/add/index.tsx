import type { MutableRefObject } from 'react';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import ProTable from '@/components/ResizableTable';
import React, { useState, useEffect, cloneElement } from 'react';
import { transformSBCtoDBC, accessNameMap } from '@/utils';
import { Modal, Form, Select, Button, Tag } from 'antd';

import '@ant-design/compatible/assets/index.css';
import moment from 'moment';
import { formatStrConnect } from '@/utils/format';
import { Tips } from '@/components/GetNotification';
import ReasonEditor from '../components/ReasonEditor';
import { useModel } from 'umi';
import { Rule } from 'antd/lib/form';
import { getStockTakingGoods, generateStockTakingOrder } from '@/services/stockTakingOrder';
import { getAll } from '@/services/storageAreas';
import { stockCountGoodsStatus } from '@/constants/dictionary';
import { notification } from '@/utils/ui';

// const FormItem = Form.Item;

export interface UpdateProps {
	trigger: JSX.Element;
	tableRef: MutableRefObject<ProTableAction>;
}

const AddModal: React.FC<UpdateProps> = (props) => {
	const { fields } = useModel('fieldsMapping');
	const [form] = Form.useForm();
	const [modalAddVisible, setModalAddVisible] = useState<boolean>(false);
	const { trigger, tableRef } = props;
	const accessNameMaplist: Record<string, any> = accessNameMap();

	const [selectList, setSelectList] = useState<number[]>([]);

	// 关闭弹窗
	const modalCancel = (update: boolean) => {
		setModalAddVisible(false);
		setSelectList([]);
		form.resetFields();
		if (update) {
			tableRef.current?.reload();
		}
	};

	const selectionSelect = (record: any, selected: boolean) => {
		if (setSelectList) {
			if (selected) {
				setSelectList([...selectList, record.id]);
			} else {
				setSelectList(selectList.filter((item) => item !== record.id));
			}
		}
	};
	const selectionSelectAll = (selected: boolean, selectedRows: any[], changeRows: any[]) => {
		const ids = changeRows.filter((item) => !!item).map((item) => item.id);
		if (setSelectList) {
			if (selected) {
				setSelectList(Array.from(new Set(selectList.concat(ids))));
			} else {
				setSelectList(selectList.filter((item) => !ids.includes(item)));
			}
		}
	};

	// 确认操作
	const confirmOption = async () => {
		if (!selectList.length) {
			notification.error('请勾选需要盘点的物资');
			return;
		}
		const formData = form.getFieldsValue();
		const params = {
			goodsIds: selectList,
			storageAreaId: formData.storageAreaId,
		};
		const res = await generateStockTakingOrder(params);
		if (res.code === 0) {
			notification.success('操作成功！');
			modalCancel(true);
		}
	};

	// 提示
	const showInputTips = () => {
		if (selectList.length) {
			notification.error('请取消勾选盘点物资后更改盘点仓库');
			return;
		}
	};

	// 重置回调
	const searchReset = () => {
		setSelectList([]);
	};
	// 搜索回调
	const stockChange = (num: any) => {
		if (num) {
			form.resetFields();
			form.setFieldsValue({
				storageAreaId: num,
			});
			form.submit();
		}
	};

	let columns: ProColumns<StockTakingOrderController.GetDetailRuleParams>[] = [
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 120,
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			key: 'name',
			width: 150,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			ellipsis: true,
			render: (text: any, record: Record<string, any>) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			width: 150,
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			ellipsis: true,
		},
		{
			title: '单位',
			dataIndex: 'unit',
			key: 'unit',
			width: 110,
		},
		{
			title: '上次盘点时间',
			dataIndex: 'lastStockTakingTime',
			width: 150,
			renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
		},
		{
			title: '物资流转情况',
			dataIndex: 'stateOfFlow',
			key: 'stateOfFlow',
			width: 120,
			renderText: (text: boolean) => (
				<Tag color={stockCountGoodsStatus[text + ''].color}>
					{stockCountGoodsStatus[text + ''].label}
				</Tag>
			),
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 150,
			ellipsis: true,
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			key: 'nationalNo',
			width: 120,
			ellipsis: true,
		},
	];

	const searchColumns: ProFormColumns<StockTakingOrderController.GetListRuleParams> = [
		{
			title: '盘点仓库',
			dataIndex: 'storageAreaId',
			valueType: 'apiSelect',
			fieldProps: {
				api: getAll,
				fieldConfig: {
					label: 'name',
					value: 'id',
				},
				onChange: stockChange,
				onClick: showInputTips,
				disabled: selectList.length !== 0,
				pagination: false,
				filterOption: (input: any, option: any) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
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
			title: '规格/型号',
			dataIndex: 'specificationOrModel',
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
		},
	];

	const searchRules: Record<string, Rule[]> = {
		storageAreaId: [{ required: true, message: '请选择盘点仓库' }],
	};

	return (
		<>
			{cloneElement(trigger, {
				onClick: () => {
					setModalAddVisible(true);
				},
			})}
			{modalAddVisible && (
				<Modal
					visible={modalAddVisible}
					width='80%'
					maskClosable={false}
					title={accessNameMaplist.add_stock_taking_order}
					onCancel={() => modalCancel(false)}
					className='ant-detail-modal'
					footer={
						<>
							<Button onClick={() => modalCancel(false)}>取消</Button>

							<Button
								type='primary'
								style={{
									backgroundColor: !selectList.length
										? CONFIG_LESS['@c_disabled']
										: CONFIG_LESS['@primary-color'],
									borderColor: !selectList.length
										? CONFIG_LESS['@c_disabled']
										: CONFIG_LESS['@primary-color'],
								}}
								onClick={confirmOption}>
								确认操作
							</Button>
						</>
					}>
					<ProTable
						rowKey='id'
						tableInfoCode='add_stock_taking_order'
						headerTitle={
							<Tips
								text='*请勾选物资后点击“确认操作”按钮'
								headerTitle={undefined}
							/>
						}
						loadConfig={{
							request: false,
						}}
						columns={columns}
						api={getStockTakingGoods}
						paramsToString={['typeList']}
						searchConfig={{
							form,
							rules: searchRules,
							columns: searchColumns,
							onReset: searchReset,
						}}
						rowSelection={{
							selectedRowKeys: selectList,
							onSelect: selectionSelect,
							onSelectAll: selectionSelectAll,
						}}
						scroll={{
							y: 300,
						}}
						toolBarRender={() => [
							<ReasonEditor>
								<Button type='primary'>盈亏原因编辑</Button>
							</ReasonEditor>,
						]}
					/>
				</Modal>
			)}
		</>
	);
};

export default AddModal;
