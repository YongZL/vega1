import { ProFormColumns } from '@/components/SchemaForm/typings';
import { ProColumns } from '@ant-design/pro-table/lib/typing';

import ExportFile from '@/components/ExportFile';
import ProTable, { ProTableAction } from '@/components/ProTable';
import {
	antiEpidemicType,
	antiEpidemicTypeTextMap,
	isHightValue,
	isHightValueTextMap,
	yesOrNoTextMap,
} from '@/constants/dictionary';
import { useCustodianList } from '@/hooks/useCustodianList';
import { useDistributorList } from '@/hooks/useDistributorList';
import { getType12, getType18, getType95 } from '@/pages/summary/dean2/service';
import { queryDepartmentList } from '@/services/department';
import { exportInvoicingUrl, getInvoicingList } from '@/services/invoicing';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { Cascader, Form, Input, Select } from 'antd';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';

const CommonList = ({ type }: { type: string }) => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const distributorOption = useDistributorList();
	const custodiansList = useCustodianList();
	const [treeData, setTreeData] = useState([]);
	const [isExportFile, setIsExportFile] = useState(false);
	const [isConsumableMaterial, setIsConsumableMaterial] = useState(true);

	let currentParams = {};
	const [systemType] = useState<string | null>(sessionStorage.getItem('systemType'));
	const newDictionary = JSON.parse(sessionStorage.getItem('newDictionary') || '{}');

	useEffect(() => {
		setTimeout(() => {
			form.submit();
		}, 200);
	}, []);

	const getCategoryData = (data: any, type: string) => {
		return data && data.length
			? data.map((o: Record<string, any>) => {
					const oNew = {
						label: type == '95' ? o.name : o.code,
						key: o.id,
						value: o.children ? o.id : o.code,
						children: getCategoryData(o.children, type),
					};
					if (!oNew.children) delete oNew.children;
					return oNew;
			  })
			: undefined;
	};

	// 获取基础物资分类列表
	const getGoodsCategory = async (type: string) => {
		let res: Record<string, any> = {};
		switch (type) {
			case '12':
				res = await getType12();
				break;
			case '18':
				res = await getType18();
				break;
			case '95':
				res = await getType95();
				break;
			default:
				break;
		}
		if (res && res.code === 0) {
			const data = getCategoryData(res.data, type);
			setTreeData(data);
		}
	};

	const resetCategoryList = (val: string) => {
		setTreeData([]);
		form.setFieldsValue({
			category: [],
		});
		getGoodsCategory(val);
	};

	const searchColumns: ProFormColumns = [
		{
			title: fields.goodsType,
			dataIndex: 'materialCategoryList',
			valueType: 'tagSelect',
			fieldProps: {
				fieldConfig: {
					label: 'value',
					value: 'name',
				},
				options: newDictionary.material_category || [],
			},
		},
		{
			title: '日期范围',
			dataIndex: 'time',
			valueType: 'dateRange',
			initialValue: [
				moment(moment().startOf('month')).format('YYYY/MM/DD'),
				moment().format('YYYY/MM/DD'),
			],
			fieldProps: {
				placeholder: ['开始日期', '结束日期'],
			},
		},
		{
			title: '科室',
			dataIndex: 'departmentId',
			valueType: 'apiSelect',
			hideInForm: type === 'repository',
			fieldProps: {
				showSearch: true,
				fieldConfig: {
					label: 'departmentName',
					value: 'departmentId',
				},
				api: queryDepartmentList,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			fieldProps: {
				placeholder: `请输入${fields.goodsCode}`,
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			fieldProps: {
				placeholder: '请输入本地医保编码',
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			fieldProps: {
				placeholder: `请输入${fields.goodsName}`,
			},
		},
		{
			title: '植/介入物',
			hideInForm: systemType === 'Insight_RS',
			valueType: 'select',
			dataIndex: 'implantation',
			fieldProps: {
				placeholder: '请选择是否植/介入物',
				options: [
					{
						value: true,
						label: '是',
					},
					{
						value: false,
						label: '否',
					},
				],
			},
		},
		{
			title: '条码管控',
			valueType: 'select',
			dataIndex: 'barcodeControlled',
			fieldProps: {
				placeholder: '请选择是否条码管控',
				options: [
					{
						value: true,
						label: '是',
					},
					{
						value: false,
						label: '否',
					},
				],
			},
		},
		{
			title: fields.goodsProperty,
			valueType: 'select',
			dataIndex: 'highValue',
			fieldProps: {
				placeholder: `请选择${fields.goodsProperty}`,
				options: isHightValue,
			},
		},
		{
			title: '医疗器械',
			valueType: 'select',
			dataIndex: 'medicalEquipment',
			fieldProps: {
				placeholder: '请选择是否医疗器械',
				options: [
					{
						value: true,
						label: '是',
					},
					{
						value: false,
						label: '否',
					},
				],
				onChange: (value: boolean) => setIsConsumableMaterial(!value),
			},
		},
		{
			title: `${fields.baseGoods}分类`,
			hideInForm: isConsumableMaterial,
			renderFormItem: () => (
				<Input.Group
					compact
					style={{ width: '100%', display: 'flex' }}>
					<Form.Item
						name='categoryType'
						style={{ marginBottom: 0 }}>
						<Select
							style={{ width: '78px' }}
							onChange={(val) => resetCategoryList(val)}
							allowClear>
							<Select.Option value='12'>12版</Select.Option>
							<Select.Option value='18'>18版</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item
						name='category'
						style={{
							marginBottom: 0,
							...(isConsumableMaterial ? { flex: 1 } : { width: '100%' }),
						}}>
						<Cascader
							showSearch
							getPopupContainer={(node) => node.parentNode}
							placeholder={`请选择${fields.baseGoods}分类`}
							options={treeData}
							style={{ width: '100%' }}
						/>
					</Form.Item>
				</Input.Group>
			),
		},
		{
			title: fields.antiEpidemic,
			valueType: 'radioButton',
			dataIndex: 'antiEpidemic',
			fieldProps: {
				className: 'search-radio-button',
				options: [{ label: '全部', value: '' }, ...antiEpidemicType],
			},
		},
		{
			title: fields.distributor,
			valueType: 'select',
			dataIndex: 'supplierId',
			fieldProps: {
				showSearch: true,
				placeholder: `请选择${fields.distributor}`,
				options: distributorOption,
			},
		},
		{
			title: `一级${fields.distributor}`,
			valueType: 'select',
			dataIndex: 'custodianId',
			fieldProps: {
				showSearch: true,
				placeholder: `请选择一级${fields.distributor}`,
				fieldNames: {
					label: 'companyName',
					value: 'id',
				},
				options: custodiansList,
			},
		},
	];

	const repColumns: ProColumns<InvoicingController.ListRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			renderText: (text: number, record, index: number) => index + 1,
			width: 'XXS',
		},
		{
			title: '日期范围',
			dataIndex: 'settlementPeriod',
			width: 'XL',
			renderText: (text: Date, record) => (
				<span>
					{moment(record.timeFrom).format('YYYY/MM/DD')}～
					{moment(record.timeTo).format('YYYY/MM/DD')}
				</span>
			),
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			width: 'XL',
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			width: 'XL',
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			width: 'L',
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			width: 'L',
		},
		{
			title: '条码管控',
			dataIndex: 'barcodeControlled',
			width: 'XXS',
			render: (text) => <span>{text ? '是' : '否'}</span>,
		},
		{
			title: fields.goodsProperty,
			dataIndex: 'highValue',
			width: 'XXS',
			renderText: (text: string) => <span>{isHightValueTextMap[text] || '-'}</span>,
		},
		{
			title: '植/介入物',
			dataIndex: 'implantation',
			hideInTable: systemType === 'Insight_RS',
			width: 'XXS',
			renderText: (text: string) => <span>{yesOrNoTextMap[text]}</span>,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			width: 'M',
			align: 'right',
			renderText: (text: number) => <span>{convertPriceWithDecimal(text)}</span>,
		},
		{
			title: '采购入库数量',
			dataIndex: 'quantityIn',
			width: 'S',
		},
		{
			title: '采购入库金额(元)',
			dataIndex: 'purchasePriceIn',
			width: 'L',
			align: 'right',
			renderText: (text: number, record) => (
				<span>{convertPriceWithDecimal(record.quantityIn * record.price)}</span>
			),
		},
		{
			title: '退货入库数量',
			dataIndex: 'quantityReturnedIn',
			width: 'S',
		},
		{
			title: '退货入库金额(元)',
			dataIndex: 'returnGoodsPriceIn',
			width: 'L',
			align: 'right',
			renderText: (text: number, record) => (
				<span>{convertPriceWithDecimal(record.quantityReturnedIn * record.price)}</span>
			),
		},
		{
			title: '出库数量',
			dataIndex: 'quantityOut',
			width: 'S',
		},
		{
			title: '出库金额(元)',
			dataIndex: 'totalPriceOut',
			width: 'M',
			align: 'right',
			renderText: (text: number, record) => (
				<span>{convertPriceWithDecimal(record.quantityOut * record.price)}</span>
			),
		},
		{
			title: '退货数量',
			dataIndex: 'quantityReturnedOut',
			width: 'S',
		},
		{
			title: '退货总金额(元)',
			dataIndex: 'totalPriceReturned',
			width: 'M',
			align: 'right',
			renderText: (text: number, record) => (
				<span>{convertPriceWithDecimal(record.quantityReturnedOut * record.price)}</span>
			),
		},
		{
			title: '结余数量',
			dataIndex: 'quantityRemained',
			width: 'S',
		},
		{
			title: '结余金额(元)',
			dataIndex: 'totalPriceRemained',
			width: 'M',
			align: 'right',
			renderText: (text: number, record) => {
				return <span>{convertPriceWithDecimal(record.quantityRemained * record.price)}</span>;
			},
		},
		{
			title: '医疗器械',
			dataIndex: 'medicalEquipment',
			width: 'XXS',
			renderText: (text: boolean) => <span>{text ? '是' : '否'}</span>,
		},
		{
			title: '级别',
			dataIndex: 'classification',
			width: 'XXS',
		},
		{
			title: '大类',
			dataIndex: 'subCatelogName',
			width: 'XL',
			ellipsis: true,
			renderText: (text: string, record) =>
				record.medicalEquipment ? record.subCatelogCode + text : text,
		},
		{
			title: '末级分类',
			dataIndex: 'serialNumber',
			width: 'XXL',
		},
		{
			title: fields.goodsType,
			dataIndex: 'materialCategory',
			width: 'S',
		},
		{
			title: fields.antiEpidemic,
			dataIndex: 'antiEpidemic',
			width: 'S',
			renderText: (text: string) => antiEpidemicTypeTextMap[text] || '',
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 'L',
			ellipsis: true,
		},
		{
			title: `一级${fields.distributor}`,
			dataIndex: 'custodianName',
			width: 'L',
			ellipsis: true,
			renderText: (text: string, record) => <span>{record.custodianId == 1 ? '-' : text}</span>,
		},
		{
			title: fields.distributor,
			dataIndex: 'supplierName',
			width: 'L',
			ellipsis: true,
		},
	];

	const depColumns: ProColumns<InvoicingController.ListRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			renderText: (text: number, record, index: number) => index + 1,
			width: 'XXS',
		},
		{
			title: '日期范围',
			dataIndex: 'settlementPeriod',
			width: 'XL',
			renderText: (text: Date, record) => (
				<span>
					{moment(record.timeFrom).format('YYYY/MM/DD')}～
					{moment(record.timeTo).format('YYYY/MM/DD')}
				</span>
			),
		},
		{
			title: '科室',
			dataIndex: 'departmentName',
			width: 'M',
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			width: 'XL',
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
			ellipsis: true,
			width: 'L',
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			width: 'L',
		},
		{
			title: '条码管控',
			dataIndex: 'barcodeControlled',
			width: 'XXS',
			renderText: (text: boolean) => <span>{text ? '是' : '否'}</span>,
		},
		{
			title: fields.goodsProperty,
			dataIndex: 'highValue',
			width: 'XXS',
			renderText: (text: string) => <span>{isHightValueTextMap[text] || '-'}</span>,
		},
		{
			title: '植/介入物',
			dataIndex: 'implantation',
			width: 'XXS',
			hideInTable: systemType === 'Insight_RS',
			renderText: (text: string) => <span>{yesOrNoTextMap[text]}</span>,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			width: 'M',
			align: 'right',
			renderText: (text: number) => <span>{convertPriceWithDecimal(text)}</span>,
		},
		{
			title: '入库数量',
			dataIndex: 'quantityIn',
			width: 'S',
		},
		{
			title: '消耗数量',
			dataIndex: 'quantityConsumedOut',
			width: 'S',
		},
		{
			title: '反消耗数量',
			dataIndex: 'quantityUnconsumedIn',
			width: 'S',
		},
		{
			title: '退货数量',
			dataIndex: 'quantityReturnedOut',
			width: 'S',
		},
		{
			title: '结余数量',
			dataIndex: 'quantityRemained',
			width: 'S',
		},
		{
			title: '医疗器械',
			dataIndex: 'medicalEquipment',
			width: 'XXS',
			renderText: (text: boolean) => <span>{text ? '是' : '否'}</span>,
		},
		{
			title: '级别',
			dataIndex: 'classification',
			width: 'XXS',
		},
		{
			title: '大类',
			dataIndex: 'subCatelogName',
			width: 'XL',
			renderText: (text: string, record) =>
				record.medicalEquipment ? record.subCatelogCode + text : text,
		},
		{
			title: '末级分类',
			dataIndex: 'serialNumber',
			width: 'XL',
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 'L',
			ellipsis: true,
		},
		{
			title: `一级${fields.distributor}`,
			dataIndex: 'custodianName',
			width: 'L',
			ellipsis: true,
			renderText: (text: string, record) => <span>{record.custodianId == 1 ? '-' : text}</span>,
		},
		{
			title: fields.distributor,
			dataIndex: 'supplierName',
			width: 'L',
			ellipsis: true,
		},
	];

	const tableColumns = type === 'repository' ? repColumns : depColumns;

	const reloadList: any = () => tableRef.current?.reload();

	const beforeSearch = (values: Record<string, any>) => {
		const params: Record<string, any> = {
			...values,
			category: values.categoryType ? 'std20' + values.categoryType : undefined,
			classification:
				values.categoryType && values.category && values.category[0]
					? values.category[0]
					: undefined,
			firstClass:
				values.categoryType && values.category && values.category[1]
					? values.category[1].split('-')[0]
					: undefined,
			lastClass:
				values.categoryType && values.category && values.category[2]
					? values.category[2]
					: values.category
					? values.category[values.category.length - 1]
					: undefined,
		};
		delete params.categoryType;
		currentParams = params;
		return params;
	};

	return (
		<>
			<ProTable<InvoicingController.ListRecord>
				api={getInvoicingList}
				columns={tableColumns}
				beforeSearch={beforeSearch}
				requestCompleted={(rows) => {
					setIsExportFile(rows.length > 0);
				}}
				params={{ centralWarehouse: type === 'repository' }}
				rowKey={(record, index?: number) => `${index}`}
				dateFormat={{
					time: {
						startKey: 'timeFrom',
						endKey: 'timeTo',
					},
				}}
				tableRef={tableRef}
				toolBarRender={() => [
					access['finance_invoicing_export'] && (
						<ExportFile
							data={{
								filters: currentParams,
								link: exportInvoicingUrl,
								getForm: () => reloadList(),
							}}
							disabled={!isExportFile}
						/>
					),
				]}
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				loadConfig={{ request: false }}
			/>
		</>
	);
};

export default CommonList;
