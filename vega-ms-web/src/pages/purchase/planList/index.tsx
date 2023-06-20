import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';
import type { ProFormColumns } from '@/components//SchemaForm/typings';
import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ResizableTable';
import { timeType } from '@/constants';
import {
	purchasePlanStatusCommit2,
	purchasePlanStatusCommit3,
	purchasePlanStatusValueEnum,
	purchasePlanType,
	purchasePlanTypeTextMap,
} from '@/constants/dictionary';
import { queryDepartmentList } from '@/services/department';
import { getListByUser } from '@/services/distributor';
import {
	auditPurchasePlan,
	cancelAudit,
	deletePurchasePlan,
	exportPurchasePlanUrl,
	postDoCommit,
	queryPurchasePlanDetail,
	queryPurchasePlanList,
} from '@/services/purchasenew';
import { sortListByLevel } from '@/services/storageAreas';
import { dealPackNum } from '@/utils/dataUtil';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import { Badge, Button, Divider, Form, Input, message, Popconfirm, Select, Space } from 'antd';
import { unionBy } from 'lodash';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import { connect, history, useAccess, useModel } from 'umi';
import DetailModal from './components/DetailModal';

type PageProps = {
	global: Record<string, any>;
	match: Record<string, any>;
	pageType: string;
	activeKey: string;
};
const FormItem = Form.Item;
const PurchasePlan = ({ global, match, pageType, activeKey }: PageProps) => {
	const [form] = Form.useForm();
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const formRef: any = useRef();
	const [confirmType, setConfirmType] = useState('');
	const [jumpSearch, setJumpSearch] = useState<boolean>(false);
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [list, setList] = useState<PurchaseNewController.WithPageListRecord[]>([]);
	const [selectList, setSelectList] = useState<PurchaseNewController.WithPageListRecord[]>([]);
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	const [detailProps, setDetailProps] = useState<Partial<PurchaseNewController.DetailPropsType>>(
		{},
	);
	const [isExportFile, setIsExportFile] = useState(false);
	const isHandlePage = pageType === 'handle';
	const isCommit = global?.config['purchase_plan_auto_commit'] === 'true';
	const handledGenerate = access['handled_generate_purchase_order']; //已处理生成的采购订单
	const handledCommit = access['handled_commit_purchase_plan']; //已处理生成的采购计划
	const handledApproval = access['handled_approval_purchase_plan'];
	const newDictionary = JSON.parse(sessionStorage.getItem('newDictionary') || '{}');

	const resetSelectedData = useCallback((id: number) => {
		setSelectList((list) => [...list.filter((item: { id: number }) => item.id !== id)]);
		setSelectedRowKeys((keys) => [...keys.filter((key) => key !== id)]);
	}, []);

	// 拆分全局搜索参数
	const handleOrderCodeChange = (code: string) => {
		if (code) {
			if (code.indexOf('#') > -1) {
				const arr = code.split('#');
				code = arr[0];
				const status = arr[1];
				form.setFieldsValue({
					code,
					status: [status],
				});
			}
			setJumpSearch(true);
		}
	};

	const getCode = () => {
		const hash = window.location.search;
		let code = undefined;
		if (hash) {
			if (hash.indexOf('search_key') > -1) {
				code = global.keywords;
			}
			if (hash.indexOf('search_link') > -1) {
				code = global.linkKeys;
			}
			if (hash.indexOf('status') > -1) {
				code = hash;
			}
		}
		return code;
	};

	useEffect(() => {
		// 设置主页跳转状态
		const code = getCode();
		if (!jumpSearch) handleOrderCodeChange(code);
		handleMsgPush();
	}, []);
	useEffect(() => {
		const state = history?.location.state as { status: string; key: string };
		if (state?.status) {
			if (state?.key) {
				if (state.key === activeKey) {
					form.setFieldsValue({ statusList: state?.status });
					setTimeout(() => form.submit(), 200);
				}
			} else {
				form.setFieldsValue({ statusList: state?.status });
				setTimeout(() => form.submit(), 200);
			}
		}
	}, [history?.location.state]);

	// purchase_plan delete提交作废
	const modalDel = (id: number) => {
		setConfirmType('delete');
		deletePurchasePlan({ id }).then((res) => {
			if (res && res.code === 0) {
				notification.success('操作成功！');
				tableRef.current?.reload();
				resetSelectedData(id);
			}
		});
		setConfirmType('');
	};

	const resetData = () => {
		setSelectedRowKeys([]);
		setSelectList([]);
		setModalVisible(false);
		tableRef.current?.reload();
	};

	// 获取采购计划商品详情
	const getPurchasePlanDetail = async (
		record: Record<string, any>,
		modalType: string,
		e?: Record<string, any>,
	) => {
		const { id } = record;
		e && e.stopPropagation();
		const res = await queryPurchasePlanDetail({ id });
		if (res && res.code == 0) {
			const { details, planVo } = res.data;
			setDetailProps({
				modalType,
				resetData,
				data: details,
				modalVisible: true,
				setModalVisible,
				detailInfo: record,
				target: planVo.id,
			});
			setModalVisible(true);
		}
	};

	// 订单消息推送
	const handleMsgPush = async () => {
		const { params } = match;
		if (params.id) {
			const { id, readOnly } = params;
			const res = await queryPurchasePlanDetail({ id });
			if (res && res.code === 0) {
				const { planVo: detail } = res.data;
				const { status } = detail;
				const type = readOnly !== 'true' && status === 'approval_pending' ? 'audit' : 'view';
				getPurchasePlanDetail(detail, type);
			}
		}
	};

	// 审核通过/不通过
	const planApproval = async (target: any, status: boolean) => {
		setConfirmType('approval');
		let details: Record<string, any>[] = [];
		if (!target) {
			let allList: Record<string, any>[] = selectList;
			for (const index in allList) {
				const result = allList[index].distributorBeans;
				const id = result && result.length && result[0].id;
				if (result && result.length === 1) allList[index].selectedRow = id;
				const exit = allList[index].selectedRow;
				if (!exit) {
					notification.warning(`请先选择${fields.distributor}!`);
					return false;
				}
				details = allList;
			}
		}
		if (
			target &&
			(target.distributorBeans !== null ? target.distributorBeans.length > 1 : true) &&
			status &&
			!target.selectedRow
		) {
			notification.warning(`请先选择${fields.distributor}!`);
			setConfirmType('');
			return false;
		}
		const { id, goodsId } = target || {};

		if (!target) {
			target = details.map((item) => {
				return { planId: item.id, goodsId: item.goodsId, distributorId: item.selectedRow };
			});
		} else {
			target = [
				{
					planId: id,
					goodsId: goodsId,
					distributorId:
						target.distributorBeans.length === 1
							? target.distributorBeans[0].id
							: target.selectedRow,
				},
			];
		}

		const reason = formRef.current?.getFieldValue('info.reason');
		const params: Record<string, any> = {
			status,
			reason,
			goodsRelationDistributorDtos: target || '',
			target: details.length ? details.map((item) => item.id) : [id],
		};
		const res = await auditPurchasePlan(params);
		if (res && res.code === 0) {
			notification.success('操作成功');
			resetData();
			tableRef.current?.reload();
		}
		setConfirmType('');
	};

	const onSelected = (id: number, recordId: number) => {
		const selected = list.map((item) =>
			item.id === recordId ? { ...item, selectedRow: id, isSelected: true } : { ...item },
		);
		tableRef.current?.setDataSource(selected);
		const selectRowKeysList = selectList.map((item) => {
			return item.id === recordId ? { ...item, selectedRow: id, isSelected: true } : { ...item };
		});
		setList([...selected]);
		setSelectList([...selectRowKeysList]);
	};

	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'statusList',
			valueType: 'tagSelect',
			fieldProps: {
				options: isHandlePage
					? global.config?.purchase_plan_auto_commit === 'false' // 当自动配货配置项开启时，没有待提交状态
						? purchasePlanStatusCommit2.filter((item) => item.value !== 'commit_pending')
						: purchasePlanStatusCommit2
					: purchasePlanStatusCommit3,
			},
		},
		{
			title: '申请时间',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType,
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			title: fields.goodsName,
			dataIndex: 'planName',
		},
		{
			title: '申请单号',
			dataIndex: 'planCode',
		},
		{
			title: '申请科室',
			dataIndex: 'departmentIds',
			valueType: 'apiSelect',
			fieldProps: {
				api: queryDepartmentList,
				fieldConfig: {
					label: 'departmentName',
					value: 'departmentId',
				},
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorId',
			valueType: 'apiSelect',
			fieldProps: {
				api: getListByUser,
				params: { pageSize: 999, pageNum: 0 },
				fieldConfig: {
					label: 'companyName',
					value: 'id',
				},
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '采购类型',
			dataIndex: 'type',
			valueType: 'select',
			fieldProps: {
				options: purchasePlanType,
			},
		},
		{
			title: '订单编号',
			dataIndex: 'orderCode',
		},
		{
			title: fields.goodsType,
			dataIndex: 'materialCategory',
			valueType: 'select',
			fieldProps: {
				options: newDictionary.material_category,
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
		},

		{
			title: 'DI',
			dataIndex: 'diCode',
		},
		{
			title: '品牌',
			dataIndex: 'brand',
		},
		{
			title: '规格/型号',
			dataIndex: 'commonSearch.specificationAndModel',
		},
		{
			title: '配货库房',
			dataIndex: 'areaIdList',
			valueType: 'apiSelect',
			hideInForm: WEB_PLATFORM !== 'DS',
			fieldProps: {
				placeholder: '',
				showSearch: true,
				allowClear: true,
				api: sortListByLevel,
				fieldConfig: {
					label: 'name',
					value: 'id',
					key: 'name',
				},
				params: { isCurrentUser: true, pageNum: undefined, pageSize: undefined },
				filterOption: (input: any, option: any) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
	];

	const columns: ProColumns<PurchaseNewController.WithPageListRecord>[] = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			renderText: (text: string, record, index: number) => <span>{index + 1}</span>,
		},
		{
			width: 'S',
			title: '状态',
			dataIndex: 'status',
			filters: false,
			valueEnum: purchasePlanStatusValueEnum,
		},
		{
			width: 'S',
			title: '是否加急',
			dataIndex: 'isUrgent',
			key: 'plan.is_urgent',
			ellipsis: true,
			sorter: true,
			renderText: (text: boolean) => (
				<span>
					{text ? (
						<Badge
							color={CONFIG_LESS['@c_starus_warning']}
							status='warning'
							text='加急'
						/>
					) : (
						'-'
					)}
				</span>
			),
		},
		{
			width: 'M',
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			renderText: (text: string) => <span>{text ? text : '-'}</span>,
			ellipsis: true,
		},
		{
			width: 'XL',
			title: fields.goodsName,
			dataIndex: 'planName',
			ellipsis: true,
		},
		{
			width: 'XXL',
			title: fields.distributor,
			dataIndex: 'supplierName',
			ellipsis: true,
			renderText: (text: string, record) => {
				const { distributorBeans, status, distributorName } = record;
				const length = distributorBeans && distributorBeans.length;
				if (isHandlePage) {
					// 采购处理
					if (['approval_success', 'finished'].includes(status)) {
						return <span>{distributorName}</span>;
					} else {
						return length === 1 ? (
							<span>{distributorBeans[0].companyName}</span>
						) : (
							<Select
								value={record.selectedRow}
								style={{ width: 180 }}
								onClick={(e) => e.stopPropagation()}
								onSelect={(e: any) => onSelected(e, record.id)}
								disabled={status !== 'approval_pending'}>
								{(distributorBeans || []).map((item) => {
									const { id, companyName } = item;
									return (
										<Select.Option
											key={id}
											value={id}>
											{companyName}
										</Select.Option>
									);
								})}
							</Select>
						);
					}
				} else {
					// 采购查询
					return (
						<span>
							{length ? distributorBeans.map((item) => item.companyName).toString() : '-'}
						</span>
					);
				}
			},
		},
		{
			title: `配货库房`,
			dataIndex: 'storageAreaName',
			width: 'L',
			hideInTable: WEB_PLATFORM !== 'DS',
			renderText: (text, render) => {
				return text && text.slice(text.length - 1) == ';' ? text.slice(0, text.length - 1) : text;
			},
		},
		{
			width: 'M',
			title: 'DI',
			dataIndex: 'diCode',
			ellipsis: true,
		},
		{
			width: 'M',
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			ellipsis: true,
		},
		{
			width: 'M',
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			key: 'nationalNo',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			width: 'XS',
			title: fields.goodsType,
			dataIndex: 'materialCategory',
		},
		{
			width: 'XS',
			title: '品牌',
			dataIndex: 'brand',
			ellipsis: true,
		},
		{
			width: 'XS',
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price' + 'id',
			align: 'right',
			renderText: (text: string) => convertPriceWithDecimal(text),
		},
		{
			width: 'S',
			title: '申请数量',
			dataIndex: 'quantity',
			renderText: (text: string, record) => <span>{text + record.unit}</span>,
		},
		{
			width: 'S',
			title: '可用库存',
			dataIndex: 'availableStock',
			renderText: (text: string, record) => <span>{text || 0}</span>,
		},
		{
			width: 'S',
			title: '大/中包装',
			dataIndex: 'unitQuantity',
			renderText: (text: string, record) => dealPackNum(record.largeBoxNum, text),
		},
		{
			width: 'XS',
			title: '总价(元)',
			dataIndex: 'price',
			align: 'right',
			renderText: (text: number, record) => convertPriceWithDecimal(text * record.quantity),
		},
		{
			width: 'XL',
			title: '申请科室',
			dataIndex: 'departmentName',
			ellipsis: true,
		},
		{
			width: 'XL',
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			ellipsis: true,
		},
		{
			width: 'S',
			title: '采购类型',
			dataIndex: 'type',
			renderText: (text: string) => <span>{purchasePlanTypeTextMap[text]}</span>,
		},
		{
			width: 'XL',
			title: '期望到货时间',
			dataIndex: 'timeExpected',
			key: 'plan.time_expected',
			ellipsis: true,
			sorter: true,
			renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
		},
		{
			width: 'XL',
			title: '申请时间',
			dataIndex: 'timeCreated',
			key: 'plan.time_created',
			sorter: true,
			renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
		},
		{
			width: 'M',
			title: '请领人员',
			dataIndex: 'createdName',
		},
		{
			width: 'XL',
			title: '请领时间',
			dataIndex: 'ogrCreatedTime',
			renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
		},
		{
			width: 'M',
			title: '审核人员',
			dataIndex: 'approvalName',
		},
		{
			width: 'XL',
			title: '审核时间',
			dataIndex: 'approvalTime',
			renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
		},
		{
			width: 'M',
			title: '复核人员',
			dataIndex: 'approvalReviewName',
		},
		{
			width: 'XL',
			title: '复核时间',
			dataIndex: 'approvalReviewTime',
			renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
		},
		{
			width: 'XXXL',
			title: '申请单号',
			dataIndex: 'planCode',
			copyable: true,
		},
		{
			width: 'XXXL',
			title: '订单编号',
			dataIndex: 'orderCode',
			copyable: true,
		},
		{
			width: 'XXL',
			title: '操作',
			dataIndex: 'operation',
			key: 'operation',
			fixed: 'right',
			render: (_, record) => {
				const { status, type } = record;
				return (
					<div
						className='operation'
						onClick={(e) => e.stopPropagation()}>
						<Space
							size={0}
							split={<Divider type='vertical' />}
							wrap={true}>
							{((isHandlePage && access['handled_purchase_plan_view']) ||
								(!isHandlePage && access['query_purchase_plan_view'])) && (
								<span
									className='handleLink'
									onClick={(event) => getPurchasePlanDetail(record, 'view', event)}>
									查看
								</span>
							)}

							{(status === 'commit_pending' || status === 'approval_pending') &&
								isHandlePage &&
								access['handled_edit_purchase_plan'] && (
									<span
										className='handleLink'
										onClick={(event) => handleModal('edit', record.id)}>
										编辑
									</span>
								)}
							{handledCommit && status === 'commit_pending' && (
								<Popconfirm
									placement='left'
									title='提交后不能撤回，请确认是否提交？'
									onConfirm={() => {
										doCommit([record.id]);
									}}
									disabled={confirmType === 'commit'}
									okButtonProps={{ loading: confirmType === 'commit' }}>
									<span className='handleLink'>提交</span>
								</Popconfirm>
							)}
							{handledApproval && status === 'approval_pending' && (
								<>
									<Popconfirm
										placement='left'
										title='请确认是否通过？'
										onConfirm={() => {
											planApproval(record, true);
										}}
										disabled={confirmType === 'approval'}
										okButtonProps={{ loading: confirmType === 'approval' }}>
										<span className='handleLink'>通过</span>
									</Popconfirm>
									<Popconfirm
										title={
											<Form ref={formRef}>
												<FormItem
													label=''
													name='info.reason'
													initialValue={''}
													style={{ marginBottom: 0 }}>
													<Input
														placeholder='拒绝原因'
														maxLength={100}
														onClick={(e) => e.stopPropagation()}
													/>
												</FormItem>
											</Form>
										}
										onConfirm={(e: any) => {
											e.stopPropagation();
											planApproval(record, false);
										}}
										onCancel={(e: any) => {
											e.stopPropagation();
											formRef.current.resetFields();
										}}
										disabled={confirmType === 'approval'}
										okButtonProps={{ loading: confirmType === 'approval' }}>
										<span
											className='handleLink'
											onClick={(e) => e.stopPropagation()}>
											拒绝
										</span>
									</Popconfirm>
								</>
							)}
							{((status === 'approval_pending' &&
								!isCommit &&
								access['handled_delete_purchase_plan']) ||
								(status === 'commit_pending' &&
									isCommit &&
									access['handled_delete_purchase_plan'])) && (
								<Popconfirm
									placement='left'
									title='请确认是否作废？'
									onConfirm={() => modalDel(record.id)}
									disabled={confirmType === 'delete'}
									okButtonProps={{ loading: confirmType === 'delete' }}>
									<span className='handleLink'>作废</span>
								</Popconfirm>
							)}
							{status === 'approval_success' &&
								access['handled_cancel_purchase_plan'] &&
								!record.isConverted &&
								isHandlePage && (
									<Popconfirm
										placement='left'
										title='请确认是否撤回？'
										onConfirm={() => planCancel(record.id)}
										disabled={confirmType === 'cancelAudit'}
										okButtonProps={{ loading: confirmType === 'cancelAudit' }}>
										<span className='handleLink'>撤回</span>
									</Popconfirm>
								)}
						</Space>
					</div>
				);
			},
		},
	];

	// 选择
	const selectRow = (selectData: PurchaseNewController.WithPageListRecord, status: boolean) => {
		if (status) {
			selectList.push({ ...selectData });
		} else {
			selectList.map((val, index: number) => {
				if (val.id === selectData.id) selectList.splice(index, 1);
			});
		}
		const selectedRowKeys = selectList.map((item) => item.id);
		setSelectList(selectList);
		setSelectedRowKeys(selectedRowKeys);
	};

	const listSome = (data: PurchaseNewController.WithPageListRecord[], status: string) => {
		return data.some((item) => item.status == status);
	};

	const listFilter = (data: PurchaseNewController.WithPageListRecord[], status: string) => {
		return data.filter((item) => item.status == status);
	};

	const isApprovalSuccess = listSome(selectList, 'approval_success');
	const isApprovalPending = listSome(selectList, 'approval_pending');
	const isCommitPending = listSome(selectList, 'commit_pending');
	// 单行点击选中
	const selectRowOfClick = (record: PurchaseNewController.WithPageListRecord) => {
		const { status, isConverted, goodsId, isUrgent } = record;
		const isPass = (value: string) => status !== value || isConverted;
		const findSelectList = selectList.find((item) => item.goodsId === goodsId);
		if (isApprovalSuccess && (!handledGenerate || isPass('approval_success'))) {
			message.warn('不允许跨状态勾选采购申请！');
			return;
		}
		if (isCommitPending && (!handledCommit || isPass('commit_pending'))) {
			message.warn('不允许跨状态勾选采购申请！');
			return;
		}
		if (isApprovalPending && (!handledCommit || isPass('approval_pending'))) {
			message.warn('不允许跨状态勾选采购申请！');
			return;
		}
		if (
			findSelectList &&
			findSelectList.status === 'approval_success' &&
			findSelectList.isUrgent !== isUrgent
		) {
			message.warn('单采购订单下同一物资加急状态仅可存在一种！');
			return;
		}
		if (
			selectList.length == 0 &&
			(!handledGenerate || isPass('approval_success')) &&
			(!handledCommit || isPass('commit_pending')) &&
			(!handledApproval || isPass('approval_pending'))
		) {
			return;
		}
		const index = selectedRowKeys.indexOf(record.id);
		selectRow(record, index < 0);
	};

	// 全选过滤
	const selectRowAll = (
		status: boolean,
		selectedRows: PurchaseNewController.WithPageListRecord[],
		changeRows: PurchaseNewController.WithPageListRecord[],
	) => {
		let newSelectList: any[] = [];
		let selectArr = [];
		const len = selectList.length;
		if (isApprovalSuccess || (len == 0 && listSome(selectedRows, 'approval_success'))) {
			listFilter(selectedRows, 'approval_success').forEach((item) => {
				if (
					!newSelectList.some(
						(value) => value.goodsId === item.goodsId && value.isUrgent !== item.isUrgent,
					)
				) {
					newSelectList.push(item);
				}
			});
		}
		if (isApprovalPending || (len == 0 && listSome(selectedRows, 'approval_pending'))) {
			newSelectList = listFilter(selectedRows, 'approval_pending');
		}
		if (isCommitPending || (len == 0 && listSome(selectedRows, 'commit_pending'))) {
			newSelectList = listFilter(selectedRows, 'commit_pending');
		}
		if (status) {
			selectArr = unionBy(selectList.concat(newSelectList), 'id');
		} else {
			selectArr = selectList.filter((item) => {
				return !changeRows.map((item) => item.id).includes(item.id);
			});
		}
		const selectedRowKeys = selectArr.map((item) => item.id);
		setSelectList(selectArr);
		setSelectedRowKeys(selectedRowKeys);
	};

	// 提交
	const doCommit = async (targetList: number[]) => {
		setConfirmType('commit');
		const res = await postDoCommit({ target: targetList, status: true });
		if (res.code == 0) {
			notification.success('操作成功！');
			resetData();
			tableRef.current?.reload();
		}
		setConfirmType('');
	};

	const isDisabled = (record: PurchaseNewController.WithPageListRecord) => {
		const { status, isConverted, goodsId, isUrgent } = record;
		const approval_success = status !== 'approval_success';
		const approval_pending = status !== 'approval_pending';
		return selectList.some(
			(item) =>
				item.status === 'approval_success' &&
				item.goodsId === goodsId &&
				item.isUrgent !== isUrgent,
		)
			? true
			: selectList.length == 0
			? (!handledGenerate || (approval_success && approval_pending) || isConverted) &&
			  (!handledCommit || status !== 'commit_pending') &&
			  (!handledApproval || approval_pending)
			: listSome(selectList, 'commit_pending')
			? status !== 'commit_pending'
			: listSome(selectList, 'approval_pending')
			? !handledGenerate || approval_pending || isConverted
			: !handledGenerate || approval_success || isConverted;
	};
	const rowSelection: Record<string, any> = {
		selectedRowKeys: selectedRowKeys,
		onSelect: selectRow,
		onSelectAll: selectRowAll,
		getCheckboxProps: (record: PurchaseNewController.WithPageListRecord) => ({
			disabled: isDisabled(record),
		}),
	};

	const convertSearchParams: any = () => tableRef.current?.getParams();

	//处理新增/编辑
	const handleModal = (pageType: string, planId?: number) => {
		let timeCreated = form.getFieldsValue().timeCreated;
		if (timeCreated && typeof timeCreated[0] !== 'string') {
			timeCreated = timeCreated.map((item: any) => item._d);
		}
		history.push({
			pathname: `/purchase/handle/${pageType}`,
			state: {
				planId,
				pageType,
				isstates: pageType,
				params: { ...form.getFieldsValue(), timeCreated },
			},
		});
	};

	// 弹窗显示
	const showModal = async (modalType = 'audit') => {
		setDetailProps({
			modalType,
			tableRef,
			modalVisible: true,
			setModalVisible,
			selectList,
			data: selectList,
			resetData,
		});
		setModalVisible(true);
	};

	const planCancel = async (id: number) => {
		setConfirmType('cancelAudit');
		const res = await cancelAudit(id);
		if (res && res.code === 0) {
			notification.success('操作成功！');
			resetSelectedData(id);
			tableRef.current?.reload();
		}
		setConfirmType('');
	};

	return (
		<>
			<ProTable<PurchaseNewController.WithPageListRecord>
				loadConfig={{
					request: false,
				}}
				tableInfoCode={isHandlePage ? 'handled_purchase_plan_list' : 'query_purchase_order_list'}
				columns={columns}
				searchConfig={{
					form,
					columns: searchColumns,
					defaultColsNumber: 9,
				}}
				api={queryPurchasePlanList}
				rowSelection={isHandlePage && rowSelection}
				onRow={(record) => ({
					onClick: () => selectRowOfClick(record),
				})}
				rowKey='id'
				defaultCollapsed
				params={{
					pageType,
				}}
				setRows={(res) => {
					const data = res.data || {};
					const rows = data.rows || [];
					// 配送商业选择逻辑
					const dataRows = rows.map((item: Record<string, any>) => {
						const length = item.distributorBeans && item.distributorBeans.length > 1;
						const canSelectStatus = item.status === 'approval_pending';
						if (length && canSelectStatus) {
							const topData = (item.distributorBeans || []).filter((row: any) => row.isTop);
							return {
								...item,
								selectedRow: topData.length > 0 ? topData[0].id : null,
							};
						}
						return item;
					});
					data.rows = dataRows;
					return data;
				}}
				requestCompleted={(list) => {
					setIsExportFile(list.length > 0);
					setList(list);
				}}
				dateFormat={{
					timeCreated: {
						endKey: 'createdTo',
						startKey: 'createdFrom',
					},
				}}
				tableRef={tableRef}
				headerTitle={
					<div className='flex flex-between'>
						<div className='tableTitle'>
							{isHandlePage && (
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
										数量（个）：
										<span className='titlecollect'>
											{selectList.reduce(
												(acc: any, cur: { quantity: any }) => acc + cur.quantity,
												0,
											)}
										</span>
										，总金额：￥
										<span className='titlecollect'>
											{convertPriceWithDecimal(
												selectList.reduce(
													(acc: number, cur: { quantity: number; price: number }) =>
														acc + cur.quantity * cur.price,
													0,
												),
											)}
										</span>
									</span>
								</span>
							)}
						</div>
					</div>
				}
				searchKey={isHandlePage ? 'handled_shipping_order' : 'shipping_order'}
				toolBarRender={() => [
					handledGenerate && isHandlePage && (
						<Button
							type='primary'
							className={selectList.length ? `btnOperator` : undefined}
							onClick={() => showModal('order')}
							disabled={
								!selectList.some((item) => item.status === 'approval_success' && !item.isConverted)
							}
							style={{ width: 100 }}>
							生成订单
						</Button>
					),
					handledCommit && isHandlePage && (
						<Button
							type='primary'
							onClick={() => planApproval(null, true)}
							className={selectList.length ? `btnOperator` : undefined}
							disabled={!listSome(selectList, 'approval_pending')}
							style={{ width: 100 }}>
							批量通过
						</Button>
					),
					handledCommit && isCommit && isHandlePage && (
						<Popconfirm
							placement='left'
							disabled={!listSome(selectList, 'commit_pending') || confirmType === 'commit'}
							okButtonProps={{ loading: confirmType === 'commit' }}
							title='提交后不能撤回，请确认是否提交？'
							onConfirm={(e: any) => {
								e.stopPropagation();
								doCommit(selectedRowKeys);
							}}
							onCancel={(e: any) => e.stopPropagation()}>
							<Button
								type='primary'
								className={selectList.length ? `btnOperator` : undefined}
								disabled={!listSome(selectList, 'commit_pending')}
								style={{ width: 100 }}>
								批量提交
							</Button>
						</Popconfirm>
					),
					access['handled_add_purchase_plan'] && isHandlePage && (
						<Button
							type='primary'
							onClick={() => handleModal('add')}
							icon={<PlusOutlined />}
							className='iconButton'>
							新增
						</Button>
					),
					((isHandlePage && access['handled_purchase_plan_export']) ||
						(!isHandlePage && access['query_purchase_plan_export'])) && (
						<ExportFile
							data={{
								filters: {
									...convertSearchParams(),
									pageType: pageType,
								},
								link: exportPurchasePlanUrl,
								getForm: convertSearchParams,
							}}
							disabled={!isExportFile}
						/>
					),
				]}
				tableAlertOptionRender={
					<a
						onClick={() => {
							setSelectList([]);
							setSelectedRowKeys([]);
						}}>
						取消选择
					</a>
				}
			/>
			{/* 详情modal */}
			{modalVisible && <DetailModal {...detailProps} />}
		</>
	);
};

export default connect(({ global }: Record<string, any>) => ({ global }))(PurchasePlan);
