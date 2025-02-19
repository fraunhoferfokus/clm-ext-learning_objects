declare class ToolBDTO {
    token: string;
    constructor();
    createAccessToken: () => Promise<void>;
    findAll: () => Promise<any[]>;
    findById(id: string): Promise<any>;
}
export declare const toolBDTOInstance: ToolBDTO;
export {};
