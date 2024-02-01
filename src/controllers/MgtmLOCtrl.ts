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
import { BaseModelController, AuthGuard, relationBDTOInstance, RelationModel } from "clm-core"
import { createLOValidaiton, updateLOValidation } from '../validationSchemas/LOValidation';
import express from 'express'
// import { toolBackendDTO } from "clm-ext-tools"
import { toolBDTOInstance } from "clm-ext-tools"
import LODAO from '../models/LO/LODAO';
import LOModel from '../models/LO/LOModel';
import LOFDTO from '../models/LO/LOFDTO';
import LORelationDTO from '../models/LO/LORelationDTO';

class MgtmLOController extends BaseModelController<typeof LODAO, LOModel, LOFDTO>{

    addLOToLO(): express.Handler {
        return async (req, res, next) => {
            try {
                await LORelationDTO.addLOToLO(req.params.id, req.params.childLoId)
                return res.json({ message: "Successfully added lo" })
            } catch (err) {
                next(err)
            }
        }
    }

    changeRelation(): express.Handler {
        return async (req, res, next) => {
            try {
                const order = req.body.order
                const toolId = req.body.toolId
                const [lo, relation] =
                    await Promise.all([LODAO.findById(req.params.id), relationBDTOInstance.findById(req.params.relationId)])
                let loHasLos = (await relationBDTOInstance.findAll())
                    .filter((item) => item.fromType === 'lo' && item.fromId === req.params.id && item.toType === 'lo')
                    .sort((a, b) => {
                        if (a.order! < b.order!) return -1
                        if (a.order! > b.order!) return 1
                        return 0
                    })


                // if we want to change the order of the relation
                // if order is of type number

                if (order !== undefined) {
                    if (order > loHasLos.length || order < 0 || typeof order === 'undefined') {
                        return next({ message: `Invalid order number :${order}`, status: 400 })
                    }
                    const indexOfRelation = loHasLos.findIndex((item) => item._id === relation!._id);
                    const pickedItem = loHasLos.splice(indexOfRelation, 1)[0];
                    loHasLos.splice(order, 0, pickedItem)
                    for (const [index, loHaslo] of loHasLos.entries()) {
                        loHaslo.order = index;
                    }
                    await relationBDTOInstance.bulkUpdate(loHasLos)
                } else if (toolId !== undefined) {
                    relation.toId = toolId
                    await relationBDTOInstance.bulkUpdate([relation])
                }

                return res.json({ message: "Successfully changed relation!" })

            } catch (err) {
                next(err)
            }
            // return relationBackendDTO.changeOrderOfRelation(req.params.relationId, req.params.id, 'HAS_CHILD', req.body.order)
            //     .then(() => res.json({ messsage: "Changed order of relation!" }))
        }
    }

    getLORelations(): express.Handler {
        return async (req, res, next) => {
            try {
                let relations = (await relationBDTOInstance.findAll()).filter((item) => item.fromType === 'lo')
                let userPermissions = req.requestingUser?.permissions
                if (!req.requestingUser?.isSuperAdmin && userPermissions) {
                    console.log({
                        relations,
                        userPermissions
                    })


                    relations = relations
                        .filter((relation) => userPermissions?.[relation._id])
                }
                return res.json(relations)
            } catch (err) {
                next(err)
            }
            // return relationBDTOInstance.getLoRelations().then((resp) => res.json(resp))
        }
    }

    addToolToLO(): express.Handler {
        return async (req, res, next) => {
            try {
                const [lo, tool] = await Promise.all([LODAO.findById(req.params.id), toolBDTOInstance.findById(req.params.toolId)])
                await relationBDTOInstance.createRelationship(new RelationModel({ fromId: lo._id, fromType: 'lo', toId: tool._id, toType: 'tool' }))
                return res.json({ message: "Successfully added tool to lo!" })
            } catch (err) {
                next(err)
            }

            // return Promise.all([LODAO.findById(req.params.id), toolBackendDTO.findById(req.params.toolId)])
            //     .then(([lo, tool]) => relationBackendDTO.createRelationship(lo._id, 'lo', 'HAS', tool._id, 'tool'))
            //     .then(() => res.json({ message: "Succesfully added Tool to LO" }))
            //     .catch((err) => next(err))
        }
    }

}

const controller = new MgtmLOController(LODAO, LOModel, LOFDTO)
/**
 * @openapi
 * /learningObjects/mgmt:
 *   get:
 *     tags:
 *       - mgmt-los
 *     summary: 'Retrieves all learning objects [Minimum Role: "Learner"]'
 *     description: Retrieve all learning objects the user has access to through the group enrollments.
 *     parameters:
 *      - $ref: '#/components/parameters/accessToken'
 *     responses:
 *       200:
 *         description: Successfully created learning object
 *         content:
 *          application/json:
 *           schema:
 *              type: array
 *              items: 
 *                  $ref: '#/components/schemas/LearningObject'             
 *       400:
 *         description: Bad request - Invalid input or validation error
 *       401:
 *         description: Unauthorized 
 */
controller.router.get('/', AuthGuard.permissionChecker('lo'))

