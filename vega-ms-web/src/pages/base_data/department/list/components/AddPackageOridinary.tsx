import { ProColumns } from '@/components/ProTable';
import ProTable from '@/components/ResizableTable';

import { ProFormColumns } from '@/components/SchemaForm';
import { ordinaryList } from '@/services/ordinary';
import { partmentBindOrdinary } from '@/services/partmentBindOrdinary';
import { notification } from '@/utils/ui';
import { Form, Modal } from 'antd';

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

type bindOrdinary = OrdinaryController.Ordinary_List;

const AddPackageOridinary: FC<Props> = ({
	isOpen,
	setIsOpen,
	departmentId,
	departmentName,
	getFormList = () => {},
}) => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const [selectedRow, setselectedRow] = useState<bindOrdinary[]>([]);
	const [selectRowKey, setSelectRowKey] = useState<number[]>([]);

	let columns: ProColumns<bindOrdinary>[] = [
		{
			title: '医耗套包编号',
			width: 'L',
			dataIndex: 'ordinaryCode',
			key: 'ordinaryCode',
			ellipsis: true,
		},
		{
			title: '医耗套包名称',
			width: 'L',
			dataIndex: 'name',
			key: 'name',
			ellipsis: true,
			renderText: (text: ReactNode) => text,
		},
		{
			title: '医耗套包说明',
			width: 'L',
			dataIndex: 'detailGoodsMessage',
			key: 'detailGoodsMessage',
			render: (_text: ReactNode, record: OrdinaryController.OrdinaryList) => {
				const { description, detailGoodsMessage } = record;
				return (
					<div
						className='detailGoodsMessage'
						title={description || detailGoodsMessage}>
						{description || detailGoodsMessage}
					</div>
				);
			},
		},
	];

	const del = (record: bindOrdinary) => {
		let index = selectRowKey.findIndex((item: number) => item === record.id);
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
		render: (_text: ReactNode, record: bindOrdinary) => {
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

	const changeSelect = (keys: React.Key[], list: bindOrdinary[]) => {
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
			notification.warning('请选择需要绑定的医耗套包 ！');
			return;
		}
		let parmas = { departmentId: Number(departmentId) };
		parmas['ordinarys'] = selectRowKey;
		const res = await partmentBindOrdinary(parmas);
		if (res && res.code == 0) {
			notification.success('操作成功！');
			getFormList();
			setIsOpen(false);
			form.resetFields();
		}
	};

	const searchOrdinaryColumns: ProFormColumns = [
		{
			title: '医耗套包编号',
			dataIndex: 'ordinaryCode',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '医耗套包名称',
			dataIndex: 'ordinaryName',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			fieldProps: {
				placeholder: '请输入',
			},
		},
	];

	return (
		<Modal
			visible={isOpen}
			title={`${departmentName}绑定医耗套包`}
			width='69%'
			onCancel={handleCancel}
			onOk={handleSubmit}
			bodyStyle={{ padding: '30px 25px' }}
			style={{ top: 10 }}
			className={style.departmentWrap}>
			<>
				<div className={style.tabeleStyles}>
					<div style={{ paddingBottom: 10 }}>
						<div className='main-page'>
							<ProTable<OrdinaryController.Ordinary_List | DepartmentController.DepartmentGoodsAdd>
								tableInfoCode='department_ordinary_add_up_list'
								search={false}
								rowSelection={{
									preserveSelectedRowKeys: true,
									selectedRowKeys: selectRowKey,
									onChange: changeSelect,
								}}
								searchConfig={{
									columns: searchOrdinaryColumns,
								}}
								api={ordinaryList}
								columns={columns}
								rowKey={(record: any) => record.id}
								params={{
									departmentAdd: 'true',
									departmentId,
								}}
								tableAlertRender={false}
								scroll={{
									y: 300,
								}}
							/>
						</div>
						<div style={{ paddingTop: 10, borderTop: `1px solid  ${CONFIG_LESS['@bd_C4C4C4']}` }}>
							<ProTable
								headerTitle={<span>已选中医耗套包：</span>}
								tableInfoCode='department_ordinary_add_down_list'
								search={false}
								columns={selectColumn}
								dataSource={selectedRow}
								rowKey={(record: any) => record.id}
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
export default AddPackageOridinary;
