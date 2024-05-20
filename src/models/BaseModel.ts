import { Model } from "objection";
import db from "../db/config.js";

Model.knex(db);

export default Model;
