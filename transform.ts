import * as ts from "typescript";

const content = 'import {f} from "foo"\n' + "export var x = f()";

const compilerOptions = { module: ts.ModuleKind.CommonJS };

const res1 = ts.transpileModule(content, {
  compilerOptions,
  moduleName: "myModule2",
});
console.log(res1.outputText);

console.log("============");

const res2 = ts.transpile(
  content,
  compilerOptions,
  /*fileName*/ undefined,
  /*diagnostics*/ undefined,
  /*moduleName*/ "myModule1",
);
console.log(res2);

// import * as ts from "typescript";

// const source = "let x: string  = 'string'";

// const result = ts.transpileModule(source, {
//   compilerOptions: { module: ts.ModuleKind.CommonJS },
// });

// console.log(JSON.stringify(result));
