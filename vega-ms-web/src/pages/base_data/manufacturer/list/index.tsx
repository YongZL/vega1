import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ResizableTable';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { enabledEnum, enabledStatusValueEnum } from '@/constants/dictionary';
import { getPageList, operate } from '@/services/manufacturer';
import { lessThan_30Days } from '@/utils/dataUtil';
import { notification } from '@/utils/ui';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Form, Popconfirm } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { history, useAccess } from 'umi';
import bulk from '@/pages/global_search/baseData/bulk';
type ManufacturerRecord = ManufacturerController.ManufacturerRecord;
const TableList: React.FC<{}> = () => {
	const [searchParams] = useState({});
	const [popconfirmDisabled, setPopconfirmDisabled] = useState<boolean>(false);
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const access = useAccess();
	const [datalist, setDatalist] = useState<Record<string, any>>({});
	// 查询参数变化后更新列表
	useEffect(() => {
		tableRef.current?.reload();
	}, [searchParams]);
	/**
	 * 点击启用或禁用
	 * @param isEnabled 启用禁用状态
	 * @param id 基础物资id
	 */
	const onConfirmEnabled = async (id: number, isEnabled: boolean) => {
		const params: { id: number; type: 1 | 2 } = {
			id: id,
			type: isEnabled ? 2 : 1,
		};
		setPopconfirmDisabled(true);
		try {
			const res = await operate(params);
			if (res && res.code === 0) {
				notification.success('操作成功！');
				tableRef.current?.reload();
			}
		} finally {
			setPopconfirmDisabled(false);
		}
	};
	/**
	 * 编辑更新厂商信息
	 * @param id 基础物资id
	 */
	const onEdit = (id: number) => {
		// form.submit();
		history.push({
			pathname: `manufacturer/edit/${id}`,
			state: { params: form.getFieldsValue() },
		});
	};

	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'enabled',
			valueType: 'radioButton',
			initialValue: '',
			valueEnum: enabledEnum,
			fieldProps: {
				className: 'search-radio-button',
			},
		},
		{
			title: '生产厂家名称',
			dataIndex: 'name',
			fieldProps: {
				placeholder: '请输入',
			},
		},
	];
	const columns: ProColumns<ManufacturerRecord>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 'XXXS',
			align: 'center',
			renderText: (_text, _record, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'isEnabled',
			width: 'XXXS',
			filters: false,
			valueEnum: enabledStatusValueEnum,
		},
		{
			title: '生产厂家名称',
			dataIndex: 'companyName',
			key: 'companyName',
			width: 'XXS',
			ellipsis: true,
			render: (text, record) => {
				return access.manufacturer_view ? (
					<a
						onClick={() => {
							history.push({
								pathname: `manufacturer/detail/${record.id}`,
								state: { params: form.getFieldsValue() },
							});
						}}>
						{text}
					</a>
				) : (
					<span>{text}</span>
				);
			},
		},
		{
			title: '生产厂家法人',
			dataIndex: 'companyLegalPerson',
			key: 'companyLegalPerson',
			width: 'XXS',
		},
		{
			title: '生产许可效期',
			dataIndex: 'licenseManufacturerPermit',
			key: 'mmp.permit_end_time',
			width: 'XXS',
			sorter: true,
			ellipsis: true,
			renderText: (text: Record<string, any>) => {
				const endTime = text && text.permitEndTime;
				const beginTime = text && text.permitBeginTime;
				const showRedText = lessThan_30Days(endTime, beginTime);
				const isOverdue = endTime < Date.parse(new Date().toString()) - 86400000 + 1000;
				return beginTime || endTime ? (
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
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			fixed: 'right',
			width: 'XS',
			render: (_id, record) => {
				return (
					<div className='operation'>
						{access.edit_manufacturer && (
							<span>
								<span
									className='handleLink'
									onClick={() => onEdit(record.id)}>
									编辑
									{access.set_manufacturer_enabled && <Divider type='vertical' />}
								</span>
							</span>
						)}
						{access.set_manufacturer_enabled && (
							<Popconfirm
								placement='left'
								title={`确定${record.isEnabled ? '禁用' : '启用'}该生产厂家吗？`}
								disabled={popconfirmDisabled}
								onConfirm={() => {
									onConfirmEnabled(record.id, record.isEnabled);
								}}>
								<span className='handleLink'>{record.isEnabled ? '禁用' : '启用'}</span>
							</Popconfirm>
						)}
					</div>
				);
			},
		},
	];

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<Card>
				<ProTable<ManufacturerRecord>
					columns={columns}
					rowKey='id'
					headerTitle={
						<div className='flex flex-between'>
							<div className='tableTitle'>
								{
									<span //缺少后端参数进行判断
										className='tableAlert'
										style={{
											backgroundColor: CONFIG_LESS['@bgc_search'],
											borderRadius: '5px',
											marginLeft: '10px',
										}}>
										<ExclamationCircleFilled // 缺少后端参数  ，这里先用100代替
											style={{
												color: CONFIG_LESS['@c_starus_await'],
												marginRight: '8px',
												fontSize: '12px',
											}}
										/>
										<span
											className='consumeCount'
											style={{ border: 0 }}>
											生产许可
											<span className='titlewarning'>
												30天内过期数（个）
												<span
													style={{
														color: CONFIG_LESS['@c_body'],
														fontSize: CONFIG_LESS['@font-size-12'],
													}}>
													：
												</span>
												<span className='tableNotificationTitleNum'>
													{datalist.nearExpire || 0}
												</span>
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
												<span className='tableNotificationTitleNum'>{datalist.expired || 0}</span>
											</span>
										</span>
									</span>
								}
							</div>
						</div>
					}
					api={getPageList}
					tableInfoCode='manufacturer_list'
					params={{ nearPeriod: 30 }}
					tableRef={tableRef}
					searchKey={'manufacturer'}
					toolBarRender={() => [
						access.add_manufacturer && (
							<Button
								icon={<PlusOutlined />}
								type='primary'
								onClick={() => {
									history.push({
										pathname: '/base_data/manufacturer/add',
										state: {
											params: { ...form.getFieldsValue() },
										},
									});
								}}
								className='iconButton'>
								新增
							</Button>
						),
					]}
					beforeSearch={(value) => {
						if (
							value.sortList &&
							value.sortList.length > 0 &&
							value.sortList[0].sortName === 'mmp.permit_end_time'
						) {
							value.sortList[0].nullsLast = !value.sortList[0].desc;
							value.sortList.push({
								sortName: 'mmp.permit_begin_time',
								nullsLast: !value.sortList[0].desc,
							});
						}
						return value;
					}}
					requestCompleted={(list, params, dataObj) => {
						setDatalist(dataObj);
					}}
					searchConfig={{
						form,
						columns: searchColumns,
					}}
					loadConfig={{
						request: false,
					}}
				/>
			</Card>
		</div>
	);
};

export default TableList;
