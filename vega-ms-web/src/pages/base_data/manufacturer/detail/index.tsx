import Breadcrumb from '@/components/Breadcrumb';
import DownloadWithLabel from '@/components/DownloadWithLabel';
import Images from '@/components/Images';
import { getAllGoods12, getAllGoods18 } from '@/services/category';
import { getDetail } from '@/services/manufacturer';
import { businessScope } from '@/utils/dataUtil';
import { formatMoney } from '@/utils/format';
import { Card, Col, Descriptions, Divider, Row, Tree } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import '../../components/OtherAttachments/style.less';
import OtherAttachmentsDetail from '../../components/OtherAttachments/detail';
const Module = ({ match }: Record<string, any>) => {
	const { id } = match.params;
	const [detail, setDetail] = useState<ManufacturerController.DetailRecord>({});
	//12版经营范围
	const [goodsCategory12, setGoodsCategory12] = useState<CategoryController.TypeData[]>([]);
	//18版经营范围
	const [goodsCategory18, setGoodsCategory18] = useState<CategoryController.TypeData[]>([]);

	useEffect(() => {
		const getTypeList12 = async () => {
			const res = await getAllGoods12({});
			if (res && res.code === 0) {
				setGoodsCategory12(res.data);
			}
		};
		getTypeList12();
		const getTypeList18 = async () => {
			const result = await getAllGoods18({});
			if (result && result.code === 0) {
				setGoodsCategory18(result.data);
			}
		};
		getTypeList18();
	}, []);
	useEffect(() => {
		const queryGoodsLists = async () => {
			const res = await getDetail(id);
			if (res && res.code == 0) {
				setDetail(res.data);
			}
		};
		if (id) {
			queryGoodsLists();
		}
	}, [id]);
	const renderTreeNodes12 = (nodes: Record<string, any>[]) =>
		nodes.map((item) => {
			if (item.children) {
				return (
					<Tree.TreeNode
						title={item.code}
						key={`parent${item.id}`}>
						{renderTreeNodes12(item.children)}
					</Tree.TreeNode>
				);
			}
			return (
				<Tree.TreeNode
					key={item.id}
					title={item.code}
					className='treeLeaf'
				/>
			);
		});

	const renderTreeNodes18 = (nodes: Record<string, any>[]) =>
		nodes.map((item) => {
			if (item.children) {
				return (
					<Tree.TreeNode
						title={item.code}
						key={`parent${item.id}`}>
						{renderTreeNodes18(item.children)}
					</Tree.TreeNode>
				);
			}
			return (
				<Tree.TreeNode
					key={item.id}
					title={item.code}
					className='treeLeaf'
				/>
			);
		});

	// 营业执照
	const bussiness_license: ManufacturerController.LicenseManufacturerBusiness =
		(detail && detail.licenseManufacturerBusiness) || {};
	// 生产许可
	const permit_license = (detail && detail.licenseManufacturerPermit) || {};
	return (
		<div className='handle-page'>
			<div className='handle-page-breadcrumb'>
				<Breadcrumb config={['', ['', '/base_data/manufacturer'], '']} />
			</div>
			<Card className='handle-page-card'>
				<div className='info'>
					<div className='row row-1'>
						<h3>基本信息</h3>
						<div>
							<Row>
								<Descriptions size='small'>
									{detail.companyName && (
										<Descriptions.Item label='生产厂家名称'>{detail.companyName}</Descriptions.Item>
									)}
									{detail.companyType && (
										<Descriptions.Item label='生产厂家类型'>{detail.companyType}</Descriptions.Item>
									)}
									{detail.nationality && (
										<Descriptions.Item label='生产厂家国别'>{detail.nationality}</Descriptions.Item>
									)}

									{detail.country && (
										<Descriptions.Item label='所在国家'>{detail.country}</Descriptions.Item>
									)}
									{detail.mergeName && (
										<Descriptions.Item label='地址'>{detail.mergeName}</Descriptions.Item>
									)}
									{detail.address && (
										<Descriptions.Item label='具体地址'>{detail.address}</Descriptions.Item>
									)}
									{detail.companyLegalPerson && (
										<Descriptions.Item label='生产厂家法人'>
											{detail.companyLegalPerson}
										</Descriptions.Item>
									)}
									{detail.registrant && (
										<Descriptions.Item label='生产厂家登记人'>
											{detail.registrant}
										</Descriptions.Item>
									)}
									{detail.principalName && (
										<Descriptions.Item label='生产厂家负责人'>
											{detail.principalName}
										</Descriptions.Item>
									)}
									{detail.companyNature && (
										<Descriptions.Item label='生产厂家性质'>
											{detail.companyNature}
										</Descriptions.Item>
									)}
									{detail.depositBank && (
										<Descriptions.Item label='开户银行'>{detail.depositBank}</Descriptions.Item>
									)}
									{detail.bankAccount && (
										<Descriptions.Item label='开户银行账号'>{detail.bankAccount}</Descriptions.Item>
									)}
									{detail.contactName && (
										<Descriptions.Item label='联系人'>{detail.contactName}</Descriptions.Item>
									)}
									{detail.contactTelephone && (
										<Descriptions.Item label='联系电话'>
											{detail.contactTelephone}
										</Descriptions.Item>
									)}
									{detail.contactMobilePhone && (
										<Descriptions.Item label='手机'>{detail.contactMobilePhone}</Descriptions.Item>
									)}
									{detail.contactDepartment && (
										<Descriptions.Item label='部门'>{detail.contactDepartment}</Descriptions.Item>
									)}
									{detail.contactPosition && (
										<Descriptions.Item label='职务'>{detail.contactPosition}</Descriptions.Item>
									)}
									{detail.companyTelephone && (
										<Descriptions.Item label='公司电话'>
											{detail.companyTelephone}
										</Descriptions.Item>
									)}
									{detail.companyEmail && (
										<Descriptions.Item label='公司邮箱'>{detail.companyEmail}</Descriptions.Item>
									)}
									{detail.companyFax && (
										<Descriptions.Item label='公司传真'>{detail.companyFax}</Descriptions.Item>
									)}
									{detail.shortName && (
										<Descriptions.Item label='简称'>{detail.shortName}</Descriptions.Item>
									)}
									{detail.website && (
										<Descriptions.Item label='公司网址'>{detail.website}</Descriptions.Item>
									)}
									{detail.remark && (
										<Descriptions.Item label='备注'>{detail.remark}</Descriptions.Item>
									)}
								</Descriptions>
							</Row>
						</div>
					</div>
					<Divider />
					<div className='row row-2'>
						<h3 className='mb1'>营业执照</h3>
						<Row>
							<Descriptions
								size='small'
								className='filesUploadDetail'>
								<Descriptions.Item label='营业执照'>
									{(bussiness_license.licenseImgList || []).map((item) => (
										<div>
											<Images url={item || ''} />
											<DownloadWithLabel
												label=''
												url={item || ''}
											/>
										</div>
									))}
								</Descriptions.Item>
								{bussiness_license.creditCode && (
									<Descriptions.Item label='统一社会信用代码'>
										{bussiness_license.creditCode}
									</Descriptions.Item>
								)}
								{bussiness_license.licenseNo && (
									<Descriptions.Item label='证照编号'>
										{bussiness_license.licenseNo}
									</Descriptions.Item>
								)}
								{bussiness_license.establishedTime && (
									<Descriptions.Item label='成立时间'>
										{moment(bussiness_license.establishedTime).format('YYYY/MM/DD')}
									</Descriptions.Item>
								)}
								{bussiness_license.licenseBeginTime && (
									<Descriptions.Item label='有效日期'>{`
            ${
							bussiness_license.licenseBeginTime
								? moment(bussiness_license.licenseBeginTime).format('YYYY/MM/DD')
								: ''
						} ~
               ${
									bussiness_license.licenseEndTime
										? moment(bussiness_license.licenseEndTime).format('YYYY/MM/DD')
										: '长期有效'
								}`}</Descriptions.Item>
								)}

								{bussiness_license.legalPerson && (
									<Descriptions.Item label='法定代表人'>
										{bussiness_license.legalPerson}
									</Descriptions.Item>
								)}
								{bussiness_license.registeredCapital && (
									<Descriptions.Item label='注册资金'>
										{formatMoney(bussiness_license.registeredCapital) + '万'}
									</Descriptions.Item>
								)}
								{bussiness_license.registeredCurrencyName && (
									<Descriptions.Item label='币种'>
										{bussiness_license.registeredCurrencyName}
									</Descriptions.Item>
								)}

								{bussiness_license.companyType && (
									<Descriptions.Item label='生产厂家类型'>
										{bussiness_license.companyType}
									</Descriptions.Item>
								)}
								{bussiness_license.qualityManager && (
									<Descriptions.Item label='质量管理人'>
										{bussiness_license.qualityManager}
									</Descriptions.Item>
								)}
								{bussiness_license.qualityManagerAddress && (
									<Descriptions.Item label='住所'>
										{bussiness_license.qualityManagerAddress}
									</Descriptions.Item>
								)}
								{bussiness_license.productionAddress && (
									<Descriptions.Item label='生产地址'>
										{bussiness_license.productionAddress}
									</Descriptions.Item>
								)}
								{bussiness_license.remark && (
									<Descriptions.Item label='备注'>{bussiness_license.remark}</Descriptions.Item>
								)}
								{bussiness_license.std95CategoryText &&
									bussiness_license.std95CategoryText.length > 0 && (
										<Descriptions.Item label='非医疗器械经营范围'>
											{' '}
											{(bussiness_license.std95CategoryText || []).join(', ')}
										</Descriptions.Item>
									)}

								{bussiness_license.categoryText && bussiness_license.categoryText.length > 0 && (
									<Descriptions.Item label='医疗器械经营范围'>
										{' '}
										{(bussiness_license.categoryText || []).join(', ')}
									</Descriptions.Item>
								)}
							</Descriptions>
							{((bussiness_license.std2012CategoryIds &&
								bussiness_license.std2012CategoryIds.length > 0) ||
								(bussiness_license.std2018CategoryIds &&
									bussiness_license.std2018CategoryIds.length > 0)) && (
								<div style={{ fontSize: '14px', color: CONFIG_LESS['@c_body'] }}>经营范围：</div>
							)}
							{bussiness_license.std2012CategoryIds &&
								bussiness_license.std2012CategoryIds.length > 0 && (
									<Col span={24}>
										<div style={{ margin: '10px 0px' }}>12版分类：</div>
										<Tree
											selectable={false}
											className='treeBox'>
											{renderTreeNodes12(
												businessScope(goodsCategory12, bussiness_license.std2012CategoryIds) || [],
											)}
										</Tree>
									</Col>
								)}
							{bussiness_license.std2018CategoryIds &&
								bussiness_license.std2018CategoryIds.length > 0 && (
									<Col span={24}>
										<div style={{ margin: '10px 0px' }}>18版分类：</div>
										<Tree
											selectable={false}
											className='treeBox'>
											{renderTreeNodes18(
												businessScope(goodsCategory18, bussiness_license.std2018CategoryIds) || [],
											)}
										</Tree>
									</Col>
								)}
						</Row>
					</div>

					<Divider />

					<div className='row row-3'>
						<h3 className='mb1'>生产许可证</h3>
						<Row>
							<Descriptions size='small'>
								<Descriptions.Item label='生产许可证'>
									{(permit_license.permitImgList || []).map((item) => (
										<div>
											<Images url={item || ''} />
											<DownloadWithLabel
												label=''
												url={item || ''}
											/>
										</div>
									))}
								</Descriptions.Item>

								{permit_license.permitNo && (
									<Descriptions.Item label='许可证号'>{permit_license.permitNo}</Descriptions.Item>
								)}
								{permit_license.principalName && (
									<Descriptions.Item label='生产厂家负责人'>
										{permit_license.principalName}
									</Descriptions.Item>
								)}
								{permit_license.legalPerson && (
									<Descriptions.Item label='法定代表人'>
										{permit_license.legalPerson}
									</Descriptions.Item>
								)}
								{permit_license.permitBeginTime && (
									<Descriptions.Item label='有效日期'>
										{`
                ${moment(permit_license.permitBeginTime).format('YYYY/MM/DD')} ~ ${
											permit_license.permitEndTime
												? moment(permit_license.permitEndTime).format('YYYY/MM/DD')
												: '长期有效'
										}`}
									</Descriptions.Item>
								)}

								{permit_license.registeredAddress && (
									<Descriptions.Item label='注册地址'>
										{permit_license.registeredAddress}
									</Descriptions.Item>
								)}
								{permit_license.remark && (
									<Descriptions.Item label='备注'>{permit_license.remark}</Descriptions.Item>
								)}
								{permit_license.categoryText && permit_license.categoryText.length > 0 && (
									<Descriptions.Item label='经营范围'>
										{(permit_license.categoryText || []).join(', ')}
									</Descriptions.Item>
								)}
							</Descriptions>
							{((permit_license.std2012CategoryIds &&
								permit_license.std2012CategoryIds.length > 0) ||
								(permit_license.std2018CategoryIds &&
									permit_license.std2018CategoryIds.length > 0)) && (
								<div style={{ fontSize: '14px', color: CONFIG_LESS['@c_body'] }}>经营范围：</div>
							)}
							{permit_license.std2012CategoryIds && permit_license.std2012CategoryIds.length > 0 && (
								<Col span={24}>
									<div style={{ margin: '10px 0px' }}>12版分类：</div>
									<Tree
										selectable={false}
										className='treeBox'>
										{renderTreeNodes12(
											businessScope(goodsCategory12, permit_license.std2012CategoryIds) || [],
										)}
									</Tree>
								</Col>
							)}
							{permit_license.std2018CategoryIds && permit_license.std2018CategoryIds.length > 0 && (
								<Col span={24}>
									<div style={{ margin: '10px 0px' }}>18版分类：</div>
									<Tree
										selectable={false}
										className='treeBox'>
										{renderTreeNodes18(
											businessScope(goodsCategory18, permit_license.std2018CategoryIds) || [],
										)}
									</Tree>
								</Col>
							)}
						</Row>
					</div>
					<Divider />
					{detail.otherAttachments && (
						<OtherAttachmentsDetail otherAttachments={detail.otherAttachments} />
					)}
				</div>
			</Card>
		</div>
	);
};

export default Module;
