import { RelationModel, relationBDTOInstance } from "clm-core"
import LODAO from "../models/LO/LODAO"
import { LOModel } from "../lib/Corelib"
// import { ToolModel, toolBDTOInstance } from "clm-ext-tools"
import axios from "axios"
import xml2js from "xml2js"
import { toolBDTOInstance } from "../lib/toolBDTO"

export async function createMetdataForLO(loId: string) {

    // LO findet alle LOs
    const los = await LODAO.findAll()
    let lo = los.find(lo => lo._id === loId)
    if (!lo) throw new Error('LO not found')
    const relations = await relationBDTOInstance.findAll()

    const tools = await toolBDTOInstance.findAll()
    const metadataReference = tools.filter((tool) => tool.type === 'METADATA')

    let childs = getAllDescendingsChildsOfLodFlatMapped({ ...lo, root: true } as (LOModel & { root: boolean }), relations, los, tools).filter((metadata) =>
        relations.find((relation) =>
            relation.fromType === 'tool' &&
            relation.toType === 'lo' &&
            relation.toId === metadata._id
        )
    )

    let metadataPromise: Promise<any>[] = []
    for (let child of childs) {
        let hasMetadata = relations.find((relation) => relation.fromType === 'tool' && relation.toType === 'lo' && relation.toId === child._id)
        let tool = metadataReference.find((tool) => tool._id === hasMetadata!.fromId)!
        const promise: any = axios.get(tool.launchableUrl)
            .then((result) => result.data)
            .then((data) => xml2js.parseStringPromise(data))
            .then((lom) => {
                if (child.root) lom['root'] = true
                return lom
            })
        metadataPromise.push(promise)
    }

    let metadata = await Promise.all(metadataPromise)

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
        ],
        "annotation": [
            {
                entity: ["https://dash.fokus.fraunhofer.de/tests/tan/media/n21/default.png"],
                date: [],
                description: ["default picture"]
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
        if (manifestRoot?.lom?.annotation) {
            build.annotation[0] = manifestRoot?.lom?.annotation[0]
        }
        // metadata = metadata.filter((lom) => !lom.root)
    }

    // let taxonSet = new Set()
    // for (let singleMetadata of metadata) {
    //     // classification
    //     if (singleMetadata?.lom?.classification?.[0]?.taxonPath?.[0]?.taxon) {
    //         for (let taxon of singleMetadata?.lom?.classification?.[0]?.taxonPath?.[0]?.taxon) {
    //             let taxonId = taxon.id[0]
    //             if (!taxonSet.has(taxonId)) {
    //                 taxonSet.add(taxonId)
    //                 build.classification[0].taxonPath[0].taxon.push(taxon)
    //             }
    //         }
    //     }

    //     build.classification[0].taxonPath[0].taxon.push()
    //     // add typical learning time to educational

    //     let typicalLearningTimeOfSingle = singleMetadata?.lom?.educational?.[0]?.typicalLearningTime?.[0]?.duration?.[0]
    //     if (typicalLearningTimeOfSingle) {

    //         if (!build.educational[0].typicalLearningTime[0].duration[0]) {
    //             build.educational[0].typicalLearningTime[0].duration[0] = typicalLearningTimeOfSingle
    //         }
    //         else {
    //             build.educational[0].typicalLearningTime[0].duration[0] = addDurations(build.educational[0].typicalLearningTime[0].duration[0], typicalLearningTimeOfSingle)
    //         }
    //     }
    //     // build.educational[0].typicalLearningTime[0] = 

    // }

    let taxonSet = new Map<string, number>(); // Map, um Taxon-ID mit Relation-Index zu speichern

    let pointer = 0
    for (let singleMetadata of metadata) {
        if (singleMetadata?.lom?.classification?.[0]?.taxonPath?.[0]?.taxon) {
            for (let taxon of singleMetadata?.lom?.classification?.[0]?.taxonPath?.[0]?.taxon) {
                let taxonId = taxon.id[0];
                let courseDetails = childs[pointer]; // Hole die Kurs-ID aus `childs` basierend auf dem Pointer

                if (!taxonSet.has(taxonId)) {
                    // Neues Taxon und neue Relation erstellen
                    let relationIndex = build.relation.length; // Index der neuen Relation speichern
                    taxonSet.set(taxonId, relationIndex);
                    
                    build.relation.push({
                        kind: {
                            source: ["LOMv1.0"],
                            value: ["isRelatedTo"]
                        },
                        resource: {
                            identifier: {
                                catalog: "TaxonID",
                                entry: taxonId
                            },
                            description: {
                                string: [`Relation zu Taxon: ${taxon.entry?.[0]?.string || "Unbekannt"}`]
                            },
                            relatedCourses: [
                                { courseId: courseDetails._id }
                            ]
                        }
                    });
                    build.classification[0].taxonPath[0].taxon.push(taxon)
                } else {
                    // Existierende Relation aktualisieren
                    let relationIndex = taxonSet.get(taxonId)!; // Index der existierenden Relation abrufen
                    let existingRelation = build.relation[relationIndex];

                    // Kurs-ID hinzufügen, falls sie noch nicht existiert
                    let existingCourseIds = existingRelation.resource.relatedCourses.map((course: any) => course.courseId);
                    if (!existingCourseIds.includes(courseDetails)) {
                        existingRelation.resource.relatedCourses.push({ courseId: courseDetails?._id });
                    }
                }
            }
        }

        build.classification[0].taxonPath[0].taxon.push()
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
        pointer++
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

function getAllDescendingsChildsOfLodFlatMapped(lo: (LOModel & { root?: boolean }), relations: RelationModel[], allLos: (LOModel & { root?: boolean })[], tools: any[], excludeSelf = false): (LOModel & { root?: boolean })[] {

    const descendings = relations.filter(relation => relation.fromId === lo._id && (relation.toType === 'lo'))
    const loHasTool = relations.find((relation) => relation.fromId === lo._id && (relation.toType === 'tool'))

    const childs = descendings.map(descending => getAllDescendingsChildsOfLodFlatMapped(allLos.find((lo) => lo._id === descending.toId)!, relations, allLos, tools)).flat(1)
    if (!excludeSelf) childs.push(lo)
    if (loHasTool) childs.push(tools.find((tool) => tool._id === loHasTool.toId as any)!)
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
    return toDurationString(totalSeconds);
}