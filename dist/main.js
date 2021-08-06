var startingRatio = {
    capture: 25,
    defenders: 25,
    attackers: 0,
    harvesters: 50
};
var currentRatio = memory['currentRatio'] ? memory['currentRatio'] : startingRatio;
var outposts = [
    outpost
];
var stars = [
    star_zxq,
    star_a1c,
    star_p89,
];
/**
 * Finds the nearest star to the given position
 */
function nearestStar(position, requireEnergy) {
    if (requireEnergy === void 0) { requireEnergy = false; }
    var closestStar = stars[0];
    var closestDistance = null;
    for (var i = 0; i < stars.length; i++) {
        var currentStar = stars[i];
        // If we are requiring energy, check energy.
        if (requireEnergy && currentStar.energy === 0) {
            continue;
        }
        var starDistance = calculateDistance(position, currentStar.position);
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
function calculateDistance(position1, position2) {
    var x1 = position1[0];
    var y1 = position1[1];
    var x2 = position2[0];
    var y2 = position2[1];
    var dx = x1 - x2; // delta x
    var dy = y1 - y2; // delta y
    var dist = Math.sqrt(dx * dx + dy * dy); // distance
    return dist;
}
/**
 * Main role assignment loop
 */
for (var i = 0; i < my_spirits.length; i++) {
    var spirit = my_spirits[i];
    var role = determineRole(i);
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
function determineRole(spirit_number) {
    var currentMinPercentage = 0;
    var currentMaxPercentage = 0;
    for (var roleName in currentRatio) {
        var role = roleName;
        var perctage = currentRatio[role];
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
function isInPercent(number, total, minPercent, maxPercent) {
    var percentile = number * (100 / total);
    return percentile >= minPercent && percentile <= maxPercent;
}
function assignAttackerRole(spirit) {
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
function assignDefenderRole(spirit) {
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
            var invader = spirits[base.sight.enemies[0]];
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
function assignChargingRole(spirit, chargeable) {
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
        var star = nearestStar(spirit.position);
        spirit.move(star.position);
        spirit.energize(spirit);
    }
}
function assignCaptureRole(spirit) {
    for (var _i = 0, outposts_1 = outposts; _i < outposts_1.length; _i++) {
        var outpost_1 = outposts_1[_i];
        if (outpost_1.control !== "Dracs") {
            // Attack outpost if not ours
            spirit.set_mark('attack_outpost');
            spirit.shout('Attacking outpost');
        }
        else {
            if (spirit.energy == spirit.energy_capacity) {
                if (outpost_1.energy == outpost_1.energy_capacity) {
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
            spirit.move(outpost_1.position);
            spirit.energize(outpost_1);
        }
        else if (spirit.mark == 'charge_outpost') {
            spirit.move(outpost_1.position);
            spirit.energize(outpost_1);
        }
        else if (spirit.mark == 'recharging') {
            // Low energy, charge at nearest star
            spirit.move(nearestStar(spirit.position).position);
            spirit.energize(spirit);
        }
        else if (spirit.mark == 'defend_outpost') {
            // Outpost owned and full energy. Guard.
            spirit.move(outpost_1.position);
            if (outpost_1.sight.enemies.length > 0) {
                var enemy = spirits[outpost_1.sight.enemies[0]];
                spirit.energize(enemy);
            }
        }
    }
}
