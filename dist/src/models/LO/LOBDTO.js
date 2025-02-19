"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loBDTOInstance = exports.LOBDTO = void 0;
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
const LODAO_1 = __importDefault(require("./LODAO"));
/**
 * Extends {@link https://gitlab.fokus.fraunhofer.de/learning-technologies/clm-framework/clm-core/-/blob/dev/docs/clm-core.basebackenddto.md|BaseBackendDTO}
 * @public
 * @remarks Should not be used to instatiate a new instance. An instance is provided {@link loBDTOInstance}
 */
class LOBDTO extends clm_core_1.BaseBackendDTO {
}
exports.LOBDTO = LOBDTO;
/**
 * Instance of {@link LOBDTO}
 * @public
 */
exports.loBDTOInstance = new LOBDTO(LODAO_1.default);
