import type { ProTableProps } from '@/components/ProTable/typings';
import type { DensitySize } from '@ant-design/pro-table/lib/components/ToolBar/DensityIcon';

import ProTable, { widthMap as commonWidthMap } from '@/components/ProTable';
import { addOrUpdate, getPreferenceByCode } from '@/services/userPreference';
import { isEqual } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ResizableTitle from './ResizableTitle';

export type ResizableTableProps<T, U = Record<string, any>> = ProTableProps<T, U> & {
	tableInfoCode?: string;
};

const ResizableTable = <
	T extends Record<string, any>,
	U extends Record<string, any> = Record<string, any>,
>({
	components = {},
	size: prevSize,
	columns: prevColumns,
	tableInfoCode,
	...props
}: ResizableTableProps<T, U>): JSX.Element => {
	type ProColumns = ResizableTableProps<T, U>['columns'];

	const [columns, setColumns] = useState<ProColumns>([]);
	const [loading, setLoading] = useState<boolean>(false);
	// 用于保存最小初始值
	// 列本身width值小于96则最小伸缩宽度取原本的width值，大于96则最小伸缩宽度取96
	const initWidthMapRef = useRef<Record<string, number | string>>({});
	const [columnsState, setColumnsState] = useState<Record<string, any>>({});
	const prevColumnsStateRef = useRef<Record<string, any>>({});
	const columnsStateRef = useRef<Record<string, any>>({});
	// 无排序的情况下列本身width值小于80则最小伸缩宽度取原本的width值，大于80则最小伸缩宽度取96
	const [widthMap, setWithMap] = useState<Record<string, number | string>>({});
	const widthMapRef = useRef<Record<string, number | string>>({});
	const prevWidthMapRef = useRef<Record<string, number | string>>({});
	const [size, setSize] = useState<DensitySize>(prevSize || 'middle');
	const sizeRef = useRef<DensitySize>(prevSize || 'middle');
	const prevSizeRef = useRef<DensitySize>(prevSize || 'middle');
	const tableInfoConfigRef = useRef<Record<string, any> | undefined>();
	const updateInfoTimerRef = useRef<any>(null);

	// columns改变后才重新设置columns，防止resize后触发二次渲染
	useEffect(() => {
		const newInitWidthMap = {};
		(prevColumns || []).forEach((col) => {
			const key = (col.dataIndex || col.key) as string;
			let width = col.width;
			if (typeof width === 'string' && Reflect.has(commonWidthMap, width)) {
				width = commonWidthMap[width];
			}
			newInitWidthMap[key] = width
				? col.sorter
					? width > 76
						? 76
						: width
					: width < 60
					? width
					: 60
				: col.sorter
				? 76
				: 60;
		});
		initWidthMapRef.current = newInitWidthMap;
		setColumns(prevColumns);
	}, [prevColumns]);

	const handleResize = useCallback(
		(index: number) =>
			(_e: MouseEvent, { size }: { size: { width: number } }) => {
				const currentWidthMap = { ...widthMapRef.current };
				// 重置设置之前记录上一次width字典
				prevWidthMapRef.current = { ...widthMapRef.current };
				const item = { ...(columns || [])[index] };
				const key = (item.dataIndex || item.key) as string;
				// size.width小于最小初始值则设置width为最小初始值
				const width =
					size.width < initWidthMapRef.current[key] ? initWidthMapRef.current[key] : size.width;
				currentWidthMap[key] = width;
				widthMapRef.current = { ...currentWidthMap };
				setWithMap(widthMapRef.current);

				if (tableInfoCode) {
					setTimeout(() => {
						updateInfo('resize');
					}, 10);
				}
			},
		[tableInfoCode, columns],
	);

	const newColumns = useMemo(() => {
		return (columns || []).map((col, index: number) => {
			const key = (col.dataIndex || col.key) as string;
			return {
				...col,
				width: widthMapRef.current[key] || col.width,
				onHeaderCell: (column: Record<string, any>) => {
					const columnKey = column.dataIndex || column.key;
					return {
						width: widthMapRef.current[columnKey] || column.width,
						onResize: handleResize(index),
					};
				},
			};
		});
	}, [columns, widthMap]);

	// 获取是否需要更新表格信息，可以减少发送请求
	const getIsNeedToUpdate = useCallback(() => {
		if (sizeRef.current !== prevSizeRef.current) {
			return true;
		}
		if (!isEqual(widthMapRef.current, prevWidthMapRef.current)) {
			return true;
		}
		if (!isEqual(columnsStateRef.current, prevColumnsStateRef.current)) {
			return true;
		}
		return false;
	}, []);

	// 更新表格信息
	const updateInfo = useCallback(
		(type: 'unmount' | 'change' | 'resize') => {
			if (updateInfoTimerRef.current) {
				clearTimeout(updateInfoTimerRef.current);
				updateInfoTimerRef.current = null;
			}

			const detailInfo = JSON.stringify({
				size: sizeRef.current,
				stateMap: columnsStateRef.current,
				widthMap: widthMapRef.current,
			});

			const tableInfo = (tableInfoConfigRef.current || {})[tableInfoCode as string] || {};
			const params: Record<string, any> = { ...tableInfo, detailInfo };
			const isNeedToUpdate = getIsNeedToUpdate();

			// 切换页面或者同一个表格tableInfoCode改变后立即更新
			if (type === 'unmount' || type === 'change') {
				if (isNeedToUpdate) {
					prevWidthMapRef.current = { ...widthMapRef.current };
					prevSizeRef.current = sizeRef.current;
					prevColumnsStateRef.current = { ...columnsStateRef.current };
					addOrUpdate(params);
				}
			} else {
				if (!isNeedToUpdate) {
					return;
				}

				updateInfoTimerRef.current = setTimeout(() => {
					prevWidthMapRef.current = { ...widthMapRef.current };
					prevSizeRef.current = sizeRef.current;
					prevColumnsStateRef.current = { ...columnsStateRef.current };
					addOrUpdate(params);
				}, 2000);
			}
		},
		[tableInfoCode, getIsNeedToUpdate],
	);

	useEffect(() => {
		return () => {
			// 组件卸载更新表格信息
			if (tableInfoCode && tableInfoConfigRef.current) {
				updateInfo('unmount');
			}
		};
	}, []);

	// 获取表格信息
	const getTableInfo = useCallback(async (params: Record<string, any>, code: string) => {
		setLoading(true);
		try {
			const res = await getPreferenceByCode(params);
			if (res && res.code === 0) {
				const { data = [] } = res;
				let info: any = (data as any)[0];
				if (!info) {
					let json = JSON.parse(sessionStorage.getItem('tableInfoConfig') || '{}') || {};
					tableInfoConfigRef.current = json;
					const tableInfo = (json[code] || {}).json || '';
					if (tableInfo) {
						info = { detailInfo: tableInfo };
					}
				}
				if (info && info.detailInfo) {
					try {
						const initData: any = JSON.parse(info.detailInfo) || {};
						const { stateMap = {}, widthMap: currentWidthMap = {} } = initData;
						widthMapRef.current = { ...widthMapRef.current, ...currentWidthMap };
						prevWidthMapRef.current = { ...widthMapRef.current };
						columnsStateRef.current = { ...columnsStateRef.current, ...stateMap };
						prevColumnsStateRef.current = { ...columnsStateRef.current };
						sizeRef.current = initData.size || sizeRef.current || 'middle';
						prevSizeRef.current = sizeRef.current;
						setSize(sizeRef.current);
						setWithMap(widthMapRef.current);
						setColumnsState(columnsStateRef.current);
					} catch (e) {}
				}
			}
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!tableInfoCode) {
			return;
		}
		let config: Record<string, any> = tableInfoConfigRef.current || {};
		if (!tableInfoConfigRef.current) {
			try {
				config = JSON.parse(sessionStorage.getItem('tableInfoConfig') || '{}') || {};
				tableInfoConfigRef.current = config;
			} catch (e) {}
		}

		const tableInfo = config[tableInfoCode] || {};
		getTableInfo(
			tableInfo
				? {
						preferenceCode: tableInfo.preferenceCode,
				  }
				: {},
			tableInfoCode,
		);
	}, [tableInfoCode]);

	// 密度改变
	const onSizeChange = useCallback(
		(s: DensitySize): void => {
			if (typeof props.onSizeChange === 'function') {
				props.onSizeChange(s);
			}
			// 记录上一次的表格尺寸，用于判断是否需要更新（看了一下好像这个有点不必要）
			prevSizeRef.current = sizeRef.current;
			sizeRef.current = s;
			setSize(s);
			if (tableInfoCode) {
				setTimeout(() => {
					updateInfo('change');
				}, 10);
			}
		},
		[tableInfoCode, updateInfo],
	);

	// columns状态改变
	const onColumnsStateChange = useCallback(
		(cs: Record<string, any>): void => {
			if (typeof props.onColumnsStateChange === 'function') {
				props.onColumnsStateChange(cs);
			}
			if (props.columnsState && typeof props.columnsState?.onChange === 'function') {
				props.columnsState?.onChange(cs);
			}
			// 改变表格状态之前记录上一次的状态，用于判断是否需要更新
			prevColumnsStateRef.current = { ...columnsStateRef.current };
			columnsStateRef.current = { ...cs };
			setColumnsState(columnsStateRef.current);

			if (tableInfoCode) {
				setTimeout(() => {
					updateInfo('change');
				}, 10);
			}
		},
		[tableInfoCode, props.onColumnsStateChange, props.columnsState],
	);

	return (
		<ProTable<T, U>
			{...props}
			columnsState={{
				onChange: onColumnsStateChange,
				value: columnsState,
				...(props.columnsState || {}),
			}}
			size={size}
			onSizeChange={onSizeChange}
			components={{
				...components,
				header: {
					...(components.header || {}),
					cell: ResizableTitle,
				},
			}}
			columns={newColumns}
			loading={props.loading || loading}
		/>
	);
};

export default ResizableTable;
