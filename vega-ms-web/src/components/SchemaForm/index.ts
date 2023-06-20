import type { FormSchemaProps, ProFormValueType, ProFormColumns } from './typings';
import type { ApiSelectProps } from './components/ApiSelect/typings';
// import type { UploadProps } from './components/BasicUpload/typings';
import type { DateRangeWithTagProps } from './components/DateRangeWithTag/typings';
import type { RangeSelectProps } from './components/RangeSelect/typings';
import type { TagSelectProps } from './components/TagSelect/typings';
import type { SelectTableProps } from './components/SelectTable/typings';

import SchemaForm from './components';
import ApiSelect from './components/ApiSelect';
// import BasicUpload from './components/BasicUpload';
import DateRangeWithTag from './components/DateRangeWithTag';
import RangeSelect from './components/RangeSelect';
import TagSelect from './components/TagSelect';
import SelectTable from './components/SelectTable';

export type {
	ApiSelectProps,
	FormSchemaProps,
	ProFormValueType,
	ProFormColumns,
	// UploadProps,
	DateRangeWithTagProps,
	RangeSelectProps,
	TagSelectProps,
	SelectTableProps,
};

export {
	ApiSelect,
	// BasicUpload,
	DateRangeWithTag,
	RangeSelect,
	TagSelect,
	SelectTable,
};

export default SchemaForm;
