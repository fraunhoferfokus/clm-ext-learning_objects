import { BaseFrontendDTO, iBaseFrontendDTO } from "clm-core";
interface iCouchLOFDTO extends iBaseFrontendDTO {
    displayName: string;
    iconUrl: string;
}
export default class CouchLOFDTO extends BaseFrontendDTO implements iCouchLOFDTO {
    constructor(payload: iCouchLOFDTO);
    iconUrl: string;
    displayName: string;
}
export {};
