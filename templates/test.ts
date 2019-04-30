function Design(obj: object) {
  return (target: any) => {
    target.isTest = true;
    console.log("design: ", obj);
  };
}

/**
 * 哈哈哈哈
 *
 * @param {string} msg
 * @returns
 */
function log(msg: string) {
  return (target: Test, name: string, descriptor: any) => {
    const oldValue = descriptor.value;
    descriptor.value = function() {
      console.log("log: ", msg, arguments);
      return oldValue.apply(this, arguments);
    };
    // return descriptor;
  };
}

/**
 * @test {sina: 666}
 *
 * @class Test
 */
@Design({ 姓名: "赵鹏" })
class Test {
  public static isTest: boolean;
  @log("hello")
  public test() {
    console.log("Test.test");
  }
}

const t = new Test();
t.test();
