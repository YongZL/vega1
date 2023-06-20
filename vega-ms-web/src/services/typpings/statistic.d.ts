declare namespace StatisticController {
  interface Options {
    category: string;
    createdBy: string;
    deleted: boolean;
    id: number;
    index: number;
    key: string;
    modifiedBy: string;
    timeCreated: number;
    timeModified: string;
    value: string;
  }
  interface ConditionList {
    initialValue?: any;
    backendSearch: boolean;
    cascadeCondition: string;
    cascadeField: string;
    children: string;
    className: string;
    conditionSql: string;
    dictionaryCategory: string;
    field: string;
    formatter: string;
    id: number;
    index: number;
    jdbcType: string;
    keyword: string;
    label: string;
    multiValue: boolean;
    optionKey: string;
    optionUrl: string;
    optionValue: string;
    options: Options[];
    pageSize: string;
    plain: boolean;
    required: boolean;
    system: boolean;
    type: string;
    needPrint: boolean;
  }
  interface ResultListColumns {
    align: 'left' | 'right' | 'center';
    toTemplateId: number;
    align: string;
    columnField: string;
    columnName: string;
    dataIndex: string;
    deleted: boolean;
    dictionaryCategory: string;
    divisor: string;
    ellipsis: boolean;
    formatter: string;
    id: number;
    index: number;
    key: string;
    parentId: number;
    prefix: string;
    resultId: number;
    sorter: boolean;
    suffix: string;
    title: string;
    type: string;
    visible: boolean;
    width: number;
    colorMap: Record<string, any>;
    copyable: boolean;
  }
  interface ResultList {
    baseSql: string;
    columns: ResultListColumns[];
    createdBy: string;
    groupBySql: string;
    id: number;
    index: number;
    name: string;
    orderSql: string;
    templateId: number;
    type: string;
  }
  interface GetAllStatisticRecord {
    children: GetAllStatisticRecord[];
    code: string;
    conditionList: ConditionList[];
    exportCheckboxField: string;
    exportCheckboxParam: string;
    exportCheckboxType: string;
    exportList: string;
    exportTemplatePath: string;
    id: number;
    index: number;
    name: string;
    parentId: number;
    resultList: ResultList[];
    secondMenu: boolean; //是否二级菜单 true-是 false;-否
    exportCode: string;
    printCode: string;
    printType: string;
  }
  interface GetStatisticRecord {
    paging: boolean;
    children: string;
    code: string;
    conditionList: ConditionList[];
    exportCheckboxField: string;
    exportCheckboxParam: string;
    exportCheckboxType: string;
    exportList: string;
    exportTemplatePath: string;
    id: number;
    index: number;
    name: string;
    parentId: number;
    resultList: ResultList[];
  }
  interface PaginationResult {
    isFirst?: boolean;
    isLast?: boolean;
    pageNum?: number;
    pageSize?: number;
    rows?: Record<string, any>[];
    summary?: string;
    totalCount?: number;
    totalPage?: number;
    singleResult?: singleResult;
  }
  interface singleResult {
    company_name: string;
    sumPrice: string;
  }
  interface QueryListRecord {
    id: number;
    paginationResult: PaginationResult;
    singleResult: singleResult[];
    textResult: string[];
  }
  type QueryListData = Pager & {
    params?: Record<string, any>;
    sortList?: [];
    templateId?: number;
  };
}
