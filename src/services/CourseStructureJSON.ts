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

import { BaseDatamodel, relationBDTOInstance, RelationModel, roleBDTOInstance } from "clm-core";
// import { toolBDTOInstance, ToolModel } from "clm-ext-tools";
import { spBDTOInstance } from "clm-ext-service_providers";
import LODAO from "../models/LO/LODAO";
import { toolBDTOInstance } from "../lib/toolBDTO";

/**
 * @public
 * Extends the tool datamodel
 */
// export type ExtendedTool = ToolModel & {
//     roles?: string[],
//     lrss?: string[],
//     rootUsername?: string,
//     rootPassword?: string
//     /**
//    * The id of the learning object where the tool is located
//    */
//     loId?: string
// }

/**
 * Course-structure of a specific user which extends {@link https://gitlab.fokus.fraunhofer.de/learning-technologies/clm-framework/clm-ext-tool/-/blob/dev/docs/clm-ext-tools.itoolmodel.md|ToolModel}
 * @public 
 */
export interface CourseStructure extends BaseDatamodel {
    /**
     * Icon Url of the learning object
     */
    iconUrl?: string;
    /**
     * Display name in the frontend
     */
    displayName: string;
    /**
     * Roles the user has on this learning object
     */
    roles?: string[],
    /**
     * LRS-Ids the user has access to 
     */
    lrss?: string[],
    /**
     * Optional children
     */
    children?: CourseStructure[],
    /**
     * The tool-datamodel + the roles/lrss of this specific course-structure
     */
    tool?: any,
    /*
    * The order of the learning object
    */
    order?: number


}

/**
 * Static class to retrieve the course structure of a specific user
 * @public
 */
export default class CourseStructreJSON {

    private static fillRecursiveLO(
        courseStructure: CourseStructure,
        allRelations: RelationModel[],
        visited: any,
        allLOs: any[],
        allTools: any[],
        role: string,
        lrsIds: string[],
        globalVisited = false
    ) {
        if (visited[courseStructure._id]) return
        visited[courseStructure._id] = true
        if (globalVisited) {
            courseStructure.roles = [...courseStructure.roles!, role]
            courseStructure.lrss = [...new Set([...courseStructure.lrss!, ...lrsIds])]
            if (courseStructure.tool) courseStructure.tool.roles = [...courseStructure.roles, role]
        } else {
            courseStructure.roles = [role]
            courseStructure.lrss = lrsIds
            courseStructure.children = []
        }
        const loHasLos = allRelations.filter((item) => (item.fromType === 'lo') && item.fromId === courseStructure._id)

        for (const loHaslo of loHasLos) {
            if (loHaslo.toType === 'lo') {
                let childLo = allLOs.find((item) => item._id === loHaslo.toId)
                childLo.order = loHaslo.order
                if (!globalVisited) courseStructure.children = [...courseStructure.children!, childLo]
                this.fillRecursiveLO(childLo, allRelations, visited, allLOs, allTools, role, lrsIds, globalVisited)
            } else {
                courseStructure.tool = allTools.find((item) => item._id === loHaslo.toId)!
                courseStructure.tool.roles = courseStructure.roles
                courseStructure.tool.lrss = lrsIds
            }

        }
        courseStructure.children = courseStructure.children?.sort((a, b) => a.order! - b.order!)
        return courseStructure
    }

    private static recursiveToolSearch(courseStructure: any, toolId: string): any {
        if (courseStructure.tool && courseStructure.tool._id === toolId) return courseStructure.tool

        for (const child of courseStructure.children) {
            let tool = this.recursiveToolSearch(child, toolId)
            if (tool) return tool
        }
    }

    /**
     * Get the course-structure of the user as JS/JSON by aggregating the user permission of
     *  the user to learning objects, lrss, groups (roles of groups).
     * @param userId - Id of the user
     * @param relations - Pre fill relations to enhance performance
     * @returns
     */
    static async getUserCourseStrucuture(userId: string, relations?: RelationModel[]) {

        const [usersGroups, allRelations, los, tools, services] = await Promise.all([
            relationBDTOInstance.getUsersGroups(userId),
            relations ?? relationBDTOInstance.findAll(),
            LODAO.findAll(),
            toolBDTOInstance.findAll(),
            spBDTOInstance.findAll()

        ])

        const userGroupsIds = usersGroups.map((item) => item._id);
        // let parentNodes: any[] = []

        let parentNodes: CourseStructure[] = []
        let globalVisited: { [key: string]: any } = {}
        for (const groupId of userGroupsIds) {
            const groupsHaveLOs = allRelations.filter((item) => item.toType === 'lo' && item.fromId === groupId)
                .sort((a, b) => a.order! - b.order!)
            const localVisited: { [key: string]: boolean } = {};
            const groupRole = allRelations.find((relation) => relation.toType === 'role' && relation.fromId === groupId)!.toId
            const role = await roleBDTOInstance.findById(groupRole)

            const serviceIds = allRelations.filter((relation) => relation.toType === 'service' && relation.fromId === groupId).map((relation) => relation.toId)
            const lrsIds = services.filter((service) => service.type === 'LRS' && serviceIds.includes(service._id)).map((lrs) => lrs._id);
            for (const groupHasLo of groupsHaveLOs) {
                let lo = los.find((lo) => lo._id === groupHasLo.toId)!
                // @ts-ignore
                lo.order = groupHasLo.order
                const recursiveLO = this.fillRecursiveLO(lo, allRelations, localVisited, los, tools, role.displayName, lrsIds, globalVisited[lo._id])
                if (!globalVisited[lo._id]) {
                    if (recursiveLO) {
                        parentNodes.push(recursiveLO)
                    } else {
                        let destroyIndex = parentNodes.findIndex((item: any) => item._id === lo._id)
                        if (destroyIndex > 0) parentNodes.splice(destroyIndex, 1)
                    }
                }
            }
            globalVisited = { ...globalVisited, ...localVisited }

        }
        return parentNodes.sort((a, b) => a.order! - b.order!);
    }

    /**
     * Gets the tool by user- and tool-id
     * @param userId - The id of the user 
     * @param toolId - The id of the tool
     * @returns 
     */
    static async getUserTool(userId: string, toolId: string): Promise<any | undefined> {
        const [services, relations] = await Promise.all([spBDTOInstance.findAll(), relationBDTOInstance.findAll()])
        const serviceOfToolRelation = relations.find((relation) => relation.toId === toolId && relation.fromType === 'service')
        let service = services.find((service) => service._id === serviceOfToolRelation?.fromId)
        const parentNodes = await this.getUserCourseStrucuture(userId, relations)
        for (const node of parentNodes) {
            let tool = this.recursiveToolSearch(node, toolId)
            if (tool) return { ...tool, rootUsername: service?.username, rootPassword: service?.password, loId: node._id }
        }
    }


}

