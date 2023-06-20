import type { ProColumns, ProTableAction } from '@/components/ProTable';
import type { ProFormColumns, ProFormValueType } from '@/components/SchemaForm';
import { timeType } from '@/constants';
import { DealDate } from '@/utils/DealDate';
import request from '@/utils/request';
import type { ProFieldValueType } from '@ant-design/pro-utils';
import { FormInstance } from 'antd';
import moment from 'moment';
import { MutableRefObject, ReactChild, ReactFragment, ReactPortal, useEffect } from 'react';
import { history } from 'umi';

export const searchColumnsMap = (
	columns: StatisticController.ConditionList[],
	form: FormInstance<any>,
	id: string | number,
	isSubmit?: boolean,
) => {
	const getType = (type: string, plain: boolean) => {
		let valueType: ProFieldValueType | ProFormValueType = 'text';
		switch (type) {
			case 'select':
				valueType = plain ? 'tagSelect' : 'select';
				break;
			case 'search_select':
				valueType = 'apiSelect';
				break;
			case 'input':
				valueType = 'text';
				break;
			case 'date_range':
				valueType = plain ? 'dateRangeWithTag' : 'dateRange';
				break;
		}
		return valueType;
	};
	const searchColumns: ProFormColumns = [];
	const result = history?.location?.state?.tableParams;
	(columns || []).forEach((column, index) => {
		const valueType = getType(column.type, column.plain);
		const options = column.options
			? column.options.map((option) => ({ label: option.value, value: option.key }))
			: valueType === 'dateRangeWithTag'
			? timeType
			: undefined;
		const placeholder = valueType === 'select' || valueType === 'apiSelect' ? '请选择' : '请输入';
		const filterOption = (input: string, option: { label: string }) => {
			return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
		};
		const fieldConfig = column.optionUrl
			? {
					label: column.optionKey,
					value: column.optionValue,
			  }
			: undefined;
		const api = (params: Record<string, any>) => {
			return request(column.optionUrl, { params });
		};
		const dataIndex = id + '&' + column.field;
		const fieldProps = {
			placeholder: ['text', 'select', 'apiSelect'].includes(valueType) ? placeholder : undefined,
			options,
			defaultValue:
				valueType === 'tagSelect' && column.hasOwnProperty('initialValue')
					? column.initialValue
					: undefined,
			multiple:
				valueType === 'tagSelect' && column.hasOwnProperty('initialValue') ? false : undefined,
			filterOption: valueType === 'apiSelect' ? filterOption : undefined,
			fieldConfig,
			api: column.optionUrl ? api : undefined,
			params: column.optionUrl ? { pageSize: 9999, pageNum: 0 } : undefined,
			disabledDate: (current: number) => {
				return column.limitStartTime ? current.valueOf() < column?.limitStartTime : undefined;
			},
		};
		const formItemProps = {
			rules: [{ required: column.required, message: `请选择${column.label}` }],
		};

		if (result && result[dataIndex] && isSubmit) {
			form.setFieldsValue({
				[dataIndex]:
					typeof result[dataIndex] === 'string' &&
					result[dataIndex].search(',') >= 0 &&
					valueType === 'dateRangeWithTag'
						? result[dataIndex].split(',').map((e: any) => Number(e))
						: result[dataIndex],
			});
		}

		searchColumns.push({
			initialValue: column.hasOwnProperty('initialValue') ? column.initialValue : undefined,
			title: column.label,
			dataIndex,
			key: dataIndex,
			valueType,
			fieldProps,
			formItemProps,
		});
	});
	if (isSubmit && result && searchColumns.some((item) => !!result[item.dataIndex])) {
		setTimeout(() => {
			form.submit();
		}, 200);
	}
	return searchColumns;
};

const switchTo = (
	text: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined,
	record: Record<string, any>,
	tabRef: any,
	toTemplateId: number,
) => {
	const pathName = history.location.pathname.split('/');
	const { params } = tabRef?.current?.getParams();
	let result = {
		[`${toTemplateId}&approvalTime`]: params.approvalTime,
		[`${toTemplateId}&distributor_id`]: Number(record.distributor_id),
	};
	return (
		<a
			onClick={() => {
				history.replace({
					...history.location,
					pathname: pathName
						.slice(1, pathName.length - 2)
						.map((item) => '/' + item)
						.join(''),
					state: {
						...history.location.state,
						key: String(toTemplateId),
						code: undefined,
						isMenu: undefined,
						tableParams: result || {},
					},
					query: {},
					search: '',
				});
			}}
			className='gotoDetail'>
			{text}
		</a>
	);
};

export const tableColumnsMap = (
	columns: StatisticController.ResultListColumns[],
	tabRef: MutableRefObject<ProTableAction | undefined>,
	isExportFile: boolean,
) => {
	const tableColumns: ProColumns<Record<string, any>>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 60,
			renderText: (_text, _record, index) => index + 1,
		},
	];
	columns.forEach((column) => {
		const renderText = (text: number) => (typeof text === 'number' ? DealDate(text, 0, '-') : text);
		const valueEnum = column.colorMap ? column.colorMap : undefined;
		if (valueEnum) {
			for (let key in valueEnum) {
				valueEnum[key] = { text: key, color: valueEnum[key] };
			}
		}
		const filters = column.colorMap ? false : undefined;
		tableColumns.push({
			align: column.align,
			width: column.width,
			title: column.columnName,
			dataIndex: column.dataIndex,
			renderText:
				column.type === 'timestamp'
					? renderText
					: column.toTemplateId
					? (text, record) => switchTo(text, record, tabRef, column.toTemplateId)
					: undefined,
			sorter: isExportFile ? column.sorter : undefined,
			key: column.sorter ? column.columnField : undefined,
			valueEnum,
			filters,
			copyable: column.copyable,
		});
	});
	return tableColumns;
};
