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
exports.createMetdataForLO = void 0;
const clm_core_1 = require("clm-core");
const LODAO_1 = __importDefault(require("../models/LO/LODAO"));
const clm_ext_tools_1 = require("clm-ext-tools");
const axios_1 = __importDefault(require("axios"));
const xml2js_1 = __importDefault(require("xml2js"));
function createMetdataForLO(loId) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19;
    return __awaiter(this, void 0, void 0, function* () {
        const los = yield LODAO_1.default.findAll();
        let lo = los.find(lo => lo._id === loId);
        if (!lo)
            throw new Error('LO not found');
        const relations = yield clm_core_1.relationBDTOInstance.findAll();
        const tools = (yield clm_ext_tools_1.toolBDTOInstance.findAll()).filter((tool) => tool.type === 'METADATA');
        const childs = getAllDescendingsChildsOfLodFlatMapped(Object.assign(Object.assign({}, lo), { root: true }), relations, los);
        let metadata = [];
        for (let child of childs) {
            let hasMetadata = relations.find((relation) => relation.fromType === 'tool' && relation.toType === 'lo' && relation.toId === child._id);
            if (hasMetadata) {
                let tool = tools.find((tool) => tool._id === hasMetadata.fromId);
                // fetch lom from tool
                const result = (yield axios_1.default.get(tool.launchableUrl));
                const lom = yield xml2js_1.default.parseStringPromise(result.data);
                if (child.root)
                    lom['root'] = true;
                // add lom to manifest
                metadata.push(lom);
            }
        }
        let build = {
            "$": {
                "xmlns": "http://ltsc.ieee.org/xsd/LOM"
            },
            "general": [
                {
                    "identifier": [],
                    "title": [],
                    "language": [],
                    "description": [
                        {
                            "string": []
                        }
                    ]
                }
            ],
            "educational": [
                {
                    "interactivityType": [
                        {
                            "source": [],
                            "value": []
                        }
                    ],
                    "learningResourceType": [
                        {
                            "source": [],
                            "value": []
                        }
                    ],
                    "interactivityLevel": [
                        {
                            "source": [],
                            "value": []
                        }
                    ],
                    "semanticDensity": [
                        {
                            "source": [],
                            "value": []
                        }
                    ],
                    "difficulty": [
                        {
                            "source": [],
                            "value": []
                        }
                    ],
                    "typicalLearningTime": [
                        {
                            "duration": []
                        }
                    ]
                }
            ],
            "relation": [],
            "classification": [
                {
                    "purpose": [
                        {
                            "source": [
                                "LOMv1.0"
                            ],
                            "value": [
                                "educational objective"
                            ]
                        }
                    ],
                    "taxonPath": [
                        {
                            "taxon": []
                        }
                    ]
                }
            ]
        };
        let manifestRoot = metadata.find((lom) => lom.root);
        if (manifestRoot) {
            build.general[0].identifier[0] = (_d = (_c = (_b = (_a = manifestRoot === null || manifestRoot === void 0 ? void 0 : manifestRoot.lom) === null || _a === void 0 ? void 0 : _a.general) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.identifier) === null || _d === void 0 ? void 0 : _d[0];
            build.general[0].title[0] = (_h = (_g = (_f = (_e = manifestRoot === null || manifestRoot === void 0 ? void 0 : manifestRoot.lom) === null || _e === void 0 ? void 0 : _e.general) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.title) === null || _h === void 0 ? void 0 : _h[0];
            build.general[0].description[0] = (_m = (_l = (_k = (_j = manifestRoot === null || manifestRoot === void 0 ? void 0 : manifestRoot.lom) === null || _j === void 0 ? void 0 : _j.general) === null || _k === void 0 ? void 0 : _k[0]) === null || _l === void 0 ? void 0 : _l.description) === null || _m === void 0 ? void 0 : _m[0];
            // interactivity type
            build.educational[0].interactivityType[0] = (_r = (_q = (_p = (_o = manifestRoot === null || manifestRoot === void 0 ? void 0 : manifestRoot.lom) === null || _o === void 0 ? void 0 : _o.educational) === null || _p === void 0 ? void 0 : _p[0]) === null || _q === void 0 ? void 0 : _q.interactivityType) === null || _r === void 0 ? void 0 : _r[0];
            build.educational[0].learningResourceType[0] = (_v = (_u = (_t = (_s = manifestRoot === null || manifestRoot === void 0 ? void 0 : manifestRoot.lom) === null || _s === void 0 ? void 0 : _s.educational) === null || _t === void 0 ? void 0 : _t[0]) === null || _u === void 0 ? void 0 : _u.learningResourceType) === null || _v === void 0 ? void 0 : _v[0];
            build.educational[0].interactivityLevel[0] = (_z = (_y = (_x = (_w = manifestRoot === null || manifestRoot === void 0 ? void 0 : manifestRoot.lom) === null || _w === void 0 ? void 0 : _w.educational) === null || _x === void 0 ? void 0 : _x[0]) === null || _y === void 0 ? void 0 : _y.interactivityLevel) === null || _z === void 0 ? void 0 : _z[0];
            build.educational[0].semanticDensity[0] = (_3 = (_2 = (_1 = (_0 = manifestRoot === null || manifestRoot === void 0 ? void 0 : manifestRoot.lom) === null || _0 === void 0 ? void 0 : _0.educational) === null || _1 === void 0 ? void 0 : _1[0]) === null || _2 === void 0 ? void 0 : _2.semanticDensity) === null || _3 === void 0 ? void 0 : _3[0];
            build.educational[0].difficulty[0] = (_7 = (_6 = (_5 = (_4 = manifestRoot === null || manifestRoot === void 0 ? void 0 : manifestRoot.lom) === null || _4 === void 0 ? void 0 : _4.educational) === null || _5 === void 0 ? void 0 : _5[0]) === null || _6 === void 0 ? void 0 : _6.difficulty) === null || _7 === void 0 ? void 0 : _7[0];
            // metadata = metadata.filter((lom) => !lom.root)
        }
        for (let singleMetadata of metadata) {
            // classification
            build.classification[0].taxonPath[0].taxon.push((_13 = (_12 = (_11 = (_10 = (_9 = (_8 = singleMetadata === null || singleMetadata === void 0 ? void 0 : singleMetadata.lom) === null || _8 === void 0 ? void 0 : _8.classification) === null || _9 === void 0 ? void 0 : _9[0]) === null || _10 === void 0 ? void 0 : _10.taxonPath) === null || _11 === void 0 ? void 0 : _11[0]) === null || _12 === void 0 ? void 0 : _12.taxon) === null || _13 === void 0 ? void 0 : _13[0]);
            // add typical learning time to educational
            let typicalLearningTimeOfSingle = (_19 = (_18 = (_17 = (_16 = (_15 = (_14 = singleMetadata === null || singleMetadata === void 0 ? void 0 : singleMetadata.lom) === null || _14 === void 0 ? void 0 : _14.educational) === null || _15 === void 0 ? void 0 : _15[0]) === null || _16 === void 0 ? void 0 : _16.typicalLearningTime) === null || _17 === void 0 ? void 0 : _17[0]) === null || _18 === void 0 ? void 0 : _18.duration) === null || _19 === void 0 ? void 0 : _19[0];
            if (typicalLearningTimeOfSingle) {
                if (!build.educational[0].typicalLearningTime[0].duration[0]) {
                    build.educational[0].typicalLearningTime[0].duration[0] = typicalLearningTimeOfSingle;
                }
                else {
                    build.educational[0].typicalLearningTime[0].duration[0] = addDurations(build.educational[0].typicalLearningTime[0].duration[0], typicalLearningTimeOfSingle);
                }
            }
            // build.educational[0].typicalLearningTime[0] = 
        }
        let manifest = [{
                $: {
                    xmlns: "http://www.imsglobal.org/xsd/imsccv1p3/imscp_v1p1",
                    'xmlns:lom': "http://ltsc.ieee.org/xsd/imsccv1p3/LOM/resource",
                    'xmlns:lomimscc': "http://ltsc.ieee.org/xsd/imsccv1p3/LOM/manifest",
                    'xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
                    'xsi:schemaLocation': " http://www.imsglobal.org/xsd/imsccv1p3/imscp_v1p1 http://www.imsglobal.org/profile/cc/ccv1p3/ccv1p3_imscp_v1p1_v1p0.xsd http://ltsc.ieee.org/xsd/imsccv1p3/LOM/resource http://www.imsglobal.org/profile/cc/ccv1p3/LOM/ccv1p3_lomresource_v1p0.xsd http://ltsc.ieee.org/xsd/imsccv1p3/LOM/manifest http://www.imsglobal.org/profile/cc/ccv1p2/LOM/ccv1p3_lommanifest_v1p0.xsd",
                },
                metadata: [
                    {
                        schema: [
                            'IMS Common Cartridge'
                        ],
                        schemaversion: [
                            '1.3.0'
                        ],
                        lom: build
                    }
                ]
            }];
        return manifest;
    });
}
exports.createMetdataForLO = createMetdataForLO;
function getAllDescendingsChildsOfLodFlatMapped(lo, relations, allLos, excludeSelf = false) {
    const descendings = relations.filter(relation => relation.fromId === lo._id && relation.toType === 'lo');
    const childs = descendings.map(descending => getAllDescendingsChildsOfLodFlatMapped(allLos.find((lo) => lo._id === descending.toId), relations, allLos)).flat(1);
    if (!excludeSelf)
        childs.push(lo);
    return childs;
}
function addDurations(duration1, duration2) {
    const parseDuration = (duration) => {
        const regex = /P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/;
        //@ts-ignore
        const parts = duration.match(regex).slice(1);
        return {
            days: parseInt(parts[0]) || 0,
            hours: parseInt(parts[1]) || 0,
            minutes: parseInt(parts[2]) || 0,
            seconds: parseInt(parts[3]) || 0,
        };
    };
    const toSeconds = ({ days, hours, minutes, seconds }) => days * 86400 + hours * 3600 + minutes * 60 + seconds;
    const toDurationString = (totalSeconds) => {
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `P${days ? `${days}D` : ''}${hours || minutes || seconds ? `T${hours ? `${hours}H` : ''}${minutes ? `${minutes}M` : ''}${seconds ? `${seconds}S` : ''}` : ''}`;
    };
    const duration1Seconds = toSeconds(parseDuration(duration1));
    const duration2Seconds = toSeconds(parseDuration(duration2));
    const totalSeconds = duration1Seconds + duration2Seconds;
    console.log({ seconds: toDurationString(totalSeconds) });
    return toDurationString(totalSeconds);
}
