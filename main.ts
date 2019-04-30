import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";

const CLASS_DECORATORS = ["Component"];
const PROP_DECORATORS = ["Prop"];

interface IDescription {
  [key: string]: any;
  props?: any;
}

interface IExpression extends ts.Expression {
  text: string;
}

// 最终输出
let output: IDescription = {};

/**
 * 生成描述
 *
 * @param {string[]} fileNames
 * @param {ts.CompilerOptions} options
 * @returns {void}
 */
function generateDescription(fileNames: string[], options: ts.CompilerOptions): void {
  const program = ts.createProgram(fileNames, options);

  // 获取检查器，我们将使用它来查找有关类的更多信息 (这句不加，后面的node.getText()会报错...)
  const checker = program.getTypeChecker();

  output = {};

  for (const sourceFile of program.getSourceFiles()) {
    // 排除`.d.ts`的声明文件
    if (!sourceFile.isDeclarationFile) {
      ts.forEachChild(sourceFile, visit);
    }
  }

  fs.writeFileSync("description.json", JSON.stringify(output, null, 2), { encoding: "utf8" });

  /**
   * 处理sourceFile内容
   *
   * @param {ts.Node} node
   */
  function visit(node: ts.Node) {
    if (!isNodeExported(node)) {
      console.log("isNodeExported: ------\n", node.getText());
      return;
    }
    if (ts.isImportDeclaration(node)) {
      console.log("import: ------\n", node.getText());
      if (node.importClause && node.importClause.namedBindings) {
        const namedBindings = node.importClause.namedBindings as ts.NamedImports;
        namedBindings.elements && namedBindings.elements.forEach(el => {
          if (el.propertyName) {
            console.log(el.propertyName.text);
          }
        });
      }
    }
    if (ts.isClassDeclaration(node) && node.name) {
      // const symbol = checker.getSymbolAtLocation(node.name);
      console.log("class: ------\n", node.getText());
      if (node.members) {
        node.members.forEach(m => {
          const prop = serializeMember(m, checker);
        });
      }
      node.decorators && node.decorators.map(d => {
        const decoratorName = getDecoratorName(d);
        // console.log(decoratorName);
        if (CLASS_DECORATORS.indexOf(decoratorName) !== -1) {
          const expression = d.expression as ts.CallExpression;
          console.log(expression.arguments[0].getText());
          new Function(`prop = ${expression.arguments[0].getText()}`);
          const arg = expression.arguments[0];
          const type = checker.getTypeAtLocation(arg);
          const props: any = {};
          type.getProperties().forEach(symbol => {
            const type2 = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
            checker.typeToString(type2);
            console.log(checker.typeToString(type2));
            const valueDeclaration = symbol.valueDeclaration as ts.PropertyDeclaration;
            if (valueDeclaration.initializer) {
              debugger;
              props[symbol.name] = (valueDeclaration.initializer as IExpression).text;
            }
          });
          output = { ...output, ...props };
        }
      });
    }
  }
}

/**
 * 处理sourceFile内容
 *
 * @param {ts.Node} node
 */
/* function visit(node: ts.Node) {
  if (!isNodeExported(node)) {
    console.log("isNodeExported: ------\n", node.getText());
    return;
  }
  if (ts.isImportDeclaration(node)) {
    console.log("import: ------\n", node.getText());
    if (node.importClause && node.importClause.namedBindings) {
      const namedBindings = node.importClause.namedBindings as ts.NamedImports;
      namedBindings.elements && namedBindings.elements.forEach(el => {
        if (el.propertyName) {
          console.log(el.propertyName.text);
        }
      });
    }
  }
  if (ts.isClassDeclaration(node) && node.name) {
    debugger;
    console.log("class: ------\n", node.getText());
    node.decorators && node.decorators.map(d => {
      const decoratorName = getDecoratorName(d);
      // console.log(decoratorName);
      if (CLASS_DECORATORS.indexOf(decoratorName) !== -1) {
        const expression = d.expression as ts.CallExpression;
        console.log(expression.arguments[0].getText());
        output = { ...JSON.parse(expression.arguments[0].getText()) };
      }
    });
  }
} */

function isNodeExported(node: ts.Node): boolean {
  return (
    (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0 ||
    (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
  );
}

/**
 * 根据decorator获取对应的name
 *
 * @param {ts.Decorator} decorator
 * @returns {string}
 */
function getDecoratorName(decorator: ts.Decorator): string {
  let decoratorName: string;
  if (ts.isIdentifier(decorator.expression)) {
    // 无参数情况
    decoratorName = decorator.expression.text;
  } else {
    const expression = decorator.expression as ts.CallExpression;
    decoratorName = (expression.expression as ts.Identifier).text;
  }
  return decoratorName;
}

function serializeMember(member: ts.ClassElement, checker: ts.TypeChecker) {
  if (member.decorators) {
    let prop: any = {};
    const symbol2 = checker.getSymbolAtLocation((member as ts.PropertyDeclaration).name);
    if (symbol2) {
      const type3 = checker.getTypeOfSymbolAtLocation(symbol2, symbol2.valueDeclaration);
      console.log(checker.typeToString(type3));
      prop = {
        name: symbol2.name,
        returnType: checker.typeToString(type3),
      };
    }
    member.decorators.forEach(d => {
      const decoratorName = getDecoratorName(d);
      if (PROP_DECORATORS.indexOf(decoratorName) !== -1) {
        const expression = d.expression as ts.CallExpression;
        const arg = expression.arguments[0];
        const description: IDescription = {};
        eval(`description = ${arg.getText()}`);
        const type = checker.getTypeAtLocation(arg);
        // checker.typeToString(type);
        // const props: any = {};
        if (!output.props) { output.props = {}; }
        output.props[prop.name] = {
          ...prop,
          description,
        };
      }
    });
  }
}

// 测试执行
generateDescription([path.resolve(__dirname, "./templates/test2.tsx")], {
  target: ts.ScriptTarget.Latest,
  module: ts.ModuleKind.CommonJS,
});
