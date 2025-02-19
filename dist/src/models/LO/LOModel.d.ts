import { BaseDatamodel, iBaseDatamodel } from "clm-core";
/**
 * @public
 * The payload which is passed to the constructor of {@link LOModel}
 */
export interface iLOModel extends iBaseDatamodel {
    iconUrl?: string;
    displayName: string;
    helloworld?: string;
}
/**
 * Learning object datamodel
 * @public
 */
export default class LOModel extends BaseDatamodel implements iLOModel {
    constructor(payload: iLOModel);
    /**
      * Icon Url of the learning object
      */
    iconUrl?: string;
    /**
    * Display name in the frontend
    */
    displayName: string;
}
