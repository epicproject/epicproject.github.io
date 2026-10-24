var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/qrcode-generator/qrcode.js
var require_qrcode = __commonJS({
  "node_modules/qrcode-generator/qrcode.js"(exports, module) {
    var qrcode2 = (function() {
      var qrcode3 = function(typeNumber, errorCorrectionLevel) {
        var PAD0 = 236;
        var PAD1 = 17;
        var _typeNumber = typeNumber;
        var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
        var _modules = null;
        var _moduleCount = 0;
        var _dataCache = null;
        var _dataList = [];
        var _this = {};
        var makeImpl = function(test, maskPattern) {
          _moduleCount = _typeNumber * 4 + 17;
          _modules = (function(moduleCount) {
            var modules = new Array(moduleCount);
            for (var row = 0; row < moduleCount; row += 1) {
              modules[row] = new Array(moduleCount);
              for (var col = 0; col < moduleCount; col += 1) {
                modules[row][col] = null;
              }
            }
            return modules;
          })(_moduleCount);
          setupPositionProbePattern(0, 0);
          setupPositionProbePattern(_moduleCount - 7, 0);
          setupPositionProbePattern(0, _moduleCount - 7);
          setupPositionAdjustPattern();
          setupTimingPattern();
          setupTypeInfo(test, maskPattern);
          if (_typeNumber >= 7) {
            setupTypeNumber(test);
          }
          if (_dataCache == null) {
            _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
          }
          mapData(_dataCache, maskPattern);
        };
        var setupPositionProbePattern = function(row, col) {
          for (var r = -1; r <= 7; r += 1) {
            if (row + r <= -1 || _moduleCount <= row + r) continue;
            for (var c = -1; c <= 7; c += 1) {
              if (col + c <= -1 || _moduleCount <= col + c) continue;
              if (0 <= r && r <= 6 && (c == 0 || c == 6) || 0 <= c && c <= 6 && (r == 0 || r == 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        };
        var getBestMaskPattern = function() {
          var minLostPoint = 0;
          var pattern = 0;
          for (var i = 0; i < 8; i += 1) {
            makeImpl(true, i);
            var lostPoint = QRUtil.getLostPoint(_this);
            if (i == 0 || minLostPoint > lostPoint) {
              minLostPoint = lostPoint;
              pattern = i;
            }
          }
          return pattern;
        };
        var setupTimingPattern = function() {
          for (var r = 8; r < _moduleCount - 8; r += 1) {
            if (_modules[r][6] != null) {
              continue;
            }
            _modules[r][6] = r % 2 == 0;
          }
          for (var c = 8; c < _moduleCount - 8; c += 1) {
            if (_modules[6][c] != null) {
              continue;
            }
            _modules[6][c] = c % 2 == 0;
          }
        };
        var setupPositionAdjustPattern = function() {
          var pos = QRUtil.getPatternPosition(_typeNumber);
          for (var i = 0; i < pos.length; i += 1) {
            for (var j = 0; j < pos.length; j += 1) {
              var row = pos[i];
              var col = pos[j];
              if (_modules[row][col] != null) {
                continue;
              }
              for (var r = -2; r <= 2; r += 1) {
                for (var c = -2; c <= 2; c += 1) {
                  if (r == -2 || r == 2 || c == -2 || c == 2 || r == 0 && c == 0) {
                    _modules[row + r][col + c] = true;
                  } else {
                    _modules[row + r][col + c] = false;
                  }
                }
              }
            }
          }
        };
        var setupTypeNumber = function(test) {
          var bits = QRUtil.getBCHTypeNumber(_typeNumber);
          for (var i = 0; i < 18; i += 1) {
            var mod = !test && (bits >> i & 1) == 1;
            _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
          }
          for (var i = 0; i < 18; i += 1) {
            var mod = !test && (bits >> i & 1) == 1;
            _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
          }
        };
        var setupTypeInfo = function(test, maskPattern) {
          var data = _errorCorrectionLevel << 3 | maskPattern;
          var bits = QRUtil.getBCHTypeInfo(data);
          for (var i = 0; i < 15; i += 1) {
            var mod = !test && (bits >> i & 1) == 1;
            if (i < 6) {
              _modules[i][8] = mod;
            } else if (i < 8) {
              _modules[i + 1][8] = mod;
            } else {
              _modules[_moduleCount - 15 + i][8] = mod;
            }
          }
          for (var i = 0; i < 15; i += 1) {
            var mod = !test && (bits >> i & 1) == 1;
            if (i < 8) {
              _modules[8][_moduleCount - i - 1] = mod;
            } else if (i < 9) {
              _modules[8][15 - i - 1 + 1] = mod;
            } else {
              _modules[8][15 - i - 1] = mod;
            }
          }
          _modules[_moduleCount - 8][8] = !test;
        };
        var mapData = function(data, maskPattern) {
          var inc = -1;
          var row = _moduleCount - 1;
          var bitIndex = 7;
          var byteIndex = 0;
          var maskFunc = QRUtil.getMaskFunction(maskPattern);
          for (var col = _moduleCount - 1; col > 0; col -= 2) {
            if (col == 6) col -= 1;
            while (true) {
              for (var c = 0; c < 2; c += 1) {
                if (_modules[row][col - c] == null) {
                  var dark = false;
                  if (byteIndex < data.length) {
                    dark = (data[byteIndex] >>> bitIndex & 1) == 1;
                  }
                  var mask = maskFunc(row, col - c);
                  if (mask) {
                    dark = !dark;
                  }
                  _modules[row][col - c] = dark;
                  bitIndex -= 1;
                  if (bitIndex == -1) {
                    byteIndex += 1;
                    bitIndex = 7;
                  }
                }
              }
              row += inc;
              if (row < 0 || _moduleCount <= row) {
                row -= inc;
                inc = -inc;
                break;
              }
            }
          }
        };
        var createBytes = function(buffer, rsBlocks) {
          var offset = 0;
          var maxDcCount = 0;
          var maxEcCount = 0;
          var dcdata = new Array(rsBlocks.length);
          var ecdata = new Array(rsBlocks.length);
          for (var r = 0; r < rsBlocks.length; r += 1) {
            var dcCount = rsBlocks[r].dataCount;
            var ecCount = rsBlocks[r].totalCount - dcCount;
            maxDcCount = Math.max(maxDcCount, dcCount);
            maxEcCount = Math.max(maxEcCount, ecCount);
            dcdata[r] = new Array(dcCount);
            for (var i = 0; i < dcdata[r].length; i += 1) {
              dcdata[r][i] = 255 & buffer.getBuffer()[i + offset];
            }
            offset += dcCount;
            var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
            var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);
            var modPoly = rawPoly.mod(rsPoly);
            ecdata[r] = new Array(rsPoly.getLength() - 1);
            for (var i = 0; i < ecdata[r].length; i += 1) {
              var modIndex = i + modPoly.getLength() - ecdata[r].length;
              ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
            }
          }
          var totalCodeCount = 0;
          for (var i = 0; i < rsBlocks.length; i += 1) {
            totalCodeCount += rsBlocks[i].totalCount;
          }
          var data = new Array(totalCodeCount);
          var index = 0;
          for (var i = 0; i < maxDcCount; i += 1) {
            for (var r = 0; r < rsBlocks.length; r += 1) {
              if (i < dcdata[r].length) {
                data[index] = dcdata[r][i];
                index += 1;
              }
            }
          }
          for (var i = 0; i < maxEcCount; i += 1) {
            for (var r = 0; r < rsBlocks.length; r += 1) {
              if (i < ecdata[r].length) {
                data[index] = ecdata[r][i];
                index += 1;
              }
            }
          }
          return data;
        };
        var createData = function(typeNumber2, errorCorrectionLevel2, dataList) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber2, errorCorrectionLevel2);
          var buffer = qrBitBuffer();
          for (var i = 0; i < dataList.length; i += 1) {
            var data = dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber2));
            data.write(buffer);
          }
          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i += 1) {
            totalDataCount += rsBlocks[i].dataCount;
          }
          if (buffer.getLengthInBits() > totalDataCount * 8) {
            throw "code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")";
          }
          if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
            buffer.put(0, 4);
          }
          while (buffer.getLengthInBits() % 8 != 0) {
            buffer.putBit(false);
          }
          while (true) {
            if (buffer.getLengthInBits() >= totalDataCount * 8) {
              break;
            }
            buffer.put(PAD0, 8);
            if (buffer.getLengthInBits() >= totalDataCount * 8) {
              break;
            }
            buffer.put(PAD1, 8);
          }
          return createBytes(buffer, rsBlocks);
        };
        _this.addData = function(data, mode) {
          mode = mode || "Byte";
          var newData = null;
          switch (mode) {
            case "Numeric":
              newData = qrNumber(data);
              break;
            case "Alphanumeric":
              newData = qrAlphaNum(data);
              break;
            case "Byte":
              newData = qr8BitByte(data);
              break;
            case "Kanji":
              newData = qrKanji(data);
              break;
            default:
              throw "mode:" + mode;
          }
          _dataList.push(newData);
          _dataCache = null;
        };
        _this.isDark = function(row, col) {
          if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
            throw row + "," + col;
          }
          return _modules[row][col];
        };
        _this.getModuleCount = function() {
          return _moduleCount;
        };
        _this.make = function() {
          if (_typeNumber < 1) {
            var typeNumber2 = 1;
            for (; typeNumber2 < 40; typeNumber2++) {
              var rsBlocks = QRRSBlock.getRSBlocks(typeNumber2, _errorCorrectionLevel);
              var buffer = qrBitBuffer();
              for (var i = 0; i < _dataList.length; i++) {
                var data = _dataList[i];
                buffer.put(data.getMode(), 4);
                buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber2));
                data.write(buffer);
              }
              var totalDataCount = 0;
              for (var i = 0; i < rsBlocks.length; i++) {
                totalDataCount += rsBlocks[i].dataCount;
              }
              if (buffer.getLengthInBits() <= totalDataCount * 8) {
                break;
              }
            }
            _typeNumber = typeNumber2;
          }
          makeImpl(false, getBestMaskPattern());
        };
        _this.createTableTag = function(cellSize, margin) {
          cellSize = cellSize || 2;
          margin = typeof margin == "undefined" ? cellSize * 4 : margin;
          var qrHtml = "";
          qrHtml += '<table style="';
          qrHtml += " border-width: 0px; border-style: none;";
          qrHtml += " border-collapse: collapse;";
          qrHtml += " padding: 0px; margin: " + margin + "px;";
          qrHtml += '">';
          qrHtml += "<tbody>";
          for (var r = 0; r < _this.getModuleCount(); r += 1) {
            qrHtml += "<tr>";
            for (var c = 0; c < _this.getModuleCount(); c += 1) {
              qrHtml += '<td style="';
              qrHtml += " border-width: 0px; border-style: none;";
              qrHtml += " border-collapse: collapse;";
              qrHtml += " padding: 0px; margin: 0px;";
              qrHtml += " width: " + cellSize + "px;";
              qrHtml += " height: " + cellSize + "px;";
              qrHtml += " background-color: ";
              qrHtml += _this.isDark(r, c) ? "#000000" : "#ffffff";
              qrHtml += ";";
              qrHtml += '"/>';
            }
            qrHtml += "</tr>";
          }
          qrHtml += "</tbody>";
          qrHtml += "</table>";
          return qrHtml;
        };
        _this.createSvgTag = function(cellSize, margin, alt, title) {
          var opts = {};
          if (typeof arguments[0] == "object") {
            opts = arguments[0];
            cellSize = opts.cellSize;
            margin = opts.margin;
            alt = opts.alt;
            title = opts.title;
          }
          cellSize = cellSize || 2;
          margin = typeof margin == "undefined" ? cellSize * 4 : margin;
          alt = typeof alt === "string" ? { text: alt } : alt || {};
          alt.text = alt.text || null;
          alt.id = alt.text ? alt.id || "qrcode-description" : null;
          title = typeof title === "string" ? { text: title } : title || {};
          title.text = title.text || null;
          title.id = title.text ? title.id || "qrcode-title" : null;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var c, mc, r, mr, qrSvg = "", rect;
          rect = "l" + cellSize + ",0 0," + cellSize + " -" + cellSize + ",0 0,-" + cellSize + "z ";
          qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
          qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : "";
          qrSvg += ' viewBox="0 0 ' + size + " " + size + '" ';
          qrSvg += ' preserveAspectRatio="xMinYMin meet"';
          qrSvg += title.text || alt.text ? ' role="img" aria-labelledby="' + escapeXml([title.id, alt.id].join(" ").trim()) + '"' : "";
          qrSvg += ">";
          qrSvg += title.text ? '<title id="' + escapeXml(title.id) + '">' + escapeXml(title.text) + "</title>" : "";
          qrSvg += alt.text ? '<description id="' + escapeXml(alt.id) + '">' + escapeXml(alt.text) + "</description>" : "";
          qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
          qrSvg += '<path d="';
          for (r = 0; r < _this.getModuleCount(); r += 1) {
            mr = r * cellSize + margin;
            for (c = 0; c < _this.getModuleCount(); c += 1) {
              if (_this.isDark(r, c)) {
                mc = c * cellSize + margin;
                qrSvg += "M" + mc + "," + mr + rect;
              }
            }
          }
          qrSvg += '" stroke="transparent" fill="black"/>';
          qrSvg += "</svg>";
          return qrSvg;
        };
        _this.createDataURL = function(cellSize, margin) {
          cellSize = cellSize || 2;
          margin = typeof margin == "undefined" ? cellSize * 4 : margin;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var min = margin;
          var max = size - margin;
          return createDataURL(size, size, function(x, y) {
            if (min <= x && x < max && min <= y && y < max) {
              var c = Math.floor((x - min) / cellSize);
              var r = Math.floor((y - min) / cellSize);
              return _this.isDark(r, c) ? 0 : 1;
            } else {
              return 1;
            }
          });
        };
        _this.createImgTag = function(cellSize, margin, alt) {
          cellSize = cellSize || 2;
          margin = typeof margin == "undefined" ? cellSize * 4 : margin;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var img = "";
          img += "<img";
          img += ' src="';
          img += _this.createDataURL(cellSize, margin);
          img += '"';
          img += ' width="';
          img += size;
          img += '"';
          img += ' height="';
          img += size;
          img += '"';
          if (alt) {
            img += ' alt="';
            img += escapeXml(alt);
            img += '"';
          }
          img += "/>";
          return img;
        };
        var escapeXml = function(s) {
          var escaped = "";
          for (var i = 0; i < s.length; i += 1) {
            var c = s.charAt(i);
            switch (c) {
              case "<":
                escaped += "&lt;";
                break;
              case ">":
                escaped += "&gt;";
                break;
              case "&":
                escaped += "&amp;";
                break;
              case '"':
                escaped += "&quot;";
                break;
              default:
                escaped += c;
                break;
            }
          }
          return escaped;
        };
        var _createHalfASCII = function(margin) {
          var cellSize = 1;
          margin = typeof margin == "undefined" ? cellSize * 2 : margin;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var min = margin;
          var max = size - margin;
          var y, x, r1, r2, p;
          var blocks = {
            "\u2588\u2588": "\u2588",
            "\u2588 ": "\u2580",
            " \u2588": "\u2584",
            "  ": " "
          };
          var blocksLastLineNoMargin = {
            "\u2588\u2588": "\u2580",
            "\u2588 ": "\u2580",
            " \u2588": " ",
            "  ": " "
          };
          var ascii = "";
          for (y = 0; y < size; y += 2) {
            r1 = Math.floor((y - min) / cellSize);
            r2 = Math.floor((y + 1 - min) / cellSize);
            for (x = 0; x < size; x += 1) {
              p = "\u2588";
              if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
                p = " ";
              }
              if (min <= x && x < max && min <= y + 1 && y + 1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
                p += " ";
              } else {
                p += "\u2588";
              }
              ascii += margin < 1 && y + 1 >= max ? blocksLastLineNoMargin[p] : blocks[p];
            }
            ascii += "\n";
          }
          if (size % 2 && margin > 0) {
            return ascii.substring(0, ascii.length - size - 1) + Array(size + 1).join("\u2580");
          }
          return ascii.substring(0, ascii.length - 1);
        };
        _this.createASCII = function(cellSize, margin) {
          cellSize = cellSize || 1;
          if (cellSize < 2) {
            return _createHalfASCII(margin);
          }
          cellSize -= 1;
          margin = typeof margin == "undefined" ? cellSize * 2 : margin;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var min = margin;
          var max = size - margin;
          var y, x, r, p;
          var white = Array(cellSize + 1).join("\u2588\u2588");
          var black = Array(cellSize + 1).join("  ");
          var ascii = "";
          var line = "";
          for (y = 0; y < size; y += 1) {
            r = Math.floor((y - min) / cellSize);
            line = "";
            for (x = 0; x < size; x += 1) {
              p = 1;
              if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
                p = 0;
              }
              line += p ? white : black;
            }
            for (r = 0; r < cellSize; r += 1) {
              ascii += line + "\n";
            }
          }
          return ascii.substring(0, ascii.length - 1);
        };
        _this.renderTo2dContext = function(context, cellSize) {
          cellSize = cellSize || 2;
          var length = _this.getModuleCount();
          for (var row = 0; row < length; row++) {
            for (var col = 0; col < length; col++) {
              context.fillStyle = _this.isDark(row, col) ? "black" : "white";
              context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
            }
          }
        };
        return _this;
      };
      qrcode3.stringToBytesFuncs = {
        "default": function(s) {
          var bytes = [];
          for (var i = 0; i < s.length; i += 1) {
            var c = s.charCodeAt(i);
            bytes.push(c & 255);
          }
          return bytes;
        }
      };
      qrcode3.stringToBytes = qrcode3.stringToBytesFuncs["default"];
      qrcode3.createStringToBytes = function(unicodeData, numChars) {
        var unicodeMap = (function() {
          var bin = base64DecodeInputStream(unicodeData);
          var read = function() {
            var b = bin.read();
            if (b == -1) throw "eof";
            return b;
          };
          var count = 0;
          var unicodeMap2 = {};
          while (true) {
            var b0 = bin.read();
            if (b0 == -1) break;
            var b1 = read();
            var b2 = read();
            var b3 = read();
            var k = String.fromCharCode(b0 << 8 | b1);
            var v = b2 << 8 | b3;
            unicodeMap2[k] = v;
            count += 1;
          }
          if (count != numChars) {
            throw count + " != " + numChars;
          }
          return unicodeMap2;
        })();
        var unknownChar = "?".charCodeAt(0);
        return function(s) {
          var bytes = [];
          for (var i = 0; i < s.length; i += 1) {
            var c = s.charCodeAt(i);
            if (c < 128) {
              bytes.push(c);
            } else {
              var b = unicodeMap[s.charAt(i)];
              if (typeof b == "number") {
                if ((b & 255) == b) {
                  bytes.push(b);
                } else {
                  bytes.push(b >>> 8);
                  bytes.push(b & 255);
                }
              } else {
                bytes.push(unknownChar);
              }
            }
          }
          return bytes;
        };
      };
      var QRMode = {
        MODE_NUMBER: 1 << 0,
        MODE_ALPHA_NUM: 1 << 1,
        MODE_8BIT_BYTE: 1 << 2,
        MODE_KANJI: 1 << 3
      };
      var QRErrorCorrectionLevel = {
        L: 1,
        M: 0,
        Q: 3,
        H: 2
      };
      var QRMaskPattern = {
        PATTERN000: 0,
        PATTERN001: 1,
        PATTERN010: 2,
        PATTERN011: 3,
        PATTERN100: 4,
        PATTERN101: 5,
        PATTERN110: 6,
        PATTERN111: 7
      };
      var QRUtil = (function() {
        var PATTERN_POSITION_TABLE = [
          [],
          [6, 18],
          [6, 22],
          [6, 26],
          [6, 30],
          [6, 34],
          [6, 22, 38],
          [6, 24, 42],
          [6, 26, 46],
          [6, 28, 50],
          [6, 30, 54],
          [6, 32, 58],
          [6, 34, 62],
          [6, 26, 46, 66],
          [6, 26, 48, 70],
          [6, 26, 50, 74],
          [6, 30, 54, 78],
          [6, 30, 56, 82],
          [6, 30, 58, 86],
          [6, 34, 62, 90],
          [6, 28, 50, 72, 94],
          [6, 26, 50, 74, 98],
          [6, 30, 54, 78, 102],
          [6, 28, 54, 80, 106],
          [6, 32, 58, 84, 110],
          [6, 30, 58, 86, 114],
          [6, 34, 62, 90, 118],
          [6, 26, 50, 74, 98, 122],
          [6, 30, 54, 78, 102, 126],
          [6, 26, 52, 78, 104, 130],
          [6, 30, 56, 82, 108, 134],
          [6, 34, 60, 86, 112, 138],
          [6, 30, 58, 86, 114, 142],
          [6, 34, 62, 90, 118, 146],
          [6, 30, 54, 78, 102, 126, 150],
          [6, 24, 50, 76, 102, 128, 154],
          [6, 28, 54, 80, 106, 132, 158],
          [6, 32, 58, 84, 110, 136, 162],
          [6, 26, 54, 82, 110, 138, 166],
          [6, 30, 58, 86, 114, 142, 170]
        ];
        var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
        var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
        var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
        var _this = {};
        var getBCHDigit = function(data) {
          var digit = 0;
          while (data != 0) {
            digit += 1;
            data >>>= 1;
          }
          return digit;
        };
        _this.getBCHTypeInfo = function(data) {
          var d = data << 10;
          while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
            d ^= G15 << getBCHDigit(d) - getBCHDigit(G15);
          }
          return (data << 10 | d) ^ G15_MASK;
        };
        _this.getBCHTypeNumber = function(data) {
          var d = data << 12;
          while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
            d ^= G18 << getBCHDigit(d) - getBCHDigit(G18);
          }
          return data << 12 | d;
        };
        _this.getPatternPosition = function(typeNumber) {
          return PATTERN_POSITION_TABLE[typeNumber - 1];
        };
        _this.getMaskFunction = function(maskPattern) {
          switch (maskPattern) {
            case QRMaskPattern.PATTERN000:
              return function(i, j) {
                return (i + j) % 2 == 0;
              };
            case QRMaskPattern.PATTERN001:
              return function(i, j) {
                return i % 2 == 0;
              };
            case QRMaskPattern.PATTERN010:
              return function(i, j) {
                return j % 3 == 0;
              };
            case QRMaskPattern.PATTERN011:
              return function(i, j) {
                return (i + j) % 3 == 0;
              };
            case QRMaskPattern.PATTERN100:
              return function(i, j) {
                return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
              };
            case QRMaskPattern.PATTERN101:
              return function(i, j) {
                return i * j % 2 + i * j % 3 == 0;
              };
            case QRMaskPattern.PATTERN110:
              return function(i, j) {
                return (i * j % 2 + i * j % 3) % 2 == 0;
              };
            case QRMaskPattern.PATTERN111:
              return function(i, j) {
                return (i * j % 3 + (i + j) % 2) % 2 == 0;
              };
            default:
              throw "bad maskPattern:" + maskPattern;
          }
        };
        _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
          var a = qrPolynomial([1], 0);
          for (var i = 0; i < errorCorrectLength; i += 1) {
            a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0));
          }
          return a;
        };
        _this.getLengthInBits = function(mode, type) {
          if (1 <= type && type < 10) {
            switch (mode) {
              case QRMode.MODE_NUMBER:
                return 10;
              case QRMode.MODE_ALPHA_NUM:
                return 9;
              case QRMode.MODE_8BIT_BYTE:
                return 8;
              case QRMode.MODE_KANJI:
                return 8;
              default:
                throw "mode:" + mode;
            }
          } else if (type < 27) {
            switch (mode) {
              case QRMode.MODE_NUMBER:
                return 12;
              case QRMode.MODE_ALPHA_NUM:
                return 11;
              case QRMode.MODE_8BIT_BYTE:
                return 16;
              case QRMode.MODE_KANJI:
                return 10;
              default:
                throw "mode:" + mode;
            }
          } else if (type < 41) {
            switch (mode) {
              case QRMode.MODE_NUMBER:
                return 14;
              case QRMode.MODE_ALPHA_NUM:
                return 13;
              case QRMode.MODE_8BIT_BYTE:
                return 16;
              case QRMode.MODE_KANJI:
                return 12;
              default:
                throw "mode:" + mode;
            }
          } else {
            throw "type:" + type;
          }
        };
        _this.getLostPoint = function(qrcode4) {
          var moduleCount = qrcode4.getModuleCount();
          var lostPoint = 0;
          for (var row = 0; row < moduleCount; row += 1) {
            for (var col = 0; col < moduleCount; col += 1) {
              var sameCount = 0;
              var dark = qrcode4.isDark(row, col);
              for (var r = -1; r <= 1; r += 1) {
                if (row + r < 0 || moduleCount <= row + r) {
                  continue;
                }
                for (var c = -1; c <= 1; c += 1) {
                  if (col + c < 0 || moduleCount <= col + c) {
                    continue;
                  }
                  if (r == 0 && c == 0) {
                    continue;
                  }
                  if (dark == qrcode4.isDark(row + r, col + c)) {
                    sameCount += 1;
                  }
                }
              }
              if (sameCount > 5) {
                lostPoint += 3 + sameCount - 5;
              }
            }
          }
          ;
          for (var row = 0; row < moduleCount - 1; row += 1) {
            for (var col = 0; col < moduleCount - 1; col += 1) {
              var count = 0;
              if (qrcode4.isDark(row, col)) count += 1;
              if (qrcode4.isDark(row + 1, col)) count += 1;
              if (qrcode4.isDark(row, col + 1)) count += 1;
              if (qrcode4.isDark(row + 1, col + 1)) count += 1;
              if (count == 0 || count == 4) {
                lostPoint += 3;
              }
            }
          }
          for (var row = 0; row < moduleCount; row += 1) {
            for (var col = 0; col < moduleCount - 6; col += 1) {
              if (qrcode4.isDark(row, col) && !qrcode4.isDark(row, col + 1) && qrcode4.isDark(row, col + 2) && qrcode4.isDark(row, col + 3) && qrcode4.isDark(row, col + 4) && !qrcode4.isDark(row, col + 5) && qrcode4.isDark(row, col + 6)) {
                lostPoint += 40;
              }
            }
          }
          for (var col = 0; col < moduleCount; col += 1) {
            for (var row = 0; row < moduleCount - 6; row += 1) {
              if (qrcode4.isDark(row, col) && !qrcode4.isDark(row + 1, col) && qrcode4.isDark(row + 2, col) && qrcode4.isDark(row + 3, col) && qrcode4.isDark(row + 4, col) && !qrcode4.isDark(row + 5, col) && qrcode4.isDark(row + 6, col)) {
                lostPoint += 40;
              }
            }
          }
          var darkCount = 0;
          for (var col = 0; col < moduleCount; col += 1) {
            for (var row = 0; row < moduleCount; row += 1) {
              if (qrcode4.isDark(row, col)) {
                darkCount += 1;
              }
            }
          }
          var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
          lostPoint += ratio * 10;
          return lostPoint;
        };
        return _this;
      })();
      var QRMath = (function() {
        var EXP_TABLE = new Array(256);
        var LOG_TABLE = new Array(256);
        for (var i = 0; i < 8; i += 1) {
          EXP_TABLE[i] = 1 << i;
        }
        for (var i = 8; i < 256; i += 1) {
          EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
        }
        for (var i = 0; i < 255; i += 1) {
          LOG_TABLE[EXP_TABLE[i]] = i;
        }
        var _this = {};
        _this.glog = function(n) {
          if (n < 1) {
            throw "glog(" + n + ")";
          }
          return LOG_TABLE[n];
        };
        _this.gexp = function(n) {
          while (n < 0) {
            n += 255;
          }
          while (n >= 256) {
            n -= 255;
          }
          return EXP_TABLE[n];
        };
        return _this;
      })();
      function qrPolynomial(num, shift) {
        if (typeof num.length == "undefined") {
          throw num.length + "/" + shift;
        }
        var _num = (function() {
          var offset = 0;
          while (offset < num.length && num[offset] == 0) {
            offset += 1;
          }
          var _num2 = new Array(num.length - offset + shift);
          for (var i = 0; i < num.length - offset; i += 1) {
            _num2[i] = num[i + offset];
          }
          return _num2;
        })();
        var _this = {};
        _this.getAt = function(index) {
          return _num[index];
        };
        _this.getLength = function() {
          return _num.length;
        };
        _this.multiply = function(e) {
          var num2 = new Array(_this.getLength() + e.getLength() - 1);
          for (var i = 0; i < _this.getLength(); i += 1) {
            for (var j = 0; j < e.getLength(); j += 1) {
              num2[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i)) + QRMath.glog(e.getAt(j)));
            }
          }
          return qrPolynomial(num2, 0);
        };
        _this.mod = function(e) {
          if (_this.getLength() - e.getLength() < 0) {
            return _this;
          }
          var ratio = QRMath.glog(_this.getAt(0)) - QRMath.glog(e.getAt(0));
          var num2 = new Array(_this.getLength());
          for (var i = 0; i < _this.getLength(); i += 1) {
            num2[i] = _this.getAt(i);
          }
          for (var i = 0; i < e.getLength(); i += 1) {
            num2[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio);
          }
          return qrPolynomial(num2, 0).mod(e);
        };
        return _this;
      }
      ;
      var QRRSBlock = (function() {
        var RS_BLOCK_TABLE = [
          // L
          // M
          // Q
          // H
          // 1
          [1, 26, 19],
          [1, 26, 16],
          [1, 26, 13],
          [1, 26, 9],
          // 2
          [1, 44, 34],
          [1, 44, 28],
          [1, 44, 22],
          [1, 44, 16],
          // 3
          [1, 70, 55],
          [1, 70, 44],
          [2, 35, 17],
          [2, 35, 13],
          // 4
          [1, 100, 80],
          [2, 50, 32],
          [2, 50, 24],
          [4, 25, 9],
          // 5
          [1, 134, 108],
          [2, 67, 43],
          [2, 33, 15, 2, 34, 16],
          [2, 33, 11, 2, 34, 12],
          // 6
          [2, 86, 68],
          [4, 43, 27],
          [4, 43, 19],
          [4, 43, 15],
          // 7
          [2, 98, 78],
          [4, 49, 31],
          [2, 32, 14, 4, 33, 15],
          [4, 39, 13, 1, 40, 14],
          // 8
          [2, 121, 97],
          [2, 60, 38, 2, 61, 39],
          [4, 40, 18, 2, 41, 19],
          [4, 40, 14, 2, 41, 15],
          // 9
          [2, 146, 116],
          [3, 58, 36, 2, 59, 37],
          [4, 36, 16, 4, 37, 17],
          [4, 36, 12, 4, 37, 13],
          // 10
          [2, 86, 68, 2, 87, 69],
          [4, 69, 43, 1, 70, 44],
          [6, 43, 19, 2, 44, 20],
          [6, 43, 15, 2, 44, 16],
          // 11
          [4, 101, 81],
          [1, 80, 50, 4, 81, 51],
          [4, 50, 22, 4, 51, 23],
          [3, 36, 12, 8, 37, 13],
          // 12
          [2, 116, 92, 2, 117, 93],
          [6, 58, 36, 2, 59, 37],
          [4, 46, 20, 6, 47, 21],
          [7, 42, 14, 4, 43, 15],
          // 13
          [4, 133, 107],
          [8, 59, 37, 1, 60, 38],
          [8, 44, 20, 4, 45, 21],
          [12, 33, 11, 4, 34, 12],
          // 14
          [3, 145, 115, 1, 146, 116],
          [4, 64, 40, 5, 65, 41],
          [11, 36, 16, 5, 37, 17],
          [11, 36, 12, 5, 37, 13],
          // 15
          [5, 109, 87, 1, 110, 88],
          [5, 65, 41, 5, 66, 42],
          [5, 54, 24, 7, 55, 25],
          [11, 36, 12, 7, 37, 13],
          // 16
          [5, 122, 98, 1, 123, 99],
          [7, 73, 45, 3, 74, 46],
          [15, 43, 19, 2, 44, 20],
          [3, 45, 15, 13, 46, 16],
          // 17
          [1, 135, 107, 5, 136, 108],
          [10, 74, 46, 1, 75, 47],
          [1, 50, 22, 15, 51, 23],
          [2, 42, 14, 17, 43, 15],
          // 18
          [5, 150, 120, 1, 151, 121],
          [9, 69, 43, 4, 70, 44],
          [17, 50, 22, 1, 51, 23],
          [2, 42, 14, 19, 43, 15],
          // 19
          [3, 141, 113, 4, 142, 114],
          [3, 70, 44, 11, 71, 45],
          [17, 47, 21, 4, 48, 22],
          [9, 39, 13, 16, 40, 14],
          // 20
          [3, 135, 107, 5, 136, 108],
          [3, 67, 41, 13, 68, 42],
          [15, 54, 24, 5, 55, 25],
          [15, 43, 15, 10, 44, 16],
          // 21
          [4, 144, 116, 4, 145, 117],
          [17, 68, 42],
          [17, 50, 22, 6, 51, 23],
          [19, 46, 16, 6, 47, 17],
          // 22
          [2, 139, 111, 7, 140, 112],
          [17, 74, 46],
          [7, 54, 24, 16, 55, 25],
          [34, 37, 13],
          // 23
          [4, 151, 121, 5, 152, 122],
          [4, 75, 47, 14, 76, 48],
          [11, 54, 24, 14, 55, 25],
          [16, 45, 15, 14, 46, 16],
          // 24
          [6, 147, 117, 4, 148, 118],
          [6, 73, 45, 14, 74, 46],
          [11, 54, 24, 16, 55, 25],
          [30, 46, 16, 2, 47, 17],
          // 25
          [8, 132, 106, 4, 133, 107],
          [8, 75, 47, 13, 76, 48],
          [7, 54, 24, 22, 55, 25],
          [22, 45, 15, 13, 46, 16],
          // 26
          [10, 142, 114, 2, 143, 115],
          [19, 74, 46, 4, 75, 47],
          [28, 50, 22, 6, 51, 23],
          [33, 46, 16, 4, 47, 17],
          // 27
          [8, 152, 122, 4, 153, 123],
          [22, 73, 45, 3, 74, 46],
          [8, 53, 23, 26, 54, 24],
          [12, 45, 15, 28, 46, 16],
          // 28
          [3, 147, 117, 10, 148, 118],
          [3, 73, 45, 23, 74, 46],
          [4, 54, 24, 31, 55, 25],
          [11, 45, 15, 31, 46, 16],
          // 29
          [7, 146, 116, 7, 147, 117],
          [21, 73, 45, 7, 74, 46],
          [1, 53, 23, 37, 54, 24],
          [19, 45, 15, 26, 46, 16],
          // 30
          [5, 145, 115, 10, 146, 116],
          [19, 75, 47, 10, 76, 48],
          [15, 54, 24, 25, 55, 25],
          [23, 45, 15, 25, 46, 16],
          // 31
          [13, 145, 115, 3, 146, 116],
          [2, 74, 46, 29, 75, 47],
          [42, 54, 24, 1, 55, 25],
          [23, 45, 15, 28, 46, 16],
          // 32
          [17, 145, 115],
          [10, 74, 46, 23, 75, 47],
          [10, 54, 24, 35, 55, 25],
          [19, 45, 15, 35, 46, 16],
          // 33
          [17, 145, 115, 1, 146, 116],
          [14, 74, 46, 21, 75, 47],
          [29, 54, 24, 19, 55, 25],
          [11, 45, 15, 46, 46, 16],
          // 34
          [13, 145, 115, 6, 146, 116],
          [14, 74, 46, 23, 75, 47],
          [44, 54, 24, 7, 55, 25],
          [59, 46, 16, 1, 47, 17],
          // 35
          [12, 151, 121, 7, 152, 122],
          [12, 75, 47, 26, 76, 48],
          [39, 54, 24, 14, 55, 25],
          [22, 45, 15, 41, 46, 16],
          // 36
          [6, 151, 121, 14, 152, 122],
          [6, 75, 47, 34, 76, 48],
          [46, 54, 24, 10, 55, 25],
          [2, 45, 15, 64, 46, 16],
          // 37
          [17, 152, 122, 4, 153, 123],
          [29, 74, 46, 14, 75, 47],
          [49, 54, 24, 10, 55, 25],
          [24, 45, 15, 46, 46, 16],
          // 38
          [4, 152, 122, 18, 153, 123],
          [13, 74, 46, 32, 75, 47],
          [48, 54, 24, 14, 55, 25],
          [42, 45, 15, 32, 46, 16],
          // 39
          [20, 147, 117, 4, 148, 118],
          [40, 75, 47, 7, 76, 48],
          [43, 54, 24, 22, 55, 25],
          [10, 45, 15, 67, 46, 16],
          // 40
          [19, 148, 118, 6, 149, 119],
          [18, 75, 47, 31, 76, 48],
          [34, 54, 24, 34, 55, 25],
          [20, 45, 15, 61, 46, 16]
        ];
        var qrRSBlock = function(totalCount, dataCount) {
          var _this2 = {};
          _this2.totalCount = totalCount;
          _this2.dataCount = dataCount;
          return _this2;
        };
        var _this = {};
        var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {
          switch (errorCorrectionLevel) {
            case QRErrorCorrectionLevel.L:
              return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
            case QRErrorCorrectionLevel.M:
              return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
            case QRErrorCorrectionLevel.Q:
              return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
            case QRErrorCorrectionLevel.H:
              return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
            default:
              return void 0;
          }
        };
        _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {
          var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);
          if (typeof rsBlock == "undefined") {
            throw "bad rs block @ typeNumber:" + typeNumber + "/errorCorrectionLevel:" + errorCorrectionLevel;
          }
          var length = rsBlock.length / 3;
          var list = [];
          for (var i = 0; i < length; i += 1) {
            var count = rsBlock[i * 3 + 0];
            var totalCount = rsBlock[i * 3 + 1];
            var dataCount = rsBlock[i * 3 + 2];
            for (var j = 0; j < count; j += 1) {
              list.push(qrRSBlock(totalCount, dataCount));
            }
          }
          return list;
        };
        return _this;
      })();
      var qrBitBuffer = function() {
        var _buffer = [];
        var _length = 0;
        var _this = {};
        _this.getBuffer = function() {
          return _buffer;
        };
        _this.getAt = function(index) {
          var bufIndex = Math.floor(index / 8);
          return (_buffer[bufIndex] >>> 7 - index % 8 & 1) == 1;
        };
        _this.put = function(num, length) {
          for (var i = 0; i < length; i += 1) {
            _this.putBit((num >>> length - i - 1 & 1) == 1);
          }
        };
        _this.getLengthInBits = function() {
          return _length;
        };
        _this.putBit = function(bit) {
          var bufIndex = Math.floor(_length / 8);
          if (_buffer.length <= bufIndex) {
            _buffer.push(0);
          }
          if (bit) {
            _buffer[bufIndex] |= 128 >>> _length % 8;
          }
          _length += 1;
        };
        return _this;
      };
      var qrNumber = function(data) {
        var _mode = QRMode.MODE_NUMBER;
        var _data = data;
        var _this = {};
        _this.getMode = function() {
          return _mode;
        };
        _this.getLength = function(buffer) {
          return _data.length;
        };
        _this.write = function(buffer) {
          var data2 = _data;
          var i = 0;
          while (i + 2 < data2.length) {
            buffer.put(strToNum(data2.substring(i, i + 3)), 10);
            i += 3;
          }
          if (i < data2.length) {
            if (data2.length - i == 1) {
              buffer.put(strToNum(data2.substring(i, i + 1)), 4);
            } else if (data2.length - i == 2) {
              buffer.put(strToNum(data2.substring(i, i + 2)), 7);
            }
          }
        };
        var strToNum = function(s) {
          var num = 0;
          for (var i = 0; i < s.length; i += 1) {
            num = num * 10 + chatToNum(s.charAt(i));
          }
          return num;
        };
        var chatToNum = function(c) {
          if ("0" <= c && c <= "9") {
            return c.charCodeAt(0) - "0".charCodeAt(0);
          }
          throw "illegal char :" + c;
        };
        return _this;
      };
      var qrAlphaNum = function(data) {
        var _mode = QRMode.MODE_ALPHA_NUM;
        var _data = data;
        var _this = {};
        _this.getMode = function() {
          return _mode;
        };
        _this.getLength = function(buffer) {
          return _data.length;
        };
        _this.write = function(buffer) {
          var s = _data;
          var i = 0;
          while (i + 1 < s.length) {
            buffer.put(
              getCode(s.charAt(i)) * 45 + getCode(s.charAt(i + 1)),
              11
            );
            i += 2;
          }
          if (i < s.length) {
            buffer.put(getCode(s.charAt(i)), 6);
          }
        };
        var getCode = function(c) {
          if ("0" <= c && c <= "9") {
            return c.charCodeAt(0) - "0".charCodeAt(0);
          } else if ("A" <= c && c <= "Z") {
            return c.charCodeAt(0) - "A".charCodeAt(0) + 10;
          } else {
            switch (c) {
              case " ":
                return 36;
              case "$":
                return 37;
              case "%":
                return 38;
              case "*":
                return 39;
              case "+":
                return 40;
              case "-":
                return 41;
              case ".":
                return 42;
              case "/":
                return 43;
              case ":":
                return 44;
              default:
                throw "illegal char :" + c;
            }
          }
        };
        return _this;
      };
      var qr8BitByte = function(data) {
        var _mode = QRMode.MODE_8BIT_BYTE;
        var _data = data;
        var _bytes = qrcode3.stringToBytes(data);
        var _this = {};
        _this.getMode = function() {
          return _mode;
        };
        _this.getLength = function(buffer) {
          return _bytes.length;
        };
        _this.write = function(buffer) {
          for (var i = 0; i < _bytes.length; i += 1) {
            buffer.put(_bytes[i], 8);
          }
        };
        return _this;
      };
      var qrKanji = function(data) {
        var _mode = QRMode.MODE_KANJI;
        var _data = data;
        var stringToBytes = qrcode3.stringToBytesFuncs["SJIS"];
        if (!stringToBytes) {
          throw "sjis not supported.";
        }
        !(function(c, code) {
          var test = stringToBytes(c);
          if (test.length != 2 || (test[0] << 8 | test[1]) != code) {
            throw "sjis not supported.";
          }
        })("\u53CB", 38726);
        var _bytes = stringToBytes(data);
        var _this = {};
        _this.getMode = function() {
          return _mode;
        };
        _this.getLength = function(buffer) {
          return ~~(_bytes.length / 2);
        };
        _this.write = function(buffer) {
          var data2 = _bytes;
          var i = 0;
          while (i + 1 < data2.length) {
            var c = (255 & data2[i]) << 8 | 255 & data2[i + 1];
            if (33088 <= c && c <= 40956) {
              c -= 33088;
            } else if (57408 <= c && c <= 60351) {
              c -= 49472;
            } else {
              throw "illegal char at " + (i + 1) + "/" + c;
            }
            c = (c >>> 8 & 255) * 192 + (c & 255);
            buffer.put(c, 13);
            i += 2;
          }
          if (i < data2.length) {
            throw "illegal char at " + (i + 1);
          }
        };
        return _this;
      };
      var byteArrayOutputStream = function() {
        var _bytes = [];
        var _this = {};
        _this.writeByte = function(b) {
          _bytes.push(b & 255);
        };
        _this.writeShort = function(i) {
          _this.writeByte(i);
          _this.writeByte(i >>> 8);
        };
        _this.writeBytes = function(b, off, len) {
          off = off || 0;
          len = len || b.length;
          for (var i = 0; i < len; i += 1) {
            _this.writeByte(b[i + off]);
          }
        };
        _this.writeString = function(s) {
          for (var i = 0; i < s.length; i += 1) {
            _this.writeByte(s.charCodeAt(i));
          }
        };
        _this.toByteArray = function() {
          return _bytes;
        };
        _this.toString = function() {
          var s = "";
          s += "[";
          for (var i = 0; i < _bytes.length; i += 1) {
            if (i > 0) {
              s += ",";
            }
            s += _bytes[i];
          }
          s += "]";
          return s;
        };
        return _this;
      };
      var base64EncodeOutputStream = function() {
        var _buffer = 0;
        var _buflen = 0;
        var _length = 0;
        var _base64 = "";
        var _this = {};
        var writeEncoded = function(b) {
          _base64 += String.fromCharCode(encode(b & 63));
        };
        var encode = function(n) {
          if (n < 0) {
          } else if (n < 26) {
            return 65 + n;
          } else if (n < 52) {
            return 97 + (n - 26);
          } else if (n < 62) {
            return 48 + (n - 52);
          } else if (n == 62) {
            return 43;
          } else if (n == 63) {
            return 47;
          }
          throw "n:" + n;
        };
        _this.writeByte = function(n) {
          _buffer = _buffer << 8 | n & 255;
          _buflen += 8;
          _length += 1;
          while (_buflen >= 6) {
            writeEncoded(_buffer >>> _buflen - 6);
            _buflen -= 6;
          }
        };
        _this.flush = function() {
          if (_buflen > 0) {
            writeEncoded(_buffer << 6 - _buflen);
            _buffer = 0;
            _buflen = 0;
          }
          if (_length % 3 != 0) {
            var padlen = 3 - _length % 3;
            for (var i = 0; i < padlen; i += 1) {
              _base64 += "=";
            }
          }
        };
        _this.toString = function() {
          return _base64;
        };
        return _this;
      };
      var base64DecodeInputStream = function(str2) {
        var _str = str2;
        var _pos = 0;
        var _buffer = 0;
        var _buflen = 0;
        var _this = {};
        _this.read = function() {
          while (_buflen < 8) {
            if (_pos >= _str.length) {
              if (_buflen == 0) {
                return -1;
              }
              throw "unexpected end of file./" + _buflen;
            }
            var c = _str.charAt(_pos);
            _pos += 1;
            if (c == "=") {
              _buflen = 0;
              return -1;
            } else if (c.match(/^\s$/)) {
              continue;
            }
            _buffer = _buffer << 6 | decode(c.charCodeAt(0));
            _buflen += 6;
          }
          var n = _buffer >>> _buflen - 8 & 255;
          _buflen -= 8;
          return n;
        };
        var decode = function(c) {
          if (65 <= c && c <= 90) {
            return c - 65;
          } else if (97 <= c && c <= 122) {
            return c - 97 + 26;
          } else if (48 <= c && c <= 57) {
            return c - 48 + 52;
          } else if (c == 43) {
            return 62;
          } else if (c == 47) {
            return 63;
          } else {
            throw "c:" + c;
          }
        };
        return _this;
      };
      var gifImage = function(width, height) {
        var _width = width;
        var _height = height;
        var _data = new Array(width * height);
        var _this = {};
        _this.setPixel = function(x, y, pixel) {
          _data[y * _width + x] = pixel;
        };
        _this.write = function(out) {
          out.writeString("GIF87a");
          out.writeShort(_width);
          out.writeShort(_height);
          out.writeByte(128);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(255);
          out.writeByte(255);
          out.writeByte(255);
          out.writeString(",");
          out.writeShort(0);
          out.writeShort(0);
          out.writeShort(_width);
          out.writeShort(_height);
          out.writeByte(0);
          var lzwMinCodeSize = 2;
          var raster = getLZWRaster(lzwMinCodeSize);
          out.writeByte(lzwMinCodeSize);
          var offset = 0;
          while (raster.length - offset > 255) {
            out.writeByte(255);
            out.writeBytes(raster, offset, 255);
            offset += 255;
          }
          out.writeByte(raster.length - offset);
          out.writeBytes(raster, offset, raster.length - offset);
          out.writeByte(0);
          out.writeString(";");
        };
        var bitOutputStream = function(out) {
          var _out = out;
          var _bitLength = 0;
          var _bitBuffer = 0;
          var _this2 = {};
          _this2.write = function(data, length) {
            if (data >>> length != 0) {
              throw "length over";
            }
            while (_bitLength + length >= 8) {
              _out.writeByte(255 & (data << _bitLength | _bitBuffer));
              length -= 8 - _bitLength;
              data >>>= 8 - _bitLength;
              _bitBuffer = 0;
              _bitLength = 0;
            }
            _bitBuffer = data << _bitLength | _bitBuffer;
            _bitLength = _bitLength + length;
          };
          _this2.flush = function() {
            if (_bitLength > 0) {
              _out.writeByte(_bitBuffer);
            }
          };
          return _this2;
        };
        var getLZWRaster = function(lzwMinCodeSize) {
          var clearCode = 1 << lzwMinCodeSize;
          var endCode = (1 << lzwMinCodeSize) + 1;
          var bitLength = lzwMinCodeSize + 1;
          var table = lzwTable();
          for (var i = 0; i < clearCode; i += 1) {
            table.add(String.fromCharCode(i));
          }
          table.add(String.fromCharCode(clearCode));
          table.add(String.fromCharCode(endCode));
          var byteOut = byteArrayOutputStream();
          var bitOut = bitOutputStream(byteOut);
          bitOut.write(clearCode, bitLength);
          var dataIndex = 0;
          var s = String.fromCharCode(_data[dataIndex]);
          dataIndex += 1;
          while (dataIndex < _data.length) {
            var c = String.fromCharCode(_data[dataIndex]);
            dataIndex += 1;
            if (table.contains(s + c)) {
              s = s + c;
            } else {
              bitOut.write(table.indexOf(s), bitLength);
              if (table.size() < 4095) {
                if (table.size() == 1 << bitLength) {
                  bitLength += 1;
                }
                table.add(s + c);
              }
              s = c;
            }
          }
          bitOut.write(table.indexOf(s), bitLength);
          bitOut.write(endCode, bitLength);
          bitOut.flush();
          return byteOut.toByteArray();
        };
        var lzwTable = function() {
          var _map = {};
          var _size = 0;
          var _this2 = {};
          _this2.add = function(key) {
            if (_this2.contains(key)) {
              throw "dup key:" + key;
            }
            _map[key] = _size;
            _size += 1;
          };
          _this2.size = function() {
            return _size;
          };
          _this2.indexOf = function(key) {
            return _map[key];
          };
          _this2.contains = function(key) {
            return typeof _map[key] != "undefined";
          };
          return _this2;
        };
        return _this;
      };
      var createDataURL = function(width, height, getPixel) {
        var gif = gifImage(width, height);
        for (var y = 0; y < height; y += 1) {
          for (var x = 0; x < width; x += 1) {
            gif.setPixel(x, y, getPixel(x, y));
          }
        }
        var b = byteArrayOutputStream();
        gif.write(b);
        var base64 = base64EncodeOutputStream();
        var bytes = b.toByteArray();
        for (var i = 0; i < bytes.length; i += 1) {
          base64.writeByte(bytes[i]);
        }
        base64.flush();
        return "data:image/gif;base64," + base64;
      };
      return qrcode3;
    })();
    !(function() {
      qrcode2.stringToBytesFuncs["UTF-8"] = function(s) {
        function toUTF8Array(str2) {
          var utf8 = [];
          for (var i = 0; i < str2.length; i++) {
            var charcode = str2.charCodeAt(i);
            if (charcode < 128) utf8.push(charcode);
            else if (charcode < 2048) {
              utf8.push(
                192 | charcode >> 6,
                128 | charcode & 63
              );
            } else if (charcode < 55296 || charcode >= 57344) {
              utf8.push(
                224 | charcode >> 12,
                128 | charcode >> 6 & 63,
                128 | charcode & 63
              );
            } else {
              i++;
              charcode = 65536 + ((charcode & 1023) << 10 | str2.charCodeAt(i) & 1023);
              utf8.push(
                240 | charcode >> 18,
                128 | charcode >> 12 & 63,
                128 | charcode >> 6 & 63,
                128 | charcode & 63
              );
            }
          }
          return utf8;
        }
        return toUTF8Array(s);
      };
    })();
    (function(factory) {
      if (typeof define === "function" && define.amd) {
        define([], factory);
      } else if (typeof exports === "object") {
        module.exports = factory();
      }
    })(function() {
      return qrcode2;
    });
  }
});

