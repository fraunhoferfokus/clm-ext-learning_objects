export declare const createLOValidaiton: import("express-validator").ValidationChain[] & {
    run: (req: import("express-validator/src/base").Request) => Promise<import("express-validator/src/chain").ResultWithContext[]>;
};
export declare const updateLOValidation: import("express-validator").ValidationChain[] & {
    run: (req: import("express-validator/src/base").Request) => Promise<import("express-validator/src/chain").ResultWithContext[]>;
};
