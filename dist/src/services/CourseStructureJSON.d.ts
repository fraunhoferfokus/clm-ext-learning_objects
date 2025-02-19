import { BaseDatamodel, RelationModel } from "clm-core";
/**
 * @public
 * Extends the tool datamodel
 */
/**
 * Course-structure of a specific user which extends {@link https://gitlab.fokus.fraunhofer.de/learning-technologies/clm-framework/clm-ext-tool/-/blob/dev/docs/clm-ext-tools.itoolmodel.md|ToolModel}
 * @public
 */
export interface CourseStructure extends BaseDatamodel {
    /**
     * Icon Url of the learning object
     */
    iconUrl?: string;
    /**
     * Display name in the frontend
     */
    displayName: string;
    /**
     * Roles the user has on this learning object
     */
    roles?: string[];
    /**
     * LRS-Ids the user has access to
     */
    lrss?: string[];
    /**
     * Optional children
     */
    children?: CourseStructure[];
    /**
     * The tool-datamodel + the roles/lrss of this specific course-structure
     */
    tool?: any;
    order?: number;
}
/**
 * Static class to retrieve the course structure of a specific user
 * @public
 */
export default class CourseStructreJSON {
    private static fillRecursiveLO;
    private static recursiveToolSearch;
    /**
     * Get the course-structure of the user as JS/JSON by aggregating the user permission of
     *  the user to learning objects, lrss, groups (roles of groups).
     * @param userId - Id of the user
     * @param relations - Pre fill relations to enhance performance
     * @returns
     */
    static getUserCourseStrucuture(userId: string, relations?: RelationModel[]): Promise<CourseStructure[]>;
    /**
     * Gets the tool by user- and tool-id
     * @param userId - The id of the user
     * @param toolId - The id of the tool
     * @returns
     */
    static getUserTool(userId: string, toolId: string): Promise<any | undefined>;
}
