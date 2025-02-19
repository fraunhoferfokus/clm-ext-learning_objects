// const ADMIN_ID = process.env.ADMIN_ID || "admin@localhost.tld"
import axios from "axios"
import { jwtServiceInstance, userBDTOInstance } from "clm-core"
const DEPLOY_URL = process.env.GATEWAY_URL || process.env.DEPLOY_URL
const API_TOKEN = process.env.API_TOKEN || 'MGMT_SERVICE'

class ToolBDTO {

    token: string

    constructor() {
        this.token = ''
    }

    createAccessToken = async () => {
        let user = (await userBDTOInstance.findAll()).find((user) => user.isSuperAdmin)!
        let token = await jwtServiceInstance.createToken({ ...user, }, '2555d')
        this.token = token
    }

    findAll = async () => {
        try {
            if (!this.token) await this.createAccessToken()
            const resp = await axios.get(`${DEPLOY_URL}/tools/mgmt/tools`, {
                headers: {
                    authorization: `Bearer ${API_TOKEN}`,
                    'x-access-token': this.token
                }
            })
            return resp.data as any[]
        } catch (err) {
            throw err
        }
    }

    async findById(id: string) {
        try {
            const tools = await this.findAll()
            const tool = tools.find((tool) => tool._id === id)
            if (!tool) throw { status: 404, message: `Tool with that id not found: ${id}` }
            return tool
        } catch (err) {
            throw err
        }

    }

}


export const toolBDTOInstance = new ToolBDTO()