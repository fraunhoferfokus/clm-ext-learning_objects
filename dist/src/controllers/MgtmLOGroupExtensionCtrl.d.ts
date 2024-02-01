import { BaseExtensionCtrl } from "clm-core";
import express from 'express';
declare class MgtmLOGroupExtensionCtrl extends BaseExtensionCtrl {
    constructor();
    enrollGroupToLO(): express.Handler;
    deleteEnrollment(): express.Handler;
    patchEnrollmentOrder(): express.Handler;
}
declare const controller: MgtmLOGroupExtensionCtrl;
export default controller;
