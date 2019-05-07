import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";

// const filePath = path.resolve(_.first(process.argv.slice(2)));
const filePath = path.resolve("./templates/Foo.tsx");

const program = ts.createProgram([filePath], {});
const checker = program.getTypeChecker();
const source = program.getSourceFile(filePath);
const printer = ts.createPrinter();

const typeAliasToInterfaceTransformer: ts.TransformerFactory<ts.SourceFile> = context => {
  const visit: any = (node: any) => {
    node = ts.visitEachChild(node, visit, context);
    // Remove all export declarations
    // if (ts.isImportDeclaration(node)) {
    //   return null;
    // }
    if (ts.isDecorator(node)) {
      // if (node.getText().indexOf("@log") === 0) {
      //   return ts.createStringLiteral("");
      // }
      return null;
    }
    return node;
  };
  return node => ts.visitNode(node, visit);
};

// // Run source file through our transformer
// const result = ts.transform(source as ts.SourceFile, [typeAliasToInterfaceTransformer]);

// // Create our output folder
// const outputDir = path.resolve(__dirname, "./generated");
// if (!fs.existsSync(outputDir)) {
//   fs.mkdirSync(outputDir);
// }

// debugger;

// Write pretty printed transformed typescript to output directory
// fs.writeFileSync(
//   path.resolve(__dirname, "./generated/models.ts"),
//   printer.printFile(result.transformed[0]),
// );

function format(text: string) {
  const options = getDefaultOptions();

  // Parse the source text
  const sourceFile = ts.createSourceFile("file.ts", text, ts.ScriptTarget.Latest);
  fixupParentReferences(sourceFile);
  debugger;
  const context = new (ts as any).formatting.FormattingContext(sourceFile, 0, options);
  // Get the formatting edits on the input sourcess
  // const edits = (ts as any).formatting.formatDocument(sourceFile, getRuleProvider(options), options);
  const edits = (ts as any).formatting.formatDocument(sourceFile, (ts as any).formatting.getFormatContext(options));

  // Apply the edits on the input code
  return applyEdits(text, edits);

  function getRuleProvider(options: ts.FormatCodeOptions) {
    // Share this between multiple formatters using the same options.
    // This represents the bulk of the space the formatter uses.
    console.log((ts as any).formatting);
    const ruleProvider = new (ts as any).formatting.RulesProvider();
    ruleProvider.ensureUpToDate(options);
    return ruleProvider;
  }

  function applyEdits(text: string, edits: ts.TextChange[]): string {
    // Apply edits in reverse on the existing text
    let result = text;
    for (let i = edits.length - 1; i >= 0; i--) {
      const change: any = edits[i];
      const head = result.slice(0, change.span.start);
      const tail = result.slice(change.span.start + change.span.length);
      result = head + change.newText + tail;
    }
    return result;
  }

  function getDefaultOptions(): ts.FormatCodeSettings {
    return {
      indentSize: 2,
      tabSize: 2,
      newLineCharacter: "\r\n",
      convertTabsToSpaces: true,
      insertSpaceAfterCommaDelimiter: true,
      insertSpaceAfterSemicolonInForStatements: true,
      insertSpaceBeforeAndAfterBinaryOperators: true,
      insertSpaceAfterKeywordsInControlFlowStatements: false,
    } as ts.FormatCodeSettings;
  }

  function fixupParentReferences(sourceFile: ts.SourceFile) {
    let parent: ts.Node = sourceFile;
    function walk(n: ts.Node): void {
      n.parent = parent;

      const saveParent = parent;
      parent = n;
      ts.forEachChild(n, walk);
      parent = saveParent;
    }
    ts.forEachChild(sourceFile, walk);
  }
}

const code = "var a=function(v:number){return 0+1+2+3;\n}";
// const result2 = format(fs.readFileSync(filePath).toString());
const result2 = format(code);
console.log(result2);
fs.writeFileSync(
  path.resolve(__dirname, "./generated/models.ts"),
  result2,
);
