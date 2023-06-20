import type { FC } from 'react';
import type { ApiSelectProps } from './typings';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Select, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { get } from 'lodash';
import { useFormFieldPropsMap } from '../../hooks';
import { defaultPageListFieldConfig, defaultPagerFieldConfig, defaultPager } from '@/config';
import { getPager } from '@/utils/dataUtil';

const ApiSelect: FC<ApiSelectProps> = ({
	api,
	pageListFieldConfig = defaultPageListFieldConfig,
	fieldConfig,
	pagination,
	options: initialOptions,
	params: extraParmas,
	onDropdownVisibleChange,
	immediate,
	onChange,
	onValuesChange,
	onPopupScroll,
	searchInterval,
	loadingTip,
	formKey,
	onBlur,
	onFocus,
	...props
}) => {
	const { fieldProps, updateFieldProps } = useFormFieldPropsMap(formKey);
	const [isGot, setIsGot] = useState<boolean>(fieldProps.isGot || false);
	const [options, setOptions] = useState<ApiSelectProps['options']>(fieldProps.options || []);
	const [loading, setLoading] = useState<boolean>(fieldProps.loading || false);
	const [keyword, setKeyword] = useState<string>(fieldProps.keyword || '');
	const [pager, setPager] = useState<Record<string, any>>(fieldProps.pager || defaultPager);
	const inputValueRef = useRef<string>(fieldProps.keyword || '');

	useEffect(() => {
		if (formKey) {
			updateFieldProps('isGot', isGot);
		}
	}, [formKey, isGot, updateFieldProps]);

	useEffect(() => {
		if (formKey) {
			updateFieldProps('options', options);
		}
	}, [formKey, options, updateFieldProps]);

	useEffect(() => {
		if (formKey) {
			updateFieldProps('loading', loading);
		}
	}, [formKey, loading, updateFieldProps]);

	useEffect(() => {
		if (formKey) {
			updateFieldProps('pager', pager);
		}
	}, [formKey, pager, updateFieldProps]);

	const fetchApi = useMemo(() => {
		return async (params: Record<string, any>, loadType: string) => {
			if (typeof api === 'function') {
				setLoading(true);
				const {
					codeField,
					successCode,
					listField,
					pagerFieldConfig = defaultPagerFieldConfig,
				} = pageListFieldConfig || {};
				if (pagination !== false) {
					const { pageNumField, pageSizeField, startPage } = pagerFieldConfig;
					const pageNum = startPage || 0;
					params[pageNumField] = loadType === 'up' ? pageNum + 1 : pageNum;
					params[pageSizeField] = pager[pageSizeField];
				}
				try {
					const res = await api({ ...params, ...(extraParmas || {}) });
					const resCode = get(res, codeField || 'code');
					const sucCode = typeof successCode !== 'undefined' ? successCode : 0;
					if (resCode === sucCode) {
						const { label, value, key: fieldKey } = fieldConfig || {};
						const list = get(res, res.data.rows ? listField || 'data.rows' : 'data', []).map(
							(item: Record<string, any>) => {
								const newItem: Record<string, any> = {
									...item,
									label: item[label || 'label'],
									value: item[value || 'value'],
								};
								if (fieldKey) {
									if (typeof fieldKey === 'string') {
										newItem.key = item[fieldKey];
									} else if (typeof fieldKey === 'function') {
										const keyValue = fieldKey(item);
										if (typeof keyValue === 'string') {
											newItem.key = keyValue;
										}
									}
								}
								return newItem;
							},
						);
						if (pagination !== false) {
							setPager(
								getPager(
									!pagerFieldConfig.pagerField ? res : get(res, pagerFieldConfig.pagerField),
									pagerFieldConfig,
								),
							);
							if (loadType === 'up') {
								setOptions([...(options || []), ...list]);
							} else {
								setOptions(list);
							}
						} else {
							setOptions(list);
						}
					}
				} catch (e) {
				} finally {
					setLoading(false);
				}
			}
		};
	}, [api, pageListFieldConfig, pagination, pager, extraParmas, fieldConfig, options]);

	const searchTimer = useRef<NodeJS.Timeout | null>(null);
	const setValutTimer = useRef<NodeJS.Timeout | null>(null);

	const handleSearch = useCallback(
		(val) => {
			setKeyword(val);
			setValutTimer.current = setTimeout(() => {
				inputValueRef.current = val;
				if (formKey) {
					updateFieldProps('keyword', val);
				}
				inputValueRef.current = val;
				if (formKey) {
					updateFieldProps('keyword', val);
				}
				if (props.filterOption) {
					return;
				}
				if (loading) {
					return;
				}
				if (searchTimer.current) {
					clearTimeout(searchTimer.current);
				}
				const params = {};
				if (val) {
					const { keyword: keywordField } = fieldConfig || {};
					params[keywordField || 'keyword'] = val;
				}
				const time = (searchInterval || 0) > 20 ? (searchInterval || 0) - 20 : 0;
				searchTimer.current = setTimeout(
					() => {
						fetchApi(params as Record<string, any>, 'search');
					},
					typeof searchInterval === 'number' ? time : 780,
				);
			}, 20);
		},
		[fetchApi, fieldConfig, formKey, loading, searchInterval, updateFieldProps],
	);

	const handleBlur: ApiSelectProps['onBlur'] = useCallback(
		(event) => {
			if (typeof onBlur === 'function') {
				onBlur(event);
			}
			setTimeout(() => {
				if (setValutTimer.current) {
					clearTimeout(setValutTimer.current);
					setValutTimer.current = null;
				}
			}, 10);
		},
		[onBlur],
	);

	const handleFocus = useCallback(
		(event) => {
			setKeyword(inputValueRef.current);
			if (typeof onFocus === 'function') {
				onFocus(event);
			}

			if (formKey) {
				const { isGot: prevIsGot } = fieldProps;
				if (prevIsGot) {
					return;
				}
			}

			if (!isGot) {
				setIsGot(true);
				fetchApi({}, 'load');
			}
		},
		[fetchApi, fieldProps, formKey, isGot, onFocus],
	);

	const handlePopupScroll = useCallback(
		(e) => {
			if (typeof onPopupScroll === 'function') {
				onPopupScroll(e);
			}

			const { pagerFieldConfig = defaultPagerFieldConfig } = pageListFieldConfig || {};
			const isLast = pager[pagerFieldConfig.endField];
			if (loading || pagination === false || isLast) {
				return;
			}
			const {
				target: { scrollHeight, offsetHeight, scrollTop },
			} = e;
			if (scrollHeight - offsetHeight - scrollTop <= 50) {
				const params = {};
				const { keyword: keywordField } = fieldConfig || {};
				if (!keywordField) {
					return;
				}
				if (keyword) {
					params[keywordField as string] = keyword;
				}

				fetchApi(params as Record<string, any>, 'up');
			}
		},
		[
			fetchApi,
			fieldConfig,
			keyword,
			loading,
			onPopupScroll,
			pageListFieldConfig,
			pager,
			pagination,
		],
	);

	const finalOptions = useMemo(() => {
		if (pagination !== false) {
			if (initialOptions && initialOptions.length > 0) {
				const optionMap = {};
				initialOptions.forEach((item) => {
					optionMap[item.value as string] = !0;
				});
				const opts = (options || []).filter((item) => !optionMap[item.value as string]);

				return [...initialOptions, ...opts];
			}
			return options || [];
		}
		return options || [];
	}, [initialOptions, options, pagination]);

	useEffect(() => {
		if (immediate !== false) {
			if (formKey) {
				const { isGot: prevIsGot } = fieldProps;
				if (prevIsGot) {
					return;
				}
			}
			setIsGot(true);
			fetchApi({}, 'load');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleChange: ApiSelectProps['onChange'] = (...rest) => {
		// 由于用form表单的情况下，onChange可能在父级不可用，所以用onValueChange代替触发回调获取实时value和option
		if (typeof onChange === 'function') {
			onChange(...rest);
		}
		if (typeof onValuesChange === 'function') {
			onValuesChange(...rest);
		}
	};

	return (
		<Select
			allowClear={true}
			filterOption={false}
			searchValue={keyword}
			autoClearSearchValue={false}
			dropdownRender={(originNode) => (
				<>
					{originNode}
					{loading && (
						<Spin
							indicator={
								<>
									<LoadingOutlined
										style={{ fontSize: 16, marginRight: '8px' }}
										spin
									/>
									{loadingTip || 'Loading...'}
								</>
							}
							style={{
								lineHeight: '32px',
							}}>
							<div style={{ height: 32 }} />
						</Spin>
					)}
				</>
			)}
			{...props}
			onChange={handleChange}
			loading={props.loading || loading}
			showSearch={typeof props.showSearch === 'boolean' ? props.showSearch : true}
			placeholder={typeof props.placeholder === 'string' ? props.placeholder : '请选择'}
			options={finalOptions}
			onPopupScroll={handlePopupScroll}
			onSearch={handleSearch}
			onBlur={handleBlur}
			onFocus={handleFocus}
		/>
	);
};

export default ApiSelect;
