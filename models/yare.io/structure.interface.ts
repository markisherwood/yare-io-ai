import { GameObject } from "./game-object";

export interface Structure extends GameObject {
    structure_type: string,
}