// src/schema.js
var SCHEMA_VERSION = 2;
var SAFE_PROTOCOLS = ["http:", "https:", "mailto:", "tel:", "sms:"];
var MAX_JSON_CHARS = 16 * 1024 * 1024;
var MAX_LAYERS = 1e3;
var MAX_KEYFRAMES = 5e3;
var SHAPES = ["pill", "rect", "ellipse"];
var ACTION_TYPES = ["link", "popup", "qr", "seek"];
var DEFAULT_COLOR = "#7c5cff";
var SdkError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "SdkError";
  }
};
function sanitizeUrl(raw) {
  if (typeof raw !== "string") return null;
  const text = raw.trim();
  if (!text || /[\u0000-\u001f]/.test(text)) return null;
  if (/^(mailto|tel|sms):\S+$/i.test(text)) return text;
  let url;
  try {
    url = new URL(text.includes("://") ? text : `https://${text}`);
  } catch {
    return null;
  }
  if (!SAFE_PROTOCOLS.includes(url.protocol) || !url.hostname) return null;
  return url.href;
}
var clampPct = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fallback;
};
var int = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : fallback;
};
var str = (v, max = 5e3) => typeof v === "string" ? v.slice(0, max) : "";
function colorToCss(value) {
  if (typeof value === "string") {
    return /^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(value) ? value.toLowerCase() : DEFAULT_COLOR;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_COLOR;
  const n = value >>> 0;
  const a = n >>> 24 & 255;
  const hex = (n & 16777215).toString(16).padStart(6, "0");
  return a === 255 ? `#${hex}` : `#${hex}${a.toString(16).padStart(2, "0")}`;
}
function cssToColorInt(css) {
  const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(css);
  if (!m) return 4286340351;
  const a = m[2] ? parseInt(m[2], 16) : 255;
  return (a << 24 | parseInt(m[1], 16)) >>> 0;
}
function parseKeyframe(raw) {
  if (!raw || typeof raw !== "object") throw new SdkError("Keyframe must be an object");
  return {
    timeMs: int(raw.t ?? raw.timeMs),
    x: clampPct(raw.x),
    y: clampPct(raw.y),
    width: clampPct(raw.w ?? raw.width),
    height: clampPct(raw.h ?? raw.height)
  };
}
function parseAction(raw, legacyUrl) {
  const a = raw && typeof raw === "object" ? raw : {};
  const type = ACTION_TYPES.includes(a.type) ? a.type : "link";
  return {
    type,
    url: str(a.url ?? legacyUrl ?? "", 4e3),
    title: str(a.title, 300),
    message: str(a.message, 5e3),
    buttonLabel: str(a.button_label ?? a.buttonLabel, 100),
    seekMs: Math.max(0, int(a.seek_ms ?? a.seekMs))
  };
}
function parseLayer(raw, index) {
  if (!raw || typeof raw !== "object") throw new SdkError(`Layer ${index + 1} must be an object`);
  const startMs = int(raw.timestamp_start ?? raw.startMs, NaN);
  const endMs = int(raw.timestamp_end ?? raw.endMs, NaN);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    throw new SdkError(`Layer ${index + 1} needs timestamp_start and timestamp_end`);
  }
  if (endMs < startMs) throw new SdkError(`Layer ${index + 1} ends before it starts`);
  let keyframes;
  if (Array.isArray(raw.keyframes) && raw.keyframes.length > 0) {
    if (raw.keyframes.length > MAX_KEYFRAMES) throw new SdkError(`Layer ${index + 1} has too many keyframes`);
    keyframes = raw.keyframes.map(parseKeyframe).sort((a, b) => a.timeMs - b.timeMs);
  } else if (raw.relative_x !== void 0) {
    keyframes = [parseKeyframe({ t: startMs, x: raw.relative_x, y: raw.relative_y, w: raw.width, h: raw.height })];
  } else {
    throw new SdkError(`Layer ${index + 1} has no keyframes`);
  }
  return {
    id: str(raw.id, 200) || `layer-${index}`,
    name: str(raw.name, 200),
    startMs,
    endMs,
    keyframes,
    shape: SHAPES.includes(raw.shape) ? raw.shape : "pill",
    visible: raw.visible !== false,
    label: str(raw.label, 200),
    color: colorToCss(raw.color),
    action: parseAction(raw.action, raw.target_url)
  };
}
function parseProject(input) {
  let raw = input;
  if (typeof input === "string") {
    if (input.length > MAX_JSON_CHARS) throw new SdkError("Project JSON is too large");
    try {
      raw = JSON.parse(input);
    } catch {
      throw new SdkError("Project is not valid JSON");
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new SdkError("Project must be an object");
  if (typeof raw.video !== "string" || !raw.video) throw new SdkError('Project needs a "video"');
  const list = raw.hotspots ?? raw.layers ?? [];
  if (!Array.isArray(list)) throw new SdkError('"hotspots" must be an array');
  if (list.length > MAX_LAYERS) throw new SdkError("Too many layers");
  return {
    schemaVersion: SCHEMA_VERSION,
    video: raw.video,
    layers: list.map(parseLayer)
  };
}
function serializeProject(project) {
  return {
    schema_version: SCHEMA_VERSION,
    video: project.video,
    hotspots: project.layers.map((l) => ({
      id: l.id,
      name: l.name,
      timestamp_start: l.startMs,
      timestamp_end: l.endMs,
      keyframes: l.keyframes.map((k) => ({ t: k.timeMs, x: k.x, y: k.y, w: k.width, h: k.height })),
      shape: l.shape,
      visible: l.visible,
      label: l.label,
      color: cssToColorInt(l.color),
      action: {
        type: l.action.type,
        url: l.action.url,
        title: l.action.title,
        message: l.action.message,
        button_label: l.action.buttonLabel,
        seek_ms: l.action.seekMs
      }
    }))
  };
}
var stringifyProject = (project) => JSON.stringify(serializeProject(project), null, 2);
var isNetworkVideo = (project) => /^https?:\/\//i.test(project.video);
var isActive = (layer, ms) => ms >= layer.startMs && ms <= layer.endMs;
function frameAt(layer, ms) {
  const k = layer.keyframes;
  const first = k[0];
  const last = k[k.length - 1];
  if (k.length === 1 || ms <= first.timeMs) return { ...first, timeMs: ms };
  if (ms >= last.timeMs) return { ...last, timeMs: ms };
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i];
    const b = k[i + 1];
    if (ms >= a.timeMs && ms <= b.timeMs) {
      const span = b.timeMs - a.timeMs;
      const t = span <= 0 ? 0 : (ms - a.timeMs) / span;
      const mix = (p, q) => p + (q - p) * t;
      return {
        timeMs: ms,
        x: mix(a.x, b.x),
        y: mix(a.y, b.y),
        width: mix(a.width, b.width),
        height: mix(a.height, b.height)
      };
    }
  }
  return { ...last, timeMs: ms };
}
var activeLayers = (project, ms) => project.layers.filter((l) => isActive(l, ms));
function hitTest(project, ms, xPct, yPct) {
  for (let i = project.layers.length - 1; i >= 0; i--) {
    const layer = project.layers[i];
    if (!isActive(layer, ms)) continue;
    const f = frameAt(layer, ms);
    if (xPct < f.x || xPct > f.x + f.width || yPct < f.y || yPct > f.y + f.height) continue;
    if (layer.shape === "ellipse") {
      const rx = f.width / 2;
      const ry = f.height / 2;
      const dx = (xPct - (f.x + rx)) / rx;
      const dy = (yPct - (f.y + ry)) / ry;
      if (dx * dx + dy * dy > 1) continue;
    }
    return layer;
  }
  return null;
}

