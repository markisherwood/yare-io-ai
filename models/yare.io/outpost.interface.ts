import { Sight } from "./sight.interface";
import { Structure } from "./structure.interface";

export interface Outpost extends Structure {
    size: number,
    range: number,
    control: string,
    sight: Sight,
}