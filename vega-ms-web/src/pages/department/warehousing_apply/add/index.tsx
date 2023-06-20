import { notification } from '@/utils/ui';
import { Button, Card, Modal, Spin, Switch, Tabs, Form } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { connect, history, useModel } from 'umi';
import { refType } from './data';

import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import { useGoodsType } from '@/hooks/useGoodsType';
import { addApply, editApply, getDetail } from '@/services/goodsRequest';
import { makingReallocate } from '@/services/reallocate';
import { getByUserWh } from '@/services/warehouse';
import { scrollTable } from '@/utils';
import Goods from './components/Goods';
import Ordinary from './components/Ordinary';
import { addOrUpdate, getPreferenceByCode } from '@/services/userPreference';
import useDidMount from '@/hooks/useDidMount';
import { boo } from '@/constants/dictionary';
const { TabPane } = Tabs;
type Props = {
	global: Record<string, any>;
	match: {
		params: {
			sourceWarehouseId: number;
			warehouseId: number;
			id: number;
		};
	};
};
type GoodsByDepartmentRecord = GoodsTypesController.GoodsByDepartmentRecord;
const addAllocation: React.FC<Props> = ({ global, ...props }) => {
	const [form] = Form.useForm();
	const goodsRef = useRef<refType>();
	const { fields } = useModel('fieldsMapping');
	const ordinaryRef = useRef<refType>();
	const [tabType, setTabType] = useState('');
	const [pageType, setPageType] = useState('');
	const [loading, setLoading] = useState<boolean>(false);
	const [check, setCheck] = useState<boolean>(false);
	const isAllocation = useRef(false); //为true 代表调拨
	const [pageId, setPageId] = useState<string | number>();
	const [activeTab, setActiveTab] = useState<string>('goods');
	const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
	const [sourceWarehouseId, setSourceWarehouseId] = useState<number>();
	const [targetWarehouseId, setTargetWarehouseId] = useState<number>();
	const [warehouseObj, setWarehouseObj] = useState<Record<string, any>>({});
	const [goodsList, setGoodsList] = useState<GoodsByDepartmentRecord[]>([]);
	const [ordinaryListData, setOrdinaryList] = useState<OrdinaryController.OrdinaryQuer[]>([]);
	const [sourceWarehouseData, setSourceWarehouseData] = useState<Record<string, any>[]>([]);
	const [targetWarehouseData, setTargetWarehouseData] = useState<Record<string, any>[]>([]);
	const [centerWarehouseData, setCenterWarehouseData] = useState<Record<string, any>[]>([]);
	const [editWarehouseData, setEditWarehouseData] = useState<Record<string, any>>({});
	const tagsData = useGoodsType({ goodsValue: 'goods', ordinaryValue: 'ordinary' }); //类型

	const getDetailData = async (id: number) => {
		const res = await getDetail({ goodsRequestId: id });
		if (res && res?.code == 0) {
			const result: any = res.data;
			const type = Array.isArray(result) ? 'goods' : 'ordinary';
			setActiveTab(type);
			setTabType(type);
			setLoading(false);
			type === 'goods' ? setGoodsList(result) : setOrdinaryList(result?.ordinaryGoods);
		}
	};
	useEffect(() => {
		const { sourceWarehouseId, warehouseId } = props?.match?.params;
		const paramsId = props?.match?.params.id;
		setPageType(paramsId ? 'edit' : 'add');
		if (paramsId) {
			setLoading(true);
		}
		const getByUserWhData = async () => {
			try {
				let res = await getByUserWh({
					excludeCentralWarehouse: false,
					requestAddCentralWarehouse: true,
				});
				if (res && res.code == 0) {
					let result = res.data || [];
					let arr: Record<string, any>[] = [];
					let targetWarehouseArr: Record<string, any>[] = [];
					for (let i = 0, len = result.length; i < len; i++) {
						const { name, id, departmentId, level } = result[i];
						let obj = { label: name, value: id };
						// level === 0 为中心仓库
						if (level === 0) {
							arr.push(obj);
							warehouseObj[id] = departmentId;
							setCenterWarehouseData([obj]);
							setSourceWarehouseId(id);
						} else {
							arr.push(obj);
							targetWarehouseArr.push(obj);
							warehouseObj[id] = departmentId;
						}
					}

					setWarehouseObj(warehouseObj);
					setSourceWarehouseData(arr);
					setTargetWarehouseData(targetWarehouseArr);

					if (targetWarehouseArr?.length == 1) {
						setTargetWarehouseId(targetWarehouseArr[0].value);
					}

					if (paramsId) {
						setPageId(paramsId);
						setEditWarehouseData({
							sourceWarehouseId: Number(sourceWarehouseId),
							targetWarehouseId: Number(warehouseId),
						});

						getDetailData(paramsId);
					}
				}
			} finally {
			}
		};
		getByUserWhData();
	}, []);

	// 提交时对数据的处理
	const getParams = () => {
		let params = {};
		let newGoodsSelectList: Record<string, any>[] = [],
			newOrdinarySelectList: Record<string, any>[] = [];
		let goodsSelectList = goodsRef.current?.selectList() || [];
		let ordinarySelectList = ordinaryRef.current?.selectList() || [];
		const selectList = [...goodsSelectList, ...ordinarySelectList];
		if (selectList.length <= 0) {
			notification.error(`请选择${fields.baseGoods}或医耗套包`);
			return;
		}
		let IsAllocation = goodsSelectList.length ? goodsRef.current?.isAllocation || false : false;
		isAllocation.current = IsAllocation;
		if (goodsSelectList.length) {
			for (const index in goodsSelectList) {
				const record = goodsSelectList[index];
				const { quantity, remarks } = record;
				if (
					(quantity > record.stocks && global?.config?.goods_flow_without_gsp == 'true') ||
					(IsAllocation && !remarks) ||
					(!IsAllocation && !quantity)
				) {
					// document.querySelector(`#erro${record.id}`).style.border = '1px solid red';
				}
			}
			for (const index in goodsSelectList) {
				const i = Number(index) + 1;
				const record = goodsSelectList[index];
				const { quantity, goodsId, id, requestReason, remarks, conversionRate, udiCode } = record;
				// gsp开启超库存提示
				const isGspEnabled =
					quantity > record.stocks &&
					global?.config?.goods_flow_without_gsp == 'true' &&
					!record.isEnabled;
				// 入库配置项（避免自动采购）
				const nonAutomaticPurchase =
					quantity > record.stocks && global?.config?.non_automatic_purchase == 'true';

				if (isGspEnabled || nonAutomaticPurchase) {
					scrollTable(i, 'goodsTable');
					notification.warn(`第${i}行, ${record.goodsName || record.name}请领数量大于可用库存!`);
					return false;
				}

				if (IsAllocation && !remarks) {
					scrollTable(i, 'goodsTable');
					goodsSelectList = [];
					notification.warning(' 第 ' + i + ' 行调拨事由不能为空');
					return false;
				} else if (!IsAllocation && !quantity) {
					scrollTable(i, 'goodsTable');
					goodsSelectList = [];
					notification.warning(`${fields.baseGoods} 选择请领项 第 ${i} 行请输入申请数量`);
					return false;
				}
				if (IsAllocation) {
					newGoodsSelectList.push({
						goodsItemId: id,
						remarks,
						udiCode: quantity > 1 ? udiCode : undefined,
						allotNum: quantity,
					});
				} else {
					newGoodsSelectList.push({
						quantity: quantity,
						goodsId,
						requestReason,
					});
				}
			}
		}
		// 套包
		if (ordinarySelectList.length) {
			for (const index in ordinarySelectList) {
				const { quantity, stocks, id } = ordinarySelectList[index];
				if (!quantity || (quantity > stocks && global?.config?.goods_flow_without_gsp == 'true')) {
					// document.querySelector(`#erro${id}`)?.style.border = '1px solid red';
				}
			}
			for (const index in ordinarySelectList) {
				const i = Number(index) + 1;
				const { quantity, id, requestReason, stocks, name, menabled } = ordinarySelectList[index];
				if (!quantity) {
					scrollTable(i, 'ordinaryTable');
					newOrdinarySelectList = [];
					notification.warning('医耗套包 选择请领项 第 ' + i + ' 行请输入申请数量');
					return false;
				}
				// gsp开启超库存提示
				const isGspEnabled =
					quantity > stocks && global?.config?.goods_flow_without_gsp == 'true' && !menabled;
				// 入库配置项（避免自动采购）
				const nonAutomaticPurchase =
					quantity > stocks && global?.config?.non_automatic_purchase == 'true';
				if (isGspEnabled || nonAutomaticPurchase) {
					scrollTable(i, 'ordinaryTable');
					notification.warn(`第${i}行, ${name}请领数量大于可用库存!`);
					return false;
				}
				newOrdinarySelectList.push({ quantity, ordinaryId: id, requestReason });
			}
		}
		let warehouseData: Record<string, any> | undefined = goodsSelectList.length
			? goodsRef.current?.getSearchWarehouse()
			: ordinaryRef.current?.getSearchWarehouse();
		if (warehouseData) {
			if (IsAllocation) {
				params = {
					targetWarehouseId: warehouseData.targetWarehouseId,
					sourceWarehouseId: warehouseData.sourceWarehouseId,
					details: [...newGoodsSelectList],
				};
			} else {
				params = {
					warehouseId: warehouseData.targetWarehouseId,
					...{ id: pageType === 'edit' ? pageId : undefined },
					items: [...newGoodsSelectList, ...newOrdinarySelectList],
				};
			}
		}

		return params;
	};

	// 新增/编辑
	const confirm = async () => {
		form
			.validateFields()
			.then(async () => {
				let params = getParams();
				if (!params) return;
				setConfirmLoading(true);
				try {
					let res = isAllocation.current
						? await makingReallocate(params as ReallocateController.MakingReallocateParams)
						: pageType === 'add'
						? await addApply(params as GoodsRequestController.AddGoodsParams)
						: await editApply(params as GoodsRequestController.EditGoodsParams);
					let result = res as { code: number };
					if (result && result?.code === 0) {
						history.goBack();
					}
				} finally {
					setConfirmLoading(false);
				}
			})
			.catch((error) => {});
	};

	const selectValidation = (type: string) => {
		let goodsLen = goodsRef.current?.selectList()?.length;
		let ordinaryLen = ordinaryRef.current?.selectList()?.length;
		if ((type == 'goods' && ordinaryLen) || (type == 'ordinary' && goodsLen)) {
			Modal.warning({
				title: '提示',
				content: '不允许跨耗材包装种类发起请领，请确认后重试！',
			});
			return false;
		}
		return true;
	};

	const pageDataProp = {
		check,
		warehouseObj,
		centerWarehouseData,
		sourceWarehouseData,
		targetWarehouseData,
		sourceWarehouseId,
		targetWarehouseId,
		selectValidation,
	};

	const getEditWarehouseData = (type: string) => {
		return pageId && type == tabType && pageType === 'edit' ? { ...editWarehouseData, pageId } : {};
	};

	useDidMount(() => {
		queryUserHabit();
	});

	const queryUserHabit = async () => {
		const res: Record<string, any> = await getPreferenceByCode({
			preferenceCode: 'department_warehousing_apply_add_goods_show_habits',
		});
		setCheck(boo[res?.data[0].detailInfo]);
	};
	const onClickSwitch = () => {
		setCheck(!check);
		addOrUpdate({
			detailInfo: !check,
			preferenceCode: 'department_warehousing_apply_add_goods_show_habits',
			preferenceName: '入库业务-入库申请-入库申请发起-页面定制开关',
		});
	};

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<div style={{ display: 'flex' }}>
					<div style={{ flex: 1 }}>
						<Breadcrumb
							config={[
								'',
								['', { pathname: '/department/warehousing_apply', state: 'manual_request_list' }],
								'',
							]}
						/>
					</div>
					<Switch
						checked={check}
						onChange={onClickSwitch}
						style={{
							marginTop: 10,
							display: activeTab === 'goods' ? '' : 'none',
						}}
					/>
				</div>
			</div>
			<Spin
				spinning={loading}
				size='large'>
				<div>
					<Form form={form}>
						{pageType === 'add' && (
							<>
								{tagsData && tagsData.length > 1 && (
									<Tabs
										activeKey={activeTab}
										onChange={(value: string) => setActiveTab(value)}>
										<TabPane
											tab={fields.baseGoods}
											key='goods'>
											<Goods {...{ global, comRef: goodsRef, ...pageDataProp, goodsList }} />
										</TabPane>
										<TabPane
											tab='医耗套包'
											key='ordinary'>
											<Ordinary
												{...{ global, comRef: ordinaryRef, ...pageDataProp, ordinaryListData }}
											/>
										</TabPane>
									</Tabs>
								)}
								{tagsData &&
									tagsData.length === 1 &&
									(tagsData.some((item) => item.value === 'goods') ? (
										<Goods {...{ global, comRef: goodsRef, ...pageDataProp, goodsList }} />
									) : (
										<Ordinary
											{...{ global, comRef: ordinaryRef, ...pageDataProp, ordinaryListData }}
										/>
									))}
							</>
						)}
						{pageType === 'edit' && (
							<>
								{tabType === 'goods' && tagsData.some((item) => item.value === 'goods') && (
									<Goods
										{...{
											global,
											comRef: goodsRef,
											...pageDataProp,
											goodsList,
											...getEditWarehouseData('goods'),
										}}
									/>
								)}
								{tabType === 'ordinary' && tagsData.some((item) => item.value === 'ordinary') && (
									<Ordinary
										{...{
											global,
											comRef: ordinaryRef,
											...pageDataProp,
											ordinaryListData,
											...getEditWarehouseData('ordinary'),
										}}
									/>
								)}
							</>
						)}
					</Form>
				</div>
			</Spin>
			<FooterToolbar>
				<Button
					onClick={() => history.goBack()}
					className='returnButton'>
					返回
				</Button>
				<Button
					onClick={() => confirm()}
					type='primary'
					loading={confirmLoading}
					className='verifyButton'>
					确认操作
				</Button>
			</FooterToolbar>
		</div>
	);
};

export default connect(({ global }: { global: Record<string, any> }) => ({ global }))(
	addAllocation,
);
