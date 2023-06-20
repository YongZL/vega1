import { history, connect, Dispatch } from 'umi';
import { SearchOutlined } from '@ant-design/icons';
import { Input, Select } from 'antd';
import useMergeValue from 'use-merge-value';
import { AutoCompleteProps } from 'antd/es/auto-complete';
import React, { useRef, useEffect, useState } from 'react';

import classNames from 'classnames';
import styles from './index.less';
import api from '@/constants/api';
import request from '@/utils/request';
import linkList from './index.config.js';
import { transformSBCtoDBC } from '@/utils';
import { debounce } from 'lodash';
import commonStyles from '@/assets/style/common.less';
import useDebounce from '@/hooks/useDebounce'; // 延迟-- loadash不可用
import { warehousingApply, doneStatus } from '@/constants/dictionary';

export interface HeaderSearchProps {
	onSearch?: (value?: string) => void;
	onChange?: (value?: string) => void;
	onVisibleChange?: (b: boolean) => void;
	className?: string;
	placeholder?: string;
	options: AutoCompleteProps['options'];
	defaultOpen?: boolean;
	open?: boolean;
	defaultValue?: string;
	value?: string;
	dispatch: Dispatch;
}

const HeaderSearch: React.FC<HeaderSearchProps> = ({ dispatch, ...props }) => {
	const {
		className,
		// defaultValue,
		onVisibleChange,
		// placeholder,
		// open,
		defaultOpen,
		// ...restProps
	} = props;

	const [searchMode, setSearchMode] = useMergeValue(defaultOpen || false, {
		value: props.open,
		onChange: onVisibleChange,
	});

	const [selectedType, setSelectedType] = useState('');
	const [lightKey, setLightKey] = useState('');
	const [inputValue, setInputValue] = useState('');
	const [selectedResult, setSelectedResult] = useState<string | undefined>(undefined);
	const [searchResultList, setSearchResultList] = useState<any>([]);
	const [typeList, setTypeList] = useState([]);
	const [pageSize, setPageSize] = useState(50);
	// const [query_string, setQueryString] = useState('');
	const [lastTime, setLastTime] = useState(0);
	// const [scanType, setScanType] = useState(false);
	const debouncedSearchTerm = useDebounce(inputValue, 500);
	useEffect(() => {
		if (debouncedSearchTerm) {
			getSearchList(inputValue);
		}
	}, [debouncedSearchTerm]);
	const searchRef = useRef();

	/**
	 * 获取未读消息id
	 */
	const getUnReadMsgIdStr = (list) => {
		let filteredArray = list.filter((item) => {
			return !item.read;
		});
		let rtnStr = '';
		for (let i = 0; i < filteredArray.length; i++) {
			let item = filteredArray[i];
			if (i != filteredArray.length - 1) {
				rtnStr = rtnStr + item.id + ';';
			} else {
				rtnStr = rtnStr + item.id;
			}
		}
		return rtnStr;
	};

	/**
	 * 未读消息id数据
	 * 记录一次即可
	 */
	const cacheMsgIdStr = async () => {
		const response = await request(api.message.list, {
			params: {
				pageNum: 0,
				pageSize: 100,
			},
		});
		if (response && response.code == 0) {
			const unReadMsgIdStr = getUnReadMsgIdStr(response.data.rows);
			unReadMsgIdStr && window.localStorage.setItem('unReadMsgIdStr', unReadMsgIdStr);
		}
	};
	// 类型列表
	const getSearchTypeList = async () => {
		const res = await request(`${api.others.searchTypeList}`);
		if (res && res.code == 0) {
			let typeList = res.data;
			setTypeList(typeList);
			setSelectedType(typeList[0] ? typeList[0].code : '');
		}
	};
	// 所选项
	const getDataByCode = (code) => {
		let targetData = searchResultList.filter((item) => item.code === code)[0];
		return targetData;
	};

	// 选中后跳转
	const onItemClick = (code) => {
		if (!code) {
			setSelectedResult('');
			return;
		}
		setSelectedResult(code);
		setLightKey('');
		let resultItem = getDataByCode(code);
		let key;
		if (selectedType == 'DOCTOR') {
			history.push(`/search_doctor/${code}`);
			return;
		}
		if (selectedType == 'PATIENT') {
			history.push(`/search_patient/${code}`);
			return;
		}

		if (selectedType == 'GOODS_BARCODE') {
			let time = new Date().getTime();
			history.push({
				pathname: '/global_search',
				state: { code: code, time: time },
			});
			return;
		}

		if (
			[
				'ACCEPTANCE',
				'PUSH_LIST',
				'RECEIVING',
				'REALLOCATE',
				'GOODS_REQUEST',
				'PACKAGE_BULK',
				'PACKAGE_ORDINARY',
				'SURGICAL_GOODS_REQUEST',
				'SURGICAL_RECEIVING',
				'PICKING_LIST',
				'DELIVERY',
				'DEPARTMENT_RETURN_GOODS_ORDER',
				'RETURN_GOODS_ORDER',
				'SURGICAL_DELIVERY',
				'STOCK_TAKING_ORDER',
				'PROCESSING_ORDER',
			].includes(selectedType)
		) {
			//tab
			key = code + `#${resultItem.status}`;
		} else if (selectedType === 'PURCHASE_PLAN') {
			//采购计划
			key = code + `#${resultItem.status}`;
		} else if (selectedType === 'MONTHLY_STATEMENT') {
			// key = code + `#${resultItem.levelOne}`;
			key = code;
		} else if (selectedType === 'PURCHASE_ORDER') {
			key = code + `#${resultItem.status}#${resultItem.parent}`;
		} else if (selectedType === 'GOODS_BARCODE') {
			//基础物资条码,保存条码
			key = code;
			sessionStorage.setItem('code', code);
		} else {
			key = code;
		}
		linkList.map((value) => {
			if (selectedType === value.type) {
				// this.setSearchKeyWords(key); todo
				dispatch({
					type: 'global/updateSearchKeywords',
					payload: key,
				});
				let stamp = new Date().getTime();
				if (doneStatus.some((item) => item.value === resultItem.status)) {
					history.push({
						pathname: value.searchUrl,
						state: value.state || {},
						search: `?search_key#${stamp}`,
					});
				} else {
					//调拨特殊情况有申请、处理、查询三个，及特殊处理
					if (
						selectedType === 'REALLOCATE' &&
						warehousingApply
							.slice(0, warehousingApply.length - 3)
							.some((item) => item.value === resultItem.status)
					) {
						history.push({
							pathname: value.applyUrl,
							state: value.state || {},
							search: `?search_key#${stamp}`,
						});
						return;
					}
					history.push({
						pathname: value.url,
						state: value.state || {},
						search: `?search_key#${stamp}`,
					});
				}
			}
		});
		// setSearchResultList([])
	};

	const handleTypeChange = (type) => {
		setSelectedType(type);
		clear();
	};

	const clear = () => {
		setSearchResultList([]);
		setSelectedResult(undefined);
		setPageSize(50);
		setInputValue('');
		// setQueryString('')
	};

	const handleGlobalSearch = debounce((event) => {
		/** 判断是否为扫码 */
		let scanType = false;
		let nextTime = new Date().getTime();
		if (nextTime && lastTime && nextTime - lastTime <= 30) {
			scanType = true;
		}
		setLastTime(nextTime);
		if (scanType) {
			searchSubmit(event, scanType);
		}
	}, 600);

	const searchSubmit = debounce((value) => {
		const stamp = new Date().getTime();
		if (!value) {
			return;
		}
		dispatch({
			type: 'global/updateSearchKeywords',
			payload: transformSBCtoDBC(value),
		});
		dispatch({
			type: 'global/updateSearchTimestamp',
			payload: stamp,
		});
		history.push(`/base_data/new_goods?search_key#${stamp}`);
	}, 600);

	const getSearchList = (value, select = false) => {
		if (!value) {
			return;
		}
		let params = {
			keywords: String(value).trim().toUpperCase(),
			pageNum: 0,
			pageSize: pageSize,
			type: selectedType,
		};
		request(api.others.global_search, { params }).then((res) => {
			if (res && res.code == 0) {
				let searchResultList = '';
				if (selectedType == 'PACKAGE_BULK' || selectedType == 'PACKAGE_ORDINARY') {
					searchResultList = res.data.details.results;
				} else {
					searchResultList = res.data.details.results.rows;
				}

				setSearchResultList([...searchResultList]);
				setLightKey(String(value).trim().toUpperCase());
				if (select && searchResultList.length > 0) {
					setSelectedResult(searchResultList[0].code);
					onItemClick(searchResultList[0].code);
					// 失焦 -- current.blur()?
					// searchRef.current.rcSelect.onOuterBlur();
				}
			}
		});
	};

	// enter
	const onKeyDown = (e) => {
		const val = e.target.value;
		if (e.keyCode == 13) {
			setSelectedResult(val);
			getSearchList(val, true);
		}
	};

	const onFocus = () => {
		// setInputValue(selectedResult)
		getSearchList(selectedResult);
	};

	useEffect(() => {
		// getNewMsg();
		// this._timer = setInterval(getNewMsg, 1000 * 60);
		cacheMsgIdStr();
		getSearchTypeList();

		// 如果是基础物资条码页，要尝试获取sessionStorage中存储的数据
		if (history.location.pathname === '/global_search') {
			let sessionCode = sessionStorage.getItem('code');
			if (sessionCode) {
				setSelectedType('GOODS_BARCODE');
				setSearchMode(true);
				onItemClick(sessionCode);
			}
		}
	}, []);
	const getStr = (key, text) => {
		let index = text.indexOf(key);
		if (index > -1) {
			return [text.slice(0, index), text.slice(index + key.length)];
		} else {
			return [text];
		}
	};
	return (
		<div
			className={classNames(className, styles.headerSearch)}
			onClick={() => {
				setSearchMode(!searchMode);
			}}>
			{!!!searchMode ? (
				// <LocalIcon type="icon-search" className="cl_86899A" /> : null
				<SearchOutlined
					key='Icon'
					style={{
						cursor: 'pointer',
					}}
				/>
			) : null}
			<div
				className={searchMode ? commonStyles['search-box'] : 'dis-n'}
				onClick={(e) => {
					e.stopPropagation();
				}}>
				<Input.Group compact>
					<Select
						showSearch
						getPopupContainer={(node) => node.parentNode}
						style={{ width: 130 }}
						value={selectedType ? selectedType : 'FUZZY_SEARCH'}
						onChange={(value) => handleTypeChange(value)}
						filterOption={(input, option) =>
							option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
						}>
						{typeList.map((item, index) => (
							<Select.Option
								value={item.code}
								key={index}>
								{item.name}
							</Select.Option>
						))}
					</Select>
					<Input
						autoFocus={selectedType === 'FUZZY_SEARCH'}
						placeholder=''
						style={{ width: 300 }}
						onChange={(e) => handleGlobalSearch(e.target.value)}
						onPressEnter={(e) => searchSubmit(e.target.value)}
						className={selectedType == 'FUZZY_SEARCH' ? '' : 'dis-n'}
					/>

					<Select
						showSearch
						allowClear
						autoFocus={selectedType !== 'FUZZY_SEARCH'}
						placeholder='请输入搜索内容'
						// value={selectedResult}
						showArrow={false}
						filterOption={false}
						onSearch={(val) => {
							setInputValue(val);
						}}
						onChange={(value) => onItemClick(value)}
						notFoundContent={false}
						style={{ width: 300, position: 'relative' }}
						getPopupContainer={(node) => node.parentNode}
						onInputKeyDown={onKeyDown}
						ref={searchRef}
						// onFocus={() => onFocus()}
						className={selectedType == 'FUZZY_SEARCH' ? 'dis-n' : ''}
						loading
						// searchValue={inputValue}
					>
						{searchResultList.map((item, index) => {
							if (selectedType == 'DOCTOR') {
								return (
									<Select.Option
										value={item.id}
										key={item.id}>
										{`${item.doctorName}(${item.doctorNo})`}
									</Select.Option>
								);
							}
							if (selectedType == 'PATIENT') {
								return (
									<Select.Option
										value={item.id}
										key={item.id}>
										{`${item.name}(${item.patientNo})`}
									</Select.Option>
								);
							}
							let arrTail = getStr(lightKey, item.code);
							return (
								<Select.Option
									value={item.code}
									key={index}>
									{arrTail[0]}
									{lightKey && (
										<span style={{ color: CONFIG_LESS['@btn_special'], fontWeight: 'bold' }}>
											{lightKey}
										</span>
									)}
									{arrTail[1] ? arrTail[1] : ''}
								</Select.Option>
							);
						})}
					</Select>
				</Input.Group>
			</div>
		</div>
	);
};

export default connect(() => ({}))(HeaderSearch);
