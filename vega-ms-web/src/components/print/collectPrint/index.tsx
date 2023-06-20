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
							align: item.align,
							dataIndex: item.dataIndex,
							width: ((item.width / totalWidth) * 100).toFixed(3) + '%',
							render: item.render ? item.render : null,
					  },
			);
			setDataColumns(dataColumns);
		}, [columns]);

		// 头部信息
		const headerContent = (pageIndex?: number) => {
			return (
				<>
					<thead>
						<tr className={styles.noBorder}>
							<td colSpan={columns && columns.length}>
								<div
									style={{ flex: 1, alignItems: 'center' }}
									className={styles['theadInfo']}>
									<p
										className={styles['title']}
										style={{ textAlign: 'center' }}>
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
													<div
														className={styles.subTitle}
														key={index}>
														<div className={styles.fill}>
															{item.label}：{startTime} — {endTime}
														</div>
														<div>
															第{(pageIndex || 0) + 1} &nbsp;&nbsp;&nbsp;页 / 共{totalPages}页
														</div>
													</div>
												);
											} else {
												return (
													<div
														className={styles.subTitle}
														key={index}>
														<div className={styles.fill}>
															{item.label}：{item.value}
														</div>
														<div>
															第{(index || 0) + 1} &nbsp;&nbsp;&nbsp;页 / 共{totalPages}页
														</div>
													</div>
												);
											}
										}
									})}
								</div>
								<div className={styles['qrcode']}></div>
							</td>
						</tr>
					</thead>
				</>
			);
		};
		const spanElement = (content: string) => {
			return <p style={{ width: '100%' }}>{content}</p>;
		};
		// 底部页码
		const footerContent = (index: number) => {
			return (
				<>
					<div
						className={styles['sized-box']}
						style={{ flex: 1 }}
					/>
					{index + 1 === totalPages && (
						<div style={{ display: 'flex', marginBottom: 40 }}>
							<div style={{ width: '39%', display: 'flex', marginRight: '18%' }}>
								{spanElement(`打印日期：${moment(new Date()).format('YYYY. MM. DD HH:mm:ss')}`)}
							</div>
							<div style={{ width: '50%', display: 'flex' }}>
								{spanElement(`制表人：`)}
								{spanElement(`负责人：`)}
							</div>
						</div>
					)}
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
