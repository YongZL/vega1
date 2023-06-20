import Breadcrumb from '@/components/Breadcrumb';
import type { DescriptionsItemProps } from '@/components/Descriptions';
import DownloadWithLabel from '@/components/DownloadWithLabel';
import type { ConnectState } from '@/models/connect';
import type { GlobalModelState } from '@/models/global';
import {
	Button,
	Card,
	Col,
	Descriptions as AntDescriptions,
	Divider,
	Popconfirm,
	Row,
	Spin,
	Tabs,
} from 'antd';
import moment from 'moment';
import React, { useEffect, useState, createContext, useRef } from 'react';
import type { match as Match } from 'react-router';
// import DistributionUnit from './components/DistributionUnit';
import copy from '@/assets/images/copy.png';
import Descriptions from '@/components/Descriptions';
import Images from '@/components/Images';
import { antiEpidemicTypeTextMap, limitTypeTextMap } from '@/constants/dictionary';
import { getDetail } from '@/services/newGoodsTypes';
import { convertPriceWithDecimal } from '@/utils/format';
import { connect, history, useAccess, useModel } from 'umi';
import style from './index.less';
import '../../../components/OtherAttachments/style.less';
import OtherAttachmentsDetail from '../../../components/OtherAttachments/detail';
import { dealPackNum } from '@/utils/dataUtil';
import RelevanceDepartmentTable from './components/RelevanceDepartmentTable';
import RelevanceDistributionTable from './components/RelevanceDistributionTable';
import { batchUnbindDepartmentGoods } from '@/services/department';
import { ProTableAction } from '@/components/ProTable';

const TabPane = Tabs.TabPane;
type GoodsRecord = NewGoodsTypesController.GoodsRecord;

export const Context = createContext<{
	relevanceDepartmentTableRef?: React.MutableRefObject<ProTableAction | undefined>;
	selectList?: number[];
	setSelectList?: React.Dispatch<React.SetStateAction<number[]>>;
}>({});

