var _ = require('lodash');
var sprintf = require('sprintf');
var opcodes = require('./opcodes');

var BIN_DIGITS = '01';
var HEX_DIGITS = '0123456789ABCDEF';

function toHex(v, n) {
    if (!n) {
        n = v < 256 ? 2 : 4;
    }
    var result = '';
    for (var idx = 0; idx < n; idx++) {
        result = HEX_DIGITS[v & 0x0f] + result;
        v >>= 4;
    }
    return result;
}

function toBinary(v) {
    var result = '';
    for (var idx = 0; idx < 8; idx++) {
        result = BIN_DIGITS[v & 0x01] + result;
        v >>= 1;
    }
    return result;
}

var ORG = 0x8000;
var _org = ORG;

var PSEUDO_OPS = {
    ASC: true,  // ASCII String
    AST: true,  // Print asterisks
    CHK: true,  // Checksum
    DA:  true,  // Define Address
    DS:  true,  // Define Storage
    DCI: true,  // d-string
    END: true,  // End of source
    EQU: true,  // Define constant
    EXP: true,  // Enable macro expansion
    FLS: true,  // Flashing String
    HEX: true,  // Hex Data
    INV: true,  // Inverse String
    OBJ: true,  // Object location during compilation
    ORG: true,  // Object location during execution
    PAG: true,  // Form feed
    REV: true,  // Reverse
    SKP: true,  // Line feeds
    TR:  true   // Format listing
};

