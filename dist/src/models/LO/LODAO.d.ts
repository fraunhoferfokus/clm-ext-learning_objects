import { BaseDAO } from "clm-core";
import LOModel from "./LOModel";
declare class LODAO extends BaseDAO<LOModel> {
    deleteById(id: string): Promise<boolean>;
}
declare const _default: LODAO;
export default _default;
