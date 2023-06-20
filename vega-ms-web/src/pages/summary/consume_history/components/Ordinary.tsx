import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';
import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { timeType3 } from '@/constants';
import { consumeTypeTextMap } from '@/constants/dictionary';
import { useDepartmentList } from '@/hooks/useDepartmentList';
import { queryordinaryConsumeList, unconsumefun } from '@/services/consume';
import { notification } from '@/utils/ui';
import { Divider, Form, Popconfirm } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';
import DetailModal from '../Detail';

const consumeWay = [
	{ label: '推送消耗', value: 'push_consume' },
	{ label: '扫码消耗', value: 'scan_consume' },
];

const Ordinary = () => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const access = useAccess();
	const departmentList = (useDepartmentList() || []).map(
		(item: { name: string; id: number; nameAcronym: string }) => {
			const { name, id, nameAcronym } = item;
			return { value: id, label: name, key: (nameAcronym || '') + '' + name };
		},
	);
	const [isExportFile, setIsExportFile] = useState(false);
	const searchColumns: ProFormColumns<ConsumeController.OrdinaryConsumeList> = [
		{
			title: '消耗时间',
			dataIndex: 'consumeTime',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType3,
			},
		},
		{
			title: '消耗方式',
			valueType: 'select',
			dataIndex: 'consumeType',
			fieldProps: {
				options: consumeWay,
			},
		},

		{
			title: '消耗科室',
			dataIndex: 'sourceDepartmentIds',
			valueType: 'select',
			fieldProps: {
				mode: 'multiple',
				allowClear: true,
				showArrow: true,
				options: departmentList,
				filterOption: (input, option: any) => {
					return option['data-item'].key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '套包条码',
			dataIndex: 'operatorBarcode',
		},
		{
			title: '验收单号',
			dataIndex: 'acceptanceCode',
		},
		{
			title: '套包编号/名',
			dataIndex: 'keyword',
		},
	];

	const fetchList = () => {
		tableRef.current?.reload();
	};

	const convertSearchParams = () => {
		return { ...tableRef.current?.getParams() };
	};

	//反消耗
	const unconsume = async (operatorBarcode: string) => {
		let res = await unconsumefun({ barcode: operatorBarcode });
		if (res && res.code == 0) {
			notification.success('操作成功！');
			fetchList();
		}
	};
	const ordinaryColumns: ProColumns<ConsumeController.QueryordinaryConsumeList>[] = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			render: (text, record, index) => {
				return <span>{index + 1}</span>;
			},
		},
		{
			width: 'XS',
			title: '消耗方式',
			dataIndex: 'consumeType',
			render: (text) => <span>{consumeTypeTextMap[text as string]}</span>,
		},
		{
			width: 'L',
			title: '医耗套包名称',
			dataIndex: 'name',
			ellipsis: true,
		},
		{
			width: 'XXL',
			title: '验收单号',
			dataIndex: 'acceptanceCode',
			ellipsis: true,
		},
		{
			width: 'XXL',
			title: '套包条码',
			dataIndex: 'operatorBarcode',
			ellipsis: true,
		},
		{
			width: 'XXL',
			title: '套包编号',
			dataIndex: 'ordinaryCode',
			ellipsis: true,
		},
		{
			width: 'XL',
			title: '消耗时间',
			dataIndex: 'consumeTime',
			key: 'consume_time',
			render: (text, record) => {
				return (
					<span>
						{record.consumeTime
							? moment(new Date(text as number)).format('YYYY/MM/DD HH:mm:ss')
							: '-'}
					</span>
				);
			},
		},
		{
			width: 'XXS',
			title: '消耗人',
			dataIndex: 'consumeBy',
			ellipsis: true,
		},
		{
			width: 'M',
			title: '消耗科室',
			dataIndex: 'departmentName',
			ellipsis: true,
		},
		{
			width: 'XXS',
			title: '请领人',
			dataIndex: 'approvalByName',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '请领时间',
			dataIndex: 'approvalTime',
			key: 'approvalTime',
			render: (text, record) => {
				return (
					<span>
						{record.approvalTime
							? moment(new Date(text as number)).format('YYYY/MM/DD HH:mm:ss')
							: '-'}
					</span>
				);
			},
		},
		{
			title: '请领备注',
			dataIndex: 'requestReason',
			width: 'XXXL',
		},
		{
			width: 'S',
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			render: (text, record) => {
				return (
					<span>
						{record.productionDate ? moment(new Date(text as number)).format('YYYY/MM/DD') : '-'}
					</span>
				);
			},
		},
		{
			width: 'S',
			title: '灭菌日期',
			dataIndex: 'sterilizationDate',
			key: 'sterilizationDate',
			render: (text, record) => {
				return (
					<span>
						{record.sterilizationDate ? moment(new Date(text as number)).format('YYYY/MM/DD') : '-'}
					</span>
				);
			},
		},
		{
			width: 'S',
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			render: (text, record) => {
				return (
					<span>
						{record.expirationDate ? moment(new Date(text as number)).format('YYYY/MM/DD') : '-'}
					</span>
				);
			},
		},
		{
			width: 'XL',
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			fixed: 'right',
			render: (text, record) => {
				return (
					<div className='operation'>
						{access.consume_history_detail && (
							<DetailModal
								trigger={<span className='handleLink'>查看</span>}
								type='ordinary'
								ItemId={record.ordinaryItemId as number}
							/>
						)}
						<Divider type='vertical' />
						{record.ordinaryItemId && record.consumeType !== 'push_consume' && access.unconsume ? (
							<Popconfirm
								title={`确定对该${fields.goods}进行反消耗？`}
								onConfirm={(e: any) => {
									e.stopPropagation();
									unconsume(record.operatorBarcode as string);
								}}
								onCancel={(e: any) => {
									e.stopPropagation();
								}}>
								<span
									className='handleLink'
									onClick={(e) => e.stopPropagation()}>
									反消耗
								</span>
							</Popconfirm>
						) : null}
					</div>
				);
			},
		},
	];
	return (
		<div>
			<ProTable
				requestCompleted={(rows) => {
					setIsExportFile(rows.length > 0);
				}}
				tableInfoCode='consume_history_ordinary_list'
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				api={queryordinaryConsumeList}
				rowKey={(record, index) => (index as number) + 1}
				columns={ordinaryColumns}
				loadConfig={{
					request: false,
				}}
				dateFormat={{
					consumeTime: {
						endKey: 'end',
						startKey: 'start',
					},
				}}
				// tableInfoId='251'
				tableRef={tableRef}
				beforeSearch={(value: Record<string, any>) => {
					const { presenter, sourceDepartmentIds, consumeType } = value;
					const params = {
						...value,
						consumeType: consumeType ? [consumeType] : undefined,
						sourceDepartmentIds: sourceDepartmentIds ? sourceDepartmentIds.toString() : undefined,
						presenter: presenter ? (presenter === 'all' ? '' : presenter.toString()) : undefined,
					};
					return params;
				}}
				toolBarRender={() => [
					access.consume_history_export && (
						<ExportFile
							data={{
								filters: { ...convertSearchParams() },
								link: '/api/admin/consume/1.0/exportOrdinaryConsume',
								getForm: convertSearchParams,
							}}
							disabled={!isExportFile}
						/>
					),
				]}
			/>
		</div>
	);
};

export default Ordinary;
