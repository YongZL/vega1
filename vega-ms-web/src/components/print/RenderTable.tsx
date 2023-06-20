import styles from './print.less';

interface Columns {
	title?: string; // th 的文字显示
	show?: boolean; // 是否显示 默认: true
	width?: string; // 宽度
	align?: any; // 对齐方式
	dataIndex: string; // 渲染数据对应的key
	render?: React.ReactNode; // 自定义渲染
}

interface Props {
	headerTitle?: string;
	dataList: Record<string, any>[][];
	columns: Columns[];
	headerContent: (index?: number) => void;
	footerContent: (index: number) => void;
	isColSpanAlign?: boolean; // 实现头部col对齐，只能是渲染在一个table
	tdMethods?: Record<string, any>; // td 增加额外的属性
}

const renderTable = ({
	headerTitle,
	dataList,
	columns,
	headerContent,
	footerContent,
	isColSpanAlign = false,
}: Props) => {
	let indexNumber = 0;

	// 渲染tbody
	const renderTableBody = (listItem: Record<string, any>[]) => {
		return (
			<>
				<colgroup>
					{columns.map((col, colIndex) =>
						col.show === false ? undefined : (
							<col
								width={col.width}
								key={colIndex}
							/>
						),
					)}
				</colgroup>
				<tbody>
					{headerTitle && (
						<tr className={styles.thead}>
							<td colSpan={columns.filter((item) => item.show !== false).length}>{headerTitle}</td>
						</tr>
					)}
					<tr
						className={`${styles.thead} ${styles['thead-center']}`}
						style={{ whiteSpace: 'pre-wrap' }}>
						{columns.map((col, colIndex) =>
							col.show === false ? undefined : (
								<td
									key={colIndex}
									style={{ textAlign: col.align || 'center' }}>
									{col.title}
								</td>
							),
						)}
					</tr>
					{(listItem || []).map((item, index) => {
						indexNumber++;
						return (
							<tr
								className={styles.content}
								key={index}>
								{columns.map((col, colIndex) => {
									const { show, dataIndex, render, tdMethods = {} } = col;
									let renderText: any = '';
									if (show === false) {
										return undefined;
									}
									if (typeof render === 'function') {
										renderText = render(item[dataIndex], item, indexNumber);
										if (renderText === false) {
											return undefined;
										}
									}
									return (
										<td
											key={colIndex}
											style={{ textAlign: col.align || 'center' }}
											{...tdMethods}>
											{typeof render === 'function'
												? renderText
												: typeof item[dataIndex] !== 'undefined' && item[dataIndex] !== null
												? item[dataIndex]
												: '-'}
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</>
		);
	};

	return (
		<>
			{(dataList || []).map((listItem, index) => {
				return (
					<div
						style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
						key={index}>
						{/* 实现头部col对齐，只能是渲染在一个table */}
						{isColSpanAlign ? (
							<>
								<table className={styles.table}>
									{headerContent && headerContent(index)}
									{listItem && listItem.length > 0 && renderTableBody(listItem)}
								</table>
								{footerContent && footerContent(index)}
							</>
						) : (
							<>
								{headerContent && headerContent(index)}
								{listItem && listItem.length > 0 && (
									<table
										className={styles.table}
										style={{ marginTop: '-1px' }}>
										{renderTableBody(listItem)}
									</table>
								)}
								{footerContent && footerContent(index)}
							</>
						)}
					</div>
				);
			})}
		</>
	);
};

export default renderTable;
