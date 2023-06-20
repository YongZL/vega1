import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import { create } from '@/services/storageReallocation';
import { notification } from '@/utils/ui';
import { Button, message, Form } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { history, useModel } from 'umi';
import Goods from './component/Goods';
import Ordinary from './component/Ordinary';
import { refType } from './data';
import { scrollTable } from '@/utils';
const addAllocation: React.FC<{}> = () => {
	const { fields } = useModel('fieldsMapping');
	const [type, setType] = useState<'1' | '2' | undefined>('1');
	const [selectType, setSelectType] = useState<'1' | '2' | undefined>(); //用于校验目前选中的类型
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const ordinaryRef = useRef<refType>();
	const goodsRef = useRef<refType>();
	const [form] = Form.useForm();
	const handleprops = {
		type,
		setType,
		selectType,
		setSelectType,
	};

	// 提交时对数据的处理
	const getParams = () => {
		let newGoodsSelectList: any[] = [],
			newordinarySelectList: any[] = [];
		let goodsSelectList = goodsRef.current?.selectList() || [];
		for (const index in goodsSelectList) {
			const i = Number(index) + 1;
			const quantity = goodsSelectList[index].quantity;
			if (!quantity) {
				scrollTable(i, 'goodsTable');
				notification.warning(`${fields.baseGoods}选择请领项 第 ${i} 行请输入申请数量`);
				goodsSelectList = [];
				return false;
			}
			newGoodsSelectList.push({
				id: goodsSelectList[index].id,
				quantity,
				reason: goodsSelectList[index].reason || '',
			});
		}
		let ordinarySelectList = ordinaryRef.current?.selectList() || [];
		for (const index in ordinarySelectList) {
			const i = Number(index) + 1;
			const quantity = ordinarySelectList[index].quantity;
			if (!quantity) {
				scrollTable(i, 'ordinaryTable');
				notification.warning('医耗套包 选择请领项 第 ' + i + ' 行请输入申请数量');
				newordinarySelectList = [];
				return false;
			}
			newordinarySelectList.push({
				id: ordinarySelectList[index].id,
				quantity,
				reason: ordinarySelectList[index].reason || '',
			});
		}
		const params = {
			...(goodsSelectList.length > 0
				? { ...goodsRef.current?.getSearchStorageArea(), type: 1 }
				: { ...ordinaryRef.current?.getSearchStorageArea(), type: 2 }),
			items: [...newGoodsSelectList, ...newordinarySelectList],
		};
		return params;
	};

	// 新增/编辑的提交操作
	const sureSubmit = async () => {
		form.submit();
		const goodsSelectList = goodsRef.current?.selectList() || [];
		const ordinarySelectList = ordinaryRef.current?.selectList() || [];
		const allSelect = [...goodsSelectList, ...ordinarySelectList];
		if (allSelect.length <= 0) {
			notification.error(`请选择${fields.baseGoods}或医耗套包`);
			return;
		}

		let params: any = getParams();
		if (!params) return;
		let res;
		setSubmitLoading(true);
		try {
			res = await create(params);
			if (res && res.code === 0) {
				history.push('/allocation/handle');
			}
		} finally {
			setSubmitLoading(false);
		}
	};
	useEffect(() => {
		if (selectType && type !== selectType) {
			message.warn(
				`当前申请${fields.goods}类型已有${fields.goods}勾选 & 不可跨${fields.goods}类型申请！`,
			);
		}
	}, [type]);

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', ['', '/allocation/handle'], '']} />
			</div>
			<Form form={form}>
				<Ordinary
					comRef={ordinaryRef}
					handleprops={handleprops}
					style={type === '2' ? {} : { display: 'none' }}
				/>

				<Goods
					comRef={goodsRef}
					handleprops={handleprops}
					style={type === '1' ? {} : { display: 'none' }}
				/>
			</Form>
			<FooterToolbar>
				<Button
					onClick={() => {
						history.push('/allocation/handle');
					}}
					className='returnButton'>
					返回
				</Button>
				<Button
					onClick={() => {
						sureSubmit();
					}}
					type='primary'
					loading={submitLoading}
					className='verifyButton'>
					确认操作
				</Button>
			</FooterToolbar>
		</div>
	);
};

export default addAllocation;
