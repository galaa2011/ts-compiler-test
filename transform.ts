import * as fs from "fs";
import * as ts from "typescript";

// const content = 'import {f} from "foo"\n' + "export var x = f()";
const content = fs.readFileSync("./templates/Foo.tsx").toString();

// const compilerOptions = { module: ts.ModuleKind.CommonJS };

// function numberTransformer<T extends ts.Node>(): ts.TransformerFactory<T> {
//   return context => {
//     const visit: ts.Visitor = node => {
//       if (ts.isNumericLiteral(node)) {
//         return ts.createStringLiteral(node.text);
//       }
//       if (ts.isDecorator(node)) {
//         debugger;
//         return ts.createStringLiteral("");
//       }
//       return ts.visitEachChild(node, child => visit(child), context);
//     };

//     return node => ts.visitNode(node, visit);
//   };
// }

// const res1 = ts.transpileModule(content, {
//   compilerOptions,
//   moduleName: "myModule2",
//   transformers: {
//     before: [numberTransformer()],
//   },
// });
// console.log(res1.outputText);

// console.log("============");

// const res2 = ts.transpile(
//   content,
//   compilerOptions,
//   /*fileName*/ undefined,
//   /*diagnostics*/ undefined,
//   /*moduleName*/ "myModule1",
// );
// console.log(res2);

// import * as ts from "typescript";

// const source = "let x: string  = 'string'";

// const result = ts.transpileModule(source, {
//   compilerOptions: { module: ts.ModuleKind.CommonJS },
// });

// console.log(JSON.stringify(result));

const source = `
  const two = 2;
  const four = 4;
`;

function numberTransformer<T extends ts.Node>(): ts.TransformerFactory<T> {
  return context => {
    const visit: ts.Visitor = node => {
      if (ts.isNumericLiteral(node)) {
        return ts.createStringLiteral(node.text);
      }
      if (ts.isDecorator(node)) {
        // if (node.getText().indexOf("@log") === 0) {
        //   return ts.createStringLiteral("");
        // }
        return ts.createStringLiteral("");
      }
      // if (ts.isNamedImports(node)) {
      //   debugger;
      // }
      // if (ts.isImportDeclaration(node)) {
      //   debugger;
      // }
      // if (ts.isImportEqualsDeclaration(node)) {
      //   debugger;
      // }
      // if (ts.isImportClause(node)) {
      //   debugger;
      // }
      // console.log(node.getText());
      return ts.visitEachChild(node, child => visit(child), context);
    };

    return node => ts.visitNode(node, visit);
  };
}

const result = ts.transpileModule(content, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2018,
    // lib: [
    //   "dom",
    //   "dom.iterable",
    //   "esnext",
    // ],
    // allowJs: true,
    // skipLibCheck: true,
    // esModuleInterop: true,
    // allowSyntheticDefaultImports: true,
    // strict: true,
    // forceConsistentCasingInFileNames: true,
    // module: ts.ModuleKind.ESNext,
    // moduleResolution: ts.ModuleResolutionKind.NodeJs,
    // resolveJsonModule: true,
    // isolatedModules: true,
    // noEmit: true,
    jsx: ts.JsxEmit.Preserve,
    experimentalDecorators: true,
  },
  transformers: { before: [numberTransformer()] },
});

console.log(result.outputText);
