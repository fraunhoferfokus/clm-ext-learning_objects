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

import express from 'express'
import { AuthGuard, BaseExtensionCtrl, RelationBDTO, relationBDTOInstance } from "clm-core"
import { convertJsonToCC } from '../services/IMSCCtransformer'
import CourseStructureJSON from '../services/CourseStructureJSON'
import xml2js, { Builder } from 'xml2js'
import { spBDTOInstance } from 'clm-ext-service_providers'
import { servicesVersion } from 'typescript'
import axios from 'axios'


const basePath = process.env.BASE_PATH || '/learningObjects';




class MgtmLOGroupExtensionCtrl extends BaseExtensionCtrl {

    getOwnCourseStructure(): express.Handler {
        return async (req, res, next) => {
            let accessToken: string = req.header('x-access-token')!;
            let includeMetadata = req.query.includeMetadata

            let opt = {
                setIds: true,
                accessToken,
                includeMetadata
                // tps: result.data,
            };

            const [parentNodes] = await Promise.all([
                CourseStructureJSON.getUserCourseStrucuture(req.requestingUser?._id!),
            ]
            );

            const json = await new Promise((resolve, reject) => {
                convertJsonToCC(parentNodes, opt, async (xml: any) => {
                    xml2js.parseString(xml, (err, result) => {

                        if (err) return res.json(err)
                        resolve(result)
                    })

                })

            })

            let builder = new xml2js.Builder();

            if (req.query.includeMetadata === 'true') {
                // await manipulate(json);
            }

            // return res.json(json)

            let xml = builder.buildObject(json)
            return res
                .type('application/xml')
                .status(200)
                .send(xml);







            // return res.json(result)


            // return res
            //     .type('application/xml')
            //     .send(xml)





        }
    }



}


// async function manipulate(struc: any) {
//     const organization = struc.manifest.organizations[0].organization[0]
//     const items = organization.item[0].item

//     for (let item of items) {

//         if (item.$) {
//             const cp: any = await createCP(item.$.identifierRef);

//             if (JSON.stringify(cp[0]['metadata'][0].lom) !== '{}') {
//                 struc.manifest.metadata.push({ metadata: [cp[0]['metadata'][0].lom] })

//             }
//         } else if (item.item) {
//             recursive(struc, item.item)
//         }


//     }
//     struc.manifest.metadata = struc.manifest.metadata
//     return struc

// }

async function recursive(struc: any, tree: any) {
    for (let item of tree) {
        if (item.item) recursive(struc, item.item)
        const resources = struc.manifest.resources[0].resource
        // add resouce to resources

        if (item.$) {
            resources.push({
                $: {
                    type: "imswl_xmlv1p3",
                },
                weblink: [
                    {
                        $: {
                            xmlns: "http://www.imsglobal.org/xsd/imsccv1p3/imswl_v1p3",
                            'xlmns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
                            'xsi:schemaLocation': "http://www.imsglobal.org/xsd/imsccv1p3/imswl_v1p3 http://www.imsglobal.org/profile/cc/ccv1p3/ccv1p3_imswl_v1p3.xsd"
                        },
                        url: [
                            {
                                $: {
                                    href: `${process.env.DEPLOY_URL}/learningObjects/${item.$.identifierRef}`
                                }
                            }
                        ]
                    },
                ]

            })
        }


    }
}







const controller = new MgtmLOGroupExtensionCtrl()
controller.router.use(AuthGuard.requireUserAuthentication({ sameUserAsId: true }))

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
controller.router.get('/', controller.getOwnCourseStructure())

export default controller;

