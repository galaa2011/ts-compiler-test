import fs from "fs";
import _ from "lodash";
import path from "path";
import ts from "typescript";

// const filePath = path.resolve(_.first(process.argv.slice(2)));
const filePath = path.resolve("./templates/test2.tsx");

const program = ts.createProgram([filePath], {});
const checker = program.getTypeChecker();
const source = program.getSourceFile(filePath);
const printer = ts.createPrinter();

const typeAliasToInterfaceTransformer: ts.TransformerFactory<ts.SourceFile> = context => {
  const visit: any = (node: any) => {
    node = ts.visitEachChild(node, visit, context);
    if (ts.isTypeReferenceNode(node)) {
      const symbol = checker.getSymbolAtLocation(node.typeName);
      const type = checker.getDeclaredTypeOfSymbol(symbol as ts.Symbol);
      const declarations = _.flatMap(checker.getPropertiesOfType(type), property => {
        /*
          Type references declarations may themselves have type references, so we need
          to resolve those literals as well
        */
        return _.map(property.declarations, visit);
      });
      return ts.createTypeLiteralNode(declarations.filter(ts.isTypeElement as any));
    }

    if (ts.isTypeAliasDeclaration(node)) {
      const symbol = checker.getSymbolAtLocation(node.name);
      const type = checker.getDeclaredTypeOfSymbol(symbol as ts.Symbol);
      const declarations = _.flatMap(checker.getPropertiesOfType(type), property => {
        // Resolve type alias to it's literals
        return _.map(property.declarations, visit);
      });

      // Create interface with fully resolved types
      return ts.createInterfaceDeclaration(
        [],
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        node.name.getText(),
        [],
        [],
        declarations.filter(ts.isTypeElement as any),
      );
    }
    // Remove all export declarations
    if (ts.isImportDeclaration(node)) {
      return null;
    }

    return node;
  };

  return node => ts.visitNode(node, visit);
};

// Run source file through our transformer
const result = ts.transform(source as ts.SourceFile, [typeAliasToInterfaceTransformer]);

// Create our output folder
const outputDir = path.resolve(__dirname, "./generated");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Write pretty printed transformed typescript to output directory
fs.writeFileSync(
  path.resolve(__dirname, "./generated/models.ts"),
  printer.printFile(_.first(result.transformed) as ts.SourceFile),
);
