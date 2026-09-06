const inner = require(
  process.env.NC_INNER_BABEL_TRANSFORMER ||
    require.resolve("@expo/metro-config/babel-transformer", { paths: [__dirname] }),
);

function shortName(filename) {
  const normalized = String(filename || "unknown").replace(/\\/g, "/");
  const fromNm = normalized.split("/node_modules/").pop();
  if (fromNm && fromNm !== normalized) return fromNm;
  const fromApp = normalized.split("/packages/mobile/").pop();
  return fromApp || normalized;
}

function hasEsm(body) {
  return body.some((node) => {
    const t = node?.type;
    return (
      t === "ImportDeclaration" ||
      t === "ExportNamedDeclaration" ||
      t === "ExportDefaultDeclaration" ||
      t === "ExportAllDeclaration"
    );
  });
}

function wrapProgram(program, label) {
  const body = program.body;
  if (!body?.length || hasEsm(body)) return;
  program.body = [
    {
      type: "TryStatement",
      block: { type: "BlockStatement", body, directives: [] },
      handler: {
        type: "CatchClause",
        param: { type: "Identifier", name: "_moduleEvalError" },
        body: {
          type: "BlockStatement",
          body: [
            {
              type: "IfStatement",
              test: {
                type: "LogicalExpression",
                operator: "&&",
                left: { type: "Identifier", name: "_moduleEvalError" },
                right: {
                  type: "BinaryExpression",
                  operator: "===",
                  left: {
                    type: "UnaryExpression",
                    operator: "typeof",
                    prefix: true,
                    argument: { type: "Identifier", name: "_moduleEvalError" },
                  },
                  right: { type: "StringLiteral", value: "object" },
                },
              },
              consequent: {
                type: "ExpressionStatement",
                expression: {
                  type: "AssignmentExpression",
                  operator: "=",
                  left: {
                    type: "MemberExpression",
                    object: { type: "Identifier", name: "_moduleEvalError" },
                    property: { type: "Identifier", name: "message" },
                    computed: false,
                  },
                  right: {
                    type: "BinaryExpression",
                    operator: "+",
                    left: {
                      type: "CallExpression",
                      callee: { type: "Identifier", name: "String" },
                      arguments: [
                        {
                          type: "LogicalExpression",
                          operator: "||",
                          left: {
                            type: "MemberExpression",
                            object: { type: "Identifier", name: "_moduleEvalError" },
                            property: { type: "Identifier", name: "message" },
                            computed: false,
                          },
                          right: { type: "Identifier", name: "_moduleEvalError" },
                        },
                      ],
                    },
                    right: { type: "StringLiteral", value: ` [${label}]` },
                  },
                },
              },
            },
            {
              type: "ThrowStatement",
              argument: { type: "Identifier", name: "_moduleEvalError" },
            },
          ],
        },
      },
      finalizer: null,
    },
  ];
}

function transform(args) {
  const result = inner.transform(args);
  if (args.options?.dev || !result?.ast?.program) {
    return result;
  }
  wrapProgram(result.ast.program, shortName(args.filename));
  return result;
}

module.exports = { transform };
