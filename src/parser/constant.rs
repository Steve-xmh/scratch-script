use nom::{self, bytes::complete::take_while, combinator::map_res, IResult, Slice};

use crate::ast::Constant;

fn is_hex_digit(c: char) -> bool {
    c.is_digit(16)
}

fn from_hex(input: &str) -> Result<u64, std::num::ParseIntError> {
    u64::from_str_radix(input, 16)
}

fn from_hex_constant(input: u64) -> Result<Constant, ()> {
    Ok(Constant::Number(input as f64))
}

pub fn parse_hex(input: &str) -> IResult<&str, Constant> {
    map_res(
        map_res(take_while(is_hex_digit), from_hex),
        from_hex_constant,
    )(input)
}

pub fn parse_constant(input: &str) -> IResult<&str, Constant> {
    parse_hex(input.slice(2..))
}

#[test]
fn test_hex_constant() {
    let (_, c) = parse_constant("0x123456").unwrap();
    assert_eq!(c, Constant::Number(0x123456 as f64));
}
