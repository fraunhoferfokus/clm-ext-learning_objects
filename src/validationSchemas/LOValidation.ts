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

import { checkSchema, Schema } from 'express-validator'


const sharedSchema: Schema = {
    displayName: {
        exists: {
            errorMessage: 'Has to exist!'
        },
        isLength: {
            options: { min: 5 },
            errorMessage: `Has to have atleast 5 characters!`
        }

    }
}

const createLOSchema: Schema = {
    ...sharedSchema,
    iconUrl: {
        optional: true,
        isString: {
            errorMessage: `Has to be a string`
        }
    },
}

export const createLOValidaiton = checkSchema(createLOSchema)
export const updateLOValidation = checkSchema(createLOSchema)
