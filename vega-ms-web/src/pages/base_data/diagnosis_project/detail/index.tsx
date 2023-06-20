import Breadcrumb from '@/components/Breadcrumb';
import TableBox from '@/components/TableBox';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { Card, Descriptions, Divider } from 'antd';
import React, { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
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
			setList(res.data.detail);
		}
		setLoading(false);
	};

	useEffect(() => {
		getDetailInfo();
	}, []);

	useEffect(() => {
		if (history.location.state) {
			sessionStorage.setItem('diagnosis_project', JSON.stringify(history.location.state.params));
		}
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
			ellipsis: true,
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
			render: (text: any, record: Record<string, any>) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			width: 150,
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			ellipsis: true,
		},
		{
			title: '单价(元)',
			width: 120,
			dataIndex: 'procurementPrice',
			key: 'procurementPrice',
			align: 'right',
			render: (text, record) => {
				return <span>{text ? convertPriceWithDecimal(text) : '-'}</span>;
			},
		},
		{
			title: '数量',
			width: 80,
			dataIndex: 'quantity',
			key: 'quantity',
		},
		{
			title: '单位',
			width: 80,
			dataIndex: 'minGoodsUnit',
			key: 'minGoodsUnit',
			ellipsis: true,
		},
	];

	return (
		<div>
			<Breadcrumb
				config={[
					'',
					['', { pathname: '/base_data/diagnosis_project', state: 'diagnosis_project' }],
					'',
				]}
			/>
			<Card bordered={false}>
				<Descriptions
					column={{ xs: 1, sm: 2, lg: 3 }}
					size='small'
					title='基本信息'>
					<Descriptions.Item label='诊疗项目名称'>{detail.name || '-'}</Descriptions.Item>
					<Descriptions.Item label='诊疗项目编号'>{detail.code || '-'}</Descriptions.Item>
					<Descriptions.Item label='类别'>{detail.typeName || '-'}</Descriptions.Item>
					<Descriptions.Item label='备注'>{detail.remark || '-'}</Descriptions.Item>
				</Descriptions>
				<Divider />
				<TableBox
					headerTitle={<h3 className='ant-descriptions-title'>项目内容</h3>}
					rowKey='id'
					columns={columns}
					dataSource={list}
					scroll={{ y: 300 }}
					pagination={false}
					loading={loading}
					tableInfoId='135'
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
