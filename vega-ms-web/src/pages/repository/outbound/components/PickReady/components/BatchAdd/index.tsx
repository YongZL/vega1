/**
 *  生成配货单
 */
// import { createPickOrderBatch } from '@/api/pick_up_ready';<SearchOutlined />
import React, { useEffect, useState } from 'react';
import { notification } from '@/utils/ui';
import { Button, Checkbox, Input, Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { queryPickOrderBatch } from '@/services/pickOrder';
import Styles from './index.less';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

const CheckboxGroup = Checkbox.Group;
type dataType = {
	id: number;
	name: string;
	checked?: boolean;
};
type Props = {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	warehouseList: dataType[];
	updateListPage: () => void;
	type: 'goods' | 'package_ordinary';
};
const DetailModal = ({ isOpen, setIsOpen, warehouseList, updateListPage, type }: Props) => {
	const [loading, setLoading] = useState(false);
	const [checkedList, setCheckedList] = useState<dataType[]>([]); //选中科室
	const [indeterminate, setIndeterminate] = useState(false); //全选框状态
	const [checkAll, setCheckAll] = useState(false); //是否全选
	const [search, setSearch] = useState<string>(); //输入搜索
	const [dataList, setDataList] = useState<dataType[][]>([]); //仓库列表

	useEffect(() => {
		let newArr = [];
		let list = warehouseList.concat([]);
		list.map((item) => {
			if (item.name.indexOf(search!) > -1) {
				item.checked = true;
			} else {
				item.checked = false;
			}
		});
		for (var i = 0; i < list.length; i += 5) {
			newArr.push(warehouseList.slice(i, i + 5));
		}
		setDataList(newArr);
	}, [search, isOpen]);

	const handleCloseModal = () => {
		setIsOpen(false);
		setLoading(false);
		setCheckedList([]);
		setSearch(undefined);
		setCheckAll(false);
		setIndeterminate(false);
	};

	// 提交
	const handleSubmit = async () => {
		if (checkedList.length <= 0) {
			notification.error('请选择科室仓库!');
			return;
		}
		setLoading(true);

		let params = {
			warehouseIds: checkedList.map((item) => item.id),
			type,
		};

		const res = await queryPickOrderBatch({ ...params });
		if (res && res.code === 0) {
			notification.success('提交成功');
			updateListPage();
			handleCloseModal();
		}
		setLoading(false);
	};

	//查找符合条件的第一个值
	const formatSelectedList = (selectedArray: CheckboxValueType[]) => {
		let rtnList: dataType[] = [];
		selectedArray.forEach((element) => {
			let rtnItem = warehouseList.find((item) => {
				return item.name == element;
			});
			if (rtnItem) {
				rtnList.push(rtnItem);
			}
		});
		return rtnList;
	};

	//选择单个
	const onCheckChange = (selectedArray: CheckboxValueType[]) => {
		if (selectedArray.length == 0) {
			//长度为零
			setCheckedList([]);
			setIndeterminate(false);
		} else {
			//长度不为零
			let selectedList = formatSelectedList(selectedArray);
			setCheckedList(selectedList);
			setIndeterminate(selectedList.length > 0 && selectedList.length < dataList.length);
		}
	};

	//全选
	const onCheckAllChange = (e: CheckboxChangeEvent) => {
		let checked = e.target.checked;
		setCheckedList(checked ? warehouseList : []);
		setCheckAll(checked);
		setIndeterminate(false);
	};

	const searchSubmit = (value: string) => {
		value ? setSearch(value) : setSearch(undefined);
	};

	return (
		<Modal
			title='需要配货的科室仓库'
			className={Styles.modalDetails + ' ant-detail-modal'}
			visible={isOpen}
			maskClosable={false}
			footer={[
				<Button
					key='submit'
					type='primary'
					onClick={handleSubmit}
					className='modalSubmit'
					loading={loading}>
					提交
				</Button>,
			]}
			onCancel={handleCloseModal}
			destroyOnClose={true}>
			<div
				className={Styles.warehouse}
				style={{ overflow: 'auto', height: document.body.clientHeight * 0.6 }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Checkbox
						style={{ marginLeft: '10px' }}
						onChange={onCheckAllChange}
						checked={checkAll}
						indeterminate={indeterminate}>
						全选
					</Checkbox>
					<div style={{ marginBottom: '10px' }}>
						<span>查找仓库：</span>
						<Input
							className='searchInput'
							onPressEnter={(e) => searchSubmit((e.target as unknown as { value: string }).value)}
							onChange={(e) => searchSubmit(e.target.value)}
							suffix={<SearchOutlined />}
							allowClear
							style={{ width: 200 }}
						/>
					</div>
				</div>
				<CheckboxGroup
					className={Styles['ant-checkbox-group']}
					onChange={onCheckChange}
					value={
						checkedList && checkedList.length > 0
							? checkedList.map((item) => {
									return item.name;
							  })
							: []
					}>
					<table className={Styles.table}>
						<tbody>
							{dataList.map((itemArr, index) => {
								//行
								return (
									<tr
										key={index}
										className={Styles.tr}>
										{itemArr.map((item, index) => {
											//单元格
											return (
												<td
													key={index}
													className={Styles.td}>
													<Checkbox value={item.name}>
														<span className={item.checked ? Styles.checked : ''}>{item.name}</span>
													</Checkbox>
												</td>
											);
										})}
									</tr>
								);
							})}
						</tbody>
					</table>
				</CheckboxGroup>
			</div>
		</Modal>
	);
};

export default DetailModal;
