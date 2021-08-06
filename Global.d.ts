import { Base } from "./models/yare.io/base.interface";
import { Memory } from "./models/yare.io/memory.interface";
import { Outpost } from "./models/yare.io/outpost.interface";
import { Spirit } from "./models/yare.io/spirit.interface";
import { Star } from "./models/yare.io/star.interface";
declare global {
    var memory: Memory;
    var base: Base;
    var enemy_base: Base;
    var star_zxq: Star;
    var star_a1c: Star;
    var star_p89: Star;
    var outpost: Outpost;
    var my_spirits: Spirit[];
    var spirits:  { [key: string]: Spirit };
    var tick: number;
}