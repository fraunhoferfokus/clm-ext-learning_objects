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
import { AuthGuard, BaseExtensionCtrl, relationBDTOInstance } from "clm-core"
import express from 'express'
// import LODAO from '../models/LO/LODAO'
import { groupBDTOInstance, RelationModel } from "clm-core"
import LODAO from '../models/LO/LODAO'

// const relationBackendDTO = new RelationBackendDTO()

class MgtmLOGroupExtensionCtrl extends BaseExtensionCtrl {
    constructor() {
        super()
    }

    enrollGroupToLO(): express.Handler {
        return async (req, res, next) => {
            try {
                const [group, lo] = await Promise.all([groupBDTOInstance.findById(req.params.id), LODAO.findById(req.params.loId)]);
                await relationBDTOInstance.createRelationship(new RelationModel({ fromId: group._id, fromType: 'group', toId: lo._id, toType: 'lo' }))
                return res.json({ message: "Successfully enrolled to lo" })
            } catch (err) {
                return next(err)
            }
        }
    }

    deleteEnrollment(): express.Handler {
        return async (req, res, next) => {
            try {
                const [relation] = await Promise.all([relationBDTOInstance.findById(req.params.relationId)]);
                await relationBDTOInstance.bulkDelete([{ ...relation, _deleted: true } as any])
                return res.status(204).send()
            } catch (err) {
                return next(err)
            }
        }
    }

    patchEnrollmentOrder(): express.Handler {
        return async (req, res, next) => {
            try {
                const order = req.body.order
                const [group, relation] =
                    await Promise.all([groupBDTOInstance.findById(req.params.id), relationBDTOInstance.findById(req.params.relationId)])
                let groupHasLos = (await relationBDTOInstance.findAll())
                    .filter((item) => item.fromType === 'group' && item.fromId === req.params.id && item.toType === 'lo')
                    .sort((a, b) => {
                        if (a.order! < b.order!) return -1
                        if (a.order! > b.order!) return 1
                        return 0
                    })
                if (order > groupHasLos.length || order < 0 || typeof order === 'undefined') {
                    return next({ message: `Invalid order number :${order}`, status: 400 })
                }

                const indexOfRelation = groupHasLos.findIndex((item) => item._id === relation!._id);
                const pickedItem = groupHasLos.splice(indexOfRelation, 1)[0];
                groupHasLos.splice(order, 0, pickedItem)
                for (const [index, loHaslo] of groupHasLos.entries()) {
                    loHaslo.order = index;
                }

                await relationBDTOInstance.bulkUpdate(groupHasLos)
                return res.json({ message: "Successfully changed order of lo!ƒ" })



            } catch (err) {
                next(err)
            }

            // return relationBackendDTO.changeOrderOfRelation(req.params.relationId, req.params.id, 'ENROLLED_IN', req.body.order)
            //     .then(() => res.json({ messsage: "Changed order of relation!" }))
        }
    }

}

const controller = new MgtmLOGroupExtensionCtrl();
controller.router.use(AuthGuard.requireUserAuthentication())

/**
 * @openapi
 * /learningObjects/mgmt/groups/{id}/enrollments/{loId}:
 *   post:
 *     tags:
 *       - mgmt-groups
 *       - mgmt-los
 *     summary: "Enroll a group to a learning object [Minimum role: 'Instructor']"
 *     description: Enrolls a specific group to a particular learning object using the respective identifiers.
 *     parameters:
 *       - $ref: '#/components/parameters/accessToken'
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: loId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully enrolled the group to the learning object.
 */
controller.router.post('/:id/enrollments/:loId',
    AuthGuard.permissionChecker('lo', [
        { in: 'path', name: 'id' }
        , { in: 'path', name: 'loId' }
    ],
    ),
    controller.enrollGroupToLO()
)

/**
 * @openapi
 * /learningObjects/mgmt/groups/{id}/enrollments/{relationId}:
 *   delete:
 *     tags:
 *      - mgmt-groups
 *      - mgmt-los
 *     summary: "Delete Enrollment [Minimum role: 'Instructor']"
 *     description: Removes a group's enrollment to a specific learning object, identified by its relationId.
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
 *         description: Successfully deleted the group's enrollment to the learning object.
 */
controller.router.delete('/:id/enrollments/:relationId',
    AuthGuard.permissionChecker('lo', [{ in: 'path', name: 'relationId' }]),
    controller.deleteEnrollment()
)

/**
 * @openapi
 * /learningObjects/mgmt/groups/{id}/enrollments/{relationId}:
 *   patch:
 *     tags:
 *      - mgmt-groups
 *      - mgmt-los
 *     summary: "Change the enrollment order within the group [Minimum role: 'Instructor']"
 *     description: Adjusts the sequence of a specific enrollment within a group based on the given relationId.
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
 *         description: Successfully modified the order of the enrollment within the group.
 */
controller.router.patch('/:id/enrollments/:relationId',
    AuthGuard.permissionChecker('lo', [{ in: 'path', name: 'relationId' }]),
    controller.patchEnrollmentOrder()
)


export default controller
