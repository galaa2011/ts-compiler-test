import React from "react";
import { Component, log, Prop } from "./decorators";

const { test } = require("./decorators");

/**
 * Foo 测试组件
 *
 * @export FooFunction
 * @param {*} props
 * @returns
 */
export function FooFunction(props: any) {
  return (
    <div>
      {props.labela}: <input type="text" />
      {props.labelb}: <button>{props.text}</button>
    </div>
  );
}

class IProps {
  @Prop({
    name: "Foo2",
    components: {
      a: { name: "a", type: "input", design: { label: "输入框" } },
      b: { name: "b", type: "button", design: { label: "按钮", text: "b" } },
    },
  })
  public name!: number;

  @Prop({
    label: "文本内容",
    dataType: String,
    inputType: 2,
    description: "文本组件的展示内容",

  })
  public labela!: string;

  public labelb!: string;

  public text!: string;
}

@Component({
  name: "Foo",
  version: "1.0.0",
})
@log
@test
export default class FooClass extends React.Component<IProps> {
  public render() {
    debugger;
    return <FooFunction {...this.props}></FooFunction>;
  }
}