// src/ivp.js
var MAGIC = [73, 86, 80, 49];
var MAX_META_BYTES = 16 * 1024 * 1024;
var toBytes = (data) => data instanceof Uint8Array ? data : new Uint8Array(data);
function readBundle(data) {
  const bytes = toBytes(data);
  if (bytes.length < 8 || MAGIC.some((b, i) => bytes[i] !== b)) {
    throw new SdkError("Not an Interactive Video bundle (.ivp)");
  }
  const metaLength = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4);
  if (metaLength === 0 || metaLength > MAX_META_BYTES || 8 + metaLength > bytes.length) {
    throw new SdkError("The bundle is damaged or incomplete");
  }
  const json = new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(8, 8 + metaLength));
  return {
    project: parseProject(json),
    videoBytes: bytes.subarray(8 + metaLength)
  };
}
function writeBundle(project, videoBytes, videoName = "video.mp4") {
  const meta = new TextEncoder().encode(stringifyProject({ ...project, video: videoName }));
  const video = toBytes(videoBytes);
  const out = new Uint8Array(8 + meta.length + video.length);
  out.set(MAGIC, 0);
  new DataView(out.buffer).setUint32(4, meta.length);
  out.set(meta, 8);
  out.set(video, 8 + meta.length);
  return out;
}

