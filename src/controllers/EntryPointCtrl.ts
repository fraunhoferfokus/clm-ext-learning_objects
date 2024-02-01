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
import { AuthGuard } from "clm-core"
import MgtmLOCtrl from './MgtmLOCtrl'
import UserLOExtensionCtrl from './UserLOExtensionCtrl'
import MgtmLOGroupExtension from './MgtmLOGroupExtensionCtrl'
import xml2js, { Builder } from 'xml2js'
import swaggerJsdoc from 'swagger-jsdoc'
import { createMetdataForLO } from '../services/Metadatatransformer'
/**
 * @openapi
 * components:
 *   schemas:
 *     relation:
 *       type: object
 *       properties:
 *         fromType:
 *           type: string
 *           description: The type of the node
 *           default: fromTypeNode
 *         toType:
 *           type: string
 *           description: The type of the target node
 *           default: toTypeNode
 *         fromId:
 *           type: string
 *           description: The id of the node
 *           default: fromNodeId
 *         toId:
 *           type: string
 *           description: The id of the target node
 *           default: toNodeId
 *         order:
 *           type: number
 *           description: The order of the relation. Used for example ordering the enrollments of a group/user
 *           default: 0
 *   parameters:
 *     accessToken:
 *       name: x-access-token
 *       in: header
 *       description: The access token
 *       required: true
 *       example: exampleAccessToken
 *       schema:
 *         type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *     refreshAuth:
 *       type: apiKey
 *       in: header
 *       name: x-refresh-token
 */

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CLM-EXT-Learning-objects API',
            version: '1.0.0',
            description: 'API endpoints the clm-ext-learning_objects module offers',
        },
        servers: [
            {
                "url": "{scheme}://{hostname}:{port}{path}",
                "description": "The production API server",
                "variables": {
                    "hostname": {
                        "default": "localhost",
                    },
                    "port": {
                        "default": `${process.env.PORT}`
                    },
                    "path": {
                        "default": ""
                    },
                    "scheme": {
                        "default": "http",
                    }
                }
            }
        ],
        security: [{
            bearerAuth: [],
        }]
    },
    apis: [
        './src/controllers/*.ts'
    ]
}
const swaggerSpecification = swaggerJsdoc(options)
const router = express.Router()

const basePath = process.env.BASE_PATH || '/learningObjects';
const ECLUDED_PATHS: string[] = [
    `${basePath}/users/:id/courses/:id`,
    `${basePath}/:id`,
    `${basePath}/swagger`
]
router.use(AuthGuard.requireAPIToken(ECLUDED_PATHS))


/**
 * @openapi
 * paths:
 *   /learningObjects/{loId}/metadata:  # Replace with your actual basePath value
 *     get:
 *       summary: Returns Course-Structure of a logged in user
 *       description: Get's the course structure of a tool-provider in XML-Common-Cartridge. Currently Swagger has problems displaying XML-Examples. Get the real example from the endpoint please.
 *       tags:
 *         - pblc
 *       parameters:
 *          - in: path
 *            name: loId
 *            description: Id of the learning object
 *            example: loId
 *            required: true
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
router.get('/:id/metadata', async (req, res, next) => {

    try {
        let builder = new xml2js.Builder({
            rootName: 'manifest',
        });
        let metadata = await createMetdataForLO(req.params.id)

        const xml = builder.buildObject(metadata[0])

        return res
            .type('application/xml')
            .status(200)
            .send(xml);

    } catch (err) {
        console.log(err)
        return next(err)
    }

})
router.use('/users/me/courses', UserLOExtensionCtrl.router)
router.use('/users/:id/courses', UserLOExtensionCtrl.router)
router.use('/mgmt', MgtmLOCtrl.router)
router.use('/mgmt/groups', MgtmLOGroupExtension.router)
router.use('/swagger', (req, res, next) => {
    return res.json(swaggerSpecification)
})

router.use('/:id', async (req, res, next) => {
    let builder = new xml2js.Builder();
    let object = await createMetdataForLO(req.params.id)

    const xml = builder.buildObject(object[0])

    return res
        .type('application/xml')
        .status(200)
        .send(xml);
})

export default router