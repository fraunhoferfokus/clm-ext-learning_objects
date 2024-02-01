import { RelationModel, relationBDTOInstance } from "clm-core"
import LODAO from "../models/LO/LODAO"
import { LOModel } from "../lib/Corelib"
import { toolBDTOInstance } from "clm-ext-tools"
import axios from "axios"
import xml2js from "xml2js"

export async function createMetdataForLO(loId: string) {
    const los = await LODAO.findAll()
    let lo = los.find(lo => lo._id === loId)
    if (!lo) throw new Error('LO not found')
    const relations = await relationBDTOInstance.findAll()
    const tools = (await toolBDTOInstance.findAll()).filter((tool) => tool.type === 'METADATA')

    const childs = getAllDescendingsChildsOfLodFlatMapped({ ...lo, root: true } as (LOModel & { root: boolean }), relations, los)

    let metadata = []
    for (let child of childs) {
        let hasMetadata = relations.find((relation) => relation.fromType === 'tool' && relation.toType === 'lo' && relation.toId === child._id)
        if (hasMetadata) {
            let tool = tools.find((tool) => tool._id === hasMetadata!.fromId)!
            // fetch lom from tool
            const result = (await axios.get(tool.launchableUrl))
            const lom = await xml2js.parseStringPromise(result.data)
            if (child.root) lom['root'] = true
            // add lom to manifest
            metadata.push(lom)
        }
    }

    let build: any = {
        "$": {
            "xmlns": "http://ltsc.ieee.org/xsd/LOM"
        },

        "general": [
            {
                "identifier": [],
                "title": [
                ],
                "language": [
                ],
                "description": [
                    {
                        "string": []
                    }
                ]
            }
        ],
        "educational": [
            {
                "interactivityType": [
                    {
                        "source": [
                        ],
                        "value": [
                        ]
                    }
                ],
                "learningResourceType": [
                    {
                        "source": [
                        ],
                        "value": [
                        ]
                    }
                ],
                "interactivityLevel": [
                    {
                        "source": [
                        ],
                        "value": [
                        ]
                    }
                ],
                "semanticDensity": [
                    {
                        "source": [
                        ],
                        "value": [
                        ]
                    }
                ],
                "difficulty": [
                    {
                        "source": [
                        ],
                        "value": [
                        ]
                    }
                ],
                "typicalLearningTime": [
                    {
                        "duration": [
                        ]
                    }
                ]
            }
        ],
        "relation": [

        ],
        "classification": [
            {
                "purpose": [
                    {
                        "source": [
                            "LOMv1.0"
                        ],
                        "value": [
                            "educational objective"
                        ]
                    }
                ],
                "taxonPath": [
                    {
                        "taxon": []
                    }
                ]
            }
        ]
    }



    let manifestRoot = metadata.find((lom) => lom.root)
    if (manifestRoot) {
        build.general[0].identifier[0] = manifestRoot?.lom?.general?.[0]?.identifier?.[0]
        build.general[0].title[0] = manifestRoot?.lom?.general?.[0]?.title?.[0]
        build.general[0].description[0] = manifestRoot?.lom?.general?.[0]?.description?.[0]
        // interactivity type
        build.educational[0].interactivityType[0] = manifestRoot?.lom?.educational?.[0]?.interactivityType?.[0]
        build.educational[0].learningResourceType[0] = manifestRoot?.lom?.educational?.[0]?.learningResourceType?.[0]
        build.educational[0].interactivityLevel[0] = manifestRoot?.lom?.educational?.[0]?.interactivityLevel?.[0]
        build.educational[0].semanticDensity[0] = manifestRoot?.lom?.educational?.[0]?.semanticDensity?.[0]
        build.educational[0].difficulty[0] = manifestRoot?.lom?.educational?.[0]?.difficulty?.[0]

        // metadata = metadata.filter((lom) => !lom.root)
    }



    for (let singleMetadata of metadata) {
        // classification
        build.classification[0].taxonPath[0].taxon.push(singleMetadata?.lom?.classification?.[0]?.taxonPath?.[0]?.taxon?.[0])
        // add typical learning time to educational

        let typicalLearningTimeOfSingle = singleMetadata?.lom?.educational?.[0]?.typicalLearningTime?.[0]?.duration?.[0]
        if (typicalLearningTimeOfSingle) {

            if (!build.educational[0].typicalLearningTime[0].duration[0]) {
                build.educational[0].typicalLearningTime[0].duration[0] = typicalLearningTimeOfSingle
            }
            else {
                build.educational[0].typicalLearningTime[0].duration[0] = addDurations(build.educational[0].typicalLearningTime[0].duration[0], typicalLearningTimeOfSingle)
            }
        }
        // build.educational[0].typicalLearningTime[0] = 

    }




    let manifest = [{
        $: {
            xmlns: "http://www.imsglobal.org/xsd/imsccv1p3/imscp_v1p1",
            'xmlns:lom': "http://ltsc.ieee.org/xsd/imsccv1p3/LOM/resource",
            'xmlns:lomimscc': "http://ltsc.ieee.org/xsd/imsccv1p3/LOM/manifest",
            'xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
            'xsi:schemaLocation': " http://www.imsglobal.org/xsd/imsccv1p3/imscp_v1p1 http://www.imsglobal.org/profile/cc/ccv1p3/ccv1p3_imscp_v1p1_v1p0.xsd http://ltsc.ieee.org/xsd/imsccv1p3/LOM/resource http://www.imsglobal.org/profile/cc/ccv1p3/LOM/ccv1p3_lomresource_v1p0.xsd http://ltsc.ieee.org/xsd/imsccv1p3/LOM/manifest http://www.imsglobal.org/profile/cc/ccv1p2/LOM/ccv1p3_lommanifest_v1p0.xsd",
        },
        metadata: [
            {
                schema: [
                    'IMS Common Cartridge'
                ],
                schemaversion: [
                    '1.3.0'
                ],
                lom: build
            }
        ]
    }]
    return manifest
}

