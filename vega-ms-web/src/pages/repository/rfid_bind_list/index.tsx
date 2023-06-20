import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';
import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { timeType3 } from '@/constants';
import { getList, rfidStockExport, unbindingRfid } from '@/services/rfidStock';
import { judgeBarCodeOrUDI } from '@/utils';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { Button, Popconfirm } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';
import BindModal from './component/BindModal';
import RegisterModal from './component/RegisterModal';
interface RecordItem {
	tid: string;
	epc: string;
	operatorBarcode: string;
}
const RfBindList = () => {
	const { fields } = useModel('fieldsMapping');
	const [visible, setVisible] = useState(false);
	const [unbindRfidListLoading, setUnbindRfidListLoading] = useState(false);
	const tableRef = useRef<ProTableAction>();
	const access = useAccess();
	const [isExportFile, setIsExportFile] = useState(false);
	const searchColumns: ProFormColumns = [
		{
			title: '操作时间',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType3,
			},
		},
		{
			title: 'RFID',
			dataIndex: 'epc',
		},
		{
			title: `${fields.goods}条码/UDI`,
			valueType: 'scanInputWithSpace',
			dataIndex: 'operatorBarcode',
			fieldProps: {
				placeholder: '点击此处扫码',
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
		},
		{
			title: '规格/型号',
			dataIndex: 'commonSearch.specificationAndModel',
		},
	];

	// 解绑
	const unbindRfidList = async (record: RecordItem) => {
		try {
			const res = await unbindingRfid({
				tid: record.tid,
				operatorBarcode: record.operatorBarcode,
				epc: record.epc,
			});
			if (res && res.code == 0) {
				fetchList();
			}
		} finally {
			setUnbindRfidListLoading(false);
		}
	};

	const fetchList = () => {
		tableRef.current?.onReset();
	};

	const convertSearchParams = () => {
		return tableRef.current?.getParams()!;
	};

	const handleOk = () => {
		setVisible(false);
		fetchList();
	};

	const handleCancel = () => setVisible(false);

	const columns: ProColumns<RfidStockController.GetListRecord>[] = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			renderText: (_text, _record, index) => index + 1,
		},
		{
			width: 'L',
			title: 'RFID',
			dataIndex: 'epc',
		},
		{
			title: `${fields.goods}条码/UDI`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 'XXL',
			ellipsis: true,
			renderText: (text, record) => judgeBarCodeOrUDI(record),
		},
		{
			width: 'L',
			title: fields.goodsName,
			dataIndex: 'name',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			renderText: (text, record) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			width: 'XS',
			title: '单价(元)',
			dataIndex: 'price',
			align: 'right',
			renderText: (text) => convertPriceWithDecimal(text),
		},
		{
			width: 'L',
			sorter: true,
			title: '操作时间',
			dataIndex: 'timeCreated',
			renderText: (text) => (text ? moment(new Date(text)).format('YYYY/MM/DD HH:mm:ss') : '-'),
		},
		{
			width: 'XS',
			title: '操作员',
			ellipsis: true,
			dataIndex: 'operatorName',
		},
		{
			width: 'XS',
			title: '操作',
			dataIndex: 'option',
			render: (_text, record) => {
				return (
					<div className='operation'>
						<Popconfirm
							title='确定解绑？'
							onConfirm={() => unbindRfidList(record)}
							disabled={unbindRfidListLoading}>
							<span className='handleLink'>解绑</span>
						</Popconfirm>
					</div>
				);
			},
		},
	];

	const modal = {
		visible,
		handleCancel: handleCancel,
		handleOk: handleOk,
	};

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<ProTable<RfidStockController.GetListRecord>
				rowKey='id'
				api={getList}
				requestCompleted={(rows) => {
					setIsExportFile(rows.length > 0);
				}}
				tableInfoCode='repository_rfid_bing_list'
				columns={columns}
				searchConfig={{
					columns: searchColumns,
				}}
				dateFormat={{
					timeCreated: {
						endKey: 'createdTo',
						startKey: 'createdFrom',
					},
				}}
				loadConfig={{
					request: false,
				}}
				toolBarRender={() => [
					access['frid_upload'] && (
						<RegisterModal
							{...{
								title: 'RFID注册',
							}}
							trigger={<Button type='primary'>RFID注册</Button>}
						/>
					),
					<Button
						type='primary'
						onClick={() => setVisible(true)}
						style={{ width: 72 }}>
						绑定
					</Button>,
					access['rfid_bind_export'] && (
						<>
							<ExportFile
								data={{
									filters: convertSearchParams(),
									link: rfidStockExport,
									getForm: convertSearchParams,
								}}
								disabled={!isExportFile}
							/>
						</>
					),
				]}
				tableRef={tableRef}
			/>
			{visible && <BindModal {...modal} />}
		</div>
	);
};

export default RfBindList;
