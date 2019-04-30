export function Component(obj: object) {
  return (target: any) => {
    target.isTest = true;
    console.log("design: ", obj);
  };
}

export function Prop(obj: object) {
  return (target: any, name: string) => {
    console.log("prop: ", obj);
  };
}

export function log(target: any) {
  console.log(target.name);
}

export function test(target: any) {
  return target;
}
