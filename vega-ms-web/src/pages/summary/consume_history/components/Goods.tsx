import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';
import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { timeType3 } from '@/constants';
import { consumeType, consumeTypeTextMap, presenterOptions, yesOrNo } from '@/constants/dictionary';
import { useDepartmentList } from '@/hooks/useDepartmentList';
import { queryGoodsConsumeList, unconsumefun } from '@/services/consume';
import { judgeBarCodeOrUDI } from '@/utils';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Form, Popconfirm } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';

const Goods = () => {
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const [form] = Form.useForm();
	const [systemType] = useState<string | null>(sessionStorage.getItem('systemType'));
	const access = useAccess();
	const [consumeHistory, setConsumeHistory] = useState<Record<string, any>>({
		totalPrice: 0,
		totalQuantity: 0,
	});
	const [isExportFile, setIsExportFile] = useState(false);
	const { totalPrice, totalQuantity } = consumeHistory;
	const departmentList = (useDepartmentList() || []).map(
		(item: { name: string; id: number; nameAcronym: string }) => {
			const { name, id, nameAcronym } = item;
			return { value: id, label: name, key: (nameAcronym || '') + '' + name };
		},
	);

	const searchColumns: ProFormColumns = [
		{
			title: `赠送${fields.baseGoods}`,
			dataIndex: 'presenter',
			valueType: 'tagSelect',
			initialValue: ['false'],
			fieldProps: {
				multiple: false,
				options: presenterOptions,
			},
		},
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
			dataIndex: 'type',
			fieldProps: {
				options: consumeType,
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
			title: `${fields.goods}条码/UDI`,
			dataIndex: 'operatorBarcode',
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			title: '验收单号',
			dataIndex: 'acceptanceCode',
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
		},
		{
			title: '通用名',
			dataIndex: 'commonName',
		},
		{
			title: '规格/型号',
			dataIndex: 'commonSearch.specificationAndModel',
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
			title: '植/介入物',
			dataIndex: 'implantation',
			valueType: 'select',
			hideInForm: systemType !== 'Insight_RS',
			fieldProps: {
				placeholder: '请选择',
				options: yesOrNo,
			},
		},
		{
			title: fields.goodsProperty,
			dataIndex: 'highValue',
			valueType: 'select',
			fieldProps: {
				options: [
					{ value: 'true', label: '高值' },
					{ value: 'false', label: '低值' },
				],
			},
		},
	];

	const fetchList = () => {
		tableRef.current?.reload();
	};

	const convertSearchParams = () => {
		return { ...tableRef.current?.getParams() };
	};

	//反消耗
	const unconsume = async (record: ConsumeController.QueryGoodsConsumeListpage) => {
		let res = await unconsumefun({ barcode: record.operatorBarcode!, consumeId: record.id });
		if (res && res.code == 0) {
			notification.success('操作成功！');
			fetchList();
		}
	};
	const columns: ProColumns<ConsumeController.QueryGoodsConsumeListpage>[] = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			width: 'XS',
			title: '消耗方式',
			dataIndex: 'consumeType',
			render: (text) => <span>{consumeTypeTextMap[text as string]}</span>,
		},
		{
			width: 'M',
			title: fields.goodsName,
			dataIndex: 'goodsName',
			ellipsis: true,
		},
		{
			width: 'S',
			title: '通用名',
			dataIndex: 'commonName',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			renderText: (text: string, record) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			width: 'L',
			title: '本地医保编码',
			dataIndex: 'chargeNum',
		},
		{
			width: 'L',
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			key: 'nationalNo',
			ellipsis: true,
		},
		{
			width: 'XXS',
			title: fields.goodsProperty,
			dataIndex: 'highValue',
			renderText: (text) => (typeof text === 'boolean' ? (text ? '高值' : '低值') : '-'),
		},
		{
			width: 'XXS',
			title: '植/介入物',
			dataIndex: 'implantation',
			hideInTable: systemType === 'Insight_RS',
			render: (text) => {
				return <span>{text ? '是' : '否'}</span>;
			},
		},
		{
			width: 'S',
			title: '单价(元)',
			dataIndex: 'price',
			align: 'right',
			render: (text) => {
				return <span>{text ? convertPriceWithDecimal(text as number) : '-'}</span>;
			},
		},
		{
			width: 'XXXS',
			title: '数量',
			dataIndex: 'quantity',
		},
		{
			width: 'XXXS',
			title: '单位',
			dataIndex: 'unitName',
		},
		{
			width: 'XXXL',
			title: '验收单号',
			dataIndex: 'acceptanceCode',
		},
		{
			width: 'XXL',
			title: `${fields.goods}条码/UDI`,
			dataIndex: 'operatorBarcode',
			ellipsis: true,
			renderText: (text, record) => judgeBarCodeOrUDI(record),
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
							? moment(new Date(text as string)).format('YYYY/MM/DD HH:mm:ss')
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
			dataIndex: 'sourceDepartmentName',
			ellipsis: true,
			render: (text, record) => {
				const name =
					record.consumeType === 'following_consume'
						? record.departmentName
						: record.sourceDepartmentName;
				return <span>{name || '-'}</span>;
			},
		},
		// {
		// 	width: 'S',
		// 	title: '开单科室',
		// 	dataIndex: 'departmentName',
		// 	render: (text, record) => {
		// 		return record.medicalCharge ? text : '-';
		// 	},
		// },
		{
			width: 'S',
			title: '请领人',
			dataIndex: 'approvalByName',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '请领时间',
			dataIndex: 'approvalTime',
			key: 'approvalTime',
			renderText: (text: Date) => {
				return <span>{text ? moment(new Date(text)).format('YYYY/MM/DD HH:mm:ss') : '-'}</span>;
			},
		},
		{
			title: '请领备注',
			dataIndex: 'requestReason',
			width: 'XXXL',
			ellipsis: true,
		},
		{
			width: 'S',
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			ellipsis: true,
		},
		{
			width: 'M',
			title: '批号/序列号',
			dataIndex: 'lotNum',
			ellipsis: true,
			renderText: (text, record) => <span>{`${text || '-'}/${record.serialNum || '-'}`}</span>,
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
			width: 'M',
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			fixed: 'right',
			render: (text, record) => {
				// 结算单中&&非医嘱消耗&&非定数包内的基础物资&&非扫码消耗
				return (
					<div className='operation'>
						{!record.insideStatement &&
						!record.medicalCharge &&
						!(record.goodsItemId && record.packageBulkItemId) &&
						record.consumeType !== 'push_consume' &&
						record.consumeType !== 'following_consume' &&
						access.unconsume ? (
							<Popconfirm
								title={`确定对该${fields.goods}进行反消耗？`}
								onConfirm={(e: any) => {
									e.stopPropagation();
									unconsume(record);
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
				tableInfoCode='consume_history_goods_list'
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				api={queryGoodsConsumeList}
				rowKey={(record, index) => (index as number) + 1}
				columns={columns}
				setRows={(res: Record<string, any>) => {
					const { page, summary } = res.data;
					setConsumeHistory(summary);
					return page;
				}}
				loadConfig={{
					request: false,
				}}
				dateFormat={{
					consumeTime: {
						endKey: 'end',
						startKey: 'start',
					},
				}}
				// tableInfoId='73'
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
				headerTitle={
					<div className='flex flex-between'>
						<div className='tableTitle'>
							{Math.abs(totalPrice) > 0 && (
								<div className='tableAlert'>
									<ExclamationCircleFilled
										style={{
											color: CONFIG_LESS['@c_starus_await'],
											marginRight: '8px',
											fontSize: '12px',
										}}
									/>
									<span className='consumeCount'>
										{fields.baseGoods}消耗总数量： <span className='count'>{totalQuantity}</span>，
										{fields.baseGoods}消耗总金额：{' '}
										<span className='count'>￥{convertPriceWithDecimal(totalPrice)}</span>
									</span>
								</div>
							)}
						</div>
					</div>
				}
				toolBarRender={() => [
					access.consume_history_export && (
						<ExportFile
							data={{
								filters: { ...convertSearchParams() },
								link: '/api/admin/consume/1.0/exportGoodsConsume',
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

export default Goods;
