import React, { FC, useEffect, useState, useRef, useMemo } from 'react';
// import { Table } from 'antd';
import { isEqual, cloneDeep } from 'lodash';
import ProTable from '@ant-design/pro-table';
import ResizableTable from './ResizableTable';
import { getPreferenceByCode, addOrUpdate } from '@/services/userPreference';
import { Empty } from 'antd';

const TableBox: FC<any> = (props: any = {}): JSX.Element => {
	const {
		size = 'middle',
		columnEmptyText = '',
		options = {},
		scroll = {},
		search,
		tableInfoId,
		isFirst = false,
		...rest
	} = props;
	const [columns, setColumns] = useState<any[]>([]);
	const [initColumnsStateMap, setInitColumnsStateMap] = useState<any>({});
	const [initSize, setInitSize] = useState<object>({});
	const [columnsStateMap, setColumnsStateMap] = useState<any>({});
	const [loading, setLoading] = useState<boolean>(false);
	const [currentSize, setSize] = useState<object>({});
	const [tableInfoConfig, setTableInfoConfig] = useState<any>({});
	const initColumsWidthRef = useRef<object>({});
	const columsWidthRef = useRef<object>({});
	const updateInfoTimerRef = useRef<any>(null);
	const lastTableInfoId = useRef<string>('');

	// 更新表格信息
	const updateInfo = async (currentId: string, type?: string) => {
		if (!currentId) {
			return;
		}
		// 判断是否需要
		const isNeedUpdate =
			!isEqual(initColumnsStateMap[currentId], columnsStateMap[currentId]) ||
			!isEqual(initColumsWidthRef.current[currentId], columsWidthRef.current[currentId]) ||
			!isEqual(currentSize[currentId], initSize[currentId]);

		// 不需要更新
		if (!isNeedUpdate) {
			return;
		}

		if (updateInfoTimerRef.current) {
			clearTimeout(updateInfoTimerRef.current);
			updateInfoTimerRef.current = null;
		}

		const detailInfo = JSON.stringify({
			size: currentSize[currentId],
			stateMap: columnsStateMap[currentId],
			widthMap: (columsWidthRef.current || {})[currentId],
		});

		const tableInfo = tableInfoConfig[currentId];
		const userId = Number(sessionStorage.getItem('userId')) || '';

		const newColumnsState = { ...columnsStateMap[currentId] };
		const newColumnsWidth = { ...columsWidthRef.current[currentId] };
		const newSize = currentSize[currentId];

		// 切换页面或者同一个表格tableInfoId改变后立即更新
		if (type === 'unmount' || type === 'change') {
			const res: any = addOrUpdate({ ...tableInfo, detailInfo, userId });
			// 如果不是卸载组件则更新表格信息
			if (type === 'change' && res && res.code === 0) {
				if (!isEqual(initColumnsStateMap[currentId], newColumnsState)) {
					setInitColumnsStateMap({ ...columnsStateMap, [currentId]: newColumnsState });
				}
				if (!isEqual(initColumsWidthRef.current[currentId], newColumnsWidth[currentId])) {
					initColumsWidthRef.current = { ...columsWidthRef.current, [currentId]: newColumnsWidth };
				}
				if (!isEqual(initSize[currentId], newSize)) {
					setInitSize({ ...currentSize, [currentId]: newSize });
				}
			}
		} else {
			updateInfoTimerRef.current = setTimeout(() => {
				const res: any = addOrUpdate({ ...tableInfo, detailInfo, userId });
				if (res && res.code === 0) {
					if (!isEqual(initColumnsStateMap[currentId], newColumnsState)) {
						setInitColumnsStateMap({ ...columnsStateMap, [currentId]: newColumnsState });
					}
					if (!isEqual(initColumsWidthRef.current[currentId], newColumnsWidth[currentId])) {
						initColumsWidthRef.current = {
							...columsWidthRef.current,
							[currentId]: newColumnsWidth,
						};
					}
					if (!isEqual(initSize[currentId], newSize)) {
						setInitSize({ ...currentSize, [currentId]: newSize });
					}
				}
			}, 2000);
		}
	};

	useEffect(() => {
		return () => {
			// 组件卸载更新表格信息
			updateInfo(tableInfoId, 'unmount');
		};
	}, []);

	// tableInfoId改变，有些页面是同一个表格切换不同配置
	useEffect(() => {
		if (lastTableInfoId.current && tableInfoId && lastTableInfoId.current !== tableInfoId) {
			// 更新上个表格信息
			updateInfo(lastTableInfoId.current, 'change');
			// 更新当前lastTableInfoId
			lastTableInfoId.current = tableInfoId;
		}
		if (!tableInfoId) {
			return;
		}
		let config: any = {};
		try {
			config = JSON.parse(sessionStorage.getItem('tableInfoConfig') || '{}') || {};
			setTableInfoConfig(config);
		} catch (e) {}
		// 表格信息初始化
		const stateMap = {};
		const initWidthMap = {};
		props.columns.forEach((item: any) => {
			const key = item.key || item.dataIndex;
			if (item.hideInTable) {
				stateMap[key] = {
					show: false,
				};
			}
			if (item.fixed) {
				if (stateMap[key]) {
					stateMap[key].fixed = item.fixed;
				} else {
					stateMap[key] = {
						fixed: item.fixed,
					};
				}
			}
			if (item.width) {
				initWidthMap[key] = item.width;
			}
		});

		// 同时设置初始信息和当前信息，防止触发更新表格信息
		initColumsWidthRef.current = {
			...initColumsWidthRef.current,
			[tableInfoId]: { ...initWidthMap },
		};
		columsWidthRef.current = { ...columsWidthRef.current, [tableInfoId]: { ...initWidthMap } };

		setColumns(props.columns);
		setInitColumnsStateMap({ ...initColumnsStateMap, [tableInfoId]: { ...stateMap } });
		setInitSize({ ...initSize, [tableInfoId]: size });
		setColumnsStateMap({ ...columnsStateMap, [tableInfoId]: { ...stateMap } });
		setSize({ ...currentSize, [tableInfoId]: size });

		// 获取表格信息
		const getTableInfo = async (params: any, id: any) => {
			setLoading(true);
			const res = await getPreferenceByCode(params);
			if (res && res.code === 0) {
				const { data = [] } = res;
				let info = data[0];
				if (!info) {
					setLoading(false);
					let json = JSON.parse(sessionStorage.getItem('tableInfoConfig') || '{}') || {};
					setTableInfoConfig(json);
					const tableInfo = json[id].json || '';
					if (tableInfo) {
						info = { detailInfo: tableInfo };
					}
				}
				if (info && info.detailInfo) {
					try {
						const initData: any = JSON.parse(info.detailInfo) || {};
						const { stateMap = {}, widthMap = {} } = initData;
						// 同时设置初始信息和当前信息，防止触发更新表格信息
						initColumsWidthRef.current = { ...initColumsWidthRef.current, [id]: { ...widthMap } };
						columsWidthRef.current = { ...columsWidthRef.current, [id]: { ...widthMap } };
						setInitColumnsStateMap({ ...initColumnsStateMap, [id]: stateMap });
						setInitSize({ ...initSize, [id]: initData.size || initSize[id] || 'middle' });
						setColumnsStateMap({ ...columnsStateMap, [id]: stateMap });
						setSize({ ...currentSize, [id]: initData.size || currentSize[id] || 'middle' });
						setColumns(
							cloneDeep(columns.length ? columns : props.columns).map((item: any) => {
								if (widthMap[item.key || item.dataIndex]) {
									item.width = widthMap[item.key || item.dataIndex];
								}
								return item;
							}),
						);
					} catch (e) {}
				}
			}
			setLoading(false);
		};

		const tableInfo = config[tableInfoId] || {};
		// const userId = Number(sessionStorage.getItem('userId')) || '';
		getTableInfo(
			tableInfo
				? {
						preferenceCode: tableInfo.preferenceCode,
						systemId: tableInfo.systemId,
						// userId,
						// orgId: tableInfo.orgId,
				  }
				: {},
			tableInfoId,
		);
	}, [tableInfoId]);

	// 密度改变
	const sizeChange = (s: string): void => {
		if (tableInfoId) {
			setSize({ ...currentSize, [tableInfoId]: s });
		}
	};

	// columns状态改变
	const changeColumnsState = (columnsStateMapProps: any): void => {
		if (tableInfoId) {
			setColumnsStateMap({ ...columnsStateMap, [tableInfoId]: columnsStateMapProps });
		}
	};

	// 表格信息改变
	useEffect(() => {
		updateInfo(tableInfoId);
	}, [currentSize, columnsStateMap]);

	// columns宽度改变
	const getColumnsWidth = (columnsWidth: object): void => {
		if (tableInfoId) {
			columsWidthRef.current = { ...columsWidthRef.current, [tableInfoId]: columnsWidth };
			updateInfo(tableInfoId);
		}
	};

	// columns配置改变
	useEffect(() => {
		setColumns(props.columns);
	}, [props.columns]);

	const newColumns = useMemo(() => {
		const widthMap = (columsWidthRef.current || {})[tableInfoId] || {};

		return columns.map((item: any) => {
			if (widthMap[item.key || item.dataIndex]) {
				item.width = widthMap[item.key || item.dataIndex];
			}
			return item;
		});
	}, [columns]);

	return (
		<ResizableTable getColumnsWidth={getColumnsWidth}>
			<ProTable
				className='protable'
				{...rest}
				locale={{
					emptyText: (
						<Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description={isFirst ? '点击查询' : '暂无数据'}
						/>
					),
				}}
				columns={newColumns}
				onColumnsStateChange={changeColumnsState}
				columnsStateMap={columnsStateMap[tableInfoId] || {}}
				pagination={false}
				size={currentSize[tableInfoId] || 'middle'}
				onSizeChange={sizeChange}
				columnEmptyText={columnEmptyText}
				search={typeof search === 'boolean' ? search : false}
				loading={rest.loading || loading}
				options={{
					...options,
					reload: false,
				}}
				scroll={{
					x: '100%',
					y: (props.dataSource || []).length > 6 ? 300 : null,
					...scroll,
				}}
				tableAlertOptionRender={() => {
					return props.tableAlertOptionRender ? props.tableAlertOptionRender : false;
				}}
			/>
		</ResizableTable>
	);
};
export default TableBox;