// src/tracker.js
var LOST_BELOW = 0.5;
var ADAPT_ABOVE = 0.8;
var SEARCH_RADIUS = 18;
var MAX_TEMPLATE = 36;
var MIN_TEMPLATE = 12;
var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
function crop(frame, left, top, cw, ch) {
  if (left < 0 || top < 0 || left + cw > frame.width || top + ch > frame.height) return null;
  const out = new Float32Array(cw * ch);
  for (let y = 0; y < ch; y++) {
    const row = (top + y) * frame.width + left;
    for (let x = 0; x < cw; x++) out[y * cw + x] = frame.data[row + x];
  }
  return out;
}
function prepare(pixels) {
  let mean = 0;
  for (const p of pixels) mean += p;
  mean /= pixels.length;
  const zeroMean = new Float32Array(pixels.length);
  let sq = 0;
  for (let i = 0; i < pixels.length; i++) {
    const v = pixels[i] - mean;
    zeroMean[i] = v;
    sq += v * v;
  }
  return { zeroMean, norm: Math.sqrt(sq) };
}
function locate(frame, tpl, tw, th, cx, cy) {
  const n = tw * th;
  const baseLeft = Math.round(cx) - Math.floor(tw / 2);
  const baseTop = Math.round(cy) - Math.floor(th / 2);
  let best = -2;
  let bestDx = 0;
  let bestDy = 0;
  const { data, width, height } = frame;
  for (let oy = -SEARCH_RADIUS; oy <= SEARCH_RADIUS; oy++) {
    const top = baseTop + oy;
    if (top < 0 || top + th > height) continue;
    for (let ox = -SEARCH_RADIUS; ox <= SEARCH_RADIUS; ox++) {
      const left = baseLeft + ox;
      if (left < 0 || left + tw > width) continue;
      let sum = 0;
      let sumSq = 0;
      let dot = 0;
      for (let y = 0; y < th; y++) {
        const row = (top + y) * width + left;
        const trow = y * tw;
        for (let x = 0; x < tw; x++) {
          const p = data[row + x];
          sum += p;
          sumSq += p * p;
          dot += tpl.zeroMean[trow + x] * p;
        }
      }
      const variance = sumSq - sum * sum / n;
      if (variance < 1e-3 || tpl.norm < 1e-3) continue;
      const score = dot / (tpl.norm * Math.sqrt(variance));
      if (score > best) {
        best = score;
        bestDx = ox;
        bestDy = oy;
      }
    }
  }
  if (best < -1) return null;
  return { x: baseLeft + bestDx + tw / 2, y: baseTop + bestDy + th / 2, score: best };
}
function simplify(points, epsilon = 0.35) {
  if (points.length < 3) return points.slice();
  const pts = points.slice().sort((a, b) => a.timeMs - b.timeMs);
  const keep = new Array(pts.length).fill(false);
  keep[0] = keep[pts.length - 1] = true;
  const rdp = (a, b) => {
    let worst = 0;
    let index = -1;
    for (let i = a + 1; i < b; i++) {
      const t = (pts[i].timeMs - pts[a].timeMs) / (pts[b].timeMs - pts[a].timeMs || 1);
      const gx = pts[a].x + (pts[b].x - pts[a].x) * t;
      const gy = pts[a].y + (pts[b].y - pts[a].y) * t;
      const err = Math.max(Math.abs(gx - pts[i].x), Math.abs(gy - pts[i].y));
      if (err > worst) {
        worst = err;
        index = i;
      }
    }
    if (index >= 0 && worst > epsilon) {
      keep[index] = true;
      rdp(a, index);
      rdp(index, b);
    }
  };
  rdp(0, pts.length - 1);
  return pts.filter((_, i) => keep[i]);
}
async function trackObject({ source, seed, toMs, stepMs = 100, frameWidth = 192, onProgress, signal }) {
  const forward = toMs >= seed.timeMs;
  const first = await source.getFrame(seed.timeMs, frameWidth);
  const { width: w, height: h } = first;
  const boxW = seed.width;
  const boxH = seed.height;
  let cx = (seed.x + boxW / 2) / 100 * w;
  let cy = (seed.y + boxH / 2) / 100 * h;
  const tw = clamp(Math.round(boxW / 100 * w), MIN_TEMPLATE, MAX_TEMPLATE);
  const th = clamp(Math.round(boxH / 100 * h), MIN_TEMPLATE, MAX_TEMPLATE);
  const template = crop(first, Math.round(cx) - Math.floor(tw / 2), Math.round(cy) - Math.floor(th / 2), tw, th);
  if (!template) return { frames: [seed], lostAtMs: seed.timeMs, cancelled: false };
  let stats = prepare(template);
  const samples = [{ timeMs: seed.timeMs, cx, cy }];
  const span = Math.abs(toMs - seed.timeMs);
  let lostAtMs = null;
  let cancelled = false;
  let t = seed.timeMs;
  while (t !== toMs) {
    if (signal?.aborted) {
      cancelled = true;
      break;
    }
    t = forward ? Math.min(t + stepMs, toMs) : Math.max(t - stepMs, toMs);
    const frame = await source.getFrame(t, frameWidth);
    const match = locate(frame, stats, tw, th, cx, cy);
    if (!match || match.score < LOST_BELOW) {
      lostAtMs = t;
      break;
    }
    cx = cx * 0.25 + match.x * 0.75;
    cy = cy * 0.25 + match.y * 0.75;
    samples.push({ timeMs: t, cx, cy });
    if (match.score > ADAPT_ABOVE) {
      const fresh = crop(frame, Math.round(match.x) - Math.floor(tw / 2), Math.round(match.y) - Math.floor(th / 2), tw, th);
      if (fresh) {
        for (let i = 0; i < template.length; i++) template[i] = template[i] * 0.85 + fresh[i] * 0.15;
        stats = prepare(template);
      }
    }
    onProgress?.(span === 0 ? 1 : clamp(Math.abs(t - seed.timeMs) / span, 0, 1));
  }
  const path = simplify(
    samples.map((s) => ({
      timeMs: s.timeMs,
      x: clamp(s.cx / w * 100 - boxW / 2, 0, 100 - boxW),
      y: clamp(s.cy / h * 100 - boxH / 2, 0, 100 - boxH),
      width: boxW,
      height: boxH
    }))
  );
  path[path.findIndex((k) => k.timeMs === seed.timeMs)] = { ...seed };
  return { frames: path, lostAtMs, cancelled };
}
function applyTrack(layer, outcome, seedTimeMs, forward = true, toleranceMs = 40) {
  const kept = layer.keyframes.filter(
    (k) => forward ? k.timeMs < seedTimeMs - toleranceMs : k.timeMs > seedTimeMs + toleranceMs
  );
  const keyframes = [...kept, ...outcome.frames].sort((a, b) => a.timeMs - b.timeMs);
  const next = { ...layer, keyframes };
  if (forward && outcome.lostAtMs != null) next.endMs = Math.max(layer.startMs + 100, outcome.lostAtMs);
  return next;
}

