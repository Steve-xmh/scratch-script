use chumsky::prelude::*;

#[derive(Debug, Clone, PartialEq)]
pub enum Token {
    NumberInterger(i64),
    NumberFloat(f64),
    String(String),
    Color(u32),
}

fn number_parser() -> impl Parser<char, Token, Error = Simple<char>> {
    fn positive_number_parser() -> impl Parser<char, Token, Error = Simple<char>> {
        choice((
            just("0x")
                .ignored()
                .then(text::digits(16))
                .map(|x: ((), String)| {
                    Token::NumberInterger(i64::from_str_radix(x.1.as_str(), 16).unwrap())
                })
                .padded(),
            just("0b")
                .ignored()
                .then(text::digits(2))
                .map(|x: ((), String)| {
                    Token::NumberInterger(i64::from_str_radix(x.1.as_str(), 2).unwrap())
                })
                .padded(),
            just("0")
                .ignored()
                .then(text::digits(8))
                .map(|x: ((), String)| {
                    Token::NumberInterger(i64::from_str_radix(x.1.as_str(), 8).unwrap())
                })
                .padded(),
            text::digits(10)
                .then(just("."))
                .then(text::digits(10))
                .map(|x: ((String, &str), String)| {
                    Token::NumberFloat(format!("{}.{}", x.0 .0, x.1).parse().unwrap())
                })
                .padded(),
            text::digits(10)
                .map(|x: String| Token::NumberInterger(x.parse().unwrap()))
                .padded(),
        ))
    }
    choice((
        just("-")
            .then(positive_number_parser())
            .map(|x: (&str, Token)| match x.1 {
                Token::NumberInterger(x) => Token::NumberInterger(-x),
                Token::NumberFloat(x) => Token::NumberFloat(-x),
                _ => unreachable!(),
            })
            .padded(),
        positive_number_parser(),
    ))
    .labelled("number")
}

#[test]
fn test_number_parser() {
    let parser = number_parser().then_ignore(end());
    assert_eq!(parser.parse("1234"), Ok(Token::NumberInterger(1234)));
    assert_eq!(parser.parse("-1234"), Ok(Token::NumberInterger(-1234)));
    assert_eq!(parser.parse("1234.5678"), Ok(Token::NumberFloat(1234.5678)));
    assert_eq!(
        parser.parse("-1234.5678"),
        Ok(Token::NumberFloat(-1234.5678))
    );
    assert_eq!(parser.parse("0x1234"), Ok(Token::NumberInterger(0x1234)));
    assert_eq!(parser.parse("0771"), Ok(Token::NumberInterger(0o771)));
    assert_eq!(parser.parse("0b1010"), Ok(Token::NumberInterger(0b1010)));
    let (result, errs) = dbg!(parser.parse_recovery_verbose("0x1234.5678"));
    if result.is_none() {
        for err in errs {
            println!("{}", err);
        }
    }
}
