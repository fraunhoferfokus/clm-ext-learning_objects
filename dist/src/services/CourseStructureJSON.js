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
const clm_core_1 = require("clm-core");
// import { toolBDTOInstance, ToolModel } from "clm-ext-tools";
const clm_ext_service_providers_1 = require("clm-ext-service_providers");
const LODAO_1 = __importDefault(require("../models/LO/LODAO"));
const toolBDTO_1 = require("../lib/toolBDTO");
/**
 * Static class to retrieve the course structure of a specific user
 * @public
 */
class CourseStructreJSON {
    static fillRecursiveLO(courseStructure, allRelations, visited, allLOs, allTools, role, lrsIds, globalVisited = false) {
        var _a;
        if (visited[courseStructure._id])
            return;
        visited[courseStructure._id] = true;
        if (globalVisited) {
            courseStructure.roles = [...courseStructure.roles, role];
            courseStructure.lrss = [...new Set([...courseStructure.lrss, ...lrsIds])];
            if (courseStructure.tool)
                courseStructure.tool.roles = [...courseStructure.roles, role];
        }
        else {
            courseStructure.roles = [role];
            courseStructure.lrss = lrsIds;
            courseStructure.children = [];
        }
        const loHasLos = allRelations.filter((item) => (item.fromType === 'lo') && item.fromId === courseStructure._id);
        for (const loHaslo of loHasLos) {
            if (loHaslo.toType === 'lo') {
                let childLo = allLOs.find((item) => item._id === loHaslo.toId);
                childLo.order = loHaslo.order;
                if (!globalVisited)
                    courseStructure.children = [...courseStructure.children, childLo];
                this.fillRecursiveLO(childLo, allRelations, visited, allLOs, allTools, role, lrsIds, globalVisited);
            }
            else {
                courseStructure.tool = allTools.find((item) => item._id === loHaslo.toId);
                courseStructure.tool.roles = courseStructure.roles;
                courseStructure.tool.lrss = lrsIds;
            }
        }
        courseStructure.children = (_a = courseStructure.children) === null || _a === void 0 ? void 0 : _a.sort((a, b) => a.order - b.order);
        return courseStructure;
    }
    static recursiveToolSearch(courseStructure, toolId) {
        if (courseStructure.tool && courseStructure.tool._id === toolId)
            return courseStructure.tool;
        for (const child of courseStructure.children) {
            let tool = this.recursiveToolSearch(child, toolId);
            if (tool)
                return tool;
        }
    }
    /**
     * Get the course-structure of the user as JS/JSON by aggregating the user permission of
     *  the user to learning objects, lrss, groups (roles of groups).
     * @param userId - Id of the user
     * @param relations - Pre fill relations to enhance performance
     * @returns
     */
    static getUserCourseStrucuture(userId, relations) {
        return __awaiter(this, void 0, void 0, function* () {
            const [usersGroups, allRelations, los, tools, services] = yield Promise.all([
                clm_core_1.relationBDTOInstance.getUsersGroups(userId),
                relations !== null && relations !== void 0 ? relations : clm_core_1.relationBDTOInstance.findAll(),
                LODAO_1.default.findAll(),
                toolBDTO_1.toolBDTOInstance.findAll(),
                clm_ext_service_providers_1.spBDTOInstance.findAll()
            ]);
            const userGroupsIds = usersGroups.map((item) => item._id);
            // let parentNodes: any[] = []
            let parentNodes = [];
            let globalVisited = {};
            for (const groupId of userGroupsIds) {
                const groupsHaveLOs = allRelations.filter((item) => item.toType === 'lo' && item.fromId === groupId)
                    .sort((a, b) => a.order - b.order);
                const localVisited = {};
                const groupRole = allRelations.find((relation) => relation.toType === 'role' && relation.fromId === groupId).toId;
                const role = yield clm_core_1.roleBDTOInstance.findById(groupRole);
                const serviceIds = allRelations.filter((relation) => relation.toType === 'service' && relation.fromId === groupId).map((relation) => relation.toId);
                const lrsIds = services.filter((service) => service.type === 'LRS' && serviceIds.includes(service._id)).map((lrs) => lrs._id);
                for (const groupHasLo of groupsHaveLOs) {
                    let lo = los.find((lo) => lo._id === groupHasLo.toId);
                    // @ts-ignore
                    lo.order = groupHasLo.order;
                    const recursiveLO = this.fillRecursiveLO(lo, allRelations, localVisited, los, tools, role.displayName, lrsIds, globalVisited[lo._id]);
                    if (!globalVisited[lo._id]) {
                        if (recursiveLO) {
                            parentNodes.push(recursiveLO);
                        }
                        else {
                            let destroyIndex = parentNodes.findIndex((item) => item._id === lo._id);
                            if (destroyIndex > 0)
                                parentNodes.splice(destroyIndex, 1);
                        }
                    }
                }
                globalVisited = Object.assign(Object.assign({}, globalVisited), localVisited);
            }
            return parentNodes.sort((a, b) => a.order - b.order);
        });
    }
    /**
     * Gets the tool by user- and tool-id
     * @param userId - The id of the user
     * @param toolId - The id of the tool
     * @returns
     */
    static getUserTool(userId, toolId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [services, relations] = yield Promise.all([clm_ext_service_providers_1.spBDTOInstance.findAll(), clm_core_1.relationBDTOInstance.findAll()]);
            const serviceOfToolRelation = relations.find((relation) => relation.toId === toolId && relation.fromType === 'service');
            let service = services.find((service) => service._id === (serviceOfToolRelation === null || serviceOfToolRelation === void 0 ? void 0 : serviceOfToolRelation.fromId));
            const parentNodes = yield this.getUserCourseStrucuture(userId, relations);
            for (const node of parentNodes) {
                let tool = this.recursiveToolSearch(node, toolId);
                if (tool)
                    return Object.assign(Object.assign({}, tool), { rootUsername: service === null || service === void 0 ? void 0 : service.username, rootPassword: service === null || service === void 0 ? void 0 : service.password, loId: node._id });
            }
        });
    }
}
exports.default = CourseStructreJSON;