function getAllDescendingsChildsOfLodFlatMapped(lo: (LOModel & { root?: boolean }), relations: RelationModel[], allLos: (LOModel & { root?: boolean })[], excludeSelf = false): (LOModel & { root?: boolean })[] {
    const descendings = relations.filter(relation => relation.fromId === lo._id && relation.toType === 'lo')
    const childs = descendings.map(descending => getAllDescendingsChildsOfLodFlatMapped(allLos.find((lo) => lo._id === descending.toId)!, relations, allLos)).flat(1)
    if (!excludeSelf) childs.push(lo)
    return childs
}




function addDurations(duration1: string, duration2: string): string {


    const parseDuration = (duration: string) => {
        const regex = /P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/;
        //@ts-ignore
        const parts = duration.match(regex).slice(1);
        return {
            days: parseInt(parts[0]) || 0,
            hours: parseInt(parts[1]) || 0,
            minutes: parseInt(parts[2]) || 0,
            seconds: parseInt(parts[3]) || 0,
        };
    };

    const toSeconds = ({ days, hours, minutes, seconds }: any) => days * 86400 + hours * 3600 + minutes * 60 + seconds;
    const toDurationString = (totalSeconds: number) => {
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `P${days ? `${days}D` : ''}${hours || minutes || seconds ? `T${hours ? `${hours}H` : ''}${minutes ? `${minutes}M` : ''}${seconds ? `${seconds}S` : ''}` : ''}`;
    };

    const duration1Seconds = toSeconds(parseDuration(duration1));
    const duration2Seconds = toSeconds(parseDuration(duration2));
    const totalSeconds = duration1Seconds + duration2Seconds;
    console.log(
        { seconds: toDurationString(totalSeconds) }
    )

    return toDurationString(totalSeconds);
}