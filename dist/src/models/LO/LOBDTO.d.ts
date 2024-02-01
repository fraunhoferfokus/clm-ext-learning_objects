import { BaseBackendDTO } from "clm-core";
import LOModel from "./LOModel";
/**
 * Extends {@link https://gitlab.fokus.fraunhofer.de/learning-technologies/clm-framework/clm-core/-/blob/dev/docs/clm-core.basebackenddto.md|BaseBackendDTO}
 * @public
 * @remarks Should not be used to instatiate a new instance. An instance is provided {@link loBDTOInstance}
 */
export declare class LOBDTO extends BaseBackendDTO<LOModel> {
}
/**
 * Instance of {@link LOBDTO}
 * @public
 */
export declare const loBDTOInstance: LOBDTO;
