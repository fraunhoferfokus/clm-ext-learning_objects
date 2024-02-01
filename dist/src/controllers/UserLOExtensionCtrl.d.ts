import express from 'express';
import { BaseExtensionCtrl } from "clm-core";
declare class MgtmLOGroupExtensionCtrl extends BaseExtensionCtrl {
    getOwnCourseStructure(): express.Handler;
}
declare const controller: MgtmLOGroupExtensionCtrl;
export default controller;