const DetailWrap: React.FC<{
	global: GlobalModelState;
	match: Match<{ id: string }>;
}> = ({ global, ...props }) => {
	const { id } = props.match.params;

	const access = useAccess();
	const {
		loading: fieldLoading,
		extendedFields,
		fieldsMap,
		getGoodsFieldList,
	} = useModel('goodsField');
	const { fields } = useModel('fieldsMapping');
	const newDictionary = JSON.parse(sessionStorage.getItem('newDictionary') || '{}');
	const [detail, setDetail] = useState<GoodsRecord>({} as GoodsRecord);
	const [loading, setLoading] = useState<boolean>(false);
	const [showTemperature, setShowTemperature] = useState<boolean>(false);
	const [systemType] = useState<string>(sessionStorage.getItem('systemType') || 'Insight_MS'); // 默认为核心
	// 控制批量解绑按钮是否可以点击
	const [selectList, setSelectList] = useState<number[]>([]);
	// 当前激活的tabs
	const [tabActive, setTabActive] = useState<string>('associated_department');

	const relevanceDepartmentTableRef = useRef<ProTableAction>();

	// 列表
	const getDetailInfo = async () => {
		setLoading(true);
		try {
			const res = await getDetail(id);
			if (res && res.code === 0) {
				const { data } = res;
				const extendValuesMap: Record<string, any> = {};
				(data.extendedAttrValues || []).forEach((item) => {
					extendValuesMap[item.fieldName as string] = item.fieldValue;
				});
				setDetail({
					...data,
					...extendValuesMap,
				});
				const { materialCategory: val } = data;
				if (!val) {
					setShowTemperature(false);
					return;
				}
				const categoryList = (newDictionary.reagent_category || []).map((item: any) => item.value);
				setShowTemperature(categoryList.includes(val));
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getGoodsFieldList();
		getDetailInfo();
	}, []);

	const options: DescriptionsItemProps<GoodsRecord>[] = [
		{
			label: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			label: fields.goodsName,
			dataIndex: 'name',
		},
		{
			label: '产品主码',
			dataIndex: 'pmCode',
		},
		{
			label: '规格',
			dataIndex: 'specification',
		},
		{
			label: '通用名称',
			dataIndex: 'commonName',
		},
		{
			label: '本地医保编码',
			dataIndex: 'chargeNum',
		},
		{
			label: '国家医保编码',
			dataIndex: 'nationalNo',
		},
		{
			label: '型号',
			dataIndex: 'model',
		},
		{
			label: '生产厂家',
			dataIndex: 'manufacturerName',
		},
		{
			label: '限制类型',
			dataIndex: 'limitType',
			render: (text) => limitTypeTextMap[text],
		},
		{
			label: '大/中包装',
			dataIndex: 'largeBoxNum',
			render: (text: string, record) => dealPackNum(text, record.minGoodsNum),
		},
		{
			label: '品牌',
			dataIndex: 'brand',
		},
		{
			label: '每月限制(计价单位)',
			dataIndex: 'limitPerMonth',
		},
		{
			label: '含税单价',
			dataIndex: 'procurementPrice',
			render: (text: number) => (text ? `${convertPriceWithDecimal(text)}元` : '-'),
		},
		{
			label: fields.baseGoodsProperty,
			dataIndex: 'isHighValue',
			render: (text: boolean) => (typeof text === 'boolean' ? (text ? '高值' : '低值') : '-'),
		},
		{
			label: '跟台类别',
			dataIndex: 'stageType',
			render: (text: boolean) => (text ? `跟台类${fields.goods}` : `非跟台类${fields.goods}`),
		},
		{
			label: '是否植/介入物',
			dataIndex: 'isImplantation',
			render: (text: boolean) => (text ? '是' : '否'),
		},
		{
			label: '是否条码管控',
			dataIndex: 'isBarcodeControlled',
			render: (text: boolean) => (text ? '是' : '否'),
		},
		{
			label: '近效期(天)',
			dataIndex: 'nearExpirationDays',
		},
		{
			label: '是否医疗器械',
			dataIndex: 'isConsumableMaterial',
			render: (text: boolean) => (text ? '是' : '否'),
		},
		{
			label: `${fields.baseGoods}分类`,
			dataIndex: 'categoryText',
		},
		{
			label: fields.antiEpidemic,
			dataIndex: 'antiEpidemic',
			render: (text: boolean) => antiEpidemicTypeTextMap[`${text}`] || '-',
		},

		{
			label: fields.goodsType,
			dataIndex: 'materialCategory',
		},
		{
			label: 'DI',
			dataIndex: 'diCode',
		},
		{
			label: `${fields.goods}图片`,
			dataIndex: 'imgUrl',
			render: (text: string[], record: Record<string, any>) => {
				return (record.imgUrlList || []).map((item: string, index: number) => {
					const name = item.substring(text.lastIndexOf('/') + 1, text.length);
					return (
						<div key={index}>
							{name}
							{item && (
								<>
									<DownloadWithLabel url={item} />
									<Images url={item} />
								</>
							)}
						</div>
					);
				});
			},
		},
		{
			label: '存放温度',
			show: showTemperature,
			dataIndex: 'lowTemperature',
			render: (text, record) => (
				<>
					{record.lowTemperature || '-'} ~ {record.highTemperature || '-'}℃
				</>
			),
		},
		{
			label: '重点品种',
			// 非条码管控下重点品种不显示，具体看http://192.168.10.25:8090/pages/viewpage.action?pageId=39685785 1.2的图片
			show: detail.isBarcodeControlled,
			dataIndex: 'keyItem',
			render: (text: boolean) => {
				return typeof text === 'boolean' ? (text ? '是' : '否') : '-';
			},
		},
	];

	let finalOptions: DescriptionsItemProps<GoodsRecord>[] = [];

	if (!fieldLoading) {
		options.forEach((option) => {
			let key = option.dataIndex;
			if (key === 'imgUrl') {
				key = 'goodsImg';
			}
			const field = fieldsMap[key] || {};
			if (
				key === 'largeBoxNum' &&
				(field.enabled || (fieldsMap.minGoodsNum && fieldsMap.minGoodsNum.enablfieldsed))
			) {
				finalOptions.push(option);
			} else if (field.enabled) {
				finalOptions.push({
					...option,
					label: field.displayFieldLabel || option.label,
				});
			}
		});

		const listExtendedFields = (extendedFields || []).filter((item) => item.enabled);

		if (listExtendedFields.length) {
			listExtendedFields.forEach((item) => {
				const col: DescriptionsItemProps<GoodsRecord> = {
					label: `${item.displayFieldLabel}${
						item.displayFieldKey === 'goodsExtendedAttrMap.platformMatching' ? '状态' : ''
					}`,
					dataIndex: item.displayFieldKey as string,
				};
				if (item.displayFieldType === 'Date') {
					col.render = (text: string) =>
						text && Number(text) ? moment(Number(text)).format('YYYY/MM/DD') : '-';
				} else if (item.displayFieldType === 'Boolean') {
					col.render = (text: string) => (text === 'true' ? '是' : '否');
				}
				finalOptions.push(col);
			});
		}
		let initSort = 9999;
		finalOptions = finalOptions.sort((a, b: any) => {
			let aKey = a.dataIndex;
			let bKey = b.dataIndex;

			if (aKey === 'imgUrl') {
				aKey = 'goodsImg';
			}
			if (bKey === 'imgUrl') {
				bKey = 'goodsImg';
			}
			const aField = fieldsMap[aKey as string] || {};
			const bField = fieldsMap[bKey as string] || {};
			return (aField.sort || ++initSort) - (bField.sort || ++initSort);
		});
	}

	// tabs 变化时回调
	const tabsChange = (activeKey: string) => {
		setTabActive(activeKey);
	};

	// 解除绑定
	const batchRelieve = async () => {
		const res = await batchUnbindDepartmentGoods({
			departmentIds: selectList,
			goodsIds: [Number(id)],
		});
		if (res.code === 0) {
			setSelectList([]);
			relevanceDepartmentTableRef.current?.reload();
		}
	};

	return (
		<Context.Provider
			value={{
				relevanceDepartmentTableRef,
				selectList,
				setSelectList,
			}}>
			<Spin spinning={loading}>
				<div className='handle-page'>
					<div className='handle-page-breadcrumb'>
						<Breadcrumb
							config={[
								'',
								['', { pathname: '/base_data/new_goods', state: 'goodsDetail' }],
								['', { pathname: '/base_data/new_goods', state: 'goodsDetail' }],
								systemType === 'Insight_DS'
									? ` - ${(history.location.state as { goodsName: string })?.goodsName}`
									: '',
							]}
						/>
					</div>
					<Card
						bordered={false}
						className='handle-page-card'>
						<h3 className='ant-descriptions-title'>基本信息</h3>
						<div style={{ display: 'flex' }}>
							<div>
								<Descriptions
									column={{ xs: 1, sm: 2, lg: 3 }}
									size='small'
									title=''
									options={finalOptions}
									data={detail}
									optionEmptyText='-'
									className='filesUploadDetail'
								/>
							</div>
							{access.add_goods && (
								<div style={{ marginRight: '3.5%' }}>
									<a
										onClick={() => {
											history.push('/base_data/new_goods/copy/' + detail.id);
										}}>
										<div className={style.copy}>
											<img
												src={copy}
												width='20'
												height='20'
											/>
											复制{fields.goods}
										</div>
									</a>
								</div>
							)}
						</div>

						{detail.isConsumableMaterial && (
							<>
								<Divider />
								<h3 className='ant-descriptions-title'>注册证</h3>
								<AntDescriptions
									column={{ xs: 1, sm: 2, lg: 3 }}
									size='small'
									title=''
									className='filesUploadDetail'>
									{(detail.registrationList || []).map((item) => {
										return (
											<>
												<AntDescriptions.Item
													label='注册证照'
													key={item.registrationNum}>
													{(item.registrationImgList || []).map((data, index) => (
														<div key={index}>
															{item.registrationNum}
															<DownloadWithLabel url={data as string} />
															<Images url={data} />
														</div>
													))}
												</AntDescriptions.Item>
												<AntDescriptions.Item
													label='注册有效期'
													span={2}
													key={item.registrationBeginDate}>
													{`${
														item.registrationBeginDate
															? moment(item.registrationBeginDate).format('YYYY/MM/DD')
															: ''
													} ~ ${
														item.registrationEndDate
															? moment(item.registrationEndDate).format('YYYY/MM/DD')
															: '长期有效'
													}`}
												</AntDescriptions.Item>
											</>
										);
									})}
								</AntDescriptions>
							</>
						)}
						<Divider />
						<h3 className='ant-descriptions-title'>关联信息</h3>
						<Row className={style.detailWrap}>
							<Col
								sm={24}
								md={24}>
								<Tabs
									tabBarExtraContent={{
										right:
											tabActive === 'associated_department' ? (
												<Popconfirm
													placement='left'
													title='确定批量解绑吗？'
													onConfirm={batchRelieve}
													disabled={selectList.length === 0}>
													<Button
														disabled={selectList.length === 0}
														type='primary'>
														批量解绑
													</Button>
												</Popconfirm>
											) : (
												''
											),
									}}
									onChange={tabsChange}>
									<TabPane
										key='associated_department'
										tab='关联科室'>
										<RelevanceDepartmentTable id={id} />
									</TabPane>
									{access.goods_view_distributor && (
										<TabPane
											key='associated_distributor'
											tab={`关联${fields.distributor}`}>
											<RelevanceDistributionTable id={id} />
										</TabPane>
									)}
								</Tabs>
								{/* {detail.departments && detail.departments.length
                ? detail.departments.map((item, index) => {
                  return <span key={index}>{item}</span>;
                })
                : '-'} */}
							</Col>
							{/* <Col sm={24} md={24}> */}
							{/* <RelevanceDistributionTable id={id} /> */}
							{/* {(detail.distributorList || []).map((item, index) => {
                return (
                  <span key={index} className={item.defaultDistributor ? '' : style.default}>
                    {item.distributorName}
                  </span>
                );
              })} */}
							{/* </Col> */}
						</Row>
						<Divider />

						{fieldsMap.description && fieldsMap.description.enabled && (
							<>
								<AntDescriptions
									size='small'
									title='其他信息'>
									<AntDescriptions.Item label='备注'>
										{detail.description || '-'}
									</AntDescriptions.Item>
								</AntDescriptions>
								<Divider />
							</>
						)}

						{detail.otherAttachments && (
							<OtherAttachmentsDetail otherAttachments={detail.otherAttachments} />
						)}
					</Card>
				</div>
			</Spin>
		</Context.Provider>
	);
};

export default connect(({ global }: ConnectState) => ({ global }))(DetailWrap);
