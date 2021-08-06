import { Role } from "./models/role.type";
import { RolesRatio } from "./models/RoleRatio.interface";
import { GameObject } from "./models/yare.io/game-object";
import { Outpost } from "./models/yare.io/outpost.interface";
import { Position } from "./models/yare.io/position.type";
import { Spirit } from "./models/yare.io/spirit.interface";
import { Star } from "./models/yare.io/star.interface";

let startingRatio: RolesRatio = {
    capture: 25,
    defenders: 25,
    attackers: 0,
    harvesters: 50
};
let currentRatio: RolesRatio = memory['currentRatio'] ? memory['currentRatio'] : startingRatio;
let outposts: Outpost[] = [
    outpost
];
let stars: Star[] = [
    star_zxq,
    star_a1c,
    star_p89,
];
/**
 * Finds the nearest star to the given position
 */
function nearestStar(position: Position, requireEnergy = false) {
    let closestStar = stars[0];
    let closestDistance = null;
    for (let i = 0; i < stars.length; i++) {
        let currentStar = stars[i];
        // If we are requiring energy, check energy.
        if (requireEnergy && currentStar.energy === 0) {
            continue;
        }
        let starDistance = calculateDistance(position, currentStar.position);
        if (closestDistance === null || starDistance < closestDistance) {
            closestDistance = starDistance;
            closestStar = currentStar;
        }
    }
    return closestStar;
}
/**
 * Calculates the distance between two points
 */
function calculateDistance(position1: Position, position2: Position) {
    let x1 = position1[0];
    let y1 = position1[1];
    let x2 = position2[0];
    let y2 = position2[1];
    let dx = x1 - x2; // delta x
    let dy = y1 - y2; // delta y
    let dist = Math.sqrt(dx * dx + dy * dy); // distance
    return dist;
}
/**
 * Main role assignment loop
 */
for (let i = 0; i < my_spirits.length; i++) {
    let spirit = my_spirits[i];
    let role = determineRole(i);
    switch (determineRole(i)) {
        case 'defenders':
            assignDefenderRole(spirit);
            break;
        case 'capture':
            assignCaptureRole(spirit);
            break;
        case 'attackers':
            assignAttackerRole(spirit);
            break;
        case 'harvesters':
            assignChargingRole(spirit, base);
            break;
        default:
            spirit.shout('Error');
            break;
    }
}

/**
 * Determines what role a spirit should be given based on the currentRatio
 * @param spirit_number 
 * @returns 
 */
function determineRole(spirit_number: number): Role | undefined {
    let currentMinPercentage = 0;
    let currentMaxPercentage = 0;
    for (const roleName in currentRatio) {
        const role = roleName as Role;
        let perctage = currentRatio[role];
        currentMaxPercentage = currentMinPercentage + perctage;
        if (isInPercent(spirit_number + 1, my_spirits.length, currentMinPercentage, currentMaxPercentage)) {
            return role;
        }
        // Not in current percentage range, set min to max and check next role.
        currentMinPercentage = currentMaxPercentage;
    }
}
/**
 * Checks if the current number is within a percentile
 */
function isInPercent(number: number, total: number, minPercent: number, maxPercent: number) {
    let percentile = number * (100 / total);
    return percentile >= minPercent && percentile <= maxPercent;
}
function assignAttackerRole(spirit: Spirit) {
    if (spirit.energy >= 50) {
        spirit.move(enemy_base.position);
        spirit.energize(enemy_base);
        spirit.shout("Attacking");
    }
    else {
        spirit.move(nearestStar(spirit.position).position);
        spirit.energize(spirit);
        spirit.shout("Recharging");
    }
}
/**
 * Spirits will defend the base until they go down to 20 energy.
 * They will then recharge at the nearest star
 */
function assignDefenderRole(spirit: Spirit) {
    if (spirit.mark == "recharging" && spirit.energy < spirit.energy_capacity) {
        // Finish recharging if currently
        spirit.set_mark("recharging");
        spirit.shout("recharging");
    }
    else if (spirit.energy >= 20) {
        // Defend while energy above 20
        spirit.set_mark("defending");
        spirit.shout("defending");
    }
    else {
        // Go recharge to fight some more.
        spirit.set_mark("recharging");
        spirit.shout("recharging");
    }
    if (spirit.mark == "defending") {
        if (base.sight.enemies.length > 0) {
            let invader = spirits[base.sight.enemies[0]];
            spirit.move(invader.position);
            spirit.energize(invader);
        }
        else {
            spirit.move(base.position);
        }
    }
    else if (spirit.mark == "recharging") {
        spirit.move(nearestStar(spirit.position).position);
        spirit.energize(spirit);
    }
}
/**
 * Will charge the specified base/outpost, recharging at the nearest star
 */
function assignChargingRole(spirit: Spirit, chargeable: GameObject) {
    if (spirit.energy == spirit.energy_capacity) {
        spirit.set_mark("charging");
        spirit.shout("charging");
    }
    else if (spirit.energy == 0) {
        spirit.set_mark("harvesting");
        spirit.shout("harvesting");
    }
    else {
        spirit.set_mark("charging");
        spirit.shout("charging");
    }
    if (spirit.mark == "charging") {
        spirit.move(chargeable.position);
        spirit.energize(chargeable);
    }
    else if (spirit.mark == "harvesting") {
        let star = nearestStar(spirit.position);
        spirit.move(star.position);
        spirit.energize(spirit);
    }
}
function assignCaptureRole(spirit: Spirit) {
    for (let _i = 0, outposts_1 = outposts; _i < outposts_1.length; _i++) {
        let outpost = outposts_1[_i];
        if (outpost.control !== "Dracs") {
            // Attack outpost if not ours
            spirit.set_mark('attack_outpost');
            spirit.shout('Attacking outpost');
        }
        else {
            if (spirit.energy == spirit.energy_capacity) {
                if (outpost.energy == outpost.energy_capacity) {
                    // Outpost at max health, defend
                    spirit.set_mark('defend_outpost');
                    spirit.shout('Defending outpost');
                }
                else {
                    // Charge outpost when below max energy
                    spirit.set_mark('charge_outpost');
                    spirit.shout('Charge Outpost');
                }
            }
            else if (spirit.energy == 0) {
                //If outpost still needs charging or below 20% energy, recharge.
                spirit.set_mark('recharging');
                spirit.shout('Recharging');
            }
        }
        if (spirit.mark == 'attack_outpost') {
            spirit.move(outpost.position);
            spirit.energize(outpost);
        }
        else if (spirit.mark == 'charge_outpost') {
            spirit.move(outpost.position);
            spirit.energize(outpost);
        }
        else if (spirit.mark == 'recharging') {
            // Low energy, charge at nearest star
            spirit.move(nearestStar(spirit.position).position);
            spirit.energize(spirit);
        }
        else if (spirit.mark == 'defend_outpost') {
            // Outpost owned and full energy. Guard.
            spirit.move(outpost.position);
            if (outpost.sight.enemies.length > 0) {
                let enemy = spirits[outpost.sight.enemies[0]];
                spirit.energize(enemy);
            }
        }
    }
}
