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
const clm_core_1 = require("clm-core");
// import LODAO from '../models/LO/LODAO'
const clm_core_2 = require("clm-core");
const LODAO_1 = __importDefault(require("../models/LO/LODAO"));
// const relationBackendDTO = new RelationBackendDTO()
class MgtmLOGroupExtensionCtrl extends clm_core_1.BaseExtensionCtrl {
    constructor() {
        super();
    }
    enrollGroupToLO() {
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const [group, lo] = yield Promise.all([clm_core_2.groupBDTOInstance.findById(req.params.id), LODAO_1.default.findById(req.params.loId)]);
                yield clm_core_1.relationBDTOInstance.createRelationship(new clm_core_2.RelationModel({ fromId: group._id, fromType: 'group', toId: lo._id, toType: 'lo' }));
                return res.json({ message: "Successfully enrolled to lo" });
            }
            catch (err) {
                return next(err);
            }
        });
    }
    deleteEnrollment() {
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const [relation] = yield Promise.all([clm_core_1.relationBDTOInstance.findById(req.params.relationId)]);
                yield clm_core_1.relationBDTOInstance.bulkDelete([Object.assign(Object.assign({}, relation), { _deleted: true })]);
                return res.status(204).send();
            }
            catch (err) {
                return next(err);
            }
        });
    }
    patchEnrollmentOrder() {
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const order = req.body.order;
                const [group, relation] = yield Promise.all([clm_core_2.groupBDTOInstance.findById(req.params.id), clm_core_1.relationBDTOInstance.findById(req.params.relationId)]);
                let groupHasLos = (yield clm_core_1.relationBDTOInstance.findAll())
                    .filter((item) => item.fromType === 'group' && item.fromId === req.params.id && item.toType === 'lo')
                    .sort((a, b) => {
                    if (a.order < b.order)
                        return -1;
                    if (a.order > b.order)
                        return 1;
                    return 0;
                });
                if (order > groupHasLos.length || order < 0 || typeof order === 'undefined') {
                    return next({ message: `Invalid order number :${order}`, status: 400 });
                }
                const indexOfRelation = groupHasLos.findIndex((item) => item._id === relation._id);
                const pickedItem = groupHasLos.splice(indexOfRelation, 1)[0];
                groupHasLos.splice(order, 0, pickedItem);
                for (const [index, loHaslo] of groupHasLos.entries()) {
                    loHaslo.order = index;
                }
                yield clm_core_1.relationBDTOInstance.bulkUpdate(groupHasLos);
                return res.json({ message: "Successfully changed order of lo!ƒ" });
            }
            catch (err) {
                next(err);
            }
            // return relationBackendDTO.changeOrderOfRelation(req.params.relationId, req.params.id, 'ENROLLED_IN', req.body.order)
            //     .then(() => res.json({ messsage: "Changed order of relation!" }))
        });
    }
}
const controller = new MgtmLOGroupExtensionCtrl();
controller.router.use(clm_core_1.AuthGuard.requireUserAuthentication());
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
controller.router.post('/:id/enrollments/:loId', clm_core_1.AuthGuard.permissionChecker('lo', [
    { in: 'path', name: 'id' },
    { in: 'path', name: 'loId' }
]), controller.enrollGroupToLO());
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
controller.router.delete('/:id/enrollments/:relationId', clm_core_1.AuthGuard.permissionChecker('lo', [{ in: 'path', name: 'relationId' }]), controller.deleteEnrollment());
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
controller.router.patch('/:id/enrollments/:relationId', clm_core_1.AuthGuard.permissionChecker('lo', [{ in: 'path', name: 'relationId' }]), controller.patchEnrollmentOrder());
exports.default = controller;