/**
 * @openapi
 * components:
 *   schemas:
 *     LearningObject:
 *       type: object
 *       required:
 *         - displayName
 *       properties:
 *         _id: 
 *           type: string
 *           description: The id of the learning object
 *         displayName:
 *           type: string
 *           description: Display name for the learning object
 *           minLength: 5
 *         iconUrl:
 *           type: string
 *           description: Icon URL for the learning object
 * 
 * 
 * /learningObjects/mgmt:
 *   post:
 *     tags:
 *       - mgmt-los
 *     summary: 'Create a Learning object [Minimum Role: "Instructor"]'
 *     description: Create a Learning object
 *     parameters:
 *      - $ref: '#/components/parameters/accessToken'
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/LearningObject'
 *     responses:
 *       200:
 *         description: Successfully created learning object
 *         content:
 *          application/json:
 *           schema:
 *              $ref: '#/components/schemas/LearningObject'
 *       400:
 *         description: Bad request - Invalid input or validation error
 *       401:
 *         description: Unauthorized 
 */
controller.router.post('/', AuthGuard.permissionChecker('lo'), createLOValidaiton)

/**
 * @openapi
 * 
 * /learningObjects/mgmt/{id}:
 *   put:
 *     tags:
 *       - mgmt-los
 *     summary: 'Update an existing Learning Object [Minimum Role: "Instructor"]'
 *     description: Modify an existing Learning object's attributes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LearningObject'
 *     parameters:
 *       - $ref: '#/components/parameters/accessToken'
 *       - in: path
 *         name: id
 *         description: The id of the learning object
 *         required: true
 *         schema:
 *          type: string
 *     responses:
 *       200:
 *         description: Successfully updated learning object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LearningObject'
 *       400:
 *         description: Bad request - Invalid input or validation error
 *       401:
 *         description: Unauthorized 
 * 
 *   patch:
 *     tags:
 *       - mgmt-los
 *     summary: 'Update an existing Learning Object [Minimum Role: "Instructor"]'
 *     description:  Modify an existing Learning object's attribute
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LearningObject'
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The id of the learning object
 *         required: true
 *         schema:
 *          type: string
 *     responses:
 *       200:
 *         description: Successfully partially updated learning object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LearningObject'
 *       400:
 *         description: Bad request - Invalid input or validation error
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags:
 *       - mgmt-los
 *     summary: 'Deletes an existing Learning Object [Minimum Role: "Instructor"]'
 *     description:  Delete an existing learning object
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The id of the learning object
 *         required: true
 *         schema:
 *          type: string
 *     responses:
 *       204:
 *         description: Successfully deleted learning object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized  
 */
controller.router.put('/:id', AuthGuard.permissionChecker('lo'), updateLOValidation)
controller.router.patch('/:id', AuthGuard.permissionChecker('lo'), updateLOValidation)
controller.router.delete('/:id', AuthGuard.permissionChecker('lo'))

/**
 * @openapi
 * /learningObjects/mgmt/relations:
 *   get:
 *     tags:
 *          - mgmt-los
 *     summary: "Get the relations from the learning objects the user has access to [Minimum Role : 'Learner']"
 *     description: Retrieve relations between various learning objects that the authenticated user has permissions to view.
 *     parameters:
 *       - $ref: '#/components/parameters/accessToken'
 *     responses:
 *       200:
 *         description: A list of relations between learning objects.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/relation'
 */
controller.router.get('/relations', AuthGuard.permissionChecker('lo'), controller.getLORelations())

/**
 * @openapi
 * /learningObjects/mgmt/{id}/learningObjects/{childLoId}:
 *   post:
 *     tags:
 *      - mgmt-los
 *     summary: "Add learning object to learning object [Minimum Role: 'Instructor']"
 *     description: Associates a specific child learning object with another parent learning object, given their respective identifiers.
 *     parameters:
 *       - $ref: '#/components/parameters/accessToken'
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: childLoId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully associated the child learning object with the parent.
 */
controller.router.post('/:id/learningObjects/:childLoId', AuthGuard.permissionChecker('lo'), controller.addLOToLO())

/**
 * @openapi
 * /learningObjects/mgmt/{id}/tools/{toolId}:
 *   post:
 *     tags:
 *          - mgmt-los
 *     summary: "Add tool to learning object [Minimum Role: 'Instructor']"
 *     description: Link a specific tool to a learning object by their respective identifiers.
 *     parameters:
 *       - $ref: '#/components/parameters/accessToken'
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: toolId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully added the tool to the learning object.
 */
controller.router.post('/:id/tools/:toolId', AuthGuard.permissionChecker('lo'), controller.addToolToLO())

/**
 * @openapi
 * /learningObjects/mgmt/{id}/relations/{relationId}:
 *   put:
 *     tags:
 *          - mgmt-los
 *     summary: "Change the order of a learning object within a learning object, or change the associated tool to a specific learning object [Minimum Role: 'Instructor']"
 *     description: Modify the order of a specific learning object inside another or alter the tool linked to a given learning object.
 *     parameters:
 *       - $ref: '#/components/parameters/accessToken'
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: relationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully updated the learning object's order or associated tool.
 */
controller.router.patch('/:id/relations/:relationId', AuthGuard.permissionChecker('lo',
    [{ in: 'path', name: 'relationId' }],
),
    controller.changeRelation())

controller.activateStandardRouting()

export default controller;


