// 中心库验收打印组件
import { receivingReportDetailStatusTextMap, taxRateTextMap } from '@/constants/dictionary';
import { getPrintSplitList } from '@/utils/dataUtil';
import { convertPriceWithDecimal, formatStrConnect, formatUnitNum } from '@/utils/format';
import { Col, Row } from 'antd';
import moment from 'moment';
import Qrcode from 'qrcode.react';
import { forwardRef, LegacyRef, useEffect, useState } from 'react';
import styles from '../print.less';
import RenderTable from '../RenderTable';

interface PropsType {
	hospitalName: string;
	data: Record<string, any>;
}
const isWX = sessionStorage.getItem('hospital_id') === '107'; //是否为吴兴医院
const Order = forwardRef(
	({ hospitalName, data }: PropsType, ref?: LegacyRef<HTMLDivElement> | undefined): JSX.Element => {
		const [totalPages, setTotalPages] = useState<number>(0);
		const [goodsPageList, setGoodsPageList] = useState([]);
		const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
		const { summary, raws: goodsList } = data;
		const {
			distributorName,
			warehouseName,
			actualAcceptanceDate,
			receivingCode,
			departmentName,
			totalAmount,
			purchaseName,
			ambivalentPlatformOrder,
			invoiceCode,
			invoiceNo,
			invoiceAmount,
			invoicingDate,
			taxRate,
		} = summary || {};

		const goodsColumns = [
			{
				title: '序号',
				dataIndex: 'index',
				width: '4%',
				render: (text: string, record: Record<string, any>, index: number) => index,
			},
			{
				title: fields.goodsName,
				dataIndex: 'goodsName',
				width: isWX ? '10%' : '8%',
				render: (text: string, record: Record<string, any>) =>
					text + (record.presenter ? '(赠送)' : ''),
			},
			{
				title: '规格/型号',
				dataIndex: 'specification',
				width: isWX ? '10%' : '8%',
				tdMethods: { className: styles.tdModel },
				render: (text: string, item: Record<string, any>) => {
					return <p>{formatStrConnect(item, ['specification', 'model'])}</p>;
				},
			},
			{
				title: '生产厂家',
				dataIndex: 'manufacturerName',
				width: '10%',
			},
			{
				title: '批号/序列号',
				dataIndex: 'lotNum',
				width: isWX ? '10%' : '8%',
				render: (text: string, record: Record<string, any>) =>
					`${text || '-'}/${record.serialNo || '-'}`,
			},
			{
				title: '生产日期',
				dataIndex: 'productionDate',
				width: isWX ? '8%' : '6%',
				render: (text: number) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
			},
			{
				title: '灭菌日期',
				dataIndex: 'sterilizationDate',
				width: isWX ? '8%' : '6%',
				render: (text: number) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
			},
			{
				title: '有效期至',
				dataIndex: 'expirationDate',
				width: isWX ? '8%' : '6%',
				render: (text: number) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
			},
			{
				title: '大/中包装',
				dataIndex: 'largeBoxNum',
				width: '8%',
				show: !isWX,
				render: (text: string, record: Record<string, any>) =>
					formatUnitNum(text ? text : '', record.unitNum),
			},
			{
				title: '本单数',
				dataIndex: 'quantityInMin',
				width: '6%',
				show: !isWX,
				render: (text: number, record: Record<string, any>) => text + record.minUnitName,
			},
			{
				title: '状态',
				dataIndex: 'status',
				width: '6%',
				show: !isWX,
				render: (text: string) => receivingReportDetailStatusTextMap[text],
			},
			{
				title: '通过数',
				dataIndex: 'passedQuantity',
				width: isWX ? '8%' : '6%',
				render: (text: number, record: Record<string, any>) => text + record.minUnitName,
			},
			{
				title: '单价',
				dataIndex: 'price',
				width: '8%',
				show: isWX,
				render: (text: number) => convertPriceWithDecimal(text),
			},
			{
				title: '总价',
				dataIndex: 'totalPrice',
				width: '8%',
				show: isWX,
				render: (text: number) => convertPriceWithDecimal(text),
			},
			{
				title: '不通过原因',
				dataIndex: 'acceptanceConclusion',
				width: '10%',
				show: !isWX,
			},
			{
				title: `${fields.goods}条码/UDI`,
				dataIndex: 'operatorBarcode',
				width: '8%',
				render: (text: number, record: Record<string, any>) => {
					const {
						barcodeControlled,
						printed,
						udiCode,
						status,
						newGoodsItemId,
						newOperatorBarcode,
						operatorBarcode,
					} = record;
					return !barcodeControlled ||
						status === 'rejected' ||
						!(barcodeControlled && !printed
							? udiCode
							: newGoodsItemId
							? newOperatorBarcode
							: operatorBarcode) ? ( //这括号
						'-'
					) : (
						// 条码管控物资     => 物资是否有赋码，有则显示物资条码，没有则显示udi码
						<Qrcode
							value={
								barcodeControlled && !printed
									? udiCode
									: newGoodsItemId
									? newOperatorBarcode
									: operatorBarcode
							}
							style={{ width: '56px', height: '56px', margin: '0 auto' }}
						/>
					);
				},
			},
		];

		const headerContent = () => {
			return (
				<>
					<thead>
						<tr className={styles.noBorder}>
							<td colSpan={goodsColumns.filter((item) => item.show !== false).length}>
								<div className={styles['listTitle']}>
									<div
										style={{ flex: 1 }}
										className={styles['titleInfo']}>
										<p className={styles['title']}>
											{hospitalName}
											{fields.goods}入库单
										</p>
										<Row className={styles['headLeft']}>
											<Col className={styles['headLeftItem']}>验收单号：{receivingCode || '-'}</Col>
											<Col
												className={styles['headLeftItem']}
												style={{ marginLeft: 20 }}>
												发票编号：{invoiceCode || '-'}
											</Col>
											<Col
												className={styles['headLeftItem']}
												style={{ marginLeft: 20 }}>
												发票代码：{invoiceNo || '-'}
											</Col>
										</Row>
										<Row className={styles['headLeft']}>
											<Col className={styles['headLeftItem']}>
												开票日期：
												{invoicingDate ? moment(invoicingDate).format('YYYY/MM/DD HH:mm:ss') : '-'}
											</Col>
											<Col
												className={styles['headLeftItem']}
												style={{ marginLeft: 20 }}>
												税率：{taxRateTextMap[taxRate] || '-'}
											</Col>
											<Col
												className={styles['headLeftItem']}
												style={{ marginLeft: 20 }}>
												发票金额：
												{invoiceAmount || invoiceAmount == 0
													? convertPriceWithDecimal(invoiceAmount) + ' 元'
													: '-'}
											</Col>
										</Row>
									</div>
									<div className={styles['qrcode']}>
										<Qrcode
											value={`${receivingCode}`}
											style={{ width: '80px', height: '80px' }}
										/>
									</div>
								</div>
							</td>
						</tr>
					</thead>
					{isWX ? (
						<>
							{WEB_PLATFORM === 'MS' ? (
								<>
									<tr className={styles.thead}>
										<td colSpan={4}>
											{fields.distributor}：{distributorName}
										</td>
										<td colSpan={4}>两定平台订单：{ambivalentPlatformOrder ? '是' : '否'}</td>
										<td colSpan={4}>验收仓库：{warehouseName}</td>
									</tr>
									<tr className={styles.thead}>
										<td colSpan={4}>采购人员：{purchaseName}</td>
										<td colSpan={4}>合计：{convertPriceWithDecimal(totalAmount)}</td>
										<td colSpan={4}>
											预计验收日期：
											{actualAcceptanceDate
												? moment(actualAcceptanceDate).format('YYYY/MM/DD HH:mm:ss')
												: '-'}
										</td>
									</tr>
								</>
							) : (
								<>
									<tr className={styles.thead}>
										<td colSpan={4}>
											{fields.distributor}：{distributorName}
										</td>
										<td colSpan={4}>验收仓库：{warehouseName}</td>
										<td colSpan={4}>采购人员：{purchaseName}</td>
									</tr>
									<tr className={styles.thead}>
										<td colSpan={4}>合计：{convertPriceWithDecimal(totalAmount)}</td>
										<td colSpan={4}>
											预计验收日期：
											{actualAcceptanceDate
												? moment(actualAcceptanceDate).format('YYYY/MM/DD HH:mm:ss')
												: '-'}
										</td>
										<td colSpan={4}></td>
									</tr>
								</>
							)}
						</>
					) : (
						<tr className={styles.thead}>
							<td colSpan={5}>
								{fields.distributor}：{distributorName}
							</td>
							<td colSpan={3}>验收科室：{departmentName}</td>
							<td colSpan={4}>验收仓库：{warehouseName}</td>
							<td colSpan={2}>
								预计验收日期：
								{actualAcceptanceDate
									? moment(actualAcceptanceDate).format('YYYY/MM/DD HH:mm:ss')
									: '-'}
							</td>
						</tr>
					)}
				</>
			);
		};

		const footerContent = (index: number) => {
			return (
				<>
					<div
						className={styles['sized-box']}
						style={{ flex: 1 }}
					/>
					{index === totalPages - 1 && (
						<div className={styles['footer']}>
							{isWX ? (
								<>
									<div
										className={styles['autographWrap']}
										style={{ width: '25%' }}>
										<p>负责人员：</p>
										<p>签字日期：</p>
									</div>
									<div
										className={styles['autographWrap']}
										style={{ width: '25%' }}>
										<p>会计人员：</p>
										<p>签字日期：</p>
									</div>
									<div
										className={styles['autographWrap']}
										style={{ width: '25%' }}>
										<p>验收人员：</p>
										<p>签字日期：</p>
									</div>
									<div className={styles['autographWrap']}>
										<p>复核人员：</p>
										<p>签字日期：</p>
									</div>
								</>
							) : (
								<>
									<div
										className={styles['autographWrap']}
										style={{ width: '33%' }}>
										<p>收货人员：</p>
										<p>签字日期：</p>
									</div>
									<div
										className={styles['autographWrap']}
										style={{ width: '33%' }}>
										<p>复核人员：</p>
										<p>签字日期：</p>
									</div>
									<div className={styles['autographWrap']}>
										<p>院方验收人员：</p>
										<p>签字日期：</p>
									</div>
								</>
							)}
						</div>
					)}
					<div className={styles['footer']}>
						<div
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'center',
								marginBottom: '20px',
							}}>
							<p style={{ marginTop: -12 }}>{index + 1 + '/' + totalPages}</p>
						</div>
					</div>
					<div style={{ pageBreakAfter: 'always' }} />
				</>
			);
		};

		useEffect(() => {
			// 物资分页
			if (goodsList && goodsList.length > 0) {
				// 获取分页完成数据 切记columns总和100%
				const list = getPrintSplitList({
					dataList: goodsList,
					columns: goodsColumns,
					maxLineNum: 16,
				});
				setTotalPages(list.length);
				setGoodsPageList(list);
			}
		}, [goodsList]);

		return (
			<div
				className={styles['print-page']}
				ref={ref}>
				{/* 基础物资 */}
				{goodsPageList && goodsPageList.length > 0 && (
					<RenderTable
						isColSpanAlign={true}
						headerContent={headerContent}
						footerContent={footerContent}
						columns={goodsColumns}
						dataList={goodsPageList}
					/>
				)}
			</div>
		);
	},
);

export default Order;
