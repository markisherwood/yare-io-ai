import { Sight } from "./sight.interface";
import { Structure } from "./structure.interface";

export interface Base extends Structure {
    size: number
    hp: number;
    sight: Sight;
}