"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolBDTOInstance = void 0;
// const ADMIN_ID = process.env.ADMIN_ID || "admin@localhost.tld"
const axios_1 = __importDefault(require("axios"));
const clm_core_1 = require("clm-core");
const DEPLOY_URL = process.env.GATEWAY_URL || process.env.DEPLOY_URL;
const API_TOKEN = process.env.API_TOKEN || 'MGMT_SERVICE';
class ToolBDTO {
    constructor() {
        this.createAccessToken = () => __awaiter(this, void 0, void 0, function* () {
            let user = (yield clm_core_1.userBDTOInstance.findAll()).find((user) => user.isSuperAdmin);
            let token = yield clm_core_1.jwtServiceInstance.createToken(Object.assign({}, user), '2555d');
            this.token = token;
        });
        this.findAll = () => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.token)
                    yield this.createAccessToken();
                const resp = yield axios_1.default.get(`${DEPLOY_URL}/tools/mgmt/tools`, {
                    headers: {
                        authorization: `Bearer ${API_TOKEN}`,
                        'x-access-token': this.token
                    }
                });
                return resp.data;
            }
            catch (err) {
                throw err;
            }
        });
        this.token = '';
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tools = yield this.findAll();
                const tool = tools.find((tool) => tool._id === id);
                if (!tool)
                    throw { status: 404, message: `Tool with that id not found: ${id}` };
                return tool;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.toolBDTOInstance = new ToolBDTO();
