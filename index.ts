import * as ts from "typescript";
const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
});
const soureFile = ts.createSourceFile(
  "test.ts",
  "import * as ts from typescript;const x = 42;",
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);

debugger;
console.log(soureFile);
console.log(printer.printFile(soureFile));

const visit = (node: ts.Node) => {
  if (node.kind === ts.SyntaxKind.ImportDeclaration) {
    console.log(node.kind);
  }
  node.forEachChild(visit);
};

visit(soureFile);
