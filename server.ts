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
import dotenv from 'dotenv'
dotenv.config()
import { errHandler, pathBDTOInstance } from "clm-core"
import cors from 'cors'
import express from 'express'
import EntryPointCtrl from './src/controllers/EntryPointCtrl'
const basePath = process.env.BASE_PATH || '/learningObjects'
const ECLUDED_PATHS: string[] = [
    '/users/:id/courses/:id',
    '/health'
]
const app = express()
const PORT = process.env.PORT

app.use(function (req, res, next) {
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token, x-token-renewed, x-api-key'
    );
    res.header(
        'Access-Control-Allow-Methods',
        'GET,PUT,POST,DELETE,PATCH,OPTIONS'
    );
    next();
});
app.use(cors())

app.use(express.json())
app.get('/health', (req, res) => { res.send('OK') })
app.use(basePath, EntryPointCtrl)
app.use('/launchableObjects', EntryPointCtrl)
app.use(errHandler);

Promise.all([
    pathBDTOInstance.registerRoutes(
        app,
        ECLUDED_PATHS,
        undefined,
        undefined,
        [
            "/learningObjects/:id/metadata",
            "/learningObjects/users/me/courses",
            "/learningObjects/users/:id/courses",
            "/learningObjects/mgmt",
            "/learningObjects/mgmt/:id",
            "/learningObjects/mgmt/relations",
            "/learningObjects/mgmt/:id/learningObjects/:childLoId",
            "/learningObjects/mgmt/:id/tools/:toolId",
            "/learningObjects/mgmt/:id/relations/:relationId",
            "/learningObjects/mgmt/groups/:id/enrollments/:loId",
            "/learningObjects/mgmt/groups/:id/enrollments/:relationId",
            "/launchableObjects/:id/metadata",
            "/launchableObjects/users/me/courses",
            "/launchableObjects/users/:id/courses",
            "/launchableObjects/mgmt",
            "/launchableObjects/mgmt/:id",
            "/launchableObjects/mgmt/relations",
            "/launchableObjects/mgmt/:id/tools/:toolId",
            "/launchableObjects/mgmt/:id/learningObjects/:childLoId",
            "/launchableObjects/mgmt/:id/relations/:relationId",
            "/launchableObjects/mgmt/groups/:id/enrollments/:loId",
            "/launchableObjects/mgmt/groups/:id/enrollments/:relationId"
        ]
    ),
]).then(() => {
    app.listen(PORT, () => {
        console.log("LO MICROSERVICE: UP")
    })
})



