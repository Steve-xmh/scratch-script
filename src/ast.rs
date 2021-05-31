
#[derive(Debug, PartialEq)]
pub enum Constant {
    Null,
    Number(f64),
    Color(u32),
    String(String),
    Boolean(bool),
}

#[derive(Debug, PartialEq)]
pub enum ASTNode {
    Constant(Constant),
    VariableDefinition {
        is_local: bool,
        name: String,
        value: Constant,
    },
    NamespaceDefinition {
        name: String,
        body: Vec<ASTNode>,
    },
    FunctionCall {
        call_chain: Vec<String>,
    },
    FunctionDefinition {
        function_name: String,
    },
}
