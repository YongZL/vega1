// 配货单打印组件
import { getPrintSplitList } from '@/utils/dataUtil';
import { formatStrConnect } from '@/utils/format';
import Qrcode from 'qrcode.react';
import { forwardRef, LegacyRef, useEffect, useState } from 'react';
import styles from '../print.less';
import RenderTable from '../RenderTable';

interface PropsType {
	hospitalName: string;
	data: Record<string, any>;
}
const PickUpOrder = forwardRef(
	({ hospitalName, data }: PropsType, ref?: LegacyRef<HTMLDivElement> | undefined): JSX.Element => {
		const [totalPages, setTotalPages] = useState<number>(0);
		const [goodsPageList, setGoodsPageList] = useState([]);
		const [ordinaryPageList, setOrdinaryPageList] = useState([]);

		const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
		const { order, goodsList } = data;
		const {
			code,
			departmentName,
			warehouseName,
			workbenchName,
			pickerName,
			pickPackageOrdinaryDetail: packageOrdinaryList,
		} = order || {};

		const goodsColumns = [
			{
				title: '序号',
				dataIndex: 'index',
				width: '5%',
				render: (text: string, record: Record<string, any>, index: number) => index,
			},
			{
				title: '货位编号',
				dataIndex: 'locationNo',
				width: '12%',
			},
			{
				title: fields.goodsCode,
				dataIndex: 'materialCode',
				width: '12%',
			},
			{
				title: fields.goodsName,
				dataIndex: 'goodsName',
				width: '12%',
			},
			{
				title: '规格/型号',
				dataIndex: 'specification',
				width: '16%',
				tdMethods: { className: styles.tdModel },
				render: (text: string, item: Record<string, any>) => {
					return <p>{formatStrConnect(item, ['specification', 'model'])}</p>;
				},
			},
			{
				title: '生产厂家',
				dataIndex: 'manufacturerName',
				width: '12%',
			},
			{
				title: '本地医保编码',
				dataIndex: 'chargeNum',
				width: '12%',
			},
			{
				title: '国家医保编码',
				dataIndex: 'nationalNo',
				width: '12%',
			},
			{
				title: '推送数量',
				dataIndex: 'quantity',
				width: '7%',
				render: (text: number, record: Record<string, any>) => text + record.unit,
			},
		];

		const ordinaryColumns = [
			{
				title: '序号',
				dataIndex: 'index',
				width: '12%',
				render: (text: string, record: Record<string, any>, index: number) => index,
			},
			{
				title: fields.goodsCode,
				dataIndex: 'ordinaryCode',
				width: '24%',
			},
			{
				title: '医耗套包名称',
				dataIndex: 'ordinaryName',
				width: '32%',
			},
			{
				title: '包装数',
				dataIndex: 'quantity',
				width: '16%',
				render: () => '1份/包',
			},
			{
				title: '推送数量',
				dataIndex: 'quantity',
				width: '16%',
				render: (text: number) => text + '包',
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
												{fields.goods}配货单
											</p>
											<p className={styles['code']}>配货单号：{code}</p>
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
							<td>推送科室：{departmentName}</td>
							<td>推送仓库：{warehouseName}</td>
							<td>加工台号：{workbenchName}</td>
							<td>配货人员：{pickerName}</td>
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
								style={{ width: '50%' }}>
								<p>配货人员：</p>
								<p>签字日期：</p>
							</div>
							<div className={styles['autographWrap']}>
								<p>复核人员：</p>
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
					maxLineNum: 14,
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
						headerTitle={`${fields.baseGoods}`}
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

export default PickUpOrder;
