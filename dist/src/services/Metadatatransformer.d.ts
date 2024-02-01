export declare function createMetdataForLO(loId: string): Promise<{
    $: {
        xmlns: string;
        'xmlns:lom': string;
        'xmlns:lomimscc': string;
        'xmlns:xsi': string;
        'xsi:schemaLocation': string;
    };
    metadata: {
        schema: string[];
        schemaversion: string[];
        lom: any;
    }[];
}[]>;
