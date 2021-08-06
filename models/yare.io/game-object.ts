import { ObjectId } from "./object-id.type";
import { Position } from "./position.type";

export interface GameObject {
    id: ObjectId;
    energy: number;
    energy_capacity: number;
    position: Position;
}