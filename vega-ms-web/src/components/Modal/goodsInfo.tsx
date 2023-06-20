import DownloadWithLabel from '@/components/DownloadWithLabel';
import { convertPriceWithDecimal, formatUnitNum } from '@/utils/format';
import { Col, Descriptions, Divider, Modal, Row, Spin } from 'antd';
import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';

import { antiEpidemicTypeTextMap, limitTypeTextMap } from '@/constants/dictionary';
import { getDetail } from '@/services/newGoodsTypes';
import { useModel } from 'umi';
import style from './index.less';

const GoodsInfo: FC<{
	visible: boolean;
	id: string | number;
	setVisible: (visible: boolean) => void;
}> = ({ visible, setVisible, id }) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [detail, setDetail] = useState<Partial<NewGoodsTypesController.GoodsRecord>>({});
	const [requiredTemperature, setRequiredTemperature] = useState<boolean>(false);
	const [newDictionary] = useState<Record<string, Record<string, any>[]>>(
		JSON.parse(sessionStorage.getItem('newDictionary') || '{}'),
	);
	const [systemType] = useState<string | null>(sessionStorage.getItem('systemType'));
	const { fields } = useModel('fieldsMapping');

	const temperatureRequired = (val: string) => {
		if (!val) {
			setRequiredTemperature(false);
			return;
		}
		const categoryList = (newDictionary.reagent_category || []).map((item) => item.value);
		const param = categoryList.includes(val);
		setRequiredTemperature(param);
	};

	const getInfo = async () => {
		setLoading(true);
		const res = await getDetail(id);
		setLoading(false);
		if (res && res.code === 0) {
			setDetail(res.data);
			temperatureRequired(res.data.materialCategory as string);
		}
	};

	useEffect(() => {
		if (visible) {
			getInfo();
		}
	}, [visible]);

	return (
		<Spin spinning={loading}>
			<Modal
				visible={visible}
				width='80%'
				maskClosable={false}
				title='查看详情'
				onCancel={() => setVisible(false)}
				footer={false}
				className='goodsInfoModal'>
				<Descriptions
					column={{ xs: 1, sm: 2, lg: 3, xl: 4 }}
					size='small'
					title='基本信息'>
					<Descriptions.Item label={fields.goodsName}>{detail.name || '-'}</Descriptions.Item>
					<Descriptions.Item label='产品主码'>{detail.pmCode || '-'}</Descriptions.Item>
					<Descriptions.Item label='规格'>{detail.specification || '-'}</Descriptions.Item>
					<Descriptions.Item label='通用名'>{detail.commonName || '-'}</Descriptions.Item>
					<Descriptions.Item label='本地医保编码'>{detail.chargeNum || '-'}</Descriptions.Item>
					<Descriptions.Item label='型号'>{detail.model || '-'}</Descriptions.Item>
					<Descriptions.Item label='生产厂家'>{detail.manufacturerName || '-'}</Descriptions.Item>
					<Descriptions.Item label='限制类型'>
						{limitTypeTextMap[detail.limitType as string] || '-'}
					</Descriptions.Item>
					<Descriptions.Item label='包装规格'>
						{detail
							? formatUnitNum(
									detail.minGoodsNum as number,
									detail.minGoodsUnit as string,
									detail.purchaseGoodsUnit,
							  )
							: '-'}
					</Descriptions.Item>
					<Descriptions.Item label='品牌'>{detail.brand || '-'}</Descriptions.Item>
					<Descriptions.Item label='每月限制(计价单位)'>
						{detail.limitPerMonth || '-'}
					</Descriptions.Item>
					<Descriptions.Item label='单价(含税)'>
						{detail.procurementPrice
							? `${convertPriceWithDecimal(detail.procurementPrice)}元`
							: '-'}
					</Descriptions.Item>
					<Descriptions.Item label={fields.baseGoodsProperty}>
						{detail.isHighValue ? '高值' : '低值'}
					</Descriptions.Item>
					{systemType !== 'Insight_RS' && (
						<Descriptions.Item label='是否植/介入物'>
							{detail.isImplantation ? '是' : '否'}
						</Descriptions.Item>
					)}
					<Descriptions.Item label='是否条码管控'>
						{detail.isBarcodeControlled ? '是' : '否'}
					</Descriptions.Item>
					<Descriptions.Item label='近效期(天)'>
						{detail.nearExpirationDays || '-'}
					</Descriptions.Item>
					<Descriptions.Item label='是否医疗器械'>
						{detail.isConsumableMaterial ? '是' : '否'}
					</Descriptions.Item>
					<Descriptions.Item label={`${fields.baseGoods}分类`}>
						{detail.categoryText || '-'}
					</Descriptions.Item>
					<Descriptions.Item label={fields.antiEpidemic}>
						{antiEpidemicTypeTextMap[`${detail.antiEpidemic}`] || '-'}
					</Descriptions.Item>
					<Descriptions.Item label={fields.goodsType}>
						{detail.materialCategory || '-'}
					</Descriptions.Item>
					{requiredTemperature && (
						<Descriptions.Item label='存放温度'>
							{detail.lowTemperature || '-'} ~ {detail.highTemperature || '-'}℃
						</Descriptions.Item>
					)}
				</Descriptions>
				{detail.isConsumableMaterial && (
					<>
						<Divider />
						<Descriptions
							column={{ xs: 1, sm: 2, lg: 3 }}
							size='small'
							title='注册证'>
							{(detail.registrationList || []).map((item, index) => {
								return (
									<React.Fragment key={index}>
										<Descriptions.Item label='注册证照'>
											{item.registrationNum} <DownloadWithLabel url={item.registrationImg} />
										</Descriptions.Item>
										<Descriptions.Item
											label='注册有效期'
											span={2}>
											{`${moment(item.registrationBeginDate).format('YYYY/MM/DD')} ~ ${
												item.registrationEndDate
													? moment(item.registrationEndDate).format('YYYY/MM/DD')
													: '长期有效'
											}`}
										</Descriptions.Item>
									</React.Fragment>
								);
							})}
						</Descriptions>
					</>
				)}
				<Divider />
				<h3 className='ant-descriptions-title'>关联信息</h3>
				<Row className={style.detailWrap}>
					<Col
						sm={24}
						md={8}>
						关联{fields.distributor}
						{(detail.supplierList || []).map((value, index) => {
							return (
								<span
									key={index}
									className={value.defaultSupplier ? '' : style.default}>
									{value.supplierName}
									{value.defaultSupplier ? '（默认）' : ''}
								</span>
							);
						})}
					</Col>
					<Col
						sm={24}
						md={8}>
						一级{fields.distributor}{' '}
						<span>{detail.custodianId == 1 ? '-' : detail.custodianName}</span>
					</Col>
				</Row>
				<Divider />
				<Descriptions
					size='small'
					title='其他'>
					<Descriptions.Item label='备注'>{detail.description || '-'}</Descriptions.Item>
				</Descriptions>
			</Modal>
		</Spin>
	);
};
export default GoodsInfo;
