import { DescriptionsItemProps } from '@/components/Descriptions/typings';
import { Divider, Row } from 'antd';
import Descriptions from '@/components/Descriptions';
import DownloadWithLabel from '@/components/DownloadWithLabel';
import Images from '@/components/Images';
type PropsType = {
	otherAttachments: {
		attachments: string;
		id: Number;
		remark: string;
		primaryKeyId: Number;
		type: Number;
	};
};
const OtherAttachmentsDetail = (props: PropsType) => {
	const { attachments, remark } = props.otherAttachments;
	const attachmentslist = attachments && JSON.parse(attachments);
	console.log(attachmentslist, 'attachmentslistattachmentslist');

	const otherAttachmentsOptions: DescriptionsItemProps[] = [
		{
			label: '附件名称',
			dataIndex: 'name',
		},
		{
			label: '附件信息',
			dataIndex: 'info',
			render: (text: string[]) => {
				return text && Array.isArray(text)
					? text.map((item: string) => {
							return (
								<div>
									<Images url={item} />
									<DownloadWithLabel url={item} />
								</div>
							);
					  })
					: '';
			},
		},
	];
	const otherAttachmentsRemark: DescriptionsItemProps[] = [
		{
			label: '备注',
			dataIndex: 'remark',
		},
	];
	return (
		<div className='row row-4 distributormiddledetil'>
			<h3 className='mb1'>其他附件</h3>
			<Row>
				{attachmentslist &&
					attachmentslist.map((item: { name: string; info: string }) => {
						return (
							<Descriptions
								options={otherAttachmentsOptions}
								data={item || {}}
								optionEmptyText='-'
								hideIfEmpty
							/>
						);
					})}
				<Descriptions
					options={otherAttachmentsRemark}
					data={{ remark } || {}}
					optionEmptyText='-'
					hideIfEmpty
				/>
			</Row>
			<Divider />
		</div>
	);
};
export default OtherAttachmentsDetail;
