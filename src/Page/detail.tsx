import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  type ProFormColumnsType,
  type PageContainerProps,
} from "@ant-design/pro-components";
import { BetaSchemaForm, PageContainer } from "@ant-design/pro-components";
import { Modal, Button, message } from "antd";
import { type ModalProps } from "antd";

type DefaultProps<T> = {
  title?: string;
  handlerOK?: (e: any) => Promise<void>;
  handlerCancel: (e: any) => void;
  modeProps?: T;
  formProps?: any;
  schema: ProFormColumnsType<any>;
  content?: (e: ProFormColumnsType<any>) => JSX.Element | React.ReactNode;
  onHideFather?: (e: any) => void | any;
};

type DefaultFormProps = Pick<
  DefaultProps<any>,
  "schema" | "handlerOK" | "handlerCancel" | "formProps" | "title"
>;

const FormView: React.FC<DefaultFormProps> = ({
  schema,
  handlerOK,
  formProps,
  handlerCancel,
}) => {
  const formRef = useRef();
  return (
    <>
      <BetaSchemaForm<any>
        formRef={formRef}
        shouldUpdate={false}
        {...formProps}
        onFinish={handlerOK}
        submitter={{
          render: (_: any, doms: React.ReactNode) => {
            return (
              <div className="w-full flex justify-center gap-4">
                <Button onClick={handlerCancel}>取消</Button>
                {doms}
              </div>
            );
          },
        }}
        columns={schema}
      />
    </>
  );
};

const ModalMode: React.FC<DefaultProps<ModalProps>> = ({
  modeProps,
  content,
  schema,
  handlerCancel,
  handlerOK,
  formProps,
  title,
}) => {
  return (
    <Modal
      open={true}
      {...modeProps}
      footer={null}
      onCancel={handlerCancel}
      title={title}
    >
      {content ? (
        content(schema)
      ) : (
        <FormView
          schema={schema}
          handlerOK={handlerOK}
          handlerCancel={handlerCancel}
          formProps={formProps}
        />
      )}
    </Modal>
  );
};

const PageMode: React.FC<DefaultProps<PageContainerProps>> = ({
  modeProps,
  content,
  handlerOK,
  schema,
  formProps,
  title,
  handlerCancel,
}) => {
  return (
    <PageContainer
      className="bg-bg w-full h-full z-20 "
      {...modeProps}
      header={{
        title,
      }}
    >
      {content ? (
        content(schema)
      ) : (
        <FormView
          schema={schema}
          handlerOK={handlerOK}
          handlerCancel={handlerCancel}
          formProps={formProps}
        />
      )}
    </PageContainer>
  );
};

// const DrawerMode: React.FC<DefaultProps<any>> = () => {
//   return <></>;
// };

interface DetailProps {
  ref: any;
  custRender?: (e: ProFormColumnsType<any>) => JSX.Element | React.ReactNode;
  ViewModeProps?: ModalProps | PageContainerProps;
  formProps?: any;
  onSuccess?: () => void;
  onHideFather?: (e: any) => void | any;
}

/* main */
const Detail: React.FC<DetailProps> = forwardRef(
  ({ ViewModeProps, custRender, formProps, onHideFather, onSuccess }, ref) => {
    const [showMode, setShowMode] = useState("");
    const [baseOptions, setBaseOptions] = useState<DefaultFormProps>();

    const showWithData = (
      params:
        | "hide"
        | {
            data: any;
            mode: "modal" | "page";
            title?: string;
            handlerOK: (e: any) => Promise<void>;
            handlerCancel: (e: any) => void;
          }
    ) => {
      if (params === "hide") {
        setShowMode("hide");
        onHideFather && onHideFather(false);
      } else {
        if (params.mode === "page") {
          onHideFather && onHideFather(true);
        }
        setShowMode(params.mode);
        setBaseOptions({
          schema: params.data,
          title: params.title || "详情",
          handlerOK: async (e) => {
            await params.handlerOK(e);
            showWithData("hide");
            message.success("操作成功！");
            onSuccess && onSuccess();
          },
          handlerCancel: () => showWithData("hide"),
        });
      }
    };

    useImperativeHandle(ref, () => ({
      show: showWithData,
      hide: () => showWithData("hide"),
    }));

    return (
      <>
        {showMode === "modal" && (
          <ModalMode
            modeProps={ViewModeProps as ModalProps}
            formProps={formProps}
            content={custRender}
            {...baseOptions}
          />
        )}
        {showMode === "page" && (
          <PageMode
            modeProps={ViewModeProps as PageContainerProps}
            formProps={formProps}
            content={custRender}
            onHideFather={onHideFather}
            {...baseOptions}
          />
        )}
      </>
    );
  }
);

export default Detail;