// src/player.js
var import_qrcode_generator = __toESM(require_qrcode(), 1);
var STYLE_ID = "ivs-styles";
var CSS = `
.ivs-root{position:relative;width:100%;background:#000;overflow:hidden;line-height:0;
  --ivs-accent:#7c5cff;--ivs-surface:#14141f;--ivs-text:#f2f2f7;--ivs-radius:20px;
  font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.ivs-video{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;background:#000}
.ivs-layers{position:absolute;inset:0;pointer-events:none}
.ivs-layer{position:absolute;pointer-events:auto;box-sizing:border-box;margin:0;padding:0 .6em;border:0;cursor:pointer;
  font:700 clamp(10px,1.6vw,16px)/1.1 inherit;display:flex;align-items:center;justify-content:center;
  background:transparent;color:var(--ivs-fg,#fff);-webkit-tap-highlight-color:transparent;overflow:hidden;white-space:nowrap}
.ivs-layer.ivs-drawn{background:var(--ivs-color);box-shadow:0 0 14px color-mix(in srgb,var(--ivs-color) 55%,transparent);
  animation:ivs-pop .18s ease-out}
.ivs-layer.ivs-pill{border-radius:999px}.ivs-layer.ivs-rect{border-radius:8px}.ivs-layer.ivs-ellipse{border-radius:50%}
.ivs-layer:focus-visible{outline:2px solid #fff;outline-offset:2px}
.ivs-debug .ivs-layer:not(.ivs-drawn){background:color-mix(in srgb,var(--ivs-color) 22%,transparent);outline:1.5px solid var(--ivs-color)}
.ivs-fs{position:absolute;top:8px;right:8px;width:34px;height:34px;border:0;border-radius:10px;cursor:pointer;
  background:rgba(0,0,0,.45);color:#fff;font-size:18px;line-height:34px;padding:0;opacity:0;transition:opacity .15s}
.ivs-root:hover .ivs-fs,.ivs-fs:focus-visible{opacity:1}
.ivs-modal{position:absolute;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:16px;
  background:rgba(5,5,12,.62);line-height:1.4;animation:ivs-fade .15s ease-out}
.ivs-card{width:min(92%,380px);max-height:92%;overflow:auto;background:var(--ivs-surface);color:var(--ivs-text);
  border-radius:var(--ivs-radius);padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.5);text-align:left}
.ivs-card h2{margin:0 0 8px;font-size:20px}.ivs-card p{margin:0;opacity:.78;font-size:15px;white-space:pre-wrap}
.ivs-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}
.ivs-btn{border:0;border-radius:12px;padding:10px 16px;font:600 14px/1 inherit;cursor:pointer;text-decoration:none;
  background:transparent;color:var(--ivs-text)}
.ivs-btn.ivs-primary{background:var(--ivs-accent);color:#fff}
.ivs-qr{display:block;margin:0 auto;width:min(100%,220px);height:auto;border-radius:16px;background:#fff}
.ivs-qr-text{margin-top:10px!important;text-align:center;font-size:12px!important;word-break:break-all}
.ivs-card.ivs-center{text-align:center}
@keyframes ivs-pop{from{transform:scale(.85);opacity:0}to{transform:none;opacity:1}}
@keyframes ivs-fade{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.ivs-layer.ivs-drawn,.ivs-modal{animation:none}}
`;
function injectStyles(doc) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  doc.head.appendChild(style);
}
var el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== void 0) node.textContent = text;
  return node;
};
function readableOn(hex) {
  const n = parseInt(hex.slice(1, 7), 16);
  const [r, g, b] = [n >> 16 & 255, n >> 8 & 255, n & 255];
  return (r * 299 + g * 587 + b * 114) / 1e3 > 150 ? "#111" : "#fff";
}
function buildQrSvg(text) {
  const qr = (0, import_qrcode_generator.default)(0, "M");
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const quiet = 4;
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `0 0 ${n + quiet * 2} ${n + quiet * 2}`);
  svg.setAttribute("class", "ivs-qr");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "QR code");
  svg.setAttribute("shape-rendering", "crispEdges");
  let d = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) d += `M${c + quiet} ${r + quiet}h1v1h-1z`;
    }
  }
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", "#111118");
  svg.appendChild(path);
  return svg;
}
var InteractiveVideoPlayer = class _InteractiveVideoPlayer {
  /**
   * @param {HTMLElement} container element the player is mounted into
   * @param {object} options
   * @param {object|string} options.project project JSON or parsed project
   * @param {string} [options.src] video URL; defaults to project.video
   * @param {boolean} [options.controls=true]
   * @param {boolean} [options.autoplay=false]
   * @param {boolean} [options.muted=false]
   * @param {boolean} [options.loop=false]
   * @param {boolean} [options.debug=false] outline invisible layers
   * @param {string} [options.poster]
   * @param {string} [options.crossOrigin]
   * @param {{accent?:string, surface?:string, text?:string}} [options.theme]
   */
  constructor(container, options = {}) {
    if (typeof HTMLElement === "undefined" || !(container instanceof HTMLElement)) {
      throw new SdkError("InteractiveVideoPlayer needs a DOM element to mount into");
    }
    this.options = { controls: true, ...options };
    this.project = parseProject(options.project);
    this._listeners = /* @__PURE__ */ new Map();
    this._els = /* @__PURE__ */ new Map();
    this._raf = 0;
    this._modal = null;
    this._blobUrl = options.blobUrl ?? null;
    injectStyles(container.ownerDocument);
    const root = el("div", "ivs-root");
    const theme = options.theme ?? {};
    if (theme.accent) root.style.setProperty("--ivs-accent", theme.accent);
    if (theme.surface) root.style.setProperty("--ivs-surface", theme.surface);
    if (theme.text) root.style.setProperty("--ivs-text", theme.text);
    root.style.aspectRatio = "16 / 9";
    const video = el("video", "ivs-video");
    video.playsInline = true;
    video.controls = !!this.options.controls;
    video.controlsList = "nofullscreen";
    video.muted = !!options.muted;
    video.loop = !!options.loop;
    video.autoplay = !!options.autoplay;
    video.preload = "metadata";
    if (options.poster) video.poster = options.poster;
    if (options.crossOrigin) video.crossOrigin = options.crossOrigin;
    video.src = options.src ?? this.project.video;
    const layers = el("div", "ivs-layers");
    root.append(video, layers);
    if (this.options.controls && root.requestFullscreen) {
      const fs = el("button", "ivs-fs", "\u26F6");
      fs.type = "button";
      fs.setAttribute("aria-label", "Fullscreen");
      fs.addEventListener("click", () => {
        if (container.ownerDocument.fullscreenElement) container.ownerDocument.exitFullscreen();
        else root.requestFullscreen();
      });
      root.appendChild(fs);
    }
    this.root = root;
    this.video = video;
    this._layersEl = layers;
    this.setDebug(!!options.debug);
    container.appendChild(root);
    this._container = container;
    this._onFrame = () => {
      this._render();
      this._raf = !video.paused && !video.ended ? requestAnimationFrame(this._onFrame) : 0;
    };
    this._onPlay = () => {
      if (!this._raf) this._raf = requestAnimationFrame(this._onFrame);
    };
    this._onSeek = () => this._render();
    this._onMeta = () => {
      if (video.videoWidth) root.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
      this._render();
      this._emit("ready", {});
    };
    this._onError = () => this._emit("error", { error: new SdkError("The video could not be loaded") });
    this._onKey = (e) => {
      if (e.key === "Escape") this.closeWindow();
    };
    video.addEventListener("play", this._onPlay);
    video.addEventListener("playing", this._onPlay);
    for (const name of ["pause", "seeked", "seeking", "timeupdate"]) video.addEventListener(name, this._onSeek);
    video.addEventListener("loadedmetadata", this._onMeta);
    video.addEventListener("error", this._onError);
    this._render();
  }
  /**
   * Creates a player from a `.ivp` bundle (ArrayBuffer or Uint8Array), as
   * exported by the mobile app. The video plays from memory.
   */
  static fromBundle(container, data, options = {}) {
    const { project, videoBytes } = readBundle(data);
    const type = options.mimeType ?? "video/mp4";
    const blobUrl = URL.createObjectURL(new Blob([videoBytes], { type }));
    return new _InteractiveVideoPlayer(container, { ...options, project, src: blobUrl, blobUrl });
  }
  // ------------------------------------------------------------------ events
  on(event, handler) {
    if (!this._listeners.has(event)) this._listeners.set(event, /* @__PURE__ */ new Set());
    this._listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }
  off(event, handler) {
    this._listeners.get(event)?.delete(handler);
  }
  _emit(event, payload) {
    for (const handler of [...this._listeners.get(event) ?? []]) handler(payload);
  }
  // ----------------------------------------------------------------- control
  get currentTimeMs() {
    return this.video.currentTime * 1e3;
  }
  get layersNow() {
    return activeLayers(this.project, this.currentTimeMs);
  }
  play() {
    return this.video.play();
  }
  pause() {
    this.video.pause();
  }
  seek(ms) {
    this.video.currentTime = Math.max(0, ms) / 1e3;
    this._render();
  }
  setDebug(on) {
    this.root.classList.toggle("ivs-debug", !!on);
  }
  setProject(project) {
    this.project = parseProject(project);
    for (const node of this._els.values()) node.remove();
    this._els.clear();
    this._render();
  }
  destroy() {
    cancelAnimationFrame(this._raf);
    this.closeWindow();
    const v = this.video;
    v.removeEventListener("play", this._onPlay);
    v.removeEventListener("playing", this._onPlay);
    for (const name of ["pause", "seeked", "seeking", "timeupdate"]) v.removeEventListener(name, this._onSeek);
    v.removeEventListener("loadedmetadata", this._onMeta);
    v.removeEventListener("error", this._onError);
    v.pause();
    v.removeAttribute("src");
    v.load();
    if (this._blobUrl) URL.revokeObjectURL(this._blobUrl);
    this.root.remove();
    this._listeners.clear();
  }
  // --------------------------------------------------------------- rendering
  _render() {
    const ms = this.currentTimeMs;
    const seen = /* @__PURE__ */ new Set();
    this.project.layers.forEach((layer, index) => {
      if (!isActive(layer, ms)) return;
      seen.add(layer.id);
      let node = this._els.get(layer.id);
      if (!node) {
        node = this._createLayer(layer, index);
        this._els.set(layer.id, node);
        this._layersEl.appendChild(node);
        this._emit("layerenter", { layer });
      }
      const f = frameAt(layer, ms);
      node.style.left = `${f.x}%`;
      node.style.top = `${f.y}%`;
      node.style.width = `${f.width}%`;
      node.style.height = `${f.height}%`;
    });
    for (const [id, node] of this._els) {
      if (seen.has(id)) continue;
      node.remove();
      this._els.delete(id);
      this._emit("layerleave", { layer: this.project.layers.find((l) => l.id === id) });
    }
  }
  _createLayer(layer, index) {
    const node = el("button", `ivs-layer ivs-${layer.shape}${layer.visible ? " ivs-drawn" : ""}`);
    node.type = "button";
    node.style.setProperty("--ivs-color", layer.color);
    node.style.setProperty("--ivs-fg", readableOn(layer.color));
    node.style.zIndex = String(index + 1);
    node.setAttribute("aria-label", layer.label || layer.name || "Interactive link");
    if (layer.visible) node.textContent = layer.label || "Open";
    node.addEventListener("click", (event) => {
      event.stopPropagation();
      this._activate(layer);
    });
    return node;
  }
  // ----------------------------------------------------------------- actions
  _activate(layer) {
    const event = {
      layer,
      action: layer.action,
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      }
    };
    this._emit("action", event);
    if (!event.defaultPrevented) this.runAction(layer);
  }
  /** Runs a layer's configured action, as if it had been tapped. */
  runAction(layer) {
    const a = layer.action;
    switch (a.type) {
      case "link": {
        const url = sanitizeUrl(a.url);
        if (!url) return this._emit("error", { error: new SdkError(`Blocked unsafe or invalid link: ${a.url}`) });
        this._openUrl(url);
        break;
      }
      case "popup":
        this._showPopup(layer);
        break;
      case "qr":
        this._showQr(layer);
        break;
      case "seek":
        this.seek(a.seekMs);
        break;
      default:
        break;
    }
  }
  _openUrl(url) {
    if (/^https?:/i.test(url)) window.open(url, "_blank", "noopener,noreferrer");
    else window.location.href = url;
  }
  _openWindow(layer, card) {
    this.closeWindow();
    const wasPlaying = !this.video.paused;
    this.video.pause();
    const modal = el("div", "ivs-modal");
    card.classList.add("ivs-card");
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    modal.appendChild(card);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.closeWindow();
    });
    this.root.appendChild(modal);
    this._modal = { node: modal, wasPlaying, layer };
    this._root_doc = this.root.ownerDocument;
    this._root_doc.addEventListener("keydown", this._onKey);
    (card.querySelector("[data-ivs-focus]") ?? card).focus?.();
    this._emit("popupopen", { layer });
  }
  closeWindow() {
    if (!this._modal) return;
    const { node, wasPlaying, layer } = this._modal;
    this._modal = null;
    node.remove();
    this._root_doc?.removeEventListener("keydown", this._onKey);
    if (wasPlaying) this.video.play().catch(() => {
    });
    this._emit("popupclose", { layer });
  }
  _closeButton(label = "Close", primary = false) {
    const b = el("button", `ivs-btn${primary ? " ivs-primary" : ""}`, label);
    b.type = "button";
    b.dataset.ivsFocus = "";
    b.addEventListener("click", () => this.closeWindow());
    return b;
  }
  _showPopup(layer) {
    const a = layer.action;
    const card = el("div");
    card.tabIndex = -1;
    if (a.title) card.appendChild(el("h2", "", a.title));
    if (a.message) card.appendChild(el("p", "", a.message));
    const actions = el("div", "ivs-actions");
    actions.appendChild(this._closeButton("Close"));
    const url = a.url ? sanitizeUrl(a.url) : null;
    if (url) {
      const link = el("a", "ivs-btn ivs-primary", a.buttonLabel || "Open");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.style.background = layer.color;
      link.style.color = readableOn(layer.color);
      actions.appendChild(link);
    }
    card.appendChild(actions);
    this._openWindow(layer, card);
  }
  _showQr(layer) {
    const a = layer.action;
    const card = el("div", "ivs-center");
    card.tabIndex = -1;
    card.appendChild(el("h2", "", a.title || "Scan me"));
    try {
      if (!a.url) throw new SdkError("Nothing to encode");
      card.appendChild(buildQrSvg(a.url));
      card.appendChild(el("p", "ivs-qr-text", a.url));
    } catch (error) {
      card.appendChild(el("p", "", "This QR code could not be generated."));
      this._emit("error", { error });
    }
    const actions = el("div", "ivs-actions");
    actions.appendChild(this._closeButton("Done", true));
    card.appendChild(actions);
    this._openWindow(layer, card);
  }
};

