import type { DescriptionsItemProps as ItemProps } from 'antd/es/descriptions/Item';
import type { DescriptionsProps as DescriptionsCompProps } from 'antd/es/descriptions';
import type { ReactNode } from 'react';

export type DescriptionsItemProps<T = Record<string, any>> = Omit<ItemProps, 'children'> & {
	dataIndex: string;
	show?: boolean; // 是否展示
	render?: (text: any, data: T) => ReactNode;
};

export type DescriptionsProps<T = Record<string, any>> = DescriptionsCompProps & {
	options: DescriptionsItemProps<T>[];
	optionEmptyText?: string | false;
	data: T;
	hideIfEmpty?: boolean; // 是否数据是空的时候隐藏
	defaultColumn?: 4 | 3; //第一种情况:如果详情弹窗右边项有两项以上传3。第二种情况：如果详情弹窗右边项是一个就传4
	minColumn?: 3 | 2; //当弹窗分辨率为1024（包括）以下，先根据右边弹框有几项,如果是两项以上就穿2，其它情况就传3
};