function ASM6502() {
    var _symbols = {};
    var _bytes = [];
    var _pc = ORG;


    var LOBIT_QUOTE = /^'([^']+)'$/;
    var HIBIT_QUOTE = /^"([^"]+)"$/;

    var ARITH_EX = /(\w+)\s*([+\-*\/<>]+)\s*(\w+)/;

    function _resolveArg(arg) {
        var result = 0;

        var parts = ARITH_EX.exec(arg);
        if (parts) {
            var a = _resolveArg(parts[1]);
            var b = _resolveArg(parts[3]);
            switch (parts[2]) {
            case '+':
                result = a + b;
                break;
            case '-':
                result = a - b;
                break;
            case '/':
                result = a / b;
                break;
            case '*':
                result = a * b;
                break;
            case '<<':
                result = a >> b;
                break;
            case '>>':
                result = a << b;
                break;
            }
            return result;
        }

        if (arg == 'A') {
            result = undefined;
        } else if (arg in _symbols) {
            result = _symbols[arg];
        } else if (arg.substr(0, 1) === '$') {
            result = parseInt(arg.substr(1), 16);
        } else if (arg.substr(0, 1) === '%') {
            result = parseInt(arg.substr(1), 2);
        } else if (arg) {
            result = parseInt(arg) || undefined;
        }

        return result;
    }

    function _processString(arg) {
        var idx;
        var result = [];
        if (HIBIT_QUOTE.test(arg)) {
            result = [];
            for (idx = 1; idx < arg.length - 1; idx++) {
                result.push(arg.charCodeAt(idx) & 0x7f | 0x80);
            }
        } else if (LOBIT_QUOTE.test(arg)) {
            result = [];
            for (idx = 1; idx < arg.length - 1; idx++) {
                result.push(arg.charCodeAt(idx) & 0x7f);
            }
        } else { // hex data
            var parts = arg.split(/s*/);
            for (idx = 0; idx < parts.length; idx += 2) {
                result.push((parseInt(parts[idx], 16) << 4) | (parseInt(parts[idx + 1], 16)));
            }
        }

        return result;
    }


    var LINE_EX = /^(\S*)\s+(\S+)(\s+(.*))?$/;
    var ARG_EX = /^([\(#]*)(\$?[\w\+\-\*\/<>]+)([\),XY]*)$/i;

    return {
        assembleLine: function asm6502_assembleLine(line, lineno, pass) {
            var parts;
            var bytes = [];
            var sym;
            var opcode;
            var arg;
            var idx;

            function _err() {
                var args = Array.prototype.slice.call(arguments, 0);
                args.unshift(lineno + ':');
                args.unshift('Line');
                if (pass) {
                    console.log.apply(console, args);
                }
            }

            // * comments
            if (!line.indexOf('*')) {
                return bytes;
            }

            // ; comments
            line = line.replace(/\s*;.*$/, '');

            parts = LINE_EX.exec(line);

            if (parts && parts.length > 1) {
                parts = parts.slice(1);
                sym = parts[0];
                if (parts.length > 1) {
                    var mode, modes = [];
                    opcode = parts[1].toUpperCase();
                    modes = ['implied', 'accumulator'];
                    if (parts.length > 2) {
                        var data = parts[3] || '';
                        parts = ARG_EX.exec(data);
                        if (parts) {
                            parts.shift();
                            if (parts.length) {
                                var modeStr = [parts[0], 'xx', parts[2]].join('');
                                switch(modeStr) {
                                case '#xx':
                                    modes = ['immediate'];
                                    break;
                                case 'xx':
                                    if (data == 'A') {
                                        modes = ['accumulator'];
                                    } else {
                                        modes = ['absolute',
                                                 'zeroPage',
                                                 'relative'];
                                    }
                                    break;
                                case 'xx,X':
                                    modes = ['absoluteX', 'zeroPageX'];
                                    break;
                                case 'xx,Y':
                                    modes = ['absoluteY', 'zeroPageY'];
                                    break;
                                case '(xx)':
                                    modes = ['indirect', 'zeroPageIndirect'];
                                    break;
                                case '(xx,X)':
                                    modes = ['zeroPageXIndirect'];
                                    break;
                                case '(xx),X':
                                    modes = ['indirectX', 'zeroPageIndirectX'];
                                    break;
                                case '(xx),Y':
                                    modes = ['indirectY', 'zeroPageIndirectY'];
                                    break;
                                case '(xx,X)':
                                    modes = ['zeroPageXIndirect'];
                                    break;
                                case '(xx,Y)':
                                    modes = ['zeroPageIndirectY'];
                                    break;
                                default:
                                    _err('Unknown operand: ', data);
                                    return [];
                                }
                            }
                            arg = parts[1];
                        }
                    }
                }

                if (arg !== undefined) {
                    arg = _resolveArg(arg);
                }

                if (sym) {
                    _symbols[sym] = _pc;
                }

                if (opcode) {
                    if (opcode in PSEUDO_OPS) {
                        switch (opcode) {
                        case 'ASC':
                        case 'DCI':
                        case 'FLS':
                        case 'INV':
                            if (data !== undefined) {
                                arg = _processString(data);
                            }
                            if (arg && arg.length) {
                                for (idx = 0; idx < arg.length; idx++) {
                                    bytes.push(arg[idx]);
                                    _pc++;
                                }
                                if (opcode != 'ASC') {
                                    bytes[bytes.length - 1] ^= 0x80; // Invert last byte
                                }
                            } else {
                                _err('Missing string');
                            }
                            break;
                        case 'EQU':
                            _symbols[sym] = arg;
                            break;
                        case 'HEX':
                            if (data !== undefined) {
                                arg = _processString(data);
                            }
                            if (arg && arg.length) {
                                for (idx = 0; idx < arg.length; idx++) {
                                    bytes.push(arg[idx]);
                                    _pc++;
                                }
                            } else {
                                _err('Missing string');
                            }
                            break;
                        case 'ORG':
                            _org = arg;
                            _pc = _org;
                            break;
                        case 'REV':
                            if (data !== undefined) {
                                arg = _processString(data);
                            }
                            if (arg && arg.length) {
                                for (idx = arg.length; idx > 0; idx--) {
                                    bytes.push(arg[idx - 1]);
                                    _pc++;
                                }
                            }
                            break;
                        case 'CHK':
                            break;
                        default:
                            // not supported
                            _err('Ignored', opcode);
                            break;
                        }
                    } else {
                        // Real Opcode
                        var op = opcodes[opcode];
                        if (op) {
                            // Scan for appropriate mode
                            for (idx = 0; idx < modes.length; idx++) {
                                if (modes[idx] in op) {
                                    mode = modes[idx];
                                    break;
                                }
                            }

                            if (mode && mode in op) {
                                if (!mode.indexOf('absolute')) {
                                    var altMode = mode.replace('absolute', 'zeroPage');
                                    if ((altMode in op) && ((arg & 0xff) == arg)) {
                                        mode = altMode;
                                    }
                                }

                                bytes.push(op[mode]);
                                _pc++;
                            } else {
                                _err('Unknown mode',
                                     modes.join(' or '),
                                     'for',
                                     opcode);
                                return [];
                            }

                            var lo = 0;
                            var hi = 0;
                            var off = 0;

                            if (arg !== undefined) {
                                lo = (arg & 0xff);
                                hi = ((arg >> 8) & 0xff);
                                off = (arg - (_pc + 1));
                            }

                            switch (mode) {
                            case 'absolute':
                            case 'absoluteX':
                            case 'absoluteY':
                            case 'indirect':
                            case 'indirectX':
                            case 'indirectY':
                                bytes.push(lo);
                                _pc++;
                                bytes.push(hi);
                                _pc++;
                                break;

                            case 'relative':
                                if (off < 128 && off > -129) {
                                    if (off < 0) {
                                        off += 256;
                                    }
                                    bytes.push(off & 0xff);
                                    _pc++;
                                } else {
                                    _err('Relative branch distance error', off);
                                }
                                break;
                            case 'immediate':
                            case 'zeroPage':
                            case 'zeroPageX':
                            case 'zeroPageY':
                            case 'zeroPageXIndirect':
                            case 'zeroPageIndirectY':
                                bytes.push(lo);
                                _pc++;
                                break;
                            default:
                                break;
                            }
                        } else {
                            _err('Unknown opcode', opcode);
                            return [];
                        }
                    }
                }
            }

            return bytes;
        },

        assemble: function asm6502_assemble(buffer, options) {
            function verbose(line, lineno, bytes) {
                bytes = bytes.slice();
                var truncBytes = bytes.splice(0, 3);
                var bytestr = _.map(truncBytes, function(b) {
                    return toHex(b, 2);
                }).join(' ');
                console.log(sprintf('%-9s %4d  %s', bytestr, lineno, line));
                while (bytes.length) {
                    truncBytes = bytes.splice(0, 3);
                    bytestr = _.map(truncBytes, function(b) {
                        return toHex(b, 2);
                    }).join(' ');
                    console.log(bytestr);
                }
            }
            
            _symbols = {};
            options = options || {};

            var lines = buffer.split(/[\r\n]+/);
            for (var pass = 0; pass < 2; pass++) {
                _org = ORG;
                _pc = _org;
                _bytes = [];
                for (var idx = 0; idx < lines.length; idx++) {
                    var line = lines[idx];
                    var lineno = idx + 1;
                    var bytes = this.assembleLine(line, lineno, pass);
                    if (options.verbose && pass) {
                        verbose(line, lineno, bytes);
                    }
                    _bytes = _bytes.concat(bytes);
                }
            }
            return {
                org: _org,
                binary: _bytes
            }
        }
    };
}

ASM6502.toHex = toHex;
ASM6502.toBinary = toBinary;

module.exports = ASM6502;
