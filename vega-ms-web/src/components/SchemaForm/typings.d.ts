import type { Rule } from 'antd/es/form';
import type { FormSchema, ProFormColumnsType } from '@ant-design/pro-form/es/components/SchemaForm';
import type { SpanConfig } from '@ant-design/pro-form/es/layouts/QueryFilter';
import type { ApiSelectProps } from './components/ApiSelect/typings';
import type { UploadProps } from './components/BasicUpload/typings';
import type { DateRangeWithTagProps } from './components/DateRangeWithTag/typings';
import type { RangeSelectProps } from './components/RangeSelect/typings';
import type { TagSelectProps } from './components/TagSelect/typings';
import type { SelectTableProps } from './components/SelectTable/typings';

export type ProFormValueType =
	| 'tagSelect'
	| 'dateRangeWithTag'
	| 'apiSelect'
	| 'upload'
	| 'remarks'
	| 'aSwitch'
	| 'inputUnit'
	| 'inputNumber'
	| 'scanInput'
	| 'scanInputWithSpace'
	| 'selectTable'
	| 'datePicker'
	| 'aText';

export type InitProFormColumns<T = Record<string, any>> = Omit<
	ProFormColumnsType<T, ProFormValueType>,
	'formItemProps'
> & {
	formItemProps?: ProFormColumnsType<T, ProFormValueType>['formItemProps'] & {
		labelWidth?: number;
	};
};

export type ProFormColumns<T = Record<string, any>> = (
	| InitProFormColumns<T>
	| InitProFormColumns<T>[]
)[];

export type FormSchemaProps<T = Record<string, any>> = Omit<
	FormSchema<T, ProFormValueType>,
	'columns'
> & {
	rules?: Record<string, Rule[]>;
	justifyLabel?: boolean;
	// 封装的protable里的queryFilter是否开启边框，默认为false
	bordered?: boolean;
	span?: SpanConfig;
	labelWidth?: number;
	columns: ProFormColumns<T>;
	defaultColsNumber?: number;
	hasRequired?: boolean; // 搜索区域的必填label文字是否与非必填项的文字对齐,前提是在protab中使用
};

export { ApiSelectProps };
export { UploadProps };
export { DateRangeWithTagProps };
export { RangeSelectProps };
export { selectTableProps };
