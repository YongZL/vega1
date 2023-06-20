// 科室验收打印组件
import { getPrintSplitList } from '@/utils/dataUtil';
import { formatStrConnect } from '@/utils/format';
import moment from 'moment';
import Qrcode from 'qrcode.react';
import { forwardRef, LegacyRef, useEffect, useState } from 'react';
import styles from '../print.less';
import RenderTable from '../RenderTable';

interface PropsType {
	hospitalName: string;
	data: Record<string, any>;
}
const AcceptanceOrder = forwardRef(
	({ hospitalName, data }: PropsType, ref?: LegacyRef<HTMLDivElement> | undefined): JSX.Element => {
		const [totalPages, setTotalPages] = useState<number>(0);
		const [goodsPageList, setGoodsPageList] = useState([]);
		const [ordinaryPageList, setOrdinaryPageList] = useState([]);

		const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
		const { order, goodsList } = data;
		const {
			warehouseName,
			inspectorTime,
			deliveryOrderCode,
			departmentName,
			inspectorName,
			acceptanceOrdinaryDetail: packageOrdinaryList,
		} = order || {};

		const goodsColumns = [
			{
				title: '序号',
				dataIndex: 'index',
				width: '4%',
				render: (text: string, record: Record<string, any>, index: number) => index,
			},
			{
				title: fields.goodsCode,
				dataIndex: 'materialCode',
				width: '7%',
			},
			{
				title: fields.goodsName,
				dataIndex: 'goodsName',
				width: '9%',
			},
			{
				title: '规格/型号',
				dataIndex: 'specification',
				width: '12%',
				tdMethods: { className: styles.tdModel },
				render: (text: string, item: Record<string, any>) => {
					return <p>{formatStrConnect(item, ['specification', 'model'])}</p>;
				},
			},
			{
				title: '生产厂家',
				dataIndex: 'manufacturerName',
				width: '9%',
			},
			{
				title: '产品注册证',
				dataIndex: 'registrationNum',
				width: '8%',
			},
			{
				title: '批号/序列号',
				dataIndex: 'lotNum',
				width: '10%',
				render: (text: string, record: Record<string, any>) =>
					`${text || '-'}/${record.serialNo || '-'}`,
			},
			{
				title: '有效期至',
				dataIndex: 'expirationDate',
				width: '8%',
				render: (text: number) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
			},
			{
				title: '数量',
				dataIndex: 'quantity',
				width: '6%',
				render: (text: number, record: Record<string, any>) => text + record.unit,
			},
			{
				title: '状态',
				dataIndex: 'status',
				width: '6%',
				render: (text: boolean) => (text === null ? '待验收' : text ? '通过' : '不通过'),
			},
			{
				title: '不通过原因',
				dataIndex: 'acceptanceConclusion1',
				width: '11%',
			},
			{
				title: `${fields.goods}条码/UDI`,
				dataIndex: 'operatorBarcode',
				width: '10%',
				render: (text: number, record: Record<string, any>) => {
					const { isBarcodeControlled, printed, udiCode } = record;
					return isBarcodeControlled ? (
						<Qrcode
							value={(() => {
								if (isBarcodeControlled) {
									return printed ? text : udiCode;
								} else {
									return text;
								}
							})()}
							style={{ width: '56px', height: '56px', margin: '0 auto' }}
						/>
					) : (
						'-'
					);
				},
			},
		];

		const ordinaryColumns = [
			{
				title: '序号',
				dataIndex: 'index',
				width: '8%',
				render: (text: string, record: Record<string, any>, index: number) => index,
			},
			{
				title: fields.goodsCode,
				dataIndex: 'ordinaryCode',
				width: '16%',
			},
			{
				title: '医耗套包名称',
				dataIndex: 'ordinaryName',
				width: '16%',
			},
			{
				title: '包装数',
				dataIndex: 'quantity',
				width: '10%',
				render: () => '1份/包',
			},
			{
				title: '推送数量',
				dataIndex: 'quantity',
				width: '10%',
				render: (text: number) => text + '包',
			},
			{
				title: '状态',
				dataIndex: 'status',
				width: '10%',
				render: (text: boolean) => (text === null ? '待验收' : text ? '通过' : '不通过'),
			},
			{
				title: '不通过原因',
				dataIndex: 'acceptanceConclusion',
				width: '16%',
			},
			{
				title: `${fields.goods}条码`,
				dataIndex: 'operatorBarcode',
				width: '14%',
				render: (text: string) => (
					<Qrcode
						value={text}
						style={{ width: '56px', height: '56px', margin: '0 auto' }}
					/>
				),
			},
		];

		const headerContent = () => {
			return (
				<>
					<table className={styles.table}>
						<thead>
							<tr className={styles.noBorder}>
								<td colSpan={4}>
									<div className={styles['listTitle']}>
										<div
											style={{ flex: 1 }}
											className={styles['titleInfo']}>
											<p className={styles['title']}>
												{hospitalName}
												{departmentName}
												{fields.goods}验收单
											</p>
											<p className={styles['code']}>推送单号：{deliveryOrderCode}</p>
										</div>
										<div className={styles['qrcode']}>
											<Qrcode
												value={`${deliveryOrderCode}`}
												style={{ width: '80px', height: '80px' }}
											/>
										</div>
									</div>
								</td>
							</tr>
						</thead>
						<tr className={styles.thead}>
							<td>配送科室：{departmentName}</td>
							<td>配送库房：{warehouseName}</td>
							<td>验收人员：{inspectorName}</td>
							<td>验收日期：{inspectorTime ? moment(inspectorTime).format('YYYY/MM/DD') : '-'}</td>
						</tr>
					</table>
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
							<div
								className={styles['autographWrap']}
								style={{ width: '33%' }}>
								<p>服务商推送人：</p>
								<p>签字日期：</p>
							</div>
							<div
								className={styles['autographWrap']}
								style={{ width: '33%' }}>
								<p>服务商复核人：</p>
								<p>签字日期：</p>
							</div>
							<div className={styles['autographWrap']}>
								<p>院方人员：</p>
								<p>签字日期：</p>
							</div>
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
					maxLineNum: 15,
				});
				setTotalPages(list.length);
				setGoodsPageList(list);
			}
			// 套包分页
			if (packageOrdinaryList && packageOrdinaryList.length > 0) {
				const list = getPrintSplitList({
					dataList: packageOrdinaryList,
					columns: ordinaryColumns,
					maxLineNum: 14,
				});
				setTotalPages(list.length);
				setOrdinaryPageList(list);
			}
		}, [goodsList, packageOrdinaryList]);

		return (
			<div
				className={styles['print-page']}
				ref={ref}>
				{/* 基础物资 */}
				{goodsPageList && goodsPageList.length > 0 && (
					<RenderTable
						headerContent={headerContent}
						footerContent={footerContent}
						headerTitle={`${fields.baseGoods} 共${goodsList.length}件`}
						columns={goodsColumns}
						dataList={goodsPageList}
					/>
				)}

				{/* 医耗套包 */}
				{ordinaryPageList && ordinaryPageList.length > 0 && (
					<RenderTable
						headerContent={headerContent}
						footerContent={footerContent}
						headerTitle='医耗套包'
						columns={ordinaryColumns}
						dataList={ordinaryPageList}
					/>
				)}
			</div>
		);
	},
);

export default AcceptanceOrder;
