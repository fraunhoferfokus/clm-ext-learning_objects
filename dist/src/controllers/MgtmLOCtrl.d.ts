import { BaseModelController } from "clm-core";
import express from 'express';
import LODAO from '../models/LO/LODAO';
import LOModel from '../models/LO/LOModel';
import LOFDTO from '../models/LO/LOFDTO';
declare class MgtmLOController extends BaseModelController<typeof LODAO, LOModel, LOFDTO> {
    addLOToLO(): express.Handler;
    changeRelation(): express.Handler;
    getLORelations(): express.Handler;
    addToolToLO(): express.Handler;
}
declare const controller: MgtmLOController;
export default controller;
