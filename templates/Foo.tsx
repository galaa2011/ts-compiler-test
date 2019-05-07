import React from "react";
import { log, test } from "./decorators";

@log
@test
class Foo extends React.Component {
  public render() {
    return <div></div>;
  }
}
