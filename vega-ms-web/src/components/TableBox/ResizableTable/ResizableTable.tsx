import React, { useMemo, useState, cloneElement, ReactElement, useEffect, useRef, FC } from 'react';
import ResizableTitle from './ResizableTitle';
import { cloneDeep } from 'lodash';

export interface ResizableTableProps {
	[x: string]: any;
}

const ResizableTable: FC<ResizableTableProps> = ({ children, getColumnsWidth }): ReactElement => {
	const [columns, setColumns] = useState<any[]>([]);
	// 用于保存最小初始值
	// 列本身width值小于96则最小伸缩宽度取原本的width值，大于96则最小伸缩宽度取96
	// 无排序的情况下列本身width值小于80则最小伸缩宽度取原本的width值，大于80则最小伸缩宽度取96
	const [initWidth, setInitWidth] = useState<number[]>([]);
	const [widthList, setWidthList] = useState<number[]>([]);
	const timerRef = useRef<any>(null);
	const typeRef = useRef<string>('init');

	// columns改变后才重新设置columns，防止resize后触发二次渲染
	useEffect(() => {
		const cols = cloneDeep((children as ReactElement).props.columns);
		const newInitWidth: number[] = [];
		const newWidthList = widthList.length ? [...widthList] : [];
		cols.forEach((col: any, index: number) => {
			newInitWidth[index] = col.width
				? col.sorter
					? col.width > 96
						? 96
						: col.width
					: col.width < 80
					? col.width
					: 80
				: col.sorter
				? 96
				: 80;

			// 如果getColumnsWidth不是函数，父级组件一般不需要更新宽度
			newWidthList[index] =
				typeof getColumnsWidth === 'function'
					? col.width || newInitWidth[index]
					: newInitWidth[index] || col.width;
		});
		setInitWidth(newInitWidth);
		setWidthList(newWidthList);
		setColumns(cols);
		typeRef.current = 'init';
	}, [(children as ReactElement).props.columns]);

	const handleResize =
		(index: number) =>
		(e: MouseEvent, { size }: any) => {
			const newWidthList = [...widthList];
			let nextColumns: any = [];
			nextColumns = cloneDeep(columns);
			// size.width小于最小初始值则设置width为最小初始值
			const width = size.width < initWidth[index] ? initWidth[index] : size.width;
			newWidthList[index] = width;
			nextColumns[index].width = width;

			setWidthList(newWidthList);
			setColumns(nextColumns);
			typeRef.current = 'resize';
		};

	const newColumns = useMemo((): Array<never> => {
		const columnsWidthMap = {};
		const columnList: any = columns.map((col: any, index: number) => {
			const width = widthList[index] ? widthList[index] : col.width;
			col.dataIndex && (columnsWidthMap[col.key || col.dataIndex] = width);
			return {
				...col,
				width,
				onHeaderCell: (column: any) => {
					return {
						width: widthList[index] ? widthList[index] : column.width,
						onResize: handleResize(index),
					};
				},
			};
		});
		if (typeof getColumnsWidth === 'function') {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
			// 手动改变的情况下才更新宽度配置
			timerRef.current = setTimeout(() => {
				if (typeRef.current === 'resize') {
					getColumnsWidth(columnsWidthMap);
				}
			}, 500);
		}
		return columnList;
	}, [columns, widthList]);

	const { components = {} } = (children as ReactElement).props;
	const newComponents = {
		...components,
		header: {
			...(components.header || {}),
			cell: ResizableTitle,
		},
	};

	const element = useMemo(() => {
		return cloneElement(children as ReactElement, {
			components: newComponents,
			columns: newColumns,
		});
	}, [children, newColumns]);

	return <>{element}</>;
};

export default ResizableTable;
