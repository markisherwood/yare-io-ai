import { GameObject } from "./game-object";
import { Position } from "./position.type";
import { Sight } from "./sight.interface";

export interface Spirit extends GameObject {
    size: number;
    hp: number;
    mark: string;
    last_energized: string;
    sight: Sight;
    energize(target: GameObject): void;
    move(target: Position): void;
    merge(target: Spirit): void;
    divide(): void;
    jump(target: Position): void;
    explode(): void;
    shout(message: string): void;
    set_mark(label: string): void;
}