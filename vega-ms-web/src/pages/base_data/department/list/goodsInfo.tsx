import TableBox from '@/components/TableBox';
import { consumeWay } from '@/constants/dictionary';
import { getDetail } from '@/services/ordinary';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { Col, Descriptions, Divider, Modal, Row, Spin } from 'antd';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';
import { useModel } from 'umi';
import style from './index.less';

const GoodsInfo: FC<{}> = ({ visible, setVisible, id }) => {
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [detail, setDetail] = useState({});
	const [detailgoos, setDetailgoos] = useState({});
	const [detailkeshi, setDetailkeshi] = useState([]);
	const [requiredTemperature, setRequiredTemperature] = useState<boolean>(false);
	const newDictionary = JSON.parse(sessionStorage.getItem('newDictionary') || '{}');

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
			setDetail(res.data.ordinaryDto);
			setDetailgoos(res.data);
			setDetailkeshi(res.data.ordinaryDepartment);
			temperatureRequired(res.data.materialCategory);
		}
	};

	const columnsSurgicals = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 60,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 140,
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			key: 'name',
			width: 100,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 120,
			ellipsis: true,
			render: (text: any, record: Record<string, any>) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '包装规格',
			dataIndex: 'specification',
			key: 'specification',
			width: 80,
		},

		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 80,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 140,
		},
		{
			title: '收费项',
			dataIndex: 'chargeName',
			key: 'chargeName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 150,
			align: 'right',
			render: (price) => convertPriceWithDecimal(price),
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 180,
		},
	];

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
					<Descriptions.Item label='医耗套包编号'>{detail.ordinaryCode || '-'}</Descriptions.Item>
					<Descriptions.Item label='医耗套包名称'>{detail.name || '-'}</Descriptions.Item>
					<Descriptions.Item label='状态'>
						{detail.menabled ? '已启用' : '未启用' || '-'}
					</Descriptions.Item>
					<Descriptions.Item label='创建人员'>{detail.createdBy || '-'}</Descriptions.Item>
					<Descriptions.Item label='创建时间'>
						{moment(Number(detail.timeCreated)).format('YYYY/MM/DD HH:mm:ss') || '-'}
					</Descriptions.Item>
					<Descriptions.Item label='医耗套包说明'>{detail.description || '-'}</Descriptions.Item>
					<Descriptions.Item label='消耗方式'>
						{detail.consumeType &&
							consumeWay.filter((item) => item.value === detail.consumeType)[0].label}
					</Descriptions.Item>
				</Descriptions>
				<Divider />
				<h3 className='ant-descriptions-title'>关联信息</h3>
				<Row className={style.detailWrap}>
					<Col
						sm={24}
						md={8}>
						关联科室：
						{(detailkeshi || []).map((value, index) => {
							return (
								<span
									key={index}
									className={value ? '' : style.default}>
									{value}
									{value ? '（默认）' : ''}
								</span>
							);
						})}
					</Col>
				</Row>
				<Divider />
				<h3 className='ant-descriptions-title'>医耗套包内容</h3>
				<TableBox
					columns={columnsSurgicals}
					rowKey='id'
					tableInfoId='239'
					options={{ density: false, fullScreen: false, setting: false }}
					dataSource={detailgoos.ordinaryGoods}
					pagination={false}
					size='small'
					bordered={false}
					scroll={{ x: '100%', y: 300 }}
				/>
			</Modal>
		</Spin>
	);
};
export default GoodsInfo;
