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
exports.getIMSCCForUser = void 0;
const clm_core_1 = require("clm-core");
const IMSCCtransformer_1 = require("../services/IMSCCtransformer");
const CourseStructureJSON_1 = __importDefault(require("../services/CourseStructureJSON"));
const xml2js_1 = __importDefault(require("xml2js"));
const basePath = process.env.BASE_PATH || '/learningObjects';
class MgtmLOGroupExtensionCtrl extends clm_core_1.BaseExtensionCtrl {
    getOwnCourseStructure() {
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.requestingUser._id;
            let json = yield getIMSCCForUser(userId);
            let builder = new xml2js_1.default.Builder();
            let xml = builder.buildObject(json);
            return res
                .type('application/xml')
                .status(200)
                .send(xml);
        });
    }
}
function getIMSCCForUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield clm_core_1.userBDTOInstance.findById(userId);
        let [accessToken, _] = yield clm_core_1.jwtServiceInstance.createAccessAndRefreshToken(user);
        let opt = {
            setIds: true,
            accessToken,
        };
        const [parentNodes] = yield Promise.all([
            CourseStructureJSON_1.default.getUserCourseStrucuture(userId),
        ]);
        const json = yield new Promise((resolve, reject) => {
            (0, IMSCCtransformer_1.convertJsonToCC)(parentNodes, opt, (xml) => __awaiter(this, void 0, void 0, function* () {
                xml2js_1.default.parseString(xml, (err, result) => {
                    if (err)
                        reject(err);
                    resolve(result);
                });
            }));
        });
        return json;
    });
}
exports.getIMSCCForUser = getIMSCCForUser;
const controller = new MgtmLOGroupExtensionCtrl();
controller.router.use(clm_core_1.AuthGuard.requireUserAuthentication());
/**
 * @openapi
 * components:
 *   schemas:
 *     CourseStructure:
 *       type: object
 *       description: The course-structure of a tool provider
 *       properties:
 *         organisations:
 *           type: object
 *           description: root element. Contains courses
 *           properties:
 *             item:
 *               type: object
 *               description: Each item describes a learning unit. It either has a tool or another item
 *               properties:
 *                 title:
 *                   type: string
 *                   description: Title of the learning unit. Every 'item' must have a title
 *                   example: "<title>Einführung</title>"
 *                 tool:
 *                   type: string
 *                   description: contains id as xml-attribute which points to a tool in resources
 *                   example: "<tool identifier='fb763566-4c90-412f-a3e6-bd5ae776d960'/>"
 *         resources:
 *           type: object
 *           description: Here are all the tool informations.
 *           properties:
 *             resource:
 *               type: object
 *               description: represents information of a single tool. Identifier from tool points here and is a xml-attribute
 *               properties:
 *                 toolId:
 *                   type: string
 *                   description: the tool Id of the provider
 *                   example: "12345"
 *                 providerId:
 *                   type: string
 *                   description: the provider which offer the tool-content!
 *                   example: "toolprovider-edx"
 *                 target:
 *                   type: string
 *                   description: describes how to open the tool
 *                   example: "iframe"
 *
 * paths:
 *   /learningObjects/users/me/courses:  # Replace with your actual basePath value
 *     get:
 *       summary: Returns Course-Structure of a logged in user
 *       description: Get's the course structure of a tool-provider in XML-Common-Cartridge. Currently Swagger has problems displaying XML-Examples. Get the real example from the endpoint please.
 *       tags:
 *         - pblc
 *       parameters:
 *         - $ref: '#/components/parameters/accessToken'
 *       responses:
 *         200:
 *           description: Successful operation, The course-structure of that TP is shown in XML. 'Example Value' has problems rendering xml data, please get data from the route for a real example
 *           content:
 *             application/json:
 *               schema:
 *                 properties:
 *                   V2/courseStructure:
 *                     type: array
 *                     items:
 *                       $ref: "#/components/schemas/CourseStructure"
 *   /learningObjects/users/{userId}/courses:  # Replace with your actual basePath value
 *     get:
 *       summary: Returns Course-Structure of a logged in user
 *       description: Get's the course structure of a tool-provider in XML-Common-Cartridge. Currently Swagger has problems displaying XML-Examples. Get the real example from the endpoint please.
 *       tags:
 *         - pblc
 *       parameters:
 *         - $ref: '#/components/parameters/accessToken'
 *         - in: path
 *           name: userId
 *           description: Id of the user
 *           example: userId
 *           required: true
 *           schema:
 *              type: string
 *
 *         - in: query
 *           name: includeMetadata
 *           description: If true, the metadata of the tool will be included in the XML (defaults to false)
 *           example: false
 *           schema:
 *              type: boolean
 *       responses:
 *         200:
 *           description: Successful operation, The course-structure of that TP is shown in XML. 'Example Value' has problems rendering xml data, please get data from the route for a real example
 *           content:
 *             application/json:
 *               schema:
 *                 properties:
 *                   V2/courseStructure:
 *                     type: array
 *                     items:
 *                       $ref: "#/components/schemas/CourseStructure"
 */
controller.router.get('/', controller.getOwnCourseStructure());
exports.default = controller;
