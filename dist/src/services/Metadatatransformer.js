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
// import { ToolModel, toolBDTOInstance } from "clm-ext-tools"
const axios_1 = __importDefault(require("axios"));
const xml2js_1 = __importDefault(require("xml2js"));
const toolBDTO_1 = require("../lib/toolBDTO");
function createMetdataForLO(loId) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27;
    return __awaiter(this, void 0, void 0, function* () {
        // LO findet alle LOs
        const los = yield LODAO_1.default.findAll();
        let lo = los.find(lo => lo._id === loId);
        if (!lo)
            throw new Error('LO not found');
        const relations = yield clm_core_1.relationBDTOInstance.findAll();
        const tools = yield toolBDTO_1.toolBDTOInstance.findAll();
        const metadataReference = tools.filter((tool) => tool.type === 'METADATA');
        let childs = getAllDescendingsChildsOfLodFlatMapped(Object.assign(Object.assign({}, lo), { root: true }), relations, los, tools).filter((metadata) => relations.find((relation) => relation.fromType === 'tool' &&
            relation.toType === 'lo' &&
            relation.toId === metadata._id));
        let metadataPromise = [];
        for (let child of childs) {
            let hasMetadata = relations.find((relation) => relation.fromType === 'tool' && relation.toType === 'lo' && relation.toId === child._id);
            let tool = metadataReference.find((tool) => tool._id === hasMetadata.fromId);
            const promise = axios_1.default.get(tool.launchableUrl)
                .then((result) => result.data)
                .then((data) => xml2js_1.default.parseStringPromise(data))
                .then((lom) => {
                if (child.root)
                    lom['root'] = true;
                return lom;
            });
            metadataPromise.push(promise);
        }
        let metadata = yield Promise.all(metadataPromise);
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
            ],
            "annotation": [
                {
                    entity: ["https://dash.fokus.fraunhofer.de/tests/tan/media/n21/default.png"],
                    date: [],
                    description: ["default picture"]
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
            if ((_8 = manifestRoot === null || manifestRoot === void 0 ? void 0 : manifestRoot.lom) === null || _8 === void 0 ? void 0 : _8.annotation) {
                build.annotation[0] = (_9 = manifestRoot === null || manifestRoot === void 0 ? void 0 : manifestRoot.lom) === null || _9 === void 0 ? void 0 : _9.annotation[0];
            }
            // metadata = metadata.filter((lom) => !lom.root)
        }
        // let taxonSet = new Set()
        // for (let singleMetadata of metadata) {
        //     // classification
        //     if (singleMetadata?.lom?.classification?.[0]?.taxonPath?.[0]?.taxon) {
        //         for (let taxon of singleMetadata?.lom?.classification?.[0]?.taxonPath?.[0]?.taxon) {
        //             let taxonId = taxon.id[0]
        //             if (!taxonSet.has(taxonId)) {
        //                 taxonSet.add(taxonId)
        //                 build.classification[0].taxonPath[0].taxon.push(taxon)
        //             }
        //         }
        //     }
        //     build.classification[0].taxonPath[0].taxon.push()
        //     // add typical learning time to educational
        //     let typicalLearningTimeOfSingle = singleMetadata?.lom?.educational?.[0]?.typicalLearningTime?.[0]?.duration?.[0]
        //     if (typicalLearningTimeOfSingle) {
        //         if (!build.educational[0].typicalLearningTime[0].duration[0]) {
        //             build.educational[0].typicalLearningTime[0].duration[0] = typicalLearningTimeOfSingle
        //         }
        //         else {
        //             build.educational[0].typicalLearningTime[0].duration[0] = addDurations(build.educational[0].typicalLearningTime[0].duration[0], typicalLearningTimeOfSingle)
        //         }
        //     }
        //     // build.educational[0].typicalLearningTime[0] = 
        // }
        let taxonSet = new Map(); // Map, um Taxon-ID mit Relation-Index zu speichern
        let pointer = 0;
        for (let singleMetadata of metadata) {
            if ((_14 = (_13 = (_12 = (_11 = (_10 = singleMetadata === null || singleMetadata === void 0 ? void 0 : singleMetadata.lom) === null || _10 === void 0 ? void 0 : _10.classification) === null || _11 === void 0 ? void 0 : _11[0]) === null || _12 === void 0 ? void 0 : _12.taxonPath) === null || _13 === void 0 ? void 0 : _13[0]) === null || _14 === void 0 ? void 0 : _14.taxon) {
                for (let taxon of (_19 = (_18 = (_17 = (_16 = (_15 = singleMetadata === null || singleMetadata === void 0 ? void 0 : singleMetadata.lom) === null || _15 === void 0 ? void 0 : _15.classification) === null || _16 === void 0 ? void 0 : _16[0]) === null || _17 === void 0 ? void 0 : _17.taxonPath) === null || _18 === void 0 ? void 0 : _18[0]) === null || _19 === void 0 ? void 0 : _19.taxon) {
                    let taxonId = taxon.id[0];
                    let courseDetails = childs[pointer]; // Hole die Kurs-ID aus `childs` basierend auf dem Pointer
                    if (!taxonSet.has(taxonId)) {
                        // Neues Taxon und neue Relation erstellen
                        let relationIndex = build.relation.length; // Index der neuen Relation speichern
                        taxonSet.set(taxonId, relationIndex);
                        build.relation.push({
                            kind: {
                                source: ["LOMv1.0"],
                                value: ["isRelatedTo"]
                            },
                            resource: {
                                identifier: {
                                    catalog: "TaxonID",
                                    entry: taxonId
                                },
                                description: {
                                    string: [`Relation zu Taxon: ${((_21 = (_20 = taxon.entry) === null || _20 === void 0 ? void 0 : _20[0]) === null || _21 === void 0 ? void 0 : _21.string) || "Unbekannt"}`]
                                },
                                relatedCourses: [
                                    { courseId: courseDetails._id }
                                ]
                            }
                        });
                        build.classification[0].taxonPath[0].taxon.push(taxon);
                    }
                    else {
                        // Existierende Relation aktualisieren
                        let relationIndex = taxonSet.get(taxonId); // Index der existierenden Relation abrufen
                        let existingRelation = build.relation[relationIndex];
                        // Kurs-ID hinzufügen, falls sie noch nicht existiert
                        let existingCourseIds = existingRelation.resource.relatedCourses.map((course) => course.courseId);
                        if (!existingCourseIds.includes(courseDetails)) {
                            existingRelation.resource.relatedCourses.push({ courseId: courseDetails === null || courseDetails === void 0 ? void 0 : courseDetails._id });
                        }
                    }
                }
            }
            build.classification[0].taxonPath[0].taxon.push();
            // add typical learning time to educational
            let typicalLearningTimeOfSingle = (_27 = (_26 = (_25 = (_24 = (_23 = (_22 = singleMetadata === null || singleMetadata === void 0 ? void 0 : singleMetadata.lom) === null || _22 === void 0 ? void 0 : _22.educational) === null || _23 === void 0 ? void 0 : _23[0]) === null || _24 === void 0 ? void 0 : _24.typicalLearningTime) === null || _25 === void 0 ? void 0 : _25[0]) === null || _26 === void 0 ? void 0 : _26.duration) === null || _27 === void 0 ? void 0 : _27[0];
            if (typicalLearningTimeOfSingle) {
                if (!build.educational[0].typicalLearningTime[0].duration[0]) {
                    build.educational[0].typicalLearningTime[0].duration[0] = typicalLearningTimeOfSingle;
                }
                else {
                    build.educational[0].typicalLearningTime[0].duration[0] = addDurations(build.educational[0].typicalLearningTime[0].duration[0], typicalLearningTimeOfSingle);
                }
            }
            // build.educational[0].typicalLearningTime[0] = 
            pointer++;
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
function getAllDescendingsChildsOfLodFlatMapped(lo, relations, allLos, tools, excludeSelf = false) {
    const descendings = relations.filter(relation => relation.fromId === lo._id && (relation.toType === 'lo'));
    const loHasTool = relations.find((relation) => relation.fromId === lo._id && (relation.toType === 'tool'));
    const childs = descendings.map(descending => getAllDescendingsChildsOfLodFlatMapped(allLos.find((lo) => lo._id === descending.toId), relations, allLos, tools)).flat(1);
    if (!excludeSelf)
        childs.push(lo);
    if (loHasTool)
        childs.push(tools.find((tool) => tool._id === loHasTool.toId));
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
    return toDurationString(totalSeconds);
}
