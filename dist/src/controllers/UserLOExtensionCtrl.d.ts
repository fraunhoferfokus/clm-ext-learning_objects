import express from 'express';
import { BaseExtensionCtrl } from "clm-core";
declare class MgtmLOGroupExtensionCtrl extends BaseExtensionCtrl {
    getOwnCourseStructure(): express.Handler;
}
export declare function getIMSCCForUser(userId: string): Promise<unknown>;
declare const controller: MgtmLOGroupExtensionCtrl;
export default controller;