// src/browser-frames.js
var VideoFrameSource = class {
  /** @param {string} src video URL (http(s) or blob:) */
  constructor(src, { crossOrigin = "anonymous", seekTimeoutMs = 8e3 } = {}) {
    this.src = src;
    this.crossOrigin = crossOrigin;
    this.seekTimeoutMs = seekTimeoutMs;
    this.video = null;
    this.canvas = null;
    this.ctx = null;
  }
  async open() {
    if (this.video) return;
    const video = document.createElement("video");
    video.muted = true;
    video.preload = "auto";
    video.playsInline = true;
    if (this.crossOrigin) video.crossOrigin = this.crossOrigin;
    video.src = this.src;
    await new Promise((resolve, reject) => {
      video.onloadeddata = resolve;
      video.onerror = () => reject(new SdkError("The video could not be loaded for tracking"));
    });
    this.video = video;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
  }
  async getFrame(timeMs, width = 192) {
    await this.open();
    const { video, canvas, ctx } = this;
    const target = Math.min(Math.max(timeMs / 1e3, 0), video.duration || 0);
    if (Math.abs(video.currentTime - target) > 5e-4) {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new SdkError("Timed out seeking the video")), this.seekTimeoutMs);
        video.addEventListener("seeked", () => {
          clearTimeout(timer);
          resolve();
        }, { once: true });
        video.currentTime = target;
      });
    }
    const height = Math.max(1, Math.round(video.videoHeight * width / video.videoWidth));
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(video, 0, 0, width, height);
    let rgba;
    try {
      rgba = ctx.getImageData(0, 0, width, height).data;
    } catch {
      throw new SdkError("The browser blocked reading video pixels. Serve the video from the same origin or with CORS enabled.");
    }
    const data = new Uint8Array(width * height);
    for (let i = 0, p = 0; i < data.length; i++, p += 4) {
      data[i] = (rgba[p] * 299 + rgba[p + 1] * 587 + rgba[p + 2] * 114) / 1e3;
    }
    return { width, height, data };
  }
  close() {
    if (this.video) {
      this.video.removeAttribute("src");
      this.video.load();
    }
    this.video = this.canvas = this.ctx = null;
  }
};
export {
  InteractiveVideoPlayer,
  SAFE_PROTOCOLS,
  SCHEMA_VERSION,
  SdkError,
  VideoFrameSource,
  activeLayers,
  applyTrack,
  colorToCss,
  cssToColorInt,
  frameAt,
  hitTest,
  isActive,
  isNetworkVideo,
  parseProject,
  readBundle,
  sanitizeUrl,
  serializeProject,
  stringifyProject,
  trackObject,
  writeBundle
};
//# sourceMappingURL=index.mjs.map
