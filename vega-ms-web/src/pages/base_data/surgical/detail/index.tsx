import Breadcrumb from '@/components/Breadcrumb';
import TableBox from '@/components/TableBox';
import { formatStrConnect } from '@/utils/format';
import { Card, Descriptions, Divider } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { getDetail } from '../list/service';

const DetailWrap: React.FC<{}> = (props) => {
	const { fields } = useModel('fieldsMapping');
	const [list, setList] = useState([]);
	const [detail, setDetail] = useState({});
	const [loading, setLoading] = useState<boolean>(false);
	// 列表
	const getDetailInfo = async () => {
		setLoading(true);
		const res = await getDetail(props.match.params.id);
		if (res && res.code === 0) {
			setDetail(res.data);
			setList(res.data.page.rows);
		}
		setLoading(false);
	};

	useEffect(() => {
		getDetailInfo();
	}, []);

	const columns = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: fields.goodsCode,
			width: 150,
			dataIndex: 'materialCode',
			key: 'materialCode',
		},
		{
			title: fields.goodsName,
			width: 180,
			dataIndex: 'goodsName',
			key: 'goodsName',
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			ellipsis: true,
			render: (text: any, record: any) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 120,
			render: (text, record) => {
				return <span>{record.quantity + record.quantityUnitName}</span>;
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 150,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '产品注册证',
			dataIndex: 'goodsProductNum',
			key: 'goodsProductNum',
			width: 160,
		},
	];

	return (
		<div>
			<Breadcrumb config={['', ['', '/base_data/surgical'], '']} />
			<Card bordered={false}>
				<Descriptions
					column={{ xs: 1, sm: 2, lg: 3 }}
					size='small'
					title='基本信息'>
					<Descriptions.Item label='套包名称'>{detail.name || '-'}</Descriptions.Item>
					<Descriptions.Item label='类别'>{detail.categoryName || '-'}</Descriptions.Item>
					<Descriptions.Item label='是否定制类'>
						{detail.stockingUp ? '否' : '是'}
					</Descriptions.Item>
					<Descriptions.Item label='创建时间'>
						{detail.timeCreated ? moment(detail.timeCreated).format('YYYY/MM/DD  HH:mm:ss') : ''}
					</Descriptions.Item>
					<Descriptions.Item label='状态'>
						{detail.isEnabled ? '已启用' : '已禁用'}
					</Descriptions.Item>
					<Descriptions.Item label='本地医保编码'>{detail.chargeNum || '-'}</Descriptions.Item>
					<Descriptions.Item label='套包说明'>{detail.description || '-'}</Descriptions.Item>
				</Descriptions>
				<Divider />
				<h3 className='ant-descriptions-title'>关联信息</h3>
				<div>
					关联科室：
					{detail.departments && detail.departments.length > 0
						? detail.departments.map((value, index) => {
								return (
									<span
										key={index}
										className='dis-b'>
										{value}
									</span>
								);
						  })
						: '-'}
				</div>
				<Divider />
				<h3 className='ant-descriptions-title'>医耗套包内容</h3>
				<TableBox
					rowKey='id'
					columns={columns}
					dataSource={list}
					pagination={false}
					loading={loading}
					tableInfoId='133'
					scroll={{
						x: '100%',
						y: 300,
					}}
				/>
			</Card>
		</div>
	);
};

export default DetailWrap;
