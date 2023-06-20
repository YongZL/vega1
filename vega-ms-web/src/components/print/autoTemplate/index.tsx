// 竖向动态打印打印组件
import { getPrintSplitList } from '@/utils/dataUtil';
import moment from 'moment';
import { forwardRef, LegacyRef, useEffect, useState } from 'react';
import styles from '../print.less';
import RenderTable from '../RenderTable';
import { convertPriceWithDecimal } from '@/utils/format';

interface PropsType {
	isVertical: boolean;
	hospitalName: string;
	moduleName: string;
	parameters?: Record<string, any>;
	data: Record<string, any>[];
	columns: Record<string, any>[];
	headDataList: Record<string, any>[];
}

interface Columns {
	title?: string; // th 的文字显示
	show?: boolean; // 是否显示 默认: true
	width?: string; // 宽度
	align?: string; // 对齐方式
	dataIndex: string; // 渲染数据对应的key
	render?: React.ReactNode; // 自定义渲染
	tdMethods?: Record<string, any>; // td 增加额外的属性
}

const AutoTemplate = forwardRef(
	(
		{ isVertical, hospitalName, moduleName, data, columns, headDataList }: PropsType,
		ref?: LegacyRef<HTMLDivElement> | undefined,
	): JSX.Element => {
		const [totalPages, setTotalPages] = useState<number>(0);
		const [dataColumns, setDataColumns] = useState<Columns[]>([]);
		const [dataList, setDataList] = useState<Record<string, any>[][]>([]);

		// 动态生成columns
		useEffect(() => {
			const totalWidth = (columns || []).reduce((pre, cur) => pre + (cur.width || 0), 0);
			const dataColumns = (columns || []).map((item: Record<string, any>) =>
				item.dataIndex === 'index'
					? {
							title: item.title,
							dataIndex: item.dataIndex,
							align: 'center',
							width: ((item.width / totalWidth) * 100).toFixed(3) + '%',
							render: (text: string, record: Record<string, any>, index: number) => index,
					  }
					: {
							title: item.title,
							dataIndex: item.dataIndex,
							align: item.align,
							width: ((item.width / totalWidth) * 100).toFixed(3) + '%',
							render: item.render ? item.render : null,
					  },
			);
			setDataColumns(dataColumns);
		}, [columns]);

		// 头部信息
		const headerContent = () => {
			return (
				<>
					<thead>
						<tr className={styles.noBorder}>
							<td colSpan={columns && columns.length}>
								<div className={styles['listTitle']}>
									<div
										style={{ flex: 1 }}
										className={styles['titleInfo']}>
										<p className={styles['title']}>
											{hospitalName}
											{moduleName}报表
										</p>
										{headDataList.map((item, index) => {
											// 时间选择/下拉选择
											if (['date_range', 'search_select'].includes(item.type)) {
												const time = item.value && item.value.split(',');
												if (time.length === 2) {
													const startTime =
														time && time[0] ? moment(Number(time[0])).format('YYYY-MM-DD') : '/';
													const endTime =
														time && time[1] ? moment(Number(time[1])).format('YYYY-MM-DD') : '/';
													return (
														<p
															className={styles['code']}
															key={index}>
															{item.label}：{startTime}-{endTime}
														</p>
													);
												} else {
													return (
														<p
															className={styles['code']}
															key={index}>
															{item.label}：{item.value}
														</p>
													);
												}
											}
										})}
									</div>
									<div className={styles['qrcode']}></div>
								</div>
							</td>
						</tr>
					</thead>
				</>
			);
		};

		// 底部页码
		const footerContent = (index: number) => {
			return (
				<>
					<div
						className={styles['sized-box']}
						style={{ flex: 1 }}
					/>
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
			if (data && data.length > 0) {
				// 获取分页完成数据 切记columns总和100%
				const list = getPrintSplitList({
					isVertical: isVertical,
					dataList: data || [],
					columns: dataColumns,
					maxLineNum: isVertical ? 29 : 18,
				});
				setTotalPages(list.length);
				setDataList(list);
			}
		}, [data]);

		return (
			<div
				className={styles['print-page']}
				ref={ref}>
				{/* 打印数据 */}
				{dataList && dataList.length > 0 && (
					<RenderTable
						isColSpanAlign={true}
						headerContent={headerContent}
						footerContent={footerContent}
						columns={dataColumns}
						dataList={dataList}
					/>
				)}
			</div>
		);
	},
);

export default AutoTemplate;
