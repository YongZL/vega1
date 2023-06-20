import type { ProTableAction } from '@/components//ProTable/typings';
import Print from '@/components/print';
import Target from '@/components/print/department_return_order';
import { ProColumns } from '@/components/ProTable';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { timeType2 } from '@/constants';
import api from '@/constants/api';
import {
	departmentReturnStatusValueEnum,
	returnStatusDone,
	returnStatusPending,
} from '@/constants/dictionary';
import { useDepartmentList } from '@/hooks/useDepartmentList';
// import DetailModal from './Detail';
import DetailModal from '@/pages/department/return_purchase_department/list/components/Detail';
import { getDetail, getList } from '@/services/returnGoods';
import { getWarehouseListByIds } from '@/services/warehouse';
import { getUrlParam } from '@/utils';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Form } from 'antd';
import moment from 'moment';
import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { connect, history, useAccess, useModel } from 'umi';
interface OptionItem {
	id: number;
	name: string;
	nameAcronym: string;
}
export interface UpdateProps {
	pageType?: string;
	global: Record<string, any>;
	match: Record<string, any>;
	activeKey: string;
}
const PrintTarget = Print(Target);

const ReturnPurchaseDepartmentList: FC<UpdateProps> = ({ global, ...props }) => {
	const { pageType, activeKey } = props;
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const { fields } = useModel('fieldsMapping');
	const [orderId, setOrderId] = useState<string>('');
	const [warehouseList, setWarehouseList] = useState<Record<string, any>>([]);
	const [handleType, setHandleType] = useState<string>('');
	const [jumpSearch, setJumpSearch] = useState<boolean>(false);
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const access = useAccess();

	const departmentList = (useDepartmentList() || []).map((item) => {
		const { name, id, nameAcronym } = item;
		return { value: id, label: name, key: (nameAcronym || '') + '' + name };
	});

	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'statusList',
			valueType: 'tagSelect',
			fieldProps: {
				options: pageType === 'handle' ? returnStatusPending : returnStatusDone,
			},
		},
		{
			title: '申请时间',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType2,
			},
		},
		{
			title: '退货科室',
			dataIndex: 'departmentIds',
			valueType: 'select',
			fieldProps: {
				showSearch: true,
				options: departmentList,
				onChange: (value: string) => {
					getWarehouseList(value);
				},
				filterOption: (input: string, option: OptionItem) => {
					return option['data-item'].key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '退货仓库',
			dataIndex: 'warehouseId',
			valueType: 'select',
			fieldProps: {
				showSearch: true,
				options: warehouseList,
				filterOption: (input: string, option: OptionItem) => {
					return option['data-item'].key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '退货单号',
			dataIndex: 'code',
		},
		{
			title: fields.goodsCode,
			dataIndex: 'goodsCode',
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
		{
			title: '规格/型号',
			dataIndex: 'commonSearch.specificationAndModel',
		},
	];

	//退货仓库
	const getWarehouseList = async (id: string) => {
		form.resetFields(['warehouseId']);
		if (!id) {
			setWarehouseList([]);
			return;
		}
		const res = await getWarehouseListByIds({ departmentIds: id });
		if (res && res.code === 0) {
			let result = res.data.map((item) => {
				const { name, id, nameAcronym } = item;
				return { value: id, label: name, key: (nameAcronym || '') + '' + name };
			});
			setWarehouseList(result);
		}
	};

	// 列表
	const getFormList = () => {
		tableRef.current?.reload();
	};

	const showDetail = (record: ReturnGoodsController.ReturnGoodsRecord, type: string) => {
		setModalVisible(true);
		setHandleType(type);
		setOrderId(String(record.id));
	};

	// 消息
	const handleMsgPush = async () => {
		const { params } = props.match;
		if (params.id) {
			const { id, readOnly } = params;
			const res = await getDetail({ returnGoodsId: id });
			if (res && res.code === 0) {
				const order: any = res.data?.order;
				setOrderId(String(order.id));
				if (readOnly === 'true') {
					showDetail(order, 'detail');
				} else {
					switch (order.returnStatus) {
						case 'pending_confirm':
							showDetail(order, 'confirm');
							break;
						case 'pending_approve':
							showDetail(order, 'approve');
							break;
						default:
							showDetail(order, 'detail');
							break;
					}
				}
			}
		}
	};

	// 拆分全局搜索参数
	const handleOrderCodeChange = (code: string) => {
		if (code) {
			let status: any;
			if (code.indexOf('#') > -1) {
				let arr = code.split('#');
				code = arr[0];
				status = arr[1];
				form.setFieldsValue({
					code,
					statusList: status,
				});
				setTimeout(() => form.submit(), 200);
			} else if (code.indexOf('status') > -1) {
				status = getUrlParam(code, 'status');
				form.setFieldsValue({
					status: status.split(','),
				});
			}
			getFormList();
			setJumpSearch(true);
		}
	};
	// 获取全局搜索参数
	const getCode = () => {
		const hash = window.location.search;
		let code = undefined;
		if (hash.indexOf('search_key') > -1) {
			code = global.keywords;
		}
		if (hash.indexOf('search_link') > -1) {
			code = global.linkKeys;
		}
		if (hash.indexOf('status') > -1) {
			code = hash;
		}
		return code;
	};

	useEffect(() => {
		// 设置主页跳转状态
		const code = getCode();
		if (!jumpSearch) {
			handleOrderCodeChange(code);
		} else {
			getFormList();
		}
		handleMsgPush();
	}, []);
	useEffect(() => {
		const state = history?.location.state as { status: string; key: string; code: string };
		if (state?.status) {
			if (state?.key) {
				if (state.key === activeKey) {
					form.setFieldsValue({ statusList: state?.status, code: state?.code });
					setTimeout(() => form.submit(), 200);
				}
			} else {
				form.setFieldsValue({ statusList: state?.status, code: state?.code });
				setTimeout(() => form.submit(), 200);
			}
		}
	}, [history?.location.state]);
	useEffect(() => {
		if (window.location.hash) {
			const code = getCode();
			handleOrderCodeChange(code);
		}
	}, [window.location.hash]);

	const columns: ProColumns<ReturnGoodsController.ReturnGoodsRecord>[] = [
		{
			width: 'XXS',
			align: 'center',
			title: '序号',
			dataIndex: 'id',
			renderText: (text: string, record: Record<string, any>, index: number) => index + 1,
		},
		{
			width: 'XS',
			title: '状态',
			dataIndex: 'returnStatus',
			filters: false,
			valueEnum: departmentReturnStatusValueEnum,
		},
		{
			width: 'XXXL',
			title: '退货单号',
			dataIndex: 'code',
			copyable: true,
			ellipsis: true,
		},
		{
			width: 'M',
			ellipsis: true,
			title: '退货科室',
			dataIndex: 'departmentName',
		},
		{
			width: 'M',
			title: '退货仓库',
			dataIndex: 'warehouseName',
			ellipsis: true,
		},
		{
			width: 'XS',
			title: '申请人员',
			dataIndex: 'createdName',
			ellipsis: true,
		},
		{
			width: 'M',
			title: '联系方式',
			dataIndex: 'contactPhone',
			ellipsis: true,
		},
		{
			width: 'XL',
			title: '申请时间',
			dataIndex: 'timeCreated',
			sorter: true,
			key: 'timeCreated',
			renderText: (time: moment.MomentInput, record: Record<string, any>) =>
				record.timeCreated ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-',
		},
		{
			width: 'XS',
			title: '审核人员',
			dataIndex: 'approvedName',
			ellipsis: true,
		},
		{
			width: 'XL',
			title: '审核时间',
			dataIndex: 'timeApproved',
			sorter: true,
			key: 'timeApproved',
			renderText: (time: moment.MomentInput, record: Record<string, any>) =>
				record.timeApproved ? moment(record.timeApproved).format('YYYY/MM/DD HH:mm:ss') : '-',
		},
		{
			width: 'XS',
			title: '确认人员',
			dataIndex: 'confirmedName',
			ellipsis: true,
		},
		{
			width: 'XL',
			title: '确认时间',
			dataIndex: 'timeConfirmed',
			sorter: true,
			key: 'timeConfirmed',
			renderText: (time: moment.MomentInput, record: Record<string, any>) =>
				record.timeConfirmed ? moment(record.timeConfirmed).format('YYYY/MM/DD HH:mm:ss') : '-',
		},
		{
			width: 'XL',
			title: '操作',
			dataIndex: 'option',
			valueType: 'option',
			fixed: 'right',
			render: (_: ReactNode, record) => (
				<>
					{(pageType === 'handle'
						? access.department_return_goods_view
						: access.return_department_goods_view) && (
						<a onClick={() => showDetail(record, 'detail')}>查看</a>
					)}
					{record.returnStatus === 'pending_confirm' && access.department_return_goods_confirm && (
						<>
							<Divider type='vertical' />
							<a onClick={() => showDetail(record, 'confirm')}>确认</a>
						</>
					)}
					{record.returnStatus === 'pending_approve' && access.department_return_goods_check && (
						<>
							<Divider type='vertical' />
							<a onClick={() => showDetail(record, 'approve')}>审核</a>
						</>
					)}
					{record.returnStatus === 'pending_return' &&
						access.department_return_goods_delivered &&
						!record.timeDelivered && (
							<>
								<Divider type='vertical' />
								<a onClick={() => showDetail(record, 'confirmDelivered')}>确认送达</a>
							</>
						)}
					{['pending_return', 'return_finished'].includes(record.returnStatus as string) &&
						access.code_print &&
						record.timeDelivered && (
							<>
								<Divider type='vertical' />
								<a onClick={() => showDetail(record, 'print')}>赋码</a>
							</>
						)}
					{['pending_return', 'return_finished'].includes(record.returnStatus as string) &&
						(pageType === 'handle'
							? access.department_return_goods_print
							: access.department_check_return_goods_print) &&
						record.timeDelivered && (
							<>
								<Divider type='vertical' />
								<PrintTarget
									url={api.return_purchase.detail}
									params={{ returnGoodsId: record.id }}
								/>
							</>
						)}
				</>
			),
		},
	];
	return (
		<>
			<ProTable
				tableInfoCode={
					pageType === 'handle'
						? 'handle_department_return_goods_list'
						: 'query_department_return_goods_list'
				}
				loadConfig={{
					request: false,
				}}
				api={getList}
				rowKey='id'
				columns={columns}
				searchConfig={{
					columns: searchColumns,
					form: form,
				}}
				searchKey={pageType === 'handle' ? 'department_return_goods' : 'department_return_query'}
				dateFormat={{
					timeCreated: {
						endKey: 'end',
						startKey: 'start',
					},
				}}
				toolBarRender={() => [
					access.department_add_return_goods && pageType === 'handle' && (
						<Button
							icon={<PlusOutlined style={{ marginLeft: -4 }} />}
							type='primary'
							onClick={() => {
								history.push('/department/return_processing/return_purchase_department_add');
							}}
							className='iconButton'>
							发起退货
						</Button>
					),
				]}
				beforeSearch={(value: Record<string, any>) => {
					const { statusList } = value;
					const params = {
						...value,
						pageType,
						level: 1,
						statusList: statusList ? statusList.toString() : undefined,
					};
					return params;
				}}
				tableRef={tableRef}
			/>

			{modalVisible && (
				<DetailModal
					isOpen={modalVisible}
					setIsOpen={setModalVisible}
					handleType={handleType}
					orderId={orderId}
					getFormList={() => getFormList()}
				/>
			)}
		</>
	);
};

export default connect(({ global }: { global: Record<string, any> }) => ({ global }))(
	ReturnPurchaseDepartmentList,
);
