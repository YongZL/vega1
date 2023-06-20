import ProTable from '@/components/ResizableTable';
import { ProFormColumns } from '@/components/SchemaForm';
import { batchGoods, searchGoodsList } from '@/services/department';
import { getAllManufacturers } from '@/services/manufacturer';
import { formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Form, Modal, Tooltip } from 'antd';

import { cloneDeep } from 'lodash';
import { FC, ReactNode, useState } from 'react';
import { useModel } from 'umi';
import style from '../index.less';

interface Props {
	isOpen?: boolean;
	setIsOpen?: any;
	getFormList?: () => void;
	departmentId?: number;
	departmentName?: string;
}

type bindGoods = DepartmentController.DepartmentGoodsAdd;

const AddGoods: FC<Props> = ({
	isOpen,
	setIsOpen,
	departmentId,
	departmentName,
	getFormList = () => {},
}) => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const [selectedRow, setselectedRow] = useState<bindGoods[]>([]);
	const [selectRowKey, setSelectRowKey] = useState<number[]>([]);

	let columns = [
		{
			title: fields.goodsName,
			width: 'XL',
			dataIndex: 'goodsName',
			key: 'goodsName',
			ellipsis: true,
		},
		{
			title: fields.goodsCode,
			width: 'XL',
			dataIndex: 'materialCode',
			key: 'materialCode',
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 'L',
			ellipsis: true,
			render: (_text: ReactNode, record: DepartmentController.DepartmentGoodsAdd) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '本地医保编码',
			width: 'L',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			ellipsis: true,
		},
		{
			title: '生产厂家',
			width: 'M',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			renderText: (text: any) => {
				return (
					<Tooltip
						placement='topLeft'
						title={text}>
						<div
							style={{
								textAlign: 'left',
								marginLeft: 30,
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
							}}>
							{text}
						</div>
					</Tooltip>
				);
			},
		},
	];

	const del = (record: bindGoods) => {
		let index = selectRowKey.findIndex((item: number) => item === record.goodsId);
		const rowKeys = cloneDeep(selectRowKey);
		const rows = cloneDeep(selectedRow);
		rowKeys.splice(index, 1);
		rows.splice(index, 1);
		setSelectRowKey(rowKeys);
		setselectedRow(rows);
	};

	let obj: any = {
		title: '操作',
		dataIndex: 'option',
		key: 'option',
		fixed: 'right',
		width: 'XXS',
		render: (_text: ReactNode, record: bindGoods) => {
			return (
				<span
					className='handleLink'
					onClick={() => del(record)}>
					删除
				</span>
			);
		},
	};
	let indexObj: any = {
		title: '序号',
		dataIndex: 'index',
		align: 'center',
		key: 'index',
		render: (_text?: ReactNode, _redord?: ReactNode, index?: any) => <span>{index + 1}</span>,
		width: 'XXXS',
	};

	let selectColumn = columns;
	if (selectRowKey.length) {
		selectColumn = columns.concat(obj);
		selectColumn.unshift(indexObj);
	}

	const changeSelect = (keys: React.Key[], list: bindGoods[]) => {
		setselectedRow(list);
		setSelectRowKey(keys as number[]);
	};

	// 取消
	const handleCancel = () => {
		setIsOpen(false);
		form.resetFields();
	};

	//提交
	const handleSubmit = async () => {
		if (selectRowKey.length == 0) {
			notification.warning(`请选择需要绑定的${fields.baseGoods}！`);
			return;
		}
		let parmas = { departmentId: Number(departmentId) };
		parmas['goodsIds'] = selectRowKey;
		const res = await batchGoods(parmas);
		if (res && res.code == 0) {
			notification.success('操作成功！');
			getFormList();
			setIsOpen(false);
			form.resetFields();
		}
	};

	const searchGoodsColumns: ProFormColumns = [
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
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
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerId',
			valueType: 'apiSelect',
			fieldProps: {
				api: getAllManufacturers,
				fieldConfig: {
					label: 'companyName',
					value: 'id',
				},
				filterOption: (input: any, option: any) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
	];

	return (
		<Modal
			visible={isOpen}
			title={`${departmentName}绑定${fields.baseGoods}`}
			width={'69%'}
			onCancel={handleCancel}
			onOk={handleSubmit}
			bodyStyle={{ padding: '30px 25px' }}
			style={{ top: 10 }}
			className={style.departmentWrap}>
			<>
				<div className={style.tabeleStyles}>
					<div style={{ paddingBottom: 10 }}>
						<div className='main-page'>
							<ProTable<DepartmentController.DepartmentGoodsAdd>
								tableInfoCode='department_goods_add_up_list'
								search={false}
								rowSelection={{
									preserveSelectedRowKeys: true,
									selectedRowKeys: selectRowKey,
									onChange: changeSelect,
								}}
								searchConfig={{
									columns: searchGoodsColumns,
								}}
								api={searchGoodsList}
								columns={columns}
								rowKey={(record: any) => record.goodsId}
								params={{
									isCombinedDevelopment: false,
									IsCombined: false,
									departmentId,
								}}
								tableAlertRender={false}
								scroll={{
									y: 300,
								}}
							/>
						</div>
						<div style={{ paddingTop: 10, borderTop: `1px solid ${CONFIG_LESS['@bd_C4C4C4']}` }}>
							<ProTable
								tableInfoCode='department_goods_add_down_list'
								headerTitle={<span>已选中{fields.baseGoods}：</span>}
								search={false}
								columns={selectColumn}
								dataSource={selectedRow}
								rowKey={(record: any) => record.goodsId}
								scroll={{
									y: 300,
								}}
								loading={false}
								pagination={{
									defaultPageSize: 10,
									showSizeChanger: false,
									showTotal: (total: any) => {
										return <span style={{ position: 'absolute', left: 0 }}>共 {total} 条</span>;
									},
								}}
							/>
						</div>
					</div>
				</div>
			</>
		</Modal>
	);
};
export default AddGoods;
