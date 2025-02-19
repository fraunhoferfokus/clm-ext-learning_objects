"use strict";
/* -----------------------------------------------------------------------------
 *  Copyright (c) 2023, Fraunhofer-Gesellschaft zur Förderung der angewandten Forschung e.V.
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, version 3.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 *  No Patent Rights, Trademark Rights and/or other Intellectual Property
 *  Rights other than the rights under this license are granted.
 *  All other rights reserved.
 *
 *  For any other rights, a separate agreement needs to be closed.
 *
 *  For more information please contact:
 *  Fraunhofer FOKUS
 *  Kaiserin-Augusta-Allee 31
 *  10589 Berlin, Germany
 *  https://www.fokus.fraunhofer.de/go/fame
 *  famecontact@fokus.fraunhofer.de
 * -----------------------------------------------------------------------------
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertJsonToCC = void 0;
const xml2js_1 = __importDefault(require("xml2js"));
const getTools = (courses, options, cb) => {
    let tools = [];
    function convertToOne(array) {
        let modifiedAry = [];
        array.forEach((topEle) => {
            topEle.forEach((innerEle) => {
                modifiedAry.push(innerEle);
            });
        });
        return modifiedAry;
    }
    function oldJsonToCCString(oldJson, cb) {
        for (let i = 0; i < oldJson.length; i++) {
            tools.push(rekursivChildren(oldJson[i]));
        }
        cb();
    }
    function rekursivChildren(treeStructure) {
        let aryTools = [];
        if (treeStructure.tool != null) {
            let tool = treeStructure.tool;
            const id = treeStructure._id;
            if (options === null || options === void 0 ? void 0 : options.imsCC) {
                delete treeStructure.tool.target;
            }
            if ('icon_url' in treeStructure) {
                treeStructure.tool.icon = treeStructure.icon_url;
                delete treeStructure.icon_url;
            }
            if ('roles' in treeStructure) {
                if (!(options === null || options === void 0 ? void 0 : options.imsCC)) {
                    treeStructure.tool.roles = treeStructure.roles;
                }
                delete treeStructure.roles;
            }
            if ('_rev' in treeStructure) {
                delete treeStructure._rev;
            }
            if ('title' in treeStructure) {
                treeStructure.tool.title = treeStructure.title;
            }
            if ('_id' in treeStructure) {
                delete treeStructure._id;
            }
            if ('type' in treeStructure) {
                delete treeStructure.type;
            }
            if (tool) {
                if ('username' in tool) {
                    delete tool.username;
                }
                if ('password' in tool) {
                    delete tool.password;
                }
                if ('rootPassword' in tool) {
                    delete tool.rootPassword;
                }
                if ('rootUsername' in tool) {
                    delete tool.rootUsername;
                }
                if ('launchableUrl' in tool) {
                    delete tool.launchableUrl;
                }
                if ('_rev' in tool) {
                    delete tool._rev;
                }
                if ('authType' in tool) {
                    delete tool.authType;
                }
                if ('type' in tool) {
                    switch (tool.type) {
                        case 'LTI11':
                            treeStructure.launchType = 'lti11';
                            break;
                        case 'LTI13':
                            treeStructure.launchType = 'lti13';
                            break;
                        case 'CMI5':
                            treeStructure.launchType = 'cmi5';
                            break;
                        default:
                            break;
                    }
                    // treeStructure.launchType = 'lti13';
                    // } else {
                    // treeStructure.launchType = 'lti11';
                }
            }
            treeStructure.tool.$ = {
                identifier: id,
            };
            let copy = Object.assign(Object.assign({}, treeStructure.tool), { launchType: treeStructure.launchType });
            if (options === null || options === void 0 ? void 0 : options.imsCC) {
                delete copy.providerId;
                delete copy.toolId;
            }
            for (let prop in copy) {
                if (prop !== '$') {
                    copy[`blti:${prop}`] = copy[prop];
                    delete copy[prop];
                }
            }
            let expandedCopy = {
                $: {
                    type: 'imsbasiclti_xmlv1p0',
                    identifier: id,
                },
                cartridge_basiclti_link: Object.assign(Object.assign({}, copy), { 'blti:oauth_consumer_key': options.accessToken, launch_url: `${process.env.DEPLOY_URL ||
                        'http://localhost:8010'}/launch/${tool._id}`, 'blti:launch_url': `${process.env.DEPLOY_URL ||
                        'http://localhost:8010'}/launch/${tool._id}`, 'blti:secure_launch_url': `${process.env.DEPLOY_URL ||
                        'http://localhost:8010'}/launch/${tool._id}`, storage_access: tool.storageAccess, target: tool.target, $: {
                        'xsi:schemaLocation': 'http://www.imsglobal.org/xsd/imslticc_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticc_v1p0.xsd http://www.imsglobal.org/xsd/imsbasiclti_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imsbasiclti_v1p0p1.xsd http://www.imsglobal.org/xsd/imslticm_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticm_v1p0.xsd http://www.imsglobal.org/xsd/imslticp_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticp_v1p0.xsd',
                        xmlns: 'http://www.imsglobal.org/xsd/imslticc_v1p0',
                        'xmlns:blti': 'http://www.imsglobal.org/xsd/imsbasiclti_v1p0',
                        'xmlns:lticm': 'http://www.imsglobal.org/xsd/imslticm_v1p0',
                        'xmlns:lticp': 'http://www.imsglobal.org/xsd/imslticp_v1p0',
                        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                    } }),
            };
            aryTools.push(expandedCopy);
            treeStructure.$ = {
                identifierRef: id,
            };
            delete treeStructure.tool;
        }
        else {
            if ('icon_url' in treeStructure) {
                treeStructure.icon = treeStructure.icon_url;
                delete treeStructure.icon_url;
            }
            if ('type' in treeStructure) {
                delete treeStructure.type;
            }
            if ('roles' in treeStructure) {
                delete treeStructure.roles;
            }
            if ('_rev' in treeStructure) {
                delete treeStructure._rev;
            }
            if (options === null || options === void 0 ? void 0 : options.imsCC) {
                delete treeStructure._id;
            }
            delete treeStructure.tool;
        }
        if (treeStructure.children) {
            for (let i = 0; i < treeStructure.children.length; i++) {
                aryTools = aryTools.concat(rekursivChildren(treeStructure.children[i]));
            }
        }
        return aryTools.filter((ele) => ele != null);
    }
    oldJsonToCCString(courses, () => {
        cb(convertToOne(tools));
    });
};
const convertJsonToCC = (courses, options, cb) => {
    function createXML(completeCourseStructure, allTools) {
        let organisationBuilder = new xml2js_1.default.Builder();
        // Prepare CC-Structure of organisation
        completeCourseStructure = {
            item: completeCourseStructure,
        };
        allTools = {
            resource: allTools,
        };
        let finalXML = {
            manifest: {
                metadata: {
                    schema: 'IMS Common Cartridge Thin',
                    schemaversion: '1.3.0',
                },
                organizations: {
                    organization: {
                        $: {
                            identifier: 'Org1',
                            structure: 'rooted-hierarchy',
                        },
                        item: completeCourseStructure,
                    },
                },
                resources: Object.assign({}, allTools),
            },
        };
        let organisationsCC = organisationBuilder.buildObject(finalXML);
        organisationsCC = organisationsCC.replace(/children/g, 'item');
        return organisationsCC;
    }
    getTools(courses, options, (tools) => {
        const xml = createXML(courses, tools);
        cb(xml);
    });
};
exports.convertJsonToCC = convertJsonToCC;
