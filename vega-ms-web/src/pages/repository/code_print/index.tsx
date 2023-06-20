import type { ColumnsType } from 'antd/es/table/Table';
import type { Type } from './data.d';

import img from '@/assets/images/tableEmpty.png';
import Breadcrumb from '@/components/Breadcrumb';
import ThermalPrinter from '@/components/print/ThermalPrinter';
import ScanInput from '@/components/ScanInput';
import TableBox from '@/components/TableBox';
import api from '@/constants/api';
import { retryPrintBarcode, transformSBCtoDBC } from '@/utils';
import { formatToGS1, formatStrConnect } from '@/utils/format';
import request from '@/utils/request';
import { notification } from '@/utils/ui';
import { Button, Card, Row } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import { connect, useModel } from 'umi';
import styles from './index.less';
// type: 'goods_code', //物品类型  package_bulk    surgical_pkg_bulk

const TaggingCode = ({ dispatch }) => {
	const { fields } = useModel('fieldsMapping');
	const [detailList, setDetailList] = useState<any[]>([]);
	const [type, setType] = useState<Type>(Type.goods_code);
	const [operatorBarcode, setOperatorBarcode] = useState('');
	const thermalPrinter = useRef();
	const goodsColumns: ColumnsType<any> = [
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 180,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 150,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 200,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text: any, record: any) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 150,
			ellipsis: true,
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 160,
			render: (text) => {
				return <span>{text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'}</span>;
			},
		},
		{
			title: '灭菌日期',
			dataIndex: 'sterilizationDate',
			key: 'sterilizationDate',
			width: 160,
			render: (text) => {
				return <span>{text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'}</span>;
			},
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 160,
			render: (text) => <span>{text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'}</span>,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 160,
			ellipsis: true,
		},
		{
			title: '操作',
			dataIndex: 'print',
			key: 'print',
			width: 62,
			fixed: 'right',
			render: (text, record) => {
				return (
					<div className='operation'>
						<span
							className='handleLink'
							onClick={() => printBarCode(record)}>
							{record.printed ? '补打' : '打印'}
						</span>
					</div>
				);
			},
		},
	];
	const packageBulkColumns: ColumnsType<any> = [
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
		},
		{
			title: '定数包名称',
			dataIndex: 'name',
			key: 'name',
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			ellipsis: true,
		},
		{
			title: '包装数',
			dataIndex: 'quantity',
			key: 'quantity',
			render: (text, record) => {
				return <span>{record.quantity + record.minGoodsUnit}</span>;
			},
		},
		{
			title: '操作',
			dataIndex: 'print',
			key: 'print',
			width: 62,
			render: (text, record) => {
				return (
					<div className='operation'>
						<span
							className='handleLink'
							onClick={() => printBarCode(record)}>
							{record.printed ? '补打' : '打印'}
						</span>
					</div>
				);
			},
		},
	];
	const surgicalPkgColumns: ColumnsType<any> = [
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
		},
		{
			title: '套包名称',
			dataIndex: 'name',
			key: 'name',
			ellipsis: true,
		},
		{
			title: '套包详情',
			dataIndex: 'detailGoodsMessage',
			key: 'detailGoodsMessage',
			ellipsis: true,
		},
		{
			title: '操作',
			dataIndex: 'print',
			key: 'print',
			width: 62,
			render: (text, record) => {
				return (
					<div className='operation'>
						<span
							className='handleLink'
							onClick={() => printBarCode(record)}>
							{record.printed ? '补打' : '打印'}
						</span>
					</div>
				);
			},
		},
	];
	const handleChange = () => {};

	const scanSubmit = async (scanValue) => {
		// 添加支持gs1扫码
		scanValue = transformSBCtoDBC(scanValue);
		let gs1Code = scanValue.indexOf('_') > -1 ? scanValue : formatToGS1(scanValue);
		let params = {
			operatorBarcode: gs1Code,
		};
		setOperatorBarcode(scanValue);
		const res = await request(`${api.stock.getMaterialInfo}`, {
			params: params,
		});
		if (res && res.code === 0) {
			setDetailList([res.data]);
			const type = res.data.packageSurgicalId
				? Type.surgical_pkg_bulk
				: res.data.packageId
				? Type.package_bulk
				: Type.goods_code;
			setType(type);
			setOperatorBarcode('');
		}
	};

	const printBarCode = (record) => {
		if (!Object.keys(thermalPrinter.current.state.selected_device).length) {
			notification.warning('请先选择打印机');
			return;
		}
		let params = {
			id: record.id,
			type: record.packageSurgicalId
				? Type.surgical_pkg_bulk
				: record.packageId
				? Type.package_bulk
				: Type.goods_code,
		};
		dispatch({
			type: 'global/thermalPrint',
			payload: params,
		}).then((res) => {
			if (res && res.code === 0) {
				let printResult = thermalPrinter.current.print(res.data);
				printResult.xhr.onreadystatechange = async function () {
					// 当打印结果为500时，修改当前打印条目状态为打印失败
					if (printResult.xhr.readyState === 4 && printResult.xhr.status >= 500) {
						// 当打印失败时重试，默认重试三次
						let result = await retryPrintBarcode(thermalPrinter.current, res.data);
						if (result === 'error') {
							record.printed = false;
						} else if (result === 'success') {
							record.printed = true;
							dispatch({
								type: 'global/markPrintSuccess',
								payload: {
									id: record.id,
									type: 'shipping_goods',
								},
							});
							setDetailList([record]);
						}
					} else if (printResult.xhr.readyState === 4 && printResult.xhr.status === 200) {
						record.printed = true;
						dispatch({
							type: 'global/markPrintSuccess',
							payload: {
								id: record.id,
								type: 'shipping_goods',
							},
						});
						setDetailList([record]);
					}
				};
			}
		});
	};

	const handleClear = () => {
		setDetailList([]);
	};

	const columns =
		type === Type.goods_code
			? goodsColumns
			: type === Type.package_bulk
			? packageBulkColumns
			: surgicalPkgColumns;
	return (
		<div>
			<Breadcrumb config={['', '']} />
			<Card>
				<Row justify='space-between'>
					<div className='thermalPrinterWrap'>
						<label>*</label>
						<span>选择打印机 :</span>
						<ThermalPrinter ref={thermalPrinter} />
					</div>
					<div>
						<span>扫描{fields.baseGoods}:</span>
						<ScanInput
							value={operatorBarcode}
							placeholder={'点击此处扫码'}
							className='scanInput btnOperator'
							onSubmit={scanSubmit}
							onPressEnter={scanSubmit}
							onChange={handleChange}
							style={{ width: '180px', height: '32px' }}
							autoFocus={true}
						/>
					</div>
				</Row>
				{detailList.length > 0 ? (
					<TableBox
						columns={columns}
						rowKey='id'
						dataSource={detailList}
						pagination={false}
						showHeader={!!detailList.length}
						options={{ density: false, fullScreen: false, setting: false }}
						scroll={{ x: '100%', y: 300 }}
						tableInfoId='176'
					/>
				) : (
					<div style={{ textAlign: 'center' }}>
						<img src={img}></img>
						<div className={styles.emptyText}>请扫描{fields.baseGoods}</div>
					</div>
				)}
				{detailList.length ? (
					<Button
						type='primary'
						className={styles.clearButton}
						onClick={handleClear}>
						清空
					</Button>
				) : null}
			</Card>
		</div>
	);
};
export default connect(({ loading }: { loading: { effects: { [key: string]: boolean } } }) => ({
	submitting: loading.effects['purchaseOrder/addpurchaseOrder'],
	loading: loading.effects['delivery/queryDeliveryList'],
}))(TaggingCode);
