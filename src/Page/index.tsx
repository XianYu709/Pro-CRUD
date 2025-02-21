import {
  type ProTableProps,
  type PageContainerProps,
  type ProColumns,
} from "@ant-design/pro-components";
import { PageContainer, ProTable } from "@ant-design/pro-components";
import { TabPaneProps, Popconfirm } from "antd";
import { Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Detail from "./detail";
import { useState, useRef } from "react";
import { type ModalProps } from "antd";
export interface PageProps<T> {
  title?: string;
  defaultActive?: string;
  view?: {
    viewMode: "modal" | "page";
    defaultAction: {
      add?: (e: any) => void;
      edit?: (e: any) => void;
      delete?: (e: any) => void;
      view?: (e: any) => void;
    };
    toolBarCustomRender?: (
        actions: any,
        defaultBar: React.ReactNode[]
    ) => React.ReactNode[];
  };
  tabList?: TabPaneProps[];
  tableProps: ProTableProps<T, any> | Record<string, ProTableProps<T, any>>;
  pageProps: PageContainerProps;
}

/* main */
export default function Page<T>(props: PageProps<T>) {
  const [activeKey, setActiveKey] = useState(props.pageProps.tabActiveKey);
  const tableRef = useRef<any>();

  const onTabChange = (key: string) => {
    setActiveKey(key);
  };

  const detailRef = useRef<any>();
  let rowColumns: any;

  const removeDefault = (columns: any) => {
    console.log(columns);

    const newObj = JSON.parse(JSON.stringify(columns));
    newObj.forEach((col: any) => {
      col.initialValue = null;
    });
    return newObj;
  };

  const mergeDataAndColumns = (row: any, columns: ProColumns<T>[]) => {
    const newObj = JSON.parse(JSON.stringify(columns));
    newObj.forEach((col: any) => {
      if (Object.keys(row).includes(col.dataIndex)) {
        if (col.valueType === "select") {
          col.initialValue = row[col.dataIndex];
        } else {
          col.initialValue = row[col.dataIndex];
        }
      }
    });
    return newObj;
  };

  const defaultActionHandler = async (row: any, method: string) => {
    switch (method) {
      case "add":
        detailRef.current?.show({
          title: "新增",
          data: removeDefault(rowColumns),
          mode: props?.view?.viewMode,
          handlerOK: props?.view?.defaultAction.add,
        });
        break;
      case "edit":
        detailRef.current?.show({
          title: "编辑",
          data: mergeDataAndColumns(row, rowColumns),
          mode: props?.view?.viewMode,
          handlerOK: props?.view?.defaultAction.edit,
        });
        break;
      case "delete":
        props?.view?.defaultAction?.delete?.(row);
        message.success("删除成功");
       await tableRef.current?.reloadAndRest();
        break;
      case "view":
        break;

      default:
        break;
    }
  };

  const getTableProps = (key: string): ProTableProps<T, any> | undefined => {
    console.log("getTableProps", props.tableProps.columns);

    let rowProps: ProTableProps<T, any>;
    rowColumns ??= props.tableProps.columns;
    if (props.pageProps?.tabList && props.pageProps.tabList.length > 0) {
      rowProps = props.tableProps[key as keyof typeof props.tableProps];
    } else {
      rowProps = props.tableProps;
    }

    const shouldAddOptionsCol =
        Object.keys(props?.view?.defaultAction || {}).length !== 0;

    if (
        shouldAddOptionsCol &&
        !rowProps?.columns?.some((col) => col.valueType === "option")
    ) {
      const optionsCol = {
        title: "操作",
        valueType: "option",
        dataIndex: props.tableProps.rowKey || "id",
        render: (_, row) => [
          props?.view?.defaultAction?.edit && (
              <a
                  key={`${activeKey}-${row}-edit`}
                  onClick={() => defaultActionHandler(row, "edit")}
              >
                修改
              </a>
          ),
          props?.view?.defaultAction?.view && (
              <a
                  key={`${activeKey}-${row}-view`}
                  onClick={() => defaultActionHandler(row, "view")}
              >
                查看
              </a>
          ),
          props?.view?.defaultAction?.delete && (
              <Popconfirm
                  key={`${activeKey}-${row}-delete`}
                  title="确定删除吗?"
                  onConfirm={() => defaultActionHandler(row, "delete")}
                  okText="是"
                  cancelText="否"
              >
                <a key={`${activeKey}-${row}-delete`}>删除</a>
              </Popconfirm>
          ),
        ],
      } as ProColumns;
      rowProps?.columns?.push(optionsCol);
    }
    return rowProps;
  };

  const otherModalProps: ModalProps = {};

  const [showFather, setShowFather] = useState<any>(true);
  const handlerHideFather = (data: any) => {
    setShowFather(!data);
  };

  /* 默认toolBar */
  const defaultToolBar = [
    <Button
        key={`new-button-${activeKey}`}
        type="primary"
        onClick={() => defaultActionHandler(null, "add")}
    >
      <PlusOutlined />
      新建
    </Button>,
  ];

  return (
      <div>
        <PageContainer
            style={{ display: showFather ? "block" : "none" }}
            fixedHeader
            header={{ title: props.title }}
            {...props.pageProps}
            tabActiveKey={activeKey}
            onTabChange={onTabChange}
        >
          <ProTable
              actionRef={tableRef}
              key={activeKey || props.title}
              dateFormatter="string"
              headerTitle="默认标题"
              toolBarRender={(actions) => {
                return props?.view?.toolBarCustomRender
                    ? props?.view?.toolBarCustomRender(actions, defaultToolBar)
                    : defaultToolBar;
              }}
              {...getTableProps(activeKey!)}
          />
        </PageContainer>
        <Detail
            ref={detailRef}
            ViewModeProps={otherModalProps}
            onHideFather={handlerHideFather}
            onSuccess={() => {
              tableRef.current.reloadAndRest();
            }}
        ></Detail>
      </div>
  );
}
