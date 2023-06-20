import "./App.css";
import "antd/dist/reset.css";
import { Button, Form, Input, Select } from "antd";
import L from "./L_Icon.png";
import location from "./location.png";
import React, { useState } from "react";
import { getCurrentDate } from "./utils/index";

type data = {
  id: number;
  name_title: string;
  date: string;
  link?: string;
  currentLocation?: string;
  finishImg?: string;
  content?: string;
};
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const App = () => {
  const [contentValue, setContentValue] = useState<string>("");
  const [contentArray, setContentArray] = useState<data[]>([
    {
      id: 1,
      name_title: "居民 xxx 已评价",
      date: "2023-4-24 15:24",
      link: "www.baidu.com",
    },
    {
      id: 2,
      name_title: "保洁 王红 已完成",
      date: "2023-4-24 15:24",
      currentLocation: "1231.231.3151",
      content: "这是一条完成情况的说明",
      finishImg:
        "https://img1.baidu.com/it/u=413643897,2296924942&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=500",
    },
    {
      id: 3,
      name_title: "重新打开",
      date: "2023-4-24 15:24",
      content: "管家 小白 已经转交保洁 王红",
    },
    {
      id: 4,
      name_title: "保洁 王红 添加了备注",
      date: "2023-4-24 15:24",
      content: "这是一条备注信息",
    },
    {
      id: 5,
      name_title: "已接单",
      date: "2023-4-24 15:24",
      content: "保洁王红已接单",
    },
    {
      id: 6,
      name_title: "已转交",
      date: "2023-4-24 15:24",
      content: "管家 小白 已经转交保洁 王红",
    },
    {
      id: 7,
      name_title: "我 添加了备注",
      date: "2023-4-24 15:24",
      content: "这是一条用户订单需求描述的备注",
    },
    {
      id: 8,
      name_title: "已创建",
      date: "2023-4-24 15:24",
      content: "您的工单已创建，请您耐心等待",
    },
  ]);
  const [form] = Form.useForm();

  const dropSelect = () => {
    return (
      <Select
        onClick={(e) => e.stopPropagation()}
        options={[
          { value: "$", label: "$" },
          { value: "¥", label: "¥" },
        ]}
      />
    );
  };

  const AddContent = () => {
    let num: number = 0;
    setContentArray([
      ...contentArray,
      {
        id: num++,
        name_title: contentValue,
        date: getCurrentDate(),
        content: contentValue,
      },
    ]);
    setContentValue("");
  };

  const inputButton = () => {
    return (
      <Button
        type="primary"
        disabled={!contentValue}
        onClick={() => AddContent()}
      >
        POST
      </Button>
    );
  };

  const onFinish = (value: any) => {
    console.log("valuesss", value);
  };

  const rules = (text: string) => {
    return [{ required: true, message: text }];
  };

  return (
    <div className="App">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
        }}
      >
        <Input
          style={{ width: "300px" }}
          onChange={(e) => setContentValue(e.target.value)}
          placeholder="Add a Comment"
          value={contentValue}
          prefix={<img src={L}></img>}
          suffix={inputButton()}
        />
        <br />
      </div>

      <Form
        {...layout}
        form={form}
        name="control-hooks"
        onFinish={onFinish}
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          name="Donation"
          label="Donation"
          rules={rules("Please input your Donation!")}
        >
          <Input className="rs-input" suffix={dropSelect()} />
        </Form.Item>
        <Form.Item
          name="Website"
          label="Website"
          rules={rules("Please input your Website!")}
        >
          <Input className="rs-input" />
        </Form.Item>
      </Form>

      <div className="rs-col rs-col-xs-8">
        <ul className="rs-timeline rs-timeline-align-left rs-timeline-with-time">
          {(contentArray || []).map((e: data) => {
            return (
              <li key={e.id} className="rs-timeline-item rs-timeline-item-last">
                <span className="rs-timeline-item-tail"></span>
                <span className="rs-timeline-item-dot"></span>
                <div className="rs-title">
                  <span className="rs-timeline-item-time">{e.name_title}</span>
                  <span className="rs-timeline-item-time rs-time">
                    {e.date}
                  </span>
                </div>
                <br />
                {e.link ? (
                  <>
                    <a href={e.link}>查看评价</a>
                    <br />
                    <br />
                  </>
                ) : e.currentLocation ? (
                  <>
                    <div className="rs-timeline-item-content rs-content-bg">
                      <div style={{ marginLeft: "10px" }}>
                        <img src={location}></img>航汇大厦
                        <br />
                        <br />
                        <div>
                          <img
                            width={"50px"}
                            height={"50px"}
                            src={e.finishImg}
                          />
                        </div>
                        <br />
                        <div className="rs-text">{e.content}</div>
                      </div>
                    </div>
                    <br />
                  </>
                ) : (
                  <div className="rs-timeline-item-content rs-text'">
                    {e.content}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default App;
