import type { DefaultOptionType } from 'antd/es/select';
import type { SelectTableProps } from './typings';
import { useCallback, useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { Table, Select } from 'antd';
import classNames from 'classnames';
import './index.less';
export type { SelectTableProps };
type Ele = ChangeEvent<HTMLInputElement> & KeyboardEvent<HTMLDivElement>;
// 此组件由于组件原因，暂时无法做搜索缓存，除非组件做本地缓存
const SelectTable = <T extends Record<string, any>>({
	tableProps = {},
	api,
	labelKey = 'label',
	valueKey = 'value',
	searchKey = 'keyword',
	onChange,
	filterData,
	params,
	defaultValue,
	selectRowKeys = [],
	...props
}: SelectTableProps<T>) => {
	const [isOpen, setIsopen] = useState<boolean>(false);
	const [dataSource, setDataSource] = useState<T[]>([]);
	const [val, setVal] = useState<any>();
	const selectFocusRef = useRef<boolean>(false); // 用于判断焦点在input还是table
	const selectBlurRef = useRef<boolean>(false); // 用于判断table弹窗表单还未弹出前input是否失焦过
	// useEffect(() => {
	//   if (dataSource.length && props.value) {
	//     for (let item of dataSource) {
	//       if (val === item[valueKey]) {
	//         setVal(item[labelKey]);
	//         return;
	//       }
	//     }
	//     setVal(props.value);
	//   }
	// }, [props.value]);
	const loadData = async (value?: string) => {
		if (typeof api == 'function') {
			const res = await api({ [searchKey]: value, ...(params || {}) });
			if (res && res.code == 0) {
				let list: T[] = [];
				if (typeof filterData === 'function') {
					list = filterData(res);
				} else if (Array.isArray(res.data)) {
					list = res.data as T[];
					setDataSource(res.data as T[]);
				} else if (
					res.data &&
					(res.data as Record<string, any>).rows &&
					Array.isArray((res.data as Record<string, any>).rows)
				) {
					list = (res.data as Record<string, any>).rows as T[];
				}
				if (selectBlurRef.current) {
					selectBlurRef.current = false;
					return;
				}
				setDataSource(list);
				setIsopen(true);
			}
		}
	};
	const handleSearch = (value: string) => {
		if (!value || !api || typeof api !== 'function') {
			setIsopen(false);
			setTimeout(() => {
				setDataSource([]);
			}, 0);
			return;
		}
		loadData(value);
	};

	const handleChange = useCallback(
		(value: any, option: T) => {
			if (typeof onChange === 'function') {
				onChange(value, option);
			}
		},
		[onChange],
	);
	useEffect(() => {
		const inputDom = document
			.getElementsByClassName('select-table')[0]
			.querySelectorAll('input')[0];
		let meout: NodeJS.Timeout | null = null;
		inputDom.oninput = (e) => {
			setVal(e.target?.value);
			if (meout !== null) {
				clearTimeout(meout);
			}
			meout = setTimeout(() => {
				handleSearch(e.target?.value);
			}, 800);
		};
		inputDom.onfocus = (e) => {
			if (!selectFocusRef.current) {
				handleSearch(e.target?.value);
			}
			selectFocusRef.current = false;
		};
		inputDom.onblur = () => {
			if (isOpen) {
				setTimeout(() => {
					if (!selectFocusRef.current) {
						setIsopen(false);
						setDataSource([]);
					}
				}, 200);
			} else {
				selectBlurRef.current = true;
			}
		};
	}, [isOpen, selectFocusRef.current, params]);
	//选中项添加类名
	const setRowClassName = (record: T) => {
		let len = selectRowKeys?.length;
		return len && selectRowKeys.includes(record[valueKey]) ? 'selected' : '';
	};

	const onkeydown = (e: Ele) => {
		if (e.keyCode === 13) {
			if (!e.target.value && props?.isSearch) {
				loadData();
			}
		}
	};
	return (
		<div>
			<Select
				open={isOpen}
				showSearch={true}
				allowClear={true}
				listHeight={100}
				dropdownMatchSelectWidth={false}
				optionLabelProp={valueKey}
				{...props}
				value={val}
				searchValue={val}
				className='select-table'
				dropdownClassName={classNames(
					'select-table-container',
					dataSource.length && 'select-table-container__empty',
				)}
				placeholder={props.placeholder || ''}
				onClear={() => {
					handleChange(undefined, undefined as unknown as T);
					setVal(undefined);
					setIsopen(false);
					setDataSource([]);
				}}
				onKeyDown={onkeydown}
				options={dataSource as unknown as DefaultOptionType[]}
				fieldNames={{
					label: labelKey,
					value: valueKey,
				}}
				dropdownRender={() => (
					<div
						tabIndex={0}
						onFocus={() => {
							selectFocusRef.current = true;
						}}
						onBlur={() => {
							if (isOpen) {
								setTimeout(() => {
									if (selectFocusRef.current) {
										setIsopen(false);
										setDataSource([]);
										selectFocusRef.current = false;
									}
								}, 200);
							}
						}}
						className='selectTableRef'
						style={{ padding: 2, width: '61.8vw' }}>
						<Table<T>
							scroll={{ x: '100%', y: 300 }}
							{...tableProps}
							rowClassName={setRowClassName}
							dataSource={!api ? tableProps.dataSource : dataSource}
							pagination={false}
							onRow={(record: T) => {
								return {
									onClick: (e) => {
										e.stopPropagation();
										handleChange(record[valueKey], record);
										if (!props?.multiple) {
											setVal(record[labelKey]);
											setIsopen(false);
											setTimeout(() => {
												setDataSource([]);
											}, 0);
										}
									},
								};
							}}
						/>
					</div>
				)}
			/>
		</div>
	);
};

export default SelectTable;
