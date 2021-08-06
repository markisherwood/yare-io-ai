import { ObjectId } from "./object-id.type";

export interface Sight {
    friends: ObjectId[],
    enemies: ObjectId[],
    structures: ObjectId[],
}