// 科室验收打印组件
import { getPrintSplitList } from '@/utils/dataUtil';
import { formatStrConnect, formatUnitNum2 } from '@/utils/format';
import Qrcode from 'qrcode.react';
import { forwardRef, LegacyRef, useEffect, useState } from 'react';
import styles from '../print.less';
import RenderTable from '../RenderTable';

interface PropsType {
	hospitalName: string;
	data: Record<string, any>;
}
const departmentReturnOrder = forwardRef(
	({ hospitalName, data }: PropsType, ref?: LegacyRef<HTMLDivElement> | undefined): JSX.Element => {
		const [totalPages, setTotalPages] = useState<number>(0);
		const [goodsPageList, setGoodsPageList] = useState([]);
		const [ordinaryPageList, setOrdinaryPageList] = useState([]);

		const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
		const { order, goodsList, packageOrdinaryList } = data;
		const { code, departmentName, contactPhone } = order || {};

		const goodsColumns = [
			{
				title: '序号',
				dataIndex: 'index',
				width: '5%',
				render: (text: string, record: Record<string, any>, index: number) => index,
			},
			{
				title: fields.goodsCode,
				dataIndex: 'materialCode',
				width: '8%',
			},
			{
				title: fields.goodsName,
				dataIndex: 'goodsName',
				width: '10%',
			},
			{
				title: '规格/型号',
				dataIndex: 'specification',
				width: '14%',
				tdMethods: { className: styles.tdModel },
				render: (text: string, item: Record<string, any>) => {
					return <p>{formatStrConnect(item, ['specification', 'model'])}</p>;
				},
			},
			{
				title: '批号/序列号',
				dataIndex: 'lotNum',
				width: '12%',
				render: (text: string, item: Record<string, any>) =>
					`${item.lotNum || '-'}/${item.serialNum || '-'}`,
			},
			{
				title: '生产厂家',
				dataIndex: 'manufacturerName',
				width: '16%',
			},
			{
				title: '大/中包装',
				dataIndex: 'registrationNum',
				width: '8%',
				render: (text: string, item: Record<string, any>) =>
					formatUnitNum2(item.unitNum, item.largeBoxNum),
			},
			{
				title: '数量',
				dataIndex: 'expirationDate',
				width: '5%',
				render: (text: string, item: Record<string, any>) => item.quantity + item.minGoodsUnitName,
			},
			{
				title: '退货事由',
				dataIndex: 'returnReasonCh',
				width: '10%',
			},

			{
				title: `${fields.goods}条码/UDI`,
				dataIndex: 'operatorBarcode',
				width: '12%',
				render: (text: number, record: Record<string, any>) =>
					record.barcodeControlled ? (
						<Qrcode
							value={
								record.printed
									? record.newGoodsItemId
										? record.newOperatorBarcode
										: record.operatorBarcode
									: record.udiCode
							}
							style={{ width: '56px', height: '56px', margin: '0 auto' }}
						/>
					) : (
						'-'
					),
			},
		];

		const ordinaryColumns = [
			{
				title: '序号',
				dataIndex: 'index',
				width: '5%',
				render: (text: string, record: Record<string, any>, index: number) => index,
			},
			{
				title: fields.goodsCode,
				dataIndex: 'materialCode',
				width: '13%',
				render: (text: string) => text || '-',
			},
			{
				title: '医耗套包名称',
				dataIndex: 'name',
				width: '18%',
			},
			{
				title: '包装数',
				dataIndex: 'name',
				width: '10%',
				render: () => '1份/包',
			},
			{
				title: '推送数量',
				dataIndex: 'quantity',
				width: '10%',
				render: (text: string, item: Record<string, any>) => item.quantity + '包',
			},
			{
				title: '状态',
				dataIndex: 'manufacturerName',
				width: '10%',
				render: (text: string, item: Record<string, any>) =>
					item.status === null ? '待验收' : item.status ? '通过' : '不通过',
			},
			{
				title: '不通过原因',
				dataIndex: 'returnReasonCh',
				width: '19%',
			},
			{
				title: `${fields.goods}条码`,
				dataIndex: 'operatorBarcode',
				width: '15%',
				render: (text: string, item: any) => (
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
					<thead>
						<tr className={styles.noBorder}>
							<td colSpan={10}>
								<div className={styles['listTitle']}>
									<div
										style={{ flex: 1 }}
										className={styles['titleInfo']}>
										<p className={styles['title']}>
											{hospitalName}
											{fields.goods}退货单
										</p>
										<p className={styles['code']}>退货单号：{code}</p>
									</div>
									<div className={styles['qrcode']}>
										<Qrcode
											value={`${code}`}
											style={{ width: '80px', height: '80px' }}
										/>
									</div>
								</div>
							</td>
						</tr>
					</thead>
					<tr className={styles.thead}>
						<td colSpan={6}>科室：{departmentName}</td>
						<td colSpan={4}>联系电话：{contactPhone}</td>
					</tr>
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
								style={{ width: '50%' }}>
								<p>退送人员：</p>
								<p>签字日期：</p>
							</div>
							<div className={styles['autographWrap']}>
								<p>接收人员：</p>
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
					maxLineNum: 15,
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
						isColSpanAlign={true}
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
						isColSpanAlign={true}
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

export default departmentReturnOrder;
