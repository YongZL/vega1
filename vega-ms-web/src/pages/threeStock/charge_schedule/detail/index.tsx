import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import { ProColumns } from '@/components/ProTable';
import ProTable from '@/components/ResizableTable';
import { ProFormColumns } from '@/components/SchemaForm';
import { chargeType, timeType3 } from '@/constants';
import { charge_scheduleDetailsList, getDepartmentList } from '@/services/hisCharge';
import { convertPriceWithDecimal } from '@/utils/format';
import { Button, Card, Form } from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { connect, history, useModel } from 'umi';

interface UpdateProps {
	global: Record<string, any>;
	match: Record<string, any>;
	history: Record<string, any>;
}

const TableList: React.FC<UpdateProps> = ({ global, ...props }) => {
	//上个页面的id
	const id = props.match.params.id;
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');

	const columns: ProColumns<HisChargeController.HisChargeDetailList>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 'XXS',
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: '计费分类',
			dataIndex: 'chargeType',
			key: 'chargeType',
			ellipsis: true,
			width: 'S',
			renderText: (text: number) => <span>{text === 0 ? '医嘱' : '补记账'}</span>,
		},
		{
			title: '收费序号',
			dataIndex: 'adviceNo',
			key: 'adviceNo',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '收费项编号',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '收费项名称',
			dataIndex: 'chargeName',
			key: 'chargeName',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '本地医保编码',
			dataIndex: 'medicareNum',
			key: 'medicareNum',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			width: 'S',
			ellipsis: true,
		},
		{
			title: `${fields.goodsCode}/条码`,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 'L',
			renderText: (text: string, record) => {
				const info = `${text || ''} ${(text && record.operatorBarcode && '/') || ''} ${
					record.operatorBarcode || ''
				}`;
				return <span>{info}</span>;
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			key: 'name',
			width: 'L',
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 'L',
		},
		{
			title: '单位',
			dataIndex: 'unit',
			key: 'unit',
			width: 'XS',
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			align: 'right',
			width: 'XS',
			renderText: (text) => convertPriceWithDecimal(text),
		},
		{
			title: '病人姓名',
			dataIndex: 'patientName',
			key: 'patientName',
			width: 'XS',
		},
		{
			title: '病人编号',
			dataIndex: 'patientNo',
			key: 'patientNo',
			width: 'XS',
		},
		{
			title: '开单科室',
			dataIndex: 'deptName',
			key: 'deptName',
			width: 'XS',
		},
		{
			title: '开单医生',
			dataIndex: 'doctorCode',
			key: 'doctorCode',
			width: 'XS',
		},
		{
			title: '执行科室',
			dataIndex: 'deptName',
			key: 'deptName' + 'adviceNo',
			width: 'XS',
		},
		{
			title: '记账时间',
			dataIndex: 'createdTime',
			key: 'createdTime',
			width: 'XS',
			renderText: (time) => (time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-'),
		},
	];

	const searchColumns: ProFormColumns = [
		{
			title: '计费日期',
			dataIndex: 'submitTime',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType3,
			},
		},
		{
			title: '计费分类',
			dataIndex: 'chargeType',
			valueType: 'select',
			fieldProps: {
				options: chargeType,
			},
		},
		{
			title: '执行科室',
			dataIndex: 'deptId',
			valueType: 'apiSelect',
			fieldProps: {
				allowClear: true,
				showSearch: true,
				api: getDepartmentList,
				fieldConfig: {
					label: 'departmentName',
					value: 'departmentId',
				},
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
	];

	useEffect(() => {
		const state: any = history.location.state;
		if (state) sessionStorage.setItem('threeStock', JSON.stringify(state?.params));
	}, []);

	return (
		<div
			className='main-page'
			style={{ marginBottom: 10 }}>
			<div className='page-bread-crumb'>
				<Breadcrumb
					config={['', ['', { pathname: '/threeStock/charge_schedule', state: 'threeStock' }], '']}
				/>
			</div>

			<Card
				bordered={false}
				style={{ marginTop: 2 }}>
				<ProTable
					tableInfoCode='three_stock_charge_schedule_detail'
					params={{
						id,
					}}
					searchConfig={{
						form,
						columns: searchColumns,
					}}
					rowKey='id'
					columns={columns}
					dateFormat={{
						submitTime: {
							endKey: 'endTime',
							startKey: 'startTime',
						},
					}}
					api={charge_scheduleDetailsList}
				/>
			</Card>
			<FooterToolbar>
				<Button
					onClick={() => {
						history.push({ pathname: '/threeStock/charge_schedule', state: 'threeStock' });
					}}>
					返回
				</Button>
			</FooterToolbar>
		</div>
	);
};

export default connect(({ global }: { global: Record<string, any> }) => {
	global;
})(TableList);
