var opcodes = {
    ADC: {
        immediate: 0x69,
        zeroPage: 0x65,
        zeroPageX: 0x75,
        absolute: 0x6d,
        absoluteX: 0x7d,
        absoluteY: 0x79,
        zeroPageIndirectX: 0x61,
        zeroPageYIndirect: 0x71
    },
    AND: {
        immediate: 0x29,
        zeroPage: 0x25,
        zeroPageX: 0x35,
        absolute: 0x2d,
        absoluteX: 0x3d,
        absoluteY: 0x39,
        zeroPageIndirectX: 0x21,
        zeroPageYIndirect: 0x31
    },
    ASL: {
        immediate: 0x0a,
        zeroPage: 0x06,
        zeroPageX: 0x16,
        absolute: 0x0e,
        absoluteX: 0x1e
    },
    BIT: {
        zeroPage: 0x24,
        absolute: 0x2c
    },
    CLC: {
        implied: 0x18
    },
    CLD: {
        implied: 0xd8
   },
    CLI: {
        implied: 0x58
    },
    CLV: {
        implied: 0xb8
    },
    BPL: {
        relative: 0x10
    },
    BMI: {
        relative: 0x30
    },
    BVC: {
        relative: 0x50
    },
    BVS: {
        relative: 0x70
    },
    BCC: {
        relative: 0x90
    },
    BCS: {
        relative: 0xB0
    },
    BNE: {
        relative: 0xD0
    },
    BEQ: {
        relative: 0xF0
    },
    DEC: {
        zeroPage: 0xc6,
        zeroPageX: 0xd6,
        absolute: 0xce,
        absoluteX: 0xde
    },
    DEX: {
        implied: 0xca
    },
    DEY: {
        implied: 0x88
    },
    EOR: {
        immediate: 0x49,
        zeroPage: 0x45,
        zeroPageX: 0x55,
        absolute: 0x4d,
        absoluteX: 0x5d,
        absoluteY: 0x59,
        zeroPageIndirectX: 0x41,
        zeroPageYIndirect: 0x51
    },
    INC: {
       zeroPage: 0xe6,
        zeroPageX: 0xf6,
        absolute: 0xee,
        absoluteX: 0xfe
    },
    INX: {
        implied: 0xe8
   },
    INY: {
        implied: 0xc8
    },
    JMP: {
        absolute: 0x4c,
        indirect: 0x6c
    },
    JSR: {
        absolute: 0x20
    },
    LDA: {
        immediate: 0xa9,
        zeroPage: 0xa5,
        zeroPageX: 0xb5,
        absolute: 0xad,
        absoluteX: 0xbd,
        absoluteY: 0xb9,
        zeroPageIndirectX: 0xa1,
        zeroPageYIndirect: 0xb1
    },
    LDX: {
        immediate: 0xa2,
        zeroPage: 0xa6,
        zeroPageY: 0xb6,
        absolute: 0xae,
        absoluteY: 0xbe,
    },
    LDY: {
        immediate: 0xa0,
        zeroPage: 0xa4,
        zeroPageX: 0xb4,
        absolute: 0xac,
        absoluteX: 0xbc,
    },
    LSR: {
        accumulator: 0x4a,
        zeroPage: 0x46,
        zeroPageX: 0x56,
        absolute: 0x4e,
        absoluteX: 0x5e,
    },
    NOP: {
        implied: 0xea
    },
    ORA: {
        immediate: 0x09,
        zeroPage: 0x05,
        zeroPageX: 0x15,
        absolute: 0x0d,
        absoluteX: 0x1d,
        absoluteY: 0x19,
        zeroPageIndirectX: 0x01,
        zeroPageYIndirect: 0x11
    },
    PHA: {
        implied: 0x48
    },
    PLA: {
        implied: 0x68
    },
    PHP: {
        implied: 0x08
    },
    PLP: {
        implied: 0x28
    },
    ROL: {
        accumulator: 0x2a,
        zeroPage: 0x26,
        zeroPageX: 0x36,
        absolute: 0x2e,
        absoluteX: 0x3e
    },
    ROR: {
        accumulator: 0x6a,
        zeroPage: 0x66,
        zeroPageX: 0x76,
        absolute: 0x6e,
        absoluteX: 0x7e
    },
    RTI: {
        implied: 0x40
    },
    RTS: {
        implied: 0x60
    },
    SBC: {
        immediate: 0xe9,
        zeroPage: 0xe5,
        zeroPageX: 0xf5,
        absolute: 0xed,
        absoluteX: 0xfd,
        absoluteY: 0xf9,
        zeroPageIndirectX: 0xe1,
        zeroPageYIndirect: 0xf1
    },
    SEC: {
        implied: 0x38
    },
    SED: {
        implied: 0xF8
    },
    SEI: {
        implied: 0x78
    },
    STA: {
        zeroPage: 0x85,
        zeroPageX: 0x95,
        absolute: 0x8d,
        absoluteX: 0x9d,
        absoluteY: 0x99,
        zeroPageXIndirect: 0x81,
        zeroPageIndirectY: 0x91
    },
    STX: {
        zeroPage: 0x86,
        zeroPageY: 0x96,
        absolute: 0x8e
    },
    STY: {
        zeroPage: 0x84,
        zeroPageY: 0x94,
        absolute: 0x8c
    },
    TAX: {
        implied: 0xaa
    },
    TXA: {
        implied: 0x8a
    },
    TXS: {
        implied: 0x9a
    },
    TSX: {
        implied: 0xba
    }
};

module.exports = opcodes;
