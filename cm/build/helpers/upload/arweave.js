"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.arweaveUpload = void 0;
var anchor = __importStar(require("@project-serum/anchor"));
var form_data_1 = __importDefault(require("form-data"));
var fs_1 = __importDefault(require("fs"));
var loglevel_1 = __importDefault(require("loglevel"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var constants_1 = require("../constants");
var transactions_1 = require("../transactions");
function upload(data, manifest, index) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loglevel_1.default.debug("trying to upload " + index + ".png: " + manifest.name);
                    return [4 /*yield*/, node_fetch_1.default('https://us-central1-principal-lane-200702.cloudfunctions.net/uploadFile4', {
                            method: 'POST',
                            // @ts-ignore
                            body: data,
                        })];
                case 1: return [4 /*yield*/, (_a.sent()).json()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function arweaveUpload(walletKeyPair, anchorProgram, env, image, manifestBuffer, manifest, index) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var storageCost, instructions, tx, data, result, metadataFile, link;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    storageCost = 2300000;
                    instructions = [
                        anchor.web3.SystemProgram.transfer({
                            fromPubkey: walletKeyPair.publicKey,
                            toPubkey: constants_1.ARWEAVE_PAYMENT_WALLET,
                            lamports: storageCost,
                        }),
                    ];
                    return [4 /*yield*/, transactions_1.sendTransactionWithRetryWithKeypair(anchorProgram.provider.connection, walletKeyPair, instructions, [], 'single')];
                case 1:
                    tx = _b.sent();
                    loglevel_1.default.debug('transaction for arweave payment:', tx);
                    data = new form_data_1.default();
                    data.append('transaction', tx['txid']);
                    data.append('env', env);
                    data.append('file[]', fs_1.default.createReadStream(image), {
                        filename: "image.png",
                        contentType: 'image/png',
                    });
                    data.append('file[]', manifestBuffer, 'metadata.json');
                    return [4 /*yield*/, upload(data, manifest, index)];
                case 2:
                    result = _b.sent();
                    metadataFile = (_a = result.messages) === null || _a === void 0 ? void 0 : _a.find(function (m) { return m.filename === 'manifest.json'; });
                    if (metadataFile === null || metadataFile === void 0 ? void 0 : metadataFile.transactionId) {
                        link = "https://arweave.net/" + metadataFile.transactionId;
                        loglevel_1.default.debug("File uploaded: " + link);
                        return [2 /*return*/, link];
                    }
                    else {
                        // @todo improve
                        throw new Error("No transaction ID for upload: " + index);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.arweaveUpload = arweaveUpload;
