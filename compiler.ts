import * as ts from "typescript";

const program = ts.createProgram(["/study/ts-compiler-test/templates/test.ts"], {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.Latest,
  types: [],
});

const checker = program.getTypeChecker();

const visit = (node: ts.Node) => {
  node.decorators && node.decorators.forEach((d) => {
    console.log(d.expression.getText());
    const expression = d.expression as ts.CallExpression;
    expression.arguments.map((arg) => {
      debugger;
    });
  });
  node.forEachChild(visit);
};

debugger;
for (const sourceFile of program.getSourceFiles()) {
  if (!sourceFile.isDeclarationFile) {
    console.log("文件: ", sourceFile.fileName);
    visit(sourceFile);
  }
}
