import Breadcrumb from '@/components/Breadcrumb';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import ProTable from '@/components/ResizableTable';
import { ProFormColumns } from '@/components/SchemaForm/typings';
import { enabledEnum } from '@/constants/dictionary';
import {
	getNearExpireAndExpired,
	getPageList,
	setAccountPeriodBatch,
	setBatchEnable,
	setEnable,
} from '@/services/distributor';
import { getEnabledAuthorizingDistributor } from '@/services/distributorAuthorization';
import { lessThan_30Days } from '@/utils/dataUtil';
import { notification } from '@/utils/ui';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Divider, Form, Popconfirm, Space } from 'antd';
import { unionBy } from 'lodash';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { connect, history, useAccess, useModel } from 'umi';
import DisabledModal, {
	DisabledModalProps,
	DisabledModalPropsType,
} from './components/DisabledModal';
import PeriodModal from './components/PeriodModal';

type ListRecord = DistributorController.ListRecord;

const DistributorList: React.FC<{}> = () => {
	const access = useAccess();
	const [accountPeriodInfo, setAccountPeriodInfo] = useState<Partial<ListRecord>>({});
	const [visible, setVisible] = useState<boolean>(false);
	const [isBatch, setIsBatch] = useState<boolean>(false); //是否批量设置账期
	const [enabledLoading, setEnabledLoading] = useState<boolean>(false);
	const [selectList, setSelectList] = useState<ListRecord[]>([]); //已选中的数组
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	const [expired, setExpired] = useState({ expired: 0, nearExpire: 0 }); //经营许可30天内过期的个数，及过期的个数
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const { fields } = useModel('fieldsMapping');
	const { loading, fieldsMap, getDistributorFiled } = useModel('distributorFiled');
	// 禁用弹窗
	const [disabledVisible, setDisabledVisible] = useState<boolean>(false);
	// 禁用弹窗其他属性
	const [disabledModalProps, setDisabledModalProps] = useState<
		Omit<DisabledModalProps, 'visible' | 'tableRef' | 'onCancel'>
	>({
		type: 'single',
		distributorIds: [],
		list: [],
	});

	// 刷新列表
	const upDataTableList = () => tableRef.current?.reload();

	// 获取经营许可30天内过期的个数，及过期的个数
	const getNearExpire = async () => {
		let res = await getNearExpireAndExpired(30);
		if (res.code === 0) setExpired(res.data);
	};

	useEffect(() => {
		getDistributorFiled();

		if (WEB_PLATFORM !== 'DS') {
			getNearExpire();
		}
	}, []);

	// 获取存在启用中的被授权关系列表
	const getEnabledAuthList = async (
		ids: number[],
		type: DisabledModalPropsType,
	): Promise<boolean> => {
		const res = await getEnabledAuthorizingDistributor({ ids });
		if (res.code === 0) {
			if (res.data && res.data.length > 0) {
				setDisabledVisible(true);
				setDisabledModalProps({
					type,
					list: res.data,
					distributorIds: ids,
				});
				return true;
			}
			return false;
		} else {
			return true;
		}
	};

	// 启用/禁用
	const onConfirmEnabled = async (record: ListRecord) => {
		setEnabledLoading(true);
		if (record.isEnabled) {
			const bool = await getEnabledAuthList([record.id], 'single');
			if (bool) {
				setEnabledLoading(false);
				return;
			}
		}
		const params = {
			id: record.id,
			type: record.isEnabled ? 2 : 1,
		};
		const res = await setEnable(params);
		if (res && res.code === 0) {
			notification.success('操作成功！');
			setSelectedRowKeys([]);
			setSelectList([]);
			upDataTableList();
		}
		setEnabledLoading(false);
	};

	// 批量启用/禁用
	const handleOperateBatch = async (type: number) => {
		const ids = selectList.map((item) => item.id);
		if (type === 2) {
			const bool = await getEnabledAuthList(ids, 'batch');
			if (bool) {
				return;
			}
		}
		let res = await setBatchEnable(type, { ids });
		if (res.code == 0) {
			notification.success('操作成功！');
			setSelectList([]);
			setSelectedRowKeys([]);
			upDataTableList();
		}
	};

	const toPage = (id: number, companyName: string, page: string) => {
		history.push({
			pathname: `/base_data/distributor/${page}/${id}/${companyName}`,
		});
	};
	const toPageCompanyName = (id: number, companyName: string) => {
		history.push({
			pathname: `distributor/detail/${id}/${companyName}`,
		});
	};

	const jumpPage = (id: number, companyName: string, num: number) => {
		if (num === 2) {
			toPage(id, companyName, 'detail');
		} else {
			toPage(id, companyName, 'edit');
		}
	};

	// 禁用弹窗关闭回调
	const disabledCancel = (bool: boolean) => {
		if (bool) {
			setSelectedRowKeys([]);
			setSelectList([]);
			upDataTableList();
		}
		setDisabledModalProps({
			type: 'single',
			distributorIds: [],
			list: [],
		});
		setDisabledVisible(false);
	};

	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'isEnabled',
			valueType: 'radioButton',
			initialValue: '',
			valueEnum: enabledEnum,
			fieldProps: {
				className: 'search-radio-button',
			},
		},
		{
			title: `${fields.distributor}名称`,
			dataIndex: 'distributorName',
			fieldProps: {
				placeholder: `请输入${fields.distributor}名称`,
			},
		},
	];

	const columns: ProColumns<ListRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 'XXXS',
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'isEnabled',
			width: 'XXS',
			renderText: (text: boolean) => {
				const color = text ? CONFIG_LESS['@c_starus_await'] : CONFIG_LESS['@c_starus_disabled'];
				const textFont = text ? '已启用' : '已禁用';
				return (
					<Badge
						color={color}
						text={textFont}
					/>
				);
			},
		},
		{
			title: `${fields.distributor}名称`,
			dataIndex: 'companyName',
			key: 'companyName',
			width: 'XS',
			ellipsis: true,
			renderText: (text: string, record) => {
				return access['distributor_view'] ? (
					<>
						<a
							className='handleLink'
							onClick={(e) => {
								e.preventDefault();
								toPageCompanyName(record.id, record.companyName);
							}}>
							{text}
						</a>
					</>
				) : (
					<span>{text}</span>
				);
			},
		},
		{
			title: `ePS${fields.distributor}编号`,
			dataIndex: 'epsDruggistCode',
			width: 'S',
			hideInTable: WEB_PLATFORM !== 'DS',
		},
		{
			title: `平台${fields.distributor}码`,
			dataIndex: 'platformCode',
			width: 'S',
			hideInTable: WEB_PLATFORM !== 'DS',
		},
		{
			title: '经营许可效期',
			dataIndex: 'licenseDistributorPermit',
			key: 'licenseDistributorPermit',
			hideInTable: WEB_PLATFORM === 'DS',
			width: 'XXS',
			sorter: true,
			ellipsis: true,
			renderText: (text: Record<string, any>) => {
				// 由于后端返回的时间戳为当天0时0分0秒这样的话一天才开始就过期，所以只需要29天+1秒
				const endTime = text && text.permitEndTime;
				const beginTime = text && text.permitBeginTime;
				const showRedText = lessThan_30Days(endTime, beginTime);
				const isOverdue = endTime < Date.parse(new Date().toString()) - 86400000 + 1000;
				return endTime || beginTime ? (
					<span
						style={
							endTime
								? showRedText
									? { color: CONFIG_LESS['@c_starus_early_warning'] }
									: isOverdue
									? { color: CONFIG_LESS['@c_starus_warning'] }
									: {}
								: {}
						}>
						{beginTime ? moment(beginTime).format('YYYY/MM/DD') : ''}～
						{endTime ? moment(endTime).format('YYYY/MM/DD') : '长期有效'}
						{endTime && showRedText && <span className='warningIcon'>效期预警</span>}
						{endTime && isOverdue && <span className='earlyWarningIcon'>过期警告</span>}
					</span>
				) : (
					''
				);
			},
		},
		{
			title: '账期',
			dataIndex: 'accountPeriod',
			key: 'accountPeriod',
			width: 'XXS',
			render: (text) => text + '天',
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 'L',
			renderText: (text: string, record) => {
				const { id, isEnabled, companyName } = record;
				return (
					<div className='operation'>
						<Space
							size={0}
							split={<Divider type='vertical' />}
							wrap={true}>
							{access['edit_distributor'] && (
								<span
									className='handleLink'
									onClick={() => jumpPage(id, companyName, 1)}>
									编辑
								</span>
							)}
							{access['set_distributor_enabled'] && (
								<Popconfirm
									placement='left'
									title={`确定${isEnabled ? '禁用' : '启用'}该${fields.distributor}吗？`}
									onConfirm={() => onConfirmEnabled(record)}
									okButtonProps={{ loading: enabledLoading }}
									disabled={enabledLoading}>
									<span className='handleLink'>{isEnabled ? '禁用' : '启用'}</span>
								</Popconfirm>
							)}
							{access['set_distributor_account_period'] && (
								<span
									className='handleLink'
									onClick={() => {
										setAccountPeriodInfo(record);
										setVisible(true);
									}}>
									设置账期
								</span>
							)}
							{access['distributor_authorization'] && (
								<span
									className='handleLink'
									onClick={() => {
										history.push({
											pathname: `/base_data/distributor/distributor_authorization/${id}/${companyName}`,
										});
									}}>
									商业授权
								</span>
							)}
							{access['manufacturer_authorization'] && (
								<span
									className='handleLink'
									onClick={() => {
										history.push({
											pathname: `/base_data/distributor/manufacturer_authorization/${id}/${companyName}`,
										});
									}}>
									厂家授权
								</span>
							)}
						</Space>
					</div>
				);
			},
		},
	];

	// 选择
	const selectRow = (selectData: ListRecord, status: boolean) => {
		let newSelectList = [...selectList];
		if (status) {
			newSelectList.push(selectData);
		} else {
			newSelectList.map((val, index) => {
				if (String(val.id) === String(selectData.id)) {
					newSelectList.splice(index, 1);
				}
			});
		}
		let newSelectedRowKeys = newSelectList.map((item) => item.id);
		setSelectList([...newSelectList]);
		setSelectedRowKeys([...newSelectedRowKeys]);
	};

	// 全选过滤
	const selectRowAll = (status: boolean, selectedRows: ListRecord[], changeRows: ListRecord[]) => {
		const isEnabled = selectList.some((item) => item.isEnabled === true);
		let list: ListRecord[];
		if (
			isEnabled ||
			(selectList.length == 0 && selectedRows.some((item) => item.isEnabled === true))
		) {
			list = selectedRows.filter((item) => item && item.isEnabled === true);
		} else {
			list = selectedRows.filter((item) => item && item.isEnabled === false);
		}

		let newSelectList;
		if (status) {
			newSelectList = unionBy(selectList.concat(list), 'id');
		} else {
			newSelectList = selectList.filter((item) => {
				return !changeRows.map((item) => item.id).includes(item.id);
			});
		}
		const newSelectedRowKeys = newSelectList.map((item) => item.id);
		setSelectList([...newSelectList]);
		setSelectedRowKeys([...newSelectedRowKeys]);
	};

	const rowSelection = {
		selectedRowKeys: selectedRowKeys,
		onSelect: selectRow,
		onSelectAll: selectRowAll,
		getCheckboxProps: (record: Record<string, any>) => ({
			disabled:
				selectList.length == 0
					? false
					: selectList.some((item: Record<string, any>) => item.isEnabled === true)
					? !record.isEnabled
					: record.isEnabled,
		}),
	};

	// 批量设置账期
	const handleSetAccountPeriodBatch = async (accountPeriod: number) => {
		const distributorIds = selectList.map((item) => item.id);
		let res = await setAccountPeriodBatch({ accountPeriod, distributorIds });
		if (res.code == 0) {
			notification.success('操作成功！');
			setSelectList([]);
			setSelectedRowKeys([]);
			setVisible(false);
			setIsBatch(false);
			upDataTableList();
		}
	};

	// 列表可配置处理
	const finalColumns: ProColumns<ListRecord>[] = [];
	if (!loading) {
		const noConfigKeys = ['index', 'option'];

		let initSort = 9999;
		columns
			.sort((a, b) => {
				const aKey = a.dataIndex || a.key;
				const bKey = b.dataIndex || b.key;
				const aField = fieldsMap[aKey as string] || {};
				const bField = fieldsMap[bKey as string] || {};

				let aSort = aField.listSort || ++initSort;
				let bSort = bField.listSort || ++initSort;

				if (aKey === 'index') {
					aSort = -1;
				} else if (aKey === 'option') {
					aSort = 99999;
				}
				if (bKey === 'index') {
					bSort = -1;
				} else if (bKey === 'option') {
					bSort = 99999;
				}
				return aSort - bSort;
			})
			.forEach((col) => {
				let key = col.dataIndex || col.key;
				const field = fieldsMap[key as string] || {};
				if ((field && field.listShow) || noConfigKeys.includes(key as string)) {
					finalColumns.push({
						...col,
						title: field.displayFieldLabel || col.title,
					});
				}
			});
	}

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<Card>
				<ProTable<ListRecord>
					rowSelection={rowSelection}
					columns={finalColumns}
					tableInfoCode='distributor_list'
					rowKey='id'
					api={getPageList}
					headerTitle={
						<div className='flex flex-between'>
							<div className='tableTitle'>
								{WEB_PLATFORM !== 'DS' && (
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
											经营许可
											<span className='titlewarning'>
												30天内过期数（个）
												<span
													style={{
														color: CONFIG_LESS['@c_body'],
														fontSize: CONFIG_LESS['@font-size-12'],
													}}>
													：
												</span>
												<span className='tableNotificationTitleNum'>{expired.nearExpire || 0}</span>
											</span>{' '}
											，
											<span className='titlehaveexpired'>
												{' '}
												已过期数（个）
												<span
													style={{
														color: CONFIG_LESS['@c_body'],
														fontSize: CONFIG_LESS['@font-size-12'],
													}}>
													：
												</span>
												<span className='tableNotificationTitleNum'>{expired.expired || 0}</span>
											</span>
										</span>
									</span>
								)}
							</div>
						</div>
					}
					params={{}} //额外携带参数(除表单里的参数外)
					searchKey={'distributor'}
					tableRef={tableRef} //页面更新后控制页面重新发送请求并更新
					toolBarRender={() => [
						access['set_distributor_enabled_batch'] && (
							<Button
								type='primary'
								onClick={() => handleOperateBatch(1)}
								className={selectList.length ? `btnOperator` : undefined}
								style={{ width: 100 }}
								disabled={!selectList.some((item) => item.isEnabled === false)}>
								批量启用
							</Button>
						),
						access['set_distributor_enabled_batch'] && (
							<Button
								type='primary'
								style={{ width: 100 }}
								onClick={() => handleOperateBatch(2)}
								className={selectList.length ? `btnOperator` : undefined}
								disabled={!selectList.some((item: Record<string, any>) => item.isEnabled === true)}>
								批量禁用
							</Button>
						),
						access['set_distributor_account_period_batch'] && (
							<Button
								type='primary'
								style={{ width: 100, padding: 0 }}
								onClick={() => {
									setVisible(true);
									setIsBatch(true);
								}}
								className={selectList.length ? `btnOperator` : undefined}
								disabled={selectList.length ? false : true}>
								批量设置账期
							</Button>
						),
						access['add_distributor'] && (
							<Button
								icon={<PlusOutlined />}
								type='primary'
								onClick={() => {
									history.push({
										pathname: '/base_data/distributor/add',
									});
								}}
								className='iconButton'>
								新增
							</Button>
						),
					]}
					searchConfig={{
						form,
						columns: searchColumns,
					}}
					loadConfig={{
						request: false,
					}}
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
			</Card>
			{/* modal */}
			{visible && (
				<PeriodModal
					visible={visible}
					isBatch={isBatch}
					type='distributor'
					info={accountPeriodInfo}
					upDataTableList={upDataTableList}
					handleSetAccountPeriodBatch={handleSetAccountPeriodBatch}
					handleCancel={() => setVisible(false)}
				/>
			)}

			{/* 禁用弹窗 */}
			<DisabledModal
				visible={disabledVisible}
				tableRef={tableRef}
				onCancel={disabledCancel}
				{...disabledModalProps}
			/>
		</div>
	);
};

export default connect(({ global }: Record<string, any>) => ({ global }))(DistributorList);